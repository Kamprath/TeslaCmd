const { postRequest, sleep } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function wakeVehicle(accessToken, vehicleId) {
  console.log('Waking vehicle...');

  try {
    for (let i = 1; i < 7; i++) {
      const responseData = await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/wake_up`, {}, accessToken);

      if (responseData.response.state === 'online') {
        console.log('Vehicle online');
        return false;
      }

      await sleep(5000);
    }

    console.log('Unable to wake vehicle.');
  } catch (error) {
    console.log(`Error while trying to wake vehicle: ${error}`);
  }

  return false;
}

module.exports = wakeVehicle;
