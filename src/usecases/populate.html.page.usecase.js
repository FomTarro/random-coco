const { JSDOM } = require('jsdom');
const { AppConfig } = require('../../app.config');
const fs = require('fs');
const path = require('path');

const pageCodes = {
    get HOME(){return 'HOME'},
    get SEARCH(){return 'SEARCH'},
    get ABOUT(){return 'ABOUT'},
    get AFFILIATES(){return 'AFFILIATES'},
    get FEEDBACK(){return 'FEEDBACK'},
    get ERROR(){return 'ERROR'},
}

async function execute(logger, req, options){

    const template = new JSDOM(fs.readFileSync(path.join(AppConfig.WEB_TEMPLATE_DIR, 'index.html')));
    const doc = template.window.document;
    // navbar
    const imgSrc = `${AppConfig.DOMAIN}/img/24mo_highres.png`;;
    doc.getElementById('meta-img').content = imgSrc;
    if(pageCodes.HOME == options.code){
        doc.getElementById('list-container').remove();
        doc.getElementById('affiliates-container').remove();
        doc.getElementById('feedback-container').remove();
        doc.getElementById('video-count').innerHTML = AppConfig.GET_VIDEO_DATA.TOTAL_VIDEO_COUNT();
        let video = {};
        try{
            if(options.id){
                video = AppConfig.GET_VIDEO_DATA.getSpecificVideoData(options.id);
                doc.getElementById('video-background').classList.add('hide');
                doc.getElementById('video-iframe').classList.remove('hide');
                doc.getElementById('video-iframe').src = video.url;
                doc.getElementById('video-tags').innerHTML = video.anchors;          
                doc.getElementById('video-submitters').innerHTML = video.favorites;

            }else{
                // const random = doc.createElement('script');
                // random.innerHTML = "rollRandom()";
                // doc.getElementsByTagName('html')[0].appendChild(random);             
            }   
        }catch(e){
            logger.error(e);
            return await populateErrorPage(logger, req, '404', `The requested video could not be found.`);
        }
       
    }else if(pageCodes.SEARCH == options.code){
        doc.getElementById('video-container').remove();
        doc.getElementById('affiliates-container').remove();
        doc.getElementById('feedback-container').remove();
        doc.getElementById('alert-title').innerHTML = 'Search';
        doc.getElementById('alert-desc').innerHTML = 
        `Looking for a specific memory? You can search clips by title and tag here. 
        By default, all clips are listed.`;
        const videos = AppConfig.GET_VIDEO_DATA.getListOfVideoData(options.search);
        const list = doc.getElementById('list');

        // pagination
        const PER_PAGE = 20;
        const pages = [];
        var chunk = [];
        videos.forEach(video => {
            if(chunk.length >= PER_PAGE){
                pages.push(chunk);
                chunk = [];
            }
            chunk.push(video);
        });
        if(chunk.length > 0){
            pages.push(chunk);
        }
        var index = -1;
        if(options.page && options.page > 0 && pages.length > options.page){
            index = options.page;
        }else{
            if(pages.length > 0){
                index = 0;
            }
        }

        const page = index >= 0 ? pages[index] : [];
        const searchParam = options.search ? `&search=${options.search}` : '';
        const next = Math.min(pages.length-1, parseInt(index)+1);
        const last = Math.max(0, parseInt(index)-1);

        doc.getElementById('page-count').innerHTML = `page ${index}/${pages.length-1}`;
        doc.getElementById('page-next').href = `../search?page=${next}${searchParam}`;
        doc.getElementById('page-previous').href = `../search?page=${last}${searchParam}`;

        page.forEach(video => {
            list.appendChild(makeFileListEntry(doc, video));
        });
        doc.getElementById('video-count').innerHTML = videos.length;
    }
    else if(pageCodes.ABOUT == options.code){
        doc.getElementById('video-container').remove();
        doc.getElementById('list-container').remove();
        doc.getElementById('affiliates-container').remove();
        doc.getElementById('feedback-container').remove();
        doc.getElementById('alert-title').innerHTML = 'About';
        doc.getElementById('alert-img').src = '../img/webmaster.png';
        doc.getElementById('alert-desc').innerHTML = 
        `This site is built and maintained by <b>Tom "Skeletom" Farro</b> (<a target=# href="https://www.twitter.com/fomtarro">FomTarro</a>), 
        a loyal Tatsunoko until the end.
        <br> 
        <br> 
        All video contents are owned by <b>Cover</b>, with subtitles provided gaciously by members of the community.
        <br><br> 
        In addition, this project is Open Source, and can be viewed in its entirety on
        <a target=# href="https://github.com/FomTarro/random-coco">GitHub</a>. 
        <br><br>
        If you have a clip you'd like to submit, or just want to suggest additional tags for an existing clip, 
        please fill out our <a target=# href='https://docs.google.com/forms/d/e/1FAIpQLSc8cr0nRAxYLr1tglCW9jX-m-KgUVSdC3Msf_90-62Cd9R1ag/viewform?usp=sf_link'>
        Google Form</a>. if you have feedback, please submit it through the <a href='../feedback'> Feedback Form</a>!
        <br><br>
        <b>Kaichou</b>, if you're reading this: you're incredible. Thank you for all you've done. For us, for your company, for your friends. 
        You've shaped the world of VTubing for the better. We will never forget you.`
    }else if(pageCodes.AFFILIATES == options.code){
        doc.getElementById('video-container').remove();
        doc.getElementById('list-container').remove();
        doc.getElementById('feedback-container').remove();
        doc.getElementById('alert-title').innerHTML = "Affiliates"
        doc.getElementById('alert-desc').innerHTML = `
        Following the sudden news of Coco's graduation, there was an immediate and <b>tremendous</b> outpouring of projects from Tatsunokos the world over, 
        as everyone put their <b>hearts and souls</b> on the line one last time.
        <br>
        <br>
        Many of these projects, like this one, are <b>websites</b>! The ones that I am aware of, and had permission to share, are listed below! 
        Please give them a visit and enjoy these community efforts!`
    }else if(pageCodes.FEEDBACK == options.code){
        doc.getElementById('video-container').remove();
        doc.getElementById('list-container').remove();
        doc.getElementById('affiliates-container').remove();
        doc.getElementById('alert-title').innerHTML = "Feedback"
        doc.getElementById('alert-desc').innerHTML = `
        Thank you for taking the time to use and enjoy this site. Of course, it can always be better!
        <br>
        <br>
        If you have any points of feedback or messages for the webmaster, please submit them below. 
        <br>
        <br>
        The form is anonymous, and does not collect any metadata or other information aside from what you enter.`
    }
    else if(pageCodes.ERROR == options.code){
        doc.getElementById('video-container').remove();
        doc.getElementById('list-container').remove();
        doc.getElementById('affiliates-container').remove();
        doc.getElementById('feedback-container').remove();
        doc.getElementById('alert-title').innerHTML = options.title;
        doc.getElementById('alert-desc').innerHTML = options.message;
        doc.getElementById('alert-img').src='../img/kaigai_niki_sad.png';
    }
    
    return template.serialize();
}

function makeFileListEntry(doc, video){
    const li = doc.createElement('li');
    const item = doc.createElement('span');
    const anchor = doc.createElement('a');
    const relPath = `../?id=${video.id}`;
    anchor.href = relPath
    anchor.innerHTML = `<b>${video.title}</b>`;
    const tags = doc.createElement('div');
    tags.innerHTML = `<b>tags: </b> ${video.anchors}`;
    item.appendChild(anchor);
    item.appendChild(tags);
    li.appendChild(item);
    return li;
}

async function populateHomePage(logger, req, query){
    return await execute(logger, req, {
        code: pageCodes.HOME,
        id: query != undefined ? query.id : undefined
    })
}

async function populateSearchPage(logger, req, query){
    return await execute(logger, req, {
        code: pageCodes.SEARCH,
        search: query != undefined ? query.search : undefined,
        page: query != undefined ? query.page : undefined
    })
}

async function populateAboutPage(logger, req){
    return await execute(logger, req, {
        code: pageCodes.ABOUT,
    })
}

async function populateAffiliatesPage(logger, req){
    return await execute(logger, req, {
        code: pageCodes.AFFILIATES,
    })
}

async function populateFeedbackPage(logger, req){
    return await execute(logger, req, {
        code: pageCodes.FEEDBACK,
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
module.exports.populateSearchPage = populateSearchPage;
module.exports.populateAboutPage = populateAboutPage;
module.exports.populateAffiliatesPage = populateAffiliatesPage;
module.exports.populateFeedbackPage = populateFeedbackPage;
module.exports.populateErrorPage = populateErrorPage;