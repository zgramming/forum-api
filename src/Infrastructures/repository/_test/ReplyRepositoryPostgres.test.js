const pool = require('../../database/postgres/pool');
const ReplyTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');

describe('ReplyRepositoryPostgres', () => {
  const anotherUserId = 'user-1000';
  const userId = 'user-999';
  const threadId = 'thread-999';
  const commentId = 'comment-999';

  const fakeIdGenerator = () => '123';

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Check Reply Availability', () => {
    it('should throw NotFoundError when reply not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(replyRepositoryPostgres.checkReplyAvailability('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when reply available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await ReplyTableTestHelper.addReply({ id: 'reply-123', comment: commentId, owner: userId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      const result = await replyRepositoryPostgres.checkReplyAvailability('reply-123');
      expect(result).toStrictEqual(true);
    });
  });

  describe('Verify Reply Owner', () => {
    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-999', username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: 'thread-999', ownerId: 'user-999' });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: 'user-999', thread: 'thread-999' });
      await ReplyTableTestHelper.addReply({ id: 'reply-999', comment: commentId, owner: 'user-999' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-999', anotherUserId)).rejects.toThrowError(
        AuthorizationError,
      );
    });

    it('should not throw error when user is the owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await ReplyTableTestHelper.addReply({ id: 'reply-999', comment: commentId, owner: userId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      const result = await replyRepositoryPostgres.verifyReplyOwner('reply-999', userId);
      expect(result).toStrictEqual(true);
    });
  });

  describe('Get Reply By Id', () => {
    it('should return reply correctly', async () => {
      // Arrange
      const content = 'reply content';
      await UsersTableTestHelper.addUser({ id: userId, username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await ReplyTableTestHelper.addReply({ id: 'reply-999', comment: commentId, owner: userId, content });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const reply = await replyRepositoryPostgres.getReplyById('reply-999');

      // Assert
      expect(reply.id).toEqual('reply-999');
      expect(reply.username).toEqual('yusuf');
      expect(reply.date).toBeDefined();
      expect(reply.content).toEqual(content);
      expect(reply.is_delete).toEqual(false);
    });

    it('should return undefined when reply not available', async () => {});
  });

  describe('Get Reply By Thread Id', () => {
    const content = 'reply content';

    it('should return replies correctly', async () => {
      // Arrange
      const mockReply = {
        id: 'reply-999',
        comment: commentId,
        owner: userId,
        content,
        date: new Date('2021-08-08T07:22:13.000Z'),
        isDelete: false,
      };
      await UsersTableTestHelper.addUser({ id: userId, username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await ReplyTableTestHelper.addReply(mockReply);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const replies = await replyRepositoryPostgres.getReplyByThreadId(threadId);
      const reply = replies[0];
      // Assert
      expect(replies).toHaveLength(1);
      expect(reply.id).toEqual('reply-999');
      expect(reply.comment_id).toEqual(commentId);
      expect(reply.username).toEqual('yusuf');
      expect(reply.date).toEqual(mockReply.date);
      expect(reply.content).toEqual(content);
      expect(reply.is_delete).toEqual(false);
    });
  });

  describe('Add Reply By Comment Id', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: userId, username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
    });

    it('should persist reply and return added reply correctly', async () => {
      const content = 'reply content';
      // Arrange

      const payload = new NewReply({
        content,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReplyByCommentId(commentId, userId, payload);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content,
          owner: userId,
        }),
      );
    });

    it('should persist reply and return added reply correctly', async () => {
      // Arrange
      const content = 'reply content';
      const payload = new NewReply({
        content,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReplyByCommentId(commentId, userId, payload);

      // Assert
      const replies = await ReplyTableTestHelper.findRepliesById('reply-123');

      expect(replies).toHaveLength(1);
    });
  });

  describe('Delete Reply By Id', () => {
    it('should delete reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'yusuf', fullname: 'yusuf' });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await ReplyTableTestHelper.addReply({ id: 'reply-999', comment: commentId, owner: userId });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-999');

      // Assert
      const replies = await ReplyTableTestHelper.findRepliesById('reply-999');
      const reply = replies[0];
      expect(reply.is_delete).toEqual(true);
    });
  });
});
