import { FontAwesome } from "@expo/vector-icons";
import { UserRole } from "@Stores/authorization";
import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup, Modal, Card } from "@ui-kitten/components";
import { TouchableWithoutFeedback } from "@ui-kitten/components/devsupport";
import { Link, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function CustomersPage() {
  const router = useRouter()
  const token = useAppSelector((state) => state.authorization.token);
  const role = useAppSelector((state) => state.authorization.role);
  const branch_id = useAppSelector((state) => state.authorization.branch_id);
  const client = new EncryptedClient(token);

  console.log(role, branch_id)

  const cusomerQuery = useQuery({
    queryKey: ["usermanager", "listcustomers"],
    queryFn: async () => {
      if (!role || role <= UserRole.GeneralManager) {
        const { payload } = await client.get(`/api/v1/users?f=role:6`);
        return payload.results
      }
      else {
        const { payload } = await client.get(`/api/v1/users?f=branch_id:${branch_id},role:6`);
        return payload.results
      }
    }
  });

  if (cusomerQuery.isLoading) {
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
          <Text category="h1">Customers</Text>
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
              onPress={() => router.push("/admin/customer/create")}>
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>

        <List
          data={cusomerQuery.data}
          renderItem={({ item: { _id, name, customer_data } }) => (
            <ListItem
              title={name} description={`Address: ${customer_data?.address}`} onPress={() => {
                router.push(`/admin/customer/view?cid=${_id}`)
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
              <Text>2</Text>
            </Button>
            <Button>
              <Text>3</Text>
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
