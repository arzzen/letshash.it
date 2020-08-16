var blocks = '<div id="{symbolName}" class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-4 coin">' +
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
    '<a target="_blank" class="btn btn-primary" href="{url}">start mining now!</a>' +
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
    $.getJSON('pools.json', function (data) {
        var pools = data;
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

    var lastBlockFound = 'never'
    if (data.pool.lastBlockFound) {
        var d = new Date(parseInt(data.pool.lastBlockFound)).toISOString();
        lastBlockFound = $.timeago(d);
    }

    var b = blocks
        .replace(/{url}/g, coin.url)
        .replace(/{symbolName}/g, symbol)
        .replace(/{name}/g, coin.name.toUpperCase())
        .replace(/{imageName}/g, coin.img)
        .replace(/{algo}/g, coin.algo || data.config.cnAlgorithm)
        .replace(/{lastBlock}/g, getReadableHashRateString(data.network.difficulty / data.config.coinDifficultyTarget) + "/sec")
        .replace(/{fee}/g, data.config.fee)
        .replace(/{blockSolvedTime}/g, getReadableTime(data.network.difficulty / data.pool.hashrate))
        .replace(/{miners}/g, data.pool.miners + ' (' + data.pool.workers + ' workers)')
        .replace(/{soloMiners}/g, (typeof data.pool.minersSolo !== "undefined" ? data.pool.minersSolo + ' (' + data.pool.workersSolo + ' workers)' : 'n/a (n/a workers)'))
        .replace(/{propHashRate}/g, getReadableHashRateString(data.pool.hashrate) + '/sec')
        .replace(/{soloHashRate}/g, getReadableHashRateString(data.pool.hashrateSolo) + '/sec')
        .replace(/{lastBlockFound}/g, lastBlockFound)
        .replace(/{sparkline}/g, home_GetGraphData(data.charts.difficulty).values)
        ;
    totalMiners += data.pool.miners;
    totalWorkers += data.pool.workers;
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
