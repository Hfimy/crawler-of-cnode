'use strict';
var express = require('express');
var router = express.Router();
const cnode = require('../spiders/cnode')
// const path = require('path');
/* GET home page. */
router.get('/', function (req, res) {
  // res.render('index', { title: 'Express' });
  let url = 'http://cnodejs.org';
  const tab = req.query.tab;
  const page = req.query.page;
  if (tab !== undefined && page !== undefined) {
    // url=path.join(url,`?tab=${tab}&page=${page}`);
    url = url + '?tab=' + tab + '&page=' + page;
    console.log(url)
  }
  const _cnode = new cnode(url);
  _cnode.getData(res);
});

module.exports = router;
