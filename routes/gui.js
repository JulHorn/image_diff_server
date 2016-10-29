var express = require('express');
var router = express.Router();
var ImageMetaInformationModel = require('../logic/model/ImageMetaInformationModel');
var ImageSet = require('../logic/model/ImageSetModel');
var Image = require('../logic/model/ImageModel');
var config = require('../logic/configurationLoader');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Image Diff Server', data: ImageMetaInformationModel });
});

module.exports = router;
