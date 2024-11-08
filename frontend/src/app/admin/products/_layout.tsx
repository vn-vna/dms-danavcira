import { Input, Layout, Button } from "@ui-kitten/components";
import { Slot, Stack } from "expo-router";
import { SafeAreaView } from "react-native";

export default function ProductPageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="view" />
    </Stack>
  )
}