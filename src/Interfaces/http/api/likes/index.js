const LikeHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  register: (server, { container }) => {
    const likeHandler = new LikeHandler(container);
    server.route(routes(likeHandler));
  },
};
