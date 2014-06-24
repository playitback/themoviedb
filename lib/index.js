var http 				= require('http'),
	url					= require('url'),
	querystring			= require('querystring'),
	extend				= require('./extend'),
	CollectionModel 	= require('./model/collection');

var TheMovieDB = function(options) {

	if(typeof options.apiKey === 'undefined') {
		throw 'TheMovieDB apiKey is a required option';
	}
	
	this.baseUrl 	= 'https://api.themoviedb.org/3/';
	this.type		= { movie: 'movie', tv: 'tv', person: 'person' };
	this.apiKey 	= options.apiKey,
	this.paths 		= {
		configuration:			'configuration',
		searchMulti:			'search/multi'
		
	};
	
};

TheMovieDB.prototype = extend(TheMovieDB.prototype, {
	
	configuration: function(callback) {
		this.request(this.paths.configuration, callback);
	},
	
	searchMulti: function(type, query, page, callback, language) {
		if(typeof type != 'string' || typeof this.type[type] != 'string') {
			throw 'TheMovieDB.search: Invalid type specified';
		}
		
		if(typeof query != 'string') {
			throw 'TheMovieDB.search: Invalid query specified';
		}
		
		if(typeof page === 'function') {
			callback 	= page;
			page		= 1;
		}
		
		if(typeof callback != 'function') {
			throw 'TheMovieDB.search: Invalid callback specified';
		}
		
		if(typeof language != 'string') {
			language = 'en';
		}
		
		return this.get(this.paths.searchMulti, {
			query: 			query,
			page: 			page,
			language_code: 	language
		}, callback, 'results');
	},
	
	get: function(uri, params, callback, rootKey) {
		return this.request('GET', uri, params, callback, rootKey);
	},
	
	request: function(method, uri, params, callback, rootKey) {

		if(typeof params === 'function') {
			callback = params;
			
			params = {};
		}
		
		if(typeof callback != 'function') {
			throw 'TheMovieDB: invalid callback defined';
		}
	
		params.api_key = this.api_key;
		
		if(method === 'GET') {
			uri += '?' + querystring.stringify(params);
		}
		
		var options = url.parse(this.baseUrl + uri);
		
		options.method = method;
		
		http.request(options, function(res) {
			var response = '';
			
			res.on('data', function(chunk) {
				response += chunk;
			});
			
			res.on('end', function() {
				if(response.length === 0) {
					callback(true);
					
					return;
				}
			
				var responseData = JSON.parse(response);
				
				if(typeof responseData[rootKey] != 'undefined') {
					callback(null, responseData[rootKey]);
				}
				else {
					callback(true);
				}
			});
			
			if(res.statusCode >= 400) {
				res.end();
			}
		});
		
	}
	
});

module.exports = TheMovieDB;