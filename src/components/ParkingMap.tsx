import MapView, { Marker } from "react-native-maps";
import { View, StyleProp, ViewStyle, Alert } from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { allParkingAreas } from "../AllParkingAreas";
import { IParkingArea } from "../models/IParkingArea";
import { MaterialIcons } from "@expo/vector-icons";
import { configStrings, errorMessages } from "../strings";
import { colors } from "../colors";

interface IParkingMapProps {
  handleParkingAreaId(id: number): void;
  handleParkingAreaDescription(parkingAreaDescription: boolean): void;
  mapStyle: StyleProp<ViewStyle>;
}

export function ParkingMap(props: IParkingMapProps) {
  const { handleParkingAreaId, handleParkingAreaDescription, mapStyle } = props;
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  let regions: Location.LocationRegion[] = [];

  allParkingAreas.map((parkingArea: IParkingArea) => {
    regions.push({
      identifier: parkingArea.name,
      latitude: parkingArea.lat,
      longitude: parkingArea.long,
      radius: 200,
    });
  });
  const locationPermissions = () => {
    Location.requestForegroundPermissionsAsync()
      .then(() => {
        Location.requestBackgroundPermissionsAsync()
          .then(() => {
            Location.getCurrentPositionAsync({})
              .then((location) => {
                setLocation(location);
              })
              .catch(() => {
                console.log("current");
                Alert.alert(
                  errorMessages.attention,
                  errorMessages.deniedPermission
                );
              });
          })
          .catch(() => {
            console.log("background");
            Alert.alert(
              errorMessages.attention,
              errorMessages.deniedPermission
            );
          });
      })
      .catch(() => {
        console.log("foreground");
        Alert.alert(errorMessages.attention, errorMessages.deniedPermission);
      });
  };

  useEffect(() => {
    locationPermissions();

    if (TaskManager.isTaskDefined(configStrings.geofenceTask)) {
      Location.startGeofencingAsync(configStrings.geofenceTask, regions);
    } else {
      setTimeout(() => {
        Location.startGeofencingAsync(configStrings.geofenceTask, regions);
      }, 5000);
    }
  }, []);

  const handleSetValues = (id: number, showDescription: boolean) => {
    handleParkingAreaId(id);
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
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : {
                longitude: 11.853035893058891, // this is somewhere in amberg
                latitude: 49.447723353888115,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
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
              handleSetValues(parkingArea.id, true);
            }}
          >
            <MaterialIcons
              name="location-on"
              size={50}
              color={colors.markerBlue}
              backgroundColor="transparent"
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
