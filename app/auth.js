const { setPassword, getPassword, deletePassword } = require('keytar');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const fetch = require('node-fetch');
const ms = require('ms');
const { getEnvVar } = require('./env');

let loggedIn = false;
let client;

async function requestOtp(email) {
    console.log(getEnvVar('auth0_domain'));
    const res = await fetch(`https://${getEnvVar('auth0_domain')}/passwordless/start`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            client_id: getEnvVar('auth0_client_id'),
            connection: 'email',
            email,
            send: 'code'
        })
    });
    if (!res.ok) throw new Error(res.statusText);
    return true;
}

async function verifyOtp(email, otp) {
    const res = await fetch(`https://${getEnvVar('auth0_domain')}/oauth/token`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            client_id: getEnvVar('auth0_client_id'),
            realm: 'email',
            grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
            username: email,
            scope: 'openid offline_access',
            otp
        })
    });
    if (!res.ok) throw new Error(res.statusText);
    const { refresh_token, access_token, id_token, expires_in } = await res.json();
    await setPassword('Lagatos Browser', 'login', JSON.stringify({ refreshToken: refresh_token, accessToken: access_token, idToken: id_token, expires: expires_in }));
    loggedIn = true;
}

async function isAuthenticated() {
    // No need to check again if checked before.
    if (loggedIn) return true;
    try {
        await getVerifiedKeystoreData();
        loggedIn = true;
    } catch (e) {
        // console.log(JSON.stringify(e));
        loggedIn = false;
    }
    return loggedIn;
}

async function refreshAccessToken(refreshToken) {
    const res = await fetch(`https://${getEnvVar('auth0_domain')}/oauth/token`, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: querystring.stringify({
            client_id: getEnvVar('auth0_client_id'),
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    });
    if (!res.ok) throw new Error(res.statusText);
    const { access_token, id_token, expires_in } = await res.json();
    const record = { refreshToken, accessToken: access_token, idToken: id_token, expires: expires_in };
    await setPassword('Lagatos Browser', 'login', JSON.stringify(record));
    return record;
}

async function getUserInfo() {
    const access_token = await getTokenSilently();
    const res = await fetch(`https://${getEnvVar('auth0_domain')}/userinfo`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
    if (!res.ok) throw new Error(res.statusText);
    const userData = await res.json();
    return userData;
}

async function getUser() {
    const authorized = await isAuthenticated();
    if (!authorized) throw new Error('No user found.');
    const { idToken } = await getVerifiedKeystoreData();
    const { payload } = jwt.decode(idToken, { complete: true });
    return payload;
}

async function getIdToken() {
    const authorized = await isAuthenticated();
    if (!authorized) throw new Error('No user found.');
    const { idToken } = await getVerifiedKeystoreData();
    return idToken;
}

async function getTokenSilently() {
    const authorized = await isAuthenticated();
    if (!authorized) throw new Error('No user found.');
    const { accessToken } = await getVerifiedKeystoreData();
    return accessToken;
}

async function getVerifiedKeystoreData() {
    let record;
    const data = await getPassword('Lagatos Browser', 'login');
    if (!data) throw new Error({ name: 'RecordNotFound', message: 'No record found in keystore.' });
    record = JSON.parse(data);
    const { header } = jwt.decode(record.idToken, { complete: true });
    const publicKey = await getPublicKey(header.kid);
    try {
        jwt.verify(record.idToken, publicKey);
    } catch (e) {
        if (e.name !== 'TokenExpiredError') throw e;
        record = await refreshAccessToken(record.refreshToken);
    }
    return record;
}

async function logout() {
    loggedIn = false;
    await deletePassword('Lagatos Browser', 'login');
    this.sender.webContents.loadURL('lagatos://start');
}

function getPublicKey(kid) {
    if (!client) {
        client = jwksClient({
            jwksUri: `https://${getEnvVar('auth0_domain')}/.well-known/jwks.json`,
            timeout: ms('6h')
        });
    }
    return new Promise((resolve, reject) => {
        client.getSigningKey(kid, (err, key) => {
            if (err) { reject(err); return; };
            const signingKey = key.publicKey || key.rsaPublicKey;
            resolve(signingKey);
        });
    });
}

module.exports = {
    isAuthenticated,
    verifyOtp,
    requestOtp,
    getUser,
    getUserInfo,
    getIdToken,
    getTokenSilently,
    logout
};