=== Humanized History for WordPress ===
Contributors: Charles Johnson
Author URI: http://projects.radgeek.com/
Plugin URI: http://projects.radgeek.com/humanized-history-for-wordpress/
Donate link: http://projects.radgeek.com/humanized-history-for-wordpress/
Tags: pages, usability, interface, humanized history
Requires at least: 2.0
Tested up to: 2.3.3

Readers with JavaScript can scroll back automagically through your entire archives without "older posts" links.

== Description ==

This plugin implements a ["Humanized History"][1] feature for WordPress
archives, using some PHP glue on the back end and some unobtrusive
JavaScript on the front-end. In JavaScript-enabled browsers, Humanized
History eliminates the need for users to click on "previous posts" links to
read back through your archives; instead, when users get near the bottom of
the current page of posts, the included JavaScript automatically displays
more posts for them at the bottom of the page, providing a magic endless
scrollbar that scrolls through your entire archives, in place of traditional
page chunking.

Search robots and browsers without JavaScript enabled will see the same old
pages with previous page/next page links, so you lose nothing in accessibility
or friendliness to search engines.

The plugin was inspired by the discussion of the concept by Aza Raskin at
[Humanized (2006-04-25): No More Pages?][1]. To see a sample of the feature as
implemented in WordPress, go to <http://projects.radgeek.com/> and scroll down
toward the bottom of the page.

  [1]: http://www.humanized.com/weblog/2006/04/25/no_more_more_pages

Don't make your readers ask you for more content. *Just give it to them.*

== Installation ==

Humanized History requires a working installation of WordPress. It has been
tested with several versions of WordPress 2.x; I can't promise compatability
with older versions of WordPress, but if you've tried it successfully, I'd be
glad to hear about it.

To install the plugin:

1. Create a subdirectory named `humanized-history` in the `plugins` directory of
   your WordPress blog.
   
2. Put copies of `humanized-history.js` and `humanized-history.php` in the
   `humanized-history` subdirectory.
   
3. Add a new function to your `functions.php` template file named
   `template_post_display()`, which should display the contents of a single post
   however they are normally displayed on your blog's front page and archive
   pages. (This should usually just be copied and pasted from the post loop of
   your `index.php` template or your `archive.php` template.)

4. In the WordPress Dashboard, go to Plugins and activate the Humanized History
   plugin.
   
== Templates and Styling ==

If your `index.php` and `archive.php` templates provide previous page / next
page links at the bottom of the content, you will probably want to remove these
links from your templates. The plugin automatically provides its own previous
page / next page links at the bottom of the front page and archive pages.

Many WordPress templates (including the default "Kubrick" template) display
posts differently depending on whether they are in archives or in search
results. "Kubrick," for example, doesn't display the post's contents in search
results. If you want to keep different formats for displaying archives as
against search results, then use code something like this in your
`template_post_display()` function:

    function template_post_display () {
        if (is_search()) {
	    // display post for paged search results
	} else {
	    // display post for paged archives
	}
    }

You may also want to add some styling to your template's stylesheet for the
navigation links that the plugin automatically generates. Here is what I use to
display the "older posts" link at the far left side of the content column, and
the "newer posts" link at the far right side on the same line:

    #content .navigation {
        display: block; position: relative; list-style: none;
        text-align: center;
        margin-top: 10px; margin-bottom: 60px; margin-left: 0px; margin-right: 0px;
        padding: 0;
    }

    #content .navigation .prev {
        display: block; position: relative; list-style: none;
        top: 0; bottom: auto; left: 0; right: auto; width: 45%;
        margin: 0; padding: 0;
        text-align: left;
    }

    #content .navigation .next {
        display: block; position: absolute; list-style: none;
        top: 0; bottom: auto; left: auto; right: 0; width: 45%;
        margin: 0; padding: 0;
        text-align: right;
    }

If you want to change the appearance of the "Getting more content for you..."
status indicator, then add a rule to your CSS stylesheet for the class
`humanized-history-getting-more`. E.g., to create a dark translucent box that
floats over the footer material below:

    .humanized-history-getting-more {
        position: absolute;
        width: auto; height: auto;
        border: 3px solid #505050;
        padding: 0.25em 1.0em;
        background-color: #777777;
        opacity: 0.85;
        z-index: 10000;
    }

== Feedback ==

Comments, questions, applause, brickbats, and bug reports should be directed to
Charles Johnson at <technophilia@radgeek.com>. Other ways to get in touch with
me can be found through my web page at <http://radgeek.com/contact>. If you have
a bug or odd behavior to report, please be sure to include as much of the
following information as you can ascertain:

* The version of the Humanized History plugin you are using
* The version of WordPress you are using
* The version of PHP that you are using

Enjoy!

== License ==

The Humanized History for WordPress plugin is copyright © 2007-2008 by Charles
Johnson. This program is free software; you can redistribute it and/or modify it
under the terms of the [GNU General Public License][] as published by the Free
Software Foundation; either version 2 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

  [GNU General Public License]: http://www.gnu.org/copyleft/gpl.html

