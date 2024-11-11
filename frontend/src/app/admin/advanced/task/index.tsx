import { FontAwesome } from "@expo/vector-icons";
import { useAppSelector } from "@Stores/hooks";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function ProductsPage() {
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);
  const router = useRouter();
  const { uid } = useLocalSearchParams();

  const taskQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { payload, message } = await client.get(`/api/v1/tasks?f=user_id:${uid}`);

      if (payload) {
        return payload.results
      } else {
        throw new Error(message);
      }
    }
  })

  if (taskQuery.isLoading) {
    return (
      <Layout style={styles.container}>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  return (
    <SafeAreaView>
      <Layout style={styles.container}>
        <Layout style={styles.header}>
          <Text category="h1">Task</Text>
        </Layout>

        <Layout style={styles.header}>
          <Input placeholder="Search" />
          <ButtonGroup style={styles.filters}>
            <Button>
              <FontAwesome name="filter" />
            </Button>
            <Button>
              <FontAwesome name="sort" />
            </Button>
            <Button
              onPress={() => {
                router.push(`/admin/advanced/task/create?uid=${uid}`);
              }}
            >
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>

        <List
          data={taskQuery.data}
          renderItem={({ item: { _id, customer_name, description } }) => (
            <ListItem
              title={customer_name}
              description={description}
              onPress={() => {
                router.push(`/admin/advanced/task/view?tid=${_id}`);
              }}
            />
          )}
        />

        <Layout style={styles.pagination}>
          <ButtonGroup size="small" appearance="ghost">
            <Button>
              <FontAwesome name="angle-left" />
            </Button>
            <Button>
              <Text>1</Text>
            </Button>
            <Button>
              <FontAwesome name="angle-right" />
            </Button>
          </ButtonGroup>
        </Layout>
      </Layout>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 10,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
  }
})