const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const client = redis.createClient({
    host: process.env.REDIS_HOST, 
    port: process.env.REDIS_PORT
});

client.on('connect', function() {
    console.log('Terhubung ke Redis');
});

client.on('error', function(err) {
    console.error('Koneksi Redis gagal:', err);
});

const cacheMiddleware = (req, res, next) => {
    const cacheKey = req.originalUrl;
    client.get(cacheKey, (err, data) => {
      if (err) throw err;
  
      if (data !== null) {
        console.log(data)
        res.json(JSON.parse(data));
      } else {
        next();
      }
    });
  };
module.exports = cacheMiddleware;