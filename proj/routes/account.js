/**
 * server side routerlication, handling database request passed by client.
 * The configuration below is for local host. To change it to remote, 
 * DO NOT CHANGE :  DB_HOST_IP, DB_SUR, DB_PSW. They are deliberately 
 * set the same as they are in local host.
 * Current Potential Bugs : 
 * 1. case where data base/table not exist : will it return err ?
 */

var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();

// configure DB connection
const DB_CONFIG = require('./dbconfig');


let DB_HOST_IP = DB_CONFIG.DB_CONFIG.DB_HOST_IP;
let DB_USR = DB_CONFIG.DB_CONFIG.DB_USR;
let DB_PSW = DB_CONFIG.DB_CONFIG.DB_PSW;
let secretKey = DB_CONFIG.DB_CONFIG.SECRETKEY;

console.log(DB_HOST_IP);

// These are dev debugging variables. and should be deleted for release. 
// Forgive this C style testing.

let DEBUG_SQL_NODEBUG = 0;
let DEBUG_SQL_INSERT0 = (1<<0);
let DEBUG_SQL_QUERY0  = (1<<1);

let DEBUG_SQL = ( DEBUG_SQL_NODEBUG );

// end of dev area

const path = require('path');
const mysql = require('mysql2');
const cors=require("cors");
var bodyParser = require('body-parser');

// parse routerlication/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse routerlication/json
router.use(bodyParser.json());

/**
 * connection configuration
 */
var con = mysql.createConnection({
    host: DB_HOST_IP,
    user: DB_USR,
    password: DB_PSW
  });


// router to contributors
router.get('/', function(req, res, next) {
    res.render('account', { menuBlockHeader : 'New User?', 
    menuBlockMesg1 : 'Log in PLZ', 
    menuBlockMesg2 : ''});
  });

// this API tries to log the user in based on the token given
router.get('/trydashboard', (req, res) => {
    // Check if the Authorization header is present and contains a valid token
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization);
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.json({ success: false, message: 'Invalid token' });
            } else {
                res.json({ success: true, message: 'Access granted to protected resource', username: decoded.username });
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
});


/**
 * connect to mysql.
 */
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    // if there is mydb (our default database), delete it
    con.query("DROP DATABASE IF EXISTS mydb;",function(err,result){
        if (err) throw err;
        console.log("default database removed");
    });
    // create database
    con.query("CREATE DATABASE IF NOT EXISTS covidgcp;", function (err, result) {
        if (err) throw err;
        console.log("covidgcp database created");
    });
    // confirm data base created
    con.query("SELECT SCHEMA_NAME \
    FROM INFORMATION_SCHEMA.SCHEMATA \
    WHERE SCHEMA_NAME = 'covidgcp'",function (err, result) {
        if (err) throw err;
        if(result.length) console.log("covidgcp database created & confirmed"); // find data base
    });
    // create table
    var check_user_table = `SELECT EXISTS(
        SELECT * FROM information_schema.tables 
        WHERE table_schema = 'covidgcp' 
        AND table_name = 'users'
        );`;
    var sql_create_table = "CREATE TABLE covidgcp.users (username VARCHAR(20) PRIMARY KEY, password VARCHAR(50), email VARCHAR(50))";
    con.query(check_user_table, function (err, result) {
        if (err) throw err;
        // console.log(Object.values(result[0])[0]); 
        if(0==Object.values(result[0])[0]){
            con.query(sql_create_table,function (err, result) {
                if (err) throw err;
                console.log("covidgcp users table created");
            });
        }

    });

    // dev : run sql unit test
    // mysql_unit_test();

});

/**
 * handling ports error with chrome
 */
const corsOptions = {
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
};

router.use(cors(corsOptions)); // Use this after the variable declaration


/**
 * handle regigration request issued by users
 */
router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    con.connect(function(err) {
        if (err) throw err;
        console.log("register : Data Base Connected!");
        var sql_insert = `INSERT INTO covidgcp.users (username, password, email) VALUES ('${username}', '${password}', '${email}')`;
        var check_user_table = `SELECT EXISTS(
            SELECT * FROM information_schema.tables 
            WHERE table_schema = 'covidgcp' 
            AND table_name = 'users'
            );`;
        con.query(check_user_table, function (err, result) {
            if (err) throw err;
            // console.log(Object.values(result[0])[0]); 
            if(Object.values(result[0])[0]){ // table exists
                var sql_username_exist=`SELECT EXISTS(
                    SELECT username FROM covidgcp.users WHERE username = '${username}'
                    );`;
                con.query(sql_username_exist,function (err, result) {
                    if (err) throw err;
                    if(0==Object.values(result[0])[0]){ // username not exist
                        con.query(sql_insert,function (err, result) {
                            if (err) throw err;
                            res.send("Success");
                            console.log(`user registered with username : ${username}, email ${email}`);
                        });
                    }
                    else{
                        res.send("Failed : username has been registered");
                        console.log('username exists');
                    }
                });
                
            }else{
                res.send("Failed : Table doesn't exist");
            }
    
        });
    });
});

/**
 * handle login request issued by users
 * 
 * out of data : 
 */
router.post('/login',(req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    con.connect(function(err) {
        if (err) throw err;
        console.log("login : Data Base Connected!");
        var check_user_table = `SELECT EXISTS(
            SELECT * FROM information_schema.tables 
            WHERE table_schema = 'covidgcp' 
            AND table_name = 'users'
            );`;
        con.query(check_user_table, function (err, result) {
            if (err) throw err;
            // console.log(Object.values(result[0])[0]); 
            if(Object.values(result[0])[0]){ // table exists
                var sql_username_exist=`SELECT EXISTS(
                    SELECT username FROM covidgcp.users WHERE (username = '${username}' AND password = '${password}') OR (email = '${username}' AND password = '${password}')
                    );`;
                con.query(sql_username_exist,function (err, result) {
                    if (err) throw err;
                    if(Object.values(result[0])[0]){ // login success
                        // we return a token
                        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
                        res.json({ success: true, message: 'Authentication successful', token });
                        // res.send("Success");
                        console.log(`user with username/email : ${username} and password : ${password} logged in`);
                    }
                    else{
                        res.send("Failed : incorrect username/password");
                        console.log('please enter the correct username/password');
                    }
                });
                
            }else{
                res.send("Failed : Table doesn't exist");
            }
    
        });
    });
});





/**
 * Unit tests : testing account related functionalities.
 */
function mysql_unit_test(){
    var username='covidgcp@illinois.edu';
    var password='covidgcp';
    var email='covidgcp@illinois.edu';

    if(DEBUG_SQL&DEBUG_SQL_INSERT0){
        con.connect(function(err) {
            if (err) throw err;of
            console.log("Data Base Connected!");
            var sql_insert = `INSERT INTO covidgcp.users (username, password, email) VALUES ('${username}', '${password}', '${email}')`;
            var check_user_table = `SELECT EXISTS(
                SELECT * FROM information_schema.tables 
                WHERE table_schema = 'covidgcp' 
                AND table_name = 'users'
                );`;
            con.query(check_user_table, function (err, result) {
                if (err) throw err;
                // console.log(Object.values(result[0])[0]); 
                if(Object.values(result[0])[0]){ // table exists
                    var sql_username_exist=`SELECT EXISTS(
                        SELECT username FROM covidgcp.users WHERE username = '${username}'
                        );`;
                    con.query(sql_username_exist,function (err, result) {
                        if (err) throw err;
                        if(0==Object.values(result[0])[0]){ // username not exist
                            con.query(sql_insert,function (err, result) {
                                if (err) throw err;
                                console.log(`user registered with username : ${username}, email ${email}`);
                            });
                        }
                        else{
                            console.log('username exists');
                        }
                    });
                    
                }
        
            });
        });
    }
    if(DEBUG_SQL&DEBUG_SQL_QUERY0){
        con.connect(function(err) {
            if (err) throw err;
            console.log("Data Base Connected!");
            var sql_insert = `INSERT INTO covidgcp.users (username, password, email) VALUES ('${username}', '${password}', '${email}')`;
            var check_user_table = `SELECT EXISTS(
                SELECT * FROM information_schema.tables 
                WHERE table_schema = 'covidgcp' 
                AND table_name = 'users'
                );`;
            con.query(check_user_table, function (err, result) {
                if (err) throw err;
                // console.log(Object.values(result[0])[0]); 
                if(Object.values(result[0])[0]){ // table exists
                    var sql_username_exist=`SELECT EXISTS(
                        SELECT username FROM covidgcp.users WHERE (username = '${username}' AND password = '${password}') OR (email = '${username}' AND password = '${password}')
                        );`;
                    con.query(sql_username_existof,function (err, result) {
                        if (err) throw err;
                        if(Object.values(result[0])[0]){ // login success
                            console.log(`user with username/email : ${username} and password : ${password} logged in`);
                        }
                        else{
                            console.log('please enter the correct username/password');
                        }
                    });
                    
                }
        
            });
        });
    }
}

// account is a virtual page which consists of two states : dashboard and login
// Henece we have two routers for the two sub-pages.
// The strategy is :
// First we try to log in to dash board, by checking local storage (tokens if there are any stored in browser).
//      if no tokens are found, we go to login page
//      otherwise we go to dashboard page



module.exports = router;

