const mongoose = require("mongoose")

const linkSchema = new mongoose.Schema({
    shortURL: {type:String , required:true, unique:true },
    longURL: {type:String,required:true}
}
)
const Link = mongoose.model('Link',linkSchema);
module.exports = Link;