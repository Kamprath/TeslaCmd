const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function lockCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/door_lock`, {}, accessToken);
}

module.exports = lockCommand;
