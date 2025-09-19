// Mahdollistaa virheilmoituksen ja status koodin välittämisen
class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

export { ApiError }