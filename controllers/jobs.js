const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
  CustomAPIError,
} = require('../errors/index');

const {connectRedis,client} = require('../db/redis')
connectRedis()
const getjobs = async (req, res) => {
  
  try {
    const cachedJobs =  await client.get(req.user.userId +"r")
    if (!cachedJobs) {
      const jobs = await Job.find({ createdBy: req.user.userId }).sort(
        'createdAt')
      await client.set(req.user.userId + "r", JSON.stringify(jobs));
     return res.json({ jobs: jobs });
    }

    return res.json({ jobs: JSON.parse(cachedJobs)});
  } catch (error) {
    throw new CustomAPIError(`Error Occured:  ${error}`,StatusCodes.INTERNAL_SERVER_ERROR)
  }
};

const getjob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError('No job found');
  }
  res.status(StatusCodes.OK).json({ job: job });
};
const createjobs = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};
const updatejobs = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === '' || position === '') {
    throw new BadRequestError(
      'Please make sure to provide both the company and the position.'
    );
  }

  const job = await Job.findByIdAndUpdate(
    {
      _id: jobId,
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.ACCEPTED).json({ msg: 'The job has been updated.' });
};
const deletejobs = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findByIdAndDelete({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError('Cannot find the job with the given Id.');
  }
  res.status(StatusCodes.OK).json({ job: job });
};
module.exports = {
  getjob,
  getjobs,
  createjobs,
  updatejobs,
  deletejobs,
};
