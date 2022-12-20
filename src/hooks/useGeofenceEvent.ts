import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import { useEffect, useState } from "react";

const GEOFENCE_TASK = "GEOFENCE_TASK";

let geofenceHandles: TaskManager.TaskManagerTaskExecutor[] = [];

TaskManager.defineTask(GEOFENCE_TASK, (data: any) => {
  for (const handle of geofenceHandles) {
    handle(data);
  }
});

export function useGeofenceEvent() {
  let eventData: string[] = [];

  useEffect(() => {
    const handleIsInGeofence = ({ data, error }: any) => {
      if (error) {
        console.error(error);
        Toast.show(
          "Es gabe in Problem mit der Anzeige der aktuellen Position."
        );
      }
      if (data.eventType === Location.GeofencingEventType.Enter) {
        eventData = [data.region.identifier, "true"];
        console.log("You've entered region:", data.region);
        Toast.show("Parkhaus " + data.region.identifier + " ist in der Nähe!", {
          duration: Toast.durations.LONG,
        });
      } else if (data.eventType === Location.GeofencingEventType.Exit) {
        eventData = [data.region.identifier, "false"];
        console.log("You've left region:", data.region);
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
