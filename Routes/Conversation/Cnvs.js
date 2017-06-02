var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({ caseSensitive: true });
var async = require('async');

router.baseURL = '/Cnvs';

var TITLE_MAX = 80;
var MSG_MAX = 5000;

router.get('/', function (req, res) {
   var vld = req.validator;
   var ownerId = req.query.owner;
   var cnn = req.cnn;

   var handler = function (err, cnvArr) {
      res.json(cnvArr);
      req.cnn.release();
   };

   if (ownerId)
      req.cnn.chkQry('select (UNIX_TIMESTAMP(lastMessage)*1000) as' +
       ' `lastMessage`, id, title, ownerId from Conversation' +
       ' where ownerId = ?', [ownerId], handler);
   else
      req.cnn.chkQry('select (UNIX_TIMESTAMP(lastMessage)*1000) as' +
       ' `lastMessage`, id, title, ownerId from Conversation', handler);
});

router.get('/:id', function (req, res) {
   var vld = req.validator;

   req.cnn.query('select (UNIX_TIMESTAMP(lastMessage)*1000) as `lastMessage`' +
    ' , id, title, ownerId from Conversation where id = ?', [req.params.id],
      function (err, cnvArr) {
         if (vld.check(cnvArr.length, Tags.notFound))
            res.json(cnvArr[0]);
         req.cnn.release();
      });
});

router.post('/', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      if (vld.hasFields(body, ["title"], cb) &&
       vld.hasOnlyFields(body, ["title"], cb)
       .check(body.title.length <= TITLE_MAX, Tags.badValue, ["title"], 
       cb)) {
         cnn.chkQry('select * from Conversation where title = ?', body.title,
          cb);
      }
   },
   function (existingCnv, fields, cb) {
      if (vld.check(!existingCnv.length, Tags.dupTitle, null, cb)) {
         body.ownerId = req.session.id;
         cnn.chkQry("insert into Conversation set ?", body, cb);
      }
   },
   function (insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }
],
   function () {
      cnn.release();
   });
});

router.put('/:cnvId', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;

   async.waterfall([
   function (cb) {
      if (vld.hasOnlyFields(body, ["title"], cb)) {
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
      }
   },
   function (result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(result[0].ownerId, cb))
         cnn.chkQry('select * from Conversation where id <> ? && title = ?',
          [cnvId, body.title], cb);
   },
   function (sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb))
         cnn.chkQry("update Conversation set title = ? where id = ?", 
          [body.title, cnvId], cb);
   },
   function (result, fields, cb) {
      res.status(200).end();
      cb();
   }],
   function () {
      cnn.release();
   });
});

router.delete('/:cnvId', function (req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;

   async.waterfall([
   function (cb) {
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function (result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(result[0].ownerId, cb))
         cnn.chkQry('delete from Conversation where id = ?', [cnvId], cb);
   }],
   function (err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

router.get('/:cnvId/Msgs', function (req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;
   var extraWhere = '';
   var params = [cnvId];

   if (req.query.dateTime) {
      extraWhere = ' and whenMade < ?';
      params.push(parseInt(req.query.dateTime));
   }

   var query = 'select m.id, (UNIX_TIMESTAMP(whenMade)*1000) as `whenMade`,' +
    ' email, content from Conversation c' +
    ' join Message m on cnvId = c.id join Person p on prsId = p.id' +
    ' where c.id = ?' + extraWhere +
    ' order by whenMade';


   // And finally add a limit clause and parameter if indicated.
   if (req.query.num) {
      query += ' limit ?';
      params.push(parseInt(req.query.num));
   }

   async.waterfall([
   function (cb) { // Check for existence of conversation
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function (cnvs, fields, cb) { // Get indicated messages
      if (vld.check(cnvs.length, Tags.notFound, null, cb))
         cnn.chkQry(query, params, cb);
   },
   function (msgs, fields, cb) { // Return retrieved messages
      res.json(msgs);
      cb();
   }],
   function (err) {
      cnn.release();
   });
});

router.post('/:cnvId/Msgs', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var body = req.body;
   var cnvId = req.params.cnvId;
   var now;

   async.waterfall([
   function (cb) {
      if (
       vld.hasOnlyFields(body, ["content"])
       .check(body.content && body.content.length, 
       Tags.missingField, ["content"], cb) &&
       vld.check(req.body.content.length <= MSG_MAX, 
       Tags.badValue, ["content"], cb))
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function (cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb))
         cnn.chkQry('insert into Message set ?', {
            cnvId: cnvId,
            prsId: req.session.id,
            whenMade: now = new Date(),
            content: req.body.content
         }, 
         cb);
   },
   function (insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId);
      cnn.chkQry("update Conversation set lastMessage = ? where id = ?",
       [now, cnvId], cb);
   },
   function (upRes, fields, cb) {
      res.status(200).end();
      cb();
   }],
   function (err) {
      cnn.release();
   });
});

module.exports = router;