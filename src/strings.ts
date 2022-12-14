export const sqlQuerys = {
  createTableParkingArea:
    "create table if not exists parkingarea (id integer primary key not null, name string, address string, openingHours number, pricePerHour string, doorHeight string, favorite number, lat number, long number);",
  insertAllDataIntoParkingArea:
    "insert into parkingarea (name, address, openingHours, pricePerHour, doorHeight, favorite, lat, long) values (?, ?, ?, ?, ?, ?, ?, ?)",
  selectAllFromParkingArea: "select * from parkingarea",
  selectAllFromParkingAreaOrderByFavoriteAndName:
    "select * from parkingarea order by favorite desc, name asc",
  selectAllFromParkingAreaWithId: "select * from parkingarea where id = ?",
  selectIdFromParkingAreaWithName: "select id from parkingarea where name = ?",
  updateParkingArea: "update parkingarea set favorite = ? where name = ?",

  createTableParkingAreaDetails:
    "create table if not exists parkingdetails (id integer primary key not null, parkingAreaId number, numberOfLots number, numberOfTakenLots number, numberOfFreeLots number, trend number, status string, closed number, dateOfData string);",
  insertIntoParkingAreaDetails:
    "insert into parkingdetails (parkingAreaId, numberOfLots, numberOfTakenLots, numberOfFreeLots, trend, status, closed, dateOfData) values (?, ?, ?, ?, ?, ?, ?, ?)",
  selectAllFromParkingAreaDetailsWithId:
    "select * from parkingdetails where parkingAreaId = ? order by dateOfData asc",
  selectAllFromParkingAreaDetailsWithIdLimit1:
    "select * from parkingdetails where parkingAreaId = ? order by dateOfData desc limit 1",
  selectFreeParkingLotsFromParkingAreaDetails:
    "select numberOfFreeLots from parkingdetails where id = ? order by dateOfData asc",
  deleteOldRecordFromParkingAreaDetails:
    "delete from parkingdetails where parkingAreaId = ? and dateOfData = ?",
};

export const configStrings = {
  parkingAreaDetailsApi:
    "http://parken.amberg.de/wp-content/uploads/pls/pls.xml",
  geofenceTask: "GEOFENCE_TASK",
};

export const errorMessages = {
  warning: "Warnung!",
  databaseProblem: "Die Daten konnten nicht abgerufen werden.",
  attention: "Achtung!",
  attentionText: "Fehler",
  noCurrentPosition:
    "Es gab ein Problem mit der Anzeige der aktuellen Position.",
  closedText:
    "Parkhaus ist derzeit geschlossen und kann nicht befahren werden.",
  deniedPermission:
    "Zugriff auf aktuelle Position wurde nicht gestattet. Die aktuelle Position und Parkh??user in der N??he k??nnen nicht angezeigt werden!",
  noApiConnectionMessage:
    "Die aktuellen Parkhausdaten konnten nicht abgerufen werden. Bitte Internetverbindung pr??fen!",
  noParkingAreas: "Die Parkh??user k??nnen aktuell nicht angezeigt werden.",
  ttsProblem: "Sprachausgabe konnte nicht ausgef??hrt werden.",
};

export const outputText = {
  successAddedToFavorites: " erfolgreich zu Favoriten hinzugef??gt!",
  failAddedToFavorites: " erfolgreich von Favoriten entfernt!",
  freeLots: " frei",
  perHour: "/h",
  hour: "h",
  meters: "m",
  more: "Mehr",
  letsGo: "Los",
  headingList: "Parkh??user",
  closed: "Geschlossen",
  open: "Ge??ffnet",
  openedText: " Stunden",
  address: "Einfahrt ??ber",
  doorHeight: "Einfahrtsh??he",
  doorHeightText: "m",
  price: "Kosten pro Stunde",
  priceText: "???",
  lots: "Parkpl??tze",
  lotsAll: "Gesamt: ",
  lotsTaken: "Belegt: ",
  lotsFree: "Frei: ",
  lotsTrend: "Trend: ",
  trendDown: "Fallend",
  trendUp: "Steigend",
  trendNeutral: "Gleichbleibend",
  currentStatus: "Aktueller Status",
  navigationTitle: "Weiterleitung",
  navigationBodyIos: "Sie werden nun zu Apple Maps weitergeleitet.",
  navigationBodyAndroid: "Sie werden nun zu Google Maps weitergeleitet.",
  okayText: "OK",
  cancelText: "Abbrechen",
  apple: "apple",
  google: "google",
  platform: "ios",
  inGeofenceMessagePart1: " in der N??he. ",
  inGeofenceMessagePart2: " freie Parkpl??tze.",
};
