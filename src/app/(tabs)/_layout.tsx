import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { TopBar } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';

type IconName = keyof typeof Ionicons.glyphMap;

/** Tab icon that pops up and fills in when its tab becomes active. */
function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: focused ? 1 : 0, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [focused, anim]);
  return (
    <Animated.View
      style={{
        transform: [
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
        ],
      }}
    >
      <Ionicons name={focused ? name : (`${name}-outline` as IconName)} size={23} color={color} />
    </Animated.View>
  );
}

type TabTitle = 'home' | 'whoWeAre' | 'whatWeDo' | 'media' | 'contact';

const tabs: { name: string; title: TabTitle; icon: IconName }[] = [
  { name: 'index', title: 'home', icon: 'home' },
  { name: 'about', title: 'whoWeAre', icon: 'people' },
  { name: 'companies', title: 'whatWeDo', icon: 'flask' },
  { name: 'media', title: 'media', icon: 'newspaper' },
  { name: 'contact', title: 'contact', icon: 'mail' },
];

export default function TabLayout() {
  const { t } = useLanguage();
  return (
    <Tabs
      screenOptions={{
        header: () => <TopBar />,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: colors.line },
        animation: 'shift',
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t[tab.title],
            tabBarIcon: ({ focused, color }) => <TabIcon name={tab.icon} focused={focused} color={String(color)} />,
          }}
        />
      ))}
    </Tabs>
  );
}
