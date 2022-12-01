export interface ParkingArea {
  id: number;
  name: string;
  adress: string;
  openingHours: string;
  pricePerHour: string;
  doorHeight: string;
  favorite?: boolean;
  lat: number;
  long: number;
}
