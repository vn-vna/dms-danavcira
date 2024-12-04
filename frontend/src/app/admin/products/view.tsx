import { useAppSelector } from "@Stores/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, List, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function () {
  const { pid } = useLocalSearchParams();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);

  const productInfoQuery = useQuery({
    queryKey: ["customers", pid],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/products/${pid}`);
      return payload
    }
  })

  const productDeleteMutation = useMutation({
    mutationFn: async () => {
      const { message } = await client.delete(`/api/v1/products/${pid}`);
      return message;
    }
  })

  if (productInfoQuery.isLoading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  if (productDeleteMutation.isSuccess) {
    router.push("/admin/products")
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
                  source={`data:image/png;base64,${productInfoQuery.data?.thumbnail}`}
                  style={{ width: "100%", height: 200 }}
                />
              </View>
              <Text category="h5">
                {productInfoQuery.data.name ?? "Unknown product"}
              </Text>
            </Card>

            <Card>
              <Text category="h6">Product Information</Text>
              <Text>Name: {productInfoQuery.data?.name}</Text>
              <Text>Price: {productInfoQuery.data?.price}</Text>
              <Text>Unit: {productInfoQuery.data?.unit}</Text>
            </Card>

            <Card>
              <Button
                style={styles.buttons}
                status="success" onPress={() => {
                  router.push(`/admin/products/edit?pid=${pid}`)
                }}>
                Edit
              </Button>
              <Button
                style={styles.buttons}
                status="danger" onPress={() => { 
                  productDeleteMutation.mutate()
                }}>
                Delete
              </Button>
              <Button
                style={styles.buttons}
                onPress={() => {
                  router.back()
                }}>
                Cancel
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
    marginTop: 10,
  },
});
