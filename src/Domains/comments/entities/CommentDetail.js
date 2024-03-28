class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, username, date, isDeleted, replies, likeCount } = payload;

    this.id = id;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.username = username;
    this.date = date;
    this.isDeleted = isDeleted;
    this.replies = replies || [];
    this.likeCount = likeCount;
  }

  _verifyPayload(payload) {
    const { id, content, username, date, isDeleted, replies, likeCount } = payload;

    if (!id || !content || !username || !date || isDeleted === undefined || likeCount === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof isDeleted !== 'boolean' ||
      (replies && !Array.isArray(replies)) ||
      typeof likeCount !== 'number'
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
