import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { DbConnectionService } from "../database/DbConnectionService";
import * as SQLite from "expo-sqlite";

interface IParkingAreaList {
  dbConnectionService: DbConnectionService;
  handleShowParkingAreaList(showParkingAreaList: boolean): void;
  handleParkingAreaDescription(parkingAreaDescription: boolean): void;
  handleParkingAreaDetails(parkingAreaDetails: boolean): void;
  handleSetId(id: number): void;
}

export default function ParkingAreaList(props: IParkingAreaList) {
  const {
    dbConnectionService,
    handleShowParkingAreaList,
    handleParkingAreaDescription,
    handleParkingAreaDetails,
    handleSetId,
  } = props;
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

  const handleSetValues = (id: number) => {
    handleParkingAreaDetails(true);
    handleSetId(id);
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [handleParkingAreaDetails]);

  const showParkingAreaList = (show: boolean) => {
    handleShowParkingAreaList(show);
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
          onPress={() => showParkingAreaList(false)}
        />
        <Text style={styles.heading}>Parkhäuser</Text>
      </View>
      <View style={styles.listContainer}>
        {!databaseError ? (
          <FlatList
            style={styles.parkingList}
            data={parkingAreaRows._array}
            renderItem={({ item }) => (
              <View style={styles.listViewItem}>
                <TouchableOpacity onPress={() => handleSetValues(item.id)}>
                  <View style={styles.parkingListItem}>
                    <Text style={styles.listText}>
                      {item.name}
                      {item.favorite === 1 ? (
                        <Ionicons
                          style={styles.icons}
                          name="ios-heart"
                          size={25}
                          color="#a66378"
                          backgroundColor="transparent"
                        />
                      ) : undefined}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
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
        )}
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
    height: Dimensions.get("window").height * 0.7,
  },
  parkingListItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.8,
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
    fontSize: 30,
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
