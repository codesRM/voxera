const express            = require('express');
const router             = express.Router();
const searchController   = require('./search.controller');

// GET /api/search?q=keyword
router.get('/', searchController.search);

module.exports = router;