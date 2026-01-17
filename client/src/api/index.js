import accessTokens from './access-tokens';
import activities from './activities';
import attachments from './attachments';
import boardMemberships from './board-memberships';
import boards from './boards';
import cardLabels from './card-labels';
import cardMemberships from './card-memberships';
import cards from './cards';
import comments from './comments';
import core from './core';
import http from './http';
import labels from './labels';
import lists from './lists';
import notifications from './notifications';
import projectManagers from './project-managers';
import projectMemberships from './project-memberships';
import projects from './projects';
import register from './register';
import socket from './socket';
import taskMemberships from './task-memberships';
import tasks from './tasks';
import userPrefs from './user-prefs';
import users from './users';

export { http, socket };

export default {
  ...accessTokens,
  ...activities,
  ...attachments,
  ...boardMemberships,
  ...boards,
  ...cardLabels,
  ...cardMemberships,
  ...cards,
  ...comments,
  ...core,
  ...labels,
  ...lists,
  ...notifications,
  ...projectManagers,
  ...projectMemberships,
  ...projects,
  ...register,
  ...taskMemberships,
  ...tasks,
  ...userPrefs,
  ...users,
};
