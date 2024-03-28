const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  const anotherUserId = 'user-456';
  const userId = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  const fakeIdGenerator = () => '123';

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('isAlreadyLiked function', () => {
    it('should return false if comment has not been liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'john_doe' });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });

      // Action
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      await expect(likeRepositoryPostgres.isAlreadyLiked(commentId, userId)).resolves.toEqual(false);
    });

    it('should return true if comment has been liked', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'john_doe' });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await LikesTableTestHelper.addLikes({
        commentId,
        userId,
      });

      // Action
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      await expect(likeRepositoryPostgres.isAlreadyLiked(commentId, userId)).resolves.toEqual(true);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return like count correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'john_doe' });
      await UsersTableTestHelper.addUser({ id: anotherUserId, username: 'jane_doe' });

      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await LikesTableTestHelper.addLikes({
        id: 'like-123',
        commentId,
        userId,
      });

      await LikesTableTestHelper.addLikes({
        id: 'like-456',
        commentId,
        userId: anotherUserId,
      });

      // Action
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      await expect(likeRepositoryPostgres.getLikeCountByCommentId(commentId)).resolves.toEqual(2);
    });
  });

  describe('likeComment function', () => {
    it('should persist like and return added like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'john_doe' });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });

      // Action
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const addedLike = await likeRepositoryPostgres.likeComment(commentId, userId);

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');

      expect(likes).toHaveLength(1);
      expect(addedLike).toStrictEqual({
        id: 'like-123',
        comment_id: commentId,
        user_id: userId,
      });
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like and return deleted like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId, username: 'john_doe' });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, thread: threadId });
      await LikesTableTestHelper.addLikes({
        id: 'like-123',
        commentId,
        userId,
      });

      // Action
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const result = await likeRepositoryPostgres.unlikeComment(commentId, userId);

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
      expect(result).toStrictEqual({
        id: 'like-123',
        comment_id: commentId,
        user_id: userId,
      });
    });
  });
});
