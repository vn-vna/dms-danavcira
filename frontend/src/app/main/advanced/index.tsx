import { Avatar, Card, CircularProgressBar, Divider, Layout, List, ListItem, Text } from "@ui-kitten/components";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function AvatarPanel() {
  return (
    <Layout style={styles.avatarLayout}>
      <Avatar style={styles.avatarIcon} source={require("@Assets/icon.png")} size="giant" />
      <Layout>
        <Text category="h6">VNVNA</Text>
        <Text>@vnvna</Text>
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
  const selects = [
    { title: "Tasks", description: "View your tasks" },
    { title: "Completed", description: "View your completed tasks" },
    { title: "Settings", description: "Change your settings" },
    { title: "Change Password", description: "Change your password" },
    { title: "Help", description: "Get help" },
    { title: "Logout", description: "Logout from your account" }
  ]

  return (
    <Layout style={styles.taskCompletedLayout}>
      <List
        data={selects}
        renderItem={
          ({ item: { title, description } }) => (
            <ListItem title={title} description={description} />
          )
        }
      />
    </Layout>
  )
}

export default function ProfilePage() {
  return (
    <SafeAreaView>
      <Layout style={styles.layout}>
        <AvatarPanel />
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