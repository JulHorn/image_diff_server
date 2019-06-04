const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./logic/ConfigurationLoader');
const cors = require('cors');
const guiRoutes = require('./routes/gui');
const apiRoutes = require('./routes/api');

const express = require('express');
const next = require('next');

const port = config.getServerPort();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use(logger('dev'));
  server.use(bodyParser.json({limit: config.getMaxAllowedImageSizeForAPI + 'mb'}));
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(cookieParser());
// Enable cors cross domain requests/responses
  server.use(cors());

  // ToDo: Move stuff to gui routes
  // server.use('/gui', guiRoutes);
  server.use('/api', apiRoutes);

  server.get('*', (req, res) => {
    return handle(req, res)
  });

  server.listen(port, err => {
    if (err) { throw err; }
    console.log(`> Ready on http://localhost:${port}`)
  })
});
