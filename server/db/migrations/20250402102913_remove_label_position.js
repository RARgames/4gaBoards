const { addPosition, removePosition } = require('../../utils/migrations');

module.exports.up = (knex) => removePosition(knex, 'label');

module.exports.down = (knex) => addPosition(knex, 'label', 'board_id');
