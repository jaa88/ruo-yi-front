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

// 新增流程图数据
export function insertLiuChengTuDataLog(data) {
  return request({
    url: '/project/liuChengTu/insertLiuChengTuDataLog',
    method: 'post',
    data: data
  })
}

// 新增项目基础信息
export function insertProjectBase(data) {
  return request({
    url: '/project/base/insertProjectBase',
    method: 'post',
    data: data
  })
}

// 更新项目基础信息
export function updateProjectBase(data) {
  return request({
    url: '/project/base/updateProjectBase',
    method: 'post',
    data: data
  })
}

// 删除项目基础信息
export function deleteProjectBase(data) {
  return request({
    url: '/project/base/deleteProjectBase',
    method: 'post',
    data: data
  })
}

// 新增模板信息
export function insertProjectTemplate(data) {
  return request({
    url: '/project/liuChengTu/insertProjectTemplate',
    method: 'post',
    data: data
  })
}

// 更新模板信息
export function updateProjectTemplate(data) {
  return request({
    url: '/project/base/updateProjectBase',
    method: 'post',
    data: data
  })
}

// 删除流程图模板
export function deleteProjectTemplate(data) {
  return request({
    url: '/project/liuChengTu/deleteProjectTemplate',
    method: 'post',
    data: data
  })
}
