import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { DbConnectionService } from "../database/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import { IEventData } from "../models/IEventData";
import { errorMessages, outputText } from "../strings";
import { colors } from "../colors";
import ParkingAreaDescriptionItemContainer from "./ParkingAreaDescriptionItemContainer";

interface IParkingAreaDescription {
  dbConnectionService: DbConnectionService;
  id: number;
  latUser: number;
  longUser: number;
  geofenceEventData: IEventData[];
  handleShowParkingAreaDescription(parkingAreaDescription: boolean): void;
  handleParkingAreaDetails(parkingAreaDetails: boolean): void;
  handleParkingAreaData(parkingAreaData: IParkingArea): void;
  handleParkingAreaDetailData(parkingAreaDetails: IParkingAreaDetails): void;
  handleDataBaseError(databaseError: boolean): void;
}

export default function ParkingAreaDescription(props: IParkingAreaDescription) {
  const {
    dbConnectionService,
    id,
    latUser,
    longUser,
    geofenceEventData,
    handleShowParkingAreaDescription,
    handleParkingAreaDetails,
    handleParkingAreaData,
    handleParkingAreaDetailData,
    handleDataBaseError,
  } = props;
  const [parkingAreaData, setParkingAreaData] = useState({} as IParkingArea);
  const [parkingAreaDetailsData, setParkingAreaDetailsData] = useState(
    {} as IParkingAreaDetails
  );
  const [databaseError, setDatabaseError] = useState(false);
  const [favorite, setFavorite] = useState(0);
  const [showLetsGoButton, sethowLetsGoButton] = useState(false);

  const fetchDataFromTable = async () => {
    try {
      let parkingAreas = (await dbConnectionService.getDataFromParkingAreaTable(
        id
      )) as IParkingArea;

      let parkingAreaDetails =
        (await dbConnectionService.getDataFromParkingAreaDetailsTable(
          id
        )) as IParkingAreaDetails;

      setParkingAreaData(parkingAreas);
      setParkingAreaDetailsData(parkingAreaDetails);
      setFavorite(parkingAreas.favorite);
      setDatabaseError(false);

      if (parkingAreaDetails.dateOfData === "keine Daten") {
        Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
        showParkingAreaDescription(false);
      }
    } catch (error) {
      console.error(error);
      setDatabaseError(true);
    }
  };

  const setFavoriteParkingArea = (favorite: number) => {
    try {
      dbConnectionService.setFavoriteParkingArea(
        favorite,
        parkingAreaData.name
      );
      setFavorite(favorite);
      if (favorite == 1) {
        Toast.show(outputText.successAddedToFavorites, {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      } else if (favorite == 0) {
        Toast.show(outputText.failAddedToFavorites, {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
    }
  };

  const handleParkingAreaDetailsData = (showDetails: boolean) => {
    handleDataBaseError(databaseError);
    handleParkingAreaData(parkingAreaData);
    handleParkingAreaDetailData(parkingAreaDetailsData);
    handleParkingAreaDetails(showDetails);
  };

  const showParkingAreaDescription = (showDescription: boolean) => {
    handleShowParkingAreaDescription(showDescription);
  };

  const requestSwitchingApps = () => {
    Alert.alert(
      outputText.navigationTitle,
      Platform.OS === outputText.platform
        ? outputText.navigationBodyIos
        : outputText.navigationBodyAndroid,
      [
        {
          text: outputText.cancelText,
          style: "cancel",
        },
        { text: outputText.okayText, onPress: navigateToParkingArea },
      ]
    );
  };

  const navigateToParkingArea = () => {
    const destination = `${parkingAreaData.lat},${parkingAreaData.long}`;
    const company =
      Platform.OS === outputText.platform
        ? outputText.apple
        : outputText.google;
    Linking.openURL(`https://maps.${company}.com/maps?daddr=${destination}`);
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [id, handleParkingAreaDetails]);

  useEffect(() => {
    geofenceEventData.map((parkingArea: IEventData) => {
      if (parkingArea.parkingAreaName === parkingAreaData.name) {
        sethowLetsGoButton(parkingArea.enteredParkingArea);
      }
    });
  });

  return (
    <View style={styles.container}>
      {databaseError ? (
        <View style={styles.warningContainer}>
          <View style={styles.headingContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.heading}>Achtung!</Text>
              <Ionicons.Button
                style={styles.favoriteIcons}
                name="ios-warning"
                size={25}
                color={colors.white}
                backgroundColor="transparent"
              />
            </View>
            <Ionicons.Button
              style={styles.headingIcon}
              name="close-circle"
              size={30}
              color={colors.white}
              backgroundColor="transparent"
              onPress={() => showParkingAreaDescription(false)}
            />
          </View>
          <Text style={styles.text}>{errorMessages.databaseProblem}</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.headingContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.heading}>{parkingAreaData.name}</Text>

              {favorite === 1 ? (
                <Ionicons.Button
                  style={styles.favoriteIcons}
                  name="ios-heart"
                  size={25}
                  color={colors.favoritePink}
                  backgroundColor="transparent"
                  onPress={() => setFavoriteParkingArea(0)}
                />
              ) : (
                <Ionicons.Button
                  style={styles.favoriteIcons}
                  name="ios-heart-outline"
                  size={25}
                  color={colors.favoritePink}
                  backgroundColor="transparent"
                  onPress={() => setFavoriteParkingArea(1)}
                />
              )}
            </View>
            <Ionicons.Button
              style={styles.headingIcon}
              name="close-circle"
              size={30}
              color={colors.white}
              backgroundColor="transparent"
              onPress={() => showParkingAreaDescription(false)}
            />
          </View>
          <View style={styles.itemContainer}>
            {parkingAreaDetailsData.trend === 0 ? (
              <ParkingAreaDescriptionItemContainer
                containerText={
                  parkingAreaDetailsData.numberOfFreeLots + outputText.freeLots
                }
                materialIconName="trending-neutral"
                iconColor={colors.trendNeutral}
              />
            ) : undefined}
            {parkingAreaDetailsData.trend === -1 ? (
              <ParkingAreaDescriptionItemContainer
                containerText={
                  parkingAreaDetailsData.numberOfFreeLots + outputText.freeLots
                }
                materialIconName="trending-down"
                iconColor={colors.trendDown}
              />
            ) : undefined}
            {parkingAreaDetailsData.trend === 1 ? (
              <ParkingAreaDescriptionItemContainer
                containerText={
                  parkingAreaDetailsData.numberOfFreeLots + outputText.freeLots
                }
                materialIconName="trending-up"
                iconColor={colors.warningRed}
              />
            ) : undefined}

            <ParkingAreaDescriptionItemContainer
              containerText={parkingAreaData.pricePerHour + outputText.perHour}
              materialIconName="euro"
              iconColor={colors.backgroundGray}
            />

            <ParkingAreaDescriptionItemContainer
              containerText={parkingAreaData.openingHours + outputText.hour}
              ioniconsIconName="ios-time"
              iconColor={colors.backgroundGray}
            />

            {parkingAreaData.doorHeight === "" ? undefined : (
              <ParkingAreaDescriptionItemContainer
                containerText={parkingAreaData.doorHeight + outputText.meters}
                materialIconName="height"
                secondMaterialIconName="directions-car"
                iconColor={colors.backgroundGray}
              />
            )}
            <TouchableOpacity
              onPress={() => handleParkingAreaDetailsData(true)}
            >
              <ParkingAreaDescriptionItemContainer
                containerText={outputText.more}
                materialIconName="more-horiz"
                iconColor={colors.backgroundGray}
              />
            </TouchableOpacity>
          </View>
          {showLetsGoButton === true ? (
            <TouchableOpacity onPress={requestSwitchingApps}>
              <View style={styles.navigateItem}>
                <MaterialIcons
                  name="directions"
                  size={30}
                  color={colors.backgroundGray}
                  backgroundColor="transparent"
                />
                <Text style={styles.text}>{outputText.letsGo}</Text>
              </View>
            </TouchableOpacity>
          ) : undefined}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundGray,
    alignItems: "center",
    justifyContent: "flex-start",
    height: Dimensions.get("window").height * 0.3,
  },
  warningContainer: {
    backgroundColor: colors.warningRed,
    alignItems: "center",
    justifyContent: "flex-start",
    height: Dimensions.get("window").height * 0.3,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  navigateItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.05,
    borderColor: colors.okayGreen,
    backgroundColor: colors.okayGreen,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.backgroundGray,
    fontSize: 13,
  },
  headingContainer: {
    flexDirection: "row",
    paddingTop: 0,
    justifyContent: "flex-start",
  },
  nameContainer: {
    width: Dimensions.get("window").width * 0.9,
    flexDirection: "row",
    paddingTop: 0,
    justifyContent: "flex-start",
  },
  favoriteIcons: {
    marginLeft: 0,
    marginTop: 7,
  },
  headingIcon: {
    width: Dimensions.get("window").width * 0.15,
    margin: 0,
    marginTop: 5,
    marginRight: 0,
    color: colors.white,
  },
  heading: {
    marginLeft: 30,
    marginTop: 15,
    marginBottom: 15,
    marginRight: 0,
    color: colors.white,
    fontSize: 25,
  },
});
