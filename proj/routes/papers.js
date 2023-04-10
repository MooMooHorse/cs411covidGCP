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

// paper search
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

  console.log(req.body.titleName);
  console.log(req.body.authorName);
  console.log(req.body.journalName);


  var sample_query = `       
        SELECT count(p.paper_id) as papercnt
        FROM covid_trail1.papers p
        WHERE p.title LIKE '%${searchTitle}%' and p.authors LIKE '%${searchAuthor}%' and p.journal LIKE '%${searchJournal}%'
        ;`;

  // console.log(sample_query)

  console.log(sample_query)

  con.query(sample_query, function (err, result) {
    if (err) throw err;
    const isTokenValid = DB_CONFIG.isSignatureValid(token, username);
    if (isTokenValid) {
      console.log(result[0]);
    }
    res.send(result[0]);
  });
});

module.exports = router;
