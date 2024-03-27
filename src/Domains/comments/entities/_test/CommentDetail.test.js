const CommentDetail = require('../CommentDetail');

describe('CommentDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 123,
      username: 123,
      date: new Date().toISOString(),
      isDeleted: true,
      replies: {},
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment',
      username: 'user',
      date: new Date().toISOString(),
      isDeleted: false,
      replies: [],
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.isDeleted).toEqual(payload.isDeleted);
    expect(commentDetail.replies).toEqual(payload.replies);
  });

  it('should create CommentDetail object correctly when isDeleted', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment',
      username: 'user',
      date: new Date().toISOString(),
      isDeleted: true,
      replies: [],
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.isDeleted).toEqual(payload.isDeleted);
    expect(commentDetail.replies).toEqual([]);
  });

  it('should create CommentDetail object correctly when there is no replies', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment',
      username: 'user',
      date: new Date().toISOString(),
      isDeleted: false,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.isDeleted).toEqual(payload.isDeleted);
    expect(commentDetail.replies).toEqual([]);
  });
});
