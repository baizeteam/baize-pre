import { fileURLToPath } from "url"
import { dirname } from "path"
import { createRequire } from 'module'

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)
export const require = createRequire(import.meta.url)
