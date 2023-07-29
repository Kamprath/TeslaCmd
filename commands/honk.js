const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function honkCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/honk_horn`, {}, accessToken);
}

module.exports = honkCommand;
