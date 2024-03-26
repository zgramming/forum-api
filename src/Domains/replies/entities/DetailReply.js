class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, date, content, isDeleted } = payload;

    this.id = id;
    this.username = username;
    this.content = isDeleted ? '**balasan telah dihapus**' : content;
    this.date = date;
  }

  _verifyPayload(payload) {
    const { id, username, date, content, isDeleted } = payload;

    if (!id || !username || !date || !content || isDeleted === undefined) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string' ||
      typeof isDeleted !== 'boolean'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
