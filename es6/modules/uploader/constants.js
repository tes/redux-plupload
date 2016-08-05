import keymirror from 'keymirror';

// Copied from plupload
export const FileStatus = {
  QUEUED: 1,
  UPLOADING: 2,
  FAILED: 4,
  DONE: 5,
  RESIZING: 6,
};

// Copied from plupload
export const States = {
  STOPPED: 1,
  STARTED: 2,
};

// Copied from plupload
export const Errors = {
  GENERIC_ERROR: -100,
  HTTP_ERROR: -200,
  IO_ERROR: -300,
  SECURITY_ERROR: -400,
  INIT_ERROR: -500,
  FILE_SIZE_ERROR: -600,
  FILE_EXTENSION_ERROR: -601,
  FILE_DUPLICATE_ERROR: -602,
  IMAGE_FORMAT_ERROR: -700,
  MEMORY_ERROR: -701,
  IMAGE_DIMENSIONS_ERROR: -702,
  OPTION_ERROR: -800,
};

export const ActionTypes = keymirror({
  INIT: null,
  SET_OPTION: null,
  REFRESH: null,
  START: null,
  STOP: null,
  DISABLE_BROWSE: null,
  ADD_FILE: null,
  REMOVE_FILE: null,
  DESTROY: null,
  CLEAR: null,

  INITING: null,
  POST_INIT: null,
  OPTION_CHANGED: null,
  REFRESHING: null,
  STATE_CHANGED: null,
  UPLOAD_FILE: null,
  BEFORE_UPLOAD: null,
  QUEUE_CHANGED: null,
  UPLOAD_PROGRESS: null,
  FILES_REMOVED: null,
  FILE_FILTERED: null,
  FILES_ADDED: null,
  FILE_UPLOADED: null,
  CHUNK_UPLOADED: null,
  UPLOAD_COMPLETE: null,
  ERROR: null,
  DESTROYING: null,
});

Object.keys(ActionTypes).forEach(key => { ActionTypes[key] = `redux-plupload/uploader/${key}`; });

export const DEFAULT_UPLOADER_HANDLE = 'default';
