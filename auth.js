const crypto = require('crypto');
const { postRequest, readLine, getURLParameterValue, getRandomString, base64URLEncode } = require('./utils');

async function getAccessToken(code, codeVerifier) {
  console.log('Fetching access token...');
  try {
    const response = await postRequest('https://auth.tesla.com/oauth2/v3/token', {
      "grant_type": "authorization_code",
      "client_id": "ownerapi",
      "code": code,
      "code_verifier": codeVerifier,
      "redirect_uri": "https://auth.tesla.com/void/callback"
    });
    return response.access_token;
  } catch (error) {
    return '';
  }
}

async function promptUserForAuthCode(codeChallenge, state) {
  const authUrl = `https://auth.tesla.com/oauth2/v3/authorize?client_id=ownerapi&code_challenge=${codeChallenge}&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fauth.tesla.com%2Fvoid%2Fcallback&response_type=code&scope=openid+email+offline_access+phone&state=${state}&is_in_app=true`
  
  console.log(`Open this URL and login, then copy URL of "Page Not Found" page: \n${authUrl}`);

  const codeUrl = await readLine('\nEnter URL of "Page Not Found" page: ');

  return getURLParameterValue(codeUrl, 'code');
}

function generateCodeChallenge(length) {
  const codeVerifier = getRandomString(length);
  const codeChallenge = sha256(codeVerifier);
  const codeChallengeBase64URL = base64URLEncode(Buffer.from(codeChallenge, 'hex').toString('base64'));
  return { codeVerifier, codeChallenge: codeChallengeBase64URL };
}

function sha256(message) {
  return crypto.createHash('sha256').update(message).digest('hex');
}

module.exports = {
  getAccessToken,
  promptUserForAuthCode,
  generateCodeChallenge,
  sha256
};
