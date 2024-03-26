const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('Replies Endpoints', () => {
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

    // Create user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'anotherdicoding',
        password: 'secret',
        fullname: 'Another Dicoding Indonesia',
      },
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    const payload = {
      content: 'reply content',
    };

    it('should response 201 and new reply', async () => {
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

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies`,
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(payload.content);
    });

    it('should response 400 when reply payload not contain needed property', async () => {
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

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies`,
        payload: {},
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });

    it('should response 400 when reply payload not meet data type specification', async () => {
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

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies`,
        payload: {
          content: 1,
        },
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });

    it('should response 401 when unauthorized user add reply', async () => {
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

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies`,
        payload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when thread not found', async () => {
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/1/comments/1/replies',
        payload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when reply deleted successfully', async () => {
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

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Add reply

      const replyPayload = {
        content: 'reply content',
      };

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies`,
        payload: replyPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: replyData } = JSON.parse(replyResponse.payload);

      const threadId = threadData.addedThread.id;
      const commentId = commentData.addedComment.id;
      const replyId = replyData.addedReply.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when unauthorized user delete reply', async () => {
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

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Add reply

      const replyPayload = {
        content: 'reply content',
      };

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies`,
        payload: replyPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: replyData } = JSON.parse(replyResponse.payload);

      const threadId = threadData.addedThread.id;
      const commentId = commentData.addedComment.id;
      const replyId = replyData.addedReply.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 403 when user not reply owner delete reply', async () => {
      // Arrange
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
          username: 'anotherdicoding',
          password: 'secret',
        },
      });

      const { data: authData } = JSON.parse(authResponse.payload);
      const { data: authData2 } = JSON.parse(authResponse2.payload);

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Add reply

      const replyPayload = {
        content: 'reply content',
      };

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies`,
        payload: replyPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: replyData } = JSON.parse(replyResponse.payload);

      const threadId = threadData.addedThread.id;
      const commentId = commentData.addedComment.id;
      const replyId = replyData.addedReply.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${authData2.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });

    it('should response 404 when reply not found', async () => {
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

      // Add thread
      const threadPayload = {
        title: 'title',
        body: 'body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: threadData } = JSON.parse(threadResponse.payload);

      // Add comment

      const commentPayload = {
        content: 'comment content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.addedThread.id}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      const { data: commentData } = JSON.parse(commentResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.addedThread.id}/comments/${commentData.addedComment.id}/replies/999`,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);

      //   // Assert
    });
  });
});
