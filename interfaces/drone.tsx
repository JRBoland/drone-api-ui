export interface Drone {
  id: number
  name: string
  weight: number
}

export interface ApiResponse {
  data: Drone[];
}