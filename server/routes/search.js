const express = require('express');
const { search } = require('../controllers/searchController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalProtect, search);

module.exports = router;
