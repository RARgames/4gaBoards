import { ORM } from 'redux-orm';

import {
  Activity,
  Attachment,
  Board,
  BoardMembership,
  Card,
  CardLink,
  CardMembership,
  ChartView,
  Core,
  Document,
  Label,
  List,
  Notification,
  Project,
  ProjectManager,
  ProjectMembership,
  Task,
  TimeEntry,
  User,
  UserPrefs,
  WikiPage,
} from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(
  User,
  UserPrefs,
  Project,
  ProjectManager,
  ProjectMembership,
  Board,
  BoardMembership,
  Label,
  List,
  Card,
  CardMembership,
  Core,
  Task,
  Attachment,
  Activity,
  Notification,
  CardLink,
  WikiPage,
  Document,
  ChartView,
  TimeEntry,
);

export default orm;
