import BottomModal from "@Comps/bottom-modal";
import { useAppSelector } from "@Stores/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, Text } from "@ui-kitten/components";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";
import MapView, { Marker } from 'react-native-maps';

export default function WarehouseViewPageLayout() {
  const { wid } = useLocalSearchParams();
  const token = useAppSelector((state) => state.authorization.token);
  const client = new EncryptedClient(token);

  const warehouseQuery = useQuery({
    queryKey: ["customers", "search"],
    queryFn: async () => {
      const params = new URLSearchParams();
      const { payload: { warehouse } } = await client.get("/api/v1/warehouse/" + wid);
      console.log(warehouse);
      return warehouse;
    }
  });

  const deleteWarehouse = useMutation({
    mutationFn: async () => {
      await client.delete("/api/v1/warehouse/" + wid);
    }
  });

  if (deleteWarehouse.isSuccess) {
    return <Redirect href="/admin/warehouse" />
  }

  if (warehouseQuery.isLoading) {
    return <Text>Loading...</Text>
  }

  const warehouseTypes = [
    "Center",
    "Branch",
  ]

  return (
    <SafeAreaView>
      <ScrollView
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <View>
          <Layout style={{ overflow: "scroll", width: "100%", height: "100%" }}>
            <Card>
              <Text category="h5">{warehouseQuery.data.name}</Text>
              <Text category="s1">{warehouseQuery.data.addr}</Text>
            </Card>

            <Card>
              <Text category="h6">Warehouse Information</Text>
              <Text>
                Name: {warehouseQuery.data.name}
              </Text>
              <Text>
                Address: {warehouseQuery.data.addr}
              </Text>
              <Text>
                Longitude: {warehouseQuery.data.long}
              </Text>
              <Text>
                Latitude: {warehouseQuery.data.lat}
              </Text>
              <Text>
                Type: {warehouseTypes[warehouseQuery.data.type]}
              </Text>
              <Text>
                Branch ID: {warehouseQuery.data.branch_id ?? "Unknown"}
              </Text>
              <MapView
                style={{ width: "100%", height: 130, marginTop: 10 }}
                initialRegion={{
                  latitude: warehouseQuery.data.lat,
                  longitude: warehouseQuery.data.long,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                scrollEnabled={false}
                camera={{
                  center: {
                    latitude: warehouseQuery.data.lat,
                    longitude: warehouseQuery.data.long,
                  },
                  pitch: 0,
                  heading: 0,
                  altitude: 0,
                  zoom: 15,
                }}
              >
                <Marker
                  coordinate={{
                    longitude: warehouseQuery.data.long,
                    latitude: warehouseQuery.data.lat,
                  }}
                  title="Warehouse"
                  description="Warehouse"
                />
              </MapView>
            </Card>

            <Card
              onPress={() => {
                router.push(`/admin/warehouse/items?wid=${wid}`);
              }}
            >
              <Text category="h6">Items</Text>
            </Card>

            <Card>
              <Text category="h6">Recent distributions</Text>
            </Card>

            <Card>
              <Button
                style={styles.buttons}
                status="success"
                onPress={() => {
                  router.push(`/admin/warehouse/edit?wid=${wid}`);
                }}>
                Edit
              </Button>
              <Button
                style={styles.buttons}
                status="danger"
                onPress={() => { deleteWarehouse.mutate() }}>
                Delete
              </Button>
              <Button
                style={styles.buttons}
                status="info"
                onPress={() => {
                  router.back();
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
