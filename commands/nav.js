const { postRequest } = require('../utils.js');
const { API_BASE_URL } = require('../constants.js');

async function navigate(accessToken, vehicleId, params) {
  try {
    console.log("Sending navigation command...");
    const response = await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/share`, {
      "type": "share_ext_content_raw",
      "value": {
        "android.intent.extra.TEXT": params.join(' ')
      },
      "locale": "en-US",
      "timestamp_ms":  `${Math.floor(Date.now() / 1000)}`
    }, accessToken);
  } catch (error) {
    console.log(`Failed to send navigate command: ${error}`);
  }

  return false;
}

module.exports = navigate;
