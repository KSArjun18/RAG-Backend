const { createClient } = require('redis');

const redisClient = createClient({
  url: "redis://default:iyOzPJbIFtVzX4kftIDcgZQAdasdXRMz@redis-19728.c244.us-east-1-2.ec2.redns.redis-cloud.com:19728",
  checkCompatibility: false
});


redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;