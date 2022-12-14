import { StatusBar } from "expo-status-bar";
import { Alert, Dimensions, StyleSheet, View } from "react-native";
import { ParkingMap } from "./src/components/ParkingMap";
import { useEffect, useState } from "react";
import ParkingAreaDescription from "./src/components/ParkingAreaDescription";
import ParkingAreaList from "./src/components/ParkingAreaList";
import { DbConnectionService } from "./src/services/DbConnectionService";
import { Ionicons } from "@expo/vector-icons";
import ParkingAreaDetails from "./src/components/ParkingAreaDetails";
import { RootSiblingParent } from "react-native-root-siblings";
import { useGeofenceEvent } from "./src/hooks/useGeofenceEvent";
import { IParkingArea } from "./src/models/IParkingArea";
import { IParkingAreaDetails } from "./src/models/IParkingAreaDetails";
import { colors } from "./src/colors";
import { IEventData } from "./src/models/IEventData";
import * as Speech from "expo-speech";
import { allParkingAreas } from "./src/AllParkingAreas";
import { errorMessages, outputText } from "./src/strings";
import Toast from "react-native-root-toast";

const dbConnectionService = new DbConnectionService();

export default function App() {
  const [parkingAreaId, setParkingAreaId] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [openParkingAreaList, setOpenParkingAreaList] = useState(false);
  const [volume, setVolume] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);
  const [parkingAreaData, setParkingAreaData] = useState({} as IParkingArea);
  const [parkingAreaDetailsData, setParkingAreaDetailsData] = useState(
    {} as IParkingAreaDetails
  );
  const MINUTES_MS = 600000; // 10 minutes
  const geofenceEventData = useGeofenceEvent();
  const [areParkingAreasInGeofence, setAreParkingAreasInGeofence] = useState(
    [] as IEventData[]
  );

  if (areParkingAreasInGeofence.length === 0) {
    allParkingAreas.map((parkingArea: IParkingArea) => {
      areParkingAreasInGeofence.push({
        parkingAreaName: parkingArea.name,
        enteredParkingArea: false,
      });
    });
  }

  const speak = (text: string) => {
    Speech.speak(text, {
      language: "de-DE",
      onError: (error) => {
        console.error(error);
        Alert.alert(errorMessages.warning, errorMessages.ttsProblem);
      },
    });
  };

  const getCurrentGeofenceData = (name: string, entered: boolean) => {
    let newGeofenceEventData = [...areParkingAreasInGeofence];
    newGeofenceEventData.map((parkingArea) => {
      if (name === parkingArea.parkingAreaName) {
        parkingArea.enteredParkingArea = entered;
      }
    });
    return newGeofenceEventData;
  };

  const getFreeParkingLots = async (
    parkingAreaName: string,
    parkingAreaId: number
  ) => {
    try {
      let parkingAreaDetails =
        (await dbConnectionService.getDataFromParkingAreaDetailsTable(
          parkingAreaId
        )) as IParkingAreaDetails;
      if (parkingAreaDetails.numberOfFreeLots !== 0) {
        let text =
          parkingAreaName +
          outputText.inGeofenceMessagePart1 +
          parkingAreaDetails.numberOfFreeLots.toString() +
          outputText.inGeofenceMessagePart2;
        if (volume === true) {
          speak(text);
        }
        Toast.show(text, {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert(errorMessages.warning, errorMessages.ttsProblem);
    }
  };

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

  const showParkingAreaList = (showList: boolean) => {
    if (showList === true) {
      setVolume(false);
    }
    setOpenParkingAreaList(showList);
  };

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
    if (geofenceEventData.enteredParkingArea === true) {
      setAreParkingAreasInGeofence(
        getCurrentGeofenceData(
          geofenceEventData.parkingAreaName,
          geofenceEventData.enteredParkingArea
        )
      );
      try {
        allParkingAreas
          .filter((area) => area.name === geofenceEventData.parkingAreaName)
          .map((area) => {
            getFreeParkingLots(geofenceEventData.parkingAreaName, area.id);
          });
      } catch (error) {
        console.error(error);
        Alert.alert(errorMessages.warning, errorMessages.ttsProblem);
      }
    } else if (geofenceEventData.enteredParkingArea === false) {
      setAreParkingAreasInGeofence(
        getCurrentGeofenceData(
          geofenceEventData.parkingAreaName,
          geofenceEventData.enteredParkingArea
        )
      );
    }
  }, [geofenceEventData]);

  useEffect(() => {
    if (volume === false) {
      Speech.stop();
    }
  }, [volume]);

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
                onPress={() => showParkingAreaList(true)}
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
            mapStyle={showDescription ? styles.mapWithDescription : styles.map}
          />
        )}
        {showDescription && !openParkingAreaList ? (
          <ParkingAreaDescription
            dbConnectionService={dbConnectionService}
            id={parkingAreaId}
            geofenceEventData={areParkingAreasInGeofence}
            handleShowParkingAreaDescription={showParkingAreaDescription}
            handleParkingAreaDetails={showParkingAreaDetails}
            handleParkingAreaData={getParkingAreaData}
            handleParkingAreaDetailData={getParkingAreaDetailsData}
            handleDataBaseError={getDataBaseError}
            handleVolume={setVolume}
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
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
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
