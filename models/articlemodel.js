const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    id: {
        required: true,
        type: Number
    },
    title: {
        required: true,
        type: String
    },
    author: {
        required: true,
        type: String
    },
    headline: {
        required: true,
        type: String
    },
    publishedAt: {
        required: true,
        type: String
    },
    content: {
        required: true,
        type: String
    },
    url: {
        required: true,
        type: String
    },
})

module.exports = mongoose.model('ArticleData', dataSchema)