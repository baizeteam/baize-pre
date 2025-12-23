import type { NodeInstance } from '@/types/node.interface'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

class NodeService implements NodeInstance {
  public readonly filename: string
  public readonly dirname: string
  public readonly root: string
  public readonly versions: {
    preVersion: number
    fullVersion: string
  }

  constructor() {
    this.filename = fileURLToPath(import.meta.url)
    this.dirname = path.dirname(this.filename)
    this.root = path.join(this.dirname, '..')
    this.versions = {
      preVersion: Number(process.versions.node.split('.')[0]),
      fullVersion: process.version,
    }
  }
}

export const nodeService = new NodeService()
