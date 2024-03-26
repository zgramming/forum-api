const NewComment = require('../../Domains/comments/entities/NewComment');

class CommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addComment({ threadId, userId, payload }) {
    await this._threadRepository.checkAvailableThread(threadId);

    const newComment = new NewComment(payload);
    return this._commentRepository.addComment(threadId, userId, newComment);
  }

  async deleteCommentById({ threadId, commentId, userId }) {
    await this._threadRepository.checkAvailableThread(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, userId);
    return this._commentRepository.deleteCommentById(threadId, commentId, userId);
  }
}

module.exports = CommentUseCase;
