const express = require('express');
const router = express.Router();

router.use('/register', require('./register'));
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/validate', require('./validate'));
router.use('/friends', require('./friends'));
router.use('/cost-estimate',require('./cost-estimate'));
router.use('/category',require('./category'));
router.use('/expense',require('./expense'));
router.use('/profile',require('./profile'));
router.use('/income',require('./income'));
router.use('/pdf',require('./pdf'));

module.exports = router;