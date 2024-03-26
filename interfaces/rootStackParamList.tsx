export type RootStackParamList = {
  Home: undefined;
  Drones: undefined;
  Pilots: undefined;
  Flights: undefined;
  Manage: { entityType: 'Drones' | 'Pilots' | 'Flights' }; 
  Login: undefined;
};