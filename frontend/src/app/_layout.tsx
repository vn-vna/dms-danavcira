import { ApplicationProvider } from "@ui-kitten/components";
import * as eva from "@eva-design/eva"
import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import store from "@Stores/store";
import { Provider as ReduxProvider } from "react-redux"
import { useAppSelector } from "@Stores/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const DEFAULT_QUERYCLIENT = new QueryClient();

function ApplicationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "flip" }} initialRouteName="/admin">
      <Stack.Screen name="index" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="authentication" />
    </Stack>
  )
}

export default function () {
  return (
    <QueryClientProvider client={DEFAULT_QUERYCLIENT}>
      <ReduxProvider store={store}>
        <ApplicationProvider {...eva} theme={eva.light}>
          <ApplicationLayout />
        </ApplicationProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
}