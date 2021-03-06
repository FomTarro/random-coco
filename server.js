const { AppConfig } = require("./app.config");
const http = require('http');

const port = AppConfig.PORT;

async function launch(){
    const httpServer = http.createServer(await AppConfig.WEB_SERVER());

    httpServer.listen(port, () => {
        console.log(`random-coco listening on port: ${port}`);
    });
}

launch();
