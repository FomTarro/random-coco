const { JSDOM } = require('jsdom');
const { AppConfig } = require('../../app.config');
const fs = require('fs');
const path = require('path');

const pageCodes = {
    get HOME(){return 'HOME'},
    get VIDEO(){return 'VIDEO'},
    get ERROR(){return 'ERROR'},
}

async function execute(logger, req, options){

    const template = new JSDOM(fs.readFileSync(path.join(AppConfig.WEB_TEMPLATE_DIR, 'index.html')));
    const doc = template.window.document;
    // navbar
    const imgSrc = `${AppConfig.DOMAIN}/img/24mo_highres.png`;;
    doc.getElementById('meta-img').content = imgSrc;
    if(pageCodes.HOME == options.code){
        let video = {};
        try{
            if(options.id){
                video = AppConfig.GET_VIDEO_DATA.getSpecificVideoData(options.id);
            }
        }catch(e){
            logger.error(e);
            return await populateErrorPage(logger, req, '404', `The requested video could not be found.`);
        }
        doc.getElementById('video-iframe').src = video.url;
        const random = doc.createElement('script');
        random.innerHTML = "rollRandom()";
        doc.getElementsByTagName('html')[0].appendChild(random);
       
    }else if(pageCodes.VIDEO == options.code){
        const videoUrl = getRandomVideoId();
        doc.getElementById('video-iframe').src = videoUrl;

    }else if(pageCodes.ERROR == options.code){
        doc.getElementById('video-container').remove();
        doc.getElementById('alert-title').innerHTML = options.title;
        doc.getElementById('alert-desc').innerHTML = options.message;
        doc.getElementById('alert-img').remove();
    }
    
    return template.serialize();
}

async function populateHomePage(logger, req, query){
    return await execute(logger, req, {
        code: pageCodes.HOME,
        id: query != undefined ? query.id : undefined
    })
}

async function populateErrorPage(logger, req, errorTitle, errorMessage){
    logger.error(`ERROR PAGE ${req.path}`);
    return await execute(logger, req, {
        code: pageCodes.ERROR,
        title: errorTitle,
        message: errorMessage,
    })
}

module.exports.populateHomePage = populateHomePage;
module.exports.populateErrorPage = populateErrorPage;