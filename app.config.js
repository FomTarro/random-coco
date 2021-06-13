require('dotenv').config();
const path = require("path");

const appConfig = {

    // config vars
    get ENV(){ return process.env.NODE_ENV || 'local'; },
    get PORT(){ return process.env.PORT || 8080; },
    get DOMAIN(){ return process.env.domain || `http://localhost:${this.PORT}` },
    get SESSION_SECRET(){ return process.env.session_secret; },
    get RATE_LIMIT_WINDOW_MS(){return process.env.rate_limit_window_ms || 15 * 60 * 1000;},
    get RATE_LIMIT_MAX_REQUESTS(){return process.env.rate_limit_max_requests || 100;},

    get WEB_PUBLIC_DIR(){ return path.join(__dirname, 'public'); },
    get WEB_TEMPLATE_DIR(){ return path.join(__dirname, 'templates'); },

    // use cases
    get POPULATE_HTML_PAGE(){ return (require('./src/usecases/populate.html.page.usecase'))},
    get GET_VIDEO_DATA(){ return (require('./src/usecases/get.clip.usecase'))},

    // models
    get WEB_SERVER() { return require('./src/boundary/web.server'); },
    get LOGGER(){ return require('./src/utils/logger'); },
    get LRU(){ return require('./src/utils/lru'); },

    // utils
    get HTTP_UTILS(){ return require('./src/utils/http.utils'); },
    get FILE_UTILS(){ return require('./src/utils/file.utils'); },
    get SESSION_UTILS(){ return require('./src/utils/session.utils'); },
}

module.exports.AppConfig = appConfig;