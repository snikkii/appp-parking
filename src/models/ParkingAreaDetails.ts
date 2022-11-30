export interface ParkingAreaDetails {
  id: number;
  favorite: boolean;
  numberOfLots: number;
  numberOfTakenLots: number;
  numberOfFreeLots: number;
  trend: 0 | 1 | -1;
  status: "OK" | "Ersatzwerte" | "Manuell" | "Störung";
  closed: 0 | 1;
  dateOfData: Date;
}
