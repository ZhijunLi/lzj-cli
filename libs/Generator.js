const { getGithubRepoList, getGithubTagList, getCodingRepoList, getCodingTagList} = require('./http')

const ora = require('ora')
const inquirer = require('inquirer')
const util = require('util')
const path = require('path')
const downloadGitRepo = require('download-git-repo')
const chalk = require('chalk')

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result; 
  } catch (error) {
    // 状态为修改为失败
    console.log(error)
    spinner.fail('Request failed, refetch ...')
  } 
}

class Generator {
  constructor (name, src, targetDir){
    this.src = src
    if( typeof this.src === 'undefined' ){
      this.src = 'coding'
    }

    this.githubProjectPrefix = 'front-cli-'

    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  async getCodingRepo() {
    const repoList = await wrapLoading(getCodingRepoList, '正在从coding.net获取模板中')

    if (!repoList) return;

    // 过滤我们需要的模板名称
    const repos = [];
    const repos_ids = [];
    repoList.forEach(item=>{
      repos.push(item.Name)
      repos_ids.push(item.Id)
    })

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: '请选择模板名称'
    })

    let repoID = 0
    repos.forEach((item, index)=>{
      if(item === repo){
        repoID = repos_ids[index]
      }
    })

    // 3）return 用户选择的ID
    return {
      repo,
      repoID
    };
  }

  async getCodingTag(repoID) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getCodingTagList, '正在获取版本...', repoID);
    if (!tags) return;
    
    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.TagName);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: '请选择版本'
    })

    // 3）return 用户选择的 tag
    return tag
  }

  async getGithubRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getGithubRepoList, '正在从Github获取模板中');
    // 过滤我们需要的模板名称
    const repos = [];
    const re = new RegExp(""+this.githubProjectPrefix+"*");

    repoList.forEach(item=>{
      if(re.test(item.name)){
        repos.push(item.name.replace(this.githubProjectPrefix, ''))
      }
    })

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: '请选择模板名称'
    })

    // 3）return 用户选择的名称
    return repo;
  }

  async getGithubTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getGithubTagList, '正在获取版本...', repo);
    if (!tags) return;
    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: '请选择版本'
    })

    // 3）return 用户选择的 tag
    return tag
  }



  /**
   * 下载模板
   * @param {*} repo 
   * @param {*} tag 
   */
  async download(repo, tag){
    let requestUrl = ''
    // 1）拼接下载地址
    if(this.src === 'github'){
      requestUrl = `ZhijunLi/${repo}${tag?'#'+tag:''}`;
    }else if(this.src === 'coding'){
      requestUrl = `direct:https://lizhijundev.coding.net/p/front-cli-templates/d/${repo.repo}/git/archive/${tag?tag:'master'}/?download=true`;
    }
    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo,
      '项目创建中',
      requestUrl,
      path.resolve(process.cwd(), this.targetDir))
  }

  // 核心创建逻辑
  async create(){
    let repo = ''
    let tag = ''
    if(this.src === 'github'){
      // 1）获取模板名称
      repo = this.githubProjectPrefix + await this.getGithubRepo()
      // 2) 获取 tag 名称
      tag = await this.getGithubTag(repo)
    }else if(this.src === 'coding'){
      // 1）获取模板名称
      repo = await this.getCodingRepo()
      // 2) 获取 tag 名称
      tag = await this.getCodingTag(repo.repoID)
    }else{
      console.log('模板托管平台不存在，请重试')
      return
    }
    // 3）下载模板到模板目录
    await this.download(repo, tag)
    console.log(`\r\n🎉成功创建项目： ${chalk.cyan(this.name)}`)
    console.log(`快速开始:`)
    console.log(`${'cd '+this.name}`)
    console.log('npm install')
    console.log('npm run dev')
  }
}

module.exports = Generator;