const { FileStatus, States, Errors, ActionTypes } = require('./constants');
const { createMiddleware } = require('./middleware');
const { reducer, createReducer } = require('./reducer');

module.exports = {
  FileStatus, States, Errors, ActionTypes, createMiddleware, reducer, createReducer,
};
