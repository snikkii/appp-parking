import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../colors";

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
                color={colors.favoritePink}
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
    borderColor: colors.white,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
  },
  listText: {
    margin: 10,
    color: colors.backgroundGray,
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
