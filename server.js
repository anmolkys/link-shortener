const express = require("express")
const app = express()
const http = require("http").createServer(app);
const cors = require("cors");
const Link = require("./models/link");
require('dotenv').config()
const { default: mongoose } = require("mongoose");

app.use(express.json());
app.use(cors());
app.use(express.static('public'))
const Port=5000
mongoose.connect(process.env.URI).then(()=>{console.log("DB connected")});

app.post("/i",async (req,res)=>{
    const longURL=await req.body?.longURL;
    const shortURL = Math.random().toString(32).substring(7);
    const pass=`localhost:${Port}/i/`+ shortURL;
    console.log(pass);
    //db storage
    const link = new Link({shortURL,longURL})
    await link.save();

    res.json({shortURL,pass})
})

app.get("/i/:short",async (req,res)=>{
    //db retrieval
    const shortURL = req.params.short;
    const link = await Link.findOne({ shortURL });
    if(!link){
        return res.sendStatus(404);
    }
    res.status(301).redirect(link.longURL);
    
})




http.listen(process.env.PORT || Port ,()=>{console.log(`Listening on ${Port}`)})
