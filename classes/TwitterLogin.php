<?php
require_once dirname( __FILE__ ) . '/twitteroauth/twitteroauth.php';

class TwitterLogin {
	private $key;
	private $secret;
	private $callback_url;
	private $twitteroauth;
	
	public function __construct( $key, $secret, $callback_url ) {
		@session_start();
		
		$this->key = $key;
		$this->secret = $secret;
		$this->callback_url = $callback_url;
	}
	
	public function init() {
		if ( !empty( $_GET[ 'oauth_verifier' ] ) && !empty( $_SESSION[ 'oauth_token' ] ) && !empty( $_SESSION[ 'oauth_token_secret' ] ) ) {
			$this->get_access_token();
		} else {
			$this->request_token();
		}
	}
	
	private function request_token() {
		$this->twitteroauth = new TwitterOAuth(
				$this->key,
				$this->secret
		);
		$request_token = $this->twitteroauth->getRequestToken( $this->callback_url );
		
		if ( 200 != $this->twitteroauth->http_code || !$request_token[ 'oauth_token' ] || !$request_token[ 'oauth_token_secret' ] )
			self::js_response( json_encode( array( 'success' => FALSE ) ) );
		
		$_SESSION[ 'oauth_token' ] = $request_token[ 'oauth_token' ];
		$_SESSION[ 'oauth_token_secret' ] = $request_token[ 'oauth_token_secret' ];
		
		$url = $this->twitteroauth->getAuthorizeURL( $request_token[ 'oauth_token' ] );
		
		header( 'location: '. $url );
		die();
	}
	
	private function get_access_token() {
		$this->twitteroauth = new TwitterOAuth(
				$this->key,
				$this->secret,
				$_SESSION[ 'oauth_token' ],
				$_SESSION[ 'oauth_token_secret' ]
		);
		$access_token = $this->twitteroauth->getAccessToken( $_GET[ 'oauth_verifier' ] );
		if ( !$access_token )
			self::js_response( json_encode( array( 'success' => FALSE ) ) );
		
		$_SESSION[ 'access_token' ] = $access_token;
		
		$user_info = $this->twitteroauth->get( 'account/verify_credentials' );
		if ( !$user_info )
			self::js_response( json_encode( array( 'success' => FALSE ) ) );
		
		$this->success( $user_info );
	}
	
	private function success( $_user_info ) {
		$full_name = $_user_info->name;
		$_user_info->name = explode( ' ', $_user_info->name );
		$user_info = array(
				'network' => 'twitter',
				'legacy_id' => $_user_info->id_str,
				'first_name' => array_shift( $_user_info->name ),
				'last_name' => implode( ' ', $_user_info->name ),
				'nickname' => $_user_info->screen_name,
				'userphoto' => $_user_info->profile_image_url,
				'full_name' => $full_name
		);
		
		$output = SocialLogin::create_session( 'twitter', $_user_info->id_str, $user_info );
		
		if ( FALSE === $output )
			self::js_response( json_encode( array( 'success' => FALSE ) ) );
		if ( TRUE === $output )
			self::js_response( json_encode( array( 'success' => TRUE ) ) );
		
		self::js_response( json_encode( $output ) );
		
	}
	
	private function js_response( $response ) {
		echo '<!DOCTYPE html><html><body><script>if ( opener && !opener.closed ) { opener.window.Social.tw_popup_callback( ' . $response . ' ); opener.focus(); } window.close();</script></body></html>';
		die();
	}
	
	public function post( $status ) {
		return $this->twitteroauth->post( 'statuses/update', array( 'status' => $status ) );
	}
}