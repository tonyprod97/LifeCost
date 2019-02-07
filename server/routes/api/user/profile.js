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
		"userid": 7, -> id usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/get', (req, res) => {

    let user = req.body.user;

    databaseManager.getSingleRequest({ id: getIds.GET_PROFILE, data : { userid: user.userid, token: user.token }}, answer =>{
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else {
                msg = answer.msg;
                res.send({message: msg, data : answer.data});
            }
    });
    return;
});

/*
 Primjer JSON objekta za slanje POST metode
 prva dva reda su samo obavezna
{ 
	"user" : {
		"userid": 7, -> id usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f", ->token usera
            "name" : "ime",
            "lastname" : "prezime",
            "oib" : 4545343524,
            "homeAddress" : "adresa",
            "phoneNumber" : 0988888888
	}
}
*/

router.post('/update', (req, res) => {

    let user = req.body.user;

    if (user.name === '') user.name = null;
    if (user.lastname === '') user.lastname = null;
    if (user.oib === '') user.oib = null;
    if (user.homeAddress === '') user.homeAddress = null;
    if (user.phoneNumber === '') user.phoneNumber = null;

    databaseManager.updateRequest({ id: updateIds.UPDATE_PROFILE,
         data : { userid: user.userid, token: user.token, name: user.name, lastname: user.lastname, oib : user.oib, homeAddress : user.homeAddress, phoneNumber : user.phoneNumber }
        }, answer => {
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else {
                msg = "Updated profile ";
                res.send({message: msg});
            }
    });
    return;
});

/*
 Primjer JSON objekta za slanje POST metode
{ 
	"user" : {
		"userid": 7, -> id usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f", ->token usera
	}
}
*/

router.post('/delete', (req, res) => {

    let user = req.body.user;

    databaseManager.updateRequest({ id: updateIds.UPDATE_PROFILE, data : { userid: user.userid, token: user.token }}, answer =>{
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else {
                msg = "Delete on profile success";
                res.send({message: msg});
            }
    });
    return;
});

module.exports = router;