import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Calculadora",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="chevron.left.forwardslash.chevron.right" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="base-ncm"
        options={{
          title: "Base NCM",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="doc.text" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajuda"
        options={{
          title: "Ajuda",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="questionmark.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
