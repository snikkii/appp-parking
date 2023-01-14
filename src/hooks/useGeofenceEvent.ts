import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import { useEffect, useState } from "react";
import { IEventData } from "../models/IEventData";
import { configStrings, errorMessages } from "../strings";

let geofenceHandles: TaskManager.TaskManagerTaskExecutor[] = [];

// Hier wird der Task definiert: Es sollen alle Funktionen aus geofenceHandles
// hintereinander ausgeführt werden.
TaskManager.defineTask(configStrings.geofenceTask, (data) => {
  for (const handle of geofenceHandles) {
    handle(data);
  }
});

export function useGeofenceEvent() {
  // Man benötigt den useState und das "normale" Objekt, da der useState die
  // Daten nach draußen in andere Bereiche der App bringt und das Objekt
  // für Vergleiche innerhalb dieses Hooks genutzt wird.
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

      // Wenn das Geofence mehrmals hintereinander fehlerhaft betreten wird,
      // wird die Funktion nicht weiter ausgeführt.
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

    // Die eben definierte Funktion kommt zur Abfolge der Funktionen in geofenceHandles
    // und wird nach Ausführung anschließend wieder entfernt.
    geofenceHandles.push(handleIsInGeofence);
    return () => {
      geofenceHandles = geofenceHandles.filter(
        (e: any) => e !== handleIsInGeofence
      );
    };
  }, []);

  return eventData;
}
