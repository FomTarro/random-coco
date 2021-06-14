console.log(':^)')
var audio = new Audio('audio/next_meme.mp3');
audio.volume = 0.35;

function rollRandom(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'random');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    try{
        audio.play();
    }catch(e){

    }
    xhr.onload = () => {
        if(xhr.status != 200){
            //
        }else{
            var response = JSON.parse(xhr.response);
            window.document.getElementById('video-iframe').src = response.url;
            window.document.getElementById('video-tags').innerHTML = response.anchors;
            window.history.pushState('page', '...', '?id='+response.id);
        }
    };
    xhr.send();
}