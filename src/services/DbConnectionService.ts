import { Alert, Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import { allParkingAreas } from "../AllParkingAreas";
import { IParkingArea } from "../models/IParkingArea";
import { XMLParser } from "fast-xml-parser";
import { decode } from "html-entities";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";
import Toast from "react-native-root-toast";
import { configStrings, errorMessages, sqlQuerys } from "../strings";

export class DbConnectionService {
  public parkingAreaDb!:
    | SQLite.WebSQLDatabase
    | {
        transaction: () => {
          executeSql: () => void;
        };
      };

  // Im Konstruktor wird die Datenbank beim Neuerstellen eines DbConnectionServices geöffnet.
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

  // Hier werden die Tabellen parkingarea und parkingdetails erstellt, falls sie nicht existieren.
  // In die Tabelle parkingarea werden bei Neuerstellung die Daten der Parkmöglichkeiten eingefügt.
  public createTables = () => {
    this.parkingAreaDb.transaction(
      (tx) => {
        tx.executeSql(sqlQuerys.createTableParkingArea);
        tx.executeSql(sqlQuerys.selectAllFromParkingArea, [], (_, { rows }) => {
          if (rows.length == 0) {
            allParkingAreas.map((parkingArea: IParkingArea) =>
              tx.executeSql(sqlQuerys.insertAllDataIntoParkingArea, [
                parkingArea.name,
                parkingArea.address,
                parkingArea.openingHours,
                parkingArea.pricePerHour,
                parkingArea.doorHeight,
                parkingArea.favorite,
                parkingArea.lat,
                parkingArea.long,
              ])
            );
          }
        });
        tx.executeSql(sqlQuerys.createTableParkingAreaDetails);
      },
      (error) => {
        console.error(error);
        Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
      }
    );
  };

  // Hier wird die API angesprochen. Die Daten der Parkmöglichkeiten
  // werden direkt in die Datenbank parkingdetails eingefügt.
  public getData = () => {
    fetch(configStrings.parkingAreaDetailsApi)
      .then((response) => response.text())
      .then((textResponse) => {
        const parser = new XMLParser();
        let obj = parser.parse(textResponse);
        let dateOfData = obj.Daten.Zeitstempel;
        let ctr = 0;
        for (const elem of obj.Daten.Parkhaus) {
          elem.Name = decode(elem.Name, { level: "xml" });
          elem.Status = decode(elem.Status, { level: "xml" });
          this.insertIntoDetailsTable(
            elem.Name,
            dateOfData,
            elem.Gesamt,
            elem.Aktuell,
            elem.Frei,
            elem.Trend,
            elem.Status,
            elem.Geschlossen,
            ctr
          );
          ctr += 1;
        }
      })
      .catch((error) => {
        console.error(error);
        Toast.show(errorMessages.noApiConnectionMessage, {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      });
  };

  // Dies ist die Funktion zum Einfügen der Daten in die parkingdetails-Tabelle.
  private insertIntoDetailsTable = (
    name: string,
    dateOfData: string,
    numberOfLots: number,
    numberOfTakenLots: number,
    numberOfFreeLots: number,
    trend: number,
    status: string,
    closed: number,
    ctr: number
  ) => {
    let id = 0;
    let toDelete = "";
    this.parkingAreaDb.transaction(
      (tx) => {
        tx.executeSql(
          sqlQuerys.selectIdFromParkingAreaWithName,
          [name],
          (_, { rows }) => (id = rows._array[0]["id"])
        );
      },
      (error) => {
        console.error(error);
        if (ctr == 1) {
          Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
        }
      }
    );
    this.parkingAreaDb.transaction(
      (tx) => {
        tx.executeSql(sqlQuerys.insertIntoParkingAreaDetails, [
          id,
          numberOfLots,
          numberOfTakenLots,
          numberOfFreeLots,
          trend,
          status,
          closed,
          dateOfData,
        ]);
        // Gibt es mehr als 4 oder genau 4 Datensätze pro Parkhaus in der Tabelle,
        // so wird der älteste gelöscht. Dies hat den Grund, dass die Tabelle nicht
        // unendlich groß und mit Daten gefüllt wird, die nahezu nie benötigt werden.
        tx.executeSql(
          sqlQuerys.selectAllFromParkingAreaDetailsWithId,
          [id],
          (_, { rows }) => {
            if (rows.length >= 4) {
              toDelete = rows._array[0]["dateOfData"];
            }
          }
        );
      },
      (error) => {
        console.error(error);
        if (ctr == 1) {
          Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
        }
      }
    );
    this.parkingAreaDb.transaction(
      (tx) => {
        tx.executeSql(sqlQuerys.deleteOldRecordFromParkingAreaDetails, [
          id,
          toDelete,
        ]);
      },
      (error) => {
        console.error(error);
        if (ctr == 1) {
          Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
        }
      }
    );
  };

  // Mit Hilfe der ID werden hier die Daten einer Parkmöglichkeit aus der
  // Datenbank geholt und in einem Objekt gespeichert und zurückgegeben.
  // Damit die Daten in der jeweiligen Komponente ankommen, muss diese Funktion
  // asynchron sein und ein Promise zurückgeben.
  public getDataFromParkingAreaTable = async (parkingAreaId: number) => {
    let parkingAreaDetails = {} as IParkingArea;
    return new Promise((resolve, reject) => {
      this.parkingAreaDb.transaction(
        (tx) => {
          tx.executeSql(
            sqlQuerys.selectAllFromParkingAreaWithId,
            [parkingAreaId],
            (tx, result) => {
              parkingAreaDetails.name = result.rows.item(0).name;
              parkingAreaDetails.address = result.rows.item(0).address;
              parkingAreaDetails.openingHours =
                result.rows.item(0).openingHours;
              parkingAreaDetails.pricePerHour =
                result.rows.item(0).pricePerHour;
              parkingAreaDetails.doorHeight = result.rows.item(0).doorHeight;
              parkingAreaDetails.favorite = result.rows.item(0).favorite;
              parkingAreaDetails.lat = result.rows.item(0).lat;
              parkingAreaDetails.long = result.rows.item(0).long;
              resolve(parkingAreaDetails);
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Hier passiert daselbe wie in der Funktion getDataFromParkingAreaTable(). Der
  // einzige Unterschied ist, dass hier die Daten der parkingdetails-Tabelle
  // entnommen werden.
  public getDataFromParkingAreaDetailsTable = async (parkingAreaId: number) => {
    let parkingAreaDetails = {} as IParkingAreaDetails;
    return new Promise((resolve, reject) => {
      this.parkingAreaDb.transaction(
        (tx) => {
          tx.executeSql(
            sqlQuerys.selectAllFromParkingAreaDetailsWithIdLimit1,
            [parkingAreaId],
            (tx, result) => {
              if (result.rows.length > 0) {
                parkingAreaDetails.numberOfLots =
                  result.rows.item(0).numberOfLots;
                parkingAreaDetails.numberOfTakenLots =
                  result.rows.item(0).numberOfTakenLots;
                parkingAreaDetails.numberOfFreeLots =
                  result.rows.item(0).numberOfFreeLots;
                parkingAreaDetails.trend = result.rows.item(0).trend;
                parkingAreaDetails.status = result.rows.item(0).status;
                parkingAreaDetails.closed = result.rows.item(0).closed;
                parkingAreaDetails.dateOfData = result.rows.item(0).dateOfData;
              } else {
                parkingAreaDetails.numberOfLots = 0;
                parkingAreaDetails.numberOfTakenLots = 0;
                parkingAreaDetails.numberOfFreeLots = 0;
                parkingAreaDetails.trend = 0;
                parkingAreaDetails.status = "OK";
                parkingAreaDetails.closed = 0;
                parkingAreaDetails.dateOfData = "keine Daten";
              }
              resolve(parkingAreaDetails);
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Hier werden alle Parkmöglichkeiten aus der parkingarea-Tabelle geholt.
  // Damit die Anzeige in der ParkingList-Komponente richtig ist, wird zuerst
  // nach Favoriten und dann alphabetisch nach Namen sortiert.
  public getParkingAreas = async () => {
    return new Promise((resolve, reject) => {
      this.parkingAreaDb.transaction(
        (tx) => {
          tx.executeSql(
            sqlQuerys.selectAllFromParkingAreaOrderByFavoriteAndName,
            [],
            (tx, result) => {
              resolve(result.rows);
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Diese Funktion verändert den Wert der Spalte "Favorite" der parkingarea-Tabelle einer
  // bestimmten Parkmöglichkeit.
  public setFavoriteParkingArea = (favorite: number, name: string) => {
    this.parkingAreaDb.transaction(
      (tx) => {
        tx.executeSql(
          sqlQuerys.updateParkingArea,
          [favorite, name],
          (tx, result) => {}
        );
      },
      (error) => {
        console.error(error);
      }
    );
  };
}
