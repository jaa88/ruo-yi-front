import request from '@/utils/request'

// 查询项目列表
export function selectProjectBaseList(data) {
  return request({
    url: '/project/base/selectProjectBaseList',
    method: 'post',
    data: data
  })
}
