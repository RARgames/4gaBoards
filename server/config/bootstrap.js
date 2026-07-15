/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */
const { setupNotifications } = require('./notifications');
const { setupOIDC } = require('./passport');
const { setupSharp } = require('./sharp');
const { setupSystemNotifications } = require('./system-notifications');

module.exports.bootstrap = async () => {
  setupSharp();
  setupOIDC();
  setupNotifications();
  setupSystemNotifications();
};
