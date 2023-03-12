var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// }); 

// default redirection : root to main page
router.get('/', function(req, res, next) {
    res.render('main', { menuBlockHeader : 'COVID-19 Trends', 
    menuBlockMesg1 : 'A webpage showing Covid 19 trends from path to future.', 
    menuBlockMesg2 : 'From everyday experience to academic.' });
  });





module.exports = router;
