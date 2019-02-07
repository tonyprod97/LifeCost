"use strict"

const config = {

    host:     'localhost',
    user:     'root',
    password: ''
};

const databaseName    = 'data';
const userTable       = 'data.user';
const versionTable    = 'data.dbversion';
const sessionTable    = 'data.session';
const optionalTable   = 'data.userData';
const estimateTable   = 'data.costEstimate';
const sentTable       = 'data.sent';
const expenseTable    = 'data.expense';
const categoryTable   = 'data.category';
const incomeTable     = 'data.income';
const evaluatedTable  = 'data.evaluated';
const evaluateInTable = 'data.income_evaluated'

const mysql          = require('mysql');
const dbConsts       = require('../constants').databaseErrors;
const getRequests    = require('../constants').databaseGetRequests;
const sendRequests   = require('../constants').databaseSendRequests;
const deleteRequests = require('../constants').databaseDeleteRequests;
const updateRequests = require('../constants').databaseUpdateRequests;

const crypto = require('crypto');

const sessionLifeTime = 'INTERVAL 10 DAY'; 

const DATABASE_VERSION = 13;
const NO_OLD_DATABASE  = 0; 

function addDummyUser(callback) {

    databaseManager.sendRequest({ id: sendRequests.CREATE_NEW_USER, data: { username: "testUser2", password: "testPass", email: "test2@test.com" } }, (response) => { });

    databaseManager.sendRequest({ id: sendRequests.CREATE_NEW_USER, data: { username: "testUser", password: "testPass", email: "test@test.com" } }, (response) => {

        databaseManager.sendRequest({ id: sendRequests.LOGIN_REQUEST, data: { password: "testPass", username: "testUser" } }, (response) => {

            let userid = response.data.id;
            let token = response.data.token;

            databaseManager.sendRequest({ id: sendRequests.CREATE_COST_ESTIMATE, data: { userid: userid, token: token, name: "My Estimate_1" } }, (answer) => {

                let estimateid = answer.data.estimateid;    

                databaseManager.sendRequest({ id: sendRequests.CREATE_COST_ESTIMATE, data: { userid: userid, token: token, name: "My Estimate_2" } }, (answer) => { });
                databaseManager.sendRequest({ id: sendRequests.CREATE_COST_ESTIMATE, data: { userid: userid, token: token, name: "My Estimate_3" } }, (answer) => { });

                databaseManager.sendRequest({ id: sendRequests.SEND_ESTIMATE, data: { userid: userid, token: token, estimateid: estimateid, toUsername: "testUser2"} }, (answer) => { });
                databaseManager.sendRequest({ id: sendRequests.SEND_ESTIMATE, data: { userid: userid, token: token, estimateid: estimateid + 1, toEmail: "test2@test.com" } }, (answer) => { });

                databaseManager.sendRequest({ id: sendRequests.CREATE_CATEGORY, data: { userid: userid, token: token, estimateid: estimateid, name: "My Category_1", parentid: 3 } }, (answer) => {

                    let categoryid = answer.data.categoryid;

                    databaseManager.sendRequest({
                        id: sendRequests.CREATE_NEW_EXPENSE,
                        data: {
                            userid: userid, token: token, estimateid: estimateid, categoryid: categoryid, startDate: '2017-11-24', endDate: '2018-12-24', value: 1000, evaluate: 13, name: "My Expense_1"
                        }
                    }, (answer) => { if (answer.state != dbConsts.OPERATION_SUCCESS) console.log(answer.msg); });

                    databaseManager.sendRequest({
                        id: sendRequests.CREATE_NEW_EXPENSE,
                        data: {
                            userid: userid, token: token, estimateid: estimateid, categoryid: categoryid, startDate: '2017-09-24', endDate: '2018-10-24', value: 1000, evaluate: 13, name: "My Expense_2"
                        }
                    }, (answer) => {
                        //databaseManager.sendRequest({ id: sendRequests.TERMINATE_SESSION, data: { userid: userid, token: token } }, (answer) => { });
                        //setTimeout(() => callback(), 0);
                    });

                    databaseManager.sendRequest({
                        id: sendRequests.CREATE_NEW_INCOME,
                        data: {
                            userid: userid, token: token, estimateid: estimateid, startDate: '2017-09-24', endDate: '2018-10-24', value: 1200, evaluate: 13, name: "My_Income_1"
                        }
                    }, (answer) => {
                       //databaseManager.sendRequest({ id: sendRequests.TERMINATE_SESSION, data: { userid: userid, token: token } }, (answer) => { })});
                       //setTimeout(() => callback(), 0);
                    });

                    databaseManager.sendRequest({
                        id: sendRequests.CREATE_NEW_INCOME,
                        data: {
                            userid: userid, token: token, estimateid: estimateid, startDate: '2017-11-24', endDate: '2018-12-24', value: 1250, evaluate: 13, name: "My_Income_2"
                        }
                    }, (answer) => {
                        databaseManager.sendRequest({ id: sendRequests.TERMINATE_SESSION, data: { userid: userid, token: token } }, (answer) => { });
                        setTimeout(() => callback(), 0);
                    });

                    //databaseManager.sendRequest({ id: sendRequests.LOGIN_REQUEST, data: { username: "testUser2", password: "testPass" } }, (answer) => {
                    //
                    //    userid = answer.data.id;
                    //    token  = answer.data.token;    
                    //
                    //    databaseManager.getSingleRequest({ id: getRequests.GET_RECEIVED_ESTIMATES, data: { userid: userid, token: token} }, (answer) => {
                    //
                    //        //console.log({ userid: userid, token: token });
                    //        console.log(answer.data);
                    //
                    //        databaseManager.getSingleRequest({ id: getRequests.GET_EXPENSE, data: { userid: userid, token: token, estimateid: estimateid } }, (answer) => {
                    //
                    //            console.log(answer.data);
                    //            
                    //            databaseManager.sendRequest({ id: sendRequests.TERMINATE_SESSION, data: { userid: userid, token: token } }, (answer) => { });
                    //        });
                    //
                    //    });
                    //
                    //});
                });
            });
        });
    });
}

function seededSha256(seed, password) {

    let hashStr = "";
    let hash = "";

    let size = Math.min(seed.length, password.length);
    let counter;

    for (counter = 0; counter < size; counter++) {
        hashStr += seed.charAt(counter);
        hashStr += password.charAt(counter);
    }

    if (seed.length > size) {
        hashStr += seed.slice(counter);
    } else {
        hashStr += password.slice(counter);
    }

    let hasher_sha256 = crypto.createHash('sha256');

    hasher_sha256.update(hashStr);
    hash = hasher_sha256.digest('hex');

    return hash;
}

function toJSON(rowDataPacket) {
    return Object.values(JSON.parse(JSON.stringify(rowDataPacket)));
}

function randomTokenString(size) {
    return crypto.randomBytes(size).toString('hex');
}

function formatDate(date) {

    let temp = new Date(date);

    let month = '' + (temp.getMonth() + 1);
    let day   = '' + temp.getDate();
    let year  = '' + temp.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function isValidSessionInfo(database, userid, sessionToken, callback) {

    database.query('SELECT userid FROM ' + sessionTable + ' WHERE userid = ? and sessionToken = ? and CURDATE() <= DATE_ADD(createdate,' + sessionLifeTime + ')',[userid,sessionToken],
    (error, result) => {

        if (error) {
            console.log(error);
            setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED, msg: "Neuspijesna validacija sijednice"}));
            return;
        }

        if (result.length == 0) {
            setTimeout(() => callback({ state: dbConsts.OPERATION_DENIED, msg: "Neispravan token sijednice" }));
            return;
        }

        setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, msg: "operation success" }));
    });
}

function newSession(database, userid, callback) {

    let sessionToken = randomTokenString(64);

    database.query('INSERT INTO ' + sessionTable + ' (userID,sessionToken,createDate) VALUES (?,?,CURDATE())', [userid, sessionToken], (error) => {

        if (error) {

            setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED }), 0);
            //console.log(error);
            return;
        }

        setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, token: sessionToken }), 0);
    });
}

function createUser(database, username, email, password, callback) {

    let answer = {
        state: null,
        msg: "",
        data: null
    };

    database.query('INSERT INTO ' + userTable + '(username,email,passwordHash) VALUES (?,?,?)', [username, email, seededSha256(email,password)], (error) => {

        if (error) {

            answer.state = dbConsts.OPERATION_FAILED;
            answer.msg   = "Email ili korisnicko ime je vec zauzeto"; //'username or email is already taken';
            setTimeout(() => callback(answer), 0);

            return;
        }

        answer.state = dbConsts.OPERATION_SUCCESS;
        answer.msg   = "operation success";
        setTimeout(() => callback(answer), 0);

        return;
    });
}

function getEmailFromUsername(database, username, callback) {

    database.query('SELECT email FROM ' + userTable + ' WHERE username = ?', [username], (error, result) => {

        if ((error) || (result.length == 0)) {

            setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED }), 0);
            return;
        }

        setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, email: toJSON(result)[0].email }), 0);
    });
} 

function getUseridFromEmail(database, email, callback) {

    database.query('SELECT id FROM ' + userTable + ' WHERE email = ?', [email], (error, result) => {

        if ((error) || (result.length == 0)) {

            setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED }), 0);
            return;
        }

        setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, id: toJSON(result)[0].id }), 0);
    });
}

function createDefaultCategories(database, callback) {

    database.query("INSERT INTO " + categoryTable + "(parentid, estimateid, name) VALUES (NULL,NULL,'Rezije')   ", (error) => { if (error) console.log(error); });
    database.query("INSERT INTO " + categoryTable + "(parentid, estimateid, name) VALUES (NULL,NULL,'Hrana')    ", (error) => { if (error) console.log(error); });
    database.query("INSERT INTO " + categoryTable + "(parentid, estimateid, name) VALUES (NULL,NULL,'Kozmetika')", (error) => { if (error) console.log(error); });
    database.query("INSERT INTO " + categoryTable + "(parentid, estimateid, name) VALUES (NULL,NULL,'Prijevoz') ", (error) => { if (error) console.log(error); });
    database.query("INSERT INTO " + categoryTable + "(parentid, estimateid, name) VALUES (NULL,NULL,'Izlasci')  ", (error) => { if (error) console.log(error); });

    setTimeout(() => callback(), 0);
}

function deleteProfile(database, userid, token, callback) {

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            callback(answer);
            return
        }

        database.query("DELETE FROM " + optionalTable + " WHERE userid = ?", [userid], (error) => {

            if (error) {
                setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED, msg: "Neuspijesno mijenjanje profila", data: null }), 0);
                return;
            }

            setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, msg: "operation success", data: null }), 0);
        });
    }); 
}

function updateProfile(database, userid, token, name, lastname, oib, homeAddress, phoneNumber, callback) {

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            callback(answer);
            return
        }

        database.query("SELECT userid FROM " + optionalTable + " WHERE userid = ?", [userid], (error, result) => {

            if (error) {
                setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, msg: "Neuspijesno mijenjanje profila", data: null }), 0);
                return;
            }

            if (result.length == 0) {

                database.query("INSERT INTO " + optionalTable + " (userid, name, lastname, oib, homeAddress, phoneNumber) VALUES(?,?,?,?,?,?)", [userid, name, lastname, oib, homeAddress, phoneNumber], (error) => {

                    if (error) {
                        setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED, msg: "Neuspijesno mijenjanje profila", data: null }), 0);
                        return;
                    }

                    setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, msg: "operation success", data: null }), 0);
                });

                return;
            }

            database.query("UPDATE " + optionalTable + " SET name = ?, lastname = ?, oib = ?, homeAddress = ?, phoneNumber = ? WHERE userid = ?", [name, lastname, oib, homeAddress, phoneNumber, userid], (error) => {

                if (error) {
                    setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED, msg: "Neuspijesno mijenjanje profila", data: null }), 0);
                    return;
                }

                setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, msg: "operation success", data: null }), 0);
            });
        });
    });
}

function getProfile(database, userid, token, callback) {

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            callback(answer);
            return
        }

        let data = {
            state: dbConsts.OPERATION_SUCCESS,
            msg: "operation success",
            data: { name: null, lastname: null, oib: null, homeAddress: null, phoneNumber: null },
        };

        database.query('SELECT name, lastname, oib, homeAddress, phoneNumber FROM ' + optionalTable + ' WHERE userid = userid', [userid], (error, result) => {

            if (error) {
                setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED, msg: "Neuspijesni dohvat profila", data: null }), 0);
                return;
            }

            if (result.length == 0) {
                setTimeout(() => callback(data), 0);
                return;
            }

            data.data = toJSON(result)[0];
            setTimeout(() => callback(data), 0);
        });
    });
}

function initDatabase(database, OLD_VERSION, callback) {

    //database.query("DROP DATABASE " + databaseName, (error) => { }); OLD_VERSION = NO_OLD_DATABASE; //uncomment if database gets corrupted then run again and comment it again

    if (OLD_VERSION == DATABASE_VERSION) {
        setTimeout(() => callback(), 0);
        return;
    }

    //deal with version mismatch

    console.log("updating database...");

    if (OLD_VERSION != NO_OLD_DATABASE) {

        console.log("no compatable data transfer, droping old database ... ");

        database.query("DROP DATABASE " + databaseName, (error) => { if (error) console.log(error); });
    }

    database.query("CREATE DATABASE " + databaseName, (error) => {if (error) console.log(error);});
    
    database.query("CREATE TABLE " + versionTable + "( \
                   `version` INT NOT NULL, \
                   PRIMARY KEY (`version`) \
                   );", (error) => { if (error) console.log(error);}
    );

    database.query("INSERT INTO " + versionTable + " (version) VALUES (" + DATABASE_VERSION + ")", (error) => { if (error) console.log(error);});

    database.query("CREATE TABLE " + userTable + " ( \
             `id` INT NOT NULL AUTO_INCREMENT, \
             `username` VARCHAR(30) NOT NULL, \
             `email` VARCHAR(100) NOT NULL, \
             `passwordHash` VARCHAR(70) NOT NULL, \
             PRIMARY KEY(`id`), \
             UNIQUE INDEX `username_UNIQUE` (`username`), \
             UNIQUE INDEX `email_UNIQUE` (`email`) \
             );", (error) => { if (error) console.log(error); }
    );

    database.query("use " + databaseName, (error) => { if (error) console.log(error); } );

    database.query("CREATE TRIGGER `user_data_insert` BEFORE INSERT ON " + userTable + " \
             FOR EACH ROW \
             BEGIN \
                IF(NEW.username LIKE '%@%' OR NEW.email NOT LIKE '%@%') THEN \
                    SIGNAL SQLSTATE '42000' SET MESSAGE_TEXT = 'invalied email or username'; \
                END IF; \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + sessionTable + " ( \
             `id` INT NOT NULL AUTO_INCREMENT, \
             `userid` INT NOT NULL, \
             `sessionToken` VARCHAR(130) NOT NULL, \
             `createDate` DATE NOT NULL, \
             PRIMARY KEY(`id`), \
             UNIQUE INDEX `session_UNIQUE` (`userid`,`sessiontoken`), \
             FOREIGN KEY (`userid`) REFERENCES " + userTable + "(id) ON DELETE CASCADE \
             );", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + optionalTable + " ( \
        `userid` INT NOT NULL, \
        `oib` VARCHAR(15) NULL, \
        `name` VARCHAR(30) NULL, \
        `lastname` VARCHAR(35) NULL, \
        `phoneNumber` VARCHAR(30) NULL, \
        `homeAddress` VARCHAR(85) NULL, \
        PRIMARY KEY(`userid`), \
        FOREIGN KEY(`userid`) REFERENCES " + userTable + "(id) ON DELETE CASCADE, \
        UNIQUE INDEX`oib_UNIQUE`(`oib`) \
        );", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + estimateTable + " ( \
        `id` INT NOT NULL AUTO_INCREMENT, \
        `userid` INT NOT NULL, \
        `name` VARCHAR(50) NOT NULL, \
        PRIMARY KEY(`id`), \
        FOREIGN KEY(`userid`) REFERENCES " + userTable + "(id) ON DELETE CASCADE, \
        UNIQUE INDEX`estimate_UNIQUE`(`userid`, `name`) \
        );", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + sentTable + " ( \
        `userid` INT NOT NULL, \
        `estimateid` INT NOT NULL, \
        PRIMARY KEY(`userid`, `estimateid`), \
        FOREIGN KEY(`userid`) REFERENCES " + userTable + "(id) ON DELETE CASCADE, \
        FOREIGN KEY(`estimateid`) REFERENCES " + estimateTable + "(id) ON DELETE CASCADE \
        );", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + categoryTable +" ( \
        `id` INT NOT NULL AUTO_INCREMENT, \
        `estimateid` INT NULL, \
        `name` VARCHAR(30) NOT NULL, \
        `parentid` INT NULL, \
        PRIMARY KEY(`id`), \
        UNIQUE INDEX `category_UNIQUE` (`estimateid`,`name`), \
        FOREIGN KEY(`parentid`) REFERENCES " + categoryTable + "(id) ON DELETE CASCADE, \
        FOREIGN KEY(`estimateid`) REFERENCES " + estimateTable + "(id) ON DELETE CASCADE \
        );", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER `category_data_insert` BEFORE INSERT ON " + categoryTable + " \
             FOR EACH ROW \
             BEGIN \
                IF(NEW.name IN (SELECT name FROM data.category WHERE estimateid IS NULL)) THEN \
                    SIGNAL SQLSTATE '42000' SET MESSAGE_TEXT = 'category already in estimate'; \
                END IF; \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER `category_data_update` BEFORE UPDATE ON " + categoryTable + " \
             FOR EACH ROW \
             BEGIN \
                IF(NEW.name IN (SELECT name FROM data.category WHERE estimateid IS NULL)) THEN \
                    SIGNAL SQLSTATE '42000' SET MESSAGE_TEXT = 'category already in estimate'; \
                END IF; \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + expenseTable + " ( \
        `id` INT NOT NULL AUTO_INCREMENT, \
        `name` VARCHAR(30) NOT NULL, \
        `categoryid` INT NOT NULL, \
        `estimateid` INT NOT NULL, \
        `evaluate` INT NOT NULL, \
        `startDate` DATE NOT NULL, \
        `endDate` DATE NOT NULL, \
        `comment` VARCHAR(100) NULL, \
        `value` INT NOT NULL, \
        PRIMARY KEY(`id`), \
        UNIQUE INDEX `expense_UNIQUE` (`estimateid`,`name`), \
        FOREIGN KEY(`categoryid`) REFERENCES " + categoryTable + "(id) ON DELETE CASCADE \
        ); ", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER `expense_data_insert` BEFORE INSERT ON " + expenseTable + " \
             FOR EACH ROW \
             BEGIN \
                IF(NEW.startDate > NEW.endDate) THEN \
                    SIGNAL SQLSTATE '42000' SET MESSAGE_TEXT = 'startDate is bigger then end date'; \
                END IF; \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + evaluatedTable + " ( \
        `expenseid` INT NOT NULL, \
        `date` DATE NOT NULL, \
        `value` INT NOT NULL, \
        PRIMARY KEY(`expenseid`,`date`), \
        FOREIGN KEY(`expenseid`) REFERENCES " + expenseTable + "(id) ON DELETE CASCADE \
        ); ", (error) => { if (error) console.log(error); }
    );


    database.query("CREATE TRIGGER evaluate_data_direct_update BEFORE UPDATE ON " + evaluatedTable + " \
             FOR EACH ROW \
             BEGIN \
                IF (@disabled_evaluate_data_direct_update IS NULL) THEN \
                    IF(NEW.value IS NOT NULL) THEN \
                        SIGNAL SQLSTATE '42000' SET MESSAGE_TEXT = 'No direct update allowed'; \
                    END IF; \
                    SET NEW.value = ((SELECT value FROM " + expenseTable + " WHERE id = NEW.expenseid) + OLD.value); \
                END IF; \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER evaluate_data_direct_insert BEFORE INSERT ON " + evaluatedTable + " \
             FOR EACH ROW \
             BEGIN \
                SET NEW.value = (SELECT value FROM " + expenseTable + " WHERE id = NEW.expenseid); \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER evaluate_data_update AFTER UPDATE ON " + expenseTable + " \
             FOR EACH ROW \
             BEGIN \
                SET @disabled_evaluate_data_direct_update = 1; \
                    UPDATE " + evaluatedTable + " SET value = ((NEW.value) * (value / OLD.value)) WHERE NEW.id = " + evaluatedTable + ".expenseid; \
                SET @disabled_evaluate_data_direct_update = NULL; \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + incomeTable + " ( \
        `id` INT NOT NULL AUTO_INCREMENT, \
        `name` VARCHAR(30) NOT NULL, \
        `estimateid` INT NOT NULL, \
        `evaluate` INT NOT NULL, \
        `startDate` DATE NOT NULL, \
        `endDate` DATE NOT NULL, \
        `comment` VARCHAR(100) NULL, \
        `value` INT NOT NULL, \
        PRIMARY KEY(`id`), \
        UNIQUE INDEX `income_UNIQUE` (`estimateid`,`name`), \
        FOREIGN KEY(`estimateid`) REFERENCES " + estimateTable + "(id) ON DELETE CASCADE \
        ); ", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TABLE " + evaluateInTable + " ( \
        `incomeid` INT NOT NULL, \
        `date` DATE NOT NULL, \
        `value` INT NOT NULL, \
        PRIMARY KEY(`incomeid`,`date`), \
        FOREIGN KEY(`incomeid`) REFERENCES " + incomeTable + "(id) ON DELETE CASCADE \
        ); ", (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER evaluate_in_data_direct_update BEFORE UPDATE ON " + evaluateInTable + " \
             FOR EACH ROW \
             BEGIN \
                IF (@disabled_evaluate_in_data_direct_update IS NULL) THEN \
                    IF(NEW.value IS NOT NULL) THEN \
                        SIGNAL SQLSTATE '42000' SET MESSAGE_TEXT = 'No direct update allowed'; \
                    END IF; \
                    SET NEW.value = ((SELECT value FROM " + incomeTable + " WHERE id = NEW.incomeid) + OLD.value); \
                END IF; \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER evaluate_in_data_direct_insert BEFORE INSERT ON " + evaluateInTable + " \
             FOR EACH ROW \
             BEGIN \
                SET NEW.value = (SELECT value FROM " + incomeTable + " WHERE id = NEW.incomeid); \
             END;" , (error) => { if (error) console.log(error); }
    );

    database.query("CREATE TRIGGER evaluate_in_data_update AFTER UPDATE ON " + incomeTable + " \
             FOR EACH ROW \
             BEGIN \
                SET @disabled_evaluate_in_data_direct_update = 1; \
                    UPDATE " + evaluateInTable + " SET value = ((NEW.value) * (value / OLD.value)) WHERE NEW.id = " + evaluateInTable + ".incomeid; \
                SET @disabled_evaluate_in_data_direct_update = NULL; \
             END;" , (error) => { if (error) console.log(error); }
    );

    createDefaultCategories(database, () => {
        
        addDummyUser(callback);
        console.log("update done");

        //setTimeout(() => callback(), 0);
    });
}

function sendEstimate(database, userid, token,estimateid, toEmail, callback) {

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        getUseridFromEmail(database, toEmail, (answer) => {

            if (answer.state != dbConsts.OPERATION_SUCCESS) {
                setTimeout(() => callback({ state: answer.state, msg: "Neuspijesno pronalazenje korisnika", data: null }), 0);
                return;
            }
            database.query("SELECT userid FROM " + userTable + " JOIN " + estimateTable + " ON " + userTable + ".id = userid WHERE userid = ? and " + estimateTable + ".id = ?", [userid, estimateid], (error, result) => {

                if (error) {
                    setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED, msg: "Neuspijesno slanje", data: null }));
                    return;
                }

                if (result.length == 0) {
                    setTimeout(() => callback({ state: dbConsts.OPERATION_DENIED, msg: "Nemate prava pristupa tom troskovniku", data: null }));
                    return;
                }

                database.query("INSERT INTO " + sentTable + " (userid,estimateid) VALUES (?,?)", [answer.id, estimateid], (error) => {

                    if (error) {
                        setTimeout(() => callback({ state: dbConsts.OPERATION_FAILED, msg: "Neuspijesno slanje ili vec poslano", data: null }));
                        return;
                    }

                    setTimeout(() => callback({ state: dbConsts.OPERATION_SUCCESS, msg: "operation success", data: null }));
                });
            });
        });
    });
}

function createEstimate(database, userid, token, name,callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        db.query('INSERT INTO ' + estimateTable + '(userid,name) VALUES (?,?)', [userid, name], (error) => {

            if (error) {

                data.state = dbConsts.OPERATION_FAILED;
                data.msg   = "Neuspijesno stvaranje troskovnika"; //"Failed to create cost estimate";

                setTimeout(() => callback(data), 0);
                return;
            }

            data.state = dbConsts.OPERATION_SUCCESS;
            data.msg   = "operation success";

            db.query('SELECT id AS estimateid FROM ' + estimateTable + ' WHERE userid = ? and name = ?', [userid, name], (error, result) => {

                if (error) { //shouldn't happen
                    console.log(error);
                }

                data.data = toJSON(result)[0];
                setTimeout(() => callback(data), 0);
            });
        });
    });
}

function login(database, email, password, callback) {

    let data = {
        msg: "",
        state: null,
        data: null
    };

    database.query('SELECT id,username,email FROM ' + userTable + ' WHERE email = ? and passwordHash = ?', [email, seededSha256(email, password)], (error, result) => {

        if ((error) || (result.length == 0)) {

            data.state = dbConsts.OPERATION_FAILED;
            data.msg   = "Neispravni podaci za prijavu"; //"Invalid login data";

            setTimeout(() => callback(data), 0);
            return;
        }

        data.data = toJSON(result)[0];

        newSession(database, data.data.id, (result) => {

            if (result.state != dbConsts.OPERATION_SUCCESS) {

                data.state = dbConsts.OPERATION_WARRNING;
                data.msg   = "Neuspijesno uspostavljanje sijednice za korisnika"; //"User found but failed to create session";
                setTimeout(() => callback(data));

                return;
            }

            data.state = dbConsts.OPERATION_SUCCESS;
            data.msg   = "operation success";

            data.data.token = result.token;
            setTimeout(() => callback(data), 0);
        });
    });
}

function createCategory(database, userid, token, estimateid, name, parentid, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT id FROM ' + estimateTable + ' WHERE id = ? and userid = ?', [estimateid, userid], (error, result) => {

            if (error) {

                data.state = dbConsts.OPERATION_FAILED;
                data.msg   = "Neuspijesno stvaranje kategorije troska (1)"; //"faild to create category";
                setTimeout(() => callback(data), 0);
                return;
            }

            if (result.length == 0) {
                data.state = dbConsts.OPERATION_DENIED;
                data.msg   = "Nemate parava za mijenjanje tog troskovnika"; //"You have no right to make changes to this estimate";
                setTimeout(() => callback(data), 0);
                return;
            }

            database.query('INSERT INTO ' + categoryTable + '(estimateid,name,parentid) VALUES (?,?,?)', [estimateid, name,parentid], (error) => {

                if (error) {

                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesno stvaranje kategorije troska"; //"faild to create category";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                data.state = dbConsts.OPERATION_SUCCESS;
                data.msg   = "operation success";

                database.query('SELECT id AS categoryid FROM ' + categoryTable + ' WHERE estimateid = ? and name = ?', [estimateid, name], (error,result) => {

                    if (error) { //shouldn't happen
                        console.log(error);
                    }

                    data.data = toJSON(result)[0];
                    setTimeout(() => callback(data), 0);
                });
            });
        });
    });
}

function updateCategory(database, userid, token, categoryid, name, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT ' + categoryTable + '.id FROM ' + categoryTable + ' JOIN ' + estimateTable + ' ON estimateid = ' + estimateTable + '.id \
                        WHERE '  + categoryTable + '.id = ? and userid = ?', [categoryid, userid], (error, result) => {

            if (error) {

                data.state = dbConsts.OPERATION_FAILED;
                data.msg   = "Neuspijesna promijena kategorije troska (1)";
                setTimeout(() => callback(data), 0);
                return;
            }

            if (result.length == 0) {
                data.state = dbConsts.OPERATION_DENIED;
                data.msg   = "Nemate parava za mijenjanje te kategorije troska";
                setTimeout(() => callback(data), 0);
                return;
            }

            database.query('UPDATE ' + categoryTable + ' SET name = ? WHERE id = ?', [name,categoryid], (error) => {

                if (error) {

                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesna promijena kategorije troska";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                data.state = dbConsts.OPERATION_SUCCESS;
                data.msg   = "operation success";
                setTimeout(() => callback(data), 0);
            });
        });
    });
}

function deleteCategory(database, userid, token, categoryid, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT ' + categoryTable + '.id FROM ' + categoryTable + ' JOIN ' + estimateTable + ' ON estimateid = ' + estimateTable + '.id \
                        WHERE '  + categoryTable + '.id = ? and userid = ?', [categoryid, userid], (error, result) => {

            if (error) {

                data.state = dbConsts.OPERATION_FAILED;
                data.msg   = "Neuspijesno brisanje kategorije troska (1)"; //"faild to delete category (1)";
                setTimeout(() => callback(data), 0);
                return;
            }

            if (result.length == 0) {
                data.state = dbConsts.OPERATION_DENIED;
                data.msg   = "Nemate prava za mijenjanje te kategorije troska"; //"You have no right to make changes to this category";
                setTimeout(() => callback(data), 0);
                return;
            }

            database.query('DELETE FROM ' + categoryTable + ' WHERE id = ?', [categoryid], (error) => {

                if (error) {

                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesno brisanje kategorje troskova"; //"faild to delete category (2)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                data.state = dbConsts.OPERATION_SUCCESS;
                data.msg   = "operation success";
                setTimeout(() => callback(data), 0);           
            });
        });
    });
}

function getCategories(database, userid, token, estimateid, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT id FROM ' + estimateTable + ' WHERE (id = ? and userid = ?) or id IN (SELECT estimateid FROM ' + sentTable +' WHERE estimateid = ? and userid = ?)',
            [estimateid, userid, estimateid, userid], (error, result) => {

                if (error) {

                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesnost pronalazenja kategorija (1)" ; //"faild to find category (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Nemate prava pristupa tom troskovniku"; //"You have no right to view this categories";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('SELECT id AS categoryid,name,parentid FROM ' + categoryTable + ' WHERE (estimateid IS NULL) or estimateid = ?', [estimateid], (error, result) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg   = "Neuspijesno pronalazenje kategorija"; //"faild to find category (2)";
                        setTimeout(() => callback(data), 0);
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg   = "operation success";
                    data.data  = toJSON(result);

                    setTimeout(() => callback(data), 0);
                });
            });
    });
}

function evaluateIncome(database, incomeid, startDate, endDate, evaluate, callback) {

    database.query('SELECT DATEDIFF(?,?) AS result', [endDate, startDate], (error, result) => {

        if (error) { //shouldn't happen
            console.log(error);
        }

        if (evaluate == 1) {
            database.query('INSERT INTO ' + evaluateInTable + '(incomeid,date) VALUES (?,?)', [incomeid, startDate], (error) => {
                if (error) { //shouldn't happen
                    console.log(error);
                }

                setTimeout(() => callback(), 0);
            });
            return;
        }   

        let step = (((toJSON(result)[0].result) * 1.0) / (evaluate - 1));
        let wait = evaluate;

        for (let counter = 0; counter < evaluate; counter++) {

            database.query('INSERT INTO ' + evaluateInTable + '(incomeid,date) VALUES (?,DATE_ADD(?, INTERVAL ? DAY))', [incomeid, startDate, Math.floor(step * counter)], (error) => {

                if (error) {

                    database.query('UPDATE ' + evaluateInTable + ' SET value = NULL WHERE date = DATE_ADD(?, INTERVAL ? DAY) and incomeid = ?', [startDate, Math.floor(step * counter), incomeid], (error) => {

                        if (error) { //shouldn't happen
                            console.log(error);
                        }

                        wait--;
                        if (wait == 0) setTimeout(() => callback(), 0);
                    });

                    return;
                }

                wait--;
                if (wait == 0) setTimeout(() => callback(), 0);
            });
        }
    });
}

function evaluateExpense(database, expenseid, startDate, endDate, evaluate, callback) {

    database.query('SELECT DATEDIFF(?,?) AS result', [endDate, startDate], (error, result) => {

        if (error) { //shouldn't happen
            console.log(error);
        }

        if (evaluate == 1) {
            database.query('INSERT INTO ' + evaluatedTable + '(expenseid,date) VALUES (?,?)', [expenseid, startDate], (error) => {
                if (error) { //shouldn't happen
                    console.log(error);
                }
            });
            return;
        }

        let step = (((toJSON(result)[0].result) * 1.0) / (evaluate - 1));
        let wait = evaluate;

        for (let counter = 0; counter < evaluate; counter++) {

            database.query('INSERT INTO ' + evaluatedTable + '(expenseid,date) VALUES (?,DATE_ADD(?, INTERVAL ? DAY))', [expenseid, startDate, Math.floor(step * counter)], (error) => {

                if (error) { 

                    database.query('UPDATE ' + evaluatedTable + ' SET value = NULL WHERE date = DATE_ADD(?, INTERVAL ? DAY) and expenseid = ?', [startDate, Math.floor(step * counter), expenseid], (error) => {

                        if (error) { //shouldn't happen
                            console.log(error);
                        }

                        wait--;
                        if (wait == 0) setTimeout(() => callback(), 0);
                    });

                    return;
                }

                wait--;
                if (wait == 0) setTimeout(() => callback(), 0);
            });
        }
    });
} 

function createIncome(database, userid, token, estimateid, startDate, endDate, evaluate, value, name, comment, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT id FROM ' + estimateTable + ' WHERE userid = ? and id = ?', [userid, estimateid], (error, result) => {

            if (error) {
                data.state = dbConsts.OPERATION_FAILED;
                data.msg = "Neuspijesno stvaranje prihoda (1)";
                setTimeout(() => callback(data), 0);
                return;
            }

            if (result.length == 0) {
                data.state = dbConsts.OPERATION_DENIED;
                data.msg = "Nemate prava na modifikaciju tog troskovnika"; 
                setTimeout(() => callback(data), 0);
                return;
            }

            database.query('INSERT INTO ' + incomeTable + '(estimateid, startDate, endDate, evaluate, value, name, comment) VALUES (?,?,?,?,?,?,?)',
                [estimateid, startDate, endDate, evaluate, value, name, comment], (error) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg = "Neuspijesno stvaranje prihoda";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg   = "operation success";

                    database.query('SELECT id AS incomeid FROM ' + incomeTable + ' WHERE name = ? and estimateid = ?', [name, estimateid], (error, result) => {

                        if (error) { //shouldn't happen
                            console.log(error);
                        }

                        data.data = toJSON(result)[0];
                        evaluateIncome(database, data.data.incomeid, startDate, endDate, evaluate, () => callback(data));
                    });
                });
        });
    });

}

function createExpense(database, userid, token, estimateid, categoryid, startDate, endDate, evaluate, value, name, comment, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT ' + categoryTable + '.id FROM ' + categoryTable + ' JOIN ' + estimateTable + ' ON (estimateid = ' + estimateTable + '.id OR estimateid IS NULL)'
            + ' WHERE userid = ? and ' + categoryTable + '.id = ? ', [userid, categoryid], (error, result) => {

                if (error) {

                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesno stvaranje stavke troska (1)"; //"faild to create expense (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Nemate prava na koristenje te kategorije troska"; //"You have no right to use this category";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('INSERT INTO ' + expenseTable + '(estimateid, categoryid, startDate, endDate, evaluate, value, name, comment) VALUES (?,?,?,?,?,?,?,?)',
                    [estimateid, categoryid, startDate, endDate, evaluate, value, name, comment], (error) => { 

                        if (error) {
                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg   = "Neuspijesno stvaranje stavke troskovnika"; // "faild to create expense (2)";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg = "operation success";
                        
                        database.query('SELECT id AS expenseid FROM ' + expenseTable + ' WHERE name = ? and estimateid = ?', [name, estimateid], (error, result) => {

                            if (error) { //shouldn't happen
                                console.log(error);
                            }

                            data.data = toJSON(result)[0];
                            evaluateExpense(database, data.data.expenseid, startDate, endDate, evaluate, () => callback(data));
                            //setTimeout(() => callback(data), 0);
                        });
                    });
            });
    });
}

function deleteIncome(database, userid, token, incomeid, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT ' + incomeTable + '.id FROM ' + incomeTable + ' JOIN ' + estimateTable + ' ON estimateid = ' + estimateTable + '.id ' +
            'WHERE userid = ? and ' + incomeTable + '.id = ?', [userid, incomeid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg = "Neuspijesno brisanje prihoda (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg = "Nemate parava promijene tog prihoda";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('DELETE FROM ' + incomeTable + ' WHERE id = ?', [incomeid], (error) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg = "Neuspijesno brisanje prihoda";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg = "operation success";
                    setTimeout(() => callback(data), 0);
                });
            });
    });

}

function deleteExpenes(database, userid, token, expenseid, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT ' + expenseTable + '.id FROM ' + expenseTable + ' JOIN ' + estimateTable + ' ON estimateid = ' + estimateTable + '.id ' +
            'WHERE userid = ? and ' + expenseTable + '.id = ?', [userid, expenseid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesno brisanje stavke troska (1)" ; //"faild to delete expense (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Nemate parava promijene stavke troskovnika"; //"You have no right to delete this expense";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('DELETE FROM ' + expenseTable + ' WHERE id = ?', [expenseid], (error) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg   = "Neuspijesno brisanje stavke troska"; //"faild to delete expense (2)";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg = "operation success";
                    setTimeout(() => callback(data), 0);
                });
            });
    });
}
function updateIncome(database, userid, token, incomeid, name, value, comment, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT ' + incomeTable + '.id FROM ' + incomeTable + ' JOIN ' + estimateTable + ' ON estimateid = ' + estimateTable + '.id ' +
            'WHERE userid = ? and ' + incomeTable + '.id = ?', [userid, incomeid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg = "Neuspijesna promijena stavke troska (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg = "Nemate parava promijene prihoda";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('UPDATE ' + incomeTable + ' SET name = ?, value = ?, comment = ? WHERE id = ?', [name, value, comment, incomeid], (error) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg = "Neuspijesna promijena prihoda";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg = "operation success";
                    setTimeout(() => callback(data), 0);
                });
            });
    });

}


function updateExpense(database, userid, token, expenseid, name, value, comment, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT ' + expenseTable + '.id FROM ' + expenseTable + ' JOIN ' + estimateTable + ' ON estimateid = ' + estimateTable + '.id ' +
            'WHERE userid = ? and ' + expenseTable + '.id = ?', [userid, expenseid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesna promijena stavke troska (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Nemate parava promijene stavke troskovnika";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('UPDATE ' + expenseTable + ' SET name = ?, value = ?, comment = ? WHERE id = ?', [name, value, comment, expenseid], (error) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg   = "Neuspijesna promijena stavke troska";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg   = "operation success";
                    setTimeout(() => callback(data), 0);
                });
            });
    });
}

function getIncome(database, userid, token, estimateid, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT id FROM ' + estimateTable + ' WHERE (id = ? and userid = ?) or id IN (SELECT estimateid FROM ' + sentTable + ' WHERE estimateid = ? and userid = ?)',
            [estimateid, userid, estimateid, userid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg = "Neuspijesni dohvat prihoda (1)"; 
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg = "Nemate prava pristupa tom troskovniku";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('SELECT id, name AS label, startDate AS fromDate, endDate AS toDate, value AS price, evaluate, comment FROM ' + incomeTable + ' WHERE estimateid = ?', [estimateid], (error, result) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg = "Neuspijesni dohvat prihoda";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg = "operation success";
                    data.data = toJSON(result);

                    let size = data.data.length;

                    for (let counter = 0; counter < size; counter++) {
                        data.data[counter].fromDate = formatDate(data.data[counter].fromDate);
                        data.data[counter].toDate = formatDate(data.data[counter].toDate);
                    }

                    setTimeout(() => callback(data), 0);
                });
            });
    });
}

function getExpense(database, userid, token, estimateid, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT id FROM ' + estimateTable + ' WHERE (id = ? and userid = ?) or id IN (SELECT estimateid FROM ' + sentTable + ' WHERE estimateid = ? and userid = ?)',
            [estimateid, userid, estimateid, userid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesni dohvat stavki troskova (1)"; //"faild to get expenses (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Nemate prava pristupa tom troskovniku"; //"You have no right to access this estimate";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query('SELECT id, categoryid, name AS label, startDate AS fromDate, endDate AS toDate, value AS price, evaluate, comment FROM ' + expenseTable + ' WHERE estimateid = ?', [estimateid], (error, result) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg   = "Neuspijesni dohvat stavki troskova"; //"faild to get expenses (2)";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg   = "operation success";
                    data.data  = toJSON(result);

                    let size = data.data.length;

                    for (let counter = 0; counter < size; counter++) {
                        data.data[counter].fromDate = formatDate(data.data[counter].fromDate);
                        data.data[counter].toDate   = formatDate(data.data[counter].toDate);
                    }

                    setTimeout(() => callback(data), 0);
                });
            });
    });
}

function getInEvaluated(database, userid, token, estimateid, startDate, endDate, monthRange, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT id FROM ' + estimateTable + ' WHERE (id = ? and userid = ?) or id IN (SELECT estimateid FROM ' + sentTable + ' WHERE estimateid = ? and userid = ?)',
            [estimateid, userid, estimateid, userid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg = "Neuspijesni dohvat proracunatih prihoda(1)"; 
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg = "Nemate prava pristupa tom troskovniku";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query("SELECT name, SUM(" + evaluateInTable + ".value) AS valueSum, \
                    FLOOR(PERIOD_DIFF(CONCAT(YEAR(date), LPAD(MONTH(date),2,'0')),CONCAT(YEAR(?), LPAD(MONTH(?),2,'0'))) / ?) AS monthValue \
                    FROM " + evaluateInTable + " JOIN " + incomeTable + " ON " + evaluateInTable + ".incomeid = " + incomeTable + ".id \
                    WHERE " + incomeTable + ".estimateid = ? and date >= ? and date <= ? \
                    GROUP BY  name,monthValue \
                    ORDER BY  name,monthValue", [startDate, startDate, monthRange, estimateid, startDate, endDate], (error, result) => {

                        if (error) {

                            console.log(error);

                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg = "Neuspijesni dohvat proracunatih prihoda";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg = "operation success";
                        data.data = toJSON(result);

                        setTimeout(() => callback(data), 0);
                    });
            });
    });
}

function getEvaluated(database, userid, token, estimateid, startDate, endDate, monthRange, callback) {

    let data = {
        state: null,
        msg: "",
        data: null
    };

    isValidSessionInfo(database, userid, token, (answer) => {

        if (answer.state != dbConsts.OPERATION_SUCCESS) {
            setTimeout(() => callback(answer), 0);
            return;
        }

        database.query('SELECT id FROM ' + estimateTable + ' WHERE (id = ? and userid = ?) or id IN (SELECT estimateid FROM ' + sentTable + ' WHERE estimateid = ? and userid = ?)',
            [estimateid, userid, estimateid, userid], (error, result) => {

                if (error) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neuspijesni dohvat proracunatih troskova (1)"; //"faild to get evaluated expenes (1)";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                if (result.length == 0) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Nemate prava pristupa tom troskovniku"; //"You have no right to access this estimate";
                    setTimeout(() => callback(data), 0);
                    return;
                }

                database.query("SELECT " + categoryTable + ".id AS categoryid,parentid," + categoryTable + ".name, SUM(" + evaluatedTable + ".value) AS valueSum, \
                    FLOOR(PERIOD_DIFF(CONCAT(YEAR(date), LPAD(MONTH(date),2,'0')),CONCAT(YEAR(?), LPAD(MONTH(?),2,'0'))) / ?) AS monthValue \
                    FROM " + evaluatedTable + " JOIN " + expenseTable + " ON " + evaluatedTable + ".expenseid = " + expenseTable + ".id \
                    JOIN " + categoryTable + " ON " + expenseTable + ".categoryid = " + categoryTable + ".id \
                    WHERE " + expenseTable + ".estimateid = ? and date >= ? and date <= ? \
                    GROUP BY " + categoryTable + ".id, parentid, " + categoryTable + ".name, monthValue \
                    ORDER BY " + categoryTable + ".id, monthValue", [startDate, startDate, monthRange, estimateid, startDate, endDate],
                    (error, result) => {

                        if (error) {

                            console.log(error);

                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg   = "Neuspijesni dohvat proracunatih troskova"; //"faild to get evaluated expenes (2)";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg   = "operation success";
                        data.data  = toJSON(result);

                        setTimeout(() => callback(data), 0);
                    });          
            });
    });
}

var db          = mysql.createConnection(config);
var readyForUse = false;

class DatabaseManager {

    constructor() {

        db.connect((error) => {

            let errorState = -1;
            let errorMSG = "";

            if (!error) {
                errorState = dbConsts.OPERATION_SUCCESS;
                errorMSG = 'connection to database achieved';
            } else {
                errorState = dbConsts.OPERATION_FAILED;
                errorMSG = 'failed to connect to database';
            }

            console.log(errorMSG);

            if (errorState == dbConsts.OPERATION_SUCCESS) {

                db.query("SELECT * FROM " + versionTable, (error, result) => {

                    let oldDatabaseVersion = NO_OLD_DATABASE;

                    if (!error) { // if there is an error database was not created yet 

                        if (result.length != 1) { //if 0 results or more then 1 database is probaby corrupted
                            db.query("DROP DATABASE " + databaseName, (error) => { }); // just delete corrupted databese
                        } else {
                            oldDatabaseVersion = result[0].version;
                        }
                    }

                    console.log("currDatabaseVersion: " + oldDatabaseVersion);
                    console.log("newestDatabaseVersion: " + DATABASE_VERSION);

                    initDatabase(db, oldDatabaseVersion, () => {
                        readyForUse = true;
                    });

                });

                return;
            }       
        });
    }

    isReady() {
        return readyForUse;
    }

    //getRequest(requestData, callback) {
    //
    //    let requestsNeeded = [];
    //    let resultsMSG     = [];
    //    let resultsState   = [];
    //    let results        = [];
    //
    //    let currPos    = 0;
    //    let length     = 0;
    //    let doneLength = 0;
    //
    //    let needsCallback = true;
    //
    //    Object.keys(getRequests).forEach((key) => { // get requested operations
    //
    //        let value = getRequests[key];
    //
    //        if ((requestData.id & value) == value) {
    //
    //            requestsNeeded[currPos] = value;
    //
    //            resultsMSG[currPos]   = "";
    //            resultsState[currPos] = -1;
    //            results[currPos]      = null;
    //
    //            currPos++;
    //        }
    //    });
    //
    //    length = currPos;
    //
    //    if (length == 0) {
    //        callback({length: length, states: resultsState, msges: resultsMSG, results: results });
    //        return;
    //    }
    //
    //    for (currPos = 0; currPos < length; currPos++) {
    //
    //        switch (requestsNeeded[currPos]) {
    //
    //            case getRequests.DATABASE_VERSION: {
    //
    //                db.query("SELECT version FROM " + versionTable, (error, result) => {
    //
    //                    let pos = requestsNeeded.indexOf(getRequests.DATABASE_VERSION);
    //
    //                    if (!error) {
    //                        results[pos]      = toJSON(result)[0]; // convert result (RowDataPacket) to JSON object;
    //                        resultsMSG[pos]   = "data resived";
    //                        resultsState[pos] = dbConsts.OPERATION_SUCCESS;
    //                    } else {
    //                        resultsMSG[pos]   = "data failed to be recived";
    //                        resultsState[pos] = dbConsts.OPERATION_FAILED;
    //                    }
    //
    //                    doneLength++;
    //
    //                    if ((doneLength == length) && needsCallback) { // tring to sync the multiple querys
    //                        needsCallback = false;
    //                        callback({ length: length, states: resultsState, msges: resultsMSG, results: results });
    //                    }
    //                });
    //                break;
    //            }
    //        }
    //    }
    //}

    getSingleRequest(requestData, callback) {

        let data = {
            state: null,
            msg: "",
            data: null
        };

        switch (requestData.id) {

            case getRequests.DATABASE_VERSION: {

                db.query("SELECT version FROM " + versionTable, (error, result) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg = "failed to get database version";
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg = "operation success";
                    data.data = toJSON(result)[0];

                    setTimeout(() => callback(data), 0);
                });
                break;
            }
            case getRequests.GET_COST_ESTIMATE: {

                //console.log(requestData.data);

                isValidSessionInfo(db, requestData.data.userid, requestData.data.token, (answer) => {

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        setTimeout(() => callback(answer), 0);
                        return;
                    }

                    db.query('SELECT id AS estimateid, name FROM ' + estimateTable + " WHERE userid = ?", [requestData.data.userid], (error, result) => {

                        if (error) {
                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg   = "Neuspijesni dohvat troskovnika"; //"failed to get database version";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg = "operation success";
                        data.data = toJSON(result);

                        setTimeout(() => callback(data), 0);
                    });
                });
                break;
            }
            case getRequests.GET_CATEGORY: {
                getCategories(db, requestData.data.userid, requestData.data.token, requestData.data.estimateid, callback);
                break;
            }
            case getRequests.GET_EXPENSE: {
                getExpense(db, requestData.data.userid, requestData.data.token, requestData.data.estimateid, callback);
                break;
            }
            case getRequests.GET_EVALUATED_EXPENSE: {

                db.query('SELECT DATEDIFF(?,?) AS diff', [requestData.data.endDate, requestData.data.startDate], (error, result) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg = "Neispravni format datuma"; //"inavlid date input";
                        setTimeout(() => callback(data));
                        return;
                    }

                    let temp = toJSON(result)[0].diff;

                    if (temp < 0) {
                        data.state = dbConsts.OPERATION_DENIED;
                        data.msg = "Pocetni datum je veci od krajnjeg"; //"startDate is bigger then endDate";
                        setTimeout(() => callback(data));
                        return;
                    }

                    getEvaluated(db, requestData.data.userid, requestData.data.token, requestData.data.estimateid, requestData.data.startDate, requestData.data.endDate, requestData.data.monthRange, callback);
                });

                break;
            }
            case getRequests.GET_PROFILE: {
                getProfile(db, requestData.data.userid, requestData.data.token, callback);
                break;
            }
            case getRequests.GET_RECEIVED_ESTIMATES: {

                isValidSessionInfo(db, requestData.data.userid, requestData.data.token, (answer) => {

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        setTimeout(() => callback(answer), 0);
                        return;
                    }

                    db.query('SELECT id AS estimateid, name FROM ' + estimateTable + ' WHERE id IN (SELECT estimateid FROM ' + sentTable + ' WHERE userid = ?)', [requestData.data.userid], (error, result) => {

                        if (error) {
                            console.log(error);
                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg = "Neuspijesni dohvat troskovnika"; //"failed to get database version";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg   = "operation success";
                        data.data  = toJSON(result);

                        setTimeout(() => callback(data), 0);
                    });
                });
                break;
            }
            case getRequests.GET_INCOME: {
                getIncome(db, requestData.data.userid, requestData.data.token, requestData.data.estimateid, callback);
                break;
            }
            case getRequests.GET_EVALUATED_INCOME: {
                getInEvaluated(db, requestData.data.userid, requestData.data.token, requestData.data.estimateid, requestData.data.startDate, requestData.data.endDate, requestData.data.monthRange, callback);
                break;
            }
            case getRequests.GET_EMAILS: {

                isValidSessionInfo(db, requestData.data.userid, requestData.data.token, (answer) => {

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        setTimeout(() => callback(answer), 0);
                        return;
                    }

                    db.query('SELECT DISTINCT(email) FROM ' + userTable + ' JOIN ' + sentTable + ' ON userid = ' + userTable + '.id \
                        WHERE estimateid IN(SELECT id FROM ' + estimateTable + ' WHERE userid = ?)', [requestData.data.userid], (error, result) => {

                        if (error) {
                            console.log(error);
                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg = "Neuspijesni dohvat troskovnika"; //"failed to get database version";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg   = "operation success";
                        data.data  = toJSON(result);

                        setTimeout(() => callback(data), 0);
                    });
                });
                break;
            }
            case getRequests.VALIDATE_TOKEN: {

                isValidSessionInfo(db, requestData.data.userid, requestData.data.token, (answer) => {

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg   = "operation success";

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        data.data = { valid: false };
                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.data = { valid: true };
                    setTimeout(() => callback(data), 0);
                });
                break;
            }
        }
    }

    deleteRequest(deleteData, callback) {

        let data = {
            msg: "",
            state: -1,
            data: null
        };

        switch (deleteData.id) {

            case deleteRequests.DELETE_COST_ESTIMATE: {

                isValidSessionInfo(db, deleteData.data.userid, deleteData.data.token, (answer) => {

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        setTimeout(() => callback(answer), 0);
                        return;
                    }

                    db.query('DELETE FROM ' + estimateTable + ' WHERE id = ? and userid = ?', [deleteData.data.estimateid, deleteData.data.userid], (error, result) => {

                        if (error) {
                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg   = "Neuspijesno brisanje troskovnika" ; //"failed to delete cost estimate";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        if (result.affectedRows == 0) {
                            data.state = dbConsts.OPERATION_DENIED;
                            data.msg   = "Nemate prava za brisanje tog troskovnika"; //"failed to delete cost estimate";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg   = "operation success";

                        setTimeout(() => callback(data), 0);
                    });
                });
                break;
            }
            case deleteRequests.DELETE_CATEGORY: {
                deleteCategory(db, deleteData.data.userid, deleteData.data.token, deleteData.data.categoryid, callback);
                break;
            }
            case deleteRequests.DELETE_EXPENSE: {
                deleteExpenes(db, deleteData.data.userid, deleteData.data.token, deleteData.data.expenseid, callback);
                break;
            }
            case deleteRequests.DELETE_INCOME: {
                deleteIncome(db, deleteData.data.userid, deleteData.data.token, deleteData.data.incomeid, callback);
                break;
            }
        }
    }

    updateRequest(updateData, callback) {

        let data = {
            msg: "",
            state: -1,
            data: null
        };

        switch (updateData.id) {

            case updateRequests.UPDATE_COST_ESTIMATE: {

                isValidSessionInfo(db, updateData.data.userid, updateData.data.token, (answer) => {

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        setTimeout(() => callback(answer), 0);
                        return;
                    }

                    db.query('UPDATE ' + estimateTable + ' SET name = ? WHERE id = ? and userid = ?', [updateData.data.name, updateData.data.estimateid, updateData.data.userid], (error, result) => {

                        if (error) {
                            data.state = dbConsts.OPERATION_FAILED;
                            data.msg = "Neuspijesna promijena troskovnika"; //"failed to delete cost estimate";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        //console.log(result);

                        if (result.affectedRows == 0) {
                            data.state = dbConsts.OPERATION_DENIED;
                            data.msg = "Nemate prava za promijenu tog troskovnika"; //"failed to delete cost estimate";
                            setTimeout(() => callback(data), 0);
                            return;
                        }

                        data.state = dbConsts.OPERATION_SUCCESS;
                        data.msg = "operation success";

                        setTimeout(() => callback(data), 0);
                    });
                });

                break;
            }
            case updateRequests.UPDATE_CATEGORY: {
                updateCategory(db, updateData.data.userid, updateData.data.token, updateData.data.categoryid, updateData.data.name, callback);
                break;
            }
            case updateRequests.UPDATE_EXPENSE: {
                updateExpense(db, updateData.data.userid, updateData.data.token, updateData.data.expenseid, updateData.data.name, updateData.data.value, updateData.data.comment, callback);
                break;
            }
            case updateRequests.UPDATE_PROFILE: {

                if ((!updateData.data.name) && (!updateData.data.lastname) && (!updateData.data.oib) && (!updateData.data.homeAddress) && (!updateData.data.phoneNumber)) {
                    deleteProfile(db, updateData.data.userid, updateData.data.token, callback);
                    break;
                }

                updateProfile(db, updateData.data.userid, updateData.data.token, updateData.data.name, updateData.data.lastname, updateData.data.oib, updateData.data.homeAddress, updateData.data.phoneNumber, callback);
                break;
            }
            case updateRequests.UPDATE_INCOME: {
                updateIncome(db, updateData.data.userid, updateData.data.token, updateData.data.incomeid, updateData.data.name, updateData.data.value, updateData.data.comment, callback);
                break;
            }
        }
    }

    sendRequest(sentData,callback) {

        let data = {
            msg  : "",
            state: -1,
            data : null
        };

        switch (sentData.id) {

            case sendRequests.CREATE_NEW_USER: {
                createUser(db, sentData.data.username, sentData.data.email, sentData.data.password, callback);
                break;
            }
            case sendRequests.LOGIN_REQUEST: {

                if (sentData.data.email != null) {
                    login(db, sentData.data.email, sentData.data.password, callback);
                    break;
                } 

                getEmailFromUsername(db, sentData.data.username, (answer) => {

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        
                        data.state = answer.state;
                        data.msg   = "Neispravni podaci za prijavu";

                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    login(db, answer.email, sentData.data.password, callback);
                });
                break;
            }
            case sendRequests.TERMINATE_SESSION: {

                db.query('DELETE FROM ' + sessionTable + ' WHERE userid = ? and sessionToken = ?', [sentData.data.userid, sentData.data.token], (error, result) => {

                    if ((error) || (result.affectedRows == 0)) {

                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg   = "Neuspijesni prekid sijednice"; //"Failed to terminate session";

                        setTimeout(() => callback(data), 0);
                        return;
                    }

                    data.state = dbConsts.OPERATION_SUCCESS;
                    data.msg   = "operation success";

                    setTimeout(() => callback(data), 0);
                });
                break;
            }
            case sendRequests.CREATE_COST_ESTIMATE: {
                createEstimate(db, sentData.data.userid, sentData.data.token, sentData.data.name,callback);
                break;
            }
            case sendRequests.CREATE_CATEGORY: {

                if (!sentData.data.estimateid) {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Stvaranje default kategorije nije dozvoljeno"; //"creating a default category is not allowed";
                    setTimeout(() => callback(data));
                    break;
                }

                if (sentData.data.estimateid.toString().toLowerCase() == 'null') {
                    data.state = dbConsts.OPERATION_DENIED;
                    data.msg   = "Stvaranje default kategorije nije dozvoljeno"; //"creating a default category is not allowed";
                    setTimeout(() => callback(data));
                    break;
                }

                createCategory(db, sentData.data.userid, sentData.data.token, sentData.data.estimateid, sentData.data.name, sentData.data.parentid, callback);
                break;
            }
            case sendRequests.CREATE_NEW_EXPENSE: {

                if (isNaN(sentData.data.evaluate)) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg = "Neispravna cijena ili broj ponavljanja";
                    setTimeout(() => callback(data));
                    return;
                }

                sentData.data.evaluate = Math.floor(sentData.data.evaluate);

                if (sentData.data.value <= 0 || sentData.data.evaluate <= 0) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neispravna cijena ili broj ponavljanja";
                    setTimeout(() => callback(data));
                    return;
                }

                db.query('SELECT DATEDIFF(?,?) AS diff', [sentData.data.endDate, sentData.data.startDate], (error, result) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg   = "Neispravni format datuma"; //"inavlid date input";
                        setTimeout(() => callback(data));
                        return;
                    }

                    let temp = toJSON(result)[0].diff; 

                    if (temp < 0) {
                        data.state = dbConsts.OPERATION_DENIED;
                        data.msg   = "Pocetni datum je veci od krajnjeg"; //"startDate is bigger then endDate";
                        setTimeout(() => callback(data));
                        return;
                    }

                    createExpense(db, sentData.data.userid, sentData.data.token, sentData.data.estimateid, sentData.data.categoryid, sentData.data.startDate, sentData.data.endDate,
                        sentData.data.evaluate, sentData.data.value, sentData.data.name, sentData.data.comment, callback);
                });

                break;
            }
            case sendRequests.SEND_ESTIMATE: {

                if (sentData.data.toEmail != null) {
                    sendEstimate(db, sentData.data.userid, sentData.data.token, sentData.data.estimateid, sentData.data.toEmail, callback);
                    break;
                }

                getEmailFromUsername(db, sentData.data.toUsername, (answer) => {

                    if (answer.state != dbConsts.OPERATION_SUCCESS) {
                        setTimeout(() => callback({ state: answer.state, msg: "Neuspijesno pronalazenje korisnika", data: null }), 0);
                        return;
                    }

                    sendEstimate(db, sentData.data.userid, sentData.data.token, sentData.data.estimateid, answer.email, callback);
                });

                break;
            }
            case sendRequests.CREATE_NEW_INCOME: {

                if (isNaN(sentData.data.evaluate)) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg = "Neispravna cijena ili broj ponavljanja";
                    setTimeout(() => callback(data));
                    return;
                }

                sentData.data.evaluate = Math.floor(sentData.data.evaluate);

                if (sentData.data.value <= 0 || sentData.data.evaluate <= 0) {
                    data.state = dbConsts.OPERATION_FAILED;
                    data.msg   = "Neispravna cijena ili broj ponavljanja";
                    setTimeout(() => callback(data));
                    return;
                }

                db.query('SELECT DATEDIFF(?,?) AS diff', [sentData.data.endDate, sentData.data.startDate], (error, result) => {

                    if (error) {
                        data.state = dbConsts.OPERATION_FAILED;
                        data.msg = "Neispravni format datuma"; //"inavlid date input";
                        setTimeout(() => callback(data));
                        return;
                    }

                    let temp = toJSON(result)[0].diff;

                    if (temp < 0) {
                        data.state = dbConsts.OPERATION_DENIED;
                        data.msg = "Pocetni datum je veci od krajnjeg"; //"startDate is bigger then endDate";
                        setTimeout(() => callback(data));
                        return;
                    }

                    createIncome(db, sentData.data.userid, sentData.data.token, sentData.data.estimateid, sentData.data.startDate, sentData.data.endDate,
                        sentData.data.evaluate, sentData.data.value, sentData.data.name, sentData.data.comment, callback);
                });

                break;
            }
        }
    }
}

//module.exports  = new DatabaseManager();

let databaseManager = new DatabaseManager();
module.exports = databaseManager;