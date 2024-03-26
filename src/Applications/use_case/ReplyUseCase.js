const NewReply = require('../../Domains/replies/entities/NewReply');

class ReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addReplyByCommentId({ threadId, commentId, owner, payload }) {
    await this._threadRepository.checkAvailableThread(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);
    const newReply = new NewReply(payload);
    return this._replyRepository.addReplyByCommentId(commentId, owner, newReply);
  }

  async deleteReplyById({ threadId, commentId, replyId, userId }) {
    await this._threadRepository.checkAvailableThread(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);
    await this._replyRepository.checkReplyAvailability(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, userId);
    return this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = ReplyUseCase;
