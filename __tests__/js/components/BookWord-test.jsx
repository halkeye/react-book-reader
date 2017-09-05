'use strict';
import React from 'react';
import { shallow } from 'enzyme';
import BookWord from '../../../src/js/components/BookWord.jsx';

describe('BookWord', function () {
  beforeEach(() => {
    const styles = {
      'unread': {
        color: 'red',
        fontPath: '',
        fontFamily: ''
      },
      'read': {
        color: 'blue',
        fontPath: '',
        fontFamily: ''
      },
      'reading': {
        color: 'green',
        fontPath: '',
        fontFamily: ''
      }

    };

    this.sot = shallow(<BookWord word="gav" audioTime={0.0} styles={styles} start={1} end={3} />);
  });
  it('confirm default state is unread', () => {
    expect(this.sot.state('state')).toEqual('unread');
    expect(this.sot.getNodes()[0].props.style.color).toEqual('red');
  });

  it('confirm time before start is unread', () => {
    this.sot.setProps({audioTime: 0.1});
    expect(this.sot.state('state')).toEqual('unread');
    expect(this.sot.getNodes()[0].props.style.color).toEqual('red');
  });

  it('confirm time between start and end is reading', () => {
    this.sot.setProps({audioTime: 1.1});
    expect(this.sot.state('state')).toEqual('reading');
    expect(this.sot.getNodes()[0].props.style.color).toEqual('green');
  });

  it('confirm time after end is read', () => {
    this.sot.setProps({audioTime: 3.1});
    expect(this.sot.state('state')).toEqual('read');
    expect(this.sot.getNodes()[0].props.style.color).toEqual('blue');
  });
});
