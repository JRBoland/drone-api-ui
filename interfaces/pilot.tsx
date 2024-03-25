export interface Pilot {
  id: number
  name: string
  age: number
}

export interface PilotApiResponse {
  data: Pilot[];
}