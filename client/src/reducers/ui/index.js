import { combineReducers } from 'redux';

import authenticateForm from './authenticate-form';
import categoryTags from './category-tags';
import media from './media';
import membersOverview from './members-overview';
import projectCreateForm from './project-create-form';
import projectMembersOverview from './project-members-overview';
import registerForm from './register-form';
import timeEntries from './time-entries';
import timesheetOverview from './timesheet-overview';
import userCreateForm from './user-create-form';

export default combineReducers({
  authenticateForm,
  categoryTags,
  media,
  membersOverview,
  projectCreateForm,
  projectMembersOverview,
  registerForm,
  timeEntries,
  timesheetOverview,
  userCreateForm,
});
