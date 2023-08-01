const crypto = require('crypto');
const { postRequest, readLine, getURLParameterValue, getRandomString, base64URLEncode } = require('./utils');
const fs = require('fs');

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
    return response;
  } catch (error) {
    return '';
  }
}

async function sendRefreshTokenRequest(refreshToken) {
  console.log('Refreshing access token...');
  try {
    const response = await postRequest('https://auth.tesla.com/oauth2/v3/token', {
      "grant_type": "refresh_token",
      "client_id": "ownerapi",
      "refresh_token": refreshToken,
      "scope": "openid email offline_access phone"
    });

    return response;
  } catch (error) {
    return null;
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

async function storeTokenDataToFile(accessToken, refreshToken, minutesToExpiration) {
  const tokenData = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + (minutesToExpiration * 60 * 1000)
  };

  await fs.writeFile('./token.json', JSON.stringify(tokenData), (err) => {
    if (err) {
      console.log('Failed to write token data to file: ', err);
      }
    }
  );
}

async function getTokenDataFromFile() {
  if (fs.existsSync('./token.json')) {
    // read text from token.json file
    const tokenData = await fs.readFileSync('./token.json', 'utf8');
    return JSON.parse(tokenData);
  }

  return null;
}

async function authenticate() {  
  let token = '';
  const codeChallenge = generateCodeChallenge(86);
  const state = getRandomString(16);
  
  const tokenData = await getTokenDataFromFile();
  
  if (tokenData != null) {
    if (tokenData.expiresAt <= Date.now()) {
      // if expired, send refresh token request
      const refreshTokenResponse = await sendRefreshTokenRequest(tokenData.refreshToken);

      if (refreshTokenResponse != null) {
        token = refreshTokenResponse.access_token;
  
        // store token data
        await storeTokenDataToFile(refreshTokenResponse.access_token, refreshTokenResponse.refresh_token, refreshTokenResponse.expires_in);
      }
    } else {
      token = tokenData.accessToken;
    }
  } else {
    // if doesn't exist, prompt user for auth URL
    const code = await promptUserForAuthCode(codeChallenge.codeChallenge, state);
    const tokenResponse = await getAccessToken(code, codeChallenge.codeVerifier);

    if (tokenResponse != null && tokenResponse.access_token != null) {
      token = tokenResponse.access_token;
  
      await storeTokenDataToFile(tokenResponse.access_token, tokenResponse.refresh_token, tokenResponse.expires_in / 60 / 60);
    }
  }

  return token;
}

module.exports = {
  getAccessToken,
  promptUserForAuthCode,
  generateCodeChallenge,
  storeTokenDataToFile,
  sendRefreshTokenRequest,
  getTokenDataFromFile,
  sha256,
  authenticate
};
