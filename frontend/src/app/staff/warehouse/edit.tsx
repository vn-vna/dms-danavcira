import React from "react";
import BottomModal from "@Comps/bottom-modal";
import MapSelector from "@Comps/map-selector";
import { useAppSelector } from "@Stores/hooks";
import { Button, ButtonGroup, Divider, IndexPath, Input, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";
import * as Location from 'expo-location';
import { useMutation, useQuery } from "@tanstack/react-query";

const types = [
  { title: "General" },
  { title: "Branch" },
  { title: "Area" },
];

export default function EditWarehousePage() {
  const router = useRouter();
  const { wid } = useLocalSearchParams();
  const token = useAppSelector((state) => state.authorization.token);
  const [showChooseLocation, setShowChooseLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  const client = new EncryptedClient(token);

  const warehouseeDataQuery = useQuery({
    queryKey: ["warehouse", wid],
    queryFn: async () => {
      const { payload } = await client.get("/api/v1/warehouse/" + wid);
      return payload.warehouse;
    }
  });

  const warehouseDataEditMutation = useMutation({
    mutationFn: async (data: any) => {
      await client.put("/api/v1/warehouse/" + wid, data)
    }
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })()
  }, []);

  if (warehouseeDataQuery.isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <SafeAreaView>
      <Text
        style={styles.header}
        category="h1">
        Edit Warehouse
      </Text>
      <Formik
        initialValues={{
          name: warehouseeDataQuery.data.name,
          type: warehouseeDataQuery.data.type.toString(),
          address: warehouseeDataQuery.data.addr,
          longitude: warehouseeDataQuery.data.long.toString(),
          latitude: warehouseeDataQuery.data.lat.toString(),
        }}
        enableReinitialize
        validate={(values) => {
        }}
        onSubmit={async (values) => {
          const data = {
            name: values.name,
            type: parseInt(values.type),
            addr: values.address,
            long: parseFloat(values.longitude),
            lat: parseFloat(values.latitude),
          }

          await warehouseDataEditMutation.mutateAsync(data)
          router.push("/admin/warehouse");
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <>
            <Layout style={styles.container}>
              <Input
                label="Name"
                value={values.name}
                onChangeText={handleChange('name')} />
              <Select
                label="Type"
                placeholder="Select type"
                value={types[parseInt(values.type)].title}
                selectedIndex={new IndexPath(parseInt(values.type))}
                onSelect={(index) => handleChange('type')((index as IndexPath).row.toString())}
              >
                <SelectItem title="General" />
                <SelectItem title="Branch" />
                <SelectItem title="Area" />
              </Select>
              <Input
                label="Address"
                value={values.address}
                onChangeText={handleChange('address')} />
              <Input
                keyboardType="number-pad"
                label="Longitude"
                value={values.longitude}
                onChangeText={handleChange('longitude')} />
              <Input
                keyboardType="number-pad"
                label="Latitude"
                value={values.latitude}
                onChangeText={handleChange('latitude')} />
              <Button
                style={styles.buttons}
                onPress={() => {
                  setShowChooseLocation(true);
                }}>
                <Text>Choose Location</Text>
              </Button>
              <Button
                style={styles.buttons}
                onPress={() => handleSubmit()}
                status="success"
              >
                <Text>Save</Text>
              </Button>
              <Button
                style={styles.buttons}
                onPress={() => { router.back() }}
                status="danger"
              >
                <Text>Cancel</Text>
              </Button>
            </Layout>

            <BottomModal
              visible={showChooseLocation}
              onDismiss={() => setShowChooseLocation(false)}>
              <MapView
                style={{ position: "absolute", width: "100%", height: "100%" }}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onRegionChangeComplete={(region) => {
                  setCurrentLocation({
                    latitude: region.latitude,
                    longitude: region.longitude,
                  });
                }}
              >
                <Marker
                  coordinate={currentLocation}
                />
              </MapView>

              <Button
                style={{ position: "absolute", width: "100%", bottom: 0 }}
                onPress={() => {
                  setShowChooseLocation(false);
                  values.longitude = currentLocation.longitude.toString();
                  values.latitude = currentLocation.latitude.toString();
                }}>
                <Text>Save</Text>
              </Button>
            </BottomModal>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 10,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  header: {
    textAlign: "center",
    padding: 10,
  },
});