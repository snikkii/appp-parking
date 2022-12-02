import { StatusBar } from "expo-status-bar";
import MapView, { Marker } from "react-native-maps";
import {
  StyleSheet,
  Dimensions,
  View,
  StyleProp,
  StyleSheetProperties,
  ViewStyle,
} from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { allParkingAreas } from "../AllParkingAreas";
import { IParkingArea } from "../models/IParkingArea";
import * as SQLite from "expo-sqlite";
import ParkingAreaDescription from "./ParkingAreaDescription";

interface IParkingMapProps {
  parkingAreaDb:
    | SQLite.WebSQLDatabase
    | {
        transaction: () => {
          executeSql: () => void;
        };
      };
  handleParkingAreaId(id: number): void;
  handleParkingAreaDescription(parkingAreaDescription: boolean): void;
  handleUserPosition(latUser?: number, longUser?: number): void;
  mapStyle: StyleProp<ViewStyle>;
}

export function ParkingMap(props: IParkingMapProps) {
  const {
    parkingAreaDb,
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
        // style={
        //   showParkingAreaDescriptionStyle
        //     ? styles.mapWithDescription
        //     : styles.map
        // }
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
            onPress={() =>
              parkingAreaDb.transaction((tx) => {
                tx.executeSql(
                  "select * from parkingarea where id = ?",
                  [parkingArea.id],
                  (_, { rows }) =>
                    // setShowParkingAreaDescription(true),
                    showParkingAreaDescription(
                      rows._array[0]["id"],
                      true,
                      location?.coords.latitude,
                      location?.coords.longitude
                    )
                  // setParkingAreaId(rows._array[0]["id"]),
                  // setParkingAreaInfos([
                  //   rows._array[0]["name"],
                  //   rows._array[0]["openingHours"],
                  //   rows._array[0]["pricePerHour"],
                  //   rows._array[0]["doorHeight"],
                  // ]),
                  // setParkingAreaFavorit(rows._array[0]["favorite"]),
                  // setParkingAreaLatLong([
                  //   rows._array[0]["lat"],
                  //   rows._array[0]["long"],
                  // ])
                  // console.log(JSON.stringify(rows._array[0]["name"]))
                );
              })
            }
          />
        ))}
      </MapView>
      {/* {showParkingAreaDescription ? (
        <ParkingAreaDescription
          id={parkingAreaId}
          name={parkingAreaInfos[0]}
          openingHours={parkingAreaInfos[1]}
          pricePerHour={parkingAreaInfos[2]}
          doorHeight={parkingAreaInfos[3]}
          favorite={parkingAreaFavorit}
          latParkingArea={parkingAreaLatLong[0]}
          longParkingArea={parkingAreaLatLong[1]}
          latUser={location ? location.coords.latitude : 0}
          longUser={location ? location.coords.longitude : 0}
        />
      ) : undefined} */}
    </View>
  );
}
