import React, { useEffect, useState } from 'react'

import EncryptedClient from 'src/utils/encrypted-client';

import { roleToString } from '@Stores/authorization';
import { useAppSelector } from '@Stores/hooks';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Datepicker, Input, Layout, List, ListItem, Text } from '@ui-kitten/components'
import { useLocalSearchParams } from 'expo-router';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Formik } from 'formik';

export default function KpiPage() {
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);
  const [searchDate, setSearchDate] = useState(new Date().toISOString());
  const [searchUsername, setSearchUsername] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");

  const orderSearchQuery = useQuery({
    queryKey: ["order", "search"],
    queryFn: async () => {
      const filterParams = [] as string[];

      let staffid = undefined;
      let customerid = undefined;

      if (searchUsername) {
        // Find customer id
        const { payload } = await client.get(`/api/v1/users?f=username:${searchUsername}`);
        if (payload.results.length === 0) {
          // No user found
          return {
            results: []
          }
        }
        staffid = payload.results[0]._id;
      }

      if (searchCustomer) {
        // Find customer id
        const { payload } = await client.get(`/api/v1/users?f=name:${searchCustomer}`);
        if (payload.results.length === 0) {
          // No user found
          return {
            results: []
          }
        }
        customerid = payload.results[0]._id;
      }

      if (staffid) {
        filterParams.push(`user_id:${staffid}`);
      }

      if (customerid) {
        filterParams.push(`customer_id:${customerid}`);
      }

      console.log("Filtes: ", filterParams);

      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString();

      const { payload } = await client.get(`/api/v1/order?f=${filterParams.join(",")}&from=${searchDate}&to=${nextDateStr}`);
      console.log(payload);
      return payload;
    }
  })

  const customerSearchQuery = useQuery({
    queryKey: ["customer", "search"],
    queryFn: async () => {
      const customerIds = orderSearchQuery.data?.results.map((item: any) => item.customer_id);
      const customers = [] as any[];
      for (const id of customerIds) {
        const { payload } = await client.get(`/api/v1/users/${id}`);
        customers.push(payload.result);
      }

      const userMapping = customers.reduce((acc: any, item: any) => {
        acc[item._id] = item;
        return acc;
      }, {});

      return userMapping;
    },
    enabled: orderSearchQuery.isSuccess
  })

  useEffect(() => {
    if (orderSearchQuery.isSuccess) {
      customerSearchQuery.refetch();
    }
  }, [orderSearchQuery.data])

  useEffect(() => {
    orderSearchQuery.refetch();
  }, [searchDate, searchUsername, searchCustomer])

  if (orderSearchQuery.isLoading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  if (customerSearchQuery.isLoading) {
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
                Order Report
              </Text>
            </Card>

            <Formik
              initialValues={{
                date: new Date().toISOString(),
                username: "",
                customer: ""
              }}
              onSubmit={(values) => {
                setSearchDate(values.date);
                setSearchCustomer(values.customer);
                setSearchUsername(values.username);
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <Card>
                  <Datepicker
                    date={new Date(values.date)}
                    onSelect={(date) => handleChange("date")(date.toISOString())}
                    label="Report date"
                  />
                  <Input
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    value={values.username}
                    label="Username" />
                  <Input
                    onChangeText={handleChange("customer")}
                    onBlur={handleBlur("customer")}
                    value={values.customer}
                    label="Search Customer" />
                  <Button
                    onPress={() => handleSubmit()}
                  >
                    Search
                  </Button>
                </Card>
              )}
            </Formik>

            {
              orderSearchQuery.data?.results?.map((item: any) => {
                return (
                  <Card
                    key={item?._id}
                  >
                    <Layout
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}
                    >
                      <View>
                        <Text>
                          {
                            item?._id.length > 10 ?
                              item?._id.slice(0, 10) + "..." :
                              item?._id
                          }
                        </Text>
                        <Text>
                          Customer: {
                            customerSearchQuery?.data[item?.customer_id]?.name.length > 10 ?
                              customerSearchQuery?.data[item?.customer_id]?.name.slice(0, 10) + "..." :
                              customerSearchQuery?.data[item?.customer_id]?.name
                          }
                        </Text>
                      </View>
                      <View>
                        <Text>
                          Date: {new Date(item?.created_date).toLocaleDateString()}
                        </Text>
                        <Text>
                          Status: {item?.status ? "Completed" : "Incompleted"}
                        </Text>
                      </View>
                    </Layout>
                  </Card>
                )
              })
            }
          </Layout>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}