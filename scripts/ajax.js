
var g_token = "";

function create_xmlhttp() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlhttp;
}

function send_xmlhttp(xmlhttp, url, async) {

    // add unique string to avoid caching of xmlhttp
    if (url.indexOf("?") == -1) {
        url += "?NoCache=" + Math.random();
    } else {
        url += "&NoCache=" + Math.random();
    }

    // send
    xmlhttp.open("GET", url, async);
    xmlhttp.send("");
}

function download(url, async) {
    var xmlhttp = create_xmlhttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            xmlhttp = null;
        }
    };
    send_xmlhttp(xmlhttp, url, async);
}

function download_refresh(url) {
    download(url, false);
    setTimeout(reload, 500);
}

function reload() {
    location.reload(true);
}

function download_jump_playing_now(url) {
    var xmlhttp = create_xmlhttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            window.location.href = "playingnow.html";
            xmlhttp = null;
        }
    };
    send_xmlhttp(xmlhttp, url, true);
}

function download_update_display(url) {
    var xmlhttp = create_xmlhttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            download_display_playing_information();
            xmlhttp = null;
        }
    };
    send_xmlhttp(xmlhttp, url, true);
}

function download_display_html(url, id) {
    var xmlhttp = create_xmlhttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            document.getElementById(id).innerHTML = xmlhttp.responseText;
            xmlhttp = null;
        }
    };
    send_xmlhttp(xmlhttp, url, true);
}

function download_display_image(url, id) {
    var xmlhttp = create_xmlhttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            document.getElementById(id).src = xmlhttp.responseText;
            xmlhttp = null;
        }
    };
    send_xmlhttp(xmlhttp, url, true);
}

function download_display_playing_information() {
    var xmlhttp = create_xmlhttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {

            // load response
            var xml = xmlhttp.responseXML;
            var root = xml.getElementsByTagName("Response");

            // see if response is valid
            if ((root != null) && (root.length == 1) && (xml.documentElement.getAttribute("Status") == "OK")) {

                // get all items
                var items = xml.getElementsByTagName("Item");
                if (items != null) {

                    // loop items
                    for (var i = 0; i < items.length; i++) {

                        // parse values
                        var name = items[i].getAttribute("Name");
                        var value = items[i].childNodes[0].nodeValue;

                        // get corresponding element
                        var element = document.getElementById("PlaybackInfo." + name);
                        if (element != null) {

                            // update element
                            if ((element.src != null) && (element.src != "")) {
                                if (element.src != value)
                                    element.src = value; // image
                            }
                            else {
                                if (element.innerHTML != value)
                                    element.innerHTML = value; // text
                            }
                        }
                    }
                }

                xmlhttp = null;
            }
        }
    }
    send_xmlhttp(xmlhttp, "MCWS/v1/Playback/Info?Zone=-1&Token=" + g_token, true);
}

function init_playingnow(token) {

    // store token
    g_token = token;

    // update information once now
    download_display_playing_information();

    // update again every little bit
    setInterval("download_display_playing_information()", 5000);
}
