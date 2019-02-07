var express = require('express');
var router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const getIds = require('../../../constants').databaseGetRequests;
const operationStates = require('../../../constants').databaseErrors;

/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" -> token usera
	}
}
*/

router.post('/', (req, res) => {

    let user = req.body.user;

    databaseManager.getSingleRequest({ id: getIds.GET_EMAILS, data: { userid: user.userid, token: user.token } }, (answer) => {

        if (answer.state != operationStates.OPERATION_SUCCESS) {
            res.send({ error: answer.msg });
            return;
        }

        res.send({ message: answer.msg, data: answer.data });
    });
});

module.exports = router;