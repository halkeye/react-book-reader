'use strict';
import { Dispatcher } from 'flux';
import Constants from '../constants/AppConstants';

const AppDispatcher = Object.assign(new Dispatcher(), {
  handleServerAction(action) {
    const payload = {
      source: Constants.ActionSources.SERVER_ACTION,
      action,
    };
    this.dispatch(payload);
  },

  handleViewAction(action) {
    const payload = {
      source: Constants.ActionSources.VIEW_ACTION,
      action,
    };
    this.dispatch(payload);
  },
});

export default AppDispatcher;
