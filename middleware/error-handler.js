const { CustomAPIError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later.',
  };
  if(err.name==="CastError"){
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = 404
  }
  if (err.name === 'ValidationError') {
    customErro.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.satusCode = 400;
  }
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value stored for ${Object.keys(
      err.keyValue
    )} field please choose another value`;
    customError.statusCode = 400;
  }
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err:err.message })
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
