const {
  kErrorDetailThreadNotContainProps,
  kErrorDetailThreadNotMeetDataTypeSpec,
} = require('../../../Commons/constant');

class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, date, username } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = payload.comments;
  }

  _verifyPayload(payload) {
    const { id, title, body, date, username, comments } = payload;

    if (!id || !title || !body || !date || !username || !comments) {
      throw new Error(kErrorDetailThreadNotContainProps);
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      typeof date !== 'string' ||
      typeof username !== 'string' ||
      !Array.isArray(comments)
    ) {
      throw new Error(kErrorDetailThreadNotMeetDataTypeSpec);
    }
  }
}

module.exports = DetailThread;
