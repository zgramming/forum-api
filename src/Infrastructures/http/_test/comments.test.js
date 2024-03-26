const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

describe('Comments Endpoints', () => {
  let server = null;

  beforeAll(async () => {
    server = await createServer(container);

    // Create user
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
        username: 'dicoding2',
        password: 'secret',
        fullname: 'Dicoding Indonesia 2',
      },
    });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and new comment', async () => {
      // Arrange
      const payload = {
        content: 'sebuah comment',
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);

      // Create thread
      const threadRequest = {
        title: 'sebuah thread',
        body: 'isi dari thread',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequest,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Action

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(payload.content);
    });

    it('should response 401 when request not authenticated', async () => {
      // Arrange
      const payload = {
        content: 'sebuah comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const payload = {};

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);

      // create thread
      const threadRequest = {
        title: 'sebuah thread',
        body: 'isi dari thread',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequest,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const payload = {
        content: 123,
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);

      // create thread
      const threadRequest = {
        title: 'sebuah thread',
        body: 'isi dari thread',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequest,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const payload = {
        content: 'sebuah comment',
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when delete comment', async () => {
      // Arrange
      const payload = {
        content: 'sebuah comment',
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);

      // Create thread
      const threadRequest = {
        title: 'sebuah thread',
        body: 'isi dari thread',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequest,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Create comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}`,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(200);
    });

    it('should response 401 when request not authenticated', async () => {
      // Arrange
      const payload = {
        content: 'sebuah comment',
      };

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        payload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when comment not found', async () => {
      // Arrange

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);

      // Create thread
      const threadRequest = {
        title: 'sebuah thread',
        body: 'isi dari thread',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequest,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.addedThread.id}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it('should response 403 when user not comment owner', async () => {
      // Arrange
      const payload = {
        content: 'sebuah comment',
      };

      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const authResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding2',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);
      const { data: authData2 } = JSON.parse(authResponse2.payload);

      // Create thread
      const threadRequest = {
        title: 'sebuah thread',
        body: 'isi dari thread',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadRequest,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Create comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}`,
        headers: {
          Authorization: `Bearer ${authData2.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });
  });
});
