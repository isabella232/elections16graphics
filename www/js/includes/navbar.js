import URL from 'url-parse';

var exports = module.exports = {};

exports.parseParentURL = function() {
    if (!pymChild) {
        return null;
    }
    const parentUrl = new URL(window.pymChild.parentUrl, location, true);
    if (parentUrl.hostname == '127.0.0.1') {
        return 'localhost';
    } else {
        return parentUrl.hostname.split('.').slice(-2).join('.');
    }
}

const updateMenuParent = function(e) {
    // Update iframe
    if (pymChild) {
        setTimeout(pymChild.sendHeight, 0);
    }
}

const followNavLink = function(e) {
    const domain = exports.parseParentURL();
    if (e.target.tagName == 'A' && e.target !== e.currentTarget && pymChild && (domain == 'npr.org' || domain == 'localhost')) {
        pymChild.sendMessage('pjax-navigate', e.target.href);
        e.preventDefault();
        e.stopPropagation();
    }
}

var resultsMenuButton = document.querySelector(".small-screen-nav-label");
var resultsMenu = document.querySelector(".menu");
resultsMenuButton.addEventListener("click", updateMenuParent);
resultsMenu.addEventListener("click", followNavLink);

var stateMenuButton = document.querySelector(".state-nav-label");
var stateMenu = document.querySelector(".state-nav");
stateMenu.addEventListener("click", followNavLink);
stateMenuButton.addEventListener("click", updateMenuParent);
