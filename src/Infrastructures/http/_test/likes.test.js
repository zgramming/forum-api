const container = require('../../container');
const createServer = require('../createServer');

const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

const pool = require('../../database/postgres/pool');

describe('Likes Endpoints', () => {
  let server = null;

  beforeAll(async () => {
    server = await createServer(container);

    // Create 2 Users
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'budi',
        password: 'secret',
        fullname: 'Budi',
      },
    });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();

    await pool.end();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 when like comment', async () => {
      // Arrange

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: authPayload } = JSON.parse(authResponse.payload);

      // Create a Thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'judul thread',
          body: 'isi thread',
        },
        headers: {
          Authorization: `Bearer ${authPayload.accessToken}`,
        },
      });

      const { data: threadPayload } = JSON.parse(threadResponse.payload);
      // Create a Comment

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadPayload.addedThread.id}/comments`,
        payload: {
          content: 'isi komentar',
        },
        headers: {
          Authorization: `Bearer ${authPayload.accessToken}`,
        },
      });

      const { data: commentPayload } = JSON.parse(commentResponse.payload);

      // Action
      const likeRequest = {
        threadId: threadPayload.addedThread.id,
        commentId: commentPayload.addedComment.id,
      };

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${likeRequest.threadId}/comments/${likeRequest.commentId}/likes`,
        headers: {
          Authorization: `Bearer ${authPayload.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
