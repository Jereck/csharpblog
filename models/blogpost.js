var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("BlogPost", postSchema);