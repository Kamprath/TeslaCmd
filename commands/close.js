const { postRequest, getVehicleData } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function closeWindows(accessToken, vehicleId) {
  const vehicleData = await getVehicleData(accessToken, vehicleId);

  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/window_control`, {
    "command": "close",
    "lat": vehicleData.drive_state.latitude,
    "lon": vehicleData.drive_state.longitude
  }, accessToken);
}

module.exports = closeWindows;