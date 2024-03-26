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
        id: mockNewThread.id,
        title: useCasePayload.title,
        owner: mockNewThread.owner,
      }),
    );
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
    };

    const mockComment = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: new Date('2021-08-10').toISOString(),
        content: 'ini komen',
        isDeleted: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date: new Date('2021-08-11').toISOString(),
        content: 'ini komen 2',
        isDeleted: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        username: 'dicoding',
        date: new Date('2021-08-12').toISOString(),
        content: 'ini balasan komen',
        isDeleted: false,
        comment_id: 'comment-123',
      },
      {
        id: 'reply-124',
        username: 'dicoding',
        date: new Date('2021-08-13').toISOString(),
        content: 'ini balasan komen 2',
        isDeleted: true,
        comment_id: 'comment-123',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new RepliesRepository();

    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockThread));
    mockThreadRepository.checkAvailableThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.getReplyByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockReplies));

    const threadUseCase = new ThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await threadUseCase.getThreadById(threadId);

    // Assert
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
        date: mockThread.date,
        comments: [
          new CommentDetail({
            id: firstComment.id,
            username: firstComment.username,
            date: firstComment.date,
            content: firstComment.content,
            isDeleted: firstComment.isDeleted,
            replies: [
              new ReplyDetail({
                id: firstReply.id,
                username: firstReply.username,
                date: firstReply.date,
                content: firstReply.content,
                isDeleted: firstReply.isDeleted,
              }),
              new ReplyDetail({
                id: secondReply.id,
                username: secondReply.username,
                date: secondReply.date,
                content: secondReply.content,
                isDeleted: secondReply.isDeleted,
              }),
            ],
          }),
          new CommentDetail({
            id: secondComment.id,
            username: secondComment.username,
            date: secondComment.date,
            content: secondComment.content,
            isDeleted: secondComment.isDeleted,
            replies: [],
          }),
        ],
      }),
    );
  });
});
