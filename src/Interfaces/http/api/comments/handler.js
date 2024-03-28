const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentHandler(request, h) {
    const { payload } = request;

    const { threadId } = request.params;
    const { id: userId } = request.auth.credentials;
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const addedComment = await commentUseCase.addComment({
      threadId,
      userId,
      payload,
    });
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);

    return response;
  }

  async deleteCommentHandler(request) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.deleteCommentById({
      threadId,
      commentId,
      userId,
    });
    return {
      status: 'success',
    };
  }
}

module.exports = CommentHandler;
