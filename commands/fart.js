const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function fartCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/remote_boombox`, {
    "action": 0
  }, accessToken);
}

module.exports = fartCommand;
