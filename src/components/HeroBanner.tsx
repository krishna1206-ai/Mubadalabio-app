import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

// The website's hero photo: a 1582x1180 JPEG whose pill-shaped picture sits at
// x 120–1465, y 115–920 on a white background.
const SRC = { w: 1582, h: 1180, pill: { x: 120, y: 115, w: 1345, h: 805 } };

// Bright outer edge and darker inner edge of the band, as in the site's ring animation.
const BLUE = { outer: colors.blue, inner: '#125ab0' };
const TEAL = { outer: colors.teal, inner: '#019e97' };

// Timing from the site's animation: a new colour sweeps around each half every
// 3.2 s, taking 2.13 s to draw.
const CYCLE = 3200;
const DRAW = 2133;
const ease = Easing.inOut(Easing.cubic);

type Segment = { d: string; length: number };

/** The band split into a right half (top + right + part of bottom) and a left half (rest of bottom + left). */
function halves(x: number, y: number, w: number, h: number, gap: number): { right: Segment; left: Segment } {
  const r = h / 2;
  const split = x + w * 0.42;
  const arc = Math.PI * r;
  const right = {
    d: `M ${x + r + gap} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} L ${split + gap / 2} ${y + h}`,
    length: w - 2 * r - gap + arc + (x + w - r - split - gap / 2),
  };
  const left = {
    d: `M ${split - gap / 2} ${y + h} L ${x + r} ${y + h} A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    length: split - gap / 2 - x - r + arc,
  };
  return { right, left };
}

/** Milliseconds since mount, updated every animation frame. */
function useClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = Date.now();
    const tick = () => {
      setNow(Date.now() - start);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return now;
}

/** One half of the band: the previous colour underneath, the next colour drawing over it from the far end. */
function SweepingHalf({
  outer,
  inner,
  band,
  base,
  next,
  progress,
}: {
  outer: Segment;
  inner: Segment;
  band: number;
  base: typeof BLUE;
  next: typeof BLUE;
  progress: number;
}) {
  // A dash as long as the path, offset so only the last `progress` fraction is visible.
  const dash = (s: Segment) => ({
    strokeDasharray: [s.length, s.length],
    strokeDashoffset: -(1 - progress) * s.length,
  });
  return (
    <>
      <Path d={outer.d} stroke={base.outer} strokeWidth={band} fill="none" />
      <Path d={inner.d} stroke={base.inner} strokeWidth={band / 2} fill="none" />
      {progress > 0 && (
        <>
          <Path d={outer.d} stroke={next.outer} strokeWidth={band} fill="none" {...dash(outer)} />
          <Path d={inner.d} stroke={next.inner} strokeWidth={band / 2} fill="none" {...dash(inner)} />
        </>
      )}
    </>
  );
}

const Photo = memo(function Photo({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  const scale = width / SRC.pill.w;
  return (
    <View style={[styles.photo, { left, top, width, height, borderRadius: height / 2 }]}>
      <Image
        source={require('../../assets/images/hero-banner.jpg')}
        style={{
          position: 'absolute',
          width: SRC.w * scale,
          height: SRC.h * scale,
          left: -SRC.pill.x * scale,
          top: -SRC.pill.y * scale,
        }}
        contentFit="cover"
      />
    </View>
  );
});

/**
 * Pill-shaped lab photo framed by the brand's two-tone blue/teal band. As on mubadalabio.ae,
 * a new colour continuously sweeps around each half of the band, the halves always opposite.
 */
export function HeroBanner({ width }: { width: number }) {
  const now = useClock();

  const band = width * 0.065;
  const photoW = width - band * 2;
  const photoH = (photoW * SRC.pill.h) / SRC.pill.w;
  const height = photoH + band * 2;
  const gap = band * 0.9;

  const outer = halves(band / 2, band / 2, width - band, height - band, gap);
  const inset = band * 0.25;
  const inner = halves(band / 2 + inset, band / 2 + inset, width - band - inset * 2, height - band - inset * 2, gap);

  const cycle = Math.floor(now / CYCLE);
  const progress = ease(Math.min((now % CYCLE) / DRAW, 1));
  // Right half starts blue and left half teal; each cycle the other colour sweeps in.
  const rightBase = cycle % 2 === 0 ? BLUE : TEAL;
  const rightNext = cycle % 2 === 0 ? TEAL : BLUE;

  return (
    <View style={{ width, height }}>
      <Photo left={band} top={band} width={photoW} height={photoH} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <SweepingHalf outer={outer.right} inner={inner.right} band={band} base={rightBase} next={rightNext} progress={progress} />
        <SweepingHalf outer={outer.left} inner={inner.left} band={band} base={rightNext} next={rightBase} progress={progress} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { position: 'absolute', overflow: 'hidden', backgroundColor: colors.bgSoft },
});
