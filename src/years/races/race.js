'use strict';

class RaceBuilder {

    setId(value) {
        this.id = value;
        return this;
    }
    
    setName(value) {
        this.Name = value;
        return this;
    }

    build() {
        if (!(this.id)) {
            throw new Error('Race id is missing.');
        }
        if (!(this.Name)) {
            throw new Error('Race name is missing.');
        }

        return new Race(this);
    }
}

class Race {
    constructor(builder) {
        this.id = builder.id;
        this.Name = builder.Name;
    }

    updateName(value) {
        if (value) {
            this.Name = value;
        }
    }
}

module.exports = { RaceBuilder, Race }