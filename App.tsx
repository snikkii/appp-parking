import { StatusBar } from "expo-status-bar";
import { Alert, Dimensions, Platform, StyleSheet, View } from "react-native";
import { ParkingMap } from "./src/components/ParkingMap";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { allParkingAreas } from "./src/AllParkingAreas";
import { IParkingArea } from "./src/models/IParkingArea";
import ParkingAreaDescription from "./src/components/ParkingAreaDescription";
import Settings from "./src/components/Settings";
import { XMLParser } from "fast-xml-parser";
import { decode } from "html-entities";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const parkingAreaDb = openDatabase();

export default function App() {
  const [parkingAreaId, setParkingAreaId] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [latUser, setLatUser] = useState(0);
  const [longUser, setLongUser] = useState(0);
  const MINUTES_MS = 60000; // 10 Minuten

  useEffect(() => {
    parkingAreaDb.transaction((tx) => {
      tx.executeSql(
        "create table if not exists parkingarea (id integer primary key not null, name string, adress string, openingHours string, pricePerHour string, doorHeight string, favorite boolean, lat number, long number);"
      );
      tx.executeSql("select * from parkingarea", [], (_, { rows }) => {
        if (rows.length == 0) {
          allParkingAreas.map((parkingArea: IParkingArea) =>
            tx.executeSql(
              "insert into parkingarea (name, adress, openingHours, pricePerHour, doorHeight, favorite, lat, long) values (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                parkingArea.name,
                parkingArea.adress,
                parkingArea.openingHours,
                parkingArea.pricePerHour,
                parkingArea.doorHeight,
                "false",
                parkingArea.lat,
                parkingArea.long,
              ]
            )
          );
        }
      });
      tx.executeSql(
        "create table if not exists parkingdetails (id integer primary key not null, parkingAreaId number, numberOfLots number, numberOfTakenLots number, numberofFreeLots number, trend number, status string, closed number, dateOfData string);"
      );
    });
  }, []);

  function getData() {
    fetch("http://parken.amberg.de/wp-content/uploads/pls/pls.xml")
      .then((response) => response.text())
      .then((textResponse) => {
        const parser = new XMLParser();
        let obj = parser.parse(textResponse);
        let dateOfData = obj.Daten.Zeitstempel;
        for (const elem of obj.Daten.Parkhaus) {
          elem.Name = decode(elem.Name, { level: "xml" });
          insertIntoDetailsTable(
            elem.Name,
            dateOfData,
            elem.Gesamt,
            elem.Aktuell,
            elem.Frei,
            elem.Trend,
            elem.Status,
            elem.Geschlossen
          );
        }
      })
      .catch((error) => {
        Alert.alert(
          "Warnung!",
          "Die aktuellen Parkhausdaten konnten nicht abgerufen werden. Bitte Internetverbindung prüfen!"
        );
        console.error(error);
      });
  }

  const insertIntoDetailsTable = (
    name: string,
    dateOfData: string,
    numberOfLots: number,
    numberOfTakenLots: number,
    numberOfFreeLots: number,
    trend: number,
    status: string,
    closed: number
  ) => {
    let id = 0;
    parkingAreaDb.transaction((tx) => {
      tx.executeSql(
        "select id from parkingarea where name = ?",
        [name],
        (_, { rows }) => (id = rows._array[0]["id"])
      );
    });
    parkingAreaDb.transaction((tx) => {
      tx.executeSql(
        "insert into parkingdetails (parkingAreaId, numberOfLots, numberOfTakenLots, numberofFreeLots, trend, status, closed, dateOfData) values (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          numberOfLots,
          numberOfTakenLots,
          numberOfFreeLots,
          trend,
          status,
          closed,
          dateOfData,
        ]
      );
      tx.executeSql(
        "select * from parkingdetails where parkingAreaId = ? order by dateOfData desc",
        [id],
        (_, { rows }) => {
          if (rows.length >= 2) {
            tx.executeSql("delete from parkingdetails where name = ? limit 1", [
              name,
            ]);
          }
        }
      );
    });
  };

  useEffect(() => {
    const intervalCall = setInterval(() => {
      getData();
    }, MINUTES_MS);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  const getParkingAreaId = (id: number) => {
    setParkingAreaId(id);
    if (id == 0) {
      setShowDescription(false);
    }
  };

  const showParkingAreaDescription = (parkingAreaDescription: boolean) => {
    setShowDescription(parkingAreaDescription);
  };

  const getUserPosition = (latUser?: number, longUser?: number) => {
    if (latUser == undefined) {
      latUser = 0;
    }
    if (longUser == undefined) {
      longUser = 0;
    }
    setLatUser(latUser);
    setLongUser(longUser);
  };

  return (
    <View style={styles.container}>
      <Settings />
      <ParkingMap
        parkingAreaDb={parkingAreaDb}
        handleParkingAreaId={getParkingAreaId}
        handleParkingAreaDescription={showParkingAreaDescription}
        handleUserPosition={getUserPosition}
        mapStyle={showDescription ? styles.mapWithDescription : styles.map}
      />
      {showDescription ? (
        <ParkingAreaDescription
          parkingAreaDb={parkingAreaDb}
          id={parkingAreaId}
          latUser={latUser}
          longUser={longUser}
          handleShowParkingAreaDescription={showParkingAreaDescription}
        />
      ) : undefined}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e2d2d",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  settings: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.1,
  },
  map: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.9,
  },
  mapWithDescription: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
  },
});
