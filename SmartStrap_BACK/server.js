const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use("/post", require("./routes/post.routes"));
//lancer le serveur
app.listen(port, () => {
    console.log("Server started on port    " + port);
}); 