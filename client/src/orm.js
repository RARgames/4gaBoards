import { ORM } from 'redux-orm';

import { Activity, Attachment, Board, BoardMembership, Card, Core, Label, List, Mail, Notification, Project, ProjectManager, Task, User, UserPrefs } from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(User, UserPrefs, Project, ProjectManager, Board, BoardMembership, Label, List, Mail, Card, Core, Task, Attachment, Activity, Notification);

export default orm;
