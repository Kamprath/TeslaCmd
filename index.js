const crypto = require('crypto');
const readline = require('readline');
const axios = require('axios');

const API_BASE_URL = 'https://owner-api.teslamotors.com/api/1/';

const commands = {
  'wake': {
    description: 'Wakes up the car',
    execute: wakeVehicle
  },

  'fart': {
    description: 'Tests emissions system',
    execute: fartCommand
  },

  'honk': {
    description: 'Honks the horn',
    execute: honkCommand
  },

  'trunk': {
    description: 'Opens the trunk',
    execute: trunkCommand
  },

  'frunk': {
    description: 'Opens the front trunk',
    execute: frunkCommand
  },

  'flash': {
    description: 'Flashes the lights',
    execute: flashCommand
  },
  
  'unlock': {
    description: 'Unlock the car',
    execute: unlockCommand
  },
  
  'lock': {
    description: 'Lock the car',
    execute: lockCommand
  },
  
  'vent': {
    description: 'Vent the windows',
    execute: ventCommand
  },
  
  'close': {
    description: 'Close the windows',
    execute: closeWindows
  },

  'help': {
    description: '',
    execute: helpCommand
  },

  'exit': {
    description: '',
    execute: () => true
  }
}

function generateRandomString(length) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset.charAt(randomIndex);
  }
  return randomString;
}

function generateCodeChallenge() {
  const codeVerifier = generateRandomString(86);
  const codeChallenge = sha256(codeVerifier);
  const codeChallengeBase64URL = base64URLEncode(Buffer.from(codeChallenge, 'hex').toString('base64'));
  return { codeVerifier, codeChallenge: codeChallengeBase64URL };
}

async function getRequest(url, accessToken) {
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.log(`Failed to submit GET request to ${url}: ${error}`);
    return null;
  }
}

async function postRequest(url, data, accessToken) {
  const headers = {
    'Content-Type': 'application/json'
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.log(`Failed to submit POST request to ${url}: ${error}`);
    return null;
  }
}

function getURLParameterValue(url, paramName) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get(paramName);
}

function sha256(message) {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function base64URLEncode(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function readLine(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function promptUserForAuthCode(codeChallenge, state) {
  const authUrl = `https://auth.tesla.com/oauth2/v3/authorize?client_id=ownerapi&code_challenge=${codeChallenge}&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fauth.tesla.com%2Fvoid%2Fcallback&response_type=code&scope=openid+email+offline_access+phone&state=${state}&is_in_app=true`
  
  console.log(`Open this URL and login, then copy URL of "Page Not Found" page: \n${authUrl}`);

  const codeUrl = await readLine('\nEnter URL of "Page Not Found" page: ');

  return getURLParameterValue(codeUrl, 'code');
}

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

async function lockCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/door_lock`, {}, accessToken);
}

async function ventCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/window_control`, {
    "command": "vent"
  }, accessToken);
}

async function closeWindows(accessToken, vehicleId) {
  console.log('Fetching vehicle data (GPS info required to close windows)...');
  const vehicleDataResponse = await getRequest(`${API_BASE_URL}/vehicles/${vehicleId}/vehicle_data`, accessToken);
  const vehicleData = vehicleDataResponse.response;

  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/window_control`, {
    "command": "close",
    "lat": vehicleData.drive_state.latitude,
    "lon": vehicleData.drive_state.longitude
  }, accessToken);
}

async function unlockCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/door_unlock`, {}, accessToken);
}

async function flashCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/flash_lights`, {}, accessToken);
}

async function fartCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/remote_boombox`, {
    "action": 0
  }, accessToken);
}

async function trunkCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/actuate_trunk`, {
    "which_trunk": "rear"
  }, accessToken);
}

async function frunkCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/actuate_trunk`, {
    "which_trunk": "front"
  }, accessToken);
}

async function honkCommand(accessToken, vehicleId) {
  await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/command/honk_horn`, {}, accessToken);
}

async function getVehicle(accessToken) {
  try {
    const response = await getRequest(`${API_BASE_URL}/vehicles`, accessToken);
    const vehicle = response.response[0];

    console.log(`Found vehicle "${vehicle.display_name}" with ID ${vehicle.id_s}`);

    return vehicle;
  } catch (error) {
    return null;
  }
}

async function wakeVehicle(accessToken, vehicleId) {
  console.log('Waking vehicle...');
  try {
    await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/wake_up`, {}, accessToken);
  } catch (error) {
    console.log(`Failed to wake vehicle: ${error}`);
  }
}

async function helpCommand() {
  console.log('Available commands:\n');

  for (const command in commands) {
    console.log(` ${command} - ${commands[command].description}`);
  }

  console.log('\n');
}

async function evaluateCommand(commandString, accessToken, vehicleId) {
  const words = commandString.split(' ');
  const command = [words[0]];
  const params = words.slice(1);

  if (!commands[command]) {
    console.log(`Unknown command "${command}". Type "help" for a list of commands.`);
    return false;
  }

  return await commands[command].execute(accessToken, vehicleId, params);
}

(async function(){
  const codeChallenge = generateCodeChallenge();
  const state = generateRandomString(16);
  let exit = false;

  // step 1: prompt for access token, or blank
  let accessToken = await readLine('Enter access token (or leave blank to authenticate): ');

  // step 2: if blank, prompt user for auth URL
  if (accessToken == '') {
    const code = await promptUserForAuthCode(codeChallenge.codeChallenge, state);
    accessToken = await getAccessToken(code, codeChallenge.codeVerifier);
    console.log(`Access token:\n${accessToken}\n`);
  }
  
  if (accessToken == '') {
    console.log('Failed to get access token');
    return;
  }

  // step 3: get vehicle ID for use with commands
  const vehicle = await getVehicle(accessToken);

  if (vehicle == null) {
    console.log('Failed to get vehicle information');
    return;
  }

  // step 4: wake vehicle
  await wakeVehicle(accessToken, vehicle.id_s);

  console.log('\nEnter "help" for a list of commands.\n');

  // step 5: prompt for command
  while (!exit) {
    const commandString = await readLine(`${vehicle.display_name}> `);

    exit = await evaluateCommand(commandString, accessToken, vehicle.id_s);
  }
})()