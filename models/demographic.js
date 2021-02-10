const mongoose = require('mongoose');
const question = require('./question');
const demoSchema = new mongoose.Schema({
    questions: [question],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
}, {timestamps: true})

module.exports = mongoose.model('Demo', demoSchema);