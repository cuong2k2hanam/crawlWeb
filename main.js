const cheerio = require('cheerio');
const request = require('request-promise');
var excel = require('excel4node');

const $ = cheerio.load('<h2 class="title">Hello Cuong</h2>');

console.log($('h2.title').text());


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

        for (let i = 3; i <= 3; i++) {

            request(totalLink[i], (error, response, html) => {

                loadLink(error, response, html);

            });
        }
    }
});



var loadLink = (error, response, html) => {
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

        for (let i = 0; i < l; i++) {

            // var detailLink = []

            request(totalLink[i], (error, response, html) => {

                var detail = loadResult(error, response, html);
                if (detail === -1) {
                    console.log("Err: " + totalLink[i]);
                } else {
                    // detailLink.push(totalLink[i])
                    // detailLink.push(detail)
                    // totalDetailLink.push(detailLink);
                    // console.log(i);

                }
                // console.log(i);
            });
        }

        // console.log("Het");

    }
}

var loadResult = (error, response, html) => {
    // console.log(response.statusCode);
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        if ($('.list-group-item.doi').text().split('DOI:')[1] = undefined) {
            return -1;
        }
        var object = {
            name: $('title').text().trim().split('\n')[0],
            numberNewSpaper: $('.panel-body a.title').text().trim(),
            date: $('.date-published').text().split(':')[1].trim(),
            doi: $('.list-group-item.doi').text().split('DOI:')[1].trim()
        }

        console.log(JSON.stringify(object));


        worksheet.cell(numRow, 1).string(object.name).style(style);
        worksheet.cell(numRow, 2).string(object.numberNewSpaper).style(style);
        worksheet.cell(numRow, 3).string(object.date).style(style);
        worksheet.cell(numRow, 4).string(object.doi).style(style);

        numRow++

        workbook.write('Excel.xlsx');

        return object;
    } else {
        return -1;
    }
}