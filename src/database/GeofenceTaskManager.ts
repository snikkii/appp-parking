import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import { useEffect, useState } from "react";

const GEOFENCE_TASK = "GEOFENCE_TASK";

let geofenceHandles: TaskManager.TaskManagerTaskExecutor[] = [];

TaskManager.defineTask(GEOFENCE_TASK, (data: any) => {
  console.log(geofenceHandles);
  for (const handle of geofenceHandles) {
    handle(data);
  }
});

export function useGeofenceEvent() {
  const [name, setName] = useState("");
  const [inGeofence, setInGeofence] = useState(false);

  useEffect(() => {
    const handleIsInGeofence = ({ data, error }: any) => {
      if (error) {
        console.log("error here");
      }
      if (data.eventType === Location.GeofencingEventType.Enter) {
        setName(data.region.identifier);
        setInGeofence(true);
        console.log("You've entered region:", data.region);
        Toast.show("Parkhaus " + data.region.identifier + " ist in der Nähe!", {
          duration: Toast.durations.LONG,
        });
      } else if (data.eventType === Location.GeofencingEventType.Exit) {
        setName(data.region.identifier);
        setInGeofence(false);
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

  return [name, inGeofence];
}
