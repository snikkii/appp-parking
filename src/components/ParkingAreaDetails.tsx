import { StyleSheet, Text, Dimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DbConnectionService } from "../database/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { useEffect, useState } from "react";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";

interface IParkingAreaDetailsList {
  dbConnectionService: DbConnectionService;
  handleShowParkingAreaDetails(parkingAreaDetails: boolean): void;
  parkingAreaId: number;
}

export default function ParkingAreaList(props: IParkingAreaDetailsList) {
  const { dbConnectionService, handleShowParkingAreaDetails, parkingAreaId } =
    props;
  const [parkingAreaData, setParkingAreaData] = useState({} as IParkingArea);
  const [parkingAreaDetailsData, setParkingAreaDetailsData] = useState(
    {} as IParkingAreaDetails
  );
  const [databaseError, setDatabaseError] = useState(false);
  const [currentTrend, setCurrentTrend] = useState("");
  const [closed, setClosed] = useState("");
  const [favorite, setFavorite] = useState(0);
  const showParkingAreaDetails = (showDetails: boolean) => {
    handleShowParkingAreaDetails(showDetails);
  };

  const fetchDataFromTable = async () => {
    try {
      let parkingAreas = (await dbConnectionService.getDataFromParkingAreaTable(
        parkingAreaId
      )) as IParkingArea;

      let parkingAreaDetails =
        (await dbConnectionService.getDataFromParkingAreaDetailsTable(
          parkingAreaId
        )) as IParkingAreaDetails;

      if (parkingAreaDetails.trend == 0) {
        setCurrentTrend("Gleichbleibend");
      } else if (parkingAreaDetails.trend == 1) {
        setCurrentTrend("Steigend");
      } else if (parkingAreaDetails.trend == -1) {
        setCurrentTrend("Fallend");
      }

      if (parkingAreaDetails.closed == 0) {
        setClosed("Geöffnet");
      } else if (parkingAreaDetails.closed == 1) {
        setClosed("Geschlossen");
      }
      setFavorite(parkingAreas.favorite);

      setParkingAreaData(parkingAreas);
      setParkingAreaDetailsData(parkingAreaDetails);
      setDatabaseError(false);
    } catch (error) {
      console.error(error);
      setDatabaseError(true);
    }
  };

  const setFavoriteParkingArea = (favorite: number) => {
    dbConnectionService.setFavoriteParkingArea(favorite, parkingAreaData.name);
    setFavorite(favorite);
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [parkingAreaId]);

  return (
    <View style={styles.container}>
      {!databaseError ? (
        <View>
          <View style={styles.headingContainer}>
            <Ionicons.Button
              style={styles.headingIcon}
              name="ios-arrow-back"
              size={40}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => showParkingAreaDetails(false)}
            />
            <Text style={styles.heading}>
              {parkingAreaData.name}
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
            </Text>
          </View>

          <View style={styles.listContainer}>
            <View style={styles.itemContainer}>
              <View
                style={
                  parkingAreaDetailsData.closed === 1
                    ? styles.listViewItemNotGood
                    : styles.listViewItem
                }
              >
                <View style={styles.listItem}>
                  <Text
                    style={
                      parkingAreaDetailsData.closed === 1
                        ? styles.listHeadingAlt
                        : styles.listHeading
                    }
                  >
                    {closed}
                  </Text>
                </View>
                {parkingAreaDetailsData.closed === 1 ? (
                  <View style={styles.listItem}>
                    <Text style={styles.listText}>
                      Parkhaus ist derzeit geschlossen und kann nicht befahren
                      werden.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.listItem}>
                    <Text style={styles.listText}>
                      {parkingAreaData.openingHours} Stunden
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {parkingAreaData.address === "" ||
            parkingAreaData.address === undefined ? undefined : (
              <View style={styles.itemContainer}>
                <View style={styles.listViewItem}>
                  <View style={styles.listItem}>
                    <Text style={styles.listHeading}>Einfahrt über</Text>
                  </View>
                  <View style={styles.listItem}>
                    <Text style={styles.listText}>
                      {parkingAreaData.address}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {parkingAreaData.doorHeight === "" ? undefined : (
              <View style={styles.itemContainer}>
                <View style={styles.listViewItem}>
                  <View style={styles.listItem}>
                    <Text style={styles.listHeading}>Einfahrtshöhe</Text>
                  </View>
                  <View style={styles.listItem}>
                    <Text style={styles.listText}>
                      {parkingAreaData.doorHeight}m
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.itemContainer}>
              <View style={styles.listViewItem}>
                <View style={styles.listItem}>
                  <Text style={styles.listHeading}>Kosten pro Stunde</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listText}>
                    {parkingAreaData.pricePerHour}€
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.itemContainer}>
              <View style={styles.listViewItem}>
                <View style={styles.listItem}>
                  <Text style={styles.listHeading}>Parkplätze</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listText}>
                    Gesamt: {parkingAreaDetailsData.numberOfLots}
                  </Text>
                  <Text style={styles.listText}>
                    Belegt: {parkingAreaDetailsData.numberOfTakenLots}
                  </Text>
                  <Text style={styles.listText}>
                    Frei: {parkingAreaDetailsData.numberOfFreeLots}
                  </Text>
                  <Text style={styles.listText}>Trend: {currentTrend}</Text>
                </View>
              </View>
            </View>

            {parkingAreaDetailsData.status === "OK" ? undefined : (
              <View style={styles.itemContainer}>
                <View style={styles.listViewItemNotGood}>
                  <View style={styles.listItem}>
                    <Text style={styles.listHeadingAlt}>Aktueller Status</Text>
                  </View>
                  <View style={styles.listItem}>
                    <Text style={styles.listText}>
                      {parkingAreaDetailsData.status}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.headingContainer}>
            <Ionicons.Button
              style={styles.headingIcon}
              name="ios-arrow-back"
              size={40}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => showParkingAreaDetails(false)}
            />
            <Text style={styles.heading}>
              Achtung!
              <Ionicons.Button
                style={styles.icons}
                name="ios-warning"
                size={40}
                color="#fff"
                backgroundColor="transparent"
              />
            </Text>
          </View>
          <View style={styles.listContainer}>
            <View style={styles.itemContainer}>
              <View style={styles.listViewItemNotGood}>
                <View style={styles.listItem}>
                  <Text style={styles.listHeadingAlt}>Error</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listText}>
                    Es ist ein Fehler aufgetreten. Bitte App neu starten!
                  </Text>
                </View>
              </View>
            </View>
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
  headingContainer: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.2,
    justifyContent: "center",
  },
  headingIcon: {
    width: Dimensions.get("window").width * 0.2,
    marginTop: 80,
    marginLeft: 40,
    fontSize: 43,
  },
  heading: {
    marginTop: 75,
    width: Dimensions.get("window").width * 0.8,
    color: "#fff",
    fontSize: 35,
  },
  icons: {
    padding: 0,
    marginLeft: 10,
    marginTop: 5,
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
  listHeading: {
    color: "#a2cfcd",
    fontSize: 15,
    alignItems: "flex-start",
  },
  listHeadingAlt: {
    color: "#d2d0d0",
    fontSize: 15,
    alignItems: "flex-start",
  },
  listText: {
    color: "#fff",
    fontSize: 20,
    alignItems: "flex-start",
  },
});
