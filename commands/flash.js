const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function flashCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/flash_lights`, {}, accessToken);
}

module.exports = flashCommand;
