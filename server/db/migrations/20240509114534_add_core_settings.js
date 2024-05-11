module.exports.up = async (knex) => {
  await knex.schema.createTable('core', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.boolean('registration_enabled').defaultTo(true);
    table.boolean('sso_registration_enabled').defaultTo(true);

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

  await knex('core').insert({
    id: 0,
    created_at: new Date(),
    registration_enabled: true,
    sso_registration_enabled: true,
  });
};

module.exports.down = async (knex) => {
  return knex.schema.dropTable('core');
};
