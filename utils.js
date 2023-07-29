const readline = require('readline');
const axios = require('axios');
const { API_BASE_URL } = require('./constants');

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

function getURLParameterValue(url, paramName) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get(paramName);
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

function getRandomString(length) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset.charAt(randomIndex);
  }
  return randomString;
}

async function wakeVehicle(accessToken, vehicleId) {
  console.log('Waking vehicle...');
  try {
    await postRequest(`${API_BASE_URL}/vehicles/${vehicleId}/wake_up`, {}, accessToken);
  } catch (error) {
    console.log(`Failed to wake vehicle: ${error}`);
  }
}

async function getVehicle(accessToken) {
  console.log('Looking up vehicle...');

  try {
    const response = await getRequest(`${API_BASE_URL}/vehicles`, accessToken);
    const vehicle = response.response[0];

    console.log(`Found vehicle "${vehicle.display_name}" with ID ${vehicle.id_s}`);

    return vehicle;
  } catch (error) {
    return null;
  }
}

async function getVehicleData(accessToken, vehicleId) {
  console.log('Fetching vehicle data...');

  try {
    const vehicleDataResponse = await getRequest(`${API_BASE_URL}/vehicles/${vehicleId}/vehicle_data`, accessToken);
    return vehicleDataResponse.response;
  } catch (error) {
    console.log(`Failed to fetch vehicle data: ${error}`);
    return null;
  }
}

module.exports = {
  getRandomString,
  getRequest,
  getURLParameterValue,
  base64URLEncode,
  postRequest,
  readLine,
  wakeVehicle,
  getVehicle,
  getVehicleData
}