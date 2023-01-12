import { StyleSheet, Dimensions, View, Alert, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DbConnectionService } from "../services/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { useEffect, useState } from "react";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";
import Toast from "react-native-root-toast";
import ParkingAreaListHeading from "./ParkingAreaListHeading";
import ParkingAreaDetailsItem from "./ParkingAreaDetailsItem";
import { errorMessages, outputText } from "../strings";
import { colors } from "../colors";

interface IParkingAreaDetailsList {
  dbConnectionService: DbConnectionService;
  handleShowParkingAreaDetails(parkingAreaDetails: boolean): void;
  parkingAreaData: IParkingArea;
  parkingAreaDetailsData: IParkingAreaDetails;
  databaseError: boolean;
}

export default function ParkingAreaDetails(props: IParkingAreaDetailsList) {
  const {
    dbConnectionService,
    handleShowParkingAreaDetails,
    parkingAreaData,
    parkingAreaDetailsData,
    databaseError,
  } = props;
  const [favorite, setFavorite] = useState(0);
  const showParkingAreaDetails = (showDetails: boolean) => {
    handleShowParkingAreaDetails(showDetails);
  };
  const [hours, setHours] = useState("");

  useEffect(() => {
    setFavorite(parkingAreaData.favorite);
    if (parkingAreaData.openingHours === undefined) {
      setHours("");
    } else {
      setHours(parkingAreaData.openingHours.toString() + outputText.openedText);
    }
  }, [parkingAreaData]);

  const setFavoriteParkingArea = (favorite: number) => {
    try {
      dbConnectionService.setFavoriteParkingArea(
        favorite,
        parkingAreaData.name
      );
      setFavorite(favorite);
      if (favorite == 1) {
        Toast.show(parkingAreaData.name + outputText.successAddedToFavorites, {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      } else if (favorite == 0) {
        Toast.show(parkingAreaData.name + outputText.failAddedToFavorites, {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {databaseError ? (
        <View style={styles.container}>
          <View style={styles.outerHeadingContainer}>
            <ParkingAreaListHeading
              arrowBackFunction={showParkingAreaDetails}
              headingText={errorMessages.attention}
            />
            <Ionicons.Button
              style={styles.icons}
              name="ios-warning"
              size={40}
              color={colors.white}
              backgroundColor="transparent"
            />
          </View>
          <View style={styles.listContainer}>
            <ParkingAreaDetailsItem
              errorStyle={true}
              headingText={errorMessages.attentionText}
            >
              <Text style={styles.listText}>
                {errorMessages.databaseProblem}
              </Text>
            </ParkingAreaDetailsItem>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.outerHeadingContainer}>
            <ParkingAreaListHeading
              arrowBackFunction={showParkingAreaDetails}
              headingText={parkingAreaData.name}
            />

            {favorite === 1 ? (
              <Ionicons.Button
                style={styles.icons}
                name="ios-heart"
                size={40}
                color={colors.favoritePink}
                backgroundColor="transparent"
                onPress={() => setFavoriteParkingArea(0)}
              />
            ) : (
              <Ionicons.Button
                style={styles.icons}
                name="ios-heart-outline"
                size={40}
                color={colors.favoritePink}
                backgroundColor="transparent"
                onPress={() => setFavoriteParkingArea(1)}
              />
            )}
          </View>

          <View style={styles.listContainer}>
            {parkingAreaDetailsData.closed === 1 ? (
              <ParkingAreaDetailsItem
                errorStyle={true}
                headingText={outputText.closed}
              >
                <Text style={styles.listText}>{errorMessages.closedText}</Text>
              </ParkingAreaDetailsItem>
            ) : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.open}
              >
                <Text style={styles.listText}>{hours}</Text>
              </ParkingAreaDetailsItem>
            )}

            {parkingAreaData.address === "" ||
            parkingAreaData.address === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.address}
              >
                <Text style={styles.listText}>{parkingAreaData.address}</Text>
              </ParkingAreaDetailsItem>
            )}

            {parkingAreaData.doorHeight === "" ||
            parkingAreaData.doorHeight === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.doorHeight}
              >
                <Text style={styles.listText}>
                  {parkingAreaData.doorHeight + outputText.doorHeightText}
                </Text>
              </ParkingAreaDetailsItem>
            )}

            {parkingAreaData.pricePerHour === "" ||
            parkingAreaData.pricePerHour === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.price}
              >
                <Text style={styles.listText}>
                  {parkingAreaData.pricePerHour + outputText.priceText}
                </Text>
              </ParkingAreaDetailsItem>
            )}

            <ParkingAreaDetailsItem
              errorStyle={false}
              headingText={outputText.lots}
            >
              <Text style={styles.listText}>
                {outputText.lotsAll + parkingAreaDetailsData.numberOfLots}
              </Text>
              <Text style={styles.listText}>
                {outputText.lotsTaken +
                  parkingAreaDetailsData.numberOfTakenLots}
              </Text>
              <Text style={styles.listText}>
                {outputText.lotsFree + parkingAreaDetailsData.numberOfFreeLots}
              </Text>
              {parkingAreaDetailsData.trend === 1 && (
                <Text style={styles.listText}>
                  {outputText.lotsTrend + outputText.trendUp}
                </Text>
              )}
              {parkingAreaDetailsData.trend === 0 && (
                <Text style={styles.listText}>
                  {outputText.lotsTrend + outputText.trendNeutral}
                </Text>
              )}
              {parkingAreaDetailsData.trend === -1 && (
                <Text style={styles.listText}>
                  {outputText.lotsTrend + outputText.trendDown}
                </Text>
              )}
            </ParkingAreaDetailsItem>

            {parkingAreaDetailsData.status !== "OK" ? (
              <ParkingAreaDetailsItem
                errorStyle={true}
                headingText={outputText.currentStatus}
              >
                <Text style={styles.listText}>
                  {parkingAreaDetailsData.status}
                </Text>
              </ParkingAreaDetailsItem>
            ) : undefined}
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  outerContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: colors.backgroundGray,
    position: "absolute",
  },
  container: {
    flexDirection: "column",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    borderColor: colors.detailsGrey,
    backgroundColor: colors.detailsGrey,
    borderWidth: 2,
    borderRadius: 10,
  },
  outerHeadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icons: {
    padding: 0,
    marginLeft: 10,
    alignItems: "center",
  },
  listContainer: {
    flexDirection: "column",
    margin: 5,
    padding: 10,
    marginBottom: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  listText: {
    color: colors.white,
    fontSize: 20,
    alignItems: "flex-start",
  },
});
