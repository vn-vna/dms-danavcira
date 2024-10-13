import { Slot, Stack } from "expo-router";

export default function SplashLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" options={{ presentation: "modal" }} />
      <Stack.Screen name="signup" options={{ presentation: "modal" }} />
    </Stack>
  )
}