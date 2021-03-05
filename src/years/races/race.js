'use strict';

class RaceBuilder {

    setId(value) {
        this.id = value;
        return this;
    }
    
    setName(value) {
        this.name = value;
        return this;
    }

    build() {
        if (!(this.id)) {
            throw new Error('Race id is missing.');
        }
        if (!(this.name)) {
            throw new Error('Race name is missing.');
        }

        return new Race(this);
    }
}

class Race {
    constructor(builder) {
        this.id = builder.id;
        this.name = builder.name;
    }

    updateName(value) {
        if (value) {
            this.name = value;
        }
    }
}

module.exports = { RaceBuilder, Race }