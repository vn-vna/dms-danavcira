import { Slot, Stack } from "expo-router";

export default function ProfilePageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user" />
    </Stack>
  )
}