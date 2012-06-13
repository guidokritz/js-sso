<?php
require_once dirname( __FILE__ ) . '/classes/TwitterLogin.php';

$tw = new TwitterLogin(
		'',//$key,
		'',//$secret,
		''//$callback_url
);
$tw->init();