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
		},
		external   : function(name) {

			return '';
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

	this._icons = '';
	this._collected = [];
};

Icons.prototype._collect = function(name) {

	if (this._collected.indexOf(name) < 1) {

		var raw = String(fs.readFileSync(path.join(this.dir, name + '.svg')));

		this._icons += [
			'<symbol id="',
			 this.prefix(name),
			 '" ',
			 /\s(viewBox="[0-9\-\s\.]+")/.exec(raw)[1],
			 '>',
			 /<svg[^>]*>([\s\S]*?)<\/svg>/gi.exec(raw)[1],
			 '</symbol>'
		 ].join('');

		 this._collected.push(name);
	}
};

Icons.prototype.replace = function() {

	var self  = this;

	return map(function(file, done) {

		var contents = String(file.contents);

		file.contents = new Buffer(contents.replace(/<icon-([a-z0-9\-]+)(?:\s+class="([a-z0-9\-\_ ]*)")?\/?>(?:\s*<\/icon-[a-z0-9\-]+>)?/gi, function(match, name, style) {

			style = style ? ' ' + style : '';
			self._collect(name);

			return [
				'<svg class="',
				self.settings.style(name),
				style,
				'"><use xlink:href="',
				self.settings.external(name),
				'#',
				self.prefix(name),
				'"></use></svg>'
			].join('');
		}));

		done(null, file);
	});
};

Icons.prototype.inject = function() {

	var self = this;
	var icons = '<svg style="display:none;">' + self._icons + '</svg>';

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
