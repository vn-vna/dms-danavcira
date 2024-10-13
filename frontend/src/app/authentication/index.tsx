import { Avatar, Button, ButtonGroup, Layout, Text } from "@ui-kitten/components";
import { Link, Redirect } from "expo-router";
import { Image, Pressable, StyleSheet } from "react-native";

export default function SplashPage() {
  return (
    <Redirect href="/authentication/login" />
  )
}

const styles = StyleSheet.create({
  mainLayout: { flex: 1, justifyContent: "center", alignItems: "center" },
  authButton: { width: 200, marginVertical: 3 }
})