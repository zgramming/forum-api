const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadUseCase = require('../ThreadUseCase');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/DetailReply');

describe('ThreadUseCase', () => {
  it('NewThread should orchestrating the add thread action correctly', async () => {
    // Arrange
    const owner = 'user-123';

    const useCasePayload = {
      title: 'dicoding',
      body: 'secret',
    };

    const mockNewThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockNewThread));

    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const newThread = await getThreadUseCase.addThread(useCasePayload, owner);

    // Assert
    expect(newThread).toStrictEqual(
      new AddedThread({
        id: 'thread-123',
        title: 'dicoding',
        owner: 'user-123',
      }),
    );

    expect(mockThreadRepository.addThread).toBeCalledWith(useCasePayload, owner);
  });

  it('DetailThread should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThread = {
      id: threadId,
      title: 'dicoding',
      body: 'secret',
      username: 'dicoding',
      date: '2021-08-09',
      owner_id: 'user-123',
    };

    const mockComment = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: new Date('2021-08-10').toISOString(),
        content: 'ini komen',
        is_delete: false,
        like_count: 1,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date: new Date('2021-08-11').toISOString(),
        content: 'ini komen 2',
        is_delete: false,
        like_count: 2,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        username: 'dicoding',
        date: new Date('2021-08-12').toISOString(),
        content: 'ini balasan komen',
        is_delete: false,
        comment_id: 'comment-123',
      },
      {
        id: 'reply-124',
        username: 'dicoding',
        date: new Date('2021-08-13').toISOString(),
        content: 'ini balasan komen 2',
        is_delete: true,
        comment_id: 'comment-123',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new RepliesRepository();

    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve(true));
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.getReplyByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockReplies));

    const threadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await threadUseCase.getThreadById(threadId);

    // // Assert
    const firstComment = mockComment[0];
    const secondComment = mockComment[1];

    const firstReply = mockReplies[0];
    const secondReply = mockReplies[1];

    expect(thread).toStrictEqual(
      new DetailThread({
        id: mockThread.id,
        title: mockThread.title,
        body: mockThread.body,
        username: mockThread.username,
        date: new Date(mockThread.date).toISOString(),
        comments: [
          new CommentDetail({
            id: firstComment.id,
            username: firstComment.username,
            date: firstComment.date,
            content: firstComment.content,
            isDeleted: firstComment.is_delete,
            likeCount: firstComment.like_count,
            replies: [
              new ReplyDetail({
                id: firstReply.id,
                username: firstReply.username,
                date: firstReply.date,
                content: firstReply.content,
                isDeleted: firstReply.is_delete,
              }),
              new ReplyDetail({
                id: secondReply.id,
                username: secondReply.username,
                date: secondReply.date,
                content: secondReply.content,
                isDeleted: secondReply.is_delete,
              }),
            ],
          }),
          new CommentDetail({
            id: secondComment.id,
            username: secondComment.username,
            date: secondComment.date,
            content: secondComment.content,
            isDeleted: secondComment.is_delete,
            likeCount: secondComment.like_count,
            replies: [],
          }),
        ],
      }),
    );

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.checkAvailableThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getReplyByThreadId).toBeCalledWith(threadId);
  });
});
