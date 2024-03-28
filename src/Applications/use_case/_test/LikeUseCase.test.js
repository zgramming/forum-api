const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ToggleLike = require('../../../Domains/likes/entities/ToggleLike');
const LikeUseCase = require('../LikeUseCase');

describe('LikeUseCase', () => {
  it('should orchestrating like action correctly', async () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    const mockToggleLike = new ToggleLike(payload);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.checkCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.isAlreadyLiked = jest.fn().mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.likeComment = jest.fn().mockImplementation(() => Promise.resolve('comment-123'));

    const likeUseCase = new LikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const result = await likeUseCase.toggleLike(mockToggleLike);

    // Assert
    expect(result).toEqual('comment-123');
    expect(mockThreadRepository.checkAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123');
    expect(mockLikeRepository.isAlreadyLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.likeComment).toBeCalledWith('comment-123', 'user-123');
  });

  it('should orchestrating unlike action correctly', async () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    const mockToggleLike = new ToggleLike(payload);

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.checkCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.isAlreadyLiked = jest.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.unlikeComment = jest.fn().mockImplementation(() => Promise.resolve('comment-123'));

    const likeUseCase = new LikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const result = await likeUseCase.toggleLike(mockToggleLike);

    // Assert
    expect(result).toEqual('comment-123');
    expect(mockThreadRepository.checkAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123');
    expect(mockLikeRepository.isAlreadyLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.unlikeComment).toBeCalledWith('comment-123', 'user-123');
  });
});
