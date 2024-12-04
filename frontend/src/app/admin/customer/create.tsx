import BottomModal from "@Comps/bottom-modal";
import { Button, ButtonGroup, Input, Layout, Text } from "@ui-kitten/components";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import { Redirect, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@Stores/hooks";
import EncryptedClient from "src/utils/encrypted-client";
import unidecode from "unidecode";
import { Image } from "expo-image";
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker';
import { Asset } from "expo-asset";
import CenterModal from "@Comps/center-modal";
import { UserRole } from "@Stores/authorization";

export default function CustomerCreatePageLayout() {
  const router = useRouter();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);
  const role = useAppSelector(state => state.authorization.role);
  const branch_id = useAppSelector(state => state.authorization.branch_id);

  const [showChooseLocation, setShowChooseLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 21.028511,
    longitude: 105.78825,
  });
  const [showImagePicker, setShowImagePicker] = useState(false);

  const createCustomerMutation = useMutation({
    mutationFn: async (values: any) => {
      await client.post("/api/v1/users", {
        username: unidecode(values.name.split(" ").join("").toLowerCase()),
        name: values.name,
        customer_data: {
          address: values.address,
          email: values.email,
          phone: values.phone,
          long: parseFloat(values.long),
          lat: parseFloat(values.lat),
          thumbnail: values.thumbnail,
          tax_code: values.tax_code,
        },
        branch_id: values.branch_id,
        role: 6
      });
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

  if (createCustomerMutation.isSuccess) {
    return (
      <Redirect href="/admin/customer" />
    )
  }

  return (
    <SafeAreaView>
      <ScrollView scrollEnabled>
        <Formik
          initialValues={{
            name: "",
            email: "",
            phone: "",
            address: "",
            long: "",
            lat: "",
            thumbnail: "",
            branch_id: branch_id ?? "",
            tax_code: "",
          }}
          onSubmit={(values) => {
            createCustomerMutation.mutate(values);
          }}
        >
          {
            ({ handleChange, handleBlur, handleSubmit, values }) => (
              <Layout style={styles.container}>
                <Text category="h1">New Customer</Text>
                <Pressable
                  onPress={() => { setShowImagePicker(true) }}
                  style={{ backgroundColor: "#0004", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  <Image
                    style={{ width: "100%", height: 200 }}
                    source={`data:image/jpeg;charset=utf-8;base64,${values.thumbnail}`}
                    contentFit="cover"
                    transition={1000}
                  />

                  <CenterModal
                    visible={showImagePicker}
                    onDismiss={() => setShowImagePicker(false)}>
                    <Layout style={{ width: "100%", height: "100%", justifyContent: "center" }}>
                      <Button onPress={() => {
                        setShowImagePicker(false);
                      }}>
                        Close
                      </Button>

                      <Button
                        style={styles.button}
                        onPress={async () => {
                          setShowImagePicker(false);
                          let result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.All,
                            allowsEditing: true,
                            quality: 0.5,
                          });

                          if (result.canceled) {
                            return;
                          }

                          const image = Asset.fromModule(result.assets[0].uri);
                          await image.downloadAsync();

                          const asset = await ImageManipulator.manipulateAsync(
                            result.assets[0].uri,
                            [
                              { resize: { width: 200, height: 200 } },
                            ],
                            { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
                          )

                          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
                          handleChange("thumbnail")(base64);
                        }}
                      >
                        Take a photo
                      </Button>

                      <Button
                        onPress={async () => {
                          setShowImagePicker(false);
                          let result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.All,
                            allowsEditing: true,
                            quality: 0.5,
                          });

                          if (result.canceled) {
                            return;
                          }

                          const image = Asset.fromModule(result.assets[0].uri);
                          await image.downloadAsync();

                          const asset = await ImageManipulator.manipulateAsync(
                            result.assets[0].uri,
                            [
                              { resize: { width: 200, height: 200 } },
                            ],
                            { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
                          )

                          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
                          handleChange("thumbnail")(base64);
                        }}
                      >
                        Choose from gallery
                      </Button>
                    </Layout>
                  </CenterModal>

                </Pressable>
                <Input
                  style={styles.input}
                  label="Name"
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                />
                <Input
                  style={styles.input}
                  label="Email"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                />
                <Input
                  style={styles.input}
                  label="Phone"
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  value={values.phone}
                />
                <Input
                  style={styles.input}
                  label="Address"
                  onChangeText={handleChange("address")}
                  onBlur={handleBlur("address")}
                  value={values.address}
                />
                <Input
                  style={styles.input}
                  label="Branch ID"
                  onChangeText={handleChange("branch_id")}
                  onBlur={handleBlur("branch_id")}
                  value={values.branch_id}
                  disabled={!((role === undefined) || (role <= UserRole.GeneralManager))}
                />
                <Input
                  style={styles.input}
                  label="Tax Code"
                  onChangeText={handleChange("tax_code")}
                  onBlur={handleBlur("tax_code")}
                  value={values.tax_code}
                />
                <Input
                  style={styles.input}
                  label="Longitude"
                  onChangeText={handleChange("long")}
                  onBlur={handleBlur("long")}
                  value={values.long}
                  disabled
                />
                <Input
                  style={styles.input}
                  label="Latitude"
                  onChangeText={handleChange("lat")}
                  onBlur={handleBlur("lat")}
                  value={values.lat}
                  disabled
                />
                <Button
                  style={styles.button}
                  onPress={() => setShowChooseLocation(true)}
                >
                  Choose location
                </Button>
                <Button
                  style={styles.button}
                  status="success"
                  onPress={() => handleSubmit()}
                >
                  Save
                </Button>
                <Button
                  style={styles.button}
                  status="danger"
                  onPress={() => router.back()}
                >
                  Cancel
                </Button>

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
                      handleChange("long")(currentLocation.longitude.toString());
                      handleChange("lat")(currentLocation.latitude.toString());
                    }}>
                    <Text>Save</Text>
                  </Button>
                </BottomModal>
              </Layout>
            )
          }
        </Formik>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 20,
  },
  button: {
    marginVertical: 5,
  },
  input: {
    marginVertical: 5,
  },
})