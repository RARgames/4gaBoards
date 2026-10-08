const POSITION_GAP = 65535;

module.exports.up = async (knex) => {
  await knex.schema.table('project_membership', (table) => {
    table.specificType('position', 'double precision');
  });

  await knex.raw(
    `
    UPDATE project_membership AS pm
    SET position = sub.new_position
    FROM (
      SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) * ?::double precision AS new_position
      FROM project_membership
    ) AS sub
    WHERE pm.id = sub.id
    `,
    [POSITION_GAP],
  );

  await knex.schema.table('project_membership', (table) => {
    table.dropNullable('position');
    table.index('position');
  });
};

module.exports.down = async (knex) =>
  await knex.schema.table('project_membership', (table) => {
    table.dropColumn('position');
  });
