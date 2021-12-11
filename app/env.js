const fs = require('fs')
const dotenv = require('dotenv')
const envConfig = dotenv.parse(fs.readFileSync(process.env.MODE === 'debug' ? '.env.development'  : '.env'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}
function getEnvVar(key) {
    switch(key) {
        case 'auth0_domain':
            return process.env.auth0_domain;
        case 'auth0_client_id':
            return process.env.auth0_client_id;
        case 'unsplash_access':
            return process.env.unsplash_access;
        case 'unsplash_secret':
            return process.env.unsplash_secret;
        case 'MONGODB_URL':
            return process.env.MONGODB_URL;
        default:
            return '';
    }
}
module.exports = {
    getEnvVar
};