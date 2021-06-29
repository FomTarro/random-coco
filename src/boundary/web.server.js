const AppConfig = require('../../app.config').AppConfig;
const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require('path');

async function setup(){
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.set('trust proxy', 1);
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000 // limit each IP to 100 requests per windowMs
      }));
    // --- PAGES ---
    await setupSessions(app);
    await setupRoutes(app);
    
    return app;
}

async function setupSessions(app){
    const session = require('express-session');
    const store = new session.MemoryStore();
    
    app.use(session({
            name: "session",
            store: store,
            secret: AppConfig.SESSION_SECRET, 
            cookie: { 
            httpOnly: true,
            secure: (AppConfig.ENV != 'local'),
            maxAge: (60 * 60 * 1000)
        },
        rolling: true,
        resave: true,
        saveUninitialized: true
    }));
}


async function setupRoutes(app){
    app.router = { strict: true }
    // home
    app.get('/', async (req, res) => {
        const logger = new AppConfig.LOGGER.Logger({path: req.path});
        const page = await AppConfig.POPULATE_HTML_PAGE.populateHomePage(logger, req, req.query);
        res.status(200).send(page);
    });

    app.get(`/random`, (req, res) => {
        const logger = new AppConfig.LOGGER.Logger({path: req.path});
        try{
            res.status(200).send(AppConfig.GET_VIDEO_DATA.getRandomVideoData(req.query.language));
        }catch(e){
            logger.error(e);
            res.status(500).send({});
        }
    });

    app.get('/about', async (req, res) => {
        const logger = new AppConfig.LOGGER.Logger({path: req.path});
        const page = await AppConfig.POPULATE_HTML_PAGE.populateAboutPage(logger, req);
        res.status(200).send(page);
    });

    app.get('/search', async (req, res) => {
        const logger = new AppConfig.LOGGER.Logger({path: req.path});
        const page = await AppConfig.POPULATE_HTML_PAGE.populateSearchPage(logger, req, req.query);
        res.status(200).send(page);
    });

    app.get('/affiliates', async (req, res) => {
        const logger = new AppConfig.LOGGER.Logger({path: req.path});
        const page = await AppConfig.POPULATE_HTML_PAGE.populateAffiliatesPage(logger, req);
        res.status(200).send(page);
    });

    app.get(['/css*','/js*','/img*', '/audio*'], (req, res) => {
        res.sendFile(path.join(AppConfig.WEB_PUBLIC_DIR, req.path))
    });

    app.get('/favicon.ico', (req, res) => {
        res.sendFile(path.join(AppConfig.WEB_PUBLIC_DIR, req.path))
    });

    // custom 404
    app.get('*', async (req, res) => {
        // log so we have a record of what URL folks are trying to hit
        const logger = new AppConfig.LOGGER.Logger({url: req.path});
        logger.error("page not found");
        const page = await AppConfig.POPULATE_HTML_PAGE.populateErrorPage(logger, req, 
            '404', 
            'The page you are requesting cannot be found.');
        res.status(404).send(page)
    });

    return app;
}

module.exports = setup;