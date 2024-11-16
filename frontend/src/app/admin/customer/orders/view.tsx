import { useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Layout, Text } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function () {
  const { oid } = useLocalSearchParams();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);
  const [cid, setCid] = useState("");
  const [itemIds, setItemIds] = useState<string[]>([]);

  const orderQuery = useQuery({
    queryKey: ["orders", oid],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/order/${oid}`);
      setCid(payload.results.customer_id);
      setItemIds(Object.entries(payload.results.items).map(([key, value]) => key));
      return payload.results;
    }
  });

  const customerQuery = useQuery({
    queryKey: ["customers", "search-order", cid],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/users/${cid}`);
      return payload.result;
    },
    enabled: !!cid
  });

  const itemQuery = useQuery({
    queryKey: ["items", "search"],
    queryFn: async () => {
      const items = [] as any[];
      for (const id of itemIds) {
        const { payload } = await client.get(`/api/v1/products/${id}`);
        items.push(payload);
      }
      return items;
    },
    enabled: !!itemIds
  });

  useEffect(() => {
    orderQuery.refetch();
  }, [oid]);

  useEffect(() => {
    customerQuery.refetch();
  }, [cid]);

  useEffect(() => {
    itemQuery.refetch();
  }, [itemIds]);

  if (orderQuery.isLoading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  if (customerQuery.isLoading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  if (itemQuery.isLoading) {
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
                {customerQuery.data?.name}
              </Text>
              <Text category="s1">
                @{customerQuery.data?.username}
              </Text>
              <Text category="s1">
                Name: {customerQuery.data?.name}
              </Text>
              <Text category="s1">
                Email: {customerQuery.data?.customer_data.email}
              </Text>
            </Card>

            <Card>
              <Text category="h6">Order Informations</Text>
              {
                itemQuery.data?.map((item, index) => (
                  <Text key={index}>
                    {item.name} x {orderQuery.data.items[item._id]} ({item.price}VND / {item.unit}) = {item.price * orderQuery.data.items[item._id]} VND
                  </Text>
                ))
              }
            </Card>

            <Card>
              <Button
                style={styles.buttons}
                status="danger"
                onPress={() => {
                  router.back();
                }}>
                Back
              </Button>
            </Card>

          </Layout>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  buttons: {
    margin: 5,
  }
})