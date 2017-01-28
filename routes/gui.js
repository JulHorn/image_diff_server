var express = require('express');
var router = express.Router();
var jobHandler = require('../logic/JobHandler');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Image Diff Server', data: jobHandler.getLastActiveJob() });
});

module.exports = router;
