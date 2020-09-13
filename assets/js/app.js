var blocks = '<div id="{symbolName}" data-unitPlaces="{unitPlaces}" data-addressPrefix="{addressPrefix}" class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-4 coin">' +
    '<div class="box">' +
    ' <div class="ribbon-wrapper d-none">  <div class="ribbon red">New</div> </div>' +
    '<div class="icon" style="background: #e1eeff;">' +
    '<img src="assets/img/coins/{imageName}" width="40" height="40">' +
    '</div>' +
    '<h4 class="title"><a target="_blank" href="{url}">{name} </a></h4>' +
    '<div class="graph"><div class="chart" data-toggle="tooltip" data-placement="bottom" title="Difficulty" data-sparkline="0,{sparkline}"></div></div>' +
    '<p class="description " id="stats">' +
    'Miners: <span class="float-right">{miners}</span>' +
    '<br>' +
    'Solo miners: <span class="float-right">{soloMiners}</span>' +
    '<br>' +
    'Network Hash Rate: <span class="float-right">{lastBlock}</span>' +
    '<br>' +
    'Pool Hash Rate: <span class="float-right">{propHashRate}</span>' +
    '<br>' +
    'Solo Hash Rate: <span class="float-right">{soloHashRate}</span>' +
    '<br>' +
    'Blocks Found Every: <span class="float-right">{blockSolvedTime}</span>' +
    '<br>' +
    'Last Block Found: <span class="float-right">{lastBlockFound}</span>' +
    '<br>' +
    'Algorithm: <span class="float-right">{algo}</span>' +
    '<br>' +
    'Pool Fee: <span class="float-right">{fee}%</span>' +
    '<br>' +
    'Estimate price: <span class="float-right price">0 USD</span>' +
    '<br>' +
    '</p>' +
    '<br>' +
    '<p class="description text-center">' +
    '<a target="_blank" class="btn btn-primary" href="{url}">Start mining now!</a>' +
    '<a href="javascript:void(0);" class="btn btn-link genwallet ml-2 {hidden}" data-target=".bd-example-modal-lg" data-toggle="tooltip" title="Wallet generator"><svg width="1.4em" height="1.4em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill-rule="evenodd" d = "M3.5 5a.5.5 0 00-.5.5v2h5a.5.5 0 01.5.5c0 .253.08.644.306.958.207.288.557.542 1.194.542.637 0 .987-.254 1.194-.542.226-.314.306-.705.306-.958a.5.5 0 01.5-.5h5v-2a.5.5 0 00-.5-.5h-13zM17 8.5h-4.551a2.678 2.678 0 01-.443 1.042c-.393.546-1.043.958-2.006.958-.963 0-1.613-.412-2.006-.958A2.679 2.679 0 017.551 8.5H3v6a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-6zm-15-3A1.5 1.5 0 013.5 4h13A1.5 1.5 0 0118 5.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 14.5v-9z" clip - rule="evenodd" ></path>' +
    '</svg>Paper wallet</a>' +
    '</p>' +
    '</div>' +
    '</div>'
    ;


function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function getReadableHashRateString(hashrate) {
    var i = 0;
    var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH'];
    while (hashrate > 1000) {
        hashrate = hashrate / 1000;
        i++;
    }
    if (typeof hashrate != 'number')
        hashrate = 0;
    return hashrate.toFixed(2) + byteUnits[i];
}

function getReadableTime(seconds) {
    var units = [
        [60, 'second'],
        [60, 'minute'],
        [24, 'hour'],
        [7, 'day'],
        [4, 'week'],
        [12, 'month'],
        [1, 'year']
    ];

    function formatAmounts(amount, unit) {
        var rounded = Math.round(amount);
        var unit = unit + (rounded > 1 ? 's' : '');
        return '' + rounded + ' ' + unit;
    }

    var amount = seconds;
    for (var i = 0; i < units.length; i++) {
        if (amount < units[i][0]) {
            return formatAmounts(amount, units[i][1]);
        }
        amount = amount / units[i][0];
    }
    return formatAmounts(amount, units[units.length - 1][1]);
}

function home_GetGraphData(rawData) {
    var graphData = {
        names: [],
        values: []
    };
    if (rawData) {
        for (var i = 0, xy; xy = rawData[i]; i++) {
            graphData.names.push(new Date(xy[0] * 1000).toLocaleString());
            graphData.values.push(xy[1]);
        }
    }
    return graphData;
}

function toFixed(x) {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x;
}

let totalMiners = totalWorkers = 0;
function fetchStats() {
    //$('.coin').remove();
    $.getJSON('pools.json?v=20200909', function (data) {
        var pools = data;

        var poolsSec = $.getJSON('letshash.online.json', function (data) {
            for (var key in data.pools) {
                if (data.pools.hasOwnProperty(key) && pools[data.pools[key].symbol] !== undefined && pools[data.pools[key].symbol].active) {
                    var opool = pools[data.pools[key].symbol];
                    var fakedata = {
                        config: {
                            symbol: data.pools[key].symbol,
                            cnAlgorithm: data.pools[key].algorithm,
                            coinDifficultyTarget: data.pools[key].networkDiff,
                            fee: 0
                        },
                        pool: {
                            lastBlockFound: '',
                            hashrateString: data.pools[key].hashrateString,
                            miners: data.pools[key].minerCount,
                            workers: data.pools[key].workerCount,
                            minersSolo: 0,
                            workersSolo: 0,
                            hashrateSolo: 0,
                            blockSolvedTime: '-'
                        },
                        network: {
                            difficultyString: data.pools[key].poolStats.networkSolsString
                        },
                        charts: {
                            difficulty: {}
                        }
                    };
                    process(fakedata, pools);

                }
            }
        });

        for (var key in pools) {
            if (pools.hasOwnProperty(key) && pools[key].active) {
                $.getJSON(pools[key].api, function (data) {
                    process(data, pools);
                });
            }
        }
    });
};
fetchStats();

function process(data, pools) {
    var symbol = data.config.symbol;
    var coin = pools[symbol];

    var lastBlockFound = '-'
    if (data.pool.lastBlockFound) {
        var d = new Date(parseInt(data.pool.lastBlockFound)).toISOString();
        lastBlockFound = $.timeago(d);
    }

    var b = blocks
        .replace(/{url}/g, coin.url)
        .replace(/{addressPrefix}/g, coin.addressPrefix)
        .replace(/{unitPlaces}/g, coin.unitPlaces)
        .replace(/{symbolName}/g, symbol)
        .replace(/{name}/g, coin.name.toUpperCase())
        .replace(/{imageName}/g, coin.img)
        .replace(/{algo}/g, coin.algo || data.config.cnAlgorithm)
        .replace(/{lastBlock}/g, data.network.difficulty ? getReadableHashRateString(data.network.difficulty / data.config.coinDifficultyTarget) + "/sec" : data.network.difficultyString)
        .replace(/{fee}/g, data.config.fee)
        .replace(/{blockSolvedTime}/g, data.pool.blockSolvedTime ? data.pool.blockSolvedTime : getReadableTime(data.network.difficulty / data.pool.hashrate))
        .replace(/{miners}/g, data.pool.miners + ' (' + data.pool.workers + ' workers)')
        .replace(/{soloMiners}/g, (typeof data.pool.minersSolo !== "undefined" ? data.pool.minersSolo + ' (' + data.pool.workersSolo + ' workers)' : 'n/a (n/a workers)'))
        .replace(/{propHashRate}/g, data.pool.hashrate ? getReadableHashRateString(data.pool.hashrate) + '/sec' : data.pool.hashrateString)
        .replace(/{soloHashRate}/g, getReadableHashRateString(data.pool.hashrateSolo) + '/sec')
        .replace(/{lastBlockFound}/g, lastBlockFound)
        .replace(/{sparkline}/g, home_GetGraphData(data.charts.difficulty).values)
        .replace(/{hidden}/g, coin.addressPrefix > 0 ? '' : 'd-none')
        ;

    totalMiners += data.pool.miners;
    totalWorkers += data.pool.workers;
    if (typeof data.pool.minersSolo !== "undefined") {
        totalMiners += data.pool.minersSolo;
        totalWorkers += data.pool.workersSolo;
    }


    $('#totalMiners').html(totalMiners);
    $('#totalWorkers').html(totalWorkers);

    if (coin.new) {
        b = b.replace('ribbon-wrapper d-none', 'ribbon-wrapper');
    }

    $(b).appendTo('#pools');
    var listitems = $('#pools').children('#pools .coin').get();
    listitems.sort(function (a, b) {
        return $(a).find('.title a').text().toUpperCase().localeCompare($(b).find('.title a').text().toUpperCase());
    });

    $.each(listitems, function (index, item) {
        $('#pools').append(item);
    });

    var sparkline = $('#' + symbol).find('.chart');
    if (sparkline.data('sparkline')) {
        var sparklineData = sparkline.data('sparkline').split(',');
        sparklineData.shift();

        if (sparklineData.length < 2) {
            sparklineData.push(sparklineData[0]);
        }

        sparkline.sparkline(sparklineData, {
            type: "line",
            disableTooltips: true,
            disableHighlight: true,
            width: '100%',
            lineColor: "#0cc2ff",
            fillColor: false,
            spotColor: false,
            minSpotColor: false,
            maxSpotColor: false
        });
    }

    $('[data-toggle="tooltip"]').tooltip();

    $.getJSON('https://api.exchangerate.host/latest?source=crypto&places=15&base=USD&symbols=' + symbol, function (data) {
        if (data.rates[symbol]) {
            $('#' + symbol).find('.price').text(Number(toFixed(data.rates[symbol])).toFixed(9) + ' USD');
        }
    });

    setTimeout(function () {
        window.location.reload(1);
    }, 300000);

}

$(".clients-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    responsive: {
        0: {
            items: 2
        },
        768: {
            items: 2
        },
        900: {
            items: 2
        }
    }
});
