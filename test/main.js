var path   = require('path');
var fs     = require('fs');
var icons  = require('../');
var gulp   = require('gulp');
var assert = require('assert');

var fixtures     = path.join(__dirname, 'fixtures');
var expectations = path.join(__dirname, 'expected');

describe('gulp-svg-icons', function() {

	describe('works', function() {

		it('should work', function(done) {
			
			var a = icons(path.join(fixtures, 'icons'));
			var files = [];
			
			a.on('data', function(file) {

				files.push(file);
			});
			
			a.on('close', function() {

				files.forEach(function(file) {

					var expected = fs.readFileSync(path.join(expectations, file.relative));
					assert.equal(String(expected), String(file.contents));
				});

				assert.equal(2, files.length);
				done();
			});

			gulp
		        .src(path.join(fixtures, 'html', '*.html'))
		        .pipe(a);
		});
	});
});