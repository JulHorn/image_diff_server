var express = require('express');
var router = express.Router();
var ImageMetaInformationModel = require('../logic/model/ImageMetaInformationModel');
var Image = require('../logic/model/ImageModel');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Image Diff Server', data: ImageMetaInformationModel });
});

module.exports = router;
