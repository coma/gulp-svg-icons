var icons = require('../');
var gulp = require('gulp');
var assert = require('assert');

var fixtures = __dirname + '/fixtures/';

describe('gulp-svg-icons', function() {

	describe('works', function() {

		it('should save without error', function(done) {

			gulp
	        .src(fixtures + 'html/*.html')
	        .pipe(icons(fixtures + 'icons'));

	        done();

			//assert.equal(-1, [1,2,3].indexOf(5));
		});
	});
});