import rollupPluginJson from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

// import typescript from '@rollup/plugin-typescript'; // 你可能需要安装这个插件

export default {
  input: "src/main.mjs", // 注意这里可能是 .ts 文件而不是 .mjs
  output: {
    sourcemap: true,
    file: "bin/exec.cjs",
    format: "cjs" // 输出格式为 CommonJS
    // 其他选项...
  },

  plugins: [
    rollupPluginJson(),
    resolve(), // 使用 node-resolve 插件解析第三方模块
    commonjs() // 将 CommonJS 转换为 ES6（如果需要的话），但在这里主要是转换 Node.js 依赖
    // typescript(), // 使用 Rollup 的 TypeScript 插件
    // 其他插件...
  ]
  // 其他配置...
}
