const AppConfig = require('../../app.config').AppConfig;
const { JSDOM } = require('jsdom');
const logger = new AppConfig.LOGGER.Logger();
describe("Tests page building", () => {
    test("Builds home page", async() => {
        const req = {};
        const page = await AppConfig.POPULATE_HTML_PAGE.populateHomePage(logger, req, {id:"abcd"});
        const dom = new JSDOM(page);
        expect(dom.window.document.getElementById('alert-title').innerHTML).toEqual('404');
    });

});