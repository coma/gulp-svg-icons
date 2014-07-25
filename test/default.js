var path   = require('path');
var fs     = require('fs');
var gulp   = require('gulp');
var Icons  = require('../');
var assert = require('assert');

var expectations = path.join(__dirname, 'expectations', 'default');
var fixtures     = path.join(__dirname, 'fixtures');
var svgs         = path.join(fixtures, 'icons');
var html         = path.join(fixtures, 'html');
var icons        = new Icons(svgs);

var replaced = path.join(expectations, 'replace');
var injected = path.join(expectations, 'inject');

describe('default', function() {

	it('replace', function(done) {
		
		var files   = [];
		var replace = icons.replace();
		
		replace.on('data', function(file) {

			files.push(file);
		});
		
		replace.on('close', function() {

			files.forEach(function(file) {

				var expected = fs.readFileSync(path.join(replaced, file.relative));
				assert.equal(String(file.contents), String(expected));
			});

			assert.equal(files.length, 3);
			done();
		});

		gulp
	        .src(path.join(html, '*.html'))
	        .pipe(replace);
	});

	it('inject', function(done) {
		
		var files   = [];
		var inject  = icons.inject();
		
		inject.on('data', function(file) {

			files.push(file);
		});
		
		inject.on('close', function() {

			files.forEach(function(file) {

				var expected = fs.readFileSync(path.join(injected, file.relative));
				assert.equal(String(file.contents), String(expected));
			});

			assert.equal(files.length, 3);
			done();
		});

		gulp
	        .src(path.join(replaced, '*.html'))
	        .pipe(inject);
	});
});