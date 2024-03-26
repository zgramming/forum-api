const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyUseCase = require('../ReplyUseCase');

describe('ReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const payload = {
      content: 'reply',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: payload.content,
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockRepliesRepository.addReplyByCommentId = jest.fn().mockImplementation(() => Promise.resolve(mockAddedReply));

    const replyUseCase = new ReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockRepliesRepository,
    });

    // Action
    const addedReply = await replyUseCase.addReplyByCommentId({
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
      payload,
    });

    // Assert
    expect(addedReply).toStrictEqual(mockAddedReply);
    expect(mockThreadRepository.checkAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123');
    expect(mockRepliesRepository.addReplyByCommentId).toBeCalledWith('comment-123', 'user-123', payload);
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockRepliesRepository.checkReplyAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockRepliesRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockRepliesRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve());

    const replyUseCase = new ReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockRepliesRepository,
    });

    // Action
    await replyUseCase.deleteReplyById({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    });

    // Assert
    expect(mockThreadRepository.checkAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123');
    expect(mockRepliesRepository.verifyReplyOwner).toBeCalledWith('reply-123', 'user-123');
    expect(mockRepliesRepository.deleteReplyById).toBeCalledWith('reply-123');
  });
});
