import { FontAwesome } from "@expo/vector-icons";
import { Button, Card, Icon, Input, Layout, Text, Tooltip } from "@ui-kitten/components";
import { TouchableWithoutFeedback } from "@ui-kitten/components/devsupport";
import { Link } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

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

interface SignupFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);
  const [secureConfirmPasswordEntry, setSecureConfirmPasswordEntry] = useState(true);

  const signup = (data: SignupFormData) => { }

  const validate = (data: SignupFormData) => {
    const err = {} as { [key: string]: string }
    if (data.username.length < 6) {
      err.username = "Username must contain at least 6 characters";
    }
    if (data.username.match(/^[a-z0-9_]+$/) == null) {
      err.username = "Username can only contain a-z, 0-9 character"
    }
    if (data.password.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,}$/) == null) {
      err.password = "Password must contain at least 8 characters and at least one upper case, lower case, number, special character";
    }
    if (err.password) {
      err.confirmPassword = "Enter password first";
    }
    if (!err.password && data.confirmPassword != data.password) {
      err.confirmPassword = "Password mismatch";
    }
    return err;
  }

  return (
    <Layout style={styles.layout}>
      <Formik
        initialValues={{
          username: "",
          password: "",
          confirmPassword: ""
        } as SignupFormData}
        onSubmit={signup}
        validate={validate}
        enableReinitialize
      >
        {
          ({ values, handleChange, handleBlur, errors }) => {
            return (
              <>
                <Text status="danger" category="h5">CREATE NEW ACCOUNT</Text>
                <Input
                  status={errors.username ? "danger" : "basic"}
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                  style={styles.input}
                  placeholder="Enter username"
                  caption={errors.username}
                />
                <Input
                  status={errors.password ? "danger" : "basic"}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={securePasswordEntry}
                  accessoryRight={
                    <PasswordFieldIcon
                      hidden={securePasswordEntry}
                      toggleSecureEntry={() => setSecurePasswordEntry(prev => !prev)}
                    />
                  }
                  caption={errors.password}
                />
                <Input
                  status={errors.confirmPassword ? "danger" : "basic"}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  style={styles.input}
                  placeholder="Repeat Password"
                  secureTextEntry={secureConfirmPasswordEntry}
                  accessoryRight={
                    <PasswordFieldIcon
                      hidden={secureConfirmPasswordEntry}
                      toggleSecureEntry={() => setSecureConfirmPasswordEntry(prev => !prev)}
                    />
                  }
                  caption={errors.confirmPassword}
                />
                <Button status="danger" style={styles.button}>Sign Up</Button>
                <Link href="/authentication/login">
                  <Text>If you already had an account, go to </Text><Text status="success">login</Text>
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
  button: {
    marginVertical: 5
  }
})