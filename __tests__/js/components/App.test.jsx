'use strict';
import React from 'react';
import { shallow } from 'enzyme';
import App from '../../../src/js/components/App.jsx';

describe('App', function () {
  beforeEach(() => {
    this.sot = shallow(<App />);
  });
  it('should compile', () => {
    expect(this.sot).not.toBeNull();
  });
});
