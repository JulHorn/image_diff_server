var express = require('express');
var router = express.Router();
var imageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var config = require('../logic/ConfigurationLoader');

// ToDo Better Error Handling
router.post('/checkAll', function(req, res) {
    // This request might take a while to finish the computations -> Needs a longer timeout,
    // so that the client will not run into a timeout
    res.setTimeout(config.getRequestTimeout());
    var reqData = req.body;

    imageManipulatorRepository.calculateDifferencesForAllImages(reqData.autoCrop
        , reqData.pixDiffThreshold
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
    var ignoreAreas = req.body.ignoreAreas;

    imageManipulatorRepository.modifyIgnoreAreas(setId, ignoreAreas, function (job, imageSet) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, updatedImageSet: imageSet}});
    });
});

router.put('/:id/modifyCheckAreas', function(req, res) {
	var setId = req.params.id;
	var checkAreas = req.body.checkAreas;

	imageManipulatorRepository.modifyCheckAreas(setId, checkAreas, function (job, imageSet) {
		res.statusCode = 200;
		res.json({message: 'OK', data: {job: job, updatedImageSet: imageSet}});
	});
});

/**
 * Compares a new image to a reference image with the same name.
 *
 * The request body must contain the following properties:
 *
 * {String} imageName The name of the image it should be compared to.
 * {String} imageType The type of the image (png, ...)
 * {String} imageBase64 The base 64 encoded image.
 * {String} projectId Project for which the comparison will be made. If empty, the default project will be used.
 */
router.put('/compareImageByName', function(req, res) {
    var reqData = req.body;
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
    var projectName = req.body.name;

    imageManipulatorRepository.addProject(projectName, function (job, newProject) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, project: newProject}});
    });
});

router.put('/:id/editProject', function(req, res) {
    var projectId = req.params.id;
    var projectName = req.body.name;

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

router.put('/:id/cleanUpProject', function(req, res) {
	var projectId = req.params.id;
	var imageName = req.body.imageName;

	imageManipulatorRepository.cleanUpProject(imageName, projectId, function (job, wasSuccessful) {
		res.statusCode = 200;
		res.json({message: 'OK', data: {job: job, wasSuccessful: wasSuccessful}});
	});
});

router.put('/:id/assignImageSetToProject', function(req, res) {
    var reqData = req.body;
    var imageSetId = req.params.id;
    var projectIdFrom = reqData.projectIdFrom;
    var projectIdTo = reqData.projectIdTo;

    imageManipulatorRepository.assignImageSetToProject(imageSetId, projectIdFrom, projectIdTo, function (job, wasSuccessful) {
        res.statusCode = 200;
        res.json({message: 'OK', data: {job: job, wasSuccessful: wasSuccessful}});
    });
});

module.exports = router;
