var express = require('express');
var router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const sendIds = require('../../../constants').databaseSendRequests;
const getIds = require('../../../constants').databaseGetRequests; 
const deleteIds = require('../../../constants').databaseDeleteRequests;
const updateIds = require('../../../constants').databaseUpdateRequests;   
const operationStates = require('../../../constants').databaseErrors;


//function dateToWantedFormat(date) {
//
//    let month = '' + (date.getMonth() + 1)
//    let day = '' + date.getDate()
//    let year = '' + date.getFullYear();
//
//    if (month.length < 2) month = '0' + month;
//    if (day.length < 2) day = '0' + day;
//
//    return [year, month, day].join('-');
//}


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

    databaseManager.getSingleRequest({ id: getIds.GET_EXPENSE, data : { userid: user.userid, token: user.token, estimateid: user.estimateid }}, answer =>{
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

function monthDiff(date1, date2) {

    var months;
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
    return months;
}

function parseDate(date) {

    let month = '' + (date.getMonth() + 1);
    let day   = '' + date.getDate();
    let year  = '' + date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('.');
}

function parseData(expenseData,startDate,endDate,monthRange, incomeData) {

    let iterDate = new Date(startDate);

    let parsedData = {
        graphData : [],
        tableData : [],
        incomeData: []
    };


    let numOfMonths = Math.ceil((monthDiff(startDate, endDate) + 1) / (monthRange * 1.0));

    parsedData.tableData.push({ outcome: 0, period: 'OD: ' + parseDate(iterDate), income: 0, difference: 0 });
    iterDate.setDate(1);
    iterDate.setMonth(iterDate.getMonth() + monthRange);

    for (let counter = 1; counter < numOfMonths; counter++) {
        parsedData.tableData.push({ outcome: 0, period: 'OD: ' + parseDate(iterDate), income: 0, difference: 0 });
        iterDate.setMonth(iterDate.getMonth() + monthRange);
    }

    let lastPosition = -1;

    expenseData.forEach((element,index) => {

        if ((index == 0) || (parsedData.graphData[lastPosition].category.categoryid != element.categoryid)) {

            lastPosition++;
            parsedData.graphData.push({ category: { name: element.name, categoryid: element.categoryid, parentid: element.parentid }, arrayOfValues: [] });

            for (let counter = 0; counter < numOfMonths; counter++) {
                parsedData.graphData[lastPosition].arrayOfValues.push({ label: parsedData.tableData[counter].period, y: 0, z: 0.5 });
            }
        }

        parsedData.graphData[lastPosition].arrayOfValues[element.monthValue].y += element.valueSum;

        parsedData.tableData[element.monthValue].outcome += element.valueSum;
        parsedData.tableData[element.monthValue].difference -= element.valueSum;
    });

    lastPosition = -1;

    incomeData.forEach((element, index) => {

        if ((index == 0) || (parsedData.incomeData[lastPosition].name != element.name)) {

            lastPosition++;
            parsedData.incomeData.push({ name: element.name, items: [] });

            for (let counter = 0; counter < numOfMonths; counter++) {
                parsedData.incomeData[lastPosition].items.push({ label: parsedData.tableData[counter].period, y: 0 });
            }
        }

        parsedData.incomeData[lastPosition].items[element.monthValue].y += element.valueSum;

        parsedData.tableData[element.monthValue].income += element.valueSum;
        parsedData.tableData[element.monthValue].difference += element.valueSum;
    });
    return parsedData;
}

/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "userid": 7, -> id od usera
        "estimateid" : 5, -> id 
        "startDate" : new Date(2018,7,24), -> pocetni datum
        "endDate" : new Date(2018,12,24), -> krajnji datum
        "monthRange" : 3, 
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/get-evaluated', (req, res) => {

    let user = req.body.user;

    console.log(user);

    let data = {
        userid: user.userid, token: user.token, estimateid: user.estimateid, startDate: user.startDate, endDate: user.endDate, monthRange: user.monthRange
    }

    databaseManager.getSingleRequest({ id: getIds.GET_EVALUATED_EXPENSE, data: data}, answer => {

        if (answer.state != operationStates.OPERATION_SUCCESS) {
             res.send({ error: answer.msg });
             return;
        }

        let expanseData = answer.data;

        databaseManager.getSingleRequest({ id: getIds.GET_EVALUATED_INCOME, data: data }, answer => {

            if (answer.state != operationStates.OPERATION_SUCCESS) { //shouldn't happen
                console.log(answer.msg);
                res.send({ error: answer.msg });
                return;
            }

            res.send({ message: answer.msg, data: parseData(expanseData, new Date(user.startDate), new Date(user.endDate), user.monthRange, answer.data) }); //answer.data});  
        });
    });
    return;
});

/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "userid": 7, -> id od usera
        "estimateid" : 5, -> id 
        "categoryid" : 2, -> id
        "value" : 1000, -> vrijednost
        "startDate" : new Date(2018,7,24), -> pocetni datum
        "endDate" : new Date(2018,12,24), -> krajnji datum
        "evaluate" : 13, 
        "name" : "ime", -> ime troska
        "comment": null -> komentar ako ga ima
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/create', (req, res) => {

    let user = req.body.user;

    console.log(user);

    databaseManager.sendRequest({ id: sendIds.CREATE_NEW_EXPENSE, 
        data: {
            userid: user.userid, token: user.token, estimateid: user.estimateid, categoryid: user.categoryid, startDate: user.startDate, endDate: user.endDate, value: user.value, evaluate: user.evaluate, name: user.name, comment: user.comment
            }
        }, answer =>{
        let newId, msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({ error: msg });
                console.log(msg);
            } else {
                msg = "Created new expense : " + user.name;
                newId = answer.data.expenseid;
                res.send({message : msg, newId : newId})
            }
    });
    return;
});

/*
 Primjer JSON objekta za slanje POST metode
{
	"user" : {
        "expenseid": 1, -> id troska
        "userid": 7, -> id od usera
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/delete', (req, res) => {

    let user = req.body.user;

    databaseManager.deleteRequest({ id: deleteIds.DELETE_EXPENSE, data: { userid: user.userid, token: user.token, expenseid: user.expenseid } }, answer =>{
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
        "expenseid": 1, -> id troska
        "value" : 1000, -> vrijednost
        "userid": 7, -> id od usera
        "name" : "ime", -> ime troska
        "comment" : "komentar",
        "token": "eb995b80e1e30e4cd1d3d6339e7c29828fa015abdb0d0c9114672a37fc331101ff99d13382a52bda71f72f49c9800644433f52fecfe0f2fff13e3459ca37e53f" ->token usera
	}
}
*/

router.post('/update', (req, res) => {

    let user = req.body.user;

    databaseManager.updateRequest({ id: updateIds.UPDATE_EXPENSE, data: { userid: user.userid, token: user.token, name: user.name, comment: user.comment, value: user.value, expenseid: user.expenseid } }, answer =>{
        let msg;
            if (answer.state != operationStates.OPERATION_SUCCESS) {
                msg = answer.msg;
                res.send({error : msg});
            } else { 
                msg = "Updated expense " + user.name;
                res.send({message: msg});
            }
    });
    return;
});
module.exports = router;