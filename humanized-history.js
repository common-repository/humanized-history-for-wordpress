// "Humanized History": unobtrusive JavaScript to implement an endless scrollbar
// over a traditional page-chunking interface, as discussed at
// <http://www.humanized.com/weblog/2006/04/25/no_more_more_pages/> and
// <http://www.humanized.com/weblog/2006/04/28/reading_humanized/>.
//
// This implementation requires some glue on the back end; it is designed to
// work as part of the Humanized History for WordPress plugin.
// Cf. <http://projects.radgeek.com/humanized-history-for-wordpress/>.
//
// Styling
// =======
// If you want to change the appearance of the "Getting more content for you..."
// status indicator, then add a rule to your CSS stylesheet for the class
// humanized-history-getting-more. E.g., to create a dark translucent box that
// floats over the footer material below:
//
//     .humanized-history-getting-more {
//         position: absolute;
//         width: auto; height: auto;
//         border: 3px solid #505050;
//         padding: 0.25em 1.0em;
//         background-color: #777777;
//         opacity: 0.85;
//         z-index: 10000;
//     }
//
// Adapting to Other Projects
// ==========================
// If you want to reuse it for other purposes, feel free. But be aware that the
// script, as written, expects for the pages that it has been strapped onto to
// do at least the following things:
// 
// 1. Produces an HTML element with the id "pager-links" where the next page
//    of material should be inserted once it is fetched.
//
// 2. Produces an HTML element with the id "pager-prev-link" which contains an
//    HTML <a href="..."> element, where the href attribute contains the URI of
//    the next page of material.
//
//    In case you're confused, it's named "pager-prev-link" because this was
//    originally written for a blog platform, where everything is in reverse
//    chronological order, so each "next" page contains older, i.e. *previous*,
//    posts. If the inversion of terminology makes your head spin, then apply
//    the appropriate Search-Replace until the spinning stops.
//
// 3. When the parameter is "format=posts" is appended to the next-page URI in
//    #2, the web server should return an HTML snippet, which contains *only*
//    (i) the HTML for the material to be inserted into the present page, and
//    (ii) a new insertion point and "next page", as per #1 and #2.
//
// For example, <http://projects.radgeek.com/> has a link pointing to the next
// page (of older posts) contained in the following structure:
//
//        <div id="pager-links">
//        <ul class="navigation">
//        <li class="prev" id="pager-prev-link"><a href="http://projects.radgeek.com/page/2/">older posts</a></li>
//        </ul>
//        </div>
//
// The URI <http://projects.radgeek.com/page/2/> returns the full-on human-
// readable version of the second page of posts, wrapped in an HTML body
// element, accompanied by an appropriate HTML head element, etc. But
// <http://projects.radgeek.com/page/2/?format=posts> returns an HTML snippet
// containing *only* the HTML for each of the posts on the second page, followed
// by a navigation element exactly like the above, but now pointing to the URI
// <http://projects.radgeek.com/page/3/> for the next link. The posts and the
// navigation element in this snippet are inserted so as to replace the old
// navigation element, wherever it was. (Unless you want some weird-looking
// results, this ought to be at the bottom of the page's content.)
//
// Copyright (c) 2006-2007 by Charles Johnson <http://projects.radgeek.com/>
// Uses code and techniques published by Scott Andrew LePera ((c) 2001),
// Jim Ley ((c) 2002, 2004, 2005), and Humanized, Inc. ((c) 2006), as documented
// in code below.
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the GNU General Public License as published by the Free Software
// Foundation; either version 2 of the License, or (at your option) any later
// version. See <http://www.gnu.org/copyleft/gpl.html> for details.

////////////////////////////////////////////////////////////////////////////////
// Configurable parameters. Tweak if you like. /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var checkInterval = 200 /*milliseconds*/;
var preloadDistance = 1000 /*pixels*/;

////////////////////////////////////////////////////////////////////////////////
// Global status variables. Don't mess. ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var checker;
var isUpdating = false;

////////////////////////////////////////////////////////////////////////////////
// Kludge-tastic: cross-browser compatibility. Sort of. ////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Ecumenical event listener. Largely derived from code by Scott Andrew
// LePera. Cf. <http://www.scottandrew.com/weblog/articles/cbs-events>
//
// If you want to copy and paste this for your own code, you should be
// aware of some caveats about the technique at:
// <http://www.quirksmode.org/blog/archives/2005/08/addevent_consid.html>
// ... which don't impact the way I use the function here, but may
// impact the way that you hope to use it.
//
// Alternate implementations at:
// <http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html>
// <http://dean.edwards.name/weblog/2005/10/add-event2/>
// <http://therealcrisp.xs4all.nl/upload/addEvent_dean.html>
// ... all of which are more complicated than what I need.
if (typeof addEvent != 'function') {
	function addEvent (obj, evType, fn, useCapture) {
		if (obj.addEventListener){
			obj.addEventListener(evType, fn, useCapture);
			return true;
		} else if (obj.attachEvent){
			var r = obj.attachEvent("on"+evType, fn);
			return r;
		} else {
			return false;
		}
	}
}

// Ecumenical XMLHttpRequest. Derived from technique and code presented
// by Jim Ley at <http://www.jibbering.com/2002/4/httprequest.html>
if (typeof get_xmlhttp != 'function') {
	function get_xmlhttp () {
		var xmlhttp=false;
		/*@cc_on @*/
		/*@if (@_jscript_version >= 5)
		// JScript gives us Conditional compilation, we can cope with old IE versions.
		// and security blocked creation of the objects.
			try {
				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (E) {
					xmlhttp = false;
				}
			}
		@end @*/
		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	}
}

// Ecumenical methods for getting page and scrollbar height.
// Derived from <http://www.humanized.com/reader/static/javascript/utils.js>,
// which derived them from code at <http://www.quirksmode.org/viewport/compatibility.html>
if (typeof getPageHeight != 'function') {
	function getPageHeight(){
		var y;
		var test1 = document.body.scrollHeight;
		var test2 = document.body.offsetHeight
		
		 // all but Explorer Mac
		if (test1 > test2) {
			y = document.body.scrollHeight;
		}
		// Explorer Mac; would also work in Explorer 6 Strict, Mozilla and Safari
		else {
			y = document.body.offsetHeight;
		}
		return parseInt(y);
	}
}

if (typeof _getWindowHeight != 'function') {
	function _getWindowHeight(){
		if (self.innerWidth) {
			frameWidth = self.innerWidth;
			frameHeight = self.innerHeight;
		}
		else if (document.documentElement && document.documentElement.clientWidth) {
			frameWidth = document.documentElement.clientWidth;
			frameHeight = document.documentElement.clientHeight;
		}
		else if (document.body) {
			frameWidth = document.body.clientWidth;
			frameHeight = document.body.clientHeight;
		}
		return parseInt(frameHeight);
	}
}

if (typeof getScrollHeight != 'function') {
	function getScrollHeight(){
		var y;
		// all except Explorer
		if (self.pageYOffset) {
			y = self.pageYOffset;
		}
		else if (document.documentElement && document.documentElement.scrollTop) {
			y = document.documentElement.scrollTop;
		}
		 // all other Explorers
		else if (document.body) {
			y = document.body.scrollTop;
		}
		return parseInt(y)+_getWindowHeight();
	}
}

////////////////////////////////////////////////////////////////////////////////
// Do the actual fetching and insert the resulting snippet. ////////////////////
////////////////////////////////////////////////////////////////////////////////

function getMorePosts () {
	var el = document.getElementById('pager-links'); // Insertion point
	var startEl = document.getElementById('pager-prev-link'); // Link to prev page

	if (el && startEl) { // Sanity check: do we have an insertion point and a link to fetch?
		xmlhttp = get_xmlhttp();
		if (xmlhttp) { // Sanity check: did we get an XmlHttpRequest object?
			var uri = null;
			var link = startEl.getElementsByTagName('a');
			for (var i=0; i<link.length; i++) {
				uri = link[i].href;
			}
			if (uri) { // Sanity check: did we get a usable link?
				// This is a rock stupid way to do it.
				if ((uri.indexOf('?format=') == -1) && (uri.indexOf('&format=') == -1)) {
					if (uri.indexOf('?') == -1) {
						uri += '?format=posts'; // no query string
					} else {
						uri += '&format=posts'; // query string not including format
					} // if
				} // if

				// If users style the insertion point to be invisible, make it visisble.
				el.style.display = 'block';
				el.className = 'humanized-history-getting-more';
				el.innerHTML = "<p>Getting more content for you…</p>";
	
				xmlhttp.open("GET", uri, true);
				xmlhttp.onreadystatechange=function() {
					var historyNextWindow = document.getElementById('pager-links');
					if (xmlhttp && xmlhttp.readyState==4) { // HTTP GET completed; resutls ready
						if (xmlhttp.status == 200) {
							// HTTP GET OK. Replace the insertion point with the HTML snippet.
							var newHistory = document.createElement('div');
							historyNextWindow.parentNode.replaceChild(newHistory, historyNextWindow);
							newHistory.innerHTML = xmlhttp.responseText;
							historyNextWindow = null;
						} else if (xmlhttp.status == 404) {
							// Error: Not Found. Get off; it's the end of the line.
							historyNextWindow.setAttribute('id', 'history-next-finished'); // Disable further queries...
							historyNextWindow.innerHTML = '<p>There are no more posts in this view.</p>';
						} else {
							// Some kind of status code that we don't know how to deal with.
							historyNextWindow.setAttribute('id', 'history-next-finished'); // Disable further queries...
							historyNextWindow.innerHTML = '<p>Humanized History error: '+xmlhttp.status+" from "+uri+'</p>';
						}
						isUpdating = false;
					}
				}
				xmlhttp.send('');
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
// Poll the status of the scrollbar to see if we're getting near the bottom. ///
////////////////////////////////////////////////////////////////////////////////

function updatePage () {
	if (!isUpdating && (getPageHeight() - getScrollHeight() < preloadDistance)) {
		isUpdating = true;
		getMorePosts();
	} // if
	clearTimeout(checker);
	checker = setTimeout('updatePage()', checkInterval);
}

function postWindowInit() {
	var el = document.getElementById('pager-links');
	if (el) { // Paged archive
		checker = setTimeout('updatePage()', 0);
	}
}

addEvent(window, 'load', postWindowInit, false);

