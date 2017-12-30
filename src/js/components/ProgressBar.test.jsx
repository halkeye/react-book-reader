/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProgressBar from './ProgressBar.jsx';

describe('ProgressBar', function () {
  it('compiles', () => {
    const wrapper = shallow(<ProgressBar />);
    expect(wrapper.html()).toEqual(null);
  });
  it('starts with no progress', () => {
    const wrapper = shallow(<ProgressBar total={100} loaded={0} />);
    expect(wrapper.find('.progressbar-progress').props()).toHaveProperty(
      'style',
      { transition: 'width 200ms', width: '0%' }
    );
  });
  it('ends with all progress', () => {
    const wrapper = shallow(<ProgressBar total={100} loaded={100} />);
    expect(wrapper.find('.progressbar-progress').props()).toHaveProperty(
      'style',
      { transition: 'width 200ms', width: '100%' }
    );
  });
  it('cant be more than 100%', () => {
    const wrapper = shallow(<ProgressBar total={100} loaded={200} />);
    expect(wrapper.find('.progressbar-progress').props()).toHaveProperty(
      'style',
      { transition: 'width 200ms', width: '100%' }
    );
  });
  it('progresses along the way', () => {
    const wrapper = shallow(<ProgressBar total={100} loaded={0} />);
    expect(wrapper.find('.progressbar-progress').props()).toHaveProperty(
      'style',
      { transition: 'width 200ms', width: '0%' }
    );
    wrapper.setProps({ loaded: 50 });
    expect(wrapper.find('.progressbar-progress').props()).toHaveProperty(
      'style',
      { transition: 'width 200ms', width: '50%' }
    );
    wrapper.setProps({ loaded: 100 });
    expect(wrapper.find('.progressbar-progress').props()).toHaveProperty(
      'style',
      { transition: 'width 200ms', width: '100%' }
    );
  });
});
