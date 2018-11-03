var express = require('express');
var router = express.Router();
var imageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var config = require('../logic/ConfigurationLoader');

// ToDo: Add projectId params
// ToDo Better Error Handling
router.post('/checkAll', function(req, res) {
    // This request might take a while to finish the computations -> Needs a longer timeout,
    // so that the client will not run into a timeout
    res.setTimeout(config.getRequestTimeout());
    var bodyData = JSON.parse(req.body.data);

    // Sets a default falue to the body data if it was null
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
    var reqData = JSON.parse(req.body.data);
    var imageBase64 = reqData.imageBase64;
    var imageName = reqData.imageName;
    var imageType = reqData.imageType;
    var projectId = reqData.projectId;

    imageManipulatorRepository.compareImageByName(imageName, imageType, imageBase64, projectId, function(job, isThresholdBreached) {
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

    imageManipulatorRepository.addProject(projectName, function (job, newProject) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, project: newProject}});
    });
});

router.put('/:id/editProject', function(req, res) {
    var projectId = req.params.id;
    var projectName = JSON.parse(req.body.data).name;

    imageManipulatorRepository.editProject(projectId, projectName, function (job, wasSuccessful) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, wasSuccessful: wasSuccessful}});
    });
});

router.delete('/:id/removeProject', function(req, res) {
    var projectId = req.params.id;

    imageManipulatorRepository.removeProject(projectId, function (job, wasSuccessful) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, wasSuccessful: wasSuccessful}});
    });
});

router.put('/:id/assignImageSetToProject', function(req, res) {
    var reqData = JSON.parse(req.body.data);
    var imageSetId = req.params.id;
    var projectIdFrom = reqData.projectIdFrom;
    var projectIdTo = reqData.projectIdTo;

    imageManipulatorRepository.assignImageSetToProject(imageSetId, projectIdFrom, projectIdTo, function (job, wasSuccessful) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, wasSuccessful: wasSuccessful}});
    });
});

module.exports = router;
