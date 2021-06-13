const request = require("supertest");
const AppConfig = require('../../app.config').AppConfig;

describe("App Context Launches", () => {
    test("Respond 200 when GET on root", async() => {
        const response = await request(await AppConfig.WEB_SERVER()).get("/");
        expect(response.statusCode).toBe(200);
    });
})