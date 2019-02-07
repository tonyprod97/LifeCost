const express = require('express');
const router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const sendIds = require('../../../constants').databaseSendRequests;
const operationStates = require('../../../constants').databaseErrors; 

/*
 Primjer JSON objekta za slanje POST metode -> logout
{ 
	"user" : {
		"id": 7, -> id usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/', (req, res) => {

    let user = req.body.user;

    databaseManager.sendRequest({id: sendIds.TERMINATE_SESSION, data: {userid: user.id, token: user.token}}, (answer) => {

        if (answer.state != operationStates.OPERATION_SUCCESS) {
            res.send({ error: answer.msg });
            return;
        }

        res.send({error: null});
    });
});
module.exports = router;