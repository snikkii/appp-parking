import { StyleSheet, Dimensions, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { DbConnectionService } from "../database/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";

interface IParkingAreaDescription {
  dbConnectionService: DbConnectionService;
  id: number;
  latUser: number;
  longUser: number;
  handleShowParkingAreaDescription(parkingAreaDescription: boolean): void;
}

export default function ParkingAreaDescription(props: IParkingAreaDescription) {
  const {
    dbConnectionService,
    id,
    latUser,
    longUser,
    handleShowParkingAreaDescription,
  } = props;
  const [parkingAreaData, setParkingAreaData] = useState({} as IParkingArea);
  const [parkingAreaDetailsData, setParkingAreaDetailsData] = useState(
    {} as IParkingAreaDetails
  );
  const [favorite, setFavorite] = useState(false);

  const fetchDataFromTable = async () => {
    setParkingAreaData(
      (await dbConnectionService.getDataFromParkingAreaTable(
        id
      )) as IParkingArea
    );
    setParkingAreaDetailsData(
      (await dbConnectionService.getDataFromParkingAreaDetailsTable(
        id
      )) as IParkingAreaDetails
    );
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [id]);

  const showParkingAreaDescription = (showDescription: boolean) => {
    handleShowParkingAreaDescription(showDescription);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.heading}>{parkingAreaData.name}</Text>
          {favorite ? (
            <Ionicons.Button
              style={styles.favoriteIcons}
              name="ios-heart"
              size={25}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => setFavorite(false)}
            />
          ) : (
            <Ionicons.Button
              style={styles.favoriteIcons}
              name="ios-heart-outline"
              size={25}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => setFavorite(true)}
            />
          )}
          {/* {favorite ? (
            <Ionicons.Button
              style={styles.favoriteIcons}
              name="star-sharp"
              size={25}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => setFavorite(false)}
            />
          ) : (
            <Ionicons.Button
              style={styles.favoriteIcons}
              name="star-outline"
              size={25}
              color="#fff"
              backgroundColor="transparent"
              onPress={() => setFavorite(true)}
            />
          )} */}
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
        <Ionicons
          name="ios-time"
          size={20}
          color="#fff"
          backgroundColor="transparent"
        />
        Stunden: {parkingAreaData.openingHours}
      </Text>
      <Text style={styles.text}>
        <MaterialIcons
          name="height"
          size={20}
          color="#fff"
          backgroundColor="transparent"
        />
        Höhe: {parkingAreaData.doorHeight}, Favorit: {parkingAreaData.favorite},
        <MaterialIcons
          name="euro"
          size={20}
          color="#fff"
          backgroundColor="transparent"
        />
        Preis: {parkingAreaData.pricePerHour}
      </Text>
      <Text style={styles.text}>
        LatP: {parkingAreaData.lat}, LongP: {parkingAreaData.long}
      </Text>
      <Text style={styles.text}>
        LatU: {latUser}, LongU: {longUser}
      </Text>
      <Text style={styles.text}>
        <MaterialIcons
          name="trending-down"
          size={20}
          color="#fff"
          backgroundColor="transparent"
        />
        <MaterialIcons
          name="trending-neutral"
          size={20}
          color="#fff"
          backgroundColor="transparent"
        />
        <MaterialIcons
          name="trending-up"
          size={20}
          color="#fff"
          backgroundColor="transparent"
        />
        Gesamt: {parkingAreaDetailsData.numberOfLots}, Belegt:{" "}
        {parkingAreaDetailsData.numberOfTakenLots}, Frei:
        {parkingAreaDetailsData.numberOfFreeLots}
      </Text>
      <Text style={styles.text}>
        Trend: {parkingAreaDetailsData.trend}, Status:{" "}
        {parkingAreaDetailsData.status}, Geschlossen:{" "}
        {parkingAreaDetailsData.closed}, Datum:
        {parkingAreaDetailsData.dateOfData}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e2d2d",
    alignItems: "center",
    justifyContent: "flex-start",
    height: Dimensions.get("window").height * 0.3,
  },
  text: {
    color: "#fff",
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
