import { ActionTypes, DEFAULT_UPLOADER_HANDLE } from './constants';
import { default as reducer } from './reducer';

export default reducer;
export { createReducer } from './reducer';
export { FileStatus, States, Errors, ActionTypes } from './constants';
export { default as createMiddleware } from './middleware';

export function init(options) {
  return { type: ActionTypes.INIT, payload: options };
}

export function setOption(option, value, handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.SET_OPTION, payload: { option, value }, meta: { handle } };
}

export function refresh(handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.REFRESH, meta: { handle } };
}

export function start(handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.START, meta: { handle } };
}

export function stop(handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.STOP, meta: { handle } };
}

export function disableBrowse(disable, handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.DISABLE_BROWSE, payload: { disable }, meta: { handle } };
}

export function addFile(file, fileName, handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.ADD_FILE, payload: { file, fileName }, meta: { handle } };
}

export function removeFile(file, handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.REMOVE_FILE, payload: { file }, meta: { handle } };
}

export function destroy(handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.DESTROY, meta: { handle } };
}

export function splice(handle = DEFAULT_UPLOADER_HANDLE) {
  return { type: ActionTypes.CLEAR, meta: { handle } };
}
