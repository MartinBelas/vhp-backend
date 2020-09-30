'use strict';

class CategoryBuilder {

    setId(value) {
        this.id = value;
        return this;
    }
    
    setDescription(value) {
        this.description = value;
        return this;
    }

    isValidNumber(value){
        return value >= 0 && value <= 999;
    }
    validateId(id) {
        if (id.length != 4) return false;
        if (id.substring(0, 1) != 'M' && id.substring(0, 1) != 'F') return false;
        if (!this.isValidNumber(id.substring(1, 4))) return false;
        return true;
    }

    build() {
        if (!(this.id)) {
            throw new Error('Category id is missing.');
        }
        if (!(this.validateId(this.id))) {
            throw new Error('Category id is not valid.');
        }
        if (!(this.description)) {
            throw new Error('Description is missing.');
        }

        return new Category(this);
    }
}

class Category {
    constructor(builder) {
        this.id = builder.id;
        this.description = builder.description;
    }

    updateDescription(value) {
        if (value) {
            this.description = value;
        }
    }
}

module.exports = { CategoryBuilder, Category }