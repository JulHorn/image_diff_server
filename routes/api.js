var express = require('express');
var router = express.Router();
var imageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var config = require('../logic/ConfigurationLoader');

router.post('/checkAll', function(req, res) {
    // This request might take a while to finish the computations -> Needs a longer timeout,
    // so that the client will not run into a timeout
    res.setTimeout(config.getRequestTimeout());

    imageManipulatorRepository.calculateDifferencesForAllImages(req.body.autoCrop
        , req.body.pixDiffThreshold
        , req.body.distThreshold
        , function (job, isThresholdBreached) {
            res.statusCode = 200;
            res.json({message: 'OK', data: job, isThresholdBreached: isThresholdBreached});
        });
});

router.put('/:id/makeToNewReferenceImage', function(req, res) {
    var setId = req.params.id;

    imageManipulatorRepository.makeToNewReferenceImage(setId, function (job) {
        res.statusCode = 200;
        res.json({message: 'OK', data: job});
    });
});

router.put('/:id/modifyIgnoreAreas', function(req, res) {
    var setId = req.params.id;
    var ignoreAreas = JSON.parse(req.body.data).ignoreAreas;

    imageManipulatorRepository.modifyIgnoreAreas(setId, ignoreAreas, function (job) {
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
    imageManipulatorRepository.getLastActiveJob(function (data) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: data });
    });
});

module.exports = router;
