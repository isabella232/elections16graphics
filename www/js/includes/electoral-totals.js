// npm libraries
import d3 from 'd3';
import request from 'superagent';
import { classify, buildDataURL } from './helpers.js';

// Global vars
var DATA_FILE = 'top-level-results.json';
var LOAD_INTERVAL = 5000;
var isElectoralInit = false;
var electoralData = [];
var allCandidates = null;
var otherCandidates = null;
var electoralElement = null;
var lastRequestTime = null;
var reloadElectoralData = null;
var initialRender = true;

var exports = module.exports = {};

/*
* Initialize the graphic.
*/
exports.initElectoralTotals = function() {
    electoralElement = d3.select('#electoral-totals .total-wrapper');
    loadElectoralData();
    setInterval(loadElectoralData, 5000);
    //console.log('YOU TURNED OFF THE REFRESH INTERVAL');
}


/*
 * Load data
 */
var loadElectoralData = function() {
    request.get(buildDataURL(DATA_FILE))
        .set('If-Modified-Since', lastRequestTime ? lastRequestTime : '')
        .end(function(err, res) {
            if (res.body) {
                lastRequestTime = new Date().toUTCString();
                electoralData = res.body.electoral_college;
                formatElectoralData();
            }
        });
}


/*
 * Format data for D3.
 */
var formatElectoralData = function() {
    if (!isElectoralInit) {
        allCandidates = d3.keys(electoralData);
        otherCandidates = allCandidates.filter(function(d) {
            return d != 'Clinton' && d != 'Trump';
        });
        isElectoralInit = true;
    }

    var candidatesShown = [ 'Clinton', 'Trump' ];
    otherCandidates.forEach(function(d, i) {
        if (electoralData[d] > 0) {
            candidatesShown.push(d);
        }
    });

    electoralElement.html('');
    candidatesShown.forEach(function(d, i) {
        var candidateWrapper = electoralElement.append('div')
            .attr('class', 'candidate ' + classify(d));

        if (candidatesShown.length == 2) {
            electoralElement.classed('top-two', true);
            electoralElement.classed('multiple', false);
            candidateWrapper.append('img')
                .attr('src', function() {
                    if (d == 'Clinton') {
                        return '../assets/clinton-thumb.png';
                    } else if (d == 'Trump') {
                        return '../assets/trump-thumb.png';
                    }
                })
                .attr('alt', 'Illustrated portrait of ' + d);
        } else {
            electoralElement.classed('top-two', false);
            electoralElement.classed('multiple', true);
        }

        var electoralWrapper = candidateWrapper.append('div')
            .attr('class', 'electoral');
        electoralWrapper.append('h3')
            .html(function() {
                var t = d.toUpperCase();
                if (d == 'McMullin') {
                    t = 'McMULLIN';
                }
                if (electoralData[d] >= 270) {
                    t += ' <i class="icon icon-ok"></i>';
                }
                return t;
            });
        electoralWrapper.append('h5')
            .attr('class', classify(d) + '-electoral')
            .text(electoralData[d]);
    });

    // Update iframe
    if (window.pymChild) {
        window.pymChild.sendHeight();
    }

    if (initialRender) {
        initialRender = false;
        window.pymChild.sendMessage('initial-render', 'totals');
    }
}
