export const entityConfigurations: EntityConfigurations = {
  Drones: {
    apiEndpoint: '/drones',
    fields: [
      { name: 'name', placeholder: 'Drone Name', type: 'text' },
      { name: 'weight', placeholder: 'Weight', type: 'number' },
    ],
  },
  Pilots: {
    apiEndpoint: '/pilots',
    fields: [
      { name: 'name', placeholder: 'Pilot Name', type: 'text' },
      { name: 'age', placeholder: 'Age', type: 'number' },
    ],
  },
  Flights: {
    apiEndpoint: '/flights',
    fields: [
      { name: 'pilot_id', placeholder: 'Pilot ID', type: 'number' },
      { name: 'drone_id', placeholder: 'Drone ID', type: 'number' },
      {
        name: 'flight_location',
        placeholder: 'Flight Location',
        type: 'string',
      },
      {
        name: 'footage_recorded',
        placeholder: 'Footage recorded?',
        type: 'boolean',
      },
    ],
  },
}

export interface FieldConfig {
  name: string
  placeholder: string
  type: string
}

export interface EntityConfig {
  apiEndpoint: string
  fields: FieldConfig[]
}

export interface EntityConfigurations {
  [key: string]: EntityConfig
}

export interface ManageEntityScreenParams {
  entityType: keyof EntityConfigurations
}
