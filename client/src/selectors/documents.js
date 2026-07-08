import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectDocumentById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Document }, id) => {
      const documentModel = Document.withId(id);

      if (!documentModel) {
        return documentModel;
      }

      return documentModel.ref;
    },
  );

export const selectDocumentById = makeSelectDocumentById();

export const makeSelectDocumentsForProject = () =>
  createSelector(
    orm,
    (_, projectId) => projectId,
    ({ Document }, projectId) =>
      Document.filter({ projectId })
        .toRefArray()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  );

export const selectDocumentsForProject = makeSelectDocumentsForProject();

export default {
  makeSelectDocumentById,
  selectDocumentById,
  makeSelectDocumentsForProject,
  selectDocumentsForProject,
};
