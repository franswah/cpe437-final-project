var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Msgs';

router.get('/:id', function(req, res) {
   var vld = req.validator;

   req.cnn.query('select whenMade, content, email from Message m ' +
    'join Person p on p.id = prsId where m.id = ?', [req.params.id],
   function(err, cnvArr) {
      if (vld.check(cnvArr.length, Tags.notFound))
         res.json(cnvArr[0]);
      req.cnn.release();
   });
});

module.exports = router;
