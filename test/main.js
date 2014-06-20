var path   = require('path');
var fs     = require('fs');
var gulp   = require('gulp');
var Icons  = require('../');
var assert = require('assert');

var expectations = path.join(__dirname, 'expectations');
var fixtures     = path.join(__dirname, 'fixtures');
var svgs         = path.join(fixtures, 'icons');

describe('gulp-svg-icons', function() {

	var icons = new Icons(svgs);

	describe('replace', function() {

		it('should work', function(done) {
			
			var files = [];
			var replace = icons.replace();
			
			replace.on('data', function(file) {

				files.push(file);
			});
			
			replace.on('close', function() {

				files.forEach(function(file) {

					var expected = fs.readFileSync(path.join(expectations, file.relative));
					assert.equal(String(file.contents), String(expected));
				});

				assert.equal(3, files.length);
				done();
			});

			gulp
		        .src(path.join(fixtures, 'html', '*.html'))
		        .pipe(replace);
		});
	});

	describe('inject', function() {

		it('should work', function(done) {
			
			var last;
			var inject = icons.inject();
			
			inject.on('data', function(file) {

				last = file;
			});
			
			inject.on('close', function() {

				var expected = fs.readFileSync(path.join(expectations, last.relative));
				assert.equal(String(expected), String(last.contents));

				done();
			});

			gulp
		        .src(path.join(expectations, 'last.html'))
		        .pipe(inject);
		});
	});
});

describe('gulp-svg-icons external', function() {

	var uri   = '/icons.svg';
	var icons = new Icons(svgs, {
		external: function(name) {

			return uri;
		}
	});

	describe('replace', function() {

		it('should work', function(done) {
			
			var file;
			var replace = icons.replace();
			
			replace.on('data', function(c) {

				file = c;
			});
			
			replace.on('close', function() {

				assert.equal(String(file.contents), '<svg class="icon"><use xlink:href="' + uri + '#icon-clock"></use></svg>');
				done();
			});

			gulp
		        .src(path.join(fixtures, 'html', 'c.html'))
		        .pipe(replace);
		});
	});
});