import { Button, ButtonGroup, Input, Layout, Text } from "@ui-kitten/components";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerCreatePageLayout() {
  return (
    <>
      <SafeAreaView>
        <Layout style={styles.container}>
          <Text category="h1">New Customer</Text>
          <Input style={styles.input} label="Name" caption="Enter the name of the customer" />
          <Input style={styles.input} label="Email" caption="Enter the email of the customer" />
          <Input style={styles.input} label="Phone" caption="Enter the phone number of the customer" />
          <Input style={styles.input} label="Address" caption="Enter the address of the customer" />
          <Button style={styles.button} status="success">Save</Button>
          <Button style={styles.button} status="danger">Cancel</Button>
        </Layout>
      </SafeAreaView>
    </>
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