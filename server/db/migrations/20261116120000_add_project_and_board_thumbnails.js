const migrateThumbnails = async (knex, tableName, backgroundColumn, backgroundImageColumn, thumbnailColumn, thumbnailImageColumn) => {
  const items = await knex(tableName).select('id', backgroundColumn, backgroundImageColumn);
  const updates = items.flatMap((item) => {
    const thumbnail = item[backgroundColumn];
    const thumbnailImage = thumbnail?.type === 'image' ? item[backgroundImageColumn] : null;

    if (!thumbnail || (thumbnail.type === 'image' && !thumbnailImage)) {
      return [];
    }

    return [
      knex(tableName)
        .where({ id: item.id })
        .update({
          [thumbnailColumn]: thumbnail,
          [thumbnailImageColumn]: thumbnailImage,
        }),
    ];
  });

  await Promise.all(updates);
};

module.exports.up = async (knex) => {
  await knex.schema.alterTable('project', (table) => {
    table.jsonb('thumbnail');
    table.jsonb('thumbnail_image');
  });
  await knex.schema.alterTable('board', (table) => {
    table.jsonb('thumbnail');
    table.jsonb('thumbnail_image');
  });

  await migrateThumbnails(knex, 'project', 'background', 'background_image', 'thumbnail', 'thumbnail_image');
  await migrateThumbnails(knex, 'board', 'background', 'background_image', 'thumbnail', 'thumbnail_image');
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.dropColumn('thumbnail');
    table.dropColumn('thumbnail_image');
  });
  await knex.schema.alterTable('project', (table) => {
    table.dropColumn('thumbnail');
    table.dropColumn('thumbnail_image');
  });
};
