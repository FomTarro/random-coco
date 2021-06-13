const { AppConfig } = require('../../app.config');
const fs = require('fs');
const path = require('path');

const videoDataArray = JSON.parse(fs.readFileSync(path.join(AppConfig.WEB_TEMPLATE_DIR, 'clips.json'), 'utf8'));
const videoDataMap = new Map();
videoDataArray.map(obj => {videoDataMap.set(getIdFromUrl(obj.url), obj)});

function getRandomVideoData(){
    let index = Math.floor(Math.random() * videoDataMap.size);
    let cntr = 0;
    let id = undefined;
    for (let key of videoDataMap.keys()) {
        if (cntr++ === index) {
            id = key;
            break;
        }
    }
    const video = videoDataMap.get(id);
    return {
        title: video.title,
        tags: video.tags,
        url: `https://www.youtube.com/embed/${id}`,
        id: id
    }
}

function getSpecificVideoData(id){
    const video = videoDataMap.get(id);
    return {
        title: video.title,
        tags: video.tags,
        url: `https://www.youtube.com/embed/${id}`,
        id: id
    };
}

function getIdFromUrl(url){
    return url.substr(url.lastIndexOf('=')+1);
}

module.exports.getRandomVideoData = getRandomVideoData;
module.exports.getSpecificVideoData = getSpecificVideoData;