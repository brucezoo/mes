var URLS={
    outsource: {
        deleteLine:'/OutMachineZy/destroyItem',
        delete:'/OutWorkShop/destroy',
        list: '/outsource/treeIndex',
        OutMachine: '/OutMachine/pageIndex',
        show: '/OutMachine/show',
        showMore: '/OutMachine/showMore',
        Factory: '/Factory/pageIndex',
        judge_person:'/Employee/pageIndex',
        store:'/OutMachineZy/storeZy',
        storeMoreZy:'/OutMachineZy/storeMoreZy',
        OutMachineZy:'/OutMachineZy/pageIndex',
        checkAlreadyPicking:'/OutMachine/checkHasZY03',
        pushOutMachineZy:'/Sap/pushOutMachineZy',
        destory:'/OutMachine/destory',
        OutMachineZyShow:'/OutMachineZy/show',
        outsourceOrder:'/OutWork/pageIndex',
        orderShow:'/OutWork/show',
        warehouse:'/depots',
		getFlowItems:'/OutWork/getOutWorkPickingInfo',
        showSendBack:'/OutWorkShop/showSendBack',
        getDeclareByPr:'/WorkDeclareOrder/getDeclareByPr',
        storeFlowItems:'/OutWork/storeFlowItems',
        updateFlowItems:'/OutWork/updateFlowItems',
        pageIndex:'/OutWorkShop/pageIndex',
        OutWorkShop:'/OutWorkShop/show',
        storageSelete:'/depots',
        WorkDeclareOrder:'/WorkDeclareOrder/outStore',
        showOutWork:'/OutMachine/showOutWork',
        preselection:'/Preselection/pageIndex',
        workcenter: '/WorkCenterStandard/getDeclareStandardByWorkCenter',
        audit: '/OutWorkShop/audit',
        noaudit: '/OutWorkShop/noaudit',
        submitBuste:'/Sap/pushWorkDeclareOrder',
        check:'/OutWorkShop/audit',
        destroyZy:'/OutMachineZy/destroyZy',
        getBatchprinting:'/OutMachineZy/getBatchprinting',
        showMoreShop:'/OutWork/getMoreFlowItems',
        storeMoreShop:'/OutWork/storeMoreShop',
        supplementaryAudit: '/OutMachineZy/supplementaryAudit',
        outsourceWorkShopReview: '/OutMachineShop/supplementaryshopAudit',//委外车间补料审核
        outsourceOrderExportExcel:'/OutMachine/outsourceOrderExportExcel',//委外订单导出
        DeleteRetreatRow:'/OutMachineZy/DeleteRetreatRow',//委外订单删除未发料行项
        deleteSubOrderInMaterial: '/OutWork/deleteSubOrderInMaterial', // 删除消耗品
        insertSubOrderInMaterial: '/OutWork/insertSubOrderInMaterial' // 添加消耗品
    },
    work:{
        judge_person:'/Employee/pageIndex',
        storageSelete:'/depots',
    },

    specialCause:{
        unique:'/Preselection/unique',
        store:'/Preselection/store',
        show:'/Preselection/show',
        update:'/Preselection/update',
        delete:'/Preselection/delete',
        pageIndex:'/Preselection/pageIndex',
        getMaterialStorage:'/MaterialRequisition/getMaterialStorage',
        changeStorage:'/StorageInveChange/publicChange',
        getSapPackingInfo:'/MaterialRequisition/getSapPackingInfo',
    },
    thinPro:{
        getCareLableList:'/CareLable/getCareLableList?',
        routingShow:'/OutWork/show?',
    },

    buste:{
        show:'/OutWork/moreShow',
        getStorage:'/MaterialRequisition/getMoreMaterialStorageInPWNew',
        getDeclareOrder:'/WorkDeclareOrder/pageIndexNew',
        store:'/WorkDeclareOrder/outStoreMore'
    },
    /********************************   添加  start  7/25   ************************************* */

    order: {
        workPick: '/MaterialRequisition/show',
    },
    // work: {
    //     audit: '/MaterialRequisition/updateReason',
    // }

    up: {
        audit: '/OutMachineZy/update',
    }

    /********************************************* end **************************************** */

};
