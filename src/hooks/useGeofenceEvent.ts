import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import { useEffect, useState } from "react";
import { allParkingAreas } from "../AllParkingAreas";
import { IParkingArea } from "../models/IParkingArea";
import { IEventData } from "../models/IEventData";
import { configStrings, errorMessages, outputText } from "../strings";

let geofenceHandles: TaskManager.TaskManagerTaskExecutor[] = [];

TaskManager.defineTask(configStrings.geofenceTask, (data: any) => {
  for (const handle of geofenceHandles) {
    handle(data);
  }
});

export function useGeofenceEvent() {
  const [eventData, setEventData] = useState([] as IEventData[]);

  if (eventData.length === 0) {
    allParkingAreas.map((parkingArea: IParkingArea) => {
      eventData.push({
        parkingAreaName: parkingArea.name,
        enteredParkingArea: false,
      });
    });
  }

  useEffect(() => {
    const handleIsInGeofence = ({ data, error }: any) => {
      if (error) {
        console.error(error);
        Toast.show(errorMessages.noCurrentPosition, {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
        });
      }
      let newEventData = [...eventData];
      if (data.eventType === Location.GeofencingEventType.Enter) {
        newEventData.map((parkingArea: IEventData) => {
          if (parkingArea.parkingAreaName === data.region.identifier) {
            parkingArea.enteredParkingArea = true;
          }
        });
        setEventData(newEventData);
        Toast.show(outputText.inGeofenceMessage + data.region.identifier, {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
        });
      } else if (data.eventType === Location.GeofencingEventType.Exit) {
        newEventData.map((parkingArea: IEventData) => {
          if (parkingArea.parkingAreaName === data.region.identifier) {
            parkingArea.enteredParkingArea = false;
          }
        });
        setEventData(newEventData);
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
