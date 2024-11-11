import { Layout } from "@ui-kitten/components";
import { Slot, Stack } from "expo-router";
import { ScrollView } from "react-native";

export default function CustomerPageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="view" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="orders" />
    </Stack>
  )
}