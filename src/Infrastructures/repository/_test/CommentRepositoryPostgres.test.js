const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres', () => {
  const userId = 'user-123';
  const anotherUserId = 'user-456';
  const threadId = 'thread-123';
  const commentId = 'comment-123';
  const anotherCommentId = 'comment-456';

  const fakeIdGenerator = () => '123';

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('getCommentByThreadId function', () => {
    it('should return comments correctly', async () => {
      // Create 2 users
      await UsersTableTestHelper.addUser({ id: userId, username: 'john' });
      await UsersTableTestHelper.addUser({ id: anotherUserId, username: 'doe' });

      // Create 1 thread
      await ThreadTableTestHelper.addThread({
        id: threadId,
        ownerId: userId,
      });

      // Create 2 comments for the thread
      const firstDate = new Date('2024-01-01T00:00:00.000Z');
      const secondDate = new Date('2024-01-02T00:00:00.000Z');
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        content: 'first comment',
        thread: threadId,
        date: firstDate,
        isDelete: false,
      });

      await CommentsTableTestHelper.addComment({
        id: anotherCommentId,
        owner: anotherUserId,
        content: 'second comment',
        thread: threadId,
        date: secondDate,
        isDelete: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      const firstComment = comments[0];
      const secondComment = comments[1];

      expect(comments).toHaveLength(2);

      expect(comments).toStrictEqual([
        {
          id: commentId,
          content: 'first comment',
          date: firstDate,
          created_by: userId,
          is_delete: false,
          username: 'john',
          like_count: '0',
        },
        {
          id: anotherCommentId,
          content: 'second comment',
          date: secondDate,
          created_by: anotherUserId,
          is_delete: false,
          username: 'doe',
          like_count: '0',
        },
      ]);

      expect(firstComment.id).toEqual(commentId);
      expect(firstComment.content).toEqual('first comment');
      expect(firstComment.date).toEqual(firstDate);
      expect(firstComment.created_by).toEqual(userId);
      expect(firstComment.is_delete).toEqual(false);
      expect(firstComment.username).toEqual('john');

      expect(secondComment.id).toEqual(anotherCommentId);
      expect(secondComment.content).toEqual('second comment');
      expect(secondComment.date).toEqual(secondDate);
      expect(secondComment.created_by).toEqual(anotherUserId);
      expect(secondComment.is_delete).toEqual(false);
      expect(secondComment.username).toEqual('doe');
    });
  });

  describe('checkCommentAvailability function', () => {
    it('should throw error when comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await expect(commentRepositoryPostgres.checkCommentAvailability(commentId)).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when comment available', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const result = await commentRepositoryPostgres.checkCommentAvailability(commentId);

      expect(result).toBe(true);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw error when user is not the owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-999' });
      await ThreadTableTestHelper.addThread({ id: 'thread-999', ownerId: 'user-999' });
      await CommentsTableTestHelper.addComment({ id: commentId, thread: 'thread-999', owner: 'user-999' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, userId)).rejects.toThrowError(
        AuthorizationError,
      );
    });

    it('should not throw error when user is the owner', async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const result = await commentRepositoryPostgres.verifyCommentOwner(commentId, userId);

      expect(result).toBe(true);
    });
  });

  describe('addComment function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-999', owner: userId });
    });

    it('should have length of 1 when comment added', async () => {
      const payload = {
        content: 'new comment',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(threadId, userId, payload);

      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
    });

    it('should persist new comment and return added comment correctly', async () => {
      // Arrange

      await UsersTableTestHelper.addUser({ id: 'user-998', username: 'rey' });
      await ThreadTableTestHelper.addThread({ id: 'thread-998', ownerId: 'user-998' });

      const payload = {
        content: 'new comment',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(threadId, userId, payload);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: payload.content,
          owner: userId,
        }),
      );
    });
  });

  describe('deleteCommentById function', () => {
    it('should soft delete comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadTableTestHelper.addThread({ id: threadId, ownerId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteCommentById(threadId, commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments[0].is_delete).toEqual(true);
    });

    it('should throw error when thread not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-999' });
      await ThreadTableTestHelper.addThread({ id: 'thread-999', ownerId: 'user-999' });
      await CommentsTableTestHelper.addComment({ id: 'comment-999', thread: 'thread-999', owner: 'user-999' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById(threadId, commentId)).rejects.toThrowError(
        NotFoundError,
      );
    });
  });
});
