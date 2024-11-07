import { clearRole, clearToken } from "@Stores/authorization";
import { useAppDispatch, useAppSelector } from "@Stores/hooks";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, CircularProgressBar, Divider, Layout, List, ListItem, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EncryptedClient from "src/utils/encrypted-client";

export interface ProfilePageProps {
  name: string;
  username: string;
}

function AvatarPanel({ name, username }: ProfilePageProps) {
  return (
    <Layout style={styles.avatarLayout}>
      <Avatar style={styles.avatarIcon} source={require("@Assets/icon.png")} size="giant" />
      <Layout>
        <Text category="h6">{name ?? "User"}</Text>
        <Text>@{username ?? "username"}</Text>
      </Layout>
    </Layout>
  )
}

function TaskCompleted() {
  return (
    <Layout style={styles.taskCompletedLayout}>
      <Card style={styles.taskCard}>
        <CircularProgressBar progress={0.2} />
        <Text style={{ textAlign: "center" }}>Task 1</Text>
      </Card>
      <Card style={styles.taskCard}>
        <CircularProgressBar progress={10} />
        <Text style={{ textAlign: "center" }}>Task 2</Text>
      </Card>
      <Card style={styles.taskCard}>
        <CircularProgressBar progress={10} />
        <Text style={{ textAlign: "center" }}>Task 3</Text>
      </Card>
    </Layout>
  )
}

function SelectionPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const selects = [
    {
      title: "Tasks",
      description: "View your tasks",
      action: () => {

      }
    },
    {
      title: "Users",
      description: "User management",
      action: () => {

      }
    },
    {
      title: "Change Password",
      description: "Change your password",
      action: () => {
        
      }
    },
    {
      title: "Help",
      description: "Get help",
      action: () => {

      }
    },
    {
      title: "Logout",
      description: "Logout from your account",
      action: () => {
        dispatch(clearToken());
        dispatch(clearRole());
        router.navigate("/authentication");
      }
    }
  ]

  return (
    <Layout style={styles.taskCompletedLayout}>
      <List
        data={selects}
        renderItem={
          ({ item: { title, description, action } }) => (
            <ListItem
              title={title}
              description={description}
              onPress={() => {
                action?.();
              }}
            />
          )
        }
      />
    </Layout>
  )
}

export default function ProfilePage() {
  const token = useAppSelector((state) => state.authorization.token);

  const client = new EncryptedClient(token);

  const userDataQuery = useQuery({
    queryKey: ["user", "search"],
    queryFn: async () => {
      const { payload } = await client.get("/api/v1/users/me");
      return payload;
    }
  });

  if (userDataQuery.isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <SafeAreaView>
      <Layout style={styles.layout}>
        <AvatarPanel
          name={userDataQuery.data.result.firstname + " " + userDataQuery.data.result.lastname}
          username={userDataQuery.data.result.username} />
        <Divider />
        <Text category="h6">Task Completed</Text>
        <TaskCompleted />
        <Divider />
        <SelectionPanel />
      </Layout>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  layout: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 5,
  },
  avatarLayout: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  taskCompletedLayout: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    margin: 10
  },
  taskCard: {
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  }
})