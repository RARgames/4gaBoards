import attachments from './attachments';
import boardMemberships from './board-memberships';
import boards from './boards';
import cards from './cards';
import core from './core';
import labels from './labels';
import lists from './lists';
import modals from './modals';
import projectManagers from './project-managers';
import projects from './projects';
import router from './router';
import socket from './socket';
import tasks from './tasks';
import users from './users';

export default {
  ...attachments,
  ...boardMemberships,
  ...boards,
  ...cards,
  ...core,
  ...labels,
  ...lists,
  ...modals,
  ...projectManagers,
  ...projects,
  ...router,
  ...socket,
  ...tasks,
  ...users,
};
