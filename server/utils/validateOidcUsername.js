function validateOidcUsername(username) {
  if (!username) return null;
  if (username.trim() === '') return null;
  if (username.length < 3 || username.length > 16) return null;
  const regex = /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/;
  if (!regex.test(username)) return null;

  return username;
}

module.exports = {
  validateOidcUsername,
};
