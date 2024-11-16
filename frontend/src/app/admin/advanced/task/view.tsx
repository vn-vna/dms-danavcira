import React, { useEffect } from "react";
import { UserRole } from "@Stores/authorization";
import { useAppSelector } from "@Stores/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, List, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";
import BottomModal from "@Comps/bottom-modal";
import * as Location from "expo-location";
import { Formik } from "formik";
import { FontAwesome } from "@expo/vector-icons";

export default function UserManagerViewPageLayout() {
  const { tid } = useLocalSearchParams();
  const token = useAppSelector(state => state.authorization.token);
  const uid = useAppSelector(state => state.authorization.uid);
  const role = useAppSelector(state => state.authorization.role);
  const client = new EncryptedClient(token);
  const [openCheckin, setOpenCheckin] = React.useState(false);
  const [openCheckout, setOpenCheckout] = React.useState(false);
  const [currentLocation, setCurrentLocation] = React.useState({
    latitude: 21.028511,
    longitude: 105.78825,
  });

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

  const taskReportMutation = useMutation({
    mutationFn: async (values: any) => {
      const { payload } = await client.put(`/api/v1/tasks/${tid}/report`, {
        ...values,
      });
      return payload;
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

  useEffect(() => {
    taskInfoQuery.refetch();
  }, [taskReportMutation.isSuccess])

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
              <Text>Longtitude: {customerInfoQuery.data?.customer_data?.long}</Text>
              <Text>Latitude: {customerInfoQuery.data?.customer_data?.lat}</Text>

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
              <Text category="h6">Task Report</Text>
              {
                taskInfoQuery.data?.report?.map((report: any) => (
                  report ? (
                    <Text>
                      <FontAwesome name="check" size={24} color="green" />
                      {new Date(report.reported_date).toLocaleString()} - {report.type}
                    </Text>
                  ) : (<></>)
                ))
              }
            </Card>

            {
              !role || role < UserRole.Staff ? (
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
              ) : (
                <>
                  <Card>
                    <Button
                      style={styles.buttons}
                      status="success"
                      onPress={() => {
                        setOpenCheckin(true);
                      }}>
                      Check In
                    </Button>

                    <Button
                      style={styles.buttons}
                      status="danger"
                      onPress={() => {
                        setOpenCheckout(true);
                      }}>
                      Check Out
                    </Button>
                  </Card>
                </>
              )
            }
          </Layout>
        </View>
      </ScrollView>

      <BottomModal
        onDismiss={() => setOpenCheckin(false)}
        visible={openCheckin}
      >
        <Formik
          initialValues={{
            longitude: currentLocation.longitude.toString(),
            latitude: currentLocation.latitude.toString(),
          }}
          onSubmit={(values) => {
            taskReportMutation.mutate({
              type: "checkin",
              reported_date: new Date().toISOString(),
              ...values,
            });
          }}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <>
              <MapView
                style={{ position: "absolute", width: "100%", height: "100%" }}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                cameraZoomRange={
                  {
                    animated: true,
                    maxCenterCoordinateDistance: 1000,
                    minCenterCoordinateDistance: 100,
                  }
                }
                initialCamera={
                  {
                    center: {
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    },
                    pitch: 0,
                    heading: 0,
                    altitude: 0,
                    zoom: 20,
                  }
                }
              >
                <Marker
                  coordinate={currentLocation}
                />
                <Marker
                  coordinate={{
                    latitude: customerInfoQuery.data?.customer_data?.lat,
                    longitude: customerInfoQuery.data?.customer_data?.long,
                  }}
                  title={customerInfoQuery.data?.name}
                />
                <Circle
                  center={{
                    latitude: customerInfoQuery.data?.customer_data?.lat,
                    longitude: customerInfoQuery.data?.customer_data?.long,
                  }}
                  radius={5000}
                  fillColor="rgba(255, 0, 0, 0.1)"
                />
              </MapView>

              <Button
                style={{ position: "absolute", width: "100%", bottom: 0 }}
                onPress={() => {
                  setOpenCheckin(false);
                  handleSubmit();
                }}>
                <Text>Save</Text>
              </Button>
            </>
          )}
        </Formik>
      </BottomModal>

      <BottomModal
        onDismiss={() => setOpenCheckout(false)}
        visible={openCheckout}
      >
        <Formik
          initialValues={{
            longitude: currentLocation.longitude.toString(),
            latitude: currentLocation.latitude.toString(),
          }}
          onSubmit={(values) => {
            taskReportMutation.mutate({
              type: "checkout",
              reported_date: new Date().toISOString(),
              ...values,
            });
          }}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <>
              <MapView
                style={{ position: "absolute", width: "100%", height: "100%" }}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                cameraZoomRange={
                  {
                    animated: true,
                    maxCenterCoordinateDistance: 1000,
                    minCenterCoordinateDistance: 100,
                  }
                }
                initialCamera={
                  {
                    center: {
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    },
                    pitch: 0,
                    heading: 0,
                    altitude: 0,
                    zoom: 20,
                  }
                }
              >
                <Marker
                  coordinate={currentLocation}
                />
                <Marker
                  coordinate={{
                    latitude: customerInfoQuery.data?.customer_data?.lat,
                    longitude: customerInfoQuery.data?.customer_data?.long,
                  }}
                  title={customerInfoQuery.data?.name}
                />
                <Circle
                  center={{
                    latitude: customerInfoQuery.data?.customer_data?.lat,
                    longitude: customerInfoQuery.data?.customer_data?.long,
                  }}
                  radius={5000}
                  fillColor="rgba(255, 0, 0, 0.1)"
                />
              </MapView>

              <Button
                style={{ position: "absolute", width: "100%", bottom: 0 }}
                onPress={() => {
                  handleSubmit();
                  setOpenCheckout(false);
                }}>
                <Text>Save</Text>
              </Button>
            </>
          )}
        </Formik>
      </BottomModal>

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