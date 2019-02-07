var express = require('express');
var router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const sendIds = require('../../../constants').databaseSendRequests;
const getIds = require('../../../constants').databaseGetRequests; 
const deleteIds = require('../../../constants').databaseDeleteRequests;
const updateIds = require('../../../constants').databaseUpdateRequests;    
const operationStates = require('../../../constants').databaseErrors;

/*
 Primjer JSON objekta za slanje POST metode -> factory
{ 
	"user" : {
		"userid": 7, -> id usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/get', (req, res) => {

    let user = req.body.user;

    databaseManager.getSingleRequest({ id: getIds.GET_COST_ESTIMATE, data : { userid : user.userid, token : user.token}}, answer =>{
        let msg , size;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else {
                size = answer.data.length;
                msg = answer.msg;
                res.send({message: msg,size : size, data : answer.data});
            }
    });
    return;
});
/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "name": "Glavni troskovnik", -> ime troskovnika
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/
router.post('/create', (req, res) => {

    let user = req.body.user;

    databaseManager.sendRequest({ id: sendIds.CREATE_COST_ESTIMATE, data : { name : user.name , userid : user.userid, token : user.token}}, answer =>{

        let newId, msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else {
                msg = "Created new cost estimate : " + user.name;
                newId = answer.data.estimateid;
                res.send({message : msg, newId : newId})
            }
    });
    return;
});
/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "estimateid": 1, -> id troskovnika koji se brise
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/
router.post('/delete', (req, res) => {

    let user = req.body.user;

    databaseManager.deleteRequest({ id: deleteIds.DELETE_COST_ESTIMATE, data: { userid: user.userid, token: user.token, estimateid: user.estimateid } }, answer =>{
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else { 
                msg = "Delete was successful";
                res.send({message: msg});
            }
    });
    return;
});
/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "estimateid": 1, -> id troskovnika
        "name" : "ime", -> ime troskovnika
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/
router.post('/update', (req, res) => {

    let user = req.body.user;

    databaseManager.updateRequest({ id: updateIds.UPDATE_COST_ESTIMATE, data: { userid: user.userid, token: user.token, name: user.name, estimateid: user.estimateid } }, answer =>{
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else { 
                msg = "Renamed estimete into: " + user.name;
                res.send({message: msg});
            }
    });
    return;
});


/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "estimateid": 1, -> id troskovnika
        "userid": 7, -> id od usera
        "toEmail": "test2@test.com" -> email ili username primateljas
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" -> token usera
	}
}
*/

router.post('/send', (req, res) => {

    let user = req.body.user;

    if (!user.toEmail) {
        res.send({ error: "Neispravni podaci" });
        return;
    }

    if (user.toEmail.indexOf('@') < 0) {

        databaseManager.sendRequest({ id: sendIds.SEND_ESTIMATE, data: { userid: user.userid, token: user.token, estimateid: user.estimateid, toUsername: user.toEmail } }, (answer) => {

            if (answer.state != operationStates.OPERATION_SUCCESS) {
                res.send({ error: answer.msg });
                return;
            }

            res.send({ message: answer.msg });
        });

        return;
    }

    databaseManager.sendRequest({ id: sendIds.SEND_ESTIMATE, data: { userid: user.userid, token: user.token, estimateid: user.estimateid, toEmail: user.toEmail } }, (answer) => {

        if (answer.state != operationStates.OPERATION_SUCCESS) {
            res.send({ error: answer.msg });
            return;
        }

        res.send({ message: answer.msg });
    });
});

/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" -> token usera
	}
}
*/

router.post('/receive', (req, res) => {

    let user = req.body.user;

    databaseManager.getSingleRequest({ id: getIds.GET_RECEIVED_ESTIMATES, data: { userid: user.userid, token: user.token } }, (answer) => {

        if (answer.state != operationStates.OPERATION_SUCCESS) {
            res.send({ error: answer.msg });
            return;
        }

        res.send({ message: answer.msg, data: answer.data });
    });
});

module.exports = router;