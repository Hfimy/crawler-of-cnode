'use strict';

const superagent = require('superagent');
const cheerio = require('cheerio');
const url = require('url');
const querystring = require('querystring');



const Cnode = function (url) {
    this.url = url;
}
Cnode.prototype.getData = function (res) {
    superagent.get(this.url)
        .end((err, sres) => {
            if (err) {
                throw err;
            }
            const $ = cheerio.load(sres.text);
            const lastPageUrl = $('.pagination li:last-child').find('a').attr('href');
            if (lastPageUrl !== undefined) {
                console.log(lastPageUrl);

                const queryUrl = url.parse(lastPageUrl).query;
                console.log(queryUrl);

                const obj = querystring.parse(queryUrl);
                console.log(obj);

                var totalPages = obj.page;
                console.log(totalPages);
            }else{
                var totalPages=$('.pagination').attr('current_page');
            }


            const items = [];
            $('#topic_list .topic_title').each((index, ele) => {
                const $element = $(ele);
                const type = $element.prev().text();
                items.push({
                    title: $element.attr('title'),
                    href: $element.attr('href'),
                    link: url.resolve(this.url, $element.attr('href')),
                    type: type
                });
            });
            items.totalPages = totalPages;
            // res.send(items);
            res.render('index', {
                title: '资源列表',
                items: items
            })
        })
}
module.exports = Cnode;

