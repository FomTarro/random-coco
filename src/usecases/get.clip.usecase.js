const { AppConfig } = require('../../app.config');
const fs = require('fs');
const path = require('path');

const videoDataMap = new Map();
JSON.parse(fs.readFileSync(path.join(AppConfig.WEB_TEMPLATE_DIR, 'clips.json'), 'utf8'))
.map(obj => {
    if(videoDataMap.has(getIdFromUrl(obj.url))){
        console.log(`duplicate entry: ${obj.url}`)
    }
    videoDataMap.set(getIdFromUrl(obj.url), obj
)});

const engVideos = getListOfVideoData('english');
const jpnVideos = getListOfVideoData('japanese');
const memeVideos = getListOfVideoData('shitty japanese');
const allVideos = getListOfVideoData();

function TOTAL_VIDEO_COUNT(){ return videoDataMap.size };

function getRandomVideoData(language){
    let videos = [];
    if(language === 'english'){
        videos = engVideos;
    }else if(language === 'japanese'){
        videos = jpnVideos;
    }else if(language === 'shitty-japanese'){
        videos = memeVideos;
    } 
    else{
        videos = allVideos;
    }
    const index = Math.floor(Math.random() * videos.length);
    return videos[index];

}

function getSpecificVideoData(id){
    const video = videoDataMap.get(id);
    return {
        title: video.title,
        tags: video.tags,
        anchors: tagsToAnchors(video.tags),
        url: `https://www.youtube.com/embed/${id}`,
        id: id
    };
}

function tagsToAnchors(tags){
    let anchors = "";
    tags.forEach(tag => {
        anchors = anchors + `<a href='../search?search=${tag}'>${tag}</a>, `;
    })
    return anchors;
}

function getListOfVideoData(searchTerms){
    const list = [];
    if(searchTerms){
        searchTerms = searchTerms.toLowerCase()
        for (let key of videoDataMap.keys()) {
            const video = getSpecificVideoData(key);
            if(video.title.toLowerCase().includes(searchTerms) || video.tags.includes(searchTerms.toLowerCase())){
                list.push(video);
            }
        }
    }else{
        for (let key of videoDataMap.keys()) {
            list.push(getSpecificVideoData(key));
        }
    }
    return list;
}

function getIdFromUrl(url){
    return url.substr(url.lastIndexOf('=')+1);
}

module.exports.getRandomVideoData = getRandomVideoData;
module.exports.getSpecificVideoData = getSpecificVideoData;
module.exports.getListOfVideoData = getListOfVideoData;
module.exports.TOTAL_VIDEO_COUNT = TOTAL_VIDEO_COUNT;