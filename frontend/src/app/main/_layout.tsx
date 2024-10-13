import { Redirect, Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"
import { useAppSelector } from "@Stores/hooks";

export default function TabsLayout() {
  const token = useAppSelector((state) => state.authorization.token);

  if (!token) {
    return <Redirect href="/authentication" />
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <FontAwesome name="home" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color }) => <FontAwesome name="table" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="customer"
        options={{
          tabBarLabel: "Customers",
          tabBarIcon: ({ color }) => <FontAwesome name="user" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          tabBarLabel: "Products",
          tabBarIcon: ({ color }) => <FontAwesome name="cube" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="advanced"
        options={{
          tabBarLabel: "Advanced",
          tabBarIcon: ({ color }) => <FontAwesome name="houzz" color={color} size={20} />,
        }}
      />
    </Tabs>
  )
}