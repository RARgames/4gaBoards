/**
 * The card drawer's "Earliest due" row is derived from the card's tasks and
 * duplicates information already visible on the card, so it now starts hidden.
 *
 * The column was added on 2025-10-09 defaulting to false, and every existing
 * row therefore carries an explicit false rather than "unset". Flipping only
 * the column default would change nothing for anyone who already has an
 * account, so existing rows are updated too. Anyone who had deliberately
 * chosen to show the row will need to re-enable it in Preferences; the toggle
 * itself is unchanged and still works in both directions.
 */
exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('hide_closest_due_date').defaultTo(true).alter();
  });

  await knex('user_prefs').update({ hide_closest_due_date: true });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('hide_closest_due_date').defaultTo(false).alter();
  });

  await knex('user_prefs').update({ hide_closest_due_date: false });
};
