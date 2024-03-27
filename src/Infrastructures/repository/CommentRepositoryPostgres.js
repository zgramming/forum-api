const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.id, comments.content, comments.date, comments.created_by, comments.is_delete, 
        users.username
        FROM threads_comment AS comments
        LEFT JOIN users ON comments.created_by = users.id
        WHERE comments.thread_id = $1 
        ORDER BY comments.date ASC
        `,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async checkCommentAvailability(commentId) {
    const query = {
      text: 'SELECT id FROM threads_comment WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return true;
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT created_by FROM threads_comment WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    const comment = result.rows[0];

    if (comment.created_by !== owner) {
      throw new AuthorizationError('Anda tidak mempunyai hak akses atas komentar ini');
    }

    return true;
  }

  async addComment(threadId, userId, payload) {
    const { content } = payload;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads_comment VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, content, date, threadId, userId],
    };
    const result = await this._pool.query(query);
    const data = result.rows[0];

    return new AddedComment({
      id: data.id,
      content,
      owner: userId,
    });
  }

  async deleteCommentById(threadId, commentId) {
    const query = {
      text: `UPDATE threads_comment 
      SET deleted_at = NOW(),
      is_delete = true
      WHERE id = $1 AND thread_id = $2
      RETURNING id`,
      values: [commentId, threadId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
