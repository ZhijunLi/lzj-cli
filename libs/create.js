
const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer');
const Generator = require('./Generator');

module.exports = async function (name, options) {
  // 当前命令行选择的目录
  const cwd  = process.cwd();
  // 需要创建的目录地址
  const targetDir  = path.join(cwd, name)

  // 目录是否已经存在？
  if (fs.existsSync(targetDir)) {

    // 是否为强制创建？
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      // 询问用户是否确定要覆盖
      let { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: '⚠️  项目目录已存在，是否重新创建项目目录？',
          choices: [
            {
              name: '删除原项目并重新创建',
              value: 'overwrite'
            },{
              name: '取消',
              value: false
            }
          ]
        }
      ])

      if (!action) {
        console.log(`👋🏻 再见:-)`)
        return;
      } else if (action === 'overwrite') {
        // 移除已存在的目录
        console.log(`\r\n删除中...`)
        await fs.remove(targetDir)
      }

    }
  }


  const generator = new Generator(name, options.src, targetDir)
  generator.create()
}