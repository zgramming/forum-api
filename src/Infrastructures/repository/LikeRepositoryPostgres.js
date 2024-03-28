const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async isAlreadyLiked(commentId, userId) {
    const query = {
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return false;
    }

    return true;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return parseInt(result.rows[0].count, 10);
  }

  async likeComment(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id, comment_id, user_id',
      values: [id, commentId, userId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async unlikeComment(commentId, userId) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2 RETURNING id, comment_id, user_id',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = LikeRepositoryPostgres;
