import { Text as RNText, type TextProps } from 'react-native';

import { useLanguage } from '@/i18n/LanguageProvider';

/**
 * Text that aligns to the reading direction of the current language. React Native does not
 * flip text alignment when only the layout `direction` changes, so Arabic text is right-aligned
 * here. An explicit `textAlign` in `style` (e.g. 'center') still wins.
 */
export function Text({ style, ...props }: TextProps) {
  const { isRTL } = useLanguage();
  return <RNText {...props} style={[isRTL && rtl, style]} />;
}

const rtl = { textAlign: 'right', writingDirection: 'rtl' } as const;
