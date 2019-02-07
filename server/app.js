const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const constants = require('./constants');

const databaseManager = require('./DatabaseManager');

//Initialize our app variable
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public/dist')));

app.use(require('./routes'));

app.get('/', (req, res) => {
    res.send("Invalid page");
});

//example code for using databaseMmanager


const dbGetRequest    = constants.databaseGetRequests;    // for testing
const dbSendRequest   = constants.databaseSendRequests;   // for testing
const dbDeleteRequest = constants.databaseDeleteRequests; // for testing
const dbUpdateRequest = constants.databaseUpdateRequests; // for testing
const dbErrors        = constants.databaseErrors;         // for testing

//app.get('/troskovnik/1/troskovi/', (req, res) => {
//    res.send(dbErrors);
//})


// for testing

function testInocme(userid, token, estimateid, callback) {

    let msg = "";

    databaseManager.sendRequest({
        id: dbSendRequest.CREATE_NEW_INCOME,
        data: {
            userid: userid, token: token, estimateid: estimateid, startDate: new Date(2017, 11, 24), endDate: new Date(2018, 12, 24), value: 1000, evaluate: 13, name: "My_income"
        }
    }, (answer) => {

        if (answer.state != dbErrors.OPERATION_SUCCESS) {
            msg += answer.msg + constants.newLineChar;
            callback(msg);
            return;
        }

        let incomeid = answer.data.incomeid;

        msg += "Created income: My_income ( " + incomeid + " )" + constants.newLineChar;
        databaseManager.getSingleRequest({ id: dbGetRequest.GET_INCOME, data: { userid: userid, token: token, estimateid: estimateid, } }, (answer) => {

            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                msg += answer.msg + constants.newLineChar;
                callback(msg);
                return;
            }



            answer.data.forEach((element) => {
                msg += JSON.stringify(element) + constants.newLineChar;
            });

            databaseManager.getSingleRequest({ id: dbGetRequest.GET_EVALUATED_INCOME, data: { userid: userid, token: token, estimateid: estimateid, startDate: new Date(2017, 11, 24), endDate: new Date(2018, 12, 24), monthRange: 3 } }, (answer) => {

                if (answer.state != dbErrors.OPERATION_SUCCESS) {
                    msg += answer.msg + constants.newLineChar;
                    callback(msg);
                    return;
                }
                msg += "evaluated income: " + constants.newLineChar;

                answer.data.forEach((element) => {
                    msg += JSON.stringify(element) + constants.newLineChar;
                });

                databaseManager.updateRequest({ id: dbUpdateRequest.UPDATE_INCOME, data: { userid: userid, token: token, incomeid: incomeid, name: "inc", value: 1200, comment: "updated" } }, (answer) => {

                    if (answer.state != dbErrors.OPERATION_SUCCESS) {
                        msg += answer.msg + constants.newLineChar;
                        callback(msg);
                        return;
                    }

                    msg += "Update on income success " + constants.newLineChar;

                    databaseManager.getSingleRequest({ id: dbGetRequest.GET_EVALUATED_INCOME, data: { userid: userid, token: token, estimateid: estimateid, startDate: new Date(2017, 11, 24), endDate: new Date(2018, 12, 24), monthRange: 3 } }, (answer) => {

                        if (answer.state != dbErrors.OPERATION_SUCCESS) {
                            msg += answer.msg + constants.newLineChar;
                            callback(msg);
                            return;
                        }

                        answer.data.forEach((element) => {
                            msg += JSON.stringify(element) + constants.newLineChar;
                        });

                        databaseManager.deleteRequest({ id: dbDeleteRequest.DELETE_INCOME, data: { userid: userid, token: token, incomeid: incomeid } }, (answer) => {

                            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                msg += answer.msg + constants.newLineChar;
                                callback(msg);
                                return;
                            }

                            msg += "Delete on income success" + constants.newLineChar;
                            callback(msg);
                        });
                    });
                });
            });
        });
    });
}

function test2(userid, token, estimateid, callback) {

    let msg = "";

    databaseManager.getSingleRequest({ id: dbGetRequest.GET_EXPENSE, data: { userid: userid, token: token, estimateid: estimateid } }, (answer) => {

        if (answer.state != dbErrors.OPERATION_SUCCESS) {
            msg += answer.msg + constants.newLineChar;
            callback(msg);
            return;
        }

        let size = answer.data.length;

        msg += "expenses recived ( " + size + " )" + constants.newLineChar;

        for (let counter = 0; counter < size; counter++) {
            msg += JSON.stringify(answer.data[counter]) + constants.newLineChar;
        }

        databaseManager.getSingleRequest({
            id: dbGetRequest.GET_EVALUATED_EXPENSE,
            data: {
                userid: userid, token: token, estimateid: estimateid, startDate: new Date(2017, 11, 24), endDate: new Date(2018, 7, 24), monthRange: 3
            }
        }, (answer) => {

            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                msg += answer.msg + constants.newLineChar;
                callback(msg);
                return;
            }

            let size = answer.data.length;

            msg += "Parsed expenses recived ( " + size + " )" + constants.newLineChar;

            for (let counter = 0; counter < size; counter++) {
                msg += JSON.stringify(answer.data[counter]) + constants.newLineChar;
            }

            testInocme(userid, token, estimateid, (retMsg) => {
                msg += retMsg;
                callback(msg);
            });
        });
    });
}

function test(userid, token, estimateid, callback) {

    let msg = "";

    databaseManager.sendRequest({ id: dbSendRequest.CREATE_CATEGORY, data: { userid: userid, token: token, estimateid: estimateid , name: "My Category", parentid: 3 } }, (answer) => {

        if (answer.state != dbErrors.OPERATION_SUCCESS) {
            msg += answer.msg + constants.newLineChar;
            callback(msg);
            return;
        }

        let categoryid = answer.data.categoryid;

        msg += "new category added: My Category ( " + answer.data.categoryid + " )" + constants.newLineChar;

        databaseManager.updateRequest({ id: dbUpdateRequest.UPDATE_CATEGORY, data: { userid: userid, token: token, name: "My Cat", categoryid: categoryid }}, (answer) => {

            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                msg += answer.msg + constants.newLineChar;
            } else {
                msg += "Renamed a category into: My Cat" + constants.newLineChar;
            }
        
            databaseManager.getSingleRequest({ id: dbGetRequest.GET_CATEGORY, data: { userid: userid, token: token, estimateid: estimateid } }, (answer) => {

                if (answer.state != dbErrors.OPERATION_SUCCESS) {
                    msg += answer.msg + constants.newLineChar;
                    callback(msg);
                    return;
                }

                let size = answer.data.length;
                msg += "Categories in estimate ( " + size + " ): " + constants.newLineChar;

                for (let counter = 0; counter < size; counter++) {
                    msg += answer.data[counter].name + " ( " + answer.data[counter].categoryid + " ) - parent: " + answer.data[counter].parentid + constants.newLineChar;
                    //console.log(answer.data);
                }

                databaseManager.sendRequest({
                    id: dbSendRequest.CREATE_NEW_EXPENSE,
                    data: {
                        userid: userid, token: token, estimateid: estimateid, categoryid: categoryid, startDate: new Date(2017, 11, 24), endDate: new Date(2018, 12, 24), value: 1000, evaluate: 13, name: "My Expense"
                    }
                }, (answer) => {

                    if (answer.state != dbErrors.OPERATION_SUCCESS) {
                        msg += answer.msg + constants.newLineChar;
                        callback(msg);
                        return;
                    }

                    msg += "New expense added ( " + answer.data.expenseid + " )" + constants.newLineChar;

                    let expenseid = answer.data.expenseid;

                    databaseManager.getSingleRequest({ id: dbGetRequest.GET_EXPENSE, data: { userid: userid, token: token, estimateid: estimateid } }, (answer) => {

                        if (answer.state != dbErrors.OPERATION_SUCCESS) {
                            msg += answer.msg + constants.newLineChar;
                            callback(msg);
                            return;
                        }

                        let size = answer.data.length;

                        msg += "expenses recived ( " + size + " )" + constants.newLineChar;

                        for (let counter = 0; counter < size; counter++) {
                            msg += JSON.stringify(answer.data[counter]) + constants.newLineChar;
                        }

                        databaseManager.getSingleRequest({
                            id: dbGetRequest.GET_EVALUATED_EXPENSE,
                            data: {
                                userid: userid, token: token, estimateid: estimateid, startDate: new Date(2017, 11, 24), endDate: new Date(2018, 7, 24), monthRange: 3
                            }
                        }, (answer) => {

                            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                msg += answer.msg + constants.newLineChar;
                                callback(msg);
                                return;
                            }

                            let size = answer.data.length;

                            msg += "Parsed expenses recived ( " + size + " )" + constants.newLineChar;

                            for (let counter = 0; counter < size; counter++) {
                                msg += JSON.stringify(answer.data[counter]) + constants.newLineChar;
                            }

                            databaseManager.updateRequest({
                                id: dbUpdateRequest.UPDATE_EXPENSE,
                                data: {
                                    userid: userid, token: token, name: "My exp", comment: "updated", value: 1200, expenseid: expenseid
                                }
                            }, (answer) => {

                                if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                    msg += answer.msg + constants.newLineChar;
                                } else {
                                    msg += "Update on expanse success" + constants.newLineChar;
                                }

                                test2(userid, token, estimateid, (retMsg) => {

                                    msg += retMsg;

                                    databaseManager.deleteRequest({ id: dbDeleteRequest.DELETE_EXPENSE, data: { userid: userid, token: token, expenseid: expenseid } }, (answer) => {

                                        if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                            msg += answer.msg + constants.newLineChar;
                                            callback(msg);
                                            return;
                                        }

                                        msg += "Delete on expense success" + constants.newLineChar;

                                        databaseManager.deleteRequest({ id: dbDeleteRequest.DELETE_CATEGORY, data: { userid: userid, token: token, categoryid: categoryid } }, (answer) => {

                                            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                                msg += answer.msg + constants.newLineChar;
                                                callback(msg);
                                                return;
                                            }

                                            msg += "Delete on category success" + constants.newLineChar;
                                            callback(msg);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function testProfile(userid, token, callback) {

    let msg = "";

    databaseManager.updateRequest({ id: dbUpdateRequest.UPDATE_PROFILE, data: { userid: userid, token: token, name: 'oetmateo', lastname: 'oetlast' } }, (answer) => {

        if (answer.state != dbErrors.OPERATION_SUCCESS) {
           // console.log("error");
            msg += answer.msg + constants.newLineChar;
            callback(msg);
            return;
        }

        msg += "Update on profile success" + constants.newLineChar;

        databaseManager.getSingleRequest({ id: dbGetRequest.GET_PROFILE, data: { userid: userid, token: token } }, (answer) => {

            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                msg += answer.msg + constants.newLineChar;
                callback(msg);
                return;
            }

            msg += JSON.stringify(answer.data) + constants.newLineChar;

            databaseManager.updateRequest({ id: dbUpdateRequest.UPDATE_PROFILE, data: {userid: userid, token: token} }, (answer) => {

                if (answer.state != dbErrors.OPERATION_SUCCESS) {
                    msg += answer.msg + constants.newLineChar;
                    callback(msg);
                    return;
                }

                msg += "Delete on profile success" + constants.newLineChar;
                callback(msg);
            });
        });
    });
    
    
}

app.get('/test', (req, res) => {

    let msg = "database  on -> " + databaseManager.isReady().toString() + constants.newLineChar;
    let userid;
    let token;

    databaseManager.sendRequest({ id: dbSendRequest.CREATE_NEW_USER, data: { username: "oet_user", password: "oet_pass", email: "oet_user@email.com" } }, (response) => {
    
        msg += "oet_user -> " + response.msg + constants.newLineChar;
    
        databaseManager.sendRequest({ id: dbSendRequest.LOGIN_REQUEST, data: { password: "oet_pass", username: "oet_user" } }, (response) => {
        //databaseManager.sendRequest({ id: dbSendReqests.LOGIN_REQUEST, data: { password: "oet_pass", email: ";DROP TABLE data; --" } }, (response) => { //sql injection test

            //console.log(response.data);

            if (response.state != dbErrors.OPERATION_SUCCESS) {
                msg += response.msg + constants.newLineChar;
                res.send(msg);
                return;
            }
            
            msg += "got user: " + response.data.username + " (" + response.data.id + ")" + constants.newLineChar;
            msg += "got email: " + response.data.email + constants.newLineChar;
            msg += "sessionToken -> " + response.data.token + constants.newLineChar;

            userid = response.data.id;
            token  = response.data.token;

            testProfile(userid, token, (retMsg) => {

                msg += retMsg
            
                databaseManager.getSingleRequest({ id: dbGetRequest.DATABASE_VERSION }, (answer) => {

                    if (answer.state == dbErrors.OPERATION_SUCCESS) {
                        msg += "database version -> " + answer.data.version + constants.newLineChar;
                    }

                    databaseManager.sendRequest({ id: dbSendRequest.CREATE_COST_ESTIMATE, data: { userid: userid, token: token, name: "My Estimate" } }, (answer) => {

                        //databaseManager.sendRequest({ id: dbSendReqests.CREATE_COST_ESTIMATE, data: { userid: userid, token: token, name: "My Cost Estimate2" } },(answer) => {});
                        //databaseManager.sendRequest({ id: dbSendReqests.CREATE_COST_ESTIMATE, data: { userid: userid, token: token, name: "My Cost Estimate3" } },(answer) => {});

                        let createdId;

                        if (answer.state != dbErrors.OPERATION_SUCCESS) {
                            msg += answer.msg + constants.newLineChar;
                        } else {
                            msg += "created new cost estimate: My Estimate" + constants.newLineChar;
                            createdId = answer.data.estimateid;
                        }

                        databaseManager.updateRequest({ id: dbUpdateRequest.UPDATE_COST_ESTIMATE, data: { userid: userid, token: token, name: "My Est", estimateid: createdId } }, (answer) => {

                            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                msg += answer.msg + constants.newLineChar;
                            } else {
                                msg += "Renamed estimete into: My Est" + constants.newLineChar;
                            }

                            databaseManager.getSingleRequest({ id: dbGetRequest.GET_COST_ESTIMATE, data: { userid: userid, token: token } }, (answer) => {

                                if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                    msg += answer.msg + constants.newLineChar;
                                } else {

                                    let size = answer.data.length;

                                    msg += "My Cost Estimates ( " + size + " ): " + constants.newLineChar;

                                    for (let counter = 0; counter < size; counter++) {
                                        msg += answer.data[counter].name + " ( " + answer.data[counter].estimateid + " )" + constants.newLineChar;
                                        //console.log(answer.data);
                                    }
                                }

                                //let estimateid = answer.data[0].estimateid;
                                test(userid, token, createdId, (retMsg) => {

                                    msg += retMsg;
                                    //res.send(msg);

                                    databaseManager.deleteRequest({ id: dbDeleteRequest.DELETE_COST_ESTIMATE, data: { userid: userid, token: token, estimateid: createdId } }, (answer) => {

                                        if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                            msg += answer.msg + constants.newLineChar;
                                        } else {
                                            msg += "Delete on estimate success" + constants.newLineChar;
                                        }

                                        databaseManager.sendRequest({ id: dbSendRequest.TERMINATE_SESSION, data: { userid: userid, token: token } }, (answer) => {

                                            if (answer.state != dbErrors.OPERATION_SUCCESS) {
                                                msg += answer.msg + constants.newLineChar;
                                            } else {
                                                msg += "logout success" + constants.newLineChar;
                                            }

                                            res.send(msg);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(constants.port, () => {
    console.log(`Starting the server at port ${constants.port}`);
});
