const ToggleLike = require('../../Domains/likes/entities/ToggleLike');

class LikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async toggleLike(payload) {
    const { commentId, threadId, userId } = new ToggleLike(payload);
    await this._threadRepository.checkAvailableThread(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);
    const isAlreadyLiked = await this._likeRepository.isAlreadyLiked(commentId, userId);

    if (isAlreadyLiked) {
      return this._likeRepository.unlikeComment(commentId, userId);
    }

    return this._likeRepository.likeComment(commentId, userId);
  }
}

module.exports = LikeUseCase;
