// Example: generate-jwt.js
const jwt = require('jsonwebtoken');

const payload = { userId: 123 }; // your payload data
const secret = 'your-super-secret-key-that-you-should-replace'; // use process.env.JWT_SECRET in production

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log(token);