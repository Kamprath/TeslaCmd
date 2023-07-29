const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function trunkCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/actuate_trunk`, {
    "which_trunk": "rear"
  }, accessToken);
}

module.exports = trunkCommand;