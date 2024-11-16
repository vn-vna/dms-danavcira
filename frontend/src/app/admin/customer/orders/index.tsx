import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Button, ButtonGroup, Input, Layout, List, ListItem, Text } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@Stores/hooks";
import EncryptedClient from "src/utils/encrypted-client";

export default function () {
  const token = useAppSelector((state) => state.authorization.token);
  const client = new EncryptedClient(token);

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const { cid } = useLocalSearchParams();

  const orderQuery = useQuery({
    queryKey: ["orders", "search"],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/order?s=${search}&p=${currentPage}&f=customer_id:${cid}`);
      return payload.results;
    }
  })

  if (orderQuery.isLoading) {
    return (
      <Layout style={styles.container}>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  console.log(orderQuery.data)

  return (
    <SafeAreaView>

      <Layout style={styles.container}>
        <Layout style={styles.header}>
          <Text category="h1">Orders</Text>
        </Layout>

        <Layout style={styles.header}>
          <Input
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
          />
          <ButtonGroup style={styles.filters}>
            <Button>
              <FontAwesome name="filter" />
            </Button>
            <Button>
              <FontAwesome name="sort" />
            </Button>
            <Button onPress={() => {
              router.push("/admin/customer/orders/create?cid=" + cid);
            }}>
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>
        <List
          data={orderQuery.data}
          renderItem={({ item: { _id, customer_id, items } }) => ( 
            <ListItem
              title={_id}
              description={Object.keys(items).length + " items"}
              onPress={() => {
                router.push(`/admin/customer/orders/view?oid=${_id}`);
              }} />
          )}
        />

        <Layout style={styles.pagination}>
          <ButtonGroup size="small" appearance="ghost">
            <Button>
              <FontAwesome name="angle-left" />
            </Button>
            {
              currentPage > 1
                ? (
                  <Button>
                    {currentPage - 1}
                  </Button>
                )
                : (<></>)
            }
            <Button>
              {currentPage}
            </Button>
            {
              1 ? (
                <Button>
                  {currentPage + 1}
                </Button>
              )
                : (<></>)
            }
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