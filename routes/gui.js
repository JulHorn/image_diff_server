var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('*', (req,res) => {
    return nextRequestHandle(req,res) // for all the react stuff
});

module.exports = router;
