import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, type StyleProp, type TextStyle } from 'react-native';

import { Text } from './Text';

type Props = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  start: boolean;
  style?: StyleProp<TextStyle>;
};

/** Formats with thousands separators (10000 → "10,000"). */
function format(n: number, decimals: number) {
  const [whole, fraction] = n.toFixed(decimals).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

/** Counts from 0 up to `value` whenever `start` turns true; resets to 0 when it turns false. */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', start, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) {
      anim.stopAnimation();
      anim.setValue(0);
      setDisplay(0);
      return;
    }
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(anim, {
      toValue: value,
      duration: 1800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [start, value, anim]);

  return (
    <Text style={style}>
      {prefix}
      {format(display, decimals)}
      {suffix}
    </Text>
  );
}
