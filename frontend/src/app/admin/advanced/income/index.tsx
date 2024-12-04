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
import { LineChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native';

export default function IncomeReportPage() {
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);
  const [searchDate, setSearchDate] = useState(new Date().toISOString());
  const [searchUsername, setSearchUsername] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");

  const orderSearchQuery = useQuery({
    queryKey: ["order", "search"],
    queryFn: async () => {
      const filterParams = [] as string[];
      if (searchUsername) {
        filterParams.push(`user_id:${searchUsername}`);
      }
      if (searchCustomer) {
        filterParams.push(`customer_id:${searchCustomer}`);
      }

      const beginYear = new Date(searchDate).getFullYear();
      const beginDate = new Date(`${beginYear}-01-01`).toISOString();
      const endDate = new Date(`${beginYear + 1}-01-01`).toISOString();

      const { payload } = await client.get(`/api/v1/order?f=${filterParams.join(",")}&from=${beginDate}&to=${endDate}`);


      const monthHistogram = payload.results.reduce((acc: any, order: any) => {
        const month = new Date(order.created_date).getMonth();
        if (!acc[month]) {
          acc[month] = {};
        }

        for (const itemId in order.items) {
          const quantity = order.items[itemId];
          if (!acc[month][itemId]) {
            acc[month][itemId] = 0;
          }

          acc[month][itemId] += quantity;
        }

        return acc;
      }, [...Array(12)].map(() => ({})));

      const productIds = payload.results.reduce((acc: any, order: any) => {
        for (const itemId in order.items) {
          if (!acc[itemId]) {
            acc[itemId] = true;
          }
        }

        return acc;
      }, {} as any);

      const productMapping = {} as any;

      for (const productId in productIds) {
        const { payload } = await client.get(`/api/v1/products/${productId}`);
        productMapping[productId] = payload;
      }

      console.log(monthHistogram);

      let monthData = monthHistogram.map((month: any, index: number) => {
        let income = 0;

        for (const productId in month) {
          const product = productMapping[productId];
          if (!product || !product.price) {
            continue;
          }

          income += product.price * month[productId];
        }

        return income;
      })

      const highestIncome = Math.max(...monthData);
      const bestFitScaledUnit = Math.pow(10, Math.floor(Math.log10(highestIncome)));

      if (bestFitScaledUnit > 0) {
        monthData = monthData.map((income: number) => income / bestFitScaledUnit);
      }

      let bestFitScaledUnitString = "₫";
      if (bestFitScaledUnit >= 1000000000) {
        bestFitScaledUnitString = "B₫";
      }
      else if (bestFitScaledUnit >= 1000000) {
        bestFitScaledUnitString = "M₫";
      }
      else if (bestFitScaledUnit >= 1000) {
        bestFitScaledUnitString = "K₫";
      }

      console.log(monthData);

      return {
        monthHistogram,
        productMapping,
        monthData,
        bestFitScaledUnit,
        bestFitScaledUnitString
      }
    }
  });

  useEffect(() => {
    orderSearchQuery.refetch();
  }, [searchDate, searchUsername, searchCustomer]);

  if (orderSearchQuery.isLoading) {
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
                year: new Date().getFullYear().toString(),
              }}
              onSubmit={(values) => {
                setSearchDate(new Date(`${values.year}-01-01`).toISOString());
                console.log(values);
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <Card>
                  <Input
                    label="Year"
                    placeholder="Year"
                    onChangeText={handleChange("year")}
                    onBlur={handleBlur("year")}
                    value={values.year}
                  />

                  <Button
                    onPress={() => handleSubmit()}
                  >
                    Search
                  </Button>
                </Card>
              )}
            </Formik>

            <Card
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <LineChart
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  datasets: [
                    {
                      data: orderSearchQuery.data?.monthData ?? [...Array(12)].map(() => 0)
                    }
                  ]
                }}
                width={Dimensions.get("window").width - 50} // from react-native
                height={500}
                yAxisSuffix={orderSearchQuery.data?.bestFitScaledUnitString ?? "₫"}
                chartConfig={{
                  backgroundGradientFrom: "#cccccc",
                  backgroundGradientTo: "#cccccc",
                  decimalPlaces: 2, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </Card>
          </Layout>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}