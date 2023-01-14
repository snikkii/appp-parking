import { StyleSheet, Text, Dimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../colors";

interface IParkingAreaListHeading {
  arrowBackFunction(showView: boolean): void;
  headingText: string;
}

// Diese Komponente zeigt jeweils die Überschirft in der ParkingAreaList und den ParkingAreaDetails an.
export default function ParkingAreaListHeading(props: IParkingAreaListHeading) {
  const { arrowBackFunction, headingText } = props;

  return (
    <View style={styles.headingContainer}>
      <Ionicons.Button
        style={styles.headingIcon}
        name="ios-arrow-back"
        size={40}
        color={colors.white}
        backgroundColor="transparent"
        onPress={() => arrowBackFunction(false)}
      />
      <Text style={styles.heading}>{headingText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").height * 0.1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  headingIcon: {
    width: Dimensions.get("window").width * 0.2,
    marginBottom: 0,
    marginLeft: 10,
    fontSize: 43,
  },
  heading: {
    width: Dimensions.get("window").width * 0.6,
    height: Dimensions.get("window").height * 0.1,
    marginTop: 35,
    color: colors.white,
    fontSize: 30,
  },
});
