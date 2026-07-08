import { combineReducers } from 'redux';

import authenticateForm from './authenticate-form';
import media from './media';
import membersOverview from './members-overview';
import projectCreateForm from './project-create-form';
import projectMembersOverview from './project-members-overview';
import registerForm from './register-form';
import timesheetOverview from './timesheet-overview';
import userCreateForm from './user-create-form';

export default combineReducers({
  authenticateForm,
  media,
  membersOverview,
  projectCreateForm,
  projectMembersOverview,
  registerForm,
  timesheetOverview,
  userCreateForm,
});
