const { types, required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passpoerLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

userSchema.plugin(passpoerLocalMongoose);

module.exports = mongoose.model('User', userSchema);