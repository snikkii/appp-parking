import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { useState } from "react";

interface IParkingAreaDescription {
  parkingAreaDb:
    | SQLite.WebSQLDatabase
    | {
        transaction: () => {
          executeSql: () => void;
        };
      };
  id: number;
  latUser: number;
  longUser: number;
  handleShowParkingAreaDescription(parkingAreaDescription: boolean): void;
}

export default function ParkingAreaDescription(props: IParkingAreaDescription) {
  const {
    parkingAreaDb,
    id,
    latUser,
    longUser,
    handleShowParkingAreaDescription,
  } = props;
  const [name, setName] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [doorHeight, setDoorHeight] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [longParkingArea, setLongParkingArea] = useState(0);
  const [latParkingArea, setLatParkingArea] = useState(0);

  const [numberOfLots, setNumberOfLots] = useState(0);
  const [numberOfTakenLots, setNumberOfTakenLots] = useState(0);
  const [numberofFreeLots, setNumberofFreeLots] = useState(0);
  const [trend, setTrend] = useState(0);
  const [status, setStatus] = useState("");
  const [closed, setClosed] = useState(0);
  const [dateOfData, setDateOfData] = useState("");

  parkingAreaDb.transaction((tx) => {
    tx.executeSql(
      "select * from parkingarea where id = ?",
      [id],
      (_, { rows }) => (
        setName(rows._array[0]["name"]),
        setOpeningHours(rows._array[0]["openingHours"]),
        setPricePerHour(rows._array[0]["pricePerHour"]),
        setDoorHeight(rows._array[0]["doorHeight"]),
        setFavorite(rows._array[0]["favorite"]),
        setLatParkingArea(rows._array[0]["lat"]),
        setLongParkingArea(rows._array[0]["long"])
      )
    );
  });

  parkingAreaDb.transaction((tx) => {
    tx.executeSql(
      "select * from parkingdetails where parkingAreaId = ?",
      [id],
      (_, { rows }) => {
        if (rows.length != 0) {
          setNumberOfLots(rows._array[0]["numberOfLots"]);
          setNumberOfTakenLots(rows._array[0]["numberOfTakenLots"]);
          setNumberofFreeLots(rows._array[0]["numberofFreeLots"]);
          setTrend(rows._array[0]["trend"]);
          setStatus(rows._array[0]["status"]);
          setClosed(rows._array[0]["closed"]);
          setDateOfData(rows._array[0]["dateOfData"]);
        }
      }
    );
  });

  const showParkingAreaDescription = (showDescription: boolean) => {
    handleShowParkingAreaDescription(showDescription);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => showParkingAreaDescription(false)}>
        <Text style={styles.text}>back</Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        ID: {id}, Name: {name}, Stunden: {openingHours}
      </Text>
      <Text style={styles.text}>
        Höhe: {doorHeight}, Favorit: {favorite}, Preis: {pricePerHour}
      </Text>
      <Text style={styles.text}>
        LatP: {latParkingArea}, LongP: {longParkingArea}
      </Text>
      <Text style={styles.text}>
        LatU: {latUser}, LongU: {longUser}
      </Text>
      <Text style={styles.text}>
        Gesamt: {numberOfLots}, Belegt: {numberOfTakenLots}, Frei:
        {numberofFreeLots}
      </Text>
      <Text style={styles.text}>
        Trend: {trend}, Status: {status}, Geschlossen: {closed}, Datum:
        {dateOfData}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e2d2d",
    alignItems: "center",
    justifyContent: "center",
    height: Dimensions.get("window").height * 0.3,
  },
  text: {
    color: "#fff",
  },
});
