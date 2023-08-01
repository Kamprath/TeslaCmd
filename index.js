const { readLine, getVehicle } = require('./utils');
const { authenticate } = require('./auth');
const { evaluateCommand } = require('./commands');
const wakeVehicle = require('./commands/wake');

(async function(){
  let exit = false;

  const token = await authenticate();    

  if (token === '') {
    console.log('Failed to get access token');
    return;
  }

  const vehicle = await getVehicle(token);

  if (vehicle == null) {
    console.log('Failed to get vehicle information. Re-authenticate and try again.');
    return;
  }
  
  const vehicleId = vehicle.id_s;
  const vehicleName = vehicle.display_name;

  await wakeVehicle(token, vehicleId);

  console.log('\nEnter "help" for a list of commands.\n');

  // prompt for command
  while (!exit) {
    const commandString = await readLine(`${vehicleName}> `);

    exit = await evaluateCommand(commandString, token, vehicleId);
  }
})()