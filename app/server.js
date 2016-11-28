// External libraries
const restify = require("restify");
const restifySwagger = require("node-restify-swagger");
const requesting = require("request");
const errors = require("restify-errors");

// Local libraries
const wmsCache = require("./wms/capabilitiesCache.js");
const services = require("./config/services.json");
const wmsServices = require("./wms/wmsServices.js");
const url = require("./general/url.js");

const server = module.exports.server = restify.createServer();

server.name = "geocure";

server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.bodyParser());

restifySwagger.configure(server, {
        info: {
                title: "52°North geocure API",
                description: "52°North geocure API",
                contact: "m.rieke@52north.org",
                license: "MIT",
                licenseUrl: "http://opensource.org/licenses/MIT"
        },
        apiDescriptions: {
                "get": "GET API",
                "post": "POST API for complex requests"
        }
});

/**
 * API Docs contents
 * see http://mcavage.me/node-restify/#serve-static for usage
 **/
/*server.get(/\/apidocs\/?.*!/, restify.serveStatic({
 directory: "./documentation",
 default: "index.html"
 }));
 server.get("/", function(req, res, next) {
 res.header("Location", "/apidocs/index.html");
 res.send(302);
 return next(false);
 });*/


/**
 * Services Resource base controller
 */


server.get({
        url: "/services",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to geodata services",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        /*
         // Information for tracing
         requestUtils.injectFullUrl(req);
         controlExecution.logStart(req.fullUrl);

         res.send(processGetCapabilities.getServicesInfo(services, serviceCache, req));
         controlExecution.logEnd(req.fullUrl);*/
        try {
                const respone = wmsServices.getAllServices(services, req);
                res.send(respone);
        } catch (error) {
                res.send(500, JSON.stringify(error));
        }
});


server.get({
        url: "/services/:id",
        swagger: {
                summary: "services resource",
                notes: "this resource provides access to a service by id",
        }
}, function(req, res, next) {
        url.injectFullUrl(req);
        try {
                const respone = wmsServices.getServiceDescriptionById(services, req);
                res.send(respone);
        } catch (error) {
                error.message === "requestResponses", "/services:id" ? res.send(404, JSON.stringify(error)) : res.send(500, JSON.stringify(error)); 
        }
});


restifySwagger.loadRestifyRoutes();


/**
 * Start server
 */

/**
 * TODO
 * // Check the configuration of services before startup
 //serviceCheck.check(services, servicesMetadescription)
 */
wmsCache.loadCache().then(() => {
        server.listen(8000, function() {
                console.log("%s started: %s", server.name, server.url);
        });
})
