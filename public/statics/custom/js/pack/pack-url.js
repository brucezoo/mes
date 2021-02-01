var URLS = {
    job: {
        list:'/OfflinePackage/getList',
        schedu:'/OfflinePackage/batchProductPlan',
        pick:'/OfflinePackage/picking',
        print:'/OfflinePackage/getdispatching',
        branch:'/OfflinePackage/branching',
        product:'/OfflinePackage/noPlanProduction',
        del:'/OfflinePackage/deleteSalesOrder'
    },

    cab: {
        add:'/OfflinePackage/addTray',
        get:'/OfflinePackage/getTrayList',
        put:'/OfflinePackage/putTary',
        pack:'/OfflinePackage/getTary',
        page:'/OfflinePackage/pagaBox',
        getBox:'/OfflinePackage/getBox',
        del:'/OfflinePackage/deleteBox',
        getAll:'/OfflinePackage/getAllTary',
        print:'/OfflinePackage/printBox',
        printAll:'/OfflinePackage/printTary',
        code:'/OfflinePackage/getTaryCode',
        nowBox:'/OfflinePackage/getNowBox',
        nowTary:'/OfflinePackage/getNowTary',
        batch:'/OfflinePackage/batchprintTary'
    },
    cabinet: {
        ins:'/OfflinePackage/insertCounter',
    },

    list:{
        tary:'/OfflinePackage/getZTaryList',
        list:'/OfflinePackage/getSaleOrderList',
        num:'/OfflinePackage/containerNumberList',
        item:'/OfflinePackage/getZTaryItem',
        excel:'/OfflinePackage/saleOrderExcel',
        all:'/OfflinePackage/getcontainerList'
    },

    box:{
        list:'/OfflinePackage/getProductionList',
        ins:'/OfflinePackage/insertTary',
        enc:'/OfflinePackage/encasement',
        pall:'/OfflinePackage/palletizer',
        getList:'/OfflinePackage/getBoxList'
    },

    sku: {
        getSku:'/OfflinePackage/getMaterialSku',
        add:'/OfflinePackage/addMaterialSku',
        del:'/OfflinePackage/deleteMaterialSku',
        bj:'/OfflinePackage/updateMaterialSku',
        set:'/OfflinePackage/updateBraching'
    }

}