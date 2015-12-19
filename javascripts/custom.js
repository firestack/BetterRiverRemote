$(setupApp);



function setupApp(){

    makeStatsBox();
    $('input[type="range"]').bootstrapSlider({
        min:0,
        max:100,
        ticks:[0,25,50,75,100],
        ticks_snap_bounds: 2
    });
    $("#volSlider").on("slideStop", updateVolume).on("slide", updateVolumeWithStepingRealtime);

    console.log($('input[type="range"]'));

}

function MCWS(url, data, success, error){
    url = url.replace(":","/");

    var shouldUpdateScreen = false;

    if (data !== undefined){
        // extra params
        shouldUpdateScreen = data.update; delete data.update;
        var defaults = data.defaults; delete data.defaults;


        requestString = "";
        requestArray = [];

        for (var key in data) {

            requestArray.push(key+"="+data[key]);

        }
        requestString = requestArray.join("&");

        if (defaults){
            requestString += "&Zone=-1&ZoneType=ID";
        }

        //console.log(requestString);

    }else{
        requestString = "Zone=-1&ZoneType=ID";
    }


    success = (success === undefined? function(){}:success);
    error = (error === undefined? function(){}:error);
    $.ajax(
        {
            url:"/MCWS/v1/"+url,
            type:"GET",
            data:requestString,
            contentType:"text/xml",
            success: success,
            error: error
        }
    );

    if(shouldUpdateScreen){
        console.log(shouldUpdateScreen);
        statsCaller();

    }
}

function toggleRepeat(){
    MCWS("Playback:Repeat", {Mode:"Toggle", update:true});
}

function toggleShuffle(){
    this.currentShuffleMode = (this.currentShuffleMode === "On"? "Off" :"On");

    MCWS("Playback:Shuffle", {Mode:(this.currentShuffleMode), update:true});
}

function togglePlayPause(){
    MCWS("Playback:PlayPause", {defaults:true, update:true});
    setButtonPlayPause("Toggle");

}

function setButtonPlayPause(Mode){

    var icon = $("#playbutton i");
    // Get classes. remote old class, add alternate
    var classes = icon.attr("class");
    var qClass= classes.split(' ')[1];
    icon.removeClass(qClass);

    if (Mode==="Toggle"){

        icon.addClass(qClass == "fa-play"? "fa-pause":"fa-play");
    }else if (Mode==="Playing") {
        icon.addClass("fa-pause");
    }else{
        icon.addClass("fa-play");
    }
}

function trackNext(){
    MCWS("Playback:Next", {defaults:true, update:true});
}

function trackPrevious(){
    MCWS("Playback:Previous", {defaults:true, update:true});
}

function playStop(){
    MCWS("Playback:Stop", {defaults:true, update:true});
}

function makeStatsBox(){
    statsCaller();
    window.setInterval(statsCaller, 2000);
}

function updateVolume(slider){
    //MCWS("Playback:Volume",);


    MCWS("Playback:Volume",
        {
            Level:slider.value/($("#volSlider").bootstrapSlider("getAttribute","max")),
        },
        function(response){
            $("#volumeDisplay").text($(response).find("Item[Name='Display']").text());
        },
        function(){
            $("#volumeDisplay").text(slider.value);
        }
    );

}

function updateVolumeWithStepingRealtime(slider){
    if (slider.value % 5 === 0){
        updateVolume(slider);
    }
}

function statsCaller(){
    MCWS("Playback:Info",undefined, updateStats);
}

function updateStats(XHR){
    // <Response Status="OK">
        // <Item Name="ZoneID">0</Item>
        // <Item Name="State">2</Item>
        // <Item Name="FileKey">2081</Item>
        // <Item Name="NextFileKey">2103</Item>
        // <Item Name="PositionMS">123528</Item>
        // <Item Name="DurationMS">275411</Item>
        // <Item Name="ElapsedTimeDisplay">2:03</Item>
        // <Item Name="RemainingTimeDisplay">-2:32</Item>
        // <Item Name="TotalTimeDisplay">4:35</Item>
        // <Item Name="PositionDisplay">2:03 / 4:35</Item>
        // <Item Name="PlayingNowPosition">15</Item>
        // <Item Name="PlayingNowTracks">263</Item>
        // <Item Name="PlayingNowPositionDisplay">16 of 263</Item>
        // <Item Name="PlayingNowChangeCounter">2</Item>
        // <Item Name="Bitrate">245</Item>
        // <Item Name="Bitdepth">64</Item>
        // <Item Name="SampleRate">44100</Item>
        // <Item Name="Channels">2</Item>
        // <Item Name="Chapter">0</Item>
        // <Item Name="Volume">0.5</Item>
        // <Item Name="VolumeDisplay">50%  (-25.0 dB)</Item>
        // <Item Name="ImageURL">MCWS/v1/File/GetImage?File=2081</Item>
        // <Item Name="Artist">Clean Bandit</Item>
        // <Item Name="Name">Rather Be (The Magician Remix)</Item>
        // <Item Name="Status">Playing</Item>
    // </Response>
    //console.log(XHR);
    var Idx = function(name){
            return $(XHR).find("Item[Name=\""+name+"\"]").text();
    };

    $("#nowplayingimg").attr("src", Idx("ImageURL"));
    $("#nowplayingtitle").text( Idx("Status") +": "+ Idx("Name") + " By: " + Idx("Artist"));
    $("#nowplayingbitrate").text("Bit Rate: " + Idx("Bitrate"));
    $("#nowplayingbitdepth").text("Bit Depth: " + Idx("Bitdepth"));
    $("#nowplayingsamples").text("Sample Rate: " + Idx("SampleRate"));
    $("#nowplayingtrackoftrack").text(Idx("PlayingNowPositionDisplay"));
    setButtonPlayPause(Idx("Status"));
    $("#volumeDisplay").text(Idx("VolumeDisplay"));
    $("#volSlider").bootstrapSlider("setValue", Number(Idx("Volume") * $("#volSlider").bootstrapSlider("getAttribute","max")));
    // Set future information
    MCWS("File:GetInfo", {File:Idx("NextFileKey")}, setFuture);
}

function setFuture(XHR){
    var XML = $.parseXML(XHR);
    var Idx = function(name){
            return $(XML).find("Field[Name=\""+name+"\"]").text();
    };


    $("#upnextimg").attr("src", "MCWS/v1/File/GetImage?File="+Idx("Key"));
    $("#upnexttitle").text(Idx("Name"));
    $("#upnextartist").text(Idx("Artist"));
    $("#upnextbitrate").text("Bit Rate: " + Idx("Bitrate"));
    $("#upnextbitdepth").text("Bit Depth: " + Idx("Bit Depth"));
    $("#upnextsamples").text("Sample Rate: " + Idx("Sample Rate"));


}


// Style changing
function changeCSS(cssFile, cssLinkIndex) {
    $("#bootstrapstyle").attr("href", cssFile);

}
var themes = {
    "cerulean":'stylesheets/bootswatch/cerulean.min.css',
    "cosmo":'stylesheets/bootswatch/cosmo.min.css',
    "cyborg":'stylesheets/bootswatch/cyborg.min.css',
    "darkly":'stylesheets/bootswatch/darkly.min.css',
    "default":'stylesheets/bootswatch/default.min.css',
    "flatly":'stylesheets/bootswatch/flatly.min.css',
    "journal":'stylesheets/bootswatch/journal.min.css',
    "lumen":'stylesheets/bootswatch/lumen.min.css',
    "paper":'stylesheets/bootswatch/paper.min.css',
    "readable":'stylesheets/bootswatch/readable.min.css',
    "sandstone":'stylesheets/bootswatch/sandstone.min.css',
    "simplex":'stylesheets/bootswatch/simplex.min.css',
    "slate":'stylesheets/bootswatch/slate.min.css',
    "spacelab":'stylesheets/bootswatch/spacelab.min.css',
    "superhero":'stylesheets/bootswatch/superhero.min.css',
    "united":'stylesheets/bootswatch/united.min.css',
    "yeti":'stylesheets/bootswatch/yeti.min.css',
    "material":"stylesheets/bootswatch/material.min.css"
};

$(function(){
    // do my stuff
    //"<li><a href="#" data-theme="united" class="theme-link">United</a></li>";
    var themesholder = $("#themesholder");
    for (var key in themes){
            themesholder.append("<li><a href='#' data-theme="+key+" class='theme-link'>"+key+"</a></li>");
    }
    // do their stuff
   var themesheet = $('<link href="'+themes.slate+'" rel="stylesheet" />');
    themesheet.appendTo('head');
    $('.theme-link').click(function(){
       var themeurl = themes[$(this).attr('data-theme')];
        themesheet.attr('href',themeurl);
    });
});

function makeWiget(context){
    // <div id="widgetbox" class="panel col-sm-3 text-center">
    //     <div class="panel-heading">
    //         <h3 class="panel-title">Info</h3>
    //     </div>
    //     <!-- Possibly delagate? -->
    //     <div class="panel-body">
    //
    //     </div>
    // </div>

}

// function react(){
//
//     "use strict";
//
//     var HelloMessage = React.createClass({
//       displayName: "HelloMessage",
//
//       render: function render() {
//         return React.createElement(
//           "div",
//           null,
//           "Hello ",
//           this.props.name
//         );
//       }
//     });
//
//     ReactDOM.render(React.createElement(HelloMessage, { name: "John" }), mountNode);
// }
