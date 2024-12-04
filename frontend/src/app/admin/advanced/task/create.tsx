import { useAppSelector } from "@Stores/hooks";
import { Button, ButtonGroup, Datepicker, Divider, IndexPath, Input, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image'
import { Asset, useAssets } from 'expo-asset';
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { Redirect, router, useLocalSearchParams } from "expo-router";

interface TaskCreateInfo {
  name: string;
  price: string;
  unit: string;
  thumbnail?: string;
}

export default function ProductCreatePage() {
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);
  const { uid } = useLocalSearchParams();
  const [assets, errors] = useAssets([require("assets/13434972.png")]);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  console.log(assets);

  const findCustomerQuery = useQuery({
    queryKey: ["customers", "find-for-task"],
    queryFn: async () => {
      const { payload } = await client.get(`/api/v1/users?f=role:6&s=${search}`);
      return payload.results;
    }
  })

  const addTaskMutation = useMutation({
    mutationFn: async (values: any) => {
      const { name, description, customer_id } = values;
      const cdata = findCustomerQuery.data[selectedIndex].customer_data;
      const response = await client.post("/api/v1/tasks", {
        user_id: uid,
        description,
        customer_id: customer_id,
        customer_name: findCustomerQuery.data[selectedIndex].name,
        address: cdata.address,
        long: cdata.long,
        lat: cdata.lat,
        due_date: values.due_date
      });
      return response;
    }
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      findCustomerQuery.refetch();
      setSelectedIndex(0);
    }, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [search])

  if (addTaskMutation.isSuccess) {
    return (
      <Redirect href={`/admin/advanced/task?uid=${uid}`} />
    )
  }

  if (findCustomerQuery.isLoading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  const customerMapping = {} as any;

  findCustomerQuery.data.forEach((customer: any) => {
    customerMapping[customer._id] = customer.name;
  })

  return (
    <SafeAreaView>
      <ScrollView scrollEnabled style={{ minHeight: "100%" }}>
        <Layout style={styles.container}>
          <Formik
            initialValues={{
              description: "",
              customer_id: findCustomerQuery.data[selectedIndex]?._id,
              due_date: new Date().toISOString()
            }}
            enableReinitialize
            onSubmit={async (values) => {
              await addTaskMutation.mutateAsync(values);
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
              <Layout>
                <Input
                  label="Search Customer"
                  value={search}
                  onChangeText={setSearch}
                />
                <Select
                  label="Customer"
                  value={findCustomerQuery.data[selectedIndex]?.name ?? "No customer selected"}
                  selectedIndex={new IndexPath(selectedIndex)}
                >
                  {findCustomerQuery.data.map((customer: any, index: number) => (
                    <SelectItem
                      onPress={() => {
                        setSelectedIndex(index);
                        handleChange('customer_id')(customer?._id);
                      }}
                      title={customer?.name} />
                  ))}
                </Select>

                <Input
                  label="Description"
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  caption={errors.description}
                  multiline
                  size="large"
                />

                <Datepicker
                  label="Due Date"
                  date={new Date(values.due_date)}
                  onSelect={(nextDate) => { handleChange("due_date")(nextDate.toISOString()) }}
                />

                <Button
                  style={styles.buttons}
                  onPress={() => handleSubmit()}
                  status="success"
                >
                  Create
                </Button>

                <Button
                  style={styles.buttons}
                  onPress={() => { router.push("/admin/advanced/task") }}
                  status="danger"
                >
                  Cancel
                </Button>
              </Layout>
            )}
          </Formik>
        </Layout>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
  },
  buttons: {
    marginVertical: 8,
  },
})