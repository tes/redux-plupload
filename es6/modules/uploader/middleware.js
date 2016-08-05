import contentDisposition from 'content-disposition';

import { ActionTypes, DEFAULT_UPLOADER_HANDLE } from './constants';
import { makeSnapshotFunction } from '../../snapshot';

const actionToMethod = {
  [ActionTypes.SET_OPTION]: ['setOption', ({ option, value }) => [option, value]],
  [ActionTypes.REFRESH]: ['refresh'],
  [ActionTypes.START]: ['start'],
  [ActionTypes.STOP]: ['stop'],
  [ActionTypes.DISABLE_BROWSE]: ['disableBrowse', ({ disable }) => [disable]],
  [ActionTypes.ADD_FILE]: ['addFile', ({ file, fileName }) => [file, fileName]],
  [ActionTypes.REMOVE_FILE]: ['removeFile', ({ file }) => [file]],
  [ActionTypes.DESTROY]: ['destroy'],
  [ActionTypes.CLEAR]: ['splice'],
};

const actionToEvent = {
  [ActionTypes.INITING]: ['Init', () => ({})],
  [ActionTypes.POST_INIT]: ['PostInit', () => ({})],
  [ActionTypes.OPTION_CHANGED]: [
    'OptionChanged',
    (name, value, oldValue) => ({ payload: { name, value, oldValue } }),
  ],
  [ActionTypes.REFRESHING]: ['Refresh', () => ({})],
  [ActionTypes.STATE_CHANGED]: ['StateChanged', () => ({})],
  [ActionTypes.UPLOAD_FILE]: ['UploadFile', (file) => ({ payload: file })],
  [ActionTypes.BEFORE_UPLOAD]: ['BeforeUpload', (file) => ({ payload: file })],
  [ActionTypes.QUEUE_CHANGED]: ['QueueChanged', () => ({})],
  [ActionTypes.UPLOAD_PROGRESS]: ['UploadProgress', (file) => ({ payload: file })],
  [ActionTypes.FILES_REMOVED]: ['FilesRemoved', (files) => ({ payload: files })],
  [ActionTypes.FILE_FILTERED]: ['FileFiltered', (file) => ({ payload: file })],
  [ActionTypes.FILES_ADDED]: ['FilesAdded', (files) => ({ payload: files })],
  [ActionTypes.FILE_UPLOADED]: [
    'FileUploaded',
    (file, response) => ({ payload: file, meta: { response } }),
  ],
  [ActionTypes.CHUNK_UPLOADED]: [
    'ChunkUploaded',
    (file, response) => ({ payload: file, meta: { response } }),
  ],
  [ActionTypes.UPLOAD_COMPLETE]: ['UploadComplete', (files) => ({ payload: files })],
  [ActionTypes.ERROR]: ['Error', (error) => ({ payload: error, error: true })],
  [ActionTypes.DESTROYING]: ['Destroy', () => ({})],
};

const defaults = {
  runtimes: 'html5,html4',
  max_retries: 3,
  multipart: true,
  url: '/this/is/replaced/',
  handle: DEFAULT_UPLOADER_HANDLE,
};

function setupUpload(uploader, file, upload = {}) {
  const { url, multipart_params } = uploader.settings;
  const newUrl = upload.url || url;
  const params = Object.assign({}, multipart_params, upload.params || {});
  if (!params['Content-Type']) {
    params['Content-Type'] = file.type;
  }
  if (!params['Content-Disposition']) {
    params['Content-Disposition'] = contentDisposition(file.name);
  }
  if (uploader.runtime === 'html4') {
    params.redirect = global.location.href;
  }
  uploader.setOption({
    url: newUrl,
    multipart_params: params,
  });
}

function init(store, plupload, options) {
  const uploader = new plupload.Uploader(options);
  uploader.handle = options.handle;
  const snapshot = makeSnapshotFunction();

  uploader.bind('BeforeUpload', (eventUploader, file) => {
    const { uploadSettingsSelector } = options;
    const upload = uploadSettingsSelector ? uploadSettingsSelector(store.getState(), file) : {};

    setupUpload(eventUploader, file, upload);
  });

  Object.keys(actionToEvent).forEach(type => {
    const [event, argsToAction] = actionToEvent[type];
    uploader.bind(event, (...origArgs) => {
      const [uploaderState, ...args] = snapshot(origArgs);
      const action = argsToAction(...args);
      if (!action.meta) action.meta = {};
      action.meta.uploader = uploaderState;
      action.type = type;
      store.dispatch(action);
    });
  });

  uploader.init();
  return uploader;
}

export default function createMiddleware(plupload, origOptions = {}) {
  let uploaders;
  return store => next => action => {
    const { type, payload = {}, meta = {} } = action;
    uploaders = uploaders || {};
    const handle = (type === ActionTypes.INIT ? payload.handle : meta.handle) || defaults.handle;
    const uploader = uploaders[handle];
    if (type === ActionTypes.INIT) {
      if (uploader) throw new Error('INIT called on existing uploader');
      const options = Object.assign({}, defaults, origOptions, payload);
      uploaders[handle] = init(store, plupload, options);
    }
    if (!uploader) return next(action);

    let method = undefined;
    let payloadTransform = undefined;
    switch (type) {
      case ActionTypes.REFRESH:
      case ActionTypes.START:
      case ActionTypes.STOP:
      case ActionTypes.CLEAR:
      case ActionTypes.DESTROY:
        [method] = actionToMethod[type];
        uploader[method].apply(uploader);
        break;
      case ActionTypes.SET_OPTION:
      case ActionTypes.DISABLE_BROWSE:
      case ActionTypes.ADD_FILE:
      case ActionTypes.REMOVE_FILE:
        [method, payloadTransform] = actionToMethod[type] || [];
        uploader[method].apply(uploader, (payloadTransform(payload) || []));
        break;
      default:
        break;
    }

    return next(action);
  };
}
