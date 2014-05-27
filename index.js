const PLUGIN_NAME = 'gulp-svg-icons';

var fs     = require('fs');
var path   = require('path');
var extend = require('node.extend');
var gutil  = require('gulp-util');
var map    = require('map-stream');
var Error  = gutil.PluginError;

var error = function(right, message, stop) {

	if (!right) {

		var e = new Error(PLUGIN_NAME, message);

		if (stop) {

			throw e;
		}

		return e;
	}
};

module.exports = function (iconsDir, options) {

	var self = this;

	error(iconsDir.constructor === String, 'Missing iconsDir option', true);
	error(fs.existsSync(iconsDir), 'iconsDir path not found (' + iconsDir + ')', true);

	var settings = extend({
		prefix     : 'icon',
		placeholder: '<!-- icons -->',
		style      : function(name) {

			return 'icon';
		}
	}, options);

	var prefix = settings.prefix.constructor === String 
		? function(name) {

			return settings.prefix + '-' + name;
		}
		: function(name) {

			return name;
		};

	var style        = settings.style;
	var icons        = '';
	var boxes        = {};
	var placeholders = [];

	var stream = map(function(file, done) {

		var contents = String(file.contents);

		if (contents.indexOf(settings.placeholder) > -1) {

			placeholders.push(file);
		}

		file.contents = new Buffer(contents.replace(/<icon-([a-z0-9\-]+)>/gi, function(match, name) {

			var id = prefix(name);

			if (!boxes.hasOwnProperty(name)) {

				var raw = String(fs.readFileSync(path.join(iconsDir, name + '.svg')));

				boxes[name] = /\sviewBox="([0-9\-\s]+)"/.exec(raw)[1];
				icons += '<g id="' + id + '">' + /<svg[^>]*>([\s\S]*?)<\/svg>/gi.exec(raw)[1] + '</g>';
			}

			return '<svg class="' + style(name) + '" viewBox="' + boxes[name] + '"><use xlink:href="#' + id + '"></use></svg>';
		}));

		done(null, file);
	});

	stream.on('end', function() {

		icons = '<svg style="display:none;"><defs>' + icons + '</defs></svg>';

		placeholders.forEach(function(file) {

			file.contents = new Buffer(
				String(file.contents)
				.replace(settings.placeholder, icons)
			);
		});
	});

	return stream;
};
