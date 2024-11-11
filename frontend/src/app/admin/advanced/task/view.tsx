import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, List, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function UserManagerViewPageLayout() {
  const { tid } = useLocalSearchParams();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);

  const taskInfoQuery = useQuery({
    queryKey: ["tasks", tid],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/tasks/${tid}`);
      return payload
    }
  })

  const customerInfoQuery = useQuery({
    queryKey: ["customers", tid],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/users/${taskInfoQuery.data.customer_id}`);
      return payload.result
    },
    enabled: taskInfoQuery.isSuccess
  })

  if (taskInfoQuery.isLoading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    )
  }

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
                Task of user
              </Text>
            </Card>

            <Card>
              <Text category="h6">Customer Information</Text>
              <Text>Name: {customerInfoQuery.data?.name}</Text>
              <Text>Email: {customerInfoQuery.data?.customer_data?.email}</Text>
              <Text>Phone: {customerInfoQuery.data?.customer_data?.phone}</Text>
              <Text>Address: {customerInfoQuery.data?.customer_data?.address}</Text>

              <MapView
                style={{ width: "100%", height: 200 }}
                region={{
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

            <Card>
              <Text category="h6">Task Description</Text>
              <Text>
                {taskInfoQuery.data.description}
              </Text>
            </Card>

            <Card>
              <Button
                style={styles.buttons}
                status="success"
                onPress={() => {

                }}>
                Edit
              </Button>
              <Button
                style={styles.buttons}
                status="danger"
                onPress={() => {

                }}>
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
  buttons: {
    marginVertical: 8,
  }
});