/* eslint-env jest */

import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";
import axiosMiddleware from "redux-axios-middleware";
import {
  assetDownloadSuccess,
  assetDownloadError,
  assetDownloadStarted,
  assetDownloadReset,
  loadBooks,
  loadBook,
  ASSET_MANAGER_INCR_STARTED,
  ASSET_MANAGER_INCR_SUCCESS,
  ASSET_MANAGER_INCR_ERROR,
  ASSET_MANAGER_RESET
} from "./actions.js";

const client = axios.create({ responseType: "json" });

describe("actions", function() {
  it("assetDownloadSuccess", () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadSuccess({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_SUCCESS }
    ]);
  });
  it("assetDownloadError", () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadError({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_ERROR }
    ]);
  });
  it("assetDownloadStarted", () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadStarted({}));
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_INCR_STARTED }
    ]);
  });
  it("assetDownloadReset", () => {
    const store = configureMockStore([thunk])();
    store.dispatch(assetDownloadReset());
    expect(store.getActions()).toEqual([
      { payload: {}, type: ASSET_MANAGER_RESET }
    ]);
  });
  it("loadBooks", async () => {
    const store = configureMockStore([thunk, axiosMiddleware(client)])();
    await store.dispatch(loadBooks());
    const actions = store.getActions().map(action => {
      delete action.payload.config;
      delete action.payload.request;
      delete action.payload.headers;
      return action;
    });
    expect(actions).toEqual([
      {
        payload: { baseUrl: "https://books.saltystories.ca/" },
        type: "LOAD_BOOK_LIST_ITEMS"
      },
      {
        meta: {
          previousAction: {
            payload: { baseUrl: "https://books.saltystories.ca/" },
            type: "LOAD_BOOK_LIST_ITEMS"
          }
        },
        payload: {
          data: [
            {
              icon: "Josephine/Icon-Small.png",
              iconBig: "Josephine/josephine.png",
              id: "josephine",
              languages: ["en", "fr"],
              title: "Josephine's Saltine",
              url: "Josephine/BookData.json",
              version: 1
            }
          ],
          status: 200,
          statusText: "OK"
        },
        type: "LOAD_BOOK_LIST_ITEMS_SUCCESS"
      }
    ]);
  });
  it.skip("loadBook", async () => {
    const book = {
      id: "josephine",
      url: "https://books.saltystories.ca/books/Josephine/BookData.json"
    };
    const store = configureMockStore([thunk, axiosMiddleware(client)])({
      books: [book]
    });
    await store.dispatch(loadBook("josephine", "en"));
    const realBook = store.getActions()[2].payload.book;
    await Promise.all(realBook.promises);
    console.log("book", realBook);
    return;
    /*
    const actions = store.getActions().map(action => {
      delete action.payload.config;
      delete action.payload.request;
      delete action.payload.headers;
      delete action.$payload;
      return action;
    });
    delete actions[2].payload.book;

    expect(actions).toHaveLength(3);
    expect(actions[0]).toEqual({
      payload: { book },
      type: "LOADING_BOOK"
    });
    expect(actions[1]).toHaveProperty("type", "LOADING_BOOK_SUCCESS");
    expect(actions[1]).toHaveProperty("payload.data.PAGES");
    expect(actions[1]).toHaveProperty("payload.data.STYLES");
    expect(actions[2]).toHaveProperty("type", "LOADED_BOOK");
    expect(actions[2]).toHaveProperty("payload.book");
    */
    return true;
  });
});
