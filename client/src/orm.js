import { ORM } from 'redux-orm';

import { Activity, Attachment, Board, BoardMembership, Card, Comment, Core, Label, List, Mail, Notification, Project, ProjectManager, Task, User, UserPrefs } from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(User, UserPrefs, Project, ProjectManager, Board, BoardMembership, Label, List, Mail, Card, Comment, Core, Task, Attachment, Activity, Notification);

export default orm;
