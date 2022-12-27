import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { DbConnectionService } from "../database/DbConnectionService";
import * as SQLite from "expo-sqlite";
import { IParkingArea } from "../models/IParkingArea";
import { IParkingAreaDetails } from "../models/IParkingAreaDetails";

interface IParkingAreaList {
  dbConnectionService: DbConnectionService;
  handleShowParkingAreaList(showParkingAreaList: boolean): void;
  handleParkingAreaDescription(parkingAreaDescription: boolean): void;
  handleParkingAreaDetails(parkingAreaDetails: boolean): void;
  handleParkingAreaData(parkingAreaData: IParkingArea): void;
  handleParkingAreaDetailData(parkingAreaDetails: IParkingAreaDetails): void;
  handleDataBaseError(databaseError: boolean): void;
}

export default function ParkingAreaList(props: IParkingAreaList) {
  const {
    dbConnectionService,
    handleShowParkingAreaList,
    handleParkingAreaDescription,
    handleParkingAreaDetails,
    handleParkingAreaData,
    handleParkingAreaDetailData,
    handleDataBaseError,
  } = props;
  const [parkingAreaRows, setParkingAreaRows] = useState(
    {} as SQLite.SQLResultSetRowList
  );
  const [databaseError, setDatabaseError] = useState(false);

  const fetchDataFromTable = async () => {
    try {
      let parkingAreasAsList =
        (await dbConnectionService.getParkingAreas()) as SQLite.SQLResultSetRowList;

      setParkingAreaRows(parkingAreasAsList);
      setDatabaseError(false);
    } catch (error) {
      console.error(error);
      setDatabaseError(true);
    }
  };

  const handleSetValues = async (id: number) => {
    try {
      let parkingAreas = (await dbConnectionService.getDataFromParkingAreaTable(
        id
      )) as IParkingArea;

      let parkingAreaDetails =
        (await dbConnectionService.getDataFromParkingAreaDetailsTable(
          id
        )) as IParkingAreaDetails;

      if (parkingAreaDetails.dateOfData == "keine Daten") {
        Alert.alert("Warnung!", "Es konnten keine Daten gefunden werden.");
      }

      handleParkingAreaDetails(true);
      handleParkingAreaData(parkingAreas);
      handleParkingAreaDetailData(parkingAreaDetails);
      handleDataBaseError(false);
    } catch (error) {
      console.error(error);
      handleDataBaseError(true);
      Alert.alert("Warnung!", "Es konnten keine Daten gefunden werden.");
    }
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
              Die Parkhäuser können aktuell nicht angezeigt werden.
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
    height: Dimensions.get("window").height * 0.1,
    justifyContent: "center",
    marginBottom: 0,
  },
  headingIcon: {
    width: Dimensions.get("window").width * 0.2,
    marginLeft: 40,
    marginBottom: 0,
    fontSize: 43,
  },
  heading: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").height * 0.1,
    color: "#fff",
    marginBottom: 0,
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
    fontSize: 25,
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
