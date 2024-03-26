const { kErrorAddedThreadNotContainProps, kErrorAddedThreadNotMeetDataTypeSpec } = require('../../../Commons/constant');

class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, owner } = payload;

    this.id = id;
    this.title = title;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    const { id, title, owner } = payload;

    if (!id || !title || !owner) {
      throw new Error(kErrorAddedThreadNotContainProps);
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error(kErrorAddedThreadNotMeetDataTypeSpec);
    }
  }
}

module.exports = AddedThread;
