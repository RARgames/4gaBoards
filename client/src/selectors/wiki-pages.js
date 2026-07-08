import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectWikiPageById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ WikiPage }, id) => {
      const wikiPageModel = WikiPage.withId(id);

      if (!wikiPageModel) {
        return wikiPageModel;
      }

      return wikiPageModel.ref;
    },
  );

export const selectWikiPageById = makeSelectWikiPageById();

export const makeSelectWikiPagesForProject = () =>
  createSelector(
    orm,
    (_, projectId) => projectId,
    ({ WikiPage }, projectId) =>
      WikiPage.filter({ projectId })
        .toRefArray()
        .sort((a, b) => a.position - b.position),
  );

export const selectWikiPagesForProject = makeSelectWikiPagesForProject();

export const makeSelectWikiPageBySlug = () =>
  createSelector(
    orm,
    (_, projectId) => projectId,
    (_, __, slug) => slug,
    ({ WikiPage }, projectId, slug) => {
      const wikiPageModel = WikiPage.filter({ projectId, slug }).first();

      if (!wikiPageModel) {
        return wikiPageModel;
      }

      return wikiPageModel.ref;
    },
  );

export const selectWikiPageBySlug = makeSelectWikiPageBySlug();

export default {
  makeSelectWikiPageById,
  selectWikiPageById,
  makeSelectWikiPagesForProject,
  selectWikiPagesForProject,
  makeSelectWikiPageBySlug,
  selectWikiPageBySlug,
};
