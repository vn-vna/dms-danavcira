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
import { setRole, setToken } from "@Stores/authorization";
import { useMutation } from "@tanstack/react-query"
import EncryptedClient from "src/utils/encrypted-client";

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
      const client = new EncryptedClient();
      await client.login(username, password);

      if (!client.token) {
        throw new Error("Invalid username or password");
      }

      dispatch(setToken(client.token));
      const { payload: { result }, message } = await client.get("/api/v1/users/me")
      dispatch(setRole(result.role));

      return result;
    }
  })

  const initialValue = {
    username: SecuredStore.getItem("APPLICATION_SAVED_USERNAME") ?? "",
    password: SecuredStore.getItem("APPLICATION_SAVED_PASSWORD") ?? "",
    savePassword: false,
  } as LoginFormData;

  if (login.isSuccess) {
    if (login.data.role < 2) {
      return <Redirect href="/admin/home" />
    }
    if (login.data.role < 5)
    {
      return <Redirect href="/manager/home" />
    }
    else {
      return <Redirect href="/staff/home" />
    }
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