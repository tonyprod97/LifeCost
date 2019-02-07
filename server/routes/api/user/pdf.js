var express = require('express');
var router = express.Router();

const databaseManager = require('../../../DatabaseManager');
const sendIds = require('../../../constants').databaseSendRequests;
const getIds = require('../../../constants').databaseGetRequests; 
const deleteIds = require('../../../constants').databaseDeleteRequests;
const updateIds = require('../../../constants').databaseUpdateRequests;   
const operationStates = require('../../../constants').databaseErrors;

const PdfGenerator = require('../../../PdfGenerator/pdfgenerator');

/*
 Primjer JSON objekta za slanje POST metode
{
    "user": {
        "userid": 4,
        "estimateid" : 4,
        "token": "683994a148c1481b291d5871f1ec8b5a82ae8781dfc4f68d2aff84c2eb0232fe49530990c7fc64f666d0d7bb365ed0cecb58bea97ee16cd18ec299af4e2d0363"
    }
}
*/
router.post('/generate', (req, res) => {

    let user = req.body.user;
    var pdfData = [];

    console.log(user);

    databaseManager.getSingleRequest({ id: getIds.GET_PROFILE, data : { userid: user.userid, token: user.token }}, answer =>{
        if (answer.state == operationStates.OPERATION_SUCCESS) {
            pdfData.push(answer.data);

            databaseManager.getSingleRequest({ id: getIds.GET_CATEGORY, data : { userid : user.userid, token : user.token, estimateid: user.estimateid }}, answer =>{
                if (answer.state == operationStates.OPERATION_SUCCESS) {
                    pdfData.push(answer.data,answer.data.length);

                    databaseManager.getSingleRequest({ id: getIds.GET_INCOME, data : { userid: user.userid, token: user.token, estimateid: user.estimateid }}, answer =>{
                        if (answer.state == operationStates.OPERATION_SUCCESS) {
                            pdfData.push(answer.data,answer.data.length);
                            
                            databaseManager.getSingleRequest({ id: getIds.GET_EXPENSE, data : { userid: user.userid, token: user.token, estimateid: user.estimateid }}, answer =>{
                                if (answer.state == operationStates.OPERATION_SUCCESS) {
                                    pdfData.push(answer.data,answer.data.length);
                                    PdfGenerator(pdfData, res, user.userid);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    return;
});

module.exports = router;