import { StatusBar } from "expo-status-bar";
import { Dimensions, StyleSheet, View } from "react-native";
import { ParkingMap } from "./src/components/ParkingMap";
import { useEffect, useState } from "react";
import ParkingAreaDescription from "./src/components/ParkingAreaDescription";
import ParkingAreaList from "./src/components/ParkingAreaList";
import { DbConnectionService } from "./src/database/DbConnectionService";
import { Ionicons } from "@expo/vector-icons";
import ParkingAreaDetails from "./src/components/ParkingAreaDetails";
import { RootSiblingParent } from "react-native-root-siblings";
import { useGeofenceEvent } from "./src/hooks/useGeofenceEvent";
import { IParkingArea } from "./src/models/IParkingArea";
import { IParkingAreaDetails } from "./src/models/IParkingAreaDetails";
import { colors } from "./src/colors";

const dbConnectionService = new DbConnectionService();

export default function App() {
  const [parkingAreaId, setParkingAreaId] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [latUser, setLatUser] = useState(0);
  const [longUser, setLongUser] = useState(0);
  const [openParkingAreaList, setOpenParkingAreaList] = useState(false);
  const [volume, setVolume] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);
  const [parkingAreaData, setParkingAreaData] = useState({} as IParkingArea);
  const [parkingAreaDetailsData, setParkingAreaDetailsData] = useState(
    {} as IParkingAreaDetails
  );
  const MINUTES_MS = 60000; // 1 minute TODO: change to ten minutes when app is finished
  const geofenceEventData = useGeofenceEvent();

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

  useEffect(() => {
    // TODO: tts
  }, [geofenceEventData]);

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

  const getParkingAreaData = (parkingAreaData: IParkingArea) => {
    setParkingAreaData(parkingAreaData);
  };

  const getParkingAreaDetailsData = (
    parkingAreaDetailData: IParkingAreaDetails
  ) => {
    setParkingAreaDetailsData(parkingAreaDetailData);
  };

  const getDataBaseError = (databaseError: boolean) => {
    setDatabaseError(databaseError);
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
    <RootSiblingParent>
      <View style={styles.container}>
        <StatusBar style="light" />
        {!openParkingAreaList ? (
          <View style={styles.buttonContainer}>
            <View style={styles.oneButtonContainer}>
              {volume ? (
                <Ionicons.Button
                  name="volume-high"
                  size={35}
                  color={colors.white}
                  backgroundColor="transparent"
                  onPress={() => setVolume(false)}
                />
              ) : (
                <Ionicons.Button
                  name="volume-mute"
                  size={35}
                  color={colors.white}
                  backgroundColor="transparent"
                  onPress={() => setVolume(true)}
                />
              )}
            </View>
            <View style={styles.placeholder} />
            <View style={styles.oneButtonContainer}>
              <Ionicons.Button
                name="ios-list-circle"
                size={35}
                color={colors.white}
                backgroundColor="transparent"
                onPress={() => setOpenParkingAreaList(true)}
              />
            </View>
          </View>
        ) : undefined}
        {openParkingAreaList ? (
          <ParkingAreaList
            dbConnectionService={dbConnectionService}
            handleShowParkingAreaList={showParkingAreaList}
            handleParkingAreaDescription={showParkingAreaDescription}
            handleParkingAreaDetails={showParkingAreaDetails}
            handleParkingAreaData={getParkingAreaData}
            handleParkingAreaDetailData={getParkingAreaDetailsData}
            handleDataBaseError={getDataBaseError}
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
            geofenceEventData={geofenceEventData}
            handleShowParkingAreaDescription={showParkingAreaDescription}
            handleParkingAreaDetails={showParkingAreaDetails}
            handleParkingAreaData={getParkingAreaData}
            handleParkingAreaDetailData={getParkingAreaDetailsData}
            handleDataBaseError={getDataBaseError}
          />
        ) : undefined}

        {showDetails ? (
          <ParkingAreaDetails
            dbConnectionService={dbConnectionService}
            handleShowParkingAreaDetails={showParkingAreaDetails}
            parkingAreaData={parkingAreaData}
            parkingAreaDetailsData={parkingAreaDetailsData}
            databaseError={databaseError}
          />
        ) : undefined}
      </View>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  map: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.93,
  },
  mapWithDescription: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.63,
  },
  buttonContainer: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.1,
  },
  oneButtonContainer: {
    width: Dimensions.get("window").width * 0.2,
    justifyContent: "center",
  },
  placeholder: {
    width: Dimensions.get("window").width * 0.67,
  },
});
