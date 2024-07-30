// package.json接口类型
export type TYPE_PACKAGE_INFO = {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  bin?: {
    [k: string]: string;
  };
  scripts: {
    [scriptName: string]: string;
  };
  dependencies: {
    [dependencyName: string]: string;
  };
  devDependencies: {
    [devDependencyName: string]: string;
  };
  // 这里可以继续添加其他你认为重要的属性
};
