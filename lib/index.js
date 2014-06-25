var request				= require('request'),
	querystring			= require('querystring'),
	extend				= require('./extend');

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
	
	searchMulti: function(query, page, callback, language) {
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
	
		params.api_key = this.apiKey;
		
		if(method === 'GET') {
			uri += '?' + querystring.stringify(params);
		}
		
		request.get(this.baseUrl + uri, function(error, response, body) {
			if(body.length === 0) {
				callback('no body');
				
				return;
			}
		
			var responseData = JSON.parse(body);
						
			if(typeof responseData[rootKey] != 'undefined') {
				callback(null, responseData[rootKey]);
			}
			else {
				callback('root not found');
			}
		});
	}
	
});

module.exports = TheMovieDB;