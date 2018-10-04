# Redux-plupload

[FSA](https://github.com/acdlite/flux-standard-action)-compliant [Redux](https://github.com/reactjs/redux) bindings for [Plupload](https://github.com/moxiecode/plupload).

[![npm version](https://badge.fury.io/js/redux-plupload.svg)](https://badge.fury.io/js/redux-plupload)
[![Build Status](https://travis-ci.org/tes/redux-plupload.svg?branch=master)](https://travis-ci.org/tes/redux-plupload)
![Dependency Status](https://david-dm.org/tes/redux-plupload.svg)
[![GitHub license](https://img.shields.io/github/license/tes/redux-plupload.svg)](https://github.com/tes/redux-plupload/blob/master/LICENSE)

## Overview

`redux-plupload` helps you use Redux actions for bi-directional communication with a `plupload` uploader instance.

You can dispatch an action to call a `plupload` method. For example, to start an upload:

```js
// action.js
dispatch({ type: ActionTypes.START })
```

And `redux-plupload` will dispatch an action so you know when a `plupload` event occurs. For example, when `plupload` reports on upload progress:

```js
// reducer.js
if (action.type === ActionTypes.UPLOAD_PROGRESS) {
  console.log('Uploading file', action.payload.name);
  console.log('Percent complete', action.payload.percent);
}
```

## Usage

### Getting started

To use `redux-plupload`, you must install the middleware (and optionally the reducer), then send an `ActionTypes.INIT` message to init the `plupload.Uploader`.  The `payload` of the action should include a `browse_button` (and optionaly `dropzone`) prop.  You can also specify `url` and `multipart_params` props at `INIT` time, or provide an `uploadSettingsSelector` that will be called with `state` and `file` as args to find the extra per-file upload settings.
```js
// client.js
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { reducer as uploaderReducer, createMiddleware as createUploaderMiddleware } from 'redux-plupload';

import UploadButton from './UploadButton';

const reducer = combineReducers({ uploader: uploaderReducer });
const uploadSettingsSelector = (state, file) => sate.path.to.server.upload.settings.for[file.id];
const uploaderMiddleware = createUploaderMiddleware(global.plupload, { uploadSettingsSelector });
const store = createStore(
  reducer,
  {},
  applyMiddleware(uploaderMiddleware)
);

ReactDOM.render(
  <Provider store={store}>
    <UploadButton />
  </Provider>,
  global.document.getElementById('js-app')
);

```
```js
// UploadButton.js
import { connect } from 'redux';
import { ActionTypes } from 'redux-plupload';

const uploaderInit(payload) => ({ type: ActionTypes.INIT, payload });

class UploadButton extends Component {
  componentDidMount() {
    this.props.initUploader({ browse_button: this._browseButton });
  }

  render() {
    return (
      <button
        type="button"
        ref={(browseButton) => (this._browseButton = browseButton)}
      >Upload Files</button>
    );
  }
}

export default connect(
  () => ({}),
  (dispatch) => ({ initUploader: (payload) => dispatch(uploaderInit(payload)) })
)(UploadButton);
```
Once you've `INIT`ed `redux-plupload`, it will call the `plupload.Uploader`'s methods in response to actions, and emit actions based on the events that the `plupload.Uploader` emits (with a few name-changes where they clash).  If you install the reducer, it will keep its state up to date with a copy of the `plupload.Uploader` state.

### Calling `plupload` methods

Here is a list of `plupload` methods and the actions you can dispatch to call that method on the uploader instance:

__[init](http://www.plupload.com/docs/Uploader#init--method)__
```js
dispatch ({ type: ActionTypes.INIT, payload: options });
```

__[setOption](http://www.plupload.com/docs/Uploader#setOption-optionvalue-method)__
```js
dispatch ({ type: ActionTypes.SET_OPTION, payload: { option, value } });
```

__[refresh](http://www.plupload.com/docs/Uploader#refresh--method)__
```js
dispatch ({ type: ActionTypes.REFRESH });
```

__[start](http://www.plupload.com/docs/Uploader#start--method)__
```js
dispatch ({ type: ActionTypes.START });
```

__[stop](http://www.plupload.com/docs/Uploader#stop--method)__
```js
dispatch ({ type: ActionTypes.STOP });
```

__[disableBrowse](http://www.plupload.com/docs/Uploader#disableBrowse-disable-method)__
```js
dispatch ({ type: ActionTypes.DISABLE_BROWSE, payload: { disable } });
```

__[addFile](http://www.plupload.com/docs/Uploader#addFile-filefileName-method)__
```js
dispatch ({ type: ActionTypes.ADD_FILE, payload: { file, fileName } });
```

__[removeFile](http://www.plupload.com/docs/Uploader#removeFile-file-method)__
```js
dispatch ({ type: ActionTypes.REMOVE_FILE, payload: { file } });
```

__[destroy](http://www.plupload.com/docs/Uploader#destroy--method)__
```js
dispatch ({ type: ActionTypes.DESTROY });
```

__[splice](http://www.plupload.com/docs/Uploader#splice-startlength-method)__
```js
dispatch ({ type: ActionTypes.CLEAR });
```

### Listening for `plupload` events

The following actions will be dispatched when `plupload` events occur.
Each action's `meta` property will also contain the `uploader` as shown in the first example below.
(If the `{}` syntax is new to you, take a look at [ES6 Object Destructuring](http://exploringjs.com/es6/ch_destructuring.html).)

__[Init](http://www.plupload.com/docs/Uploader#Init-event)__
```js
if (action.type === ActionTypes.INITING) {
  const { uploader } = action.meta;
}
```

__[PostInit](http://www.plupload.com/docs/Uploader#PostInit-event)__
```js
if (action.type === ActionTypes.POST_INIT) {
   //
}
```

__[OptionChanged](http://www.plupload.com/docs/Uploader#OptionChanged-event)__
```js
if (action.type === ActionTypes.OPTION_CHANGED) {
   const { name, value, oldValue } = action.payload;
}
```

__[Refresh](http://www.plupload.com/docs/Uploader#Refresh-event)__
```js
if (action.type === ActionTypes.REFRESHING) {
   //
}
```

__[StateChanged](http://www.plupload.com/docs/Uploader#StateChanged-event)__
```js
if (action.type === ActionTypes.STATE_CHANGED) {
   //
}
```

__[UploadFile](http://www.plupload.com/docs/Uploader#UploadFile-event)__
```js
if (action.type === ActionTypes.UPLOAD_FILE) {
   const { file } = action.payload;
}
```

__[BeforeUpload](http://www.plupload.com/docs/Uploader#BeforeUpload-event)__
```js
if (action.type === ActionTypes.BEFORE_UPLOAD) {
   const { file } = action.payload;
}
```

__[QueueChanged](http://www.plupload.com/docs/Uploader#QueueChanged-event)__
```js
if (action.type === ActionTypes.QUEUE_CHANGED) {
   //
}
```

__[UploadProgress](http://www.plupload.com/docs/Uploader#UploadProgress-event)__
```js
if (action.type === ActionTypes.UPLOAD_PROGRESS) {
   const { file } = action.payload;
}
```

__[FilesRemoved](http://www.plupload.com/docs/Uploader#FilesRemoved-event)__
```js
if (action.type === ActionTypes.FILES_REMOVED) {
   const { files } = action.payload;
}
```

__[FileFiltered](http://www.plupload.com/docs/Uploader#FileFiltered-event)__
```js
if (action.type === ActionTypes.FILE_FILTERED) {
   const { file } = action.payload;
}
```

__[FilesAdded](http://www.plupload.com/docs/Uploader#FilesAdded-event)__
```js
if (action.type === ActionTypes.FILES_ADDED) {
   const { files } = action.payload;
}
```

__[FileUploaded](http://www.plupload.com/docs/Uploader#FileUploaded-event)__
```js
if (action.type === ActionTypes.FILE_UPLOADED) {
   const { file } = action.payload;
   const { response } = action.meta;
}
```

__[ChunkUploaded](http://www.plupload.com/docs/Uploader#ChunkUploaded-event)__
```js
if (action.type === ActionTypes.CHUNK_UPLOADED) {
  const { file } = action.payload;
  const { response } = action.meta;
}
```

__[UploadComplete](http://www.plupload.com/docs/Uploader#UploadComplete-event)__
```js
if (action.type === ActionTypes.UPLOAD_COMPLETE) {
  const { files } = action.payload;
}
```

__[Error](http://www.plupload.com/docs/Uploader#Error-event)__
```js
if (action.type === ActionTypes.ERROR) {
  const { error } = action.payload;
  console.log(action.error); // this flag will be set to true
}
```

__[Destroy](http://www.plupload.com/docs/Uploader#Destroy-event)__
```js
if (action.type === ActionTypes.DESTROYING) {
  //
}
```

### Multiple uploaders

If you need to have more than one upload button or dropzone on a page, you can use `redux-plupload` to manage multiple uploader instances. This can be done by specifying a unique `handle` (a nickname) for each uploader on every interaction. If no `handle` is specified, the interaction is assumed to be with the default uploader instance.

__Initialising an uploader with a handle__:


```js
const options = {
  handle: 'myUploader',
  // other options
};
dispatch ({ type: ActionTypes.INIT, payload: options });
```

__Calling methods on a specific uploader__

```js
dispatch ({ type: ActionTypes.START, meta: { handle: 'myUploader' } });
```

__Listening for events from a specific uploader__

```js
if (action.type === ActionTypes.FILES_ADDED) {
   const { files } = action.payload;
   const { uploader } = action.meta;
   console.log(uploader.handle); // 'myUploader'
}
```

__Creating a reducer for a specific uploader__

```js
import { createReducer } from 'redux-plupload';

const myReducer = createReducer('myUploader');

```
