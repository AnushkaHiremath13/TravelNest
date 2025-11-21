// generateAdminKey.js
require('dotenv').config();
const { generateAdminKeyHash } = require('./controllers/authController');

(async () => {
  const plainAdminKey = 'your-secret-admin-key'; // Replace with your secure key
  await generateAdminKeyHash(plainAdminKey);
})();
