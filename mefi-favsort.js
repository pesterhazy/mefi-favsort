// Adds a link to the post to sort an AskMeFi by favorites.
// This can be useful for questions with many answers that
// do not refer to each other.
//
// Usage: when the userscript is loaded, click on the link
// "sort by favorites". Only works on ask.metafilter.com.
//
// Written as a script for Chrome, but should work
// in Greasemonkey for Firefox as well.
//
// Comments welcome at pesterhazy@gmail.com
//
// ==UserScript==
// @name          mefi-favsort
// @namespace     google
// @author        Paulus Esterhazy
// @description   Sort Metafilter comments by number of favorites
// @include       http://ask.metafilter.com/*
// @version				001
// @require 			http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js
// ==/UserScript==

try{
	// a function that loads jQuery and calls a callback function when jQuery has finished loading
	function addJQuery(callback) {
		var script = document.createElement("script");
		script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
		script.addEventListener('load', function() {
			var script = document.createElement("script");
			script.textContent = "(" + callback.toString() + ")();";
			document.body.appendChild(script);
		}, false);
		document.body.appendChild(script);
	}

	// load jQuery and execute the main function
	addJQuery(main);

	// hide the black banner at the top of Google Reader
	function main() {
    $("#page>div.copy>span.smallcopy").first().append("<span>sort by <a id='sortByDate' href='#'>date</a> | <a id='sortByFav' href='#'>favorites</a></span>");
    $("#sortByDate").click(function(evt){evt.preventDefault(); sortBy("date");});
    $("#sortByFav").click(function(evt){evt.preventDefault(); sortBy("fav");});

    window.originalComments = collectGroups();

    function getFavorites(divComment) {
      var html = divComment.find("span").filter(function(){return this.id.match(/^favcnt/);}).first().find("a").html();
      var m;

      if ( !html ) {
        return 0;
      }
      else {
        m = html.match(/^(\d*) favorite/);
        if (m) {
          return m[1];
        }
        else {
          return 0;
        }
      }
    }

    function collectGroups() {
      var comments=[];

      $("div.comments").filter(function(){return this.id.match(/^c\d*$/);}).each(function() {
        var divComment = $(this);
        var group = [divComment.prev(), divComment, divComment.next(), divComment.next().next()];
        var nFavorites = getFavorites(divComment);

        comments.push({group: group, nFavorites: nFavorites});
      });

      return comments;
    }

    function sortBy(by) {
      var theOneAfter = $("#newcomments");

      window.originalComments.forEach(function(comment){
        comment.group.forEach(function($groupElement){
          $groupElement.remove();
        });
      });

      if ( by == "fav" ) {
        comments = window.originalComments.slice(0); // shallow clone array

        comments.sort(function(a,b){
          a = parseInt(a.nFavorites,10);
          b = parseInt(b.nFavorites,10);
          if (a < b)
            return -1;
          if (a > b)
            return 1;
          return 0;
        }).reverse();
      }
      else
        comments = window.originalComments;


      comments.forEach(function(comment){
        comment.group.forEach(function($element){
          theOneAfter.before($element);
        });
      });
    }
	}
} catch(e) {
	console.log("Failed loading userscript");
}
