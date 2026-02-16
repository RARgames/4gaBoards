const http = require('http');
const crypto = require('crypto');

const initKnex = require('knex');
const knexfile = require('./db/knexfile');

const knex = initKnex(knexfile);

const NOTIF_HOST = process.env.NOTIFICATIONS_HOST;
const NOTIF_PORT = process.env.NOTIFICATIONS_PORT;

const CLIENT_ID = process.env.NOTIFICATIONS_CLIENT_ID;
const CLIENT_SECRET = process.env.NOTIFICATIONS_CLIENT_SECRET;
const INSTANCE_URL = process.env.BASE_URL;

function generateCredentials() {
  return {
    client_id: crypto.randomUUID(),
    client_secret: crypto.randomBytes(32).toString('hex'),
    permissions: ['notifications:createCard'],
  };
}

async function getOrCreateApiClient() {
  let client = await knex('api_client').first();

  if (!client) {
    const creds = generateCredentials();

    await knex('api_client').insert({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      permissions: JSON.stringify(creds.permissions),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    client = await knex('api_client').first();

    /* eslint-disable no-console */
    console.log('Generated new api_client:', client.client_id);
  }

  return client;
}

function configureClient(client) {
  const payload = JSON.stringify({
    instance_url: INSTANCE_URL,
    api_client_id: client.client_id,
    api_client_secret: client.client_secret,
  });

  const options = {
    hostname: NOTIF_HOST,
    port: NOTIF_PORT,
    path: '/api/clients/self',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLIENT_ID}:${CLIENT_SECRET}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      // eslint-disable-next-line no-return-assign
      res.on('data', (c) => (data += c));
      // eslint-disable-next-line consistent-return
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Self config failed ${res.statusCode}: ${data}`));
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('Missing NOTIFICATIONS_CLIENT_* env vars');
      process.exit(1);
    }

    const client = await getOrCreateApiClient();

    await configureClient(client);

    console.log('Notifications client configured:', client.client_id);
    process.exit(0);
  } catch (err) {
    console.error('Notifications configuration failed');
    console.error(err.message);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
})();
