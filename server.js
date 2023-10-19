const express = require("express")
const app = express()
const http = require("http").createServer(app);
const cors = require("cors");
const Link = require("./models/link");
const { default: mongoose } = require("mongoose");

app.use(express.json());

mongoose.connect(process.env.MONGO_PASS).then(()=>{console.log("DB connected")});

app.post("/i",async (req,res)=>{
    const longURL=await req.body?.longURL;
    const shortURL = Math.random().toString(32).substring(7);
    const pass="localhost:5000/i/"+ shortURL;
    //db storage
    const link = new Link({shortURL,longURL})
    await link.save();

    res.json({shortURL})
})

app.get("/i/:short",async (req,res)=>{
    //db retrieval
    const shortURL = req.params.short;
    const link = await Link.findOne({ shortURL });
    if(!link){
        return res.sendStatus(404);
    }
    setTimeout(()=>{res.status(301).redirect(link.longURL);},5000)
    
})
const Port=5000
http.listen(process.env.PORT || Port ,()=>{console.log(`Listening on ${Port}`)})