const server = require("http").createServer();
const io = require("socket.io")(server);
io.on("connection", client => {
  console.log("connection");
  client.on("event", data => {
    /* … */
  });
  client.on("disconnect", () => {
    /* … */
  });
});
server.listen(4001);
export default io;
