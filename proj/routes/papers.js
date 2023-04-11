var express = require('express');
var router = express.Router();

// router to papers
router.get('/', function (req, res, next) {
  res.render('papers', {
    menuBlockHeader: 'Papers',
    menuBlockMesg1: 'Academic paper statistic related to COVID-19',
    menuBlockMesg2: ''
  });
});

// configure DB connection
const DB_CONFIG = require('./dbconfig');

let DB_HOST_IP = DB_CONFIG.DB_CONFIG.DB_HOST_IP;
let DB_USR = DB_CONFIG.DB_CONFIG.DB_USR;
let DB_PSW = DB_CONFIG.DB_CONFIG.DB_PSW;

let DEBUG_SQL_NODEBUG = 0;
let DEBUG_SQL_stateName = (1 << 0);
let DEBUG_SQL_advanced1 = (1 << 1);

let DEBUG_SQL = DEBUG_SQL_NODEBUG;


const path = require('path');
const mysql = require('mysql2');
const cors = require("cors");
var bodyParser = require('body-parser');


// parse routerlication/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse routerlication/json
router.use(bodyParser.json());

/**
 * connection configuration for main page
 */
var con = mysql.createConnection({
  host: DB_HOST_IP,
  user: DB_USR,
  password: DB_PSW
});


/**
 * connect to mysql.
 */
con.connect(function (err) {
  if (err) throw err;
  console.log("Connected for main!");
  // mysql_main_unit_test();
});

// satisfied paper count
router.post('/papersearch', function (req, res, next) {
    var searchTitle = req.body.titleName;
    var searchAuthor = req.body.authorName;
    var searchJournal = req.body.journalName;

    var authHeader = req.headers.token;
    var token, username;
    if (authHeader) {
        token = req.headers.token;
        username = req.headers.username;
    }

    // console.log(req.body.titleName);
    // console.log(req.body.authorName);
    // console.log(req.body.journalName);


    var sample_query = `       
        SELECT count(p.paper_id) as papercnt
        FROM covid_trail1.papers p
        WHERE p.title LIKE '%${searchTitle}%' and p.authors LIKE '%${searchAuthor}%' and p.journal LIKE '%${searchJournal}%'
        ;`;


    con.query(sample_query, function (err, result) {
        if (err) throw err;
        const isTokenValid = DB_CONFIG.isSignatureValid(token, username);
        if (isTokenValid) {
            const insert_userQuery_table1 = `
                INSERT INTO covidgcp.userQuery (username, queryContent, queryType, queryResult, resultName)
                VALUES ('${username}', '${searchTitle},${searchAuthor},${searchJournal}', 'PaperSearch', '${result[0].papercnt}', 'paper_count');
                `;

            con.query(insert_userQuery_table1, function (err, result) {
                if (err) throw err;
                // console.log(result);
            });
        }
        // console.log(result);
        res.send(result[0]);
    });
});

// satisfied 10 papers
router.post('/papersearch1', function (req, res, next) {
  var searchTitle = req.body.titleName;
  var searchAuthor = req.body.authorName;
  var searchJournal = req.body.journalName;

  var authHeader = req.headers.token;
  var token, username;
  if (authHeader) {
    token = req.headers.token;
    username = req.headers.username;
  }

  // console.log(req.body.titleName);
  // console.log(req.body.authorName);
  // console.log(req.body.journalName);


  var sample_query = `       
        SELECT p.title as papertitle, p.authors as paperauthor, p.journal as paperjournal, p.publish_time as papertime
        FROM covid_trail1.papers p
        WHERE p.title LIKE '%${searchTitle}%' and p.authors LIKE '%${searchAuthor}%' and p.journal LIKE '%${searchJournal}%'
        ;`;


  con.query(sample_query, function (err, result) {
    if (err) throw err;

    // console.log(result.slice(0, Math.min(result.length, 10)));
    res.send(result.slice(0, Math.min(result.length, 10)));
  });
});



module.exports = router;
