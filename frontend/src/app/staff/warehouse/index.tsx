import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { clearToken } from "@Stores/authorization";
import { useAppDispatch, useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Input, Button, Layout, List, ListItem, Text, ButtonGroup } from "@ui-kitten/components";
import { ExpoRoot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export default function WarehousePage() {
  const token = useAppSelector((state) => state.authorization.token);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const client = new EncryptedClient(token);
  const warehouseQuery = useQuery({
    queryKey: ["warehouses", "search"],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("s", search);
      params.append("p", currentPage.toString());

      try {
        const { payload } = await client.get("/api/v1/warehouse?" + params.toString());
        console.log(payload);
        return payload;
      }
      catch (error) {
        if (error instanceof Error) {
          if (error.message === "Unauthorized" || error.message === "Token expired") {
            dispatch(clearToken());
            router.push("/authentication");
          }
        }
      }
    }
  })

  useEffect(() => {
    warehouseQuery.refetch();
  }, [currentPage])

  useEffect(() => {
    const timeout = setTimeout(() => {
      warehouseQuery.refetch();
    }, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [search])

  if (warehouseQuery.isLoading) {
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
          <Text category="h1">Warehouses</Text>
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
              // Navigate to create page
              router.push("/admin/warehouse/create");
            }}>
              <FontAwesome name="plus" />
            </Button>
          </ButtonGroup>
        </Layout>
        <List
          data={warehouseQuery.data.results}
          renderItem={({ item: { _id, name, addr } }) => (
            <ListItem
              title={name ?? "Unknown"}
              description={addr ?? "Unknown"}
              onPress={() => {
                router.push(`/admin/warehouse/view?wid=${_id}`);
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
              warehouseQuery.data.pages > currentPage
                ? (
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