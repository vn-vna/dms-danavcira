import { Text } from "@ui-kitten/components";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WarehouseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="view" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="items" />
    </Stack>
  );
}
