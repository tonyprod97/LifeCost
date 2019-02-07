module.exports.port = 3000;
module.exports.newLineChar = '</br>';

// * -> optional data

module.exports.databaseErrors = {
    OPERATION_SUCCESS : 0, // all good
    OPERATION_FAILED  : 1, // failed to execute
    OPERATION_WARRNING: 2, // operation succeded but might couse problems
    OPERATION_DENIED  : 3  // operation might be dangoruse so it was blocked
};

module.exports.databaseGetRequests = {
    DATABASE_VERSION      : 1,  // get database version
    GET_COST_ESTIMATE     : 2,  // get cost estimate (needs in data field: userid,token) returns all cost estimates of a user ( in data[]: estimateid,name)
    GET_CATEGORY          : 3,  // get caregories from cost estimate (needs in data field: estimateid,userid,token) returns all categories from estimate (in data[]: name,categoryid)
    GET_EXPENSE           : 4,  // get all expanses in cost estimate (needs in data field: estimateid,userid,token) returns all expanses from estimate (in data[]: ...)
    GET_EVALUATED_EXPENSE : 5,  // get parsed dates by categories, needs same as GET_EXPANSE + (in data: startDate,endDate,monthRange)  
    GET_PROFILE           : 6,  // get profile data (needs in data field: userid, token)
    GET_RECEIVED_ESTIMATES: 7,  // get recived estimates (needs in data field: userid)
    GET_INCOME            : 8,  // get all income in cost estimate (needs in data field: estimateid,userid,token)
    GET_EVALUATED_INCOME  : 9,  // get parsed dates in income, needs same as GET_INCOME + (in data: startDate,endDate,monthRange)
    GET_EMAILS            : 10, // get emails of people you sent estimate (needs in data field: userid,token);
    VALIDATE_TOKEN        : 11  // returns data.valid (needs in data field: userid, token)
};

module.exports.databaseSendRequests = {
    CREATE_NEW_USER     : 1, // create new user  (needs in data field: username,email,password) 
    LOGIN_REQUEST       : 2, // login user (needs in data field: email | username, password)
    TERMINATE_SESSION   : 3, // logout user from session (needs in data field: userid,token)
    CREATE_COST_ESTIMATE: 4, // creates new cost estemate for user (needs in data field: name,userid,token) returns in data field id of created estimate (data: estimateid)
    CREATE_CATEGORY     : 5, // creates new category in cost estemate (needs in data field: estimateid,userid,token,parentid,name) returns in data filed id of created category(data: categoryid)
    CREATE_NEW_EXPENSE  : 6, // creates new expanse in selected cost estimate (needs in data field: estimateid,userid,token,name,startDate,endDate,categoryid,evaluate,value,comment*) returns in data field id of created expanse (data: expanseid)
    SEND_ESTIMATE       : 7, // send estimate to another user (needs in data: userid, estimateid, toEmail | toUsername, )
    CREATE_NEW_INCOME   : 8  // creates new income in selected cost estimate (needs in data field: estimateid,userid,token,name,startDate,endDate,evaluate,value,comment*) returns in data field id of created income (data: incomeid)
};

module.exports.databaseDeleteRequests = {
    DELETE_COST_ESTIMATE: 1, // deletes cost estemate for user (needs in data field: name,userid,token) 
    DELETE_CATEGORY     : 2, // deletes category in cost estimate (needs in data field: categoryid,userid,token)
    DELETE_EXPENSE      : 3, // deletes expanse (needs in data field: userid,token,expenseid)
    DELETE_INCOME       : 4  // delete income (needs in data field: userid,token ,incomeid)
};

module.exports.databaseUpdateRequests = {
    UPDATE_COST_ESTIMATE: 1, // changes data for cost estemate for user (needs in data field: estimateid,userid,token,name) 
    UPDATE_CATEGORY     : 2, // changes data for category in cost estimate (needs in data field: categoryid,userid,token,name) (other data can't be changed)
    UPDATE_EXPENSE      : 3, // changes data for expanse (needs in data field: expenseid,userid,token,name,value,comment*) (other data can't be changed)
    UPDATE_INCOME       : 4, // changes data for income (needs in data field: incomeid,userid,token,name,value,comment*) (other data can't be changed)
    UPDATE_PROFILE      : 5  // changes profile data (needs in data field: userid, token, name*, lastname*, oib*, homeAddress*, phoneNumber*) 
};