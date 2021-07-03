const { AppConfig } = require("../../app.config");
const https = require('https');

async function postFeedback(host, title, desc, logger){
    // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/
    const key = AppConfig.TRELLO_KEY;
    const token = AppConfig.TRELLO_TOKEN;
    const options = {
        hostname: host,
        path: `/1/cards?key=${key}&token=${token}&idList=60dfc6325e28db8108173f10&name=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }
    
    if((!title || title.length < 1) || (!desc || desc.length < 1))
    {
        logger.error("no content!");
        return 500;
    }

    const promise = new Promise(function(resolve, reject){
        const req = https.request(options, res => {
            logger.log(`feedback POST statusCode: ${res.statusCode}`)
            res.on('data', d => {
                if(res.statusCode != 200){
                    reject(`bad status code: [${res.statusCode}]`);
                    return;
                }else{
                    resolve();
                }
            });
        });
            
        req.on('error', error => {
            reject(error.toString());
        });
        
        req.end();
    }).then(() => { return 200 }).catch((error) => { logger.error(error); return 500 });

    return promise;
}


module.exports.postFeedback = postFeedback;