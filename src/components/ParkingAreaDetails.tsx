import { StyleSheet, Dimensions, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DbConnectionService } from "../database/DbConnectionService";
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

export default function ParkingAreaList(props: IParkingAreaDetailsList) {
  const {
    dbConnectionService,
    handleShowParkingAreaDetails,
    parkingAreaData,
    parkingAreaDetailsData,
    databaseError,
  } = props;
  const [favorite, setFavorite] = useState(0);
  const [trend, setTrend] = useState("");
  const showParkingAreaDetails = (showDetails: boolean) => {
    handleShowParkingAreaDetails(showDetails);
  };
  const [hours, setHours] = useState("");

  useEffect(() => {
    setFavorite(parkingAreaData.favorite);
    if (parkingAreaDetailsData.trend === -1) {
      setTrend(outputText.trendDown);
    } else if (parkingAreaDetailsData.trend === 0) {
      setTrend(outputText.trendNeutral);
    } else if (parkingAreaDetailsData.trend === 1) {
      setTrend(outputText.trendUp);
    }
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
              bodyText={[errorMessages.databaseProblem]}
            />
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
                bodyText={[errorMessages.closedText]}
              />
            ) : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.open}
                bodyText={[hours]}
              />
            )}

            {parkingAreaData.address === "" ||
            parkingAreaData.address === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.address}
                bodyText={[parkingAreaData.address]}
              />
            )}

            {parkingAreaData.doorHeight === "" ||
            parkingAreaData.doorHeight === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.doorHeight}
                bodyText={[
                  parkingAreaData.doorHeight + outputText.doorHeightText,
                ]}
              />
            )}

            {parkingAreaData.pricePerHour === "" ||
            parkingAreaData.pricePerHour === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={outputText.price}
                bodyText={[parkingAreaData.pricePerHour + outputText.priceText]}
              />
            )}

            <ParkingAreaDetailsItem
              errorStyle={false}
              headingText={outputText.lots}
              bodyText={[
                outputText.lotsAll + parkingAreaDetailsData.numberOfLots,
                outputText.lotsTaken + parkingAreaDetailsData.numberOfTakenLots,
                outputText.lotsFree + parkingAreaDetailsData.numberOfFreeLots,
                outputText.lotsTrend + trend,
              ]}
            />

            {parkingAreaDetailsData.status !== "OK" ? (
              <ParkingAreaDetailsItem
                errorStyle={true}
                headingText={outputText.currentStatus}
                bodyText={[parkingAreaDetailsData.status]}
              />
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
});
