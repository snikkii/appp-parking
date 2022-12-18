import { StatusBar } from "expo-status-bar";
import { Dimensions, StyleSheet, View } from "react-native";
import { ParkingMap } from "./src/components/ParkingMap";
import { useEffect, useState } from "react";
import ParkingAreaDescription from "./src/components/ParkingAreaDescription";
import ParkingAreaList from "./src/components/ParkingAreaList";
import { DbConnectionService } from "./src/database/DbConnectionService";
import { Ionicons } from "@expo/vector-icons";
import ParkingAreaDetails from "./src/components/ParkingAreaDetails";

const dbConnectionService = new DbConnectionService();

export default function App() {
  const [parkingAreaId, setParkingAreaId] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [latUser, setLatUser] = useState(0);
  const [longUser, setLongUser] = useState(0);
  const [openParkingAreaList, setOpenParkingAreaList] = useState(false);
  const [volume, setVolume] = useState(false);
  const MINUTES_MS = 60000; // 1 minute TODO: change to ten minutes when app is finished

  useEffect(() => {
    dbConnectionService.createTables();
    dbConnectionService.getData();
  }, []);

  useEffect(() => {
    const intervalCall = setInterval(() => {
      dbConnectionService.getData();
    }, MINUTES_MS);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  const getParkingAreaId = (id: number) => {
    setParkingAreaId(id);
    if (id == 0) {
      setShowDescription(false);
    }
  };

  const showParkingAreaDescription = (parkingAreaDescription: boolean) => {
    setShowDescription(parkingAreaDescription);
  };

  const showParkingAreaDetails = (parkingAreaDetails: boolean) => {
    setShowDetails(parkingAreaDetails);
  };

  const getUserPosition = (latUser?: number, longUser?: number) => {
    if (latUser == undefined) {
      latUser = 0;
    }
    if (longUser == undefined) {
      longUser = 0;
    }
    setLatUser(latUser);
    setLongUser(longUser);
  };

  const showParkingAreaList = (showList: boolean) => {
    setOpenParkingAreaList(showList);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <View style={styles.oneButtonContainer}>
          {volume ? (
            <Ionicons.Button
              style={styles.listButton}
              name="volume-high"
              size={40}
              color="white"
              backgroundColor="transparent"
              onPress={() => setVolume(false)}
            />
          ) : (
            <Ionicons.Button
              style={styles.listButton}
              name="volume-mute"
              size={40}
              color="white"
              backgroundColor="transparent"
              onPress={() => setVolume(true)}
            />
          )}
        </View>
        <View style={styles.placeholder} />
        <View style={styles.oneButtonContainer}>
          <Ionicons.Button
            style={styles.listButton}
            name="ios-list-circle"
            size={40}
            color="white"
            backgroundColor="transparent"
            onPress={() => setOpenParkingAreaList(true)}
          />
        </View>
      </View>
      {openParkingAreaList ? (
        <ParkingAreaList
          dbConnectionService={dbConnectionService}
          handleShowParkingAreaList={showParkingAreaList}
          handleParkingAreaDescription={showParkingAreaDescription}
          handleParkingAreaDetails={showParkingAreaDetails}
          handleSetId={getParkingAreaId}
        />
      ) : (
        <ParkingMap
          handleParkingAreaId={getParkingAreaId}
          handleParkingAreaDescription={showParkingAreaDescription}
          handleUserPosition={getUserPosition}
          mapStyle={showDescription ? styles.mapWithDescription : styles.map}
        />
      )}
      {showDescription && !openParkingAreaList ? (
        <ParkingAreaDescription
          dbConnectionService={dbConnectionService}
          id={parkingAreaId}
          latUser={latUser}
          longUser={longUser}
          handleShowParkingAreaDescription={showParkingAreaDescription}
          handleParkingAreaDetails={showParkingAreaDetails}
        />
      ) : undefined}

      {showDetails ? (
        <ParkingAreaDetails
          dbConnectionService={dbConnectionService}
          handleShowParkingAreaDetails={showParkingAreaDetails}
          parkingAreaId={parkingAreaId}
        />
      ) : undefined}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e2d2d",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  map: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.89,
  },
  mapWithDescription: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
  },
  buttonContainer: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.11,
  },
  oneButtonContainer: {
    width: Dimensions.get("window").width * 0.2,
    justifyContent: "center",
  },
  placeholder: {
    width: Dimensions.get("window").width * 0.67,
  },
  listButton: {
    paddingTop: 45,
    paddingRight: 5,
    marginBottom: 5,
  },
  volumeButton: {
    paddingTop: 45,
    paddingRight: 5,
    marginBottom: 5,
  },
});
