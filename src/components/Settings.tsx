import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { DbConnectionService } from "../database/DbConnectionService";
import * as SQLite from "expo-sqlite";

interface ISettings {
  dbConnectionService: DbConnectionService;
  handleShowSettings(showSettings: boolean): void;
  handleParkingAreaDescription(parkingAreaDescription: boolean): void;
}

export default function Settings(props: ISettings) {
  const {
    dbConnectionService,
    handleShowSettings,
    handleParkingAreaDescription,
  } = props;
  const [soundOn, setSoundOn] = useState(true);
  const [collapsParkingAreas, setCollapseParkingAreas] = useState(false);
  const [parkingAreaRows, setParkingAreaRows] = useState(
    {} as SQLite.SQLResultSetRowList
  );
  const [databaseError, setDatabaseError] = useState(false);

  const fetchDataFromTable = async () => {
    try {
      let parkingAreas =
        (await dbConnectionService.getParkingAreas()) as SQLite.SQLResultSetRowList;
      setParkingAreaRows(parkingAreas);
      setDatabaseError(false);
    } catch (error) {
      console.error(error);
      setDatabaseError(true);
    }
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [collapsParkingAreas, databaseError]);

  const showSettings = (show: boolean) => {
    handleShowSettings(show);
    handleParkingAreaDescription(show);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Ionicons.Button
          style={styles.headingIcon}
          name="ios-arrow-back"
          size={40}
          color="#fff"
          backgroundColor="transparent"
          onPress={() => showSettings(false)}
        />
        <Text style={styles.heading}>Einstellungen</Text>
      </View>
      <View style={styles.listContainer}>
        {soundOn ? (
          <TouchableOpacity
            style={styles.volume}
            onPress={() => setSoundOn(false)}
          >
            <View style={styles.listItem}>
              <Text style={styles.itemText}>Ton an</Text>
              <Ionicons.Button
                style={styles.icons}
                name="volume-high"
                size={40}
                color="#2e2d2d"
                backgroundColor="transparent"
              />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.volume}
            onPress={() => setSoundOn(true)}
          >
            <View style={styles.listItem}>
              <Text style={styles.itemText}>Ton aus</Text>
              <Ionicons.Button
                style={styles.icons}
                name="volume-mute"
                size={40}
                color="#2e2d2d"
                backgroundColor="transparent"
              />
            </View>
          </TouchableOpacity>
        )}

        {collapsParkingAreas ? (
          <TouchableOpacity onPress={() => setCollapseParkingAreas(false)}>
            <View style={styles.listItem}>
              <Text style={styles.itemText}>Parkhäuser</Text>
              <Ionicons.Button
                style={styles.icons}
                name="ios-caret-up"
                size={40}
                color="#2e2d2d"
                backgroundColor="transparent"
              />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setCollapseParkingAreas(true)}>
            <View style={styles.listItem}>
              <Text style={styles.itemText}>Parkhäuser</Text>
              <Ionicons.Button
                style={styles.icons}
                name="ios-caret-down-outline"
                size={40}
                color="#2e2d2d"
                backgroundColor="transparent"
              />
            </View>
          </TouchableOpacity>
        )}

        {collapsParkingAreas && !databaseError ? (
          <FlatList
            style={styles.parkingList}
            data={parkingAreaRows._array}
            renderItem={({ item }) => (
              <View style={styles.listViewItem}>
                <TouchableOpacity>
                  <View style={styles.parkingListItem}>
                    <Text style={styles.listText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : undefined}
        {databaseError && collapsParkingAreas ? (
          <View style={styles.warnItem}>
            <Text style={styles.warnText}>
              Die Parkhäuser können aktuell nicht angezeigt werden. App bitte
              neu starten!
            </Text>
            <Ionicons.Button
              style={styles.icons}
              name="ios-warning"
              size={40}
              color="#2e2d2d"
              backgroundColor="transparent"
            />
          </View>
        ) : undefined}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  headingContainer: {
    flexDirection: "row",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.2,
    justifyContent: "center",
  },
  headingIcon: {
    width: Dimensions.get("window").width * 0.2,
    marginTop: 80,
    marginLeft: 40,
    color: "#fff",
    fontSize: 43,
  },
  heading: {
    marginTop: 80,
    width: Dimensions.get("window").width * 0.8,
    color: "#fff",
    fontSize: 43,
  },
  listContainer: {
    flexDirection: "column",
    margin: 5,
    padding: 10,
    marginBottom: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.1,
    borderColor: "#fff",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
  },
  volume: {
    flexDirection: "row",
  },
  volumeSettings: {
    flexDirection: "row",
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 2,
    margin: 5,
    padding: 10,
  },
  itemText: {
    margin: 10,
    color: "#2e2d2d",
    fontSize: 30,
    alignItems: "center",
  },
  icons: {
    padding: 0,
    margin: 0,
    marginTop: 5,
    alignItems: "center",
  },
  listViewItem: {
    flexDirection: "column",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    padding: 10,
  },
  parkingList: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.5,
  },
  parkingListItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.6,
    height: Dimensions.get("window").height * 0.1,
    borderColor: "#fff",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
  },
  listText: {
    margin: 10,
    color: "#2e2d2d",
    fontSize: 20,
    alignItems: "center",
  },
  warnText: {
    flexWrap: "wrap",
    flexDirection: "row",
    margin: 10,
    color: "#2e2d2d",
    fontSize: 16,
  },
  warnItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.1,
    borderColor: "#fd526c",
    backgroundColor: "#fd526c",
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
  },
});
