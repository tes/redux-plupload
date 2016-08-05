import { ActionTypes, DEFAULT_UPLOADER_HANDLE } from './constants';

export function createReducer(handle = DEFAULT_UPLOADER_HANDLE) {
  return function reducer(state = { handle }, { type, meta: { uploader } = {} }) {
    switch (type) {
      case ActionTypes.INITING:
      case ActionTypes.POST_INIT:
      case ActionTypes.OPTION_CHANGED:
      case ActionTypes.REFRESHING:
      case ActionTypes.STATE_CHANGED:
      case ActionTypes.UPLOAD_FILE:
      case ActionTypes.BEFORE_UPLOAD:
      case ActionTypes.QUEUE_CHANGED:
      case ActionTypes.UPLOAD_PROGRESS:
      case ActionTypes.FILES_REMOVED:
      case ActionTypes.FILE_FILTERED:
      case ActionTypes.FILES_ADDED:
      case ActionTypes.FILE_UPLOADED:
      case ActionTypes.CHUNK_UPLOADED:
      case ActionTypes.UPLOAD_COMPLETE:
      case ActionTypes.ERROR:
      case ActionTypes.DESTROYING:
        return uploader.handle === handle ? uploader : state;
      default:
        return state;
    }
  };
}

export default createReducer();
