var URLS = {
    bomList: {
        list: '/Bom/pageIndex',
        treeList: '/MaterialTemplate/treeIndex',
        show: '/Bom/show',
        materialInfo: '/Material/show',
        bomDelete: '/Bom/destroy',
        bomProcess:'/operation/AllIndex',
        pullBomList:'/Material/pullErpMaterialAndBOM',
        getBomReleaseRecord:'/Bom/getBomReleaseRecord',
        deleteReleaseRecord:'/Bom/deleteReleaseRecord',
        getAllBomInmaterial:'/Bom/getAllBomInmaterial'
    },
    bomGroup: {
    	list: '/BomGroup/pageIndex',
    	select: '/BomGroup/select',
        addGroup: '/BomGroup/store',
        editGroup: '/BomGroup/update',
        unique: '/BomGroup/unique',
        showBomGroup: '/BomGroup/show',
        deleteBomGroup: '/BomGroup/destroy',
        procedureGroup:'/ProcedureGroup/show'
    },
    bomAdd: {
    	uploadAttachment: '/Upload/attachment',
    	materialShow: '/Material/show',
    	category: '/MaterialCategory/treeIndex',
    	materialList: '/Material/pageIndex',
    	bomTree: '/Bom/getBomTree',
    	store: '/Bom/store',
    	update: '/Bom/update',
    	unique: '/Bom/unique',
    	bomShow: '/Bom/show',
    	bomMother: '/Material/bomMother',
    	bomItem: '/Material/bomItem',
    	bomDesign: '/Bom/getDesignBom',
    	bomAct: '/Bom/changeStatus',
      bomProduct: '/ProductBom/pageIndex',
      releaseCheck: '/Bom/releaseBeforeCheck',
      workMaterialNo: '/operation/getOperationsByMaterialNo',
      materialTempAttr: '/Material/getTemplateAttributeList',
      changeAssembly: '/Bom/changeAssembly',
      procedure: '/procedure/index',
      procedureShow: '/procedure/display',
      income: '/Bom/getEnterBomMaterial',
      makeList: '/practice/indexByOperation',
      getstep: '/practice/displayFields',
      outcome: '/Bom/getOutBomMaterial',
      exchange: '/BomRouting/storeLZP',
      bomRoute: '/BomRouting/getBomRouting',
      bomRouteAdd: '/BomRouting/saveBomRoutinginfo',
      getBomRoute: '/BomRouting/getBomRoutings',
      routeLineDelete: '/BomRouting/deleteBomRouting',
      imageIndex:'/Image/pageIndex',
      imageSource:'/ImageCategory/select',
      imageAttr:'/ImageAttributeDefinition/selectAll',
      practiceList:'/operation/show',
      opabs: '/operation/getAbilitiesByOperation',
      practiceLine: '/practice/showLines',
      imgshow: '/Image/show',
      preview: '/BomRouting/getPreviewData',
      practiceImg: '/Image/selectPracticeDrawing',
      cateByOp: '/operation/getMaterialCategoryByOperation',
      imgGroupType:'/ImageGroupType/selectAll',
      imgGroupSelect:'/ImageGroup/select',
      nodeInfo: '/BomRouting/getNeedCopyBomRoutingNodeInfo',
      nodeBom: '/BomRouting/getNeedCopyBomList',
      DownloadData: '/BomRouting/getBomRoutingDownloadData',
      getWorkcenters:'/WorkCenterOperation/getWorkCenterBySteps',
      syncSAP:'/Sap/syncRoute',
      assemblyItem:'/Bom/assemblyItem',
      deleteEnterMaterialLzp:'/BomRouting/deleteEnterMaterialLzp',
      getCanReplaceBom:'/BomRouting/getCanReplaceBom',
      replaceBomRoutingGn:'/BomRouting/replaceBomRoutingGn',
      getBomRoutTempList:'/BomRouting/getBomRoutingTempLatePageIndex',
      addBomRoutTemp:'/BomRouting/addBomRoutingTemplate',
      getBomRoutTempDetail:'/BomRouting/getBomRoutingTemplateDetail',
      getBomRoutingHasSave:'/BomRouting/getBomRoutingHasSave',
      getBomRoutTempQuerys:'/BomRouting/getBomRoutingTemplateQuerys',
      deleteBomRoutTemp:'/BomRouting/deleteBomRoutingTemplate',
      getAllLevelMaterialCategory: '/MaterialCategory/getAllLevelMaterialCategory',
      getUnFinishWoAndPoByBomRouting: '/BomRouting/getUnFinishWoAndPoByBomRouting',
      hasNotUsedMaterial: '/BomRouting/hasNotUsedMaterial',
      saveBomRoutingCheck: '/BomRouting/saveBomRoutingCheck',
      routingSoShow:'/WorkOrder/processDocumentsshow?',
      GetprocessDocuments:'/WorkOrder/GetprocessDocuments?',
      updateBomMaterial: '/Bom/updateBomMaterial',
      setBomBase: '/Bom/setBomBase'
    },
    log:{
        operator: '/Trace/operators',
        logList: '/Trace/pageIndex'
    },
    bomProduct:{
        productAdd:'/ManufactureBom/store',
        productList: '/ManufactureBom/pageIndex',
        productShow: '/ManufactureBom/show',
        productDelete: '/ManufactureBom/destroy'
    },
    image:{
      upload: '/Image/upload',
      category:'/ImageCategory/select',
      type:'/ImageGroupType/selectAll',
      attrSelect: '/ImageAttributeDefinition/selectAll',
      groupSelect: '/ImageGroup/select',
      getCode: '/encoding/get',
      store: '/Image/store',
      searchImg: '/Image/listBySearchStr',
    },

    workWay:{
        procedureList:'/operation/AllIndex',
        materialCate:'/MaterialCategory/select',
        practiceList:'/operation/show',
        descSelect:'/PracticeUse/selectAll',
        proType:'/ProductType/selectTree',
        pracType:'/practiceCategory/select',
        liningType: '/LiningType/selectTree',
        plieNumber: '/PlieNumber/selectAll',
        searchPractice: '/practice/searchPractice'
    },

    


    // aps:{
    //     factory: '/Factory/select',
	 //    workshop: '/Workshop/select',
    //     workcenter: '/WorkCenter/select'
    // }

  ability: {
    getAbility: '/Language/getAbility',
    save: '/Language/relevanceAbillity',
    printOut: '/Language/exportExcel',
  },
  translate: {
    get: '/Language/getAllLanguage',

    gets: '/Language/getImage',
  },
  procedure: {
    getCode: '/encoding/get',
    store: '/operation/createAbility',
  },
  working: {
    get: '/Language/getOperation',
    save: '/Language/operationLanguage',
  },
  maintain: {
    get: '/Language/getSpecialCraftList',
    img: '/Language/imageLanguage',
    special: '/Language/specialLanguage'
  },

  getImg: {
    img:'/Language/imageLanguage'
  },

  woCraftView: {
    getWorkOrderFile: '/WorkOrder/getWorkOrderFile'
  },
}
