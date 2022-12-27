import { StyleSheet, Dimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DbConnectionService } from "../database/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { useEffect, useState } from "react";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";
import Toast from "react-native-root-toast";
import ParkingAreaListHeading from "./ParkingAreaListHeading";
import ParkingAreaDetailsItem from "./ParkingAreaDetailsItem";

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

  useEffect(() => {
    setFavorite(parkingAreaData.favorite);
    if (parkingAreaDetailsData.trend === -1) {
      setTrend("Fallend");
    } else if (parkingAreaDetailsData.trend === 0) {
      setTrend("Gleichbleibend");
    } else if (parkingAreaDetailsData.trend === 1) {
      setTrend("Steigend");
    }
  }, [parkingAreaData]);

  const setFavoriteParkingArea = (favorite: number) => {
    dbConnectionService.setFavoriteParkingArea(favorite, parkingAreaData.name);
    setFavorite(favorite);
    if (favorite == 1) {
      Toast.show("Parkhaus erfolgreich zu Favoriten hinzugefügt!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } else if (favorite == 0) {
      Toast.show("Parkhaus erfolgreich von Favoriten entfernt!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  return (
    <View>
      {databaseError ? (
        <View style={styles.container}>
          <View style={styles.outerHeadingContainer}>
            <ParkingAreaListHeading
              arrowBackFunction={showParkingAreaDetails}
              headingText={"Achtung!"}
            />
            <Ionicons.Button
              style={styles.icons}
              name="ios-warning"
              size={40}
              color="#fff"
              backgroundColor="transparent"
            />
          </View>
          <View style={styles.listContainer}>
            <ParkingAreaDetailsItem
              errorStyle={true}
              headingText={"Fehler"}
              bodyText={["Die Daten konnten nicht angerufen werden."]}
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
                color="#a66378"
                backgroundColor="transparent"
                onPress={() => setFavoriteParkingArea(0)}
              />
            ) : (
              <Ionicons.Button
                style={styles.icons}
                name="ios-heart-outline"
                size={40}
                color="#a66378"
                backgroundColor="transparent"
                onPress={() => setFavoriteParkingArea(1)}
              />
            )}
          </View>

          <View style={styles.listContainer}>
            {parkingAreaDetailsData.closed === 1 ? (
              <ParkingAreaDetailsItem
                errorStyle={true}
                headingText={"Geschlossen"}
                bodyText={[
                  "Parkhaus ist derzeit geschlossen und kann nicht befahren werden.",
                ]}
              />
            ) : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={"Geöffnet"}
                bodyText={[parkingAreaData.openingHours + " Stunden"]}
              />
            )}

            {parkingAreaData.address === "" ||
            parkingAreaData.address === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={"Einfahrt über"}
                bodyText={[parkingAreaData.address]}
              />
            )}

            {parkingAreaData.doorHeight === "" ||
            parkingAreaData.doorHeight === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={"Einfahrtshöhe"}
                bodyText={[parkingAreaData.doorHeight + "m"]}
              />
            )}

            {parkingAreaData.pricePerHour === "" ||
            parkingAreaData.pricePerHour === undefined ? undefined : (
              <ParkingAreaDetailsItem
                errorStyle={false}
                headingText={"Kosten pro Stunde"}
                bodyText={[parkingAreaData.pricePerHour + "€"]}
              />
            )}

            <ParkingAreaDetailsItem
              errorStyle={false}
              headingText={"Parkplätze"}
              bodyText={[
                "Gesamt: " + parkingAreaDetailsData.numberOfLots,
                "Belegt: " + parkingAreaDetailsData.numberOfTakenLots,
                "Frei: " + parkingAreaDetailsData.numberOfFreeLots,
                "Trend: " + trend,
              ]}
            />

            {parkingAreaDetailsData.status !== "OK" ? (
              <ParkingAreaDetailsItem
                errorStyle={true}
                headingText={"Aktueller Status"}
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
  container: {
    flexDirection: "column",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    borderColor: "#535252",
    backgroundColor: "#535252",
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
