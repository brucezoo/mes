var URLS={
  workshop: {
      list:'/StatementController/pageIndex',
      viewList:'/Statisticalreport/getWorkshoplist',
  },
  BatchTrace:{
      list:'/BatchTrace/pageIndex',
      backTrace:'/BatchTrace/backTrace',//逆向追溯
      forwardTrace:'/BatchTrace/forwardTrace',//正向追溯
      serialNumberTrace:'/BatchTrace/serialNumberTrace',//序列号追溯
      getBatchDetailList:'/BatchTrace/getBatchDetailList'//查看明细
  }
}