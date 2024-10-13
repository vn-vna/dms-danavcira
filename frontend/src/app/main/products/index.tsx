import { FontAwesome } from "@expo/vector-icons";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup } from "@ui-kitten/components";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductsPage() {
  const products = [
    { title: "Product 1", description: "Description 1" },
    { title: "Product 2", description: "Description 2" },
    { title: "Product 3", description: "Description 3" },
    { title: "Product 4", description: "Description 4" },
    { title: "Product 5", description: "Description 5" },
    { title: "Product 6", description: "Description 6" },
    { title: "Product 7", description: "Description 7" },
    { title: "Product 8", description: "Description 8" },
    { title: "Product 9", description: "Description 9" },
    { title: "Product 10", description: "Description 10" },
    { title: "Product 11", description: "Description 11" },
    { title: "Product 12", description: "Description 12" },
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