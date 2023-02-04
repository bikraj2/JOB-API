const redis = require('redis');
const { CustomAPIError } = require('../errors');

const client = redis.createClient({  PORT: 5001 });

const util  = require('util')

const connectRedis = async ()=>{
    try{
        await client.connect()
        console.log('conntected')
    }catch(e){
        throw new CustomAPIError(
          `Error occured while connecting to redis server: ${e}`
        );
    }
}
module.exports = {
    connectRedis,
    client
}