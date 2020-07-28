// Fetch pool statistics
lastStats = {};
mergedStats = {};
let mergedApis = {};

$(function () {


    let merged_apis = $.ajax({
        url: `${api}/get_apis`,
        dataType: 'json',
        cache: 'false'
    })

    let poolStats = $.ajax({
        url: `${api}/stats`,
        dataType: 'json',
        cache: 'false'
    })

    Promise.all([poolStats, merged_apis])
        .then(values => {
            lastStats = values[0]
            mergedApis = values[1]
            let subs = [];
            Object.keys(mergedApis)
                .some(key => {
                    let apiUrl = `${mergedApis[key].api}/stats`
                    subs.push($.ajax({
                        url: apiUrl,
                        dataType: 'json',
                        cache: 'false'
                    }))
                })
            Promise.all(subs)
                .then(data => {
                    data.forEach(item => {
                        mergedStats[item.config.coin] = item
                    })
                    $('#poolVersion')
                        .html(lastStats.config.version);
                    routePage();
                })
        })
});

function fetchLiveStats () {
    $.ajax({
            url: api + '/live_stats',
            dataType: 'json',
            cache: 'false'
        })
        .done(function (data) {
            if (currentPage.update) {
                currentPage.update();
            }
        })
        .always(function () {
            fetchLiveStats();
        });
}


function renderTemplate (usersData, templateId, view) {
    let source = $(templateId)
        .html()
    Mustache.parse(source)
    let rendered = Mustache.render(source, usersData)
    $(view)
        .append(rendered)
}

// Initialize
$(function () {
    $("head")
        .append("<link rel='stylesheet' href=../assets/css/" + themeCss + ">");
    $("head")
        .append("<link rel='stylesheet' href=../assets/css/themes/admin.css>");
    $("head")
        .append("<link rel='stylesheet' href=../assets/css/themes/custom.css>");
});