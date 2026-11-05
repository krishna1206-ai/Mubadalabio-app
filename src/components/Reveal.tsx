import { useFocusEffect } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useRef, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  useWindowDimensions,
  type HostInstance,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useLanguage } from '@/i18n/LanguageProvider';

type Check = () => void;
type Registry = { add: (c: Check) => () => void };

const RevealContext = createContext<Registry | null>(null);

/**
 * Provides the reveal registry to a custom scroll view (e.g. an Animated.ScrollView).
 * Call the `onScroll` passed to `children` from the scroll view's scroll handler.
 */
export function RevealContainer({ children }: { children: (onScroll: () => void) => ReactNode }) {
  const checks = useRef(new Set<Check>());
  const registry = useRef<Registry>({
    add: (c) => {
      checks.current.add(c);
      return () => checks.current.delete(c);
    },
  }).current;

  const runChecks = useCallback(() => checks.current.forEach((c) => c()), []);

  return <RevealContext.Provider value={registry}>{children(runChecks)}</RevealContext.Provider>;
}

/**
 * ScrollView that tells every <Reveal> inside it to re-check its position on scroll,
 * so sections animate in as they enter the viewport (like the website's AOS effects).
 */
export function RevealScrollView({
  children,
  onScroll,
  ref,
  ...props
}: ScrollViewProps & { children: ReactNode; ref?: Ref<ComponentRef<typeof ScrollView>> }) {
  return (
    <RevealContainer>
      {(runChecks) => (
        <ScrollView
          {...props}
          ref={ref}
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            runChecks();
            onScroll?.(e);
          }}
          scrollEventThrottle={32}
          onLayout={runChecks}
        >
          {children}
        </ScrollView>
      )}
    </RevealContainer>
  );
}

type RevealProps = {
  children: ReactNode;
  delay?: number;
  /** Direction the content travels in from. */
  from?: 'bottom' | 'left' | 'right' | 'scale';
  style?: StyleProp<ViewStyle>;
  /** Called each time the element animates into view. */
  onVisible?: () => void;
  /** Called each time the element leaves the screen and resets. */
  onHidden?: () => void;
};

/**
 * Animates its children in whenever they scroll into view, from either direction,
 * and resets once they are fully off screen or the screen loses focus, so the
 * animation replays every time.
 */
export function Reveal({ children, delay = 0, from: fromProp = 'bottom', style, onVisible, onHidden }: RevealProps) {
  const registry = useContext(RevealContext);
  const { isRTL } = useLanguage();
  // "left"/"right" mean the reading start/end side, so they mirror in Arabic.
  const from = isRTL && fromProp === 'left' ? 'right' : isRTL && fromProp === 'right' ? 'left' : fromProp;
  const { height } = useWindowDimensions();
  const ref = useRef<HostInstance>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const shown = useRef(false);

  const hide = useCallback(() => {
    if (!shown.current) return;
    shown.current = false;
    progress.stopAnimation();
    progress.setValue(0);
    onHidden?.();
  }, [onHidden, progress]);

  const check = useCallback(() => {
    ref.current?.measureInWindow((_x, y, _w, h) => {
      if (h === 0) return;
      const onScreen = y < height * 0.92 && y + h > height * 0.05;
      const offScreen = y > height || y + h < 0;
      if (onScreen && !shown.current) {
        shown.current = true;
        onVisible?.();
        Animated.timing(progress, {
          toValue: 1,
          duration: 650,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else if (offScreen) {
        hide();
      }
    });
  }, [delay, height, hide, onVisible, progress]);

  useEffect(() => registry?.add(check), [registry, check]);

  // Replay when the screen is shown again (tab switch or coming back from another page).
  useFocusEffect(
    useCallback(() => {
      // Measure after layout so content already on screen animates on open.
      const t = setTimeout(check, 60);
      return () => {
        clearTimeout(t);
        hide();
      };
    }, [check, hide]),
  );

  const offset = 28;
  const transform =
    from === 'scale'
      ? [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }]
      : from === 'left'
        ? [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-offset, 0] }) }]
        : from === 'right'
          ? [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }]
          : [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }];

  return (
    <Animated.View ref={ref} style={[style, { opacity: progress, transform }]} onLayout={check}>
      {children}
    </Animated.View>
  );
}
