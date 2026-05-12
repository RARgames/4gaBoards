/**
 *  BoardTemplate.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    isGlobal: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_global',
    },
    data: {
      type: 'json',
      required: true,
    },
    createdById: {
      model: 'User',
      required: true,
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
  },

  tableName: 'board_template',
};
