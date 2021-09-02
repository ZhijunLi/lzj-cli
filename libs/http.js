const axios = require('axios')

axios.interceptors.response.use(res => {
  return res.data;
})


/**
 * 获取Github模板列表
 * @returns Promise
 */
async function getGithubRepoList() {
  return axios.get('https://api.github.com/users/ZhijunLi/repos')
}

/**
 * 获取Github版本信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function  getGithubTagList(repo) {
  return axios.get(`https://api.github.com/repos/ZhijunLi/${repo}/tags`)
}

/**
 * 获取Coding模板列表
 * @returns 
 */
async function getCodingRepoList() {
  // return axios.post('https://lizhijundev.coding.net/open-api?Action=DescribeProjectDepotInfoList',{ProjectId: 9430604})
  return new Promise((resolve, reject)=>{
    axios.post('https://lizhijundev.coding.net/open-api', {
      Action: 'DescribeProjectDepotInfoList',
      ProjectId: 9430604
    }, { headers: { 'Authorization': "token 58384d56d3de7439f42cc88a256e96439d5e84d8"} }).then(data=>{
      resolve(data.Response.DepotData.Depots)
    }).catch(err=>{
      reject(err)
    })
  })
}

/**
 * 获取Coding版本信息
 * @returns 
 */
async function getCodingTagList(repoID) {
  // return axios.post('https://lizhijundev.coding.net/open-api?Action=DescribeProjectDepotInfoList',{ProjectId: 9430604})
  return new Promise((resolve, reject)=>{
    axios.post('https://lizhijundev.coding.net/open-api', {
      Action: 'DescribeGitTags',
      DepotId: repoID
    }, { headers: { 'Authorization': "token 58384d56d3de7439f42cc88a256e96439d5e84d8"} }).then(data=>{
      resolve(data.Response.GitTags)
    }).catch(err=>{
      reject(err)
    })
  })
}


module.exports = {
  getGithubRepoList,
  getGithubTagList,
  getCodingRepoList,
  getCodingTagList
}
