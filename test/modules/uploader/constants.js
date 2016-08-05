import expect from 'expect.js';

import { ActionTypes } from '../../../es6/modules/uploader/constants';

describe('constants', () => {
  describe('ActionTypes', () => {
    it('start with "redux-plupload/uploader/"', () => {
      expect(ActionTypes.INIT).to.be('redux-plupload/uploader/INIT');
      const keys = Object.keys(ActionTypes);
      expect(keys.length).to.not.be(0);
      let key = undefined;
      for (key of keys) {
        expect(ActionTypes[key]).to.match(/^redux-plupload\/uploader\//);
      }
    });
  });
});
