import { Redirect, Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"
import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import EncryptedClient from "src/utils/encrypted-client";
import { useEffect } from "react";
import { Text } from "@ui-kitten/components";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  const token = useAppSelector((state) => state.authorization.token);
  const role = useAppSelector((state) => state.authorization.role);

  if (!token) {
    return <Redirect href="/authentication" />
  }

  return (
    <Tabs screenOptions={{ headerShown: false, unmountOnBlur: true, lazy: true }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          href: null,
          tabBarIcon: ({ color }) => <FontAwesome name="home" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="customer"
        options={{
          tabBarLabel: "Customers",
          href: "/admin/customer",
          tabBarIcon: ({ color }) => <FontAwesome name="user" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          tabBarLabel: "Products",
          href: "/admin/products",
          tabBarIcon: ({ color }) => <FontAwesome name="cube" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="warehouse"
        options={{
          tabBarLabel: "Warehouse",
          href: "/admin/warehouse",
          tabBarIcon: ({ color }) => <FontAwesome name="bank" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="advanced"
        options={{
          tabBarLabel: "Advanced",
          href: "/admin/advanced",
          tabBarIcon: ({ color }) => <FontAwesome name="houzz" color={color} size={20} />,
        }}
      />
    </Tabs>
  )

}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 10,
  },
  buttons: {
    marginVertical: 8,
  },
})

