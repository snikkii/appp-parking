import MapView, { Marker } from "react-native-maps";
import { View, StyleProp, ViewStyle } from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { allParkingAreas } from "../AllParkingAreas";
import { IParkingArea } from "../models/IParkingArea";
import { MaterialIcons } from "@expo/vector-icons";

interface IParkingMapProps {
  handleParkingAreaId(id: number): void;
  handleParkingAreaDescription(parkingAreaDescription: boolean): void;
  handleUserPosition(latUser?: number, longUser?: number): void;
  mapStyle: StyleProp<ViewStyle>;
}

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
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const showParkingAreaDescription = (
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
                // longitude: location.coords.longitude, // this is where i am
                // latitude: location.coords.latitude,
                longitude: 11.853035893058891, // this is somewhere in amberg
                latitude: 49.447723353888115,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
      >
        {allParkingAreas.map((parkingArea: IParkingArea) => (
          <Marker
            key={parkingArea.id}
            coordinate={{
              latitude: parkingArea.lat,
              longitude: parkingArea.long,
            }}
            title={parkingArea.name}
            onPress={() => {
              showParkingAreaDescription(
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
              color="#005b60"
              backgroundColor="transparent"
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
