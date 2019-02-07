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
        "estimateid": 1, -> id troskovnika
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/get', (req, res) => {

    let user = req.body.user;

    databaseManager.getSingleRequest({ id: getIds.GET_CATEGORY, data : { userid : user.userid, token : user.token, estimateid: user.estimateid }}, answer =>{
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
        "name" : "Ime", -> ime kategorije
        "estimateid": 1, -> id troskovnika
        "userid": 7, -> id od usera
        "parentid" : 1, -> id od nadkategorije
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/create', (req, res) => {

    let user = req.body.user;

    databaseManager.sendRequest({ id: sendIds.CREATE_CATEGORY, data : { name : user.name , userid : user.userid, token : user.token, estimateid : user.estimateid, parentid : user.parentid}}, answer =>{

        let newId, msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else {
                msg = "Created new category : " + user.name;
                newId = answer.data.categoryid;
                res.send({message : msg, newId : newId})
            }
    });
    return;
});

/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "categoryid": 1, -> id kategorije
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/delete', (req, res) => {

    let user = req.body.user;

    databaseManager.deleteRequest({ id: deleteIds.DELETE_CATEGORY, data: { userid: user.userid, token: user.token, categoryid: user.categoryid } }, answer =>{
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
        "categoryid": 1, -> id kategorije
        "userid": 7, -> id od usera
        "name" : "Kategorija" -> ime kategorije
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/update', (req, res) => {

    let user = req.body.user;

    databaseManager.updateRequest({ id: updateIds.UPDATE_CATEGORY, data: { userid: user.userid, token: user.token, name: user.name, categoryid: user.categoryid } }, answer =>{
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else { 
                msg = "Renamed a category into: " + user.name;
                res.send({message: msg});
            }
    });
    return;
    
});

module.exports = router;