require('dotenv').config();
require('express-async-errors');

//extra middleware for security
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const bodyParser = require('body-parser')

//
const swaggerUI=require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocs= YAML.load('./swagger.yaml')

const express = require('express');
const app = express();

const connectDB = require('./db/connect')


const authRouter = require('./routes/auth')
const jobRouter = require('./routes/jobs')

//middlewares
const authMiddleware = require('./middleware/authentication')
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const rateLimiter = rateLimit({
  windowMs: 15 * 60 *1000,
  max:60
})
app.set('trust proxy',1);
app.use(rateLimiter)
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())


// extra packages

// routes
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs))
app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/jobs',authMiddleware,jobRouter)



app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
