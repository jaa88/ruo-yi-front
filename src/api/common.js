// 上传文件与功能之间的关系
export function deleteProjectTemplate(data) {
  return request({
    url: '/common/deleteAndInsertFunctionAndUploadFileRelation',
    method: 'post',
    data: data
  })
}
