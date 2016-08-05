import expect from 'expect.js';

import { ActionTypes, createReducer, default as reducer } from '../../../es6/modules/uploader';

describe('reducer', () => {
  it('returns state with only the handle when passed undefined and non-uploader action', () => {
    expect(reducer(undefined, { type: 'INIT' })).to.eql({ handle: 'default' });
  });
  it('updates state on uploader actions', () => {
    const uploader = { handle: 'default' };
    const newState = reducer(undefined, { type: ActionTypes.INITING, meta: { uploader } });
    expect(newState).to.be(uploader);
  });
  it('returns old state on actions from uploaders other than the default', () => {
    const uploader = { handle: 'not-default' };
    const oldState = {};
    const newState = reducer(oldState, { type: ActionTypes.INITING, meta: { uploader } });
    expect(newState).to.be(oldState);
  });
  it('returns old state on non-uploader actions', () => {
    const uploader = {};
    const oldState = {};
    const newState = reducer(oldState, { type: 'FOO', meta: { uploader } });
    expect(newState).to.not.be(uploader);
    expect(newState).to.be(oldState);
  });
});

describe('createReducer', () => {
  it('creates a reducer which updates state on its uploader actions', () => {
    const myReducer = createReducer('my-uploader');
    const uploader = { handle: 'my-uploader' };
    const newState = myReducer(undefined, { type: ActionTypes.INITING, meta: { uploader } });
    expect(newState).to.be(uploader);
  });
  it('creates a reducer which returns old state on actions from other uploaders', () => {
    const myReducer = createReducer('my-uploader');
    const uploader = { handle: 'not-my-uploader' };
    const oldState = {};
    const newState = myReducer(oldState, { type: ActionTypes.INITING, meta: { uploader } });
    expect(newState).to.be(oldState);
  });
});
