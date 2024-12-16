const Json= require("json-server");
const server= Json.create();
const route= Json.router("database.json");
const mid= Json.defaults();
const port= process.env.PORT || 10000;

server.use(mid);
server.use(route);

server.listen(port);