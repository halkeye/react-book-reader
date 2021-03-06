/* eslint-env jest */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  assetDownloadSuccess,
  assetDownloadError,
  assetDownloadStarted,
  ASSET_MANAGER_INCR_STARTED,
  ASSET_MANAGER_INCR_SUCCESS,
  ASSET_MANAGER_INCR_ERROR
} from './actions.js';

describe('actions', function () {
  it('assetDownloadSuccess', () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadSuccess({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_SUCCESS }
    ]);
  });
  it('assetDownloadError', () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadError({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_ERROR }
    ]);
  });
  it('assetDownloadStarted', () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadStarted({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_STARTED }
    ]);
  });
});
