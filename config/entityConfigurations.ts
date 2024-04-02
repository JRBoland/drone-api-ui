export const entityConfigurations: EntityConfigurations = {
  Drones: {
    apiEndpoint: '/drones',
    fields: [
      { name: 'name', placeholder: 'Drone Name', type: 'text', required: true },
      { name: 'weight', placeholder: 'Weight', type: 'number', required: true },
    ],
  },
  Pilots: {
    apiEndpoint: '/pilots',
    fields: [
      { name: 'name', placeholder: 'Pilot Name', type: 'text', required: true },
      { name: 'age', placeholder: 'Age', type: 'number', required: true },
    ],
  },
  Flights: {
    apiEndpoint: '/flights',
    fields: [
      { name: 'pilot_id', placeholder: 'Pilot ID', type: 'number' },
      { name: 'drone_id', placeholder: 'Drone ID', type: 'number' },
      {
        // not required to create an entry
        name: 'flight_location',
        placeholder: 'Flight Location',
        type: 'string',
        required: false,
      },
      {
        // not required to create an entry
        name: 'footage_recorded',
        placeholder: 'Footage recorded?',
        type: 'boolean',
        required: false,
      },
    ],
  },
}

export interface FieldConfig {
  name: string
  placeholder: string
  type: string
  required?: boolean
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
