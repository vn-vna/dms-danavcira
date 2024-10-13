import { Slot, Stack } from "expo-router";

export default function CustomerPageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" options={{ presentation: "modal" }} />
      <Stack.Screen name="view" options={{ presentation: "modal" }} />
    </Stack>
  )
}