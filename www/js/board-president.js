// npm libraries
import navbar from '../js/includes/navbar.js';
import bigboard from '../js/includes/big-board-core.js'
import request from 'superagent';

// global vars
window.pymChild = null;
let dataURL = null;
let data = null;
/*
* Initialize the graphic.
*/
var onWindowLoaded = function() {
    // init pym and render callback
    window.pymChild = new pym.Child();
    bigboard.initBigBoard('presidential-big-board.json', 'President', 'president');
}


/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
