const mongoose = require('mongoose');
const question = require('./question');
const preTestSchema = new mongoose.Schema({
    questions: [question],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
}, {timestamps: true})

module.exports = mongoose.model('PreTest', preTestSchema);