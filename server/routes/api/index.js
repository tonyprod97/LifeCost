const express = require('express');

const router = express.Router();

router.use('/developers', require('./developers'));
router.use('/user', require('./user'));

module.exports = router;