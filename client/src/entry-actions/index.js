import activities from './activities';
import attachments from './attachments';
import boardMemberships from './board-memberships';
import boards from './boards';
import cards from './cards';
import comments from './comments';
import core from './core';
import labels from './labels';
import lists from './lists';
import login from './login';
import modals from './modals';
import notifications from './notifications';
import projectManagers from './project-managers';
import projects from './projects';
import socket from './socket';
import tasks from './tasks';
import userPrefs from './user-prefs';
import userProjects from './user-projects';
import users from './users';

export default {
  ...activities,
  ...attachments,
  ...boardMemberships,
  ...boards,
  ...cards,
  ...comments,
  ...core,
  ...labels,
  ...lists,
  ...login,
  ...modals,
  ...notifications,
  ...projectManagers,
  ...projects,
  ...socket,
  ...tasks,
  ...userPrefs,
  ...userProjects,
  ...users,
};
