var URLS = {
  batch: {
    getWorkorderInfo: '/BatchTrace/getWorkorderInfo',//获取工单信息
    createBatchCode:'/BatchTrace/createBatchCode',//生成批次
    saveBatchData:'/BatchTrace/saveBatchData',//生成序列号
    getWorkorderInfo2: '/BatchTrace/getWorkorderInfo2',//生成批次号页面获取工单信息
    createBatchCode2:'/BatchTrace/createBatchCode2',//生成批次2
    saveBatchData2:'/BatchTrace/saveBatchData2',//生成序列号2
    getBatchList:'/BatchTrace/getMaterialList?',
    getWeight:'/BatchTrace/getWeight',//自动更新数量
    updateWeight:'/BatchTrace/updateWeight',//手动更新数量
    updateLength:'/BatchTrace/updateLength',
    getBatchTraceDeclareList:'/BatchTrace/getBatchTraceDeclareList',
    updateBatchTraceDeclare:'/BatchTrace/updateBatchTraceDeclare',
    createSerialCode:'/BatchTrace/createSerialCode',//生成成品序列号
    getInfoByFitBarCode:'/BatchTrace/getInfoByFitBarCode'
  },
  option:{
    getWorkCenter:'/BatchTrace/getWorkCenterList?',
    getWorkBench:'/BatchTrace/getWorkBenchList?',
    getRankPlan:'/RankPlan/pageIndex?',
  }
}
