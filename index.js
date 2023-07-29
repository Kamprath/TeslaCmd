const { readLine, getRandomString, getVehicle } = require('./utils');
const { getAccessToken, promptUserForAuthCode, generateCodeChallenge } = require('./auth');
const { evaluateCommand } = require('./commands');
const wakeVehicle = require('./commands/wake');

(async function(){
  const codeChallenge = generateCodeChallenge(86);
  const state = getRandomString(16);
  let exit = false;

  // todo: optionally store token information in a file and attempt to load it here

  // prompt for access token, or blank
  let accessToken = await readLine('Enter access token (or leave blank to authenticate): ');

  // if blank, prompt user for auth URL
  if (accessToken == '') {
    const code = await promptUserForAuthCode(codeChallenge.codeChallenge, state);
    accessToken = await getAccessToken(code, codeChallenge.codeVerifier);
    console.log(`Access token:\n${accessToken}\n`);
  }
  
  if (accessToken == '') {
    console.log('Failed to get access token');
    return;
  }

  const vehicle = await getVehicle(accessToken);

  if (vehicle == null) {
    console.log('Failed to get vehicle information. Re-authenticate and try again.');
    return;
  }
  
  const vehicleId = vehicle.id_s;
  const vehicleName = vehicle.display_name;

  // wake vehicle
  await wakeVehicle(accessToken, vehicleId);

  console.log('\nEnter "help" for a list of commands.\n');

  // prompt for command
  while (!exit) {
    const commandString = await readLine(`${vehicleName}> `);

    exit = await evaluateCommand(commandString, accessToken, vehicleId);
  }
})()