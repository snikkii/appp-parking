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
import { DbConnectionService } from "../database/DbConnectionService";
import { IParkingArea } from "../models/IParkingArea";
import { useEffect, useState } from "react";

interface IParkingAreaDetails {
  dbConnectionService: DbConnectionService;
  handleShowParkingAreaDetails(parkingAreaDetails: boolean): void;
  parkingAreaId: number;
}

export default function ParkingAreaList(props: IParkingAreaDetails) {
  const { dbConnectionService, handleShowParkingAreaDetails, parkingAreaId } =
    props;
  const [parkingAreaData, setParkingAreaData] = useState({} as IParkingArea);
  const [parkingAreaDetailsData, setParkingAreaDetailsData] = useState(
    {} as IParkingAreaDetails
  );
  const [databaseError, setDatabaseError] = useState(false);

  const showParkingAreaDetails = (showDetails: boolean) => {
    handleShowParkingAreaDetails(showDetails);
  };

  const fetchDataFromTable = async () => {
    try {
      let parkingAreas = (await dbConnectionService.getDataFromParkingAreaTable(
        parkingAreaId
      )) as IParkingArea;

      let parkingAreaDetails =
        (await dbConnectionService.getDataFromParkingAreaDetailsTable(
          parkingAreaId
        )) as IParkingAreaDetails;

      setParkingAreaData(parkingAreas);
      setParkingAreaDetailsData(parkingAreaDetails);
      setDatabaseError(false);
    } catch (error) {
      console.error(error);
      setDatabaseError(true);
    }
  };

  useEffect(() => {
    fetchDataFromTable();
  }, [parkingAreaId]);

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Ionicons.Button
          style={styles.headingIcon}
          name="ios-arrow-back"
          size={40}
          color="#fff"
          backgroundColor="transparent"
          onPress={() => showParkingAreaDetails(false)}
        />
        <Text style={styles.heading}>
          {parkingAreaData.name}
          {parkingAreaData.favorite === 1 ? (
            <Ionicons
              style={styles.icons}
              name="ios-heart"
              size={40}
              color="#a66378"
              backgroundColor="transparent"
            />
          ) : undefined}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    borderColor: "#535252",
    backgroundColor: "#535252",
    borderWidth: 2,
    borderRadius: 10,
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
    marginTop: 90,
    width: Dimensions.get("window").width * 0.8,
    color: "#fff",
    fontSize: 35,
  },
  icons: {
    padding: 0,
    margin: 0,
    marginTop: 5,
    alignItems: "center",
  },
});
