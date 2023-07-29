const { getRequest, postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function closeWindows(accessToken, vehicleId) {
  console.log('Fetching vehicle data (GPS info required to close windows)...');
  const vehicleDataResponse = await getRequest(`${API_BASE_URL}/vehicles/${vehicleId}/vehicle_data`, accessToken);
  const vehicleData = vehicleDataResponse.response;

  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/window_control`, {
    "command": "close",
    "lat": vehicleData.drive_state.latitude,
    "lon": vehicleData.drive_state.longitude
  }, accessToken);
}

module.exports = closeWindows;