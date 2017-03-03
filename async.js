var express = require('express');
var app = express();
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var eventproxy = require('eventproxy');

var async = require('async');




app.listen(3000, function (req, res) {
	console.log('app is running at port 3000');
});

var cnodeUrl = 'https://cnodejs.org/';
app.get('/', function (req, res, next) {
	superagent.get(cnodeUrl)
		.end(function (err, sres) {
			if (err) {
				return next(err);
			}

			var $ = cheerio.load(sres.text);
			var items = [];
			$('#topic_list .topic_title').each(function (idx, element) {
				var $element = $(element);
				items.push({
					title: $element.attr('title'),
					href: $element.attr('href'),
					link: url.resolve(cnodeUrl, $element.attr('href'))
				});
			});

			res.send(items);
		});
});



app.get('/eventproxy', function (req, res, next) {
	superagent.get(cnodeUrl)
		.end(function (err, res) {
			if (err) {
				return console.error(err);
			}
			var topicUrls = [];
			var $ = cheerio.load(res.text);

			$('#topic_list .topic_title').each(function (idx, element) {
				var $element = $(element);

				var href = url.resolve(cnodeUrl, $element.attr('href'));
				topicUrls.push(href);
			});

			console.log(topicUrls);




			var ep = new eventproxy();


			ep.after('topic_html', topicUrls.length, function (topics) {

				topics = topics.map(function (topicPair) {
					var topicUrl = topicPair[0];
					var topicHtml = topicPair[1];
					var $ = cheerio.load(topicHtml);
					return ({
						title: $('.topic_full_title').text().trim(),
						href: topicUrl,
						comment1: $('.reply_content').eq(0).text().trim(),
					});
				});

				console.log('final:');
				console.log(topics);
			});

			topicUrls.forEach(function (topicUrl) {
				superagent.get(topicUrl)
					.end(function (err, res) {
						console.log('fetch ' + topicUrl + ' successful');
						ep.emit('topic_html', [topicUrl, res.text]);
					});
			});




		});
});


app.get('/async', function (req, res, next) {
	var concurrencyCount = 0;

	var fetchUrl = function (url, callback) {
		concurrencyCount++;
		console.log('当前并发数', concurrencyCount, '正在请求', url);
		superagent.get(url)
			.end(function (err, res) {
				console.log('fetch ' + url + ' successful');
				concurrencyCount--;
				callback(null, url);
			});
	};

	var urls = [];
	superagent.get(cnodeUrl)
		.end(function (err, res) {
			if (err) {
				return console.error(err);
			}
			var $ = cheerio.load(res.text);
			$('#topic_list .topic_title').each(function (idx, element) {
				var $element = $(element);
				var href = url.resolve(cnodeUrl, $element.attr('href'));
				urls.push(href);
			});



			async.mapLimit(urls, 5, function (url, callback) {
				fetchUrl(url, callback);
			}, function (err, result) {
				console.log('final:');
				console.log(result);
			});
		});


});


