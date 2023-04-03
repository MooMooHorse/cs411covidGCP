var express = require('express');
var router = express.Router();

// configure DB connection
const DB_CONFIG = require('./dbconfig');

let DB_HOST_IP = DB_CONFIG.DB_CONFIG.DB_HOST_IP;
let DB_USR = DB_CONFIG.DB_CONFIG.DB_USR;
let DB_PSW = DB_CONFIG.DB_CONFIG.DB_PSW;

let DEBUG_SQL_NODEBUG = 0;
let DEBUG_SQL_stateName = (1<<0);
let DEBUG_SQL_advanced1 = (1<<1);

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
    mysql_main_unit_test();

});



/* GET home page. */
// router to main page
router.get('/', function (req, res, next) {
    // var stateList, stateNames;
    // var stateNamesQuery = `SELECT DISTINCT 
    // location
    // FROM covid_trail1.vacc LEFT OUTER JOIN covid_trail1.hospital ON vacc.location = hospital.STATE_NAME
    // WHERE location IS NOT NULL
    // ORDER BY location`;
    // con.query(stateNamesQuery, function(err, result) {
    //     if (err) throw err;
    //     stateList = result;
    //     stateNames = stateList.map(state => state.location);
    //     console.log(stateNames)
    // });
    res.render('index', {
        menuBlockHeader: 'COVID-19 Trends',
        menuBlockMesg1: 'A webpage showing Covid 19 trends from path to future.',
        menuBlockMesg2: 'From everyday experience to academic.',
        // stateNames : JSON.stringify(stateNames)
    });
    
});

router.post('/adquery1', function(req, res, next) {
    var queriedState = req.body.stateName; 
    console.log(req.body.stateName)
    var sample_query = `SELECT location, bed_utl, vacc_ratio
    FROM
    (
    SELECT location, AVG(BED_UTILIZATION) AS bed_utl, AVG(daily_vaccinations_per_million) AS vacc_ratio
    FROM covid_trail1.vacc LEFT OUTER JOIN covid_trail1.hospital
    ON (vacc.location = hospital.STATE_NAME)
    GROUP BY location
    ) AS tab1
    WHERE bed_utl IS NOT NULL and vacc_ratio IS NOT NULL and location = '${queriedState}'
    ORDER BY location
    ;`;

    console.log(sample_query)

    con.query(sample_query, function(err, result) {
        if (err) throw err;
        console.log(result[0]);
        res.send(result[0]);
    });
});


function mysql_main_unit_test() {
    if (DEBUG_SQL & DEBUG_SQL_advanced1) {
        var sample_query = `SELECT location, bed_utl, vacc_ratio
        FROM
        (
        SELECT location, AVG(BED_UTILIZATION) AS bed_utl, AVG(daily_vaccinations_per_million) AS vacc_ratio
        FROM covid_trail1.vacc LEFT OUTER JOIN covid_trail1.hospital
        ON (vacc.location = hospital.STATE_NAME)
        GROUP BY location
        ) AS tab1
        WHERE bed_utl IS NOT NULL and vacc_ratio IS NOT NULL
        ORDER BY location
        ;`;
        con.query(sample_query, function(err, result) {
            if (err) throw err;
            console.log(result);
        });
    }
    if (DEBUG_SQL & DEBUG_SQL_stateName) {
        var stateList;
        var stateNamesQuery = `SELECT DISTINCT 
        location
        FROM covid_trail1.vacc LEFT OUTER JOIN covid_trail1.hospital ON vacc.location = hospital.STATE_NAME
        WHERE location IS NOT NULL
        ORDER BY location`;
        con.query(stateNamesQuery, function(err, result) {
            if (err) throw err;
            stateList = result;
            console.log(stateList);
            var stateNames = stateList.map(state => state.location);
            console.log(stateNames);
        });
    }
}


module.exports = router;
