// npm libraries
import d3 from 'd3';
import request from 'superagent';

// Global vars
window.pymChild = null;
var DATA_FILE = 'top-level-results.json';
var LOAD_INTERVAL = 15000;
var isElectoralInit = false;
var electoralData = [];
var allCandidates = null;
var otherCandidates = null;
var electoralElement = null;
var lastRequestTime = null;
var reloadElectoralData = null;

var exports = module.exports = {};

/*
* Initialize the graphic.
*/
exports.initElectoralTotals = function() {
    electoralElement = d3.select('#electoral-totals .total-wrapper');
    loadElectoralData();
}


/*
 * Load data
 */
var loadElectoralData = function() {
    clearInterval(reloadElectoralData);
    // console.log('loadData: ' + DATA_FILE);
    request.get(buildDataURL(DATA_FILE))
        .set('If-Modified-Since', lastRequestTime ? lastRequestTime : '')
        .end(function(err, res) {
            if (err) {
                console.warn(err);
            }

            lastRequestTime = new Date().toUTCString();
            electoralData = res.body.electoral_college;

            // console.log(electoralData);
            formatElectoralData();
        });
}


/*
 * Render
 */
var render = function(containerWidth) {
    // only run the first time
    if (!isBopInit) {
        bop.initBop(containerWidth);
        isBopInit= true;
    // run onresize
    } else {
        bop.renderBop(containerWidth);
    }
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
                    switch(d) {
                        case 'Clinton':
                            return clintonBase64;
                            break;
                        case 'Trump':
                            return trumpBase64;
                            break;
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

    reloadElectoralData = setInterval(loadElectoralData, LOAD_INTERVAL);

    // Update iframe
    if (window.pymChild) {
        window.pymChild.sendHeight();
    }
}