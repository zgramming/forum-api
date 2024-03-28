const ToggleLike = require('../ToggleLike');

describe('ToggleLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new ToggleLike(payload)).toThrowError('TOGGLE_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      userId: 123,
      threadId: 123,
      commentId: 123,
    };

    // Action & Assert
    expect(() => new ToggleLike(payload)).toThrowError('TOGGLE_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ToggleLike object correctly', () => {
    // Arrange
    const payload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action
    const toggleLike = new ToggleLike(payload);

    // Assert
    expect(toggleLike.userId).toEqual(payload.userId);
    expect(toggleLike.threadId).toEqual(payload.threadId);
    expect(toggleLike.commentId).toEqual(payload.commentId);
  });
});
