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
};

export interface FieldConfig {
  name: string;
  placeholder: string;
  type: string;
}

export interface EntityConfig {
  apiEndpoint: string;
  fields: FieldConfig[];
}

export interface EntityConfigurations {
  [key: string]: EntityConfig;
}

export interface ManageEntityScreenParams {
  entityType: keyof EntityConfigurations;
}