// https://gist.github.com/etcinit/7859b3380ea75020e130

// NOTE: This file is formatted for React.js + Browserify
// You might need to make some changes to use it without Browserify
import Mousetrap from 'br-mousetrap';
('use strict');

let MousetrapMixin;

MousetrapMixin = {
  /**
   * Array for keeping track of shortcuts bindings
   */
  mousetrapBindings: [],

  /**
   * Bind a function to a keyboard shortcut
   *
   * @param key
   * @param callback
   */
  bindShortcut(key, callback) {
    Mousetrap.bind(key, callback);

    this.mousetrapBindings.push(key);
  },

  /**
   * Unbind a keyboard shortcut
   *
   * @param key
   */
  unbindShortcut(key) {
    const index = this.mousetrapBindings.indexOf(key);

    if (index > -1) {
      this.mousetrapBindings.splice(index, 1);
    }

    Mousetrap.unbind(key);
  },

  /**
   * Remove any Mousetrap bindings
   */
  unbindAllShortcuts() {
    if (this.mousetrapBindings.length === 0) {
      return;
    }

    for (const binding of this.mousetrapBindings) {
      Mousetrap.unbind(binding);
    }
  },

  /**
   * Handle component unmount
   */
  componentWillUnmount() {
    // Remove any Mousetrap bindings before unmounting
    this.unbindAllShortcuts();
  },
};

export default MousetrapMixin;
