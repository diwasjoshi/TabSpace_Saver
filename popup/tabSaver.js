var addWinButton = document.getElementById('addCurrentWindow');

addWinButton.addEventListener("click", (e) => {
    browser.tabs.query({
        currentWindow: true
    }).then(function(tabs){
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
    })
});


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
