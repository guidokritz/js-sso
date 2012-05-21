var Social = new function() {
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
		if (conf.useFacebook && conf.useTwitter) {
			this.networks = 2;
		} else if (!conf.useFacebook && !conf.useTwitter) {
			this.networks = 0;
			return;
		} else {
			this.networks = 1;
		}
		
		if (conf.useFacebook) {
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
			if (conf.twitter.callback_url) {
				twttr.anywhere.config({ callbackURL: conf.twitter.callback_url });
			}
			twttr.anywhere(function (tw) {
				instance.TW = tw;
				instance.connected();
			});
		}
	};
	
	this.bind = function(evt, success, failure) {
		switch(evt) {
			case "connect":
				this.events.onConnectSuccess = success;
				this.events.onConnectFailure = failure;
			break;
		}
	};
	
	this.connect = function(network) {
		var instance = this;
		var inter = window.setInterval(function() {
			if (instance.isInitialized()) {
				window.clearInterval(inter);
				if (network=="facebook") {
					instance.FB.login(function(response) {
						if (response.authResponse) {
							instance.FB.api('/me', function(response) {
								if (instance.events.onConnectSuccess)
									instance.events.onConnectSuccess(response);
							});
						} else {
							if (instance.events.onConnectFailure)
								instance.events.onConnectFailure();
						}
					});
				} else if(network=="twitter") {
					instance.TW.signIn();
					if (instance.events.onConnectSuccess) {
						instance.TW.bind('authComplete', function(e, user) {
							instance.events.onConnectSuccess(user);
						});
					}
				}
			}
		}, 250);
	}
	this.log = function( varname ) {
		console.log(this[varname]);
	}
}
