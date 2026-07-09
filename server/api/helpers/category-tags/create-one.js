const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isString(value.name) || value.name.trim() === '') {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    invalidName: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    const name = values.name.trim();

    const rawResult = await sails.sendNativeQuery(
      `SELECT * FROM category_tag WHERE ${values.projectId ? '"project_id" = $1' : '"project_id" IS NULL'} AND LOWER("name") = LOWER($${values.projectId ? 2 : 1}) LIMIT 1`,
      values.projectId ? [values.projectId, name] : [name],
    );

    if (rawResult.rows[0]) {
      throw 'invalidName';
    }

    return CategoryTag.create({
      name,
      projectId: values.projectId || null,
      createdById: currentUser.id,
    }).fetch();
  },
};
