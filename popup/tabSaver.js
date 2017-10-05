var storage = browser.storage.local;
var storageData;

function init(){
    storage.get("tabSaverData").then(function(data){
        storageData = (data.tabSaverData === undefined || data.tabSaverData === null) ? {} : data.tabSaverData;

        var storedWindows = storageData.storedWindows;
        for(var key in storedWindows){
            addTabList(storedWindows[key].tabs);
            if(browser.windows.WINDOW_ID_CURRENT === storedWindows[key].windowID)
                $('#addCurrentWindow').hide();
        }
    });
}

function addTabList(tabs){
    var listTemplate = $('#template').clone();
    $(listTemplate).find('.header #heading').first().html('Window ' + ($('#mainList').children('.winList').length+1));
    $(listTemplate).attr('id', 'Window');
    var tabList = $(listTemplate).children('.tabList').first();
    for (var i=0; i<tabs.length; i++){
        var tabDetail = $(tabList).children('.tabDetail').first().clone();
        $(tabDetail).html(stringTruncate(tabs[i].title,20));
        $(tabDetail).attr('title', tabs[i].title);
        $(tabDetail).attr('url', tabs[i].url);
        $(tabList).append(tabDetail);
    }
    $(tabList).children('.tabDetail').first().remove();
    $('#mainList').append(listTemplate);

}

function saveTabsToStorage(tabs){
    var currentData = {'tabs':[]},
    storedWins = storageData.storedWindows !== undefined ? storageData.storedWindows : {};

    tabs.forEach((x, index) => currentData.tabs.push({
        'title': x.title,
        'url': x.url
    }));
    currentData.windowID = browser.windows.WINDOW_ID_CURRENT;
    storedWins["window" + (Object.keys(storedWins).length + 1)] = currentData;
    storageData.storedWindows = storedWins;

    storage.set({'tabSaverData': storageData});
    console.log(storageData.storedWindows);
}

function stringTruncate(str, limit=5){
   if (str.length > limit)
      return str.substring(0,limit)+'...';
   else
      return str;
};


$('#addCurrentWindow').on("click", function(){
    browser.tabs.query({
        currentWindow: true
    }).then(function(tabs){
        saveTabsToStorage(tabs);
        addTabList(tabs);
    })
});

$(document).on('click', '#openWindow', function(){
    $(this).hide();
    var tabUrls = [];
    $(this).parents('.winList').find('.tabDetail').each((index, el) => tabUrls.push($(el).attr('url')));
    tabUrls = tabUrls.filter(x => x.includes('http'));

    browser.windows.create({
        url : tabUrls
    }).then(function(windowInfo){
        console.log('new window opened.');
    })
})


//storage.clear();
init();
