/**
 * @todo Complete the implementation of Twitter OAuth login.
 * @todo Complete JSDoc.
 */

/**
 * @class
 */
var Social = ( function() {
	
	/**
	 * Initialize Facebook JS SDK.
	 * 
	 * @private
	 * 
	 * @param {Social} instance Class instance.
	 */
	function fb_init( instance ) {
		//Async callback function.
		window.fbAsyncInit = function() {
			FB.init( instance.settings.facebook );
			instance.FB = FB;
			instance.init_completed();
		};

		//Load Facebook JS SDK
		( function(d){
			var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/es_ES/all.js";
			ref.parentNode.insertBefore(js, ref);
		}(document) )
	};
	
	/**
	 * Initialize Twitter JS SDK.
	 * 
	 * @private
	 * 
	 * @param {Social} instance Class instance.
	 */
	function tw_init( instance ) {
		//Nothing to do here
	};
	
	return new function() {

		this.ERRORS				= {
			POPUP_BLOCKED : 1000
		};

		this.settings			= {
			useFacebook: true,
			useTwitter: false,
			lang: 'en_US'
		}
		this.events				= {};
		this.TW						= null;
		this.FB						= null;
		this.initialized	= false;
		this.networks			= 2;
		this.ready				= 0;

		/**
		 * Network SDK initializarion completed.
		 * If all the networks initialization had completed trigger the 'load' event.
		 */
		this.init_completed = function() {
			this.ready += 1;
			if ( this.ready == this.networks ) {
				this.initialized = true;
				this.dispatch( 'load' );
			}
		};
	
		/**
		 * Return initialized status.
		 * 
		 * @return <Boolean>
		 */
		this.isInitialized = function() {
			return this.initialized;
		};

		/**
		 * Initialize SDKs.
		 * 
		 * @param {Object} [options]
		 */
		this.init = function( options ) {
			var	instance	= this
				,	conf			= this.settings;
				
			for ( var attrname in options )
				conf[ attrname ] = options[ attrname ];
			
			instance.networks = 0;

			if ( conf.useFacebook ) {
				instance.networks++;
				fb_init( instance );
			}

			if ( conf.useTwitter ) {
				instance.networks++;
				tw_init( instance );
			}
		};

		/**
		 * Attach a handler to an event.
		 * 
		 * @param {String} evt Event name.
		 * @param {Function} fn Callback function.
		 */
		this.bind = function( evt, fn ) {
			if ( !this.events[ evt ] )
				this.events[ evt ] = [];
			this.events[ evt ].push( fn );
		};

		/**
		 * Deattach a handler from an event.
		 * 
		 * @param {String} evt Event name.
		 * @param {Function} fn Callback function.
		 */
		this.unbind = function( evt, fn ) {
			if ( !this.events[ evt ] )
				return;
			for ( var i = 0 ; i < this.events[ evt ].length ; i++ )
				if ( this.events[ evt ][ i ] == fn )
					this.events[ evt ].splice( i, 1 );
		};

		/**
		 * Dispatch an event or group or events.
		 * Optionally, you can add any number of arguments to pass to the callbacks.
		 * 
		 * @param {String|String[]} evts Event name or array of event names.
		 */
		this.dispatch = function( evts ) {
			if ( !( evts instanceof Array ) )
				evts = [ evts ];

			var args = [].splice.call( arguments, 1 );

			for ( var i in evts )
				for ( var cb in evt = this.events[ evts[i] ] )
					evt[ cb ].apply( this, args );
		};

		/**
		 * Connect to a network.
		 * 
		 * @param {String} network Network ID.
		 */
		this.connect = function( network ) {
			var	instance	= this
				,	conf			= this.settings;
			
			//Wait until the instance initialization is completed.
			var inter = window.setInterval(function() {
				if ( !instance.isInitialized() )
					return;
				
				window.clearInterval(inter);
				if (network=="facebook") {
					instance.FB.login(function(response) {
						if (response.authResponse) {
							instance.FB.api('/me', function(response) {
								instance.dispatch( [ 'fb_connect_success', 'connect_success' ], response );
							});
						} else {
							instance.dispatch( [ 'fb_connect_error', 'connect_error' ] );
						}
					});
				} else if(network=="twitter") {
					instance.tw_popup_timeout = setTimeout( function() {
						if ( instance.tw_popup.closed ) {
							clearTimeout( instance.tw_popup_timeout );
							delete( instance.tw_popup_timeout );
							delete( instance.tw_popup_callback );
							delete( instance.tw_popup );
							instance.dispatch( [ 'tw_connect_error', 'connect_error' ], instance.ERRORS.POPUP_BLOCKED );
						}
					}, 1000 );
					instance.tw_popup = window.open( conf.twitter.req_url, 'tw_connect_popup', 'width=800,height=500,toolbar=no,menubar=no,scrollbars=no,status=1,', true  );
					instance.tw_popup_callback = function( success ) {
						if ( success ) {
							instance.dispatch( [ 'tw_connect_success', 'connect_error' ] );
						} else {
							instance.dispatch( [ 'tw_connect_error', 'connect_error' ] );
						}
					};
				}
			}, 250);
		};
		
		/**
		 * Log to console.
		 */
		this.log = function() {
			if ( window.console )
				console.log( arguments );
		};
		
	}
} )();
