const express = require('express');

var router = express.Router();

const developersList = ['Mateo','Krešimir','Dario','Antonio','Dominik','Stjepan'];

router.get('/',(req,res) =>{
    res.status(200).json({developers: developersList});
});

module.exports = router;