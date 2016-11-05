var express = require('express');
var router = express.Router();
var ImageManipulator = require('../logic/ImageManipulator');
var ImageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var logger = require('winston');

router.post('/refreshAll', function(req, res) {
    ImageManipulatorRepository.calculateDifferencesForAllImages(req.body.autoCrop, req.body.pixDiffThreshold, req.body.distThreshold);

    res.statusCode = 200;
    res.json({ message: 'OK'});
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

module.exports = router;
