var express = require('express');
var router = express.Router();
var imageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var config = require('../logic/ConfigurationLoader');

// ToDo: Add projectId params
// ToDo Prefix incoming screenshots with project id to prevent name clashing
// ToDo Rename response params to something more speaking or unify them
router.post('/checkAll', function(req, res) {
    // This request might take a while to finish the computations -> Needs a longer timeout,
    // so that the client will not run into a timeout
    res.setTimeout(config.getRequestTimeout());
    var bodyData = JSON.parse(req.body.data);

    // ToDo
    bodyData = bodyData ? bodyData : {};

    imageManipulatorRepository.calculateDifferencesForAllImages(bodyData.autoCrop
        , bodyData.pixDiffThreshold
        , bodyData.distThreshold
        , function (job, isThresholdBreached) {
            res.statusCode = 200;
            res.json({message: 'OK', data: {job: job, isThresholdBreached: isThresholdBreached}});
        });
});

router.put('/:id/makeToNewReferenceImage', function(req, res) {
    var setId = req.params.id;

    imageManipulatorRepository.makeToNewReferenceImage(setId, function (job, updatedImageSet) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, updatedImageSet: updatedImageSet}});
    });
});

router.get('/:id/getImageSet', function(req, res) {
    var setId = req.params.id;

    imageManipulatorRepository.getImageSet(setId, function (imageSet) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {resultImageSet: imageSet}});
    });
});

router.put('/:id/modifyIgnoreAreas', function(req, res) {
    var setId = req.params.id;
    var ignoreAreas = JSON.parse(req.body.data).ignoreAreas;

    imageManipulatorRepository.modifyIgnoreAreas(setId, ignoreAreas, function (imageSet) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {resultImageSet: imageSet}});
    });
});

router.put('/compareImageByName', function(req, res) {
    var imageBase64 = req.body.imageBase64;
    var imageName = req.body.imageName;
    var imageType = req.body.imageType;

    imageManipulatorRepository.compareImageByName(imageName, imageType, imageBase64, function(job, isThresholdBreached) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: {job: job, isThresholdBreached: isThresholdBreached}});
    });
});

router.get('/', function (req, res) {
    imageManipulatorRepository.getLastActiveJob(function (job) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: {job: job} });
    });
});

router.delete('/:id', function (req, res) {
    var setId = req.params.id;

    imageManipulatorRepository.deleteImageSetFromModel(setId, function (job) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: {job: job}});
    });
});

router.post('/addProject', function(req, res) {
    var projectName = JSON.parse(req.body.data).name;

    imageManipulatorRepository.addProject(projectName, function (job) {
        res.statusCode = 200;
        res.json({message: 'OK', data: job});
    });
});

router.put('/:id/editProject', function(req, res) {
    var projectId = req.params.id;
    var projectName = JSON.parse(req.body.data).name;

    imageManipulatorRepository.editProject(projectId, projectName, function (wasSuccessful) {
        res.statusCode = 200;
        res.json({message: 'OK', data: wasSuccessful});
    });
});

router.delete('/:id/removeProject', function(req, res) {
    var projectId = req.params.id;

    imageManipulatorRepository.removeProject(projectId, function (wasSuccessful) {
        res.statusCode = 200;
        res.json({message: 'OK', data: wasSuccessful});
    });
});

router.put('/:id/assignImageSetToProject', function(req, res) {
    var reqData = JSON.parse(req.body.data);
    var imageSetId = req.params.id;
    var projectIdFrom = reqData.projectIdFrom;
    var projectIdTo = reqData.projectIdTo;

    imageManipulatorRepository.assignImageSetToProject(imageSetId, projectIdFrom, projectIdTo, function (job, wasSuccessful) {
        res.statusCode = 200;
        res.json({message: 'OK', data: job});
    });
});

module.exports = router;
