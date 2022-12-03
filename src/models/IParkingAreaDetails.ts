export interface IParkingAreaDetails {
  id: number;
  parkingAreaId: number;
  numberOfLots: number;
  numberOfTakenLots: number;
  numberOfFreeLots: number;
  trend: 0 | 1 | -1;
  status: "OK" | "Ersatzwerte" | "Manuell" | "Störung";
  closed: 0 | 1;
  dateOfData: string;
}
