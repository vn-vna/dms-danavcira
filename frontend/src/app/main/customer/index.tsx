import { FontAwesome } from "@expo/vector-icons";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup, Modal, Card } from "@ui-kitten/components";
import { TouchableWithoutFeedback } from "@ui-kitten/components/devsupport";
import { Link, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomersPage() {
  const router = useRouter()

  const products = [
    { id: "sdjkhasdjkf", title: "Customer 1", description: "Description 1" },
    { id: "cid", title: "Customer 2", description: "Description 2" },
    { id: "cid", title: "Customer 3", description: "Description 3" },
    { id: "cid", title: "Customer 4", description: "Description 4" },
    { id: "cid", title: "Customer 5", description: "Description 5" },
    { id: "cid", title: "Customer 6", description: "Description 6" },
    { id: "cid", title: "Customer 7", description: "Description 7" },
    { id: "cid", title: "Customer 8", description: "Description 8" },
    { id: "cid", title: "Customer 9", description: "Description 9" },
    { id: "cid", title: "Customer 10", description: "Description 10" },
    { id: "cid", title: "Customer 11", description: "Description 11" },
    { id: "cid", title: "Customer 12", description: "Description 12" },
  ]
  return (
    <SafeAreaView>
      <Layout style={styles.container}>
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
              onPress={() => router.push("/main/customer/new")}>
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>

        <List
          data={products}
          renderItem={({ item: { id, title, description } }) => (
            <ListItem title={title} description={description} onPress={() => {
              router.push(`/main/customer/view?cid=${id}`)
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
