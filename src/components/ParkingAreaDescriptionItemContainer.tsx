import { StyleSheet, Dimensions, Text, View } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors } from "../colors";

interface IParkingAreaDescriptionItemContainer {
  containerText: string;
  materialIconName?: keyof typeof MaterialIcons.glyphMap;
  secondMaterialIconName?: keyof typeof MaterialIcons.glyphMap;
  ioniconsIconName?: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export default function ParkingAreaDescriptionItemContainer(
  props: IParkingAreaDescriptionItemContainer
) {
  const {
    containerText,
    materialIconName,
    secondMaterialIconName,
    ioniconsIconName,
    iconColor,
  } = props;

  return (
    <View style={styles.item}>
      <View
        style={
          secondMaterialIconName === undefined
            ? undefined
            : styles.heightIconsContainer
        }
      >
        {materialIconName === undefined ? (
          <Ionicons
            name={ioniconsIconName}
            size={30}
            color={iconColor}
            backgroundColor="transparent"
          />
        ) : (
          <MaterialIcons
            name={materialIconName}
            size={30}
            color={iconColor}
            backgroundColor="transparent"
          />
        )}
        {secondMaterialIconName === undefined ? undefined : (
          <MaterialIcons
            name={secondMaterialIconName}
            size={30}
            color={iconColor}
            backgroundColor="transparent"
          />
        )}
      </View>
      <Text style={styles.text}>{containerText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "column",
    width: Dimensions.get("window").width * 0.16,
    height: Dimensions.get("window").height * 0.1,
    borderColor: colors.white,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  heightIconsContainer: {
    flexDirection: "row",
  },
  text: {
    color: colors.backgroundGray,
    fontSize: 13,
  },
});
