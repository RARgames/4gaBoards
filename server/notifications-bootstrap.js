const fs = require('fs');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');

const ENV_PATH = path.resolve(__dirname, './.env');
dotenv.config({
  path: ENV_PATH,
});

const NOTIF_HOST = process.env.NOTIFICATIONS_HOST;
const NOTIF_PORT = process.env.NOTIFICATIONS_PORT;

const { API_KEY } = process.env;
const { REDIRECT_URI } = process.env;

function writeEnv(vars) {
  let env = '';
  if (fs.existsSync(ENV_PATH)) {
    env = fs.readFileSync(ENV_PATH, 'utf8');
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (env.match(regex)) {
      env = env.replace(regex, line);
    } else {
      env += `${env.endsWith('\n') || env === '' ? '' : '\n'}${line}`;
    }
  }

  fs.writeFileSync(ENV_PATH, `${env}\n`);
}

function registerClient() {
  const payload = JSON.stringify({
    client_name: '4gaBoards',
    redirect_uri: REDIRECT_URI,
  });

  const options = {
    hostname: NOTIF_HOST,
    port: NOTIF_PORT,
    path: '/api/clients',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      // eslint-disable-next-line no-return-assign
      res.on('data', (chunk) => (data += chunk));
      // eslint-disable-next-line consistent-return
      res.on('end', () => {
        if (res.statusCode !== 201) {
          return reject(new Error(`Unexpected status ${res.statusCode}: ${data}`));
        }
        resolve(JSON.parse(data));
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/* eslint-disable no-console */
/* eslint-disable camelcase */
(async () => {
  console.log('Registering notifications client...');

  const { client_id, client_secret } = await registerClient();

  if (!client_id || !client_secret) {
    throw new Error('Invalid response from notifications API');
  }

  writeEnv({
    NOTIFICATIONS_CLIENT_ID: client_id,
    NOTIFICATIONS_CLIENT_SECRET: client_secret,
  });

  console.log('.env updated successfully');
})().catch((err) => {
  console.error('Notifications bootstrap failed');
  console.error(err.message);
  process.exit(1);
});
