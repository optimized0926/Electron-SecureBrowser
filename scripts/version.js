/* eslint-disable no-console */
const { prompt } = require('enquirer');
const { write } = require('edit-package');
const exec = require('await-exec');
const packageFile = require('../package.json');

async function changeVersion() {
  console.log('Before continuing, be aware that every untracked change in your package.json file will be commited with this version');

  console.log(`CURRENT version : ${packageFile.version}`);
  const response = await prompt({
    type: 'input',
    name: 'version',
    message: 'What is the new version number?',
  });

  await write({ version: response.version });
  await exec('npm run changelog:generate');
  await exec('git add ./changelog-data.json ./package.json');
  await exec(`git commit -m 'version ${response.version}'`);
  await exec(`git tag -a ${response.version} -m 'v${response.version}'`);
  console.log('don\'t forget to push your changes!');
}

changeVersion();
