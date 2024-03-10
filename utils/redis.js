const Redis = require("ioredis");

let redisconnection;

const InitRedis = () => {
  redisconnection = new Redis();
};

const SetRedis = async (obj) => {
  await redisconnection.set(obj.key, obj.value, "EX", 3600 * 24 * 15);
};

const GetRedis = async (key) => {
  let data = await redisconnection.get(key);
  return data;
};

module.exports = {
  InitRedis,
  SetRedis,
  GetRedis,
};
