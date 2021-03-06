var storage = browser.storage.local, windows = browser.windows;
var storageData, windowsOpen, currentWindow, windowTitles;

function init(){

    $('#addCurrentWindow').show();
    windows.getAll().then(function(windowInfoArray){
        windowsOpen = windowInfoArray.map(x => x.id);
        console.log(windowInfoArray);
    });

    windows.getCurrent().then(function(windowInfo){
        currentWindow = windowInfo;
    });

    storage.get("tabSaverData").then(function(data){
        storageData = (data.tabSaverData === undefined || data.tabSaverData === null) ? {} : data.tabSaverData;

        var storedWindows = storageData.storedWindows;
        for(var key in storedWindows){
            addTabList(storedWindows[key].tabs, storedWindows[key].windowID, storedWindows[key].retracted);
            if(currentWindow.id === storedWindows[key].windowID)
                $('#addCurrentWindow').hide();
        }
    });
}

function addTabList(tabs, windowID, retracted = false){

    var listTemplate = $('#template').clone();
    $(listTemplate).find('.header .heading').first().html('Window ' + ($('#mainList').children('.winList').length+1));
    $(listTemplate).attr('id', 'window' + ($('#mainList').children('.winList').length+1));

    var tabList = $(listTemplate).children('.tabList').first();
    for (var i=0; i<tabs.length; i++){
        var tabDetail = $(tabList).children('.tabDetail').first().clone();
        $(tabDetail).html(stringTruncate(tabs[i].title,20));
        $(tabDetail).attr('title', tabs[i].title);
        $(tabDetail).attr('url', tabs[i].url);
        $(tabList).append(tabDetail);
    }

    if(windowsOpen.includes(windowID))
        $(listTemplate).find('.openWindow').remove();
    if(retracted){
        $(listTemplate).find('.retractor').toggleClass('retracted');
        $(listTemplate).find('.tabList').hide();
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
    currentData.windowID = currentWindow.id;
    currentData.retracted = false;
    storedWins["window" + (Object.keys(storedWins).length + 1)] = currentData;
    storageData.storedWindows = storedWins;

    storage.set({'tabSaverData': storageData});
    console.log(storageData.storedWindows);
}

function stringTruncate(str, limit=5){
   if (str.length > limit)
      return str.substring(0,limit) + '...';
   else
      return str;
};


$('#addCurrentWindow').on("click", function(){
    var self = this;
    browser.tabs.query({
        currentWindow: true
    }).then(function(tabs){
        saveTabsToStorage(tabs);
        addTabList(tabs, currentWindow.id);
        $(self).hide();
    })
});

$(document).on('click', '.openWindow', function(){
    $(this).hide();
    var tabUrls = [];
    $(this).parents('.winList').find('.tabDetail').each((index, el) => tabUrls.push($(el).attr('url')));
    var windowListId = $(this).parents('.winList').attr('id');
    tabUrls = tabUrls.filter(x => x.includes('http'));
console.log(windowListId);
console.log(storageData);
    if(storageData.unsyncWins === undefined)
        storageData.unsyncWindows = [];
    storageData.unsyncWindows.push("tabsaver_" + windowListId);
    browser.windows.create({
        titlePreface : "tabsaver_" + windowListId,
        url : tabUrls
    }).then(function(windowInfo){
        storageData.storedWindows[windowListId].windowID = windowInfo.id;
        storage.set({'tabSaverData': storageData});
    })
})

$(document).on('click', '.deleteWindow', function(){
    var savedWindowID = $(this).parents('.winList').attr('id');
    $(this).parents('.winList').remove();
    delete storageData.storedWindows[savedWindowID];
    storage.set({'tabSaverData': storageData});
    init();
})

$(document).on('click', '.winList .header .retractor', function(){
    var windowID = $(this).parents('.winList').attr('id');
    $(this).parent('.header').next('.tabList').slideToggle(300);
    $(this).toggleClass('retracted');
    storageData.storedWindows[windowID].retracted = !storageData.storedWindows[windowID].retracted;
    storage.set({'tabSaverData': storageData});
})

//storage.clear();

browser.windows.onCreated.addListener((window) => {
  console.log("New window: " + window.id);
  console.log(storageData);
});

init();
