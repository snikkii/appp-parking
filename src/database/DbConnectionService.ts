import { Alert, Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { allParkingAreas } from "../AllParkingAreas";
import { IParkingArea } from "../models/IParkingArea";
import { XMLParser } from "fast-xml-parser";
import { decode } from "html-entities";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";

export class DbConnectionService {
  public parkingAreaDb!:
    | SQLite.WebSQLDatabase
    | {
        transaction: () => {
          executeSql: () => void;
        };
      };

  constructor() {
    this.parkingAreaDb = this.openDatabase();
  }

  private openDatabase = () => {
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
  };

  public createTables = () => {
    this.parkingAreaDb.transaction((tx) => {
      // tx.executeSql("drop table parkingdetails");
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
        "create table if not exists parkingdetails (id integer primary key not null, parkingAreaId number, numberOfLots number, numberOfTakenLots number, numberOfFreeLots number, trend number, status string, closed number, dateOfData string);"
      );
    });
  };

  public getData = () => {
    fetch("http://parken.amberg.de/wp-content/uploads/pls/pls.xml")
      .then((response) => response.text())
      .then((textResponse) => {
        const parser = new XMLParser();
        let obj = parser.parse(textResponse);
        let dateOfData = obj.Daten.Zeitstempel;
        for (const elem of obj.Daten.Parkhaus) {
          elem.Name = decode(elem.Name, { level: "xml" });
          this.insertIntoDetailsTable(
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
  };

  private insertIntoDetailsTable = (
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
    let toDelete = "";
    this.parkingAreaDb.transaction((tx) => {
      tx.executeSql(
        "select id from parkingarea where name = ?",
        [name],
        (_, { rows }) => (id = rows._array[0]["id"])
      );
    });
    this.parkingAreaDb.transaction((tx) => {
      tx.executeSql(
        "insert into parkingdetails (parkingAreaId, numberOfLots, numberOfTakenLots, numberOfFreeLots, trend, status, closed, dateOfData) values (?, ?, ?, ?, ?, ?, ?, ?)",
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
        "select * from parkingdetails where parkingAreaId = ? order by dateOfData asc",
        [id],
        (_, { rows }) => {
          if (rows.length >= 4) {
            toDelete = rows._array[0]["dateOfData"];
          }
        }
      );
    });
    this.parkingAreaDb.transaction((tx) => {
      tx.executeSql(
        "delete from parkingdetails where parkingAreaId = ? and dateOfData = ?",
        [id, toDelete]
      );
    });
  };

  public getDataFromParkingAreaTable = async (parkingAreaId: number) => {
    let parkingAreaDetails = {} as IParkingArea;
    return new Promise((resolve, reject) => {
      this.parkingAreaDb.transaction((tx) => {
        tx.executeSql(
          "select * from parkingarea where id = ?",
          [parkingAreaId],
          (tx, result) => {
            parkingAreaDetails.name = result.rows.item(0).name;
            parkingAreaDetails.openingHours = result.rows.item(0).openingHours;
            parkingAreaDetails.pricePerHour = result.rows.item(0).pricePerHour;
            parkingAreaDetails.doorHeight = result.rows.item(0).doorHeight;
            parkingAreaDetails.favorite = result.rows.item(0).favorite;
            parkingAreaDetails.lat = result.rows.item(0).lat;
            parkingAreaDetails.long = result.rows.item(0).long;
            resolve(parkingAreaDetails);
          }
        );
      });
    });
  };

  public getDataFromParkingAreaDetailsTable = async (parkingAreaId: number) => {
    let parkingAreaDetails = {} as IParkingAreaDetails;
    return new Promise((resolve, reject) => {
      this.parkingAreaDb.transaction((tx) => {
        tx.executeSql(
          "select * from parkingdetails where parkingAreaId = ? order by dateOfData desc limit 1",
          [parkingAreaId],
          (tx, result) => {
            parkingAreaDetails.numberOfLots = result.rows.item(0).numberOfLots;
            parkingAreaDetails.numberOfTakenLots =
              result.rows.item(0).numberOfTakenLots;
            parkingAreaDetails.numberOfFreeLots =
              result.rows.item(0).numberOfFreeLots;
            parkingAreaDetails.trend = result.rows.item(0).trend;
            parkingAreaDetails.status = result.rows.item(0).status;
            parkingAreaDetails.closed = result.rows.item(0).closed;
            parkingAreaDetails.dateOfData = result.rows.item(0).dateOfData;
            resolve(parkingAreaDetails);
          }
        );
      });
    });
  };

  public getParkingAreas = async () => {
    return new Promise((resolve, reject) => {
      this.parkingAreaDb.transaction((tx) => {
        tx.executeSql(
          "select * from parkingarea order by name asc",
          [],
          (tx, result) => {
            resolve(result.rows);
          }
        );
      });
    });
  };
}
