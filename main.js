const cheerio = require('cheerio');
const request = require('request-promise');
var excel = require('excel4node');
const { get } = require('request-promise');

const $ = cheerio.load('<h2 class="title">Hello Cuong</h2>');

console.log($('h2.title').text());


var URL = 'https://jprp.vn/index.php/JPRP/issue/archive';

var totalNewSpaper = 0;


var workbook = new excel.Workbook();
var numRow = 2;
var worksheet = workbook.addWorksheet('Sheet 1');

var style = workbook.createStyle({
    font: {
        color: '#FF0800',
        size: 12
    },
    numberFormat: '$#,##0.00; ($#,##0.00); -'
});

worksheet.cell(1, 1).string("Tên bài báo").style(style);
worksheet.cell(1, 2).string("Số báo").style(style);
worksheet.cell(1, 3).string("Ngày đăng").style(style);
worksheet.cell(1, 4).string("Doi").style(style);

/**
 * tên bài báo : $('title').text().trim().split('\n')[0];
 * số báo (cái đang hiện trên page) : $('.panel-body a.title').text().trim();
 * ngày đăng : $('.date-published').text().split(':')[1].trim();
 *  địa chỉ doi : $('.list-group-item.doi').text().split('DOI:')[1].trim();
 */
/**---------------Lấy thông tin từng trang cụ thể ----------*/



request('https://jprp.vn/index.php/JPRP/issue/archive', (error, response, html) => {
    var totalLink = []
    console.log(response.statusCode);
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);


        $('.media-body a').each(function(indext) {
            const link = $(this).attr('href');
            totalLink.push(link);
        })

        var l = totalLink.length;

        console.log(totalLink.toString() + "\n" + l);

        for (let i = 0; i < l; i++) {

            request(totalLink[i], (error, response, html) => {

                loadLink(error, response, html);

                // if (loadLink(error, response, html) == -1) {
                //     console.log(totalLink[i]);
                //     if (i == l - 1) {
                //         console.log(totalNewSpaper);
                //     }
                // };


            });
        }
    }
});



async function loadLink(error, response, html) {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        var n = 1;
        var totalLink = [];

        $('.col-md-10 a').each(function(indext) {
            const link = $(this).attr('href');
            if (true) {
                totalLink.push(link);
            }
            n++;
        })

        var l = totalLink.length;
        totalNewSpaper += l;

        // return -1;

        for (let i = 0; i < l; i++) {

            // var detailLink = [];

            var promise = new Promise((resolve, reject) => {
                request(totalLink[i], (error, response, html) => {
                    resolve(loadResult(error, response, html));
                });
            });

            var detail = await promise;
            setTimeout(function() {}, 500)
            if (detail == false) {
                console.log("Err: " + totalLink[i]);
            } else {
                console.log(true);
            }

            // request(totalLink[i], (error, response, html) => {

            //     var promise = new Promise((resolve, reject) => {
            //         resolve(loadResult(error, response, html));
            //     })

            //     var detail = await promise;
            //     if (detail == false) {
            //         console.log("Err: " + totalLink[i]);
            //     }
            //     // } else {
            //     //     // detailLink.push(totalLink[i])
            //     //     // detailLink.push(detail)
            //     //     // totalDetailLink.push(detailLink);
            //     //     // console.log(i);

            //     // }
            //     // console.log(i);
            // });
        }

        console.log(l);
        console.log(totalNewSpaper);

        // console.log("Het");

    }
}

var loadResult = (error, response, html) => {
    // console.log(response.statusCode);
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        var object = {
            name: $('title').text().trim().split('\n')[0],
            numberNewSpaper: $('.panel-body a.title').text().trim(),
            date: "",
            doi: ""
        }


        var DATE = $('.date-published').text().split(':')[1];
        if (DATE != undefined) {
            object.date = DATE.trim();
        }

        var DOI = $('.list-group-item.doi').text().split('DOI:')[1];
        if (DOI != undefined) {
            object.doi = DOI.trim();
        }

        // console.log(JSON.stringify(object));


        worksheet.cell(numRow, 1).string(object.name).style(style);
        worksheet.cell(numRow, 2).string(object.numberNewSpaper).style(style);
        worksheet.cell(numRow, 3).string(object.date).style(style);
        worksheet.cell(numRow, 4).string(object.doi).style(style);

        console.log(numRow);
        numRow++

        if (numRow > totalNewSpaper) {
            workbook.write('Excel6.xlsx');
        }


        return true;
    } else {
        // console.log(error.message);
        totalNewSpaper--;
        if (numRow > totalNewSpaper) {
            workbook.write('Excel6.xlsx');
        }
        return false;
    }
}