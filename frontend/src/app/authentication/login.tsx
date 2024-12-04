import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Button, Input, Layout, Radio, Text } from "@ui-kitten/components";
import { TouchableWithoutFeedback } from "@ui-kitten/components/devsupport";
import { Link, Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Formik } from "formik"
import axios from "axios"
import * as SecuredStore from "expo-secure-store"
import CryptoJS from "react-native-crypto-js"
import { useAppDispatch } from "@Stores/hooks";
import { setBranchId, setRole, setToken, setUid } from "@Stores/authorization";
import { useMutation } from "@tanstack/react-query"
import EncryptedClient from "src/utils/encrypted-client";
import Toast from 'react-native-root-toast'
import { sleep } from "src/utils/sleep";

interface PasswordFieldIconProps {
  hidden: boolean;
  toggleSecureEntry: () => void;
}

function PasswordFieldIcon({ hidden, toggleSecureEntry }: PasswordFieldIconProps) {
  return (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <FontAwesome name={hidden ? "eye" : "eye-slash"} />
    </TouchableWithoutFeedback>
  )
}

interface LoginFormData {
  username: string;
  password: string;
  savePassword: boolean;
}

interface LoginApiRequest extends Omit<LoginFormData, "savePassword"> { }

export default function LoginPage() {
  const router = useRouter();
  const [hidePwdField, setHidePwdField] = useState(true);
  const dispatch = useAppDispatch();

  const login = useMutation({
    mutationFn: async ({ username, password }: LoginFormData) => {
      try {
        const client = new EncryptedClient();
        await client.login(username, password);

        if (!client.token) {
          Toast.show("Invalid username or password", {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
          });

          throw new Error("Invalid username or password");
        }

        const { payload: { result }, message } = await client.get("/api/v1/users/me")
        dispatch(setToken(client.token));

        if (result.role === 6) {
          Toast.show("You are not allowed to access this page", {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
          });

          throw new Error("You are not allowed to access this page");
        }

        dispatch(setRole(result.role));
        dispatch(setBranchId(result.branch_id));
        dispatch(setUid(result._id));

        Toast.show("Login success", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        });

        return result;
      } catch (error) {
        console.error(error);
        return error;
      }
    }
  })

  const initialValue = {
    username: SecuredStore.getItem("APPLICATION_SAVED_USERNAME") ?? "",
    password: SecuredStore.getItem("APPLICATION_SAVED_PASSWORD") ?? "",
    savePassword: false,
  } as LoginFormData;

  if (login.isSuccess) {
    return <Redirect href="/admin/advanced" />
  }

  return (
    <Layout style={styles.layout}>
      <Formik
        initialValues={initialValue}
        onSubmit={login.mutate}
        enableReinitialize
      >
        {
          ({ values, handleChange, handleBlur, handleSubmit, setFieldValue }) => {
            return (
              <>
                <Text status="success" category="h5">WELCOME BACK</Text>
                <Input
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                  style={styles.input}
                  placeholder="Username" />
                <Input
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={hidePwdField}
                  accessoryRight={
                    <PasswordFieldIcon
                      hidden={!hidePwdField}
                      toggleSecureEntry={() => setHidePwdField(prev => !prev)}
                    />
                  }
                />
                <Button
                  onPress={(e) => handleSubmit()}
                  status="success"
                  style={styles.button}>
                  Login
                </Button>
              </>
            )
          }
        }
      </Formik>
    </Layout>
  )
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    width: "90%",
    marginVertical: 5
  },
  radio: {
    marginVertical: 5
  },
  button: {
    marginVertical: 5
  }
})