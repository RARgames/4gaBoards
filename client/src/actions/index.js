import activities from './activities';
import attachments from './attachments';
import boardMemberships from './board-memberships';
import boards from './boards';
import cardLinks from './card-links';
import cards from './cards';
import chartViews from './chart-views';
import commentActivities from './comment-activities';
import core from './core';
import documents from './documents';
import labels from './labels';
import lists from './lists';
import login from './login';
import media from './media';
import membersOverview from './members-overview';
import modals from './modals';
import notifications from './notifications';
import priorities from './priorities';
import projectManagers from './project-managers';
import projectMemberships from './project-memberships';
import projects from './projects';
import router from './router';
import socket from './socket';
import tasks from './tasks';
import timeEntries from './time-entries';
import timesheetOverview from './timesheet-overview';
import userPrefs from './user-prefs';
import userProjects from './user-projects';
import users from './users';
import wikiPages from './wiki-pages';

export default {
  ...activities,
  ...attachments,
  ...boardMemberships,
  ...boards,
  ...cardLinks,
  ...cards,
  ...chartViews,
  ...commentActivities,
  ...core,
  ...documents,
  ...labels,
  ...lists,
  ...login,
  ...media,
  ...membersOverview,
  ...modals,
  ...notifications,
  ...priorities,
  ...projectManagers,
  ...projectMemberships,
  ...projects,
  ...router,
  ...socket,
  ...tasks,
  ...timeEntries,
  ...timesheetOverview,
  ...userPrefs,
  ...userProjects,
  ...users,
  ...wikiPages,
};
