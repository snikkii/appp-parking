import MapView, { Marker } from "react-native-maps";
import { View, StyleProp, ViewStyle, Alert } from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { allParkingAreas } from "../AllParkingAreas";
import { IParkingArea } from "../models/IParkingArea";
import { MaterialIcons } from "@expo/vector-icons";

interface IParkingMapProps {
  handleParkingAreaId(id: number): void;
  handleParkingAreaDescription(parkingAreaDescription: boolean): void;
  handleUserPosition(latUser?: number, longUser?: number): void;
  mapStyle: StyleProp<ViewStyle>;
}

const GEOFENCE_TASK = "GEOFENCE_TASK";

export function ParkingMap(props: IParkingMapProps) {
  const {
    handleParkingAreaId,
    handleParkingAreaDescription,
    handleUserPosition,
    mapStyle,
  } = props;
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  let regions: Location.LocationRegion[] = [];

  allParkingAreas.map((parkingArea: IParkingArea) => {
    regions.push({
      identifier: parkingArea.name,
      latitude: parkingArea.lat,
      longitude: parkingArea.long,
      radius: 250,
    });
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMessage(
          "Zugriff auf aktuelle Position wurde nicht gestattet. Die aktuelle Position und Parkhäuser in der Nähe können nicht angezeigt werden!"
        );
        Alert.alert("Achtung!", errorMessage);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    (async () => {
      let { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMessage(
          "Zugriff auf aktuelle Position wurde nicht gestattet. Die aktuelle Position und Parkhäuser in der Nähe können nicht angezeigt werden!"
        );
        Alert.alert("Achtung!", errorMessage);
        return;
      }
    })();

    if (TaskManager.isTaskDefined(GEOFENCE_TASK)) {
      Location.startGeofencingAsync(GEOFENCE_TASK, regions);
    } else {
      setTimeout(() => {
        Location.startGeofencingAsync(GEOFENCE_TASK, regions);
      }, 5000);
    }
  }, []);

  const handleSetValues = (
    id: number,
    showDescription: boolean,
    latUser?: number,
    longUser?: number
  ) => {
    handleParkingAreaId(id);
    if (latUser == undefined) {
      latUser = 0;
    }
    if (longUser == undefined) {
      longUser = 0;
    }
    handleUserPosition(latUser, longUser);
    handleParkingAreaDescription(showDescription);
  };

  return (
    <View>
      <MapView
        style={mapStyle}
        showsUserLocation
        region={
          location
            ? {
                longitude: location.coords.longitude, // this is where i am
                latitude: location.coords.latitude,
                // longitude: 11.853035893058891, // this is somewhere in amberg
                // latitude: 49.447723353888115,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
      >
        {/* TODO: "drive" on iphone */}
        {/* {location ? (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <Ionicons
              name="ios-car-sport"
              size={30}
              color="#005b60"
              backgroundColor="transparent"
            />
          </Marker>
        ) : undefined} */}

        {allParkingAreas.map((parkingArea: IParkingArea) => (
          <Marker
            key={parkingArea.id}
            coordinate={{
              latitude: parkingArea.lat,
              longitude: parkingArea.long,
            }}
            title={parkingArea.name}
            onPress={() => {
              handleSetValues(
                parkingArea.id,
                true,
                location?.coords.latitude,
                location?.coords.longitude
              );
            }}
          >
            <MaterialIcons
              name="location-on"
              size={50}
              color="#00adad"
              backgroundColor="transparent"
            />
            {/* <FontAwesome5
              name="parking"
              size={50}
              color="#00adad"
              backgroundColor="transparent"
            /> */}
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
