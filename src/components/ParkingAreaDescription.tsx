import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { DbConnectionService } from "../database/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";

interface IParkingAreaDescription {
  dbConnectionService: DbConnectionService;
  id: number;
  latUser: number;
  longUser: number;
  showLetsGo: string;
  handleShowParkingAreaDescription(parkingAreaDescription: boolean): void;
  handleParkingAreaDetails(parkingAreaDetails: boolean): void;
}

export default function ParkingAreaDescription(props: IParkingAreaDescription) {
  const {
    dbConnectionService,
    id,
    latUser,
    longUser,
    showLetsGo,
    handleShowParkingAreaDescription,
    handleParkingAreaDetails,
  } = props;
  const [parkingAreaData, setParkingAreaData] = useState({} as IParkingArea);
  const [parkingAreaDetailsData, setParkingAreaDetailsData] = useState(
    {} as IParkingAreaDetails
  );
  const [databaseError, setDatabaseError] = useState(false);
  const [favorite, setFavorite] = useState(0);

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

      if (parkingAreaDetails.dateOfData == "keine Daten") {
        Alert.alert("Warnung!", "Es konnten keine Daten gefunden werden.");
        showParkingAreaDescription(false);
      }
    } catch (error) {
      console.error(error);
      setDatabaseError(true);
    }
  };

  const setFavoriteParkingArea = (favorite: number) => {
    dbConnectionService.setFavoriteParkingArea(favorite, parkingAreaData.name);
    setFavorite(favorite);
    if (favorite == 1) {
      Toast.show("Parkhaus erfolgreich zu Favoriten hinzugefügt!", {
        duration: Toast.durations.SHORT,
      });
    } else if (favorite == 0) {
      Toast.show("Parkhaus erfolgreich von Favoriten entfernt!", {
        duration: Toast.durations.SHORT,
      });
    }
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [id, handleParkingAreaDetails]);

  const showParkingAreaDescription = (showDescription: boolean) => {
    handleShowParkingAreaDescription(showDescription);
  };

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
                color="#fff"
                backgroundColor="transparent"
              />
            </View>
            <Ionicons.Button
              style={styles.headingIcon}
              name="close-circle"
              size={30}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => showParkingAreaDescription(false)}
            />
          </View>
          <Text style={styles.text}>
            Die Daten konnten nicht abgerufen werden. Aktion bitte wiederholen!
          </Text>
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
                  color="#a66378"
                  backgroundColor="transparent"
                  onPress={() => setFavoriteParkingArea(0)}
                />
              ) : (
                <Ionicons.Button
                  style={styles.favoriteIcons}
                  name="ios-heart-outline"
                  size={25}
                  color="#a66378"
                  backgroundColor="transparent"
                  onPress={() => setFavoriteParkingArea(1)}
                />
              )}
            </View>
            <Ionicons.Button
              style={styles.headingIcon}
              name="close-circle"
              size={30}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => showParkingAreaDescription(false)}
            />
          </View>
          <View style={styles.itemContainer}>
            <View style={styles.item}>
              {parkingAreaDetailsData.trend === 0 ? (
                <MaterialIcons
                  name="trending-neutral"
                  size={30}
                  color="#c7935a"
                  backgroundColor="transparent"
                />
              ) : undefined}
              {parkingAreaDetailsData.trend === -1 ? (
                <MaterialIcons
                  name="trending-down"
                  size={30}
                  color="#00c9c8"
                  backgroundColor="transparent"
                />
              ) : undefined}
              {parkingAreaDetailsData.trend === 1 ? (
                <MaterialIcons
                  name="trending-up"
                  size={30}
                  color="#fd526c"
                  backgroundColor="transparent"
                />
              ) : undefined}
              <Text style={styles.text}>
                {parkingAreaDetailsData.numberOfFreeLots} frei
              </Text>
            </View>
            <View style={styles.item}>
              <MaterialIcons
                name="euro"
                size={30}
                color="#2e2d2d"
                backgroundColor="transparent"
              />
              <Text style={styles.text}>{parkingAreaData.pricePerHour}/h</Text>
            </View>
            <View style={styles.item}>
              <Ionicons
                name="ios-time"
                size={30}
                color="#2e2d2d"
                backgroundColor="transparent"
              />
              <Text style={styles.text}>{parkingAreaData.openingHours}h</Text>
            </View>
            {parkingAreaData.doorHeight === "" ? undefined : (
              <View style={styles.item}>
                <View style={styles.heightIconsContainer}>
                  <MaterialIcons
                    name="height"
                    size={30}
                    color="#2e2d2d"
                    backgroundColor="transparent"
                  />
                  <MaterialIcons
                    name="directions-car"
                    size={30}
                    color="#2e2d2d"
                    backgroundColor="transparent"
                  />
                </View>
                <Text style={styles.text}>{parkingAreaData.doorHeight}m</Text>
              </View>
            )}

            <TouchableOpacity onPress={() => handleParkingAreaDetails(true)}>
              <View style={styles.item}>
                <MaterialIcons
                  name="more-horiz"
                  size={30}
                  color="#2e2d2d"
                  backgroundColor="transparent"
                />
                <Text style={styles.text}>Mehr</Text>
              </View>
            </TouchableOpacity>
          </View>
          {showLetsGo === "true" ? (
            <TouchableOpacity>
              <View style={styles.navigateItem}>
                <MaterialIcons
                  name="directions"
                  size={30}
                  color="#2e2d2d"
                  backgroundColor="transparent"
                />
                <Text style={styles.text}>Los</Text>
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
    backgroundColor: "#2e2d2d",
    alignItems: "center",
    justifyContent: "flex-start",
    height: Dimensions.get("window").height * 0.3,
  },
  warningContainer: {
    backgroundColor: "#fd526c",
    alignItems: "center",
    justifyContent: "flex-start",
    height: Dimensions.get("window").height * 0.3,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    flexDirection: "column",
    width: Dimensions.get("window").width * 0.16,
    height: Dimensions.get("window").height * 0.1,
    borderColor: "#fff",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  navigateItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.05,
    borderColor: "#d3fbd8",
    backgroundColor: "#d3fbd8",
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  heightIconsContainer: {
    flexDirection: "row",
  },
  text: {
    color: "#2e2d2d",
    fontSize: 15,
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
    color: "#fff",
  },
  heading: {
    marginLeft: 30,
    marginTop: 15,
    marginBottom: 15,
    marginRight: 0,
    color: "#fff",
    fontSize: 25,
  },
});
