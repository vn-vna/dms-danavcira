import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, List, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function UserManagerViewPageLayout() {
  const { uid } = useLocalSearchParams();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);

  const customerInfoQuery = useQuery({
    queryKey: ["customers", uid],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/users/${uid}`);
      return payload.result
    }
  })

  if (customerInfoQuery.isLoading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  return (
    <SafeAreaView>
      <ScrollView
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <View>
          <Layout style={{ overflow: "scroll", width: "100%", height: "100%" }}>
            <Card>
              <Text category="h5">
                {customerInfoQuery.data.name}
              </Text>
            </Card>

            <Card>
              <Button status="success" onPress={() => { }}>
                Edit
              </Button>
              <Button status="danger" onPress={() => { }}>
                Delete
              </Button>
            </Card>

            <Card>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: "#f0f0f0",
                }}
              >
                <Image
                  source={`data:image/png;base64,${customerInfoQuery.data?.customer_data?.thumbnail}`}
                  style={{ width: "100%", height: 200 }}
                />
              </View>
              <Text category="h6">Customer Information</Text>
              <Text>Name: {customerInfoQuery.data?.name}</Text>
              <Text>Email: {customerInfoQuery.data?.customer_data?.email}</Text>
              <Text>Phone: {customerInfoQuery.data?.customer_data?.phone}</Text>
              <Text>Address: {customerInfoQuery.data?.customer_data?.address}</Text>
            </Card>

            <Card
              onPress={() => { router.push(`/admin/advanced/task?uid=${uid}`) }}
            >
              <Text category="h6">
                Tasks
              </Text>
            </Card>

          </Layout>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}