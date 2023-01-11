import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import { useEffect, useState } from "react";
import { IEventData } from "../models/IEventData";
import { configStrings, errorMessages } from "../strings";

let geofenceHandles: TaskManager.TaskManagerTaskExecutor[] = [];

TaskManager.defineTask(configStrings.geofenceTask, (data) => {
  for (const handle of geofenceHandles) {
    handle(data);
  }
});

export function useGeofenceEvent() {
  const [eventData, setEventData] = useState({
    parkingAreaName: "",
    enteredParkingArea: false,
  } as IEventData);

  let currentData = {
    parkingAreaName: "",
    enteredParkingArea: false,
  } as IEventData;

  useEffect(() => {
    const handleIsInGeofence = ({ data, error }: any) => {
      if (error) {
        console.error(error);
        Toast.show(errorMessages.noCurrentPosition, {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
        });
      }

      if (currentData.enteredParkingArea === true) {
        if (
          data.region.identifier === currentData.parkingAreaName &&
          data.eventType === Location.GeofencingEventType.Enter
        ) {
          return;
        }
      }

      if (data.eventType === Location.GeofencingEventType.Enter) {
        currentData.enteredParkingArea = true;
        currentData.parkingAreaName = data.region.identifier;
        setEventData({
          parkingAreaName: data.region.identifier,
          enteredParkingArea: true,
        });
      } else if (data.eventType === Location.GeofencingEventType.Exit) {
        currentData.enteredParkingArea = false;
        currentData.parkingAreaName = data.region.identifier;
        setEventData({
          parkingAreaName: data.region.identifier,
          enteredParkingArea: false,
        });
      }
    };

    geofenceHandles.push(handleIsInGeofence);
    return () => {
      geofenceHandles = geofenceHandles.filter(
        (e: any) => e !== handleIsInGeofence
      );
    };
  }, []);

  return eventData;
}
