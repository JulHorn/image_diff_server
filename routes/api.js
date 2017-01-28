var express = require('express');
var router = express.Router();
var imageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var imageMetaInformationModel = require('../logic/model/ImageMetaInformationModel');
var conf = require('../logic/ConfigurationLoader');

router.post('/checkAll', function(req, res) {
    // This request might take a while to finish the computations -> Needs a longer timeout,
    // so that the client will not run into a timeout
    res.setTimeout(conf.getRequestTimeout());

    imageManipulatorRepository.calculateDifferencesForAllImages(req.body.autoCrop
        , req.body.pixDiffThreshold
        , req.body.distThreshold
        , function (job, isThresholdBreached) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: job, isThresholdBreached: isThresholdBreached});
    });
});

router.put('/:id/makeToNewReferenceImage', function(req, res) {
    var setId = req.params.id;

    imageManipulatorRepository.makeToNewReferenceImage(setId, function (job) {
        res.statusCode = 200;
        res.json({message: 'OK', data: job});
    });
});

router.delete('/:id', function (req, res) {
    var setId = req.params.id;

    imageManipulatorRepository.deleteImageSetFromModel(setId, function (job) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: job});
    });
});

router.get('/', function (req, res) {
    res.statusCode = 200;
    res.json({ message: 'OK', data: imageMetaInformationModel.getLastActiveJob()});
});

module.exports = router;
