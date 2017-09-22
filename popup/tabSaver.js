var addWinButton = document.getElementById('addCurrentWindow');
var storage = browser.storage.local;
var storageData;

function init(){
    storage.get("tabSaverData").then(function(data){
        storageData = (data.tabSaverData === undefined || data.tabSaverData === null) ? {} : data.tabSaverData;

        var storedWindows = storageData.storedWindows;
        for(var key in storedWindows)
            addTabList(storedWindows[key].tabs);
    });
}

function addTabList(tabs){

    var listTemplate = document.getElementById('template').cloneNode(true);
    listTemplate.getElementsByClassName('heading')[0].innerHTML = 'New Window';
    listTemplate.id = 'Window';
    var tabList = listTemplate.children[1];
    for (var i=0; i<tabs.length; i++){
        var tabDetail = tabList.children[0].cloneNode(true);
        tabDetail.innerHTML = stringTruncate(tabs[i].title,15);
        tabDetail.setAttribute('title', tabs[i].title);
        tabDetail.setAttribute('url', tabs[i].url);
        tabList.appendChild(tabDetail);
    }
    document.getElementById('mainList').appendChild(listTemplate);

}

addWinButton.addEventListener("click", (e) => {
    browser.tabs.query({
        currentWindow: true
    }).then(function(tabs){
        //console.log(storageData.tabSaverData.storedWindows);return;
        saveTabsToStorage(tabs);
        addTabList(tabs);
    })
});

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

function createNode(elName){
    var node = document.createElement(elName);
    return node;
}

function stringTruncate(str, limit=5){
   if (str.length > limit)
      return str.substring(0,limit)+'...';
   else
      return str;
};

//storage.clear();
init();
