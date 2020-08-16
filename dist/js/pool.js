// Store last pool statistics
var lastStats;

// Get current miner address
function getCurrentAddress() {
    var urlWalletAddress = location.search.split('wallet=')[1] || 0;
    var address = urlWalletAddress || docCookies.getItem('mining_address');
    return address;
}

// Pulse live update
function pulseLiveUpdate() {
    var stats_update = document.getElementById('statsUpdated');
    stats_update.style.transition = 'opacity 100ms ease-out';
    stats_update.style.opacity = 1;
    setTimeout(function () {
        stats_update.style.transition = 'opacity 7000ms linear';
        stats_update.style.opacity = 0;
    }, 500);
}

// Update live informations
function updateLiveStats(data) {
    pulseLiveUpdate();
    lastStats = data;
    if (lastStats && lastStats.pool && lastStats.pool.totalMinersPaid.toString() == '-1') {
        lastStats.pool.totalMinersPaid = 0;
    }
    updateIndex();
    if (currentPage) currentPage.update();
}

// Update global informations
function updateIndex() {
    updateText('coinSymbol', lastStats.config.symbol);
    updateText('coinName', lastStats.config.coin.toUpperCase());

    if (typeof byteUnitType != "undefined" && byteUnitType == 'G') {
        updateText('g_networkHashrate', getReadableHashRateString(lastStats.network.difficulty / lastStats.config.coinDifficultyTarget * 40) + '/sec');
    } else {
        updateText('g_networkHashrate', getReadableHashRateString(lastStats.network.difficulty / lastStats.config.coinDifficultyTarget) + '/sec');
    }

    updateText('g_poolHashrate', getReadableHashRateString(lastStats.pool.hashrate) + '/sec');
    if (lastStats.miner && lastStats.miner.hashrate) {
        updateText('g_userHashrate', getReadableHashRateString(lastStats.miner.hashrate) + '/sec');
    }
    else {
        updateText('g_userHashrate', 'N/A');
    }
    updateText('poolVersion', lastStats.config.version);
}

// Load live statistics
function loadLiveStats(reload) {
    var apiURL = api + '/stats';

    var address = getCurrentAddress();
    if (address) { apiURL = apiURL + '?address=' + encodeURIComponent(address); }

    if (xhrLiveStats) xhrLiveStats.abort();

    $.get(apiURL, function (data) {
        updateLiveStats(data);
        if (!reload) {
            routePage(fetchLiveStats);
        }
    });
}

// Fetch live statistics
var xhrLiveStats;
function fetchLiveStats() {
    var apiURL = api + '/live_stats';

    var address = getCurrentAddress();
    if (address) { apiURL = apiURL + '?address=' + encodeURIComponent(address); }

    xhrLiveStats = $.ajax({
        url: apiURL,
        dataType: 'json',
        cache: 'false'
    }).done(function (data) {
        updateLiveStats(data);
    }).always(function () {
        fetchLiveStats();
    });
}

// Initialize
$(function () {

    // Add support informations to menu    
    if (typeof telegram !== 'undefined' && telegram) {
        $('#contacts').append('<a class="btn btn-info ml-1 btn-sm" target="_new" href="' + telegram + '"><span tkey="telegram">Telegram group</span></a>');
    }
    if (typeof discord !== 'undefined' && discord) {
        $('#contacts').append('<a class="btn btn-info ml-1 btn-sm" target="_new" href="' + discord + '"><span tkey="discord">Discord</span></a>');
    }
    if (typeof email !== 'undefined' && email) {
        $('#contacts').append('<a class="btn btn-info ml-1 btn-sm" target="_new" href="mailto:' + email + '"><span tkey="contactUs">Contact Us</span></a>');
    }

    if (typeof langs !== 'undefined' && langs) {
        $('#chats')
            .append('<div id="mCoinSelector" class="nav-link"><select id="mCoins" style="width:150px" class="selectize-control p-1 rounded"></select></div>');
        renderLangSelector();
    }

    // Load live statistics for the first time
    loadLiveStats();
});