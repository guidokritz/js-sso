/**
 * @todo Improve the way event's callbacks are called.
 * @todo Complete the implementation of Twitter OAuth login.
 * @todo Complete JSDoc.
 */


var Social = new function() {
	this.ERRORS = {
		POPUP_BLOCKED : 1000
	};
	this.settings = {
		useFacebook: true,
		useTwitter: true,
		lang: 'en_US'
	}
	this.events = {};
	this.TW = null;
	this.FB = null;
	this.initialized = false;
	this.networks = 2;
	this.ready = 0
		
	this.connected = function() {
		this.ready += 1;
		if (this.ready == this.networks) {
			this.initialized = true;
			if (this.settings.onLoad) {
				this.settings.onLoad();
			}
		}
	};
	this.isInitialized = function() {
		return this.initialized;
	};
	
	this.init = function( options ) {
		var instance = this, conf = this.settings;
		for (var attrname in options) { conf[attrname] = options[attrname]; }
		instance.networks = 0;
				
		if (conf.useFacebook) {
			instance.networks++;
			window.fbAsyncInit = function() {
	  		FB.init(instance.settings.facebook);
				instance.FB = FB;
				instance.connected();
			};
			
			// Carga el SDK
	  	(function(d){
	    	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	    	if (d.getElementById(id)) {return;}
	     	js = d.createElement('script'); js.id = id; js.async = true;
	     	js.src = "//connect.facebook.net/es_ES/all.js";
	     	ref.parentNode.insertBefore(js, ref);
	   	}(document))
		}
		
		if (conf.useTwitter) {
			instance.networks++;
		}
	};
	
	this.bind = function( evt, fn ) {
		if ( !this.events[ evt ] )
			this.events[ evt ] = [];
		this.events[ evt ].push( fn );
	};
	
	this.unbind = function( evt, fn ) {
		if ( !this.events[ evt ] )
			return;
		for ( var i = 0 ; i < this.events[ evt ].length ; i++ )
			if ( this.events[ evt ][ i ] == fn )
				this.events[ evt ].splice( i, 1 );
	};
	
	this.connect = function(network) {
		var instance = this, conf = this.settings;
		var inter = window.setInterval(function() {
			if (instance.isInitialized()) {
				window.clearInterval(inter);
				if (network=="facebook") {
					instance.FB.login(function(response) {
						if (response.authResponse) {
							instance.FB.api('/me', function(response) {
								for ( var cb in instance.events.fb_connect_success )
									instance.events.fb_connect_success[ cb ]( response );
								for ( var cb in instance.events.connect_success )
									instance.events.connect_success[ cb ]( response );
							});
						} else {
							for ( var cb in instance.events.fb_connect_error )
								instance.events.fb_connect_error[ cb ]();
							for ( var cb in instance.events.connect_error )
								instance.events.connect_error[ cb ]();
						}
					});
				} else if(network=="twitter") {
					instance.tw_popup_timeout = setTimeout( function() {
						if ( instance.tw_popup.closed ) {
							clearTimeout( instance.tw_popup_timeout );
							delete( instance.tw_popup_timeout );
							delete( instance.tw_popup_callback );
							delete( instance.tw_popup );
							for ( var cb in instance.events.tw_connect_error )
								instance.events.tw_connect_error[ cb ]( instance.ERRORS.POPUP_BLOCKED );
							for ( var cb in instance.events.connect_error )
								instance.events.connect_error[ cb ]( instance.ERRORS.POPUP_BLOCKED );
						}
					}, 1000 );
					instance.tw_popup = window.open( conf.twitter.req_url, 'tw_connect_popup', 'width=800,height=500,toolbar=no,menubar=no,scrollbars=no,status=1,', true  );
					instance.tw_popup_callback = function( success ) {
						if ( success ) {
							for ( var cb in instance.events.tw_connect_success )
								instance.events.tw_connect_success[ cb ]();
							for ( var cb in instance.events.connect_success )
								instance.events.connect_success[ cb ]();
						} else {
							for ( var cb in instance.events.tw_connect_error )
								instance.events.tw_connect_error[ cb ]();
							for ( var cb in instance.events.connect_error )
								instance.events.connect_error[ cb ]();
						}
					};
				}
			}
		}, 250);
	}
	this.log = function( varname ) {
		if ( window.console )
			console.log(this[varname]);
	}
}
