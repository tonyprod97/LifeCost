const express = require('express');
const router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const sendIds = require('../../../constants').databaseSendRequests;
const operationStates = require('../../../constants').databaseErrors;


/*
 Primjer JSON objekta za slanje POST metode -> register
{ 
	"user" : {
		"email"   : "test@test.com" -> email usera
        "userName": "testUser" -> username usera
        "password": "testPass" -> password usera
	}
}
*/

router.post('/', (req, res) => {

    let user = req.body.user;

    databaseManager.sendRequest({id: sendIds.CREATE_NEW_USER, data: { email: user.email, username: user.userName, password: user.password }}, (answer) => {

        if (answer.state != operationStates.OPERATION_SUCCESS) {
            res.send({ error: answer.msg, email: user.email });
            return;
        }

        res.send({error: null});
    });
});

module.exports = router;