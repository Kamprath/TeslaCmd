const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function wakeVehicle(accessToken, vehicleId) {
    console.log('Waking vehicle...');
    try {
      await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/wake_up`, {}, accessToken);
    } catch (error) {
      console.log(`Failed to wake vehicle: ${error}`);
    }
  }

module.exports = wakeVehicle;
