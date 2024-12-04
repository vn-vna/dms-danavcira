import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, List, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function CustomerViewPageLayout() {
  const { cid } = useLocalSearchParams();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);

  const customerInfoQuery = useQuery({
    queryKey: ["customers", cid],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/users/${cid}`);
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
              <Text category="h5">
                {customerInfoQuery.data.name ?? "Unknown customer"}
              </Text>
            </Card>

            <Card>
              <Text category="h6">Customer Information</Text>
              <Text>Name: {customerInfoQuery.data?.name}</Text>
              <Text>Email: {customerInfoQuery.data?.customer_data?.email ?? "Unknown"}</Text>
              <Text>Phone: {customerInfoQuery.data?.customer_data?.phone ?? "Unknown"}</Text>
              <Text>Address: {customerInfoQuery.data?.customer_data?.address ?? "Unknown"}</Text>
              <Text>Branch ID: {customerInfoQuery.data?.branch_id ?? "Unknown"}</Text>
              <Text>Tax Code: {customerInfoQuery.data?.customer_data.tax_code}</Text>

              <MapView
                style={{ width: "100%", height: 200 }}
                initialRegion={{
                  latitude: customerInfoQuery.data?.customer_data?.lat,
                  longitude: customerInfoQuery.data?.customer_data?.long,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: customerInfoQuery.data?.customer_data?.lat,
                    longitude: customerInfoQuery.data?.customer_data?.long,
                  }}
                  title={customerInfoQuery.data?.name}
                />
              </MapView>
            </Card>

            <Card
              onPress={() => {
                router.push(`/admin/customer/orders?cid=${cid}`)
              }}
            >
              <Text category="h6">Orders</Text>
            </Card>

            <Card>
              <Button
                style={styles.buttons}
                status="success"
                onPress={() => {
                  router.push(`/admin/customer/edit?cid=${cid}`)
                }}>
                Edit
              </Button>
              <Button
                style={styles.buttons}
                status="danger"
                onPress={() => { }}>
                Delete
              </Button>
            </Card>

          </Layout>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  buttons: {
    marginVertical: 8,
  },
});