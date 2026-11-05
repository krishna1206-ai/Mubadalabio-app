// Brand palette taken from the Mubadala Bio logo and website.
export const colors = {
  blue: '#1c80fa',
  blueDark: '#1565d8',
  teal: '#00b2a9',
  tealDark: '#009a92',
  ink: '#333f48',
  text: '#4a5560',
  muted: '#8a949c',
  line: '#e4ebf2',
  bg: '#ffffff',
  bgSoft: '#f4f8fc',
  white: '#ffffff',
};

export const gradient = [colors.blue, colors.teal] as const;

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 };

export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 36 };

export const card = {
  borderRadius: radius.md,
  backgroundColor: colors.white,
  shadowColor: '#0b3b73',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const type = {
  hero: { fontSize: 38, lineHeight: 44, fontWeight: '500' as const, color: colors.blue },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const, color: colors.ink },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, color: colors.teal },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '600' as const, color: colors.ink },
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
  small: { fontSize: 12, lineHeight: 17, color: colors.muted },
};
