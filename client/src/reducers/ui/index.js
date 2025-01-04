import { combineReducers } from 'redux';

import authenticateForm from './authenticate-form';
import projectCreateForm from './project-create-form';
import registerForm from './register-form';
import userCreateForm from './user-create-form';

export default combineReducers({
  authenticateForm,
  projectCreateForm,
  registerForm,
  userCreateForm,
});
