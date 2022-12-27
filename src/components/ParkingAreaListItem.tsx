import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IParkingAreaListItem {
  onPressFunction(id: number): void;
  id: number;
  name: string;
  favorite: number;
}

export default function ParkingAreaListItem(props: IParkingAreaListItem) {
  const { onPressFunction, id, name, favorite } = props;

  return (
    <View style={styles.listViewItem}>
      <TouchableOpacity onPress={() => onPressFunction(id)}>
        <View style={styles.parkingListItem}>
          <Text style={styles.listText}>
            {name}
            {favorite === 1 ? (
              <Ionicons
                style={styles.icons}
                name="ios-heart"
                size={25}
                color="#a66378"
                backgroundColor="transparent"
              />
            ) : undefined}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  listViewItem: {
    flexDirection: "column",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    padding: 10,
  },
  parkingListItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").height * 0.1,
    borderColor: "#fff",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
  },
  listText: {
    margin: 10,
    color: "#2e2d2d",
    fontSize: 25,
    alignItems: "center",
  },
  icons: {
    padding: 0,
    margin: 0,
    marginTop: 5,
    alignItems: "center",
  },
});
