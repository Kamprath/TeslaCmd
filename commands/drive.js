const { postRequest } = require('../utils');
const { API_BASE_URL } = require('../constants');

async function drive(accessToken, vehicleId) {
    try {
        await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/remote_start_drive`, {}, accessToken);
    } catch (error) {
        console.log(`Failed to send drive command: ${error}`);
    }

    return false;
}

module.exports = drive;
