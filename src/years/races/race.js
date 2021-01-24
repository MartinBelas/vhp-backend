'use strict';

class RaceBuilder {

    setId(value) {
        this.id = value;
        return this;
    }
    
    setDescription(value) {
        this.description = value;
        return this;
    }

    build() {
        if (!(this.id)) {
            throw new Error('Race id is missing.');
        }
        if (!(this.description)) {
            throw new Error('Race name is missing.');
        }

        return new Race(this);
    }
}

class Race {
    constructor(builder) {
        this.id = builder.id;
        this.description = builder.description;
    }

    updateName(value) {
        if (value) {
            this.description = value;
        }
    }
}

module.exports = { RaceBuilder, Race }