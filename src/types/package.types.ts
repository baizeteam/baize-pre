// package.json接口类型
export interface TYPE_PACKAGE_INFO {
  name?: string
  version?: string
  description?: string
  main?: string
  bin?: {
    [k: string]: string
  }
  scripts: {
    [scriptName: string]: string
  }
  dependencies: {
    [dependencyName: string]: string
  }
  devDependencies: {
    [devDependencyName: string]: string
  }
  // 允许其他属性
  [k: string]: any
}
