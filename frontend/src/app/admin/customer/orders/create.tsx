import BottomModal from "@Comps/bottom-modal";
import { useAppSelector } from "@Stores/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, IndexPath, Input, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function CreateOrderPage() {
  const token = useAppSelector((state) => state.authorization.token);
  const uid = useAppSelector((state) => state.authorization.uid);
  const client = new EncryptedClient(token);
  const { cid } = useLocalSearchParams();
  const router = useRouter();
  const [openAddItem, setOpenAddItem] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [items, setItems] = useState([] as any[]);

  const productQuery = useQuery({
    queryKey: ["products", "search", "create-order"],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/products?s=${searchProduct}`);
      setSelectedId(null);
      return payload.results;
    }
  })

  const addOrderMutation = useMutation({
    mutationFn: async (values: any) => {
      const { payload, message } = await client.post("/api/v1/order", {
        items: values.items,
        user_id: values.user_id,
        customer_id: cid,
      });
      console.log(payload, message);
      return payload;
    }
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      productQuery.refetch();
    }, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [searchProduct])

  if (productQuery.isLoading) {
    return (
      <Layout style={styles.container}>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  if (addOrderMutation.isSuccess) {
    return <Redirect href={`/admin/customer/orders?cid=${cid}`} />
  }

  const productMapping = {} as { [key: string]: any };
  productQuery.data.forEach((product: any) => {
    productMapping[product._id] = product;
  })

  return (
    <SafeAreaView>
      <ScrollView
        scrollEnabled>
        <Layout style={styles.container}>
          <Text category="h1">New Order</Text>
          {
            items.map((item, index) => (
              <Card
                key={index}
                style={styles.input}
              >
                <Text>{item.quantity} x {item.product.name}</Text>
              </Card>
            ))
          }
          <Button
            style={styles.button}
            onPress={() => setOpenAddItem(true)}
          >
            Add Item
          </Button> 
          <Button
            style={styles.button}
            status="success"
            onPress={() => {
              const itemsMappped = {} as { [key: string]: any };
              items.forEach((item) => {
                itemsMappped[item.product._id] = item.quantity;
              });
              addOrderMutation.mutate({
                items: itemsMappped,
                user_id: uid,
                customer_id: cid,
              });
            }}
          >
            Save
          </Button>
          <Button
            style={styles.button}
            status="danger"
            onPress={() => router.back()}
          >
            Cancel
          </Button>
        </Layout>
      </ScrollView>

      <BottomModal
        visible={openAddItem}
        onDismiss={() => setOpenAddItem(false)}
      >
        <Formik
          initialValues={{
            quantity: "",
          }}
          onSubmit={(values) => {
            if (!selectedId) {
              return;
            }

            setItems([
              ...items,
              {
                product: productMapping[selectedId],
                quantity: parseInt(values.quantity),
              }
            ]);
            setOpenAddItem(false);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <Layout
              style={styles.container}
            >
              <Text category="h1">Add Item</Text>
              <Input
                style={styles.input}
                label="Product Search"
                onChangeText={setSearchProduct}
                value={searchProduct}
              />
              <Select
                label="Product"
                value={
                  productQuery.data.find((product: any) => product._id === selectedId)?.name
                }
                onSelect={(index) => {
                  setSelectedId(productQuery.data[(index as IndexPath).row]._id);
                }} 
              >
                {
                  productQuery.data.map((product: any) => (
                    <SelectItem
                      key={product._id}
                      title={product.name}
                    />
                  ))
                }
              </Select>
              <Input
                style={styles.input}
                label="Quantity"
                onChangeText={handleChange("quantity")}
                onBlur={handleBlur("quantity")}
                value={values.quantity}
              />
              <Button
                style={styles.button}
                status="success"
                onPress={() => handleSubmit()}
              >
                Save
              </Button>
              <Button
                style={styles.button}
                status="danger"
                onPress={() => setOpenAddItem(false)}
              >
                Cancel
              </Button>
            </Layout>
          )}
        </Formik>
      </BottomModal>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  input: {
    marginBottom: 10,
    width: "100%",
  },
  button: {
    marginTop: 10,
  },
})