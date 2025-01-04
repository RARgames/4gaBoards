import activities from './activities';
import attachments from './attachments';
import boardMemberships from './board-memberships';
import boards from './boards';
import cards from './cards';
import commentActivities from './comment-activities';
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
import userProjects from './user-projects';
import users from './users';

export default {
  ...activities,
  ...attachments,
  ...boardMemberships,
  ...boards,
  ...cards,
  ...commentActivities,
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
  ...userProjects,
  ...users,
};
