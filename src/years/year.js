'use strict';

class YearBuilder {

    setVhpYear(value) {
        this.vhpYear = value;
        return this;
    }
    
    setVhpDate(value) {
        this.vhpDate = value;
        return this;
    }

    setAcceptRegistrations(value) {
        this.acceptRegistrations = value;
        return this;
    }

    build() {
        if (!(this.vhpYear)) {
            throw new Error('Year is missing.');
        }
        if (!(this.vhpDate)) {
            throw new Error('Date is missing.');
        }

        return new Year(this);
    }
}

class Year {
    constructor(builder) {
        this.vhpYear = builder.vhpYear;
        this.vhpDate = builder.vhpDate;
        this.acceptRegistrations = builder.acceptRegistrations;
    }

    setCategories(value) {
        this.categories = value;
        return this;
    }

    setRaces(value) {
        this.races = value;
        return this;
    }

    //TODO remove ??
    // updateDate(value) {
    //     if (value) {
    //         this.vhpDate = value;
    //     }
    // }
}

module.exports = { YearBuilder, Year }