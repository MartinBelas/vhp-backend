let isApiKeyOk = false;

class ApiKeyService {

    setApiKeyOk(value) {
        this.isApiKeyOk = value;
    }

    getApiKeyOk() {
        return this.isApiKeyOk;
    }
}

module.exports = new ApiKeyService()