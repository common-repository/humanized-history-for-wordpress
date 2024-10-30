<?php
/*
Plugin Name: Humanized History
Plugin URI: http://projects.radgeek.com/humanized-history-for-wordpress/
Description: Magic endless scrollbars for WordPress archives. Don't force your readers to ask for older posts: just give it to them when they're ready.
Version: 2008.02.10
Author: Charles Johnson
Author URI: http://projects.radgeek.com
License: GPL
*/

add_action('wp_head', 'humanized_history_script_link');
add_action('template_redirect', 'humanized_history_dispatcher');
add_action('admin_notices', 'humanized_history_check_functions');
add_action('loop_end', 'humanized_history_loop_end');

function humanized_history_loop_end () {
	if ((is_home() or is_archive() or is_paged() or is_search()) and !is_feed()) :
?>
<div id="pager-links">
<ul class="navigation">
<li class="prev" id="pager-prev-link"><?php next_posts_link('&laquo; older posts') ?></li>
<?php if (!is_for_humanized_history()) : ?>
<li class="next" id="pager-next-link"><?php previous_posts_link('newer posts &raquo;') ?></li>
<?php endif; ?>
</ul>
</div>
<?php
	endif;
}

function humanized_history_check_functions () {
	if (!function_exists('template_post_display')) :
	?>
	<div class="error">
	<p><strong>Warning:</strong> Before the Humanized History feature can
	work properly, your templates must define a function named
	<code>template_post_display()</code>, which should display a single post
	as it would normally appear on your blog. You can define this function
	using the <a href="theme-editor.php">Theme Editor</a>, probably in
	<code>functions.php</code>.</p>
	</div> <!-- class="error" -->
	<?php
	endif;
}

function humanized_history_script_link () {
	if (is_home() or is_archive() or is_paged() or is_search()) :
		$dir = dirname(__FILE__);

		preg_match(
			'|/wp-content/plugins/.+|',
			$dir,
			$paths
		);
		
		if (isset($paths[0])) :
?>

	<script type="text/javascript" src="<?php bloginfo('home'); ?><?php print htmlspecialchars($paths[0]); ?>/humanized-history.js"></script>
<?php
		endif;
	endif;
}

function is_for_humanized_history () {
	if (isset($_REQUEST['format'])) :
		$fmt = trim($_REQUEST['format'], '/');
	else :
		$fmt = NULL;
	endif;

	return ($fmt==='posts');
}

function humanized_history_dispatcher () {
	if (is_for_humanized_history() and !is_404() and function_exists('template_post_display')) :
		if (have_posts()) :
			header('HTTP/1.1 200 OK');
			while (have_posts()) : the_post();
				template_post_display();
			endwhile;
		else :
			header('HTTP/1.1 404 Not Found');
		endif;
		exit;
	endif;
}
?>
