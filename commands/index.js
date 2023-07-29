const wake = require('./wake');
const flashCommand = require('./flash');
const honkCommand = require('./honk');
const trunkCommand = require('./trunk');
const frunkCommand = require('./frunk');
const lockCommand = require('./lock');
const unlockCommand = require('./unlock');
const ventCommand = require('./vent');
const closeWindows = require('./close');
const fartCommand = require('./fart');

const commands = {
  'wake': {
    description: 'Wakes up the car',
    usage: 'wake',
    execute: wake
  },

  'flash': {
    description: 'Flashes the lights',
    usage: 'flash',
    execute: flashCommand
  },

  'honk': {
    description: 'Honks the horn',
    usage: 'honk',
    execute: honkCommand
  },

  'trunk': {
    description: 'Opens the trunk',
    usage: 'trunk',
    execute: trunkCommand
  },

  'frunk': {
    description: 'Opens the front trunk',
    usage: 'frunk',
    execute: frunkCommand
  },
  
  'lock': {
    description: 'Lock the car',
    usage: 'lock',
    execute: lockCommand
  },

  'unlock': {
    description: 'Unlock the car',
    usage: 'unlock',
    execute: unlockCommand
  },
  
  'vent': {
    description: 'Vent the windows',
    usage: 'vent',
    execute: ventCommand
  },

  'close': {
    description: 'Close the windows',
    usage: 'close',
    execute: closeWindows
  },

  'nav': {
    description: 'Navigate to an address',
    usage: 'nav <address>',
    execute: () => false
  },

  'location': {
    description: 'Get the current geo location',
    usage: 'location',
    execute: () => false
  },

  'temp': {
    description: 'Set temperature to a value (F)',
    usage: 'temp <value>',
    execute: () => false
  },

  'video': {
    description: 'Play a video on the screen',
    usage: 'video <url>',
    execute: () => false
  },

  'volume': {
    description: 'Set the volume',
    usage: 'volume <value>',
    execute: () => false
  },

  'fart': {
    description: 'Tests emissions system',
    usage: 'fart',
    execute: fartCommand
  },

  'help': {
    description: '',
    usage: 'help [command]',
    execute: displayHelp
  },

  'exit': {
    description: '',
    usage: 'exit',
    execute: () => true
  }
}

async function evaluateCommand(commandString, accessToken, vehicleId) {
  const words = commandString.split(' ');
  const command = [words[0]];
  const params = words.slice(1);

  if (!commands[command]) {
    console.log(`Unknown command "${command}". Type "help" for a list of commands.`);
    return false;
  }

  try {
    return await commands[command].execute(accessToken, vehicleId, params);
  } catch (error) {
    console.log(`Failed to execute command "${command}": ${error}`);
    return false;
  }
}

async function displayHelp() {
  console.log('Available commands:\n');
  
  for (const command in commands) {
    const description = commands[command].description;
    console.log(` ${command}${description ? `  -  ${description}` : ''}`);
  }
  
  console.log('\n');
}

module.exports = {
  commands,
  evaluateCommand
};
