'use strict';

const { v4: uuidv4 } = require('uuid');

class NewsItemBuilder {
    setIdFromDb(value) {
        this.idFromDb = value;
        return this;
    }

    setTitle(value) {
        this.title = value;
        return this;
    }
    
    setContent(value) {
        this.content = value;
        return this;
    }

    setAuthor(value) {
        this.author = value;
        return this;
    }

    setDate(value) {
        this.date = value;
        return this;
    }

    build() {
        if (!(this.title)) {
            throw new Error('Title is missing.');
        }
        if (!(this.content)) {
            throw new Error('Content is missing.');
        }
        //TODO
        // if (!(this.author)) {
        //     throw new Error('Author is missing.');
        // }

        return new News(this);
    }
}

class News {
    constructor(builder) {
        if (!builder.idFromDb) {
            this.id = uuidv4();
        } else {
            this.id = builder.idFromDb;
        }
        this.title = builder.title;
        this.content = builder.content;
        this.author = builder.author;
        this.date = builder.date;
    }

    updateTitle(value) {
        if (value) {
            this.title = value;
        }
    }

    updateContent(value) {
        if (value) {
            this.content = value;
        }
    }
}

module.exports = { NewsItemBuilder, News }