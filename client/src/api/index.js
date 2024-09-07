import http from './http';
import socket from './socket';
import accessTokens from './access-tokens';
import users from './users';
import projects from './projects';
import register from './register';
import projectManagers from './project-managers';
import boards from './boards';
import boardMemberships from './board-memberships';
import core from './core';
import labels from './labels';
import lists from './lists';
import cards from './cards';
import cardMemberships from './card-memberships';
import cardLabels from './card-labels';
import tasks from './tasks';
import attachments from './attachments';
import activities from './activities';
import commentActivities from './comment-activities';
import notifications from './notifications';
import userProjects from './user-projects';

export { http, socket };

export default {
  ...accessTokens,
  ...users,
  ...projects,
  ...register,
  ...projectManagers,
  ...boards,
  ...boardMemberships,
  ...core,
  ...labels,
  ...lists,
  ...cards,
  ...cardMemberships,
  ...cardLabels,
  ...tasks,
  ...attachments,
  ...activities,
  ...commentActivities,
  ...notifications,
  ...userProjects,
};
