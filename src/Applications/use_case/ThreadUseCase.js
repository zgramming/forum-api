const NewThread = require('../../Domains/threads/entities/NewThread');
const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addThread(payload, userId) {
    const newThread = new NewThread(payload);
    const result = this._threadRepository.addThread(newThread, userId);
    return result;
  }

  async getThreadById(threadId) {
    await this._threadRepository.checkAvailableThread(threadId);
    const result = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getReplyByThreadId(threadId);

    result.comments = comments.map((comment) => {
      const filterReplies = replies.filter((reply) => reply.comment_id === comment.id);
      const result = new CommentDetail({
        id: comment.id,
        content: comment.content,
        username: comment.username,
        date: comment.date,
        isDeleted: comment.isDeleted,
        replies: filterReplies.map(
          (reply) =>
            new DetailReply({
              id: reply.id,
              content: reply.content,
              username: reply.username,
              date: reply.date,
              isDeleted: reply.isDeleted,
            }),
        ),
      });

      return result;
    });

    const thread = new DetailThread({
      id: result.id,
      title: result.title,
      body: result.body,
      username: result.username,
      date: result.date,
      comments: result.comments,
    });

    return thread;
  }
}

module.exports = ThreadUseCase;
