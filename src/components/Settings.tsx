import { StyleSheet, Text, Dimensions, View } from "react-native";

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Einstellungen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.1,
    paddingTop: 50,
    paddingRight: 20,
    justifyContent: "flex-end",
  },
  text: {
    color: "#fff",
  },
});
