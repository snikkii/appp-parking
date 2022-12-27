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
import ParkingAreaListHeading from "./ParkingAreaListHeading";
import ParkingAreaListItem from "./ParkingAreaListItem";
import { errorMessages, outputText } from "../strings";
import { colors } from "../colors";

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

      if (parkingAreaDetails.dateOfData === "keine Daten") {
        Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
      }

      handleParkingAreaDetails(true);
      handleParkingAreaData(parkingAreas);
      handleParkingAreaDetailData(parkingAreaDetails);
      handleDataBaseError(false);
    } catch (error) {
      console.error(error);
      handleDataBaseError(true);
      Alert.alert(errorMessages.warning, errorMessages.databaseProblem);
    }
  };

  const showParkingAreaList = (show: boolean) => {
    handleShowParkingAreaList(show);
    handleParkingAreaDescription(show);
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [handleParkingAreaDetails]);

  return (
    <View style={styles.container}>
      <ParkingAreaListHeading
        arrowBackFunction={showParkingAreaList}
        headingText={outputText.headingList}
      />
      <View style={styles.listContainer}>
        {!databaseError ? (
          <FlatList
            style={styles.parkingList}
            data={parkingAreaRows._array}
            renderItem={({ item }) => (
              <ParkingAreaListItem
                onPressFunction={handleSetValues}
                id={item.id}
                name={item.name}
                favorite={item.favorite}
              />
            )}
          />
        ) : (
          <View style={styles.warnItem}>
            <Text style={styles.warnText}>{errorMessages.noParkingAreas}</Text>
            <Ionicons.Button
              style={styles.icons}
              name="ios-warning"
              size={40}
              color={colors.backgroundGray}
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
  parkingList: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.7,
  },
  warnText: {
    flexWrap: "wrap",
    flexDirection: "row",
    margin: 10,
    color: colors.backgroundGray,
    fontSize: 16,
  },
  warnItem: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.1,
    borderColor: colors.warningRed,
    backgroundColor: colors.warningRed,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    justifyContent: "center",
  },
});
