const { getVehicleData } = require('../utils');

async function getLocation(accessToken, vehicleId) {
  const googleMapsUrl = 'http://www.google.com/maps/place/{lat},{lon}';

  try {
    const vehicleData = await getVehicleData(accessToken, vehicleId);
    const latitude = vehicleData.drive_state.latitude;
    const longitude = vehicleData.drive_state.longitude;
    const url = googleMapsUrl.replace('{lat}', latitude).replace('{lon}', longitude);

    console.log(`\nCoordinates:\t\t${vehicleData.drive_state.latitude}, ${vehicleData.drive_state.longitude}\nGoogle Maps URL:\t${url}\n`);
  } catch (error) {
    console.error(error);
  }

  return false;
}

module.exports = getLocation;
