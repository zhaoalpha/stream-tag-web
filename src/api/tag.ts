import request from '@/utils/request'

export const tagApi = {
  // 保存标签策略
  saveStrategy(data: any) {
    return request({
      url: '/api/strategy/save',
      method: 'post',
      data
    })
  },

  // 获取历史存档
  getArchives() {
    return request({
      url: '/api/strategy/list',
      method: 'get'
    })
  }
}
