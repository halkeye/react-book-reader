/* eslint-env jest */
import React from 'react';
import { createShallow } from 'material-ui/test-utils';
import { List } from 'immutable';
import BookList from './BookList.jsx';
import BookListItem from '../models/BookListItem.js';

describe('BookList', function () {
  let shallow;
  beforeEach(() => (shallow = createShallow()));
  it('Shows loading screen when no books are available', () => {
    const onChooseBook = jest.fn();
    const wrapper = shallow(<BookList onChooseBook={onChooseBook} />);
    expect(wrapper.text()).toEqual('Loading Books...');
    expect(onChooseBook).not.toHaveBeenCalled();
  });
  it('shows a list of books', () => {
    const onChooseBook = jest.fn();
    const book1 = new BookListItem({
      id: 'book1',
      title: 'Title 1',
      iconBig: 'path/to/iconBig'
    });
    const book2 = new BookListItem({
      id: 'book2',
      title: 'Title 2',
      icon: 'path/to/icon'
    });
    const wrapper = shallow(
      <BookList books={new List([book1, book2])} onChooseBook={onChooseBook} />
    );
    expect(onChooseBook).not.toHaveBeenCalled();
    const elm1 = wrapper.find('div[id="book1"]');
    expect(elm1.find('span').text()).toEqual(book1.title);
    expect(elm1.find('img').props()).toEqual({ src: '' });

    const elm2 = wrapper.find('div[id="book2"]');
    expect(elm2.find('span').text()).toEqual(book2.title);
    expect(elm2.find('img').props()).toEqual({ src: 'path/to/icon' });
  });
  it('Starting with 1 book should immediately select it', () => {
    const onChooseBook = jest.fn();
    const book1 = new BookListItem({
      id: 'book1',
      title: 'Title 1',
      iconBig: 'path/to/iconBig'
    });
    const wrapper = shallow(
      <BookList books={new List([book1])} onChooseBook={onChooseBook} />
    );
    expect(wrapper.html()).toEqual(null);
    expect(onChooseBook).toHaveBeenCalled();
    expect(onChooseBook).toHaveBeenCalledWith(book1);
  });
  it('Starting with 0 books then adding one should get called', () => {
    const onChooseBook = jest.fn();
    const book1 = new BookListItem({
      id: 'book1',
      title: 'Title 1',
      iconBig: 'path/to/iconBig'
    });
    const wrapper = shallow(
      <BookList books={new List([])} onChooseBook={onChooseBook} />
    );
    expect(wrapper.text()).toEqual('Loading Books...');
    expect(onChooseBook).not.toHaveBeenCalled();
    wrapper.setProps({ books: new List([book1]) });
    expect(onChooseBook).toHaveBeenCalled();
    expect(onChooseBook).toHaveBeenCalledWith(book1);
  });
});
