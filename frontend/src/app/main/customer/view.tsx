import { Text } from "@ui-kitten/components";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerViewPageLayout() {
  const { cid } = useLocalSearchParams();
  return (
    <SafeAreaView>
      <Text>Customer {cid as string}</Text>
    </SafeAreaView>
  )
}