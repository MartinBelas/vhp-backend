'use strict';

class ResultBuilder {
    setIsOk(value) {
        this.isOk = value;
        return this;
    }
    
    setData(value) {
        this.data = value;
        return this;
    }

    setErrMessage(value) {
        this.errMessage = value;
        return this;
    }

    setSuggestedStatus(value) {
        this.suggestedStatus = value;
        return this;
    }

    build() {
        if (this.isOk == null) {
            throw new Error('IsOk value is missing.');
        }

        return new Result(this);
    }
}

class Result {
    constructor(builder) {
        this.isOk = builder.isOk;
        if (builder.data) {
            this.data = builder.data
        } else if (builder.errMessage){
            this.errMessage = builder.errMessage;
        }
        this.suggestedStatus = builder.suggestedStatus;
    }
}

module.exports = { ResultBuilder, Result }