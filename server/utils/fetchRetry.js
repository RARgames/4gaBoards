const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function fetchRetry(url, options = {}, retries = 3, delayMs = 1000) {
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      sails.log.warn(`Fetch failed (status ${res.status}) — attempt ${i + 1}/${retries}`);
    } catch (err) {
      sails.log.warn(`Fetch error — attempt ${i + 1}/${retries}`, err.message);
    }
    if (i < retries - 1) await sleep(delayMs);
  }
  /* eslint-enable no-await-in-loop */
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

async function fetchRetryUntilAvailable(url, options = {}, baseDelayMs = 1000, maxDelayMs = 512000) {
  let attempt = 1;
  let delay = baseDelayMs;

  /* eslint-disable no-await-in-loop */
  while (true) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      sails.log.warn(`Fetch failed (status ${res.status}) — attempt ${attempt}/inf`);
    } catch (err) {
      sails.log.warn(`Fetch error - attempt ${attempt}/inf`, err.message);
    }
    await sleep(delay);
    attempt += 1;
    delay = Math.min(delay * 2, maxDelayMs);
  }
  /* eslint-enable no-await-in-loop */
}

module.exports = {
  fetchRetry,
  fetchRetryUntilAvailable,
};
