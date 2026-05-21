// Adds the `priority` text column to `card` and `task`.
//
// The original 20260514130000_add_priorities migration was rewritten in place
// after it had already been applied to deployed databases. Knex tracks migrations
// by filename (not content), so those databases reported "Already up to date" and
// never received the new `priority` column, breaking the priorities feature.
//
// This migration is idempotent: it only adds the column where it is missing, so it
// is safe both on already-migrated databases and on fresh installs that pick the
// column up from the edited 20260514130000 migration.

module.exports.up = async (knex) => {
  if (!(await knex.schema.hasColumn('card', 'priority'))) {
    await knex.schema.alterTable('card', (table) => {
      table.text('priority');
      table.index('priority');
    });
  }

  if (!(await knex.schema.hasColumn('task', 'priority'))) {
    await knex.schema.alterTable('task', (table) => {
      table.text('priority');
      table.index('priority');
    });
  }
};

module.exports.down = async (knex) => {
  if (await knex.schema.hasColumn('task', 'priority')) {
    await knex.schema.alterTable('task', (table) => {
      table.dropColumn('priority');
    });
  }

  if (await knex.schema.hasColumn('card', 'priority')) {
    await knex.schema.alterTable('card', (table) => {
      table.dropColumn('priority');
    });
  }
};
