var express = require('express');
var router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const sendIds = require('../../../constants').databaseSendRequests;
const getIds = require('../../../constants').databaseGetRequests; 
const deleteIds = require('../../../constants').databaseDeleteRequests;
const updateIds = require('../../../constants').databaseUpdateRequests;   
const operationStates = require('../../../constants').databaseErrors;



/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "userid": 7, -> id od usera
        "estimateid" : 5, -> id 
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/get', (req, res) => {

    let user = req.body.user;

    databaseManager.getSingleRequest({ id: getIds.GET_INCOME, data : { userid: user.userid, token: user.token, estimateid: user.estimateid }}, answer =>{
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
        "userid": 7, -> id od usera
        "estimateid" : 5, -> id 
        "value" : 1000, -> vrijednost
        "startDate" : new Date(2018,7,24), -> pocetni datum
        "endDate" : new Date(2018,12,24), -> krajnji datum
        "evaluate" : 13, 
        "name" : "ime", -> ime prihoda
        "comment": null -> komentar ako ga ima
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/
router.post('/create', (req, res) => {

    let user = req.body.user;

    console.log(user);

    databaseManager.sendRequest({ id: sendIds.CREATE_NEW_INCOME, 
        data: {
            userid: user.userid, token: user.token, estimateid: user.estimateid, startDate: user.startDate, endDate: user.endDate, value: user.value, evaluate: user.evaluate, name: user.name, comment: user.comment
            }
        }, answer =>{
        let newId, msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({ error: msg });
                console.log(msg);
            } else {
                msg = "Created new income : " + user.name;
                newId = answer.data.incomeid;
                res.send({message : msg, newId : newId})
            }
    });
    return;
});

/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "incomeid": 1, -> id prihoda
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/delete', (req, res) => {

    let user = req.body.user;

    databaseManager.deleteRequest({ id: deleteIds.DELETE_INCOME, data: { userid: user.userid, token: user.token, incomeid: user.incomeid } }, answer =>{
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
        "incomeid": 1, -> id prihoda
        "value" : 1000, -> vrijednost
        "userid": 7, -> id od usera
        "name" : "ime", -> ime prihoda
        "comment" : "komentar",
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/update', (req, res) => {

    let user = req.body.user;

    databaseManager.updateRequest({ id: updateIds.UPDATE_INCOME, data: { userid: user.userid, token: user.token, name: user.name, comment: user.comment, value: user.value, incomeid: user.incomeid } }, answer =>{
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else { 
                msg = "Updated income " + user.name;
                res.send({message: msg});
            }
    });
    return;
});

module.exports = router;