import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { social } from '@/constants/content';
import { useLanguage } from '@/i18n/LanguageProvider';
import { logoWhiteXml, logoXml } from '@/constants/logo';
import { colors, gradient, radius, space, type } from '@/constants/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

const externalApps = /(facebook|instagram|x|twitter|linkedin|youtube)\.com/;

/**
 * Opens web pages in the app's own browser screen. Social links and non-web links
 * (mailto:, tel:) go to the matching phone app instead.
 */
export function openLink(url: string, title?: string) {
  if (url.startsWith('http') && !externalApps.test(url)) {
    router.push({ pathname: '/web', params: { url, title } });
  } else {
    Linking.openURL(url);
  }
}

type IconName = keyof typeof Ionicons.glyphMap;

const mirrored: Partial<Record<IconName, IconName>> = {
  'arrow-forward': 'arrow-back',
  'arrow-back': 'arrow-forward',
  'chevron-forward': 'chevron-back',
  'chevron-back': 'chevron-forward',
};

/** Swaps left/right-pointing icons in right-to-left layouts. */
export function directionalIcon(name: IconName, isRTL: boolean): IconName {
  return isRTL ? (mirrored[name] ?? name) : name;
}

export function Logo({ width = 120, white = false }: { width?: number; white?: boolean }) {
  const xml = white ? logoWhiteXml : logoXml;
  const height = (width * 89.44) / 281.18;
  // react-native-svg's SvgXml fails to render this logo on web, so the browser gets it as an image.
  if (Platform.OS === 'web') {
    return <Image source={`data:image/svg+xml;utf8,${encodeURIComponent(xml)}`} style={{ width, height }} />;
  }
  return <SvgXml xml={xml} width={width} height={height} />;
}

type MenuItem = { title: string; icon: IconName; href: Href };

function useMenuSections(): { title: string; items: MenuItem[] }[] {
  const { t, content } = useLanguage();
  const [biopharma, logistics] = content.verticals;
  return [
    {
      title: t.whoWeAre,
      items: [
        { title: t.aboutMubadalaBio, icon: 'information-circle-outline', href: '/about' },
        { title: t.boardOfDirectors, icon: 'people-outline', href: '/leadership' },
        { title: t.leadershipTeam, icon: 'person-outline', href: { pathname: '/leadership', params: { section: 'team' } } },
      ],
    },
    {
      title: t.whatWeDo,
      items: [
        { title: biopharma.title, icon: 'flask-outline', href: { pathname: '/company/[slug]', params: { slug: biopharma.slug } } },
        { title: logistics.title, icon: 'cube-outline', href: { pathname: '/company/[slug]', params: { slug: logistics.slug } } },
      ],
    },
  ];
}

/** Website-style navigation menu that drops down from the top bar. */
function NavMenu({ visible, onClose, top }: { visible: boolean; onClose: () => void; top: number }) {
  const { isRTL } = useLanguage();
  const menuSections = useMenuSections();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }).start();
    }
  }, [visible, anim]);

  const go = (href: Href) => {
    router.push(href);
    onClose();
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade" statusBarTranslucent>
      <Pressable style={styles.menuBackdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.menu,
          {
            direction: isRTL ? 'rtl' : 'ltr',
            top,
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
          },
        ]}
      >
        {menuSections.map((section) => (
          <View key={section.title} style={{ marginBottom: space.sm }}>
            <Text style={styles.menuHeading}>{section.title}</Text>
            {section.items.map((item) => (
              <Pressable
                key={item.title}
                onPress={() => go(item.href)}
                style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.bgSoft }]}
              >
                <Ionicons name={item.icon} size={20} color={colors.blue} />
                <Text style={styles.menuText}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </Animated.View>
    </Modal>
  );
}

/** Top bar with the logo, menu and language switch, shown on every tab. */
export function TopBar() {
  const insets = useSafeAreaInsets();
  const { lang, setLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <Logo width={112} />
      <View style={styles.topActions}>
        <PressableScale onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={styles.lang}>
          <Text style={styles.langText}>{t.languageSwitch}</Text>
        </PressableScale>
        <PressableScale onPress={() => setMenuOpen(true)} style={styles.menuBtn} accessibilityLabel={t.menu}>
          <Ionicons name="menu" size={24} color={colors.blue} />
        </PressableScale>
      </View>
      <NavMenu visible={menuOpen} onClose={() => setMenuOpen(false)} top={insets.top + 60} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'blue',
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'blue' | 'teal' | 'outline' | 'white';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const { isRTL } = useLanguage();
  const bg =
    variant === 'blue' ? colors.blue : variant === 'teal' ? colors.teal : variant === 'white' ? colors.white : 'transparent';
  const fg = variant === 'outline' ? colors.blue : variant === 'white' ? colors.blue : colors.white;
  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: bg, borderColor: variant === 'outline' ? colors.blue : bg },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
      {icon && <Ionicons name={directionalIcon(icon, isRTL)} size={16} color={fg} style={{ marginStart: 6 }} />}
    </PressableScale>
  );
}

export function SectionTitle({ children, color = colors.teal }: { children: ReactNode; color?: string }) {
  return <Text style={[type.h2, { color, marginBottom: space.sm }]}>{children}</Text>;
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={[type.body, { marginBottom: space.md }]}>{children}</Text>;
}

/** Gradient banner used as a page header on inner screens. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pageHeader}>
      <Animated.View
        style={[
          styles.bubble,
          { transform: [{ translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-30, 40] }) }] },
        ]}
      />
      <Animated.View
        style={[
          styles.bubble,
          styles.bubbleSmall,
          { transform: [{ translateY: shimmer.interpolate({ inputRange: [0, 1], outputRange: [20, -20] }) }] },
        ]}
      />
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

export function Footer() {
  const { t, content } = useLanguage();
  return (
    <View style={styles.footer}>
      <Logo white width={120} />
      <View style={styles.socialRow}>
        {social.map((s) => (
          <PressableScale key={s.url} onPress={() => openLink(s.url)} style={styles.socialBtn} scaleTo={0.85}>
            <Ionicons name={`logo-${s.icon}`} size={18} color={colors.white} />
          </PressableScale>
        ))}
      </View>
      <View style={styles.footerLinks}>
        <Text style={styles.footerLink} onPress={() => openLink(content.privacyUrl, t.privacyPolicy)}>
          {t.privacyPolicy}
        </Text>
      </View>
      <Text style={styles.copy}>{t.copyright(new Date().getFullYear())}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  menuBtn: { padding: 6, borderRadius: radius.pill, backgroundColor: colors.bgSoft },
  menuBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,30,50,0.3)' },
  menu: {
    position: 'absolute',
    right: space.md,
    left: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    shadowColor: '#0b3b73',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  menuHeading: { color: colors.teal, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 11, paddingHorizontal: 8, borderRadius: radius.sm },
  menuText: { fontSize: 16, color: colors.ink },
  lang: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.bgSoft },
  langText: { color: colors.blue, fontSize: 15, fontWeight: '600' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
  pageHeader: { paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.xl, overflow: 'hidden' },
  pageTitle: { fontSize: 30, fontWeight: '700', color: colors.white },
  pageSubtitle: { marginTop: space.sm, fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.92)' },
  bubble: {
    position: 'absolute',
    right: -40,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 26,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  bubbleSmall: { right: 90, top: 70, width: 70, height: 70, borderWidth: 10 },
  footer: { backgroundColor: colors.teal, padding: space.lg, alignItems: 'center', gap: space.md },
  socialRow: { flexDirection: 'row', gap: space.sm },
  socialBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLinks: { flexDirection: 'row', gap: space.md },
  footerLink: { color: colors.white, fontSize: 13 },
  copy: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
});
