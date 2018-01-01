'use strict';
import React from 'react';
import { shallow } from 'enzyme';
import { App } from '../../../src/js/components/App.jsx';

describe('App', function () {
  beforeEach(() => {
    this.dispatch = jest.fn();
    this.sot = shallow(<App dispatch={this.dispatch} />);
  });
  it('should compile', () => {
    expect(this.sot).not.toBeNull();
  });
});
