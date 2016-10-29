var express = require('express');
var router = express.Router();
var ImageManipulator = require('../logic/ImageManipulator');

router.post('/', function(req, res) {
    var im = new ImageManipulator();
    console.log("hui");
    im.createDiffImages(false);

    /*im.createDiffImage('Unbenannt.PNG', false, function (data) {
        console.log(data);
    });*/

    res.statusCode = 200;
});

module.exports = router;
