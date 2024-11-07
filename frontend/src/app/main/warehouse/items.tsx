import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useAppSelector } from "@Stores/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ButtonGroup, Input, Layout, List, ListItem, Text } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";
import BottomModal from "@Comps/bottom-modal";

interface WarehouseItem {
  id: string;
  name: string;
  quantity: number;
}

export default function WarehouseItemsPage() {
  const token = useAppSelector((state) => state.authorization.token);
  const client = new EncryptedClient(token);
  const router = useRouter();
  const { wid } = useLocalSearchParams();
  const [openEditModal, setOpenEditModal] = useState("");
  const [search, setSearch] = useState("");

  const productQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.set("s", search);
      const { payload, message } = await client.get("/api/v1/products?" + query.toString());

      if (payload) {
        return payload.results
      } else {
        throw new Error(message);
      }
    }
  })

  const warehouseQuery = useQuery({
    queryKey: ["warehouses", "search"],
    queryFn: async () => {
      const { payload } = await client.get("/api/v1/warehouse/" + wid);
      return payload.warehouse
    }
  })

  const warehouseItemMutation = useMutation({
    mutationFn: async (values: WarehouseItem) => {
      const { id, name, quantity } = values;

      const response = await client.put("/api/v1/warehouse/" + wid + "/items", { id, quantity });

      return response;
    }
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      productQuery.refetch();
    }, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [search])

  if (productQuery.isLoading || warehouseQuery.isLoading) {
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
          <Text category="h1">Warehouse Items</Text>
        </Layout>

        <Layout style={styles.header}>
          <Input
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
          />
        </Layout>

        <List
          data={productQuery.data}
          renderItem={({ item: { _id, name, price, unit, thumbnail } }) => (
            <Formik
              initialValues={{
                quantity: warehouseQuery.data?.items?.[_id] ?? "0"
              }}
              enableReinitialize
              onSubmit={async (values) => {
                await warehouseItemMutation.mutateAsync({
                  id: _id, quantity: parseInt(values.quantity), name
                });
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <>
                  <ListItem
                    title={name}
                    description={`Price: ${price} VND / ${unit}`}
                    accessoryRight={() => (
                      <View style={styles.listItem}>
                        <Text appearance="hint">Quantity: {values.quantity}</Text>
                      </View>
                    )}
                    onPress={() => {
                      setOpenEditModal(_id);
                    }}
                  />

                  <BottomModal
                    visible={openEditModal === _id}
                    onDismiss={() => setOpenEditModal("")}
                  >
                    <Layout style={styles.container}>
                      <Text category="h1">Edit Item</Text>
                      <Input
                        label="Quantity"
                        value={values.quantity.toString()}
                        onChangeText={handleChange("quantity")}
                        inputMode="numeric"
                      />
                      <Button onPress={() => {
                        handleSubmit();
                        setOpenEditModal("");
                      }}>Save</Button>
                    </Layout>
                  </BottomModal>
                </>
              )}
            </Formik>
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
  );
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
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }
})