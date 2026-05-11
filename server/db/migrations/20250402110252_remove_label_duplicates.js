module.exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.dropTableIfExists('label_backup');
    await trx.schema.dropTableIfExists('card_label_backup');

    await trx.raw(`
      CREATE TABLE public.label_backup (LIKE public.label INCLUDING ALL);
      INSERT INTO label_backup SELECT * FROM label;

      CREATE TABLE public.card_label_backup (LIKE public.card_label INCLUDING ALL);
      INSERT INTO card_label_backup SELECT * FROM card_label;
    `);

    await trx.raw(`
      WITH duplicates AS (
        SELECT id, name, board_id,
               MIN(id) OVER (PARTITION BY LOWER(name), board_id) AS min_id,
               COUNT(*) OVER (PARTITION BY LOWER(name), board_id) AS count
        FROM label
      )
      DELETE FROM card_label
      WHERE (card_id, label_id) IN (
        SELECT cl.card_id, cl.label_id
        FROM card_label cl
        JOIN duplicates d ON cl.label_id = d.id
        WHERE d.id <> d.min_id AND d.count > 1
        AND EXISTS (
          SELECT 1 FROM card_label cl2
          WHERE cl2.card_id = cl.card_id AND cl2.label_id = d.min_id
        )
      );
    `);
    await trx.raw(`
      WITH duplicates AS (
        SELECT id, name, board_id,
               MIN(id) OVER (PARTITION BY LOWER(name), board_id) AS min_id,
               COUNT(*) OVER (PARTITION BY LOWER(name), board_id) AS count
        FROM label
      )
      UPDATE card_label
      SET label_id = d.min_id
      FROM duplicates d
      WHERE card_label.label_id = d.id AND d.id <> d.min_id AND d.count > 1;
    `);
    await trx.raw(`
      DELETE FROM card_label
      WHERE label_id IN (
        SELECT id FROM label WHERE name IS NULL OR name = ''
      );
    `);
    await trx.raw(`
      DELETE FROM label
      WHERE id NOT IN (
        SELECT MIN(id) FROM label GROUP BY LOWER(name), board_id
      ) OR name IS NULL OR name = '';
    `);
  });
};

module.exports.down = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.dropTableIfExists('label');
    await trx.schema.dropTableIfExists('card_label');

    await trx.raw(`
      CREATE TABLE public.label (LIKE public.label_backup INCLUDING ALL);
      INSERT INTO label SELECT * FROM label_backup;

      CREATE TABLE public.card_label (LIKE public.card_label_backup INCLUDING ALL);
      INSERT INTO card_label SELECT * FROM card_label_backup;
    `);

    await trx.schema.dropTableIfExists('label_backup');
    await trx.schema.dropTableIfExists('card_label_backup');
  });
};
