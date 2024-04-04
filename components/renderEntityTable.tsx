import { StyleSheet, View, Text } from "react-native"

// renders different cell titles and sizes based on fields
export const renderEntityItem = (entityType: string, item: any) => {
  switch (entityType) {
    case 'Drones':
      return (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
          <Text style={[styles.tableCell, styles.mediumCell]}>{item.name}</Text>
          <Text style={[styles.tableCell, styles.smallCell]}>
            {item.weight}
          </Text>
        </View>
      )
    case 'Pilots':
      return (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
          <Text style={[styles.tableCell, styles.mediumCell]}>{item.name}</Text>
          <Text style={[styles.tableCell, styles.smallCell]}>{item.age}</Text>
        </View>
      )
    case 'Flights':
      return (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
          <Text style={[styles.tableCell, styles.idCell]}>{item.pilot_id}</Text>
          <Text style={[styles.tableCell, styles.idCell]}>{item.drone_id}</Text>
          <Text style={[styles.tableCell, styles.largeCell]}>
            {item.flight_location}
          </Text>
          {/* renders text based on boolean value */}
          <Text style={[styles.tableCell, styles.smallCell]}>
            {item.footage_recorded ? 'Yes' : 'No'}
          </Text>
        </View>
      )
    default:
      return <View />
  }
}

export const renderEntityHeader = (entityType: string) => {
  switch (entityType) {
    case 'Drones':
      return (
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.idCell]}>ID</Text>
          <Text style={[styles.headerText, styles.mediumCell]}>Name</Text>
          <Text style={[styles.headerText, styles.smallCell]}>Weight</Text>
        </View>
      )
    case 'Pilots':
      return (
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.idCell]}>ID</Text>
          <Text style={[styles.headerText, styles.mediumCell]}>Name</Text>
          <Text style={[styles.headerText, styles.smallCell]}>Age</Text>
        </View>
      )
    case 'Flights':
      return (
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.idCell]}>ID</Text>
          <Text style={[styles.headerText, styles.idCell]}>Pilot ID</Text>
          <Text style={[styles.headerText, styles.idCell]}>Drone ID</Text>
          <Text style={[styles.headerText, styles.largeCell]}>
            Flight Location
          </Text>
          <Text style={[styles.headerText, styles.smallCell]}>
            Footage Recorded
          </Text>
        </View>
      )
    default:
      return <View />
  }
}

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d8d8d8',
  },
  tableCell: {
    textAlign: 'left',
    padding: 2,
    paddingVertical: 8,
    borderRightWidth: 2,
    borderColor: '#d8d8d8',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#00cecb',
    paddingVertical: 8,
    backgroundColor: '#ffed66',
  },
  headerText: {
    textAlign: 'left',
    fontWeight: 'bold',
    padding: 2,
  },
  table: {
    margin: 5,
  },
  idCell: {
    flex: 1,
  },
  smallCell: {
    flex: 1.5,
  },
  mediumCell: {
    flex: 3,
  },
  largeCell: {
    flex: 4,
  },
})
