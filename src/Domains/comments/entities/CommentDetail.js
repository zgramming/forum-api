class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, username, date, isDeleted, replies } = payload;

    this.id = id;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.username = username;
    this.date = date;
    this.isDeleted = isDeleted;
    this.replies = replies || [];
  }

  _verifyPayload(payload) {
    const { id, content, username, date, isDeleted, replies } = payload;

    if (!id || !content || !username || !date || isDeleted === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof isDeleted !== 'boolean' ||
      (replies && !Array.isArray(replies))
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
