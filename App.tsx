import { StatusBar } from "expo-status-bar";
import { Dimensions, StyleSheet, View } from "react-native";
import { ParkingMap } from "./src/components/ParkingMap";
import { useEffect, useState } from "react";
import ParkingAreaDescription from "./src/components/ParkingAreaDescription";
import Settings from "./src/components/Settings";
import { DbConnectionService } from "./src/database/DbConnectionService";
import Ionicons from "@expo/vector-icons/Ionicons";

const dbConnectionService = new DbConnectionService();

export default function App() {
  const [parkingAreaId, setParkingAreaId] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [latUser, setLatUser] = useState(0);
  const [longUser, setLongUser] = useState(0);
  const [openSettings, setOpenSettings] = useState(false);
  const MINUTES_MS = 60000; // 10 Minuten

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

  const showSettings = (showSettings: boolean) => {
    setOpenSettings(showSettings);
  };

  return (
    <View style={styles.container}>
      <Ionicons.Button
        style={styles.button}
        name="settings-sharp"
        size={30}
        color="white"
        backgroundColor="transparent"
        onPress={() => setOpenSettings(true)}
      />
      {openSettings ? (
        <Settings
          dbConnectionService={dbConnectionService}
          handleShowSettings={showSettings}
          handleParkingAreaDescription={showParkingAreaDescription}
        />
      ) : (
        <ParkingMap
          handleParkingAreaId={getParkingAreaId}
          handleParkingAreaDescription={showParkingAreaDescription}
          handleUserPosition={getUserPosition}
          mapStyle={showDescription ? styles.mapWithDescription : styles.map}
        />
      )}
      {showDescription && !openSettings ? (
        <ParkingAreaDescription
          dbConnectionService={dbConnectionService}
          id={parkingAreaId}
          latUser={latUser}
          longUser={longUser}
          handleShowParkingAreaDescription={showParkingAreaDescription}
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
  settings: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.1,
  },
  map: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.9,
  },
  mapWithDescription: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
  },
  button: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.1,
    paddingTop: 50,
    paddingRight: 20,
    justifyContent: "flex-end",
    marginBottom: 5,
    padding: 0,
  },
});
