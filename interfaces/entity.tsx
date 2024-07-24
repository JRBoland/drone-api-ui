export interface Drone {
  id: number
  name: string
  weight: number
}

export interface Pilot {
  id: number
  name: string
  age: number
  flights_recorded: number
}

export interface Flight {
  id: number;
  flight_date: Date;
  drone_id: number;
  pilot_id: number;
  flight_location: string;
  footage_recorded: boolean;
}

export interface EntityApiResponse<T> {
  data: T[];
}

// Union type for an entity
export type Entity = Drone | Pilot | Flight;

// Type guard for Drone
export function isDrone(entity: Entity): entity is Drone {
  return (entity as Drone).weight !== undefined;
}

// Type guard for Pilot
export function isPilot(entity: Entity): entity is Pilot {
  return (entity as Pilot).age !== undefined;
}

// Type guard for Flight
export function isFlight(entity: Entity): entity is Flight {
  return (entity as Flight).flight_date !== undefined;
}
