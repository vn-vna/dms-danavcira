import { Layout } from "@ui-kitten/components";
import { Slot, Stack } from "expo-router";
import { ScrollView } from "react-native";

export default function CustomerPageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "flip" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" options={{ presentation: "modal" }} />
      <Stack.Screen name="view" options={{ presentation: "modal" }} />
    </Stack>
  )
}