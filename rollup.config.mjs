import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'dist/index.js', // 入口文件
  output: {
    file: 'SafeZone/index.js',
    format: 'iife', // 立即调用函数表达式
    name: 'SafeZone', // 全局变量名
    exports: 'named' // 使用命名导出
  },
  plugins: [resolve(), commonjs()]
};