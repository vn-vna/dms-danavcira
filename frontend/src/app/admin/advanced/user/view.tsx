import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, List, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
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
              <Text category="h6">User Information</Text>
              <Text>Name: {customerInfoQuery.data?.name}</Text>
              <Text>Username: {customerInfoQuery.data?.username}</Text>
              <Text>Role: {customerInfoQuery.data?.role}</Text>
              <Text>Branch: {customerInfoQuery.data?.branch_id}</Text>
            </Card>

            <Card
              onPress={() => { router.push(`/admin/advanced/task?uid=${uid}`) }}
            >
              <Text category="h6">
                Tasks
              </Text>
            </Card>

            <Card
              onPress={() => { router.push(`/admin/advanced/kpi?uid=${uid}`) }}
            >
              <Text category="h6">
                KPI
              </Text>
            </Card>

            <Card>
              <Button
                style={styles.buttons}
                status="success"
                onPress={() => {
                  router.push(`/admin/advanced/user/edit?uid=${uid}`)
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
    padding: 10,
  },
  buttons: {
    marginVertical: 8,
  },
})
