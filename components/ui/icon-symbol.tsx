import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "calculator": "calculate",
  "database": "storage",
  "questionmark.circle.fill": "help",
  "doc.text": "description",
  "arrow.up.doc": "upload-file",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "exclamationmark.triangle.fill": "warning",
  "arrow.down.doc": "download",
  "magnifyingglass": "search",
  "trash": "delete",
  "square.and.arrow.up": "share",
  "plus": "add",
  "info.circle": "info",
} as unknown as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
