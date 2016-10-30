var express = require('express');
var router = express.Router();
var ImageManipulator = require('../logic/ImageManipulator');
var ImageManipulatorRepository = require('../logic/ImageManipulatorRepository');
var logger = require('winston');

router.put('/refreshAll', function(req, res) {
    var im = new ImageManipulator();
    console.log("hui");
    im.createDiffImages(false);

    /*im.createDiffImage('Unbenannt.PNG', false, function (data) {
        console.log(data);
    });*/

    res.statusCode = 200;
    res.json({ message: 'OK'});
});

router.put('/:id/refresh', function(req, res) {
    var im = new ImageManipulator();
    console.log("hui");

    im.createDiffImage('Unbenannt.PNG', false, function (data) {
     console.log(data);
     });

    res.statusCode = 200;
});

router.delete('/:id', function (req, res) {
    var setId = req.params.id;

    ImageManipulatorRepository.deleteImageSet(setId, function (imageMetaInformation) {
        res.statusCode = 200;
        res.json({ message: 'OK', data: JSON.stringify(imageMetaInformation)});
    });
});

module.exports = router;
