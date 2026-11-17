/** An error the person should see, with its HTTP status. Anything else becomes a plain 500. */
export class AppError extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}
