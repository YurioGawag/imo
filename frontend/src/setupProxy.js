const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxy Request:', {
          method: req.method,
          path: req.path,
          url: req.url
        });
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
      },
      logLevel: 'debug'
    })
  );
};
