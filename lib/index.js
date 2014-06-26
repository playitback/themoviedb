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
		searchMulti:			'search/multi',
		movie:					'movie/:id',
		tv:						'tv/:id',
		tvSeason:				'tv/:id/season/:number'
	};
	this._configuration = null;
	
	// Pre-load
	this.configuration(function() {});
	
};

TheMovieDB.prototype = extend(TheMovieDB.prototype, {

	tag: function(method) {
		return 'TheMovieDB.' + method + ': ';
	},
	
	posterUrl: function(uri) {
		if(!this._configuration) {
			return uri;
		}
		
		return this._configuration.images.base_url + this._configuration.poster_sizes.original + uri;
	},
	
	configuration: function(callback) {
		var self = this;
	
		if(this._configuration) {
			callback(this._configuration);
			
			return;
		}
	
		this.get(this.paths.configuration, function(configuration) {
			self.configuration = configuration;
			
			callback(configuration);
		});
	},
	
	searchMulti: function(query, page, callback, language) {
		var tag = this.tag('searchMulti');
	
		if(typeof query != 'string') {
			throw tag + 'Invalid query specified';
		}
		
		if(typeof page === 'function') {
			callback 	= page;
			page		= 1;
		}
		
		if(typeof callback != 'function') {
			throw tag + 'Invalid callback specified';
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
	
	getMovie: function(movieId, callback) {
		var tag = this.tag('getMovie');
	
		if(typeof movieId != 'number') {
			throw tag + 'Invalid movieId specified';
		}
		
		if(typeof callback != 'function') {
			throw tag + 'Invalid callback specified';
		}
		
		return this.get(this.paths.movie.replace(':id', movieId), callback);
	},
	
	getTv: function(tvId, callback) {
		var tag = this.tag('getTv');
	
		if(typeof tvId != 'number') {
			throw tag + 'Invalid tvId specified';
		}
		
		if(typeof callback != 'function') {
			throw tag + 'Invalid callback specified';
		}
		
		return this.get(this.paths.tv.replace(':id', tvId), callback);
	},
	
	getSeason: function(tvId, number, callback) {
		var tag = this.tag('getSeason');
		
		if(typeof tvId != 'number') {
			throw tag + 'Invalid tvId specified';
		}
		
		if(typeof number != 'number') {
			throw tag + 'Invalid season number specified';
		}
		
		if(typeof callback != 'function') {
			throw tag + 'Invalid callback specified';
		}
		
		return this.get(this.paths.tvSeason.replace(':id', tvId).replace(':number', number), callback);
	},
	
	get: function(uri, params, callback, rootKey) {
		return this.request('GET', uri, params, callback, rootKey);
	},
	
	request: function(method, uri, params, callback, rootKey) {
		var tag = this.tag('request');
	
		if(typeof params === 'function') {
			callback = params;
			
			params = {};
		}
		
		if(typeof callback != 'function') {
			throw tag + 'invalid callback defined';
		}
	
		params.api_key = this.apiKey;
		
		if(method === 'GET') {
			uri += '?' + querystring.stringify(params);
		}
				
		request.get(this.baseUrl + uri, function(error, response, body) {
			if(error) {
				throw error;
			}
		
			if(body.length === 0) {
				callback(null, '');
				
				return;
			}
		
			var responseData = JSON.parse(body);
									
			if(typeof rootKey === 'string' && typeof responseData[rootKey] != 'undefined') {
				callback(null, responseData[rootKey]);
			}
			else if(typeof rootKey != 'string') {
				callback(null, responseData);
			}
			else {
				throw tag + 'Root key not found';
			}
		});
	}
	
});

module.exports = TheMovieDB;