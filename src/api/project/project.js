import request from '@/utils/request'

// 查询项目列表
export function selectProjectBaseList(data) {
  return request({
    url: '/project/base/selectProjectBaseList',
    method: 'post',
    data: data
  })
}

// 查询模板列表
export function selectProjectLiuChengTuTemplateList(data) {
  return request({
    url: '/project/liuChengTu/selectProjectLiuChengTuTemplateList',
    method: 'post',
    data: data
  })
}

// 查询模板数据列表
export function selectProjectLiuChengTuDataLogList(data) {
  return request({
    url: '/project/liuChengTu/selectProjectLiuChengTuDataLogList',
    method: 'post',
    data: data
  })
}
