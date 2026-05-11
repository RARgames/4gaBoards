module.exports.up = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.integer('comment_count').notNullable().defaultTo(0);
  }).raw(`
    UPDATE card
      SET comment_count = (
        SELECT COUNT(*) FROM action WHERE card_id = card.id AND type = 'commentCard'
      )
  `);

module.exports.down = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.dropColumn('comment_count');
  });
