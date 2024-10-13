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
import { setToken } from "@Stores/authorization";
import { useMutation } from "@tanstack/react-query"

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
      console.log("Perform LOGIN");
      const key = process.env.EXPO_PUBLIC_ENCRYPTION_KEY ?? "";
      const reqdata = { username, password } as LoginApiRequest;
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(reqdata), key).toString();
      SecuredStore.setItem("APPLICATION_SAVED_USERNAME", username);
      SecuredStore.setItem("APPLICATION_SAVED_PASSWORD", password);
      const token = await axios
        .post(`${process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000"}/api/v1/users/login`, encrypted, {
          headers: {
            "Content-Type": "text/plain"
          }
        })
        .then((response) => {
          return JSON.parse(CryptoJS.AES.decrypt(response.data, key).toString(CryptoJS.enc.Utf8));
        })
        .then((data) => {
          const token = data.payload.token as string;
          console.log(`TOKEN: ${token}`)
          return token;
        });
        
      dispatch(setToken(token));
    }
  })

  const initialValue = {
    username: SecuredStore.getItem("APPLICATION_SAVED_USERNAME") ?? "",
    password: SecuredStore.getItem("APPLICATION_SAVED_PASSWORD") ?? "",
    savePassword: false,
  } as LoginFormData;

  if (login.isSuccess) {
    return (
      <Redirect href="/main" />
    )
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
                <Radio
                  style={styles.radio}
                  checked={values.savePassword}
                  onChange={(checked) => setFieldValue("savePassword", checked)}
                >
                  Remember username and password
                </Radio>
                <Button
                  onPress={(e) => handleSubmit()}
                  status="success"
                  style={styles.button}>
                  Login
                </Button>
                <Link href="/authentication/signup">
                  <Text>If you didn't have account, let's </Text><Text status="danger">sign up</Text>
                </Link>
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