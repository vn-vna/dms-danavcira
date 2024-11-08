import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator'
import { Asset } from "expo-asset";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@Stores/hooks";
import EncryptedClient from "src/utils/encrypted-client";
import * as FileSystem from "expo-file-system";

interface ProductCreateFormData {
  name: string;
  price: string;
  unit: string;
  thumbnail?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const { pid } = useLocalSearchParams();
  const token = useAppSelector(state => state.authorization.token);
  const client = new EncryptedClient(token);

  const productQuery = useQuery({
    queryKey: ["products", pid],
    queryFn: async () => {
      const { payload, message } = await client.get(`/api/v1/products/${pid}`);

      if (payload) {
        return payload
      } else {
        throw new Error(message);
      }
    }
  })

  const updateProductMutation = useMutation({
    mutationFn: async (values: ProductCreateFormData) => {
      const { name, price, unit, thumbnail } = values;

      const response = await client.put(`/api/v1/products/${pid}`, { name, price, unit, thumbnail });

      return response;
    }
  })

  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      await client.delete(`/api/v1/products/${pid}`);
    }
  })

  if (productQuery.isLoading) {
    return (
      <Layout style={styles.container}>
        <Text>Loading...</Text>
      </Layout>
    )
  }

  if (updateProductMutation.isSuccess) {
    return (
      <Redirect href="/admin/products" />
    )
  }

  if (deleteProductMutation.isSuccess) {
    return (
      <Redirect href="/admin/products" />
    )
  }

  return (
    <SafeAreaView>
      <Layout style={styles.container}>
        <Formik
          initialValues={{
            name: productQuery.data.name,
            price: productQuery.data.price.toString(),
            unit: productQuery.data.unit,
            thumbnail: productQuery.data.thumbnail
          } as ProductCreateFormData}
          enableReinitialize
          validate={(values) => {
            if (!values.name) {
              return { name: "Name is required" };
            }

            if (!values.price) {
              return { price: "Price is required" };
            }

            if (!values.unit) {
              return { unit: "Unit is required" };
            }

            if (!values.thumbnail) {
              return { thumbnail: "Thumbnail is required" };
            }
          }}
          onSubmit={async (values) => {
            await updateProductMutation.mutateAsync(values);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <Layout>
              <Layout style={{ alignItems: "center" }}>
                <Pressable
                  onPress={async () => {
                    let result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.All,
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.5,
                    });

                    if (result.canceled) {
                      return;
                    }

                    const image = Asset.fromModule(result.assets[0].uri);
                    await image.downloadAsync();

                    const asset = await ImageManipulator.manipulateAsync(
                      result.assets[0].uri,
                      [
                        { resize: { width: 200, height: 200 } },
                      ],
                      { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
                    )

                    const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
                    handleChange("thumbnail")(base64);
                  }}
                  style={{ backgroundColor: "#0004", borderRadius: 10000 }}
                >
                  <Image
                    style={{ width: "70%", aspectRatio: 1, borderRadius: 10000 }}
                    source={`data:image/jpeg;charset=utf-8;base64,${values.thumbnail}`}
                    contentFit="cover"
                    transition={1000}
                  />
                </Pressable>
              </Layout>
              <Input
                label="Name"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                caption={errors.name}
              />
              <Input
                label="Price"
                value={values.price}
                onChangeText={handleChange("price")}
                onBlur={handleBlur("price")}
                caption={errors.price}
                inputMode="numeric"
              />
              <Input
                label="Unit"
                value={values.unit}
                onChangeText={handleChange("unit")}
                onBlur={handleBlur("unit")}
                caption={errors.unit}
              />

              <Button
                style={styles.buttons}
                onPress={() => handleSubmit()}
                status="success"
              >
                Save
              </Button>

              <Button
                style={styles.buttons}
                onPress={() => {
                  deleteProductMutation.mutate();
                }}
                status="danger"
              >
                Delete
              </Button>

              <Button
                style={styles.buttons}
                onPress={() => { router.push("/admin/products") }}
              >
                Cancel
              </Button>
            </Layout>
          )}
        </Formik>
      </Layout>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
  },
  buttons: {
    marginTop: 10,
  },
});