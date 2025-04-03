/**
 * TaskMembership.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    taskId: {
      model: 'Task',
      required: true,
      columnName: 'task_id',
    },
    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
  },

  tableName: 'task_membership',

  async afterCreate(record, proceed) {
    const [task] = await Task.update({ id: record.taskId }).set({ updatedAt: new Date().toUTCString() }).fetch();
    if (task) {
      const card = await Card.findOne({ id: task.cardId });
      sails.sockets.broadcast(`board:${card.boardId}`, 'taskUpdate', { item: task });
    }
    proceed();
  },

  async afterDestroy(record, proceed) {
    const [task] = await Task.update({ id: record.taskId }).set({ updatedAt: new Date().toUTCString() }).fetch();
    if (task) {
      const card = await Card.findOne({ id: task.cardId });
      sails.sockets.broadcast(`board:${card.boardId}`, 'taskUpdate', { item: task });
    }
    proceed();
  },
};
