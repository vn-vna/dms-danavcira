import { FontAwesome } from "@expo/vector-icons";
import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup, Modal, Card } from "@ui-kitten/components";
import { TouchableWithoutFeedback } from "@ui-kitten/components/devsupport";
import { Link, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function UserManagerPage() {
  const router = useRouter()
  const token = useAppSelector((state) => state.authorization.token);
  const client = new EncryptedClient(token);

  const cusomerQuery = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { payload } = await client.get("/api/v1/users");
      return payload.results.filter((user: any) => user.role !== 6)
    }
  })

  const products = [
    { id: "sdjkhasdjkf", title: "Customer 1", description: "Description 1" },
  ]

  if (cusomerQuery.isLoading) {
    return (
      <Layout style={styles.container}>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  console.log(cusomerQuery.data)

  return (
    <SafeAreaView>
      <Layout style={styles.container}>
        <Layout style={styles.header}>
          <Text category="h1">User manager</Text>
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
              onPress={() => router.push("/admin/advanced/user/create")}>
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>

        <List
          data={cusomerQuery.data}
          renderItem={({ item: { _id, name, username } }) => (
            <ListItem
              title={name} description={`@${username}`} onPress={() => {
                router.push(`/admin/advanced/user/view?uid=${_id}`)
              }} />
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
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modal: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
  },
})
