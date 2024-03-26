const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentUseCase = require('../CommentUseCase');

describe('CommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const payload = {
      content: 'comment',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: payload.content,
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(mockAddedComment));

    const commentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await commentUseCase.addComment({
      threadId: 'thread-123',
      userId: 'user-123',
      payload,
    });

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockThreadRepository.checkAvailableThread).toBeCalledWith('thread-123');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn().mockImplementation(() => Promise.resolve());

    const commentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await commentUseCase.deleteCommentById({
      commentId: payload.commentId,
      threadId: payload.threadId,
      userId: 'user-123',
    });

    // Assert
    expect(mockThreadRepository.checkAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith('thread-123', 'comment-123', 'user-123');
  });
});
