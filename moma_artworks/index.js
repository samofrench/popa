var $ = require('cheerio');
var Parse = require('node-parse-api').Parse;

var options = {
	app_id: 'YA8MqXGhmgCMBLS2VgOj60urBNskHyzQKbLLxZ07',
	api_key: '4jyqxGYhwBqE2D9Dy0noOW0LEAgwb4mMSZUS2Sqm'
};

var parseApp = new Parse(options);

var request = require('request');
var app = require('express')();
var cloudinary = require('cloudinary');
var data = require('./Artworks_short.json');

var DRIZL_CLOUDINARY_CLOUD_NAME = 'artstudiospace';
var DRIZL_CLOUDINARY_API_KEY = '719766595189367';
var DRIZL_CLOUDINARY_API_SECRET = '2d2lu0QgQGKIZPPuPznvc1eg3Ao';
var DRIZL_CLOUDINARY_UPLOAD_PRESET = 'eour0jc5';

cloudinary.config({ 
  cloud_name: DRIZL_CLOUDINARY_CLOUD_NAME, 
  api_key: DRIZL_CLOUDINARY_API_KEY, 
  api_secret: DRIZL_CLOUDINARY_API_SECRET 
});

var i = 0;
var documents = [];
var artwork;

(function loop () {
	artwork = data[i];
	if (parseInt(artwork.Date) >= 1950) {
		setTimeout(function () {
			request('http://moma.org/collection/works/' + artwork.ObjectID, function (error, response, html) {
				i++;
				if(!error && response.statusCode == 200) {
					var parsedHtml = $.load(html);
					parsedHtml('.sov-hero__image-container__image').map(function (i, obj) {
						var srcset = $(obj).attr("srcset");
						srcArray = srcset.split(', ');
						var momaUrl = srcArray[1].split(' ')[0];
						cloudinary.uploader.upload('http://moma.org' + momaUrl, function(result) { 
							// check result for errors

							// add momaUrl to Parse obj
							artwork.ImageUrl = momaUrl;

							// add result.url (cloudinary) to Parse
							// which one to use? Do we need any add'l data?
							artwork.CloudinaryUrl = result.url;

							// change key for Parse
							if (artwork["Width (cm)"]) {
								artwork.Width = artwork["Width (cm)"];
								delete artwork["Width (cm)"];
							};
							
							if (artwork["Height (cm)"]) {
								artwork.Height = artwork["Height (cm)"];
								delete artwork["Height (cm)"];
							};

							parseApp.insert('MOMA', artwork, function (err, resp) {
								if (err) {
									console.log(err);
								} else {
									console.log(resp);
								};
								
								loop();
							});
						});
					})
				} else {
					loop();
				}
			});
		}, 10000)
	} else {
		i++;
		loop();
	}
})();