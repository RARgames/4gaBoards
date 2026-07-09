import attachments from './attachments';
import boardMemberships from './board-memberships';
import boards from './boards';
import cardLinks from './card-links';
import cards from './cards';
import categoryTags from './category-tags';
import chartViews from './chart-views';
import core from './core';
import gantt from './gantt';
import documents from './documents';
import labels from './labels';
import lists from './lists';
import media from './media';
import membersOverview from './members-overview';
import modals from './modals';
import projectManagers from './project-managers';
import projectMemberships from './project-memberships';
import projects from './projects';
import router from './router';
import socket from './socket';
import tasks from './tasks';
import timeEntries from './time-entries';
import timesheetOverview from './timesheet-overview';
import userPrefs from './user-prefs';
import users from './users';
import wikiPages from './wiki-pages';

export default {
  ...attachments,
  ...boardMemberships,
  ...boards,
  ...cardLinks,
  ...cards,
  ...categoryTags,
  ...chartViews,
  ...core,
  ...gantt,
  ...documents,
  ...labels,
  ...lists,
  ...media,
  ...membersOverview,
  ...modals,
  ...projectManagers,
  ...projectMemberships,
  ...projects,
  ...router,
  ...socket,
  ...tasks,
  ...timeEntries,
  ...timesheetOverview,
  ...userPrefs,
  ...users,
  ...wikiPages,
};
