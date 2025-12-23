export interface LoggerInstance {
  success: (s: string, bold?: boolean) => void
  warn: (s: string, bold?: boolean) => void
  error: (s: string, bold?: boolean) => void
  finish: (s: string) => void
}
