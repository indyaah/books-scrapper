'use strict';

var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var fs = require('fs');
var util = require('util'),
    exec = require('child_process').exec,
    child;

//var download = function (name) {
//    var file = fs.createWriteStream('./temp/' + name + '.pdf');
//    var req = http.get(formUrl(name), function (response) {
//        response.pipe(file);
//        file.on('finish', function () {
//            file.close();
//        });
//    });
//};

var wget = function (name) {
    // download(name);
    var url = formUrl(name);
    console.log('trying -> ' + url);
    child = exec('wget ' + url, function (error, stdout, stderr) {
        return error === null;
    });
};

var tryUpperCase = function (name) {
    if (name !== name.toUpperCase()) {
        return wget(name.toUpperCase().replace('Succinctly'.toUpperCase(), 'Succinctly'));
    }
    return false;
};

var tryMergedNames = function (name) {
    if (contains(name, ' ')) {
        var splits = name.split(" ");
        splits.forEach(function (split) {
            if (wget(split))
                return true;
        });

        for (var i = 0; i < splits.length; i++) {
            if (wget(splits[i] + splits[i + 1]))
                return true;
        }
    }
    return false;
};

var tryToDownload = function (name) {
    var result = wget(removeDots(removeWhiteSpace(removeSharpAndPlus(name))));
    var uppercase = true;
    if (!result)
        uppercase = tryUpperCase(removeDots(removeWhiteSpace(removeSharpAndPlus(name))));
    if (!uppercase)
        tryMergedNames(removeSharpAndPlus(removeDots(removeWhiteSpace(name))));


};

var formUrl = function (name) {
    return 'http://files2.syncfusion.com/Downloads/Ebooks/' + name + '.pdf';
};

var removeDots = function (name) {
    return name.replace(new RegExp('\\.', 'g'), '');
};

var removeWhiteSpace = function (name) {
    return name.replace(new RegExp(' ', 'g'), '_');
};

var removeSharpAndPlus = function (name) {
    return name.replace(new RegExp('#', 'g'), 'sharp').replace(new RegExp('+', 'g'), 'plus');
};


var contains = function (str, find) {
    return str.indexOf(find) != -1;
};
request('http://www.syncfusion.com/resources/techportal/ebooks', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var parsedResults = [];
        $('div.content-small').each(function (i, element) {
            var prev = $(this).prev();
            var name = $(prev).eq(0).text();
            if (contains(name, 'Succinctly')) {
                parsedResults.push(name.trim());
            }
        });
        // Log our finished parse results in the terminal
        parsedResults.forEach(function (name) {
            tryToDownload(name);
        });
    }
});