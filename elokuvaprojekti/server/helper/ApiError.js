// Mahdollistaa virheilmoituksen ja status koodin välittämisen
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

export { ApiError }