// Mahdollistaa virheilmoituksen ja status koodin välittämisen
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

export { ApiError }