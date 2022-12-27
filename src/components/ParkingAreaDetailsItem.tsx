import { StyleSheet, Text, Dimensions, View } from "react-native";

interface IParkingAreaDetailsItem {
  errorStyle: boolean;
  headingText: string;
  bodyText: string[];
}

export default function ParkingAreaDetailsItem(props: IParkingAreaDetailsItem) {
  const { errorStyle, headingText, bodyText } = props;

  return (
    <View style={styles.itemContainer}>
      <View
        style={errorStyle ? styles.listViewItemNotGood : styles.listViewItem}
      >
        <View style={styles.listItem}>
          <Text style={errorStyle ? styles.listHeadingAlt : styles.listHeading}>
            {headingText}
          </Text>
        </View>
        <View style={styles.listItem}>
          {bodyText.map((text: string) => (
            <Text key={text} style={styles.listText}>
              {text}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "column",
    width: Dimensions.get("window").width * 0.9,
  },
  listViewItemNotGood: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    margin: 5,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#fd526c",
    backgroundColor: "#fd526c",
    padding: 10,
  },
  listViewItem: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    margin: 5,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#7b7a7a",
    backgroundColor: "#7b7a7a",
    padding: 10,
  },
  listItem: {
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  listHeadingAlt: {
    color: "#d2d0d0",
    fontSize: 15,
    alignItems: "flex-start",
  },
  listHeading: {
    color: "#a2cfcd",
    fontSize: 15,
    alignItems: "flex-start",
  },
  listText: {
    color: "#fff",
    fontSize: 20,
    alignItems: "flex-start",
  },
});
