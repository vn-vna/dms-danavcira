import React from "react";
import BottomModal from "@Comps/bottom-modal";
import MapSelector from "@Comps/map-selector";
import { useAppSelector } from "@Stores/hooks";
import { Button, ButtonGroup, Divider, IndexPath, Input, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import { Redirect, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";
import * as Location from 'expo-location';
import { useMutation } from "@tanstack/react-query";
import { UserRole } from "@Stores/authorization";

const types = [
  { title: "General" },
  { title: "Branch" },
  { title: "Area" },
];

export default function CreateWarehousePage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.authorization.token);
  const role = useAppSelector((state) => state.authorization.role);
  const branch_id = useAppSelector((state) => state.authorization.branch_id);
  const [showChooseLocation, setShowChooseLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 21.028511,
    longitude: 105.78825,
  });

  const client = new EncryptedClient(token);

  const createWarehouseMutation = useMutation({
    mutationFn: async (values: any) => {
      const { name, type, address, longitude, latitude, branch_id } = values;
      const response = await client.post("/api/v1/warehouse", {
        name,
        type: parseInt(type),
        addr: address,
        long: parseFloat(longitude),
        lat: parseFloat(latitude),
        branch_id,
      });
      return response;
    }
  })

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

  if (createWarehouseMutation.isSuccess) {
    return <Redirect href="/admin/warehouse" />
  }

  return (
    <SafeAreaView>
      <Text
        style={styles.header}
        category="h1">
        Create Warehouse
      </Text>
      <Formik
        initialValues={{
          name: "",
          type: "0",
          address: "",
          longitude: "0",
          latitude: "0",
          branch_id: branch_id,
        }}
        validate={(values) => {
        }}
        onSubmit={async (values) => {
          await createWarehouseMutation.mutateAsync(values);
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
                onChangeText={handleChange('address')}
              />
              <Input
                label="Branch ID"
                value={values.branch_id}
                onChangeText={handleChange('branch_id')}
                disabled={!!role && role > UserRole.GeneralManager}
              />
              <Input
                keyboardType="number-pad"
                label="Longitude"
                value={values.longitude}
                onChangeText={handleChange('longitude')}
                disabled
              />
              <Input
                keyboardType="number-pad"
                label="Latitude"
                value={values.latitude}
                onChangeText={handleChange('latitude')}
                disabled
              />
              <Button
                style={styles.buttons}
                onPress={() => {
                  setShowChooseLocation(true);
                }}
              >
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