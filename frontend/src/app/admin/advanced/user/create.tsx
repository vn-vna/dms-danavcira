import BottomModal from "@Comps/bottom-modal";
import { Button, ButtonGroup, IndexPath, Input, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import { Redirect, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@Stores/hooks";
import EncryptedClient from "src/utils/encrypted-client";
import unidecode from "unidecode";
import { Image } from "expo-image";
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker';
import { Asset } from "expo-asset";
import CenterModal from "@Comps/center-modal";

export default function UserManagerCreatePageLayout() {
  const router = useRouter();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);

  const createCustomerMutation = useMutation({
    mutationFn: async (values: any) => {
      await client.post("/api/v1/users", {
        username: values.username,
        name: values.name,
        password: values.password,
        role: parseInt(values.role),
        branch_id: values.branch_id
      });
    }
  });

  const roles = [
    "Admin",
    "General Manager",
    "Branch Manager",
    "Sales Manager",
    "Officier",
    "Staff"
  ]


  if (createCustomerMutation.isSuccess) {
    return (
      <Redirect href="/admin/advanced/user" />
    )
  }

  return (
    <SafeAreaView>
      <ScrollView scrollEnabled>
        <Formik
          initialValues={{
            username: "",
            name: "",
            password: "",
            role: "0",
            branch_id: ""
          }}
          onSubmit={(values) => {
            createCustomerMutation.mutate(values);
          }}
        >
          {
            ({ handleChange, handleBlur, handleSubmit, values }) => (
              <Layout style={styles.container}>
                <Text category="h1">New Customer</Text>
                <Input
                  style={styles.input}
                  label="Username"
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                />
                <Input
                  style={styles.input}
                  label="Name"
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                />
                {/* branch id */}
                <Input
                  style={styles.input}
                  label="Branch ID"
                  onChangeText={handleChange("branch_id")}
                  onBlur={handleBlur("branch_id")}
                  value={values.branch_id}
                />

                <Input
                  style={styles.input}
                  label="Password"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  secureTextEntry
                />
                <Select
                  style={styles.input}
                  label="Role"
                  value={roles[parseInt(values.role)]}
                >
                  {
                    roles.map((role, index) => (
                      <SelectItem
                        key={index}
                        title={role}
                        onPress={() => handleChange("role")(index.toString())}
                      />
                    ))
                  }
                </Select>
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
                  onPress={() => router.back()}
                >
                  Cancel
                </Button>
              </Layout>
            )
          }
        </Formik>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 20,
  },
  button: {
    marginVertical: 5,
  },
  input: {
    marginVertical: 5,
  },
})