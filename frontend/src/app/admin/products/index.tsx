import { FontAwesome } from "@expo/vector-icons";
import { clearToken } from "@Stores/authorization";
import { useAppDispatch, useAppSelector } from "@Stores/hooks";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function ProductsPage() {
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const productQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { payload, message } = await client.get("/api/v1/products");
        return payload.results
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Unauthorized" || error.message === "Token expired") {
            dispatch(clearToken());
            router.push("/authentication");
          }
        }
      }
    }
  })

  if (productQuery.isLoading) {
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
          <Text category="h1">Products</Text>
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
                router.push("/admin/products/create");
              }}
            >
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>

        <List
          data={productQuery.data}
          renderItem={({ item: { _id, name, price, unit, thumbnail } }) => (
            <ListItem
              title={name}
              description={`Price: ${price} VND / ${unit}`}
              onPress={() => {
                router.push(`/admin/products/view?pid=${_id}`);
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