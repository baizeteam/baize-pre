/** 借用打包文件 是为了实现 @符号对应路径，ts并不能很好的实现 */

// import rollupPluginJson from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";
import alias from "@rollup/plugin-alias";
import copy from "rollup-plugin-copy";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { terser } from "rollup-plugin-terser"; // 引入压缩插件

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProductionEnv = process.env.ENV === "production";

export default {
  input: "src/main.ts", // 你的入口文件
  output: {
    sourcemap: !isProductionEnv,
    dir: "bin", // 输出目录，而不是具体的文件
    format: "es", // 输出格式
    preserveModules: true, // 保留模块结构
    preserveModulesRoot: "src" // 设置源模块的根目录
  },
  plugins: [
    alias({
      entries: [
        { find: "@", replacement: path.resolve(__dirname, "./src") } // 使用绝对路径
      ]
    }),
    typescript({
      // typescript插件配置
    }),
    copy({
      targets: [
        // { src: "package.json", dest: "bin" }, // 复制 package.json 到输出目录
        { src: "*.json", dest: "bin" }, // 复制 所有 .json 文件到输出目录
        { src: "README.md", dest: "bin" } // 复制 md
      ]
    }),
    isProductionEnv && terser() // // 如果是生产环境，则添加压缩插件
  ].filter(Boolean), // 过滤掉所有假值（例如，非生产环境下的terser插件会是undefined）
  // 确保不删除未使用的导出
  treeshake: false
};
