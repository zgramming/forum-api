const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postReplyHandler(request, h) {
    const { payload } = request;

    const { commentId, threadId } = request.params;
    const { id: userId } = request.auth.credentials;
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const addedReply = await replyUseCase.addReplyByCommentId({
      threadId,
      commentId,
      owner: userId,
      payload,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const { threadId, commentId, replyId } = request.params;

    const { id: userId } = request.auth.credentials;
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    await replyUseCase.deleteReplyById({
      threadId,
      commentId,
      replyId,
      userId,
    });

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
