const testRoute = require('./test/test.routes');
const authRoutes = require('./auth/auth.routes');
const textRoutes = require('./text/text.routes');

module.exports = server => {
  server.use('/', testRoute);
  server.use('/api/auth', authRoutes);
  server.use('/text', textRoutes);
};
