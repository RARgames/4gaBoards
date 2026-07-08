import accessTokens from './access-tokens';
import activities from './activities';
import attachments from './attachments';
import boardMemberships from './board-memberships';
import boards from './boards';
import cardLabels from './card-labels';
import cardLinks from './card-links';
import cardMemberships from './card-memberships';
import cards from './cards';
import chartViews from './chart-views';
import commentActivities from './comment-activities';
import core from './core';
import documents from './documents';
import http from './http';
import labels from './labels';
import lists from './lists';
import media from './media';
import membersOverview from './members-overview';
import notifications from './notifications';
import projectManagers from './project-managers';
import projectMemberships from './project-memberships';
import projects from './projects';
import register from './register';
import socket from './socket';
import taskMemberships from './task-memberships';
import tasks from './tasks';
import timeEntries from './time-entries';
import userPrefs from './user-prefs';
import userProjects from './user-projects';
import users from './users';
import wikiPages from './wiki-pages';

export { http, socket };

export default {
  ...accessTokens,
  ...activities,
  ...attachments,
  ...boardMemberships,
  ...boards,
  ...cardLabels,
  ...cardLinks,
  ...cardMemberships,
  ...cards,
  ...chartViews,
  ...commentActivities,
  ...core,
  ...documents,
  ...labels,
  ...lists,
  ...media,
  ...membersOverview,
  ...notifications,
  ...projectManagers,
  ...projectMemberships,
  ...projects,
  ...register,
  ...taskMemberships,
  ...tasks,
  ...timeEntries,
  ...userPrefs,
  ...userProjects,
  ...users,
  ...wikiPages,
};
