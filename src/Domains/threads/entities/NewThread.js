const { kErrorNewThreadNotContainProps, kErrorNewThreadNotMeetDataTypeSpec } = require('../../../Commons/constant');

class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body } = payload;

    this.title = title;
    this.body = body;
  }

  _verifyPayload(payload) {
    const { title, body } = payload;

    if (!title || !body) {
      throw new Error(kErrorNewThreadNotContainProps);
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error(kErrorNewThreadNotMeetDataTypeSpec);
    }
  }
}

module.exports = NewThread;
