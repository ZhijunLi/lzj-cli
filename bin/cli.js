#! /usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const figlet = require('figlet')

const cli_name = require('../package.json').name.toLocaleUpperCase()
program
  .command('create <app-name>')
  .description('创建一个新项目')
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', '如果项目目录已存在，则覆盖')
  .option('-s, --src [src]', '可选，模板托管平台coding|github', /(coding|github)/i, 'coding')
  .action((name, options) => {
    require("../libs/create.js")(name, options)
  })
  

  program
    .on('--help', () => {
      // 使用 figlet 绘制 Logo
      console.log('\r\n' + figlet.textSync(cli_name, {
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: false
      }));
      console.log(`\r\n输入${chalk.cyan(`lzj-cli <command> --help`)} 查看帮助\r\n`)
    })

program
  .version(`v${require('../package.json').version}`)
  .usage('<command> [option]')


// 解析用户执行命令传入参数
program.parse(process.argv);
