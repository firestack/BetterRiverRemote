$(setupApp);


function simpleAJAX(url, data, success, error){

}
function setupApp(){
    makeStatsBox();
    $('input[type="range"]').rangeslider();
    console.log($('input[type="range"]'));

}

function togglePlayPause(){
    $.ajax(
        {
            url:"/MCWS/v1/Playback/PlayPause",
            type:"GET",
            data:"Zone=-1&ZoneType=ID",
            success:function(a,b,c){},
            error: function (request, status, error) {
                bootbox.alert(error + status);
            }
        }
    );
    var icon = $("#playbutton i");
    // Get classes. remote old class, add alternate
    var classes = icon.attr("class");
    var qClass= classes.split(' ')[1];
    icon.removeClass(qClass);
    icon.addClass(qClass == "fa-play"? "fa-pause":"fa-play");
}

function trackNext(){
bootbox.alert("hi!!!");
}

function trackPrevious(){
bootbox.alert("hi!!!");
}

function playStop(){
    bootbox.alert("hi!!!");
}

function makeStatsBox(){

}
