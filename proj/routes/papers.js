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

module.exports = router;