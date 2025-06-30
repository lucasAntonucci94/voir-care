export class AppError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code || 'UNKNOWN_ERROR';
  }
}