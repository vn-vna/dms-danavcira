import { FontAwesome } from "@expo/vector-icons";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup } from "@ui-kitten/components";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersPage() {
  const products = [
    { title: "Order 1", description: "Description 1" },
    { title: "Order 2", description: "Description 2" },
    { title: "Order 3", description: "Description 3" },
    { title: "Order 4", description: "Description 4" },
    { title: "Order 5", description: "Description 5" },
    { title: "Order 6", description: "Description 6" },
    { title: "Order 7", description: "Description 7" },
    { title: "Order 8", description: "Description 8" },
    { title: "Order 9", description: "Description 9" },
    { title: "Order 10", description: "Description 10" },
    { title: "Order 11", description: "Description 11" },
    { title: "Order 12", description: "Description 12" },
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
            <Button>
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>

        <List
          data={products}
          renderItem={({ item: { title, description } }) => (
            <ListItem title={title} description={description} />
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
              <Text>2</Text>
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
  }
})

