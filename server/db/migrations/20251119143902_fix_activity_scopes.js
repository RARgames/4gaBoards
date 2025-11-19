module.exports.up = async (knex) => {
  await knex('action').whereIn('type', ['cardTaskCreate', 'cardTaskUpdate', 'cardTaskDuplicate', 'cardTaskMove', 'cardTaskDelete', 'cardTaskUserAdd', 'cardTaskUserRemove']).update({ scope: 'task' });
  await knex('action').whereIn('type', ['cardAttachmentCreate', 'cardAttachmentUpdate', 'cardAttachmentDelete']).update({ scope: 'attachment' });
  await knex('action').whereIn('type', ['cardComment', 'cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete']).update({ scope: 'comment' });
};

module.exports.down = async (knex) => {
  await knex('action').whereIn('type', ['cardTaskCreate', 'cardTaskUpdate', 'cardTaskDuplicate', 'cardTaskMove', 'cardTaskDelete', 'cardTaskUserAdd', 'cardTaskUserRemove']).update({ scope: 'card' });
  await knex('action').whereIn('type', ['cardAttachmentCreate', 'cardAttachmentUpdate', 'cardAttachmentDelete']).update({ scope: 'card' });
  await knex('action').whereIn('type', ['cardComment', 'cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete']).update({ scope: 'card' });
};
