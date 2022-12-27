import { StyleSheet, Text, Dimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DbConnectionService } from "../database/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { useState } from "react";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";
import Toast from "react-native-root-toast";

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
  const [favorite, setFavorite] = useState(parkingAreaData.favorite);
  const showParkingAreaDetails = (showDetails: boolean) => {
    handleShowParkingAreaDetails(showDetails);
  };

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
            <View style={styles.headingContainer}>
              <Ionicons.Button
                style={styles.headingIcon}
                name="ios-arrow-back"
                size={40}
                color="#fff"
                backgroundColor="transparent"
                onPress={() => showParkingAreaDetails(false)}
              />
              <Text style={styles.heading}>Achtung!</Text>

              <Ionicons.Button
                style={styles.icons}
                name="ios-warning"
                size={40}
                color="#fff"
                backgroundColor="transparent"
                onPress={() => setFavoriteParkingArea(0)}
              />
            </View>
            <View style={styles.listContainer}>
              <View style={styles.itemContainer}>
                <View style={styles.listViewItemNotGood}>
                  <View style={styles.listItem}>
                    <Text style={styles.listHeadingAlt}>Fehler</Text>
                  </View>
                  <View style={styles.listItem}>
                    <Text style={styles.listText}>
                      Die Daten konnten nicht abgerufen werden.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.outerHeadingContainer}>
            <View style={styles.headingContainer}>
              <Ionicons.Button
                style={styles.headingIcon}
                name="ios-arrow-back"
                size={40}
                color="#fff"
                backgroundColor="transparent"
                onPress={() => showParkingAreaDetails(false)}
              />
              <Text style={styles.heading}>{parkingAreaData.name}</Text>

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
              <View style={styles.itemContainer}>
                <View
                  style={
                    parkingAreaDetailsData.closed === 1
                      ? styles.listViewItemNotGood
                      : styles.listViewItem
                  }
                >
                  <View style={styles.listItem}>
                    {parkingAreaDetailsData.closed === 1 ? (
                      <Text style={styles.listHeadingAlt}>Geschlossen</Text>
                    ) : (
                      <Text style={styles.listHeading}>Geöffnet</Text>
                    )}
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
                    {parkingAreaDetailsData.trend === -1 ? (
                      <Text style={styles.listText}>Trend: Fallend</Text>
                    ) : undefined}
                    {parkingAreaDetailsData.trend === 0 ? (
                      <Text style={styles.listText}>Trend: Gleichbleibend</Text>
                    ) : undefined}
                    {parkingAreaDetailsData.trend === 1 ? (
                      <Text style={styles.listText}>Trend: Steigend</Text>
                    ) : undefined}
                  </View>
                </View>
              </View>

              {parkingAreaDetailsData.status !== "OK" ? (
                <View style={styles.itemContainer}>
                  <View style={styles.listViewItemNotGood}>
                    <View style={styles.listItem}>
                      <Text style={styles.listHeadingAlt}>
                        Aktueller Status
                      </Text>
                    </View>
                    <View style={styles.listItem}>
                      <Text style={styles.listText}>
                        {parkingAreaDetailsData.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : undefined}
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
  outerHeadingContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  headingContainer: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  headingIcon: {
    width: Dimensions.get("window").width * 0.2,
    marginBottom: 0,
    marginLeft: 40,
    fontSize: 43,
  },
  heading: {
    width: Dimensions.get("window").width * 0.6,
    height: Dimensions.get("window").height * 0.1,
    marginTop: 35,
    color: "#fff",
    fontSize: 30,
  },
  icons: {
    padding: 0,
    paddingRight: 10,
    marginRight: 30,
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
