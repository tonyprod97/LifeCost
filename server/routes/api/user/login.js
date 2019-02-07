var express = require('express');
var router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const sendIds = require('../../../constants').databaseSendRequests; 
const operationStates = require('../../../constants').databaseErrors; 


/*
 Primjer JSON objekta za slanje POST metode -> register
{ 
	"user" : {
		"email": "test@test.com" -> email ili username usera
        "password": "testPass" -> password usera
	}
}
*/

router.post('/', (req, res) => {

    let user = req.body.user;

    if (!user.email) {
        res.send({ error: "Neispravni login podaci" });
        return;
    }

    if (user.email.indexOf('@') < 0) {

        databaseManager.sendRequest({id: sendIds.LOGIN_REQUEST, data: { username: user.email, password: user.password}}, (answer) => {

            //console.log(answer);

            if (answer.state != operationStates.OPERATION_SUCCESS) {
                res.send({ error: answer.msg, userName: user.email });
                return;
            }

            res.send({ user: answer.data });
        });

        return;
    }

    databaseManager.sendRequest({id: sendIds.LOGIN_REQUEST, data: { email: user.email, password: user.password }}, (answer) => {

        //console.log(answer);

        if (answer.state != operationStates.OPERATION_SUCCESS) {
            res.send({ error: answer.msg, email: user.email });
            return;
        }

        res.send({user: answer.data});
    }); 
});

module.exports = router;