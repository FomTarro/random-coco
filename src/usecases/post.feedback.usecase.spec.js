describe("Tests about posting feedback", () => {

    const { AppConfig } = require('../../app.config');
    const { Logger }= require('../utils/logger');
    const nock = require('nock');

    const cases = [
        ['https://api.trello.com', 200, 'hello', 'goodbye', 200],
        ['https://nowhere.com', 200, 'hello', 'goodbye', 500],
        ['https://api.trello.com', 404, 'hello', 'goodbye', 500],
        ['https://api.trello.com', 200, undefined, 'goodbye', 500],
        ['https://api.trello.com', 200, 'hello', undefined, 500],
        ['https://api.trello.com', 200, undefined, undefined, 500],
    ]

    test.each(cases)('posting to [%p] returns [%p], given title [%p] and desc [%p], resolves to [%p]', async(url, response, title, desc, result) => {
        const log = new Logger({});
        const mockEndpoint = nock(url)
        .post(/.*/)
        .reply(response, response);
        const output = await AppConfig.POST_FEEDBACK.postFeedback('api.trello.com', title, desc, log);
        expect(output).toEqual(result);
        mockEndpoint.delete(/.*/);
    });
});