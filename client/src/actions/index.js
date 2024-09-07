import router from './router';
import socket from './socket';
import login from './login';
import core from './core';
import modals from './modals';
import users from './users';
import projects from './projects';
import projectManagers from './project-managers';
import boards from './boards';
import boardMemberships from './board-memberships';
import labels from './labels';
import lists from './lists';
import cards from './cards';
import tasks from './tasks';
import attachments from './attachments';
import activities from './activities';
import commentActivities from './comment-activities';
import notifications from './notifications';
import userProjects from './user-projects';

export default {
  ...router,
  ...socket,
  ...login,
  ...core,
  ...modals,
  ...users,
  ...projects,
  ...projectManagers,
  ...boards,
  ...boardMemberships,
  ...labels,
  ...lists,
  ...cards,
  ...tasks,
  ...attachments,
  ...activities,
  ...commentActivities,
  ...notifications,
  ...userProjects,
};
