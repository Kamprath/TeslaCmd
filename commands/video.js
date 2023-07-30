const { postRequest } = require('../utils.js');
const { API_BASE_URL } = require('../constants.js');

async function playVideo(accessToken, vehicleId, params) {
  try {
    console.log("Sending video...");
    const response = await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/share`, {
      "type": "share_ext_content_raw",
      "value": {
        "android.intent.extra.TEXT": params[0] || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      "locale": "en-US",
      "timestamp_ms":  `${Math.floor(Date.now() / 1000)}`
    }, accessToken);
  } catch (error) {
    console.log(`Failed to send video: ${error}`);
  }

  return false;
}

module.exports = playVideo;
