const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function unlockCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/door_unlock`, {}, accessToken);
}

module.exports = unlockCommand;
