import { StatusBar } from "expo-status-bar";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, Dimensions, View } from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { allParkingAreas } from "../AllParkingAreas";
import { ParkingArea } from "../models/ParkingArea";

export function ParkingMap() {
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        region={
          location
            ? {
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
      >
        {allParkingAreas.map((parkingArea: ParkingArea) => (
          <Marker
            key={parkingArea.id}
            coordinate={{
              latitude: parkingArea.lat,
              longitude: parkingArea.long,
            }}
            title={parkingArea.name}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2,
  },
});
