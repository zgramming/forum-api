const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('Threads endpoints', () => {
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
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and new thread', async () => {
      // Arrange
      const request = {
        title: 'sebuah thread',
        body: 'isi dari thread',
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
        url: '/threads',
        payload: request,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when request not authenticated', async () => {
      // Arrange
      const request = {
        title: 'sebuah thread',
        body: 'isi dari thread',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: request,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const request = {
        title: 'sebuah thread',
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
        url: '/threads',
        payload: request,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const request = {
        title: 'sebuah thread',
        body: 123,
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
        url: '/threads',
        payload: request,
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it('should response 200 and thread detail', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-666',
        username: 'dicoding-666',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-444',
        ownerId: 'user-666',
        date: '2021-08-08T07:22:58.382Z',
        body: 'secret',
        title: 'dicoding',
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-444',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});
