const PLUGIN_NAME = 'gulp-svg-icons';

var fs     = require('fs');
var path   = require('path');
var extend = require('node.extend');
var gutil  = require('gulp-util');
var map    = require('map-stream');
var Error  = gutil.PluginError;

var error = function(right, message) {

	if (!right) {

		throw new Error(PLUGIN_NAME, message);
	}
};

var Icons = function(dir, options) {

	error(dir.constructor === String, 'Missing iconsDir option', true);
	error(fs.existsSync(dir), 'iconsDir path not found (' + dir + ')', true);

	var settings = extend({
		prefix     : 'icon',
		placeholder: '<!-- icons -->',
		style      : function(name) {

			return 'icon';
		}
	}, options);

	this.dir = dir;
	this.settings = settings;
	this.prefix = settings.prefix.constructor === String 
		? function(name) {

			return settings.prefix + '-' + name;
		}
		: function(name) {

			return name;
		};

	this._init();
};

Icons.prototype._init = function(name) {

	this.boxes = {};
	this.icons = '';
};

Icons.prototype._getBox = function(name) {

	if (!this.boxes.hasOwnProperty(name)) {

		var raw = String(fs.readFileSync(path.join(this.dir, name + '.svg')));

		this.boxes[name] = /\sviewBox="([0-9\-\s]+)"/.exec(raw)[1];
		this.icons += '<g id="' + this.prefix(name) + '">' + /<svg[^>]*>([\s\S]*?)<\/svg>/gi.exec(raw)[1] + '</g>';
	}

	return this.boxes[name];
};

Icons.prototype.replace = function() {

	var self  = this;

	return map(function(file, done) {

		var contents = String(file.contents);

		file.contents = new Buffer(contents.replace(/<icon-([a-z0-9\-]+)\/?>(\s*<\/icon-[a-z0-9\-]+>)?/gi, function(match, name) {

			return '<svg class="' + self.settings.style(name) + '" viewBox="' + self._getBox(name) + '"><use xlink:href="#' + self.prefix(name) + '"></use></svg>';
		}));

		done(null, file);
	});
};

Icons.prototype.inject = function() {

	var self = this;
	var icons = '<svg style="display:none;"><defs>' + self.icons + '</defs></svg>';

	var stream = map(function(file, done) {

		file.contents = new Buffer(
			String(file.contents)
			.replace(self.settings.placeholder, icons)
		);

		done(null, file);
	});

	stream.on('end', function() {

		self._init();
	});

	return stream;
};

module.exports = Icons;
