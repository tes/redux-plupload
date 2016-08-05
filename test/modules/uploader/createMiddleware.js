import { EventEmitter } from 'events';
import expect from 'expect.js';
import sinonLib from 'sinon';

import { createMiddleware, ActionTypes } from '../../../es6/modules/uploader';

// const noop = () => {};
// const noopStore = {
//   getState: noop,
//   dispatch: noop,
//   foo: true,
// };
//
// function createNoopStore() {
//   return noopStore;
// }

class UploaderClass extends EventEmitter {
  bind(...args) {
    this.on(...args);
  }

  init() {}
  setOption() {}
  start() {}
}

function Uploader() {
  return new UploaderClass();
}

const plupload = { Uploader };

describe('createMiddleware', () => {
  let sinon;
  let uploader;

  beforeEach(() => {
    sinon = sinonLib.sandbox.create();
    uploader = new Uploader();
  });

  afterEach(() => {
    sinon.verifyAndRestore();
  });

  it('returns a function', () => {
    const mw = createMiddleware();
    expect(mw).to.be.a('function');
  });

  it('creates an uploader on INIT', () => {
    const pluploadMock = sinon.mock(plupload);
    pluploadMock.expects('Uploader').once().returns(uploader);
    const mw = createMiddleware(plupload);
    mw({})(() => {})({ type: ActionTypes.INIT });
  });

  it('allows multiple uploaders to be created when an uploaderId is provided on INIT', () => {
    const pluploadMock = sinon.mock(plupload);
    pluploadMock.expects('Uploader').twice().returns(uploader);
    const mw = createMiddleware(plupload);
    mw({})(() => {})({ type: ActionTypes.INIT, payload: { handle: 'uploaderOne' } });
    mw({})(() => {})({ type: ActionTypes.INIT, payload: { handle: 'uploaderTwo' } });
  });

  it('inits and binds to events on INIT', () => {
    sinon.stub(plupload, 'Uploader').returns(uploader);
    const uploaderMock = sinon.mock(uploader);
    uploaderMock.expects('init').once();
    uploaderMock.expects('bind').atLeast(1);
    const mw = createMiddleware(plupload);
    mw({})(() => {})({ type: ActionTypes.INIT });
  });

  it('proxies actions to uploader methods', () => {
    sinon.stub(plupload, 'Uploader').returns(uploader);
    const mock = sinon.mock(uploader);
    mock.expects('setOption').once().withExactArgs('option1', 'value1');
    mock.expects('start').once().withExactArgs();
    const dispatch = createMiddleware(plupload)({})(() => {});
    dispatch({ type: ActionTypes.INIT });
    dispatch({ type: ActionTypes.SET_OPTION, payload: { option: 'option1', value: 'value1' } });
    dispatch({ type: ActionTypes.START });
  });

  it('proxies uploader events to actions', () => {
    sinon.stub(plupload, 'Uploader').returns(uploader);
    const store = { dispatch() {} };
    const storeMock = sinon.mock(store);
    const file = { id: 'fileid1' };
    const action = {
      type: ActionTypes.UPLOAD_FILE,
      payload: file,
      meta: { uploader: { domain: null, handle: 'default' } },
    };
    storeMock.expects('dispatch').once().withExactArgs(action);
    const dispatch = createMiddleware(plupload)(store)(() => {});
    dispatch({ type: ActionTypes.INIT });
    uploader.emit('UploadFile', uploader, file);
  });
});
