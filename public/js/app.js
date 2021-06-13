console.log(':^)')
 // var audio = new Audio('audio/next-meme.mp3');

function rollRandom(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'random');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // audio.play();
    xhr.onload = () => {
        if(xhr.status != 200){
            //
        }else{
            var response = JSON.parse(xhr.response);
            window.document.getElementById('video-iframe').src = response.url;
            window.document.getElementById('video-tags').innerHTML = response.tags;
            window.history.pushState('page2', '...', '?id='+response.id);
        }
    };
    xhr.send();
}