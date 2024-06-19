'use strict';
import { Dispatcher } from 'flux';
import Constants from '../constants/AppConstants';

let AppDispatcher = Object.assign(new Dispatcher(), {
  handleServerAction(action) {
    let payload = {
      source: Constants.ActionSources.SERVER_ACTION,
      action: action,
    };
    this.dispatch(payload);
  },

  handleViewAction(action) {
    let payload = {
      source: Constants.ActionSources.VIEW_ACTION,
      action: action,
    };
    this.dispatch(payload);
  },
});

export default AppDispatcher;
