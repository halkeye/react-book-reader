/* eslint-env jest */

import configureStore from './configureStore.js';
import {
  assetDownloadStarted,
  assetDownloadSuccess,
  assetDownloadError
} from './actions.js';

describe('reducers', function () {
  test('initial state', () => {
    const store = configureStore();
    expect(store.getState().assets).toEqual({ total: null, loaded: null });
  });
  describe('assets', () => {
    describe('assetDownloadStarted', () => {
      it('single started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadStarted({}));
        expect(store.getState().assets).toEqual({ total: 1, loaded: null });
      });
      it('multiple started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadStarted({}));
        store.dispatch(assetDownloadStarted({}));
        store.dispatch(assetDownloadStarted({}));
        expect(store.getState().assets).toEqual({ total: 3, loaded: null });
      });
    });
    describe('assetDownloadSuccess', () => {
      it('single started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadSuccess({}));
        expect(store.getState().assets).toEqual({ total: null, loaded: 1 });
      });
      it('multiple started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadSuccess({}));
        store.dispatch(assetDownloadSuccess({}));
        store.dispatch(assetDownloadSuccess({}));
        expect(store.getState().assets).toEqual({ total: null, loaded: 3 });
      });
    });
    describe('assetDownloadError', () => {
      it('single started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadError({}));
        expect(store.getState().assets).toEqual({ total: null, loaded: 1 });
      });
      it('multiple started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadError({}));
        store.dispatch(assetDownloadError({}));
        store.dispatch(assetDownloadError({}));
        expect(store.getState().assets).toEqual({ total: null, loaded: 3 });
      });
    });
    describe('combo', () => {
      it('single started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadStarted({}));
        store.dispatch(assetDownloadSuccess({}));
        expect(store.getState().assets).toEqual({ total: 1, loaded: 1 });
      });
      it('multiple started', () => {
        const store = configureStore();
        store.dispatch(assetDownloadStarted({}));
        store.dispatch(assetDownloadSuccess({}));
        store.dispatch(assetDownloadStarted({}));
        store.dispatch(assetDownloadSuccess({}));
        expect(store.getState().assets).toEqual({ total: 2, loaded: 2 });
      });
    });
  });
});
