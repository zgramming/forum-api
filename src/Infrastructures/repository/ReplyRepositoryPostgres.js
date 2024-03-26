const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const RepliesRepository = require('../../Domains/replies/RepliesRepository');

class ReplyRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT created_by FROM threads_comment_reply WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    const reply = result.rows[0];

    if (reply?.created_by !== owner) {
      throw new AuthorizationError('Anda tidak mempunyai hak akses atas balasan ini');
    }

    return true;
  }

  async checkReplyAvailability(replyId) {
    const query = {
      text: 'SELECT id FROM threads_comment_reply WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    return true;
  }

  async getReplyById(replyId) {
    const query = {
      text: `
        SELECT replies.id, users.username, replies.date, replies.content, replies.is_delete
        FROM threads_comment_reply AS replies
        LEFT JOIN users ON replies.created_by = users.id
        WHERE replies.id = $1
      `,
      values: [replyId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getReplyByThreadId(threadId) {
    const query = {
      text: `
        SELECT replies.id, users.username, replies.date, replies.content, replies.is_delete, replies.comment_id
        FROM threads_comment_reply AS replies
        LEFT JOIN users ON replies.created_by = users.id
        LEFT JOIN threads_comment AS comments ON replies.comment_id = comments.id
        WHERE comments.thread_id = $1
        order by replies.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      comment_id: row.comment_id,
      date: new Date(row.date).toISOString(),
      content: row.content,
      isDeleted: row.is_delete,
    }));
  }

  async addReplyByCommentId(commentId, owner, newReply) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads_comment_reply VALUES($1, $2, $3, $4, $5) RETURNING id, content, created_by',
      values: [id, content, date, commentId, owner],
    };

    const result = await this._pool.query(query);

    const reply = result.rows[0];

    const payload = {
      id: reply.id,
      content: reply.content,
      owner: reply.created_by,
    };

    return new AddedReply(payload);
  }

  async deleteReplyById(replyId) {
    const query = {
      text: `UPDATE threads_comment_reply SET is_delete = true, deleted_at = NOW() 
            WHERE id = $1 RETURNING id`,
      values: [replyId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
