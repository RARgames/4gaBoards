module.exports.up = (knex) => knex.schema.raw('ALTER TABLE "user_account" ADD CONSTRAINT "user_sso_email_unique" UNIQUE ("sso_google_email")');

module.exports.down = (knex) => knex.schema.raw('ALTER TABLE "user_account" DROP CONSTRAINT "user_sso_email_unique"');
