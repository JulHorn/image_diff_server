var express = require('express');
var router = express.Router();
var ImageManipulator = require('../logic/ImageManipulator');
var ImageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var logger = require('winston');
var ImageMetaInformationModel = require('../logic/model/ImageMetaInformationModel');
var conf = require('../logic/configurationLoader');

router.post('/checkAll', function(req, res) {
    // This request might take a while to finish the computations -> Needs a longer timeout,
    // so that the client will not run into a timeout
    res.setTimeout(conf.getRequestTimeout());

    ImageManipulatorRepository.calculateDifferencesForAllImages(req.body.autoCrop
        , req.body.pixDiffThreshold
        , req.body.distThreshold
        , function (metaInformationModel, isThresholdBreached) {
        res.statusCode = 200;
        res.json({ message: 'OK', isThresholdBreached: isThresholdBreached});
    });
});

router.put('/:id/makeToNewReferenceImage', function(req, res) {
    var setId = req.params.id;

    ImageManipulatorRepository.makeToNewReferenceImage(setId, function (imageMetaInformation) {
        res.statusCode = 200;
        res.json({message: 'OK', data: JSON.stringify(imageMetaInformation)});
    });
});

router.delete('/:id', function (req, res) {
    var setId = req.params.id;

    ImageManipulatorRepository.deleteImageSet(setId, function (imageMetaInformation) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: JSON.stringify(imageMetaInformation)});
    });
});

router.get('/', function (req, res) {
    res.statusCode = 200;
    res.json({ message: 'OK', data: JSON.stringify(ImageMetaInformationModel)});
});

module.exports = router;
