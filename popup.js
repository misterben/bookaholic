// Set up your bookstore options
// We need a name, a url transformer, and a callback function for checking the XHR return
// which needs to return either true or false

var stores = [
    {'name':'Amazon UK',
    'url':function(url) {
        return url.replace('amazon.com', 'amazon.co.uk')
        },
    'check':function(return_dom) {
        if (return_dom.title.search('404') > -1) {
            return false;
        } else {
            return true;
        }
        }
    },
    {'name':'Alibris UK',
    'url':function(url) {
        var isbn = url.match(/\d{9}[0-9X]{1}/)[0]
        return "http://alibris.co.uk/booksearch?keyword="+isbn
        },
    'check':function(return_dom) {
        var crumbs = return_dom.getElementById('breadcrumb');
        if (crumbs) {
            if (crumbs.getElementsByTagName('nobr') && crumbs.getElementsByTagName('nobr').innerHTML=='(0 available copies)') {
                return false;
            }
        }
        return true;
        }
    }
]

var xhr_stack = [];

var open_link = function(url) {
    chrome.tabs.create({'url':url});
}

chrome.tabs.query({'active':true}, function(tablist) {
	console.log(tablist);
	if (tablist && (tablist.length > 0)) {
		tab = tablist[0]; // ::TODO:: something cleverer here
		if (tab.url.search('amazon.com') == -1) {
			document.body.innerHTML = "<h1>You need to be on an Amazon.com page</h1>Found url of "+tab.url
		} else {
			document.body.innerHTML = "<h1>Now we're talking</h1>";
            for (var i=0; i < stores.length; i++) {
                var store = stores[i];
                var new_url = store.url(tab.url);
                var req = new XMLHttpRequest();
                req.open(
                    "GET",
                    new_url,
                    true);
                req.onload = show_link;
                xhr_stack.push({'store':store, 'url':new_url, 'req':req});
                req.send(null);
            }
		}
	} else {
		document.body.innerHTML = "No active tab found, sorry.";
	}
});

var show_link = function() {
    var found = -1;
    for (var j=0; j < xhr_stack.length; j++) {
        if (xhr_stack[j]['req'].readystate == 4) a
            var found = j;{
            var req = xhr_stack[j]['req'];
            var store = xhr_stack[j]['store'];
            var url = xhr_stack[j]['url'];
        }
    }
    if (found > -1) {
        xhr_stack.splice(found, 1)
    } else {
        return;
    }
    console.log(req);
    console.log(store);
    console.log(url);
    var new_element = document.createElement('div');
    if (req.status == 200) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = req.responseText.replace(/<script(.|\s)*?\/script>/g, '');
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);
        console.log(tempDiv.getElementById('breadcrumb'));
        var confirm = store['check'](tempDiv);
        console.log(store.name +" - "+confirm);
        if (confirm) {
            new_element.onclick = function() {
                open_link(url);
            }
            new_element.style.color = "green";
        } else {
            new_element.style.color = "red";
        }
    } else {
        new_element.style.color = "red";
    }
    new_element.innerHTML = store.name;
    document.body.appendChild(new_element);
}
