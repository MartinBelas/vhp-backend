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

    build() {
        if (!(this.id)) {
            throw new Error('Category id is missing.');
        }
        if (!(this.description)) {
            throw new Error('description description is missing.');
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