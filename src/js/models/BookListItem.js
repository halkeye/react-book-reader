import { Record } from 'immutable';

const BookListRecordClass = Record({
  id: null,
  title: 'Unknown Book',
  url: '',
  icon: '',
  iconBig: '',
  version: 1,
  languages: ['en']
});

export default class BookListItem extends BookListRecordClass {
  get iconBig () {
    return this.iconBig || this.icon;
  }
}
