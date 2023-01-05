export interface IParkingArea {
  id: number;
  name: string;
  address: string;
  openingHours: number;
  pricePerHour: string;
  doorHeight: string;
  favorite: 0 | 1;
  lat: number;
  long: number;
}
