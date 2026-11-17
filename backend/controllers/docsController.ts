// Swagger UI and the OpenAPI description behind it.
import { html, json } from '../http'
import { docsPage, openapi } from '../openapi'

export const spec = async () => json(openapi)
export const page = async () => html(docsPage)
