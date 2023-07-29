const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function ventCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/window_control`, {
    "command": "vent"
  }, accessToken);
}

module.exports = ventCommand;
