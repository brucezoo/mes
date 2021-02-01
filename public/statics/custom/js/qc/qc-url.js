var URLS={
    type: {
        select:'/qc/settingType',
        view:'/qc/viewType',
        add:'/qc/addType',
        edit: '/qc/questionSetting/updateItems',
        delete: '/qc/deleteType'
    },
    missing: {
        select:'/qc/questionSetting/viewItemsList',
        view:'/qc/questionSetting/viewItems',
        add:'/qc/questionSetting/addItems',
        edit: '/qc/questionSetting/updateItems',
        delete: '/qc/questionSetting/deleteItems'
    },
    template: {
        select:'/qc/getCheckItemsByType',
        itemSelect:'/qc/getItemsByType',
        view:'/',
        add:'/qc/addCheckItem',
        edit: '/',
        delete: '/qc/deleteCheckItem'
    },
    inspect:{
        select:'/inspectproject/treeIndex',
        view:'/inspectproject/show',
        add:'/inspectproject/store',
        edit: '/inspectproject/update',
        delete: '/inspectproject/destroy',
        getWorkShop:'/Workshop/select?',
        getDepartment:'/department/list?',
    },
    quality:{
      list:'/Qualityresume/pageIndex',
      view:'/Qualityresume/show',
      quality:'/qualityResume/quality',
      update:'/qualityResume/updateQuality',
      delete:'/qualityResume/qualityDelete'
    },
    check:{
        select:'/qc/select',
        check:'/qc/IQCCheckMore',
        templateList:'/qc/templateList',
        selectTemplate:'/qc/selectTemplate',
        showTemplate:'/qc/showTemplate',
        pushInspectOrder:'/sap/pushInspectOrder',
        pushFinishedproduct:'/qc/pushFinishedproduct',
        batchSend:'/qc/batchSending',
        audit:'/qc/audit',
        auditBack:'/qc/noaudit',
        Material:'/Material/show',
        CareLabel:'/CareLabel/get',
        updateAmountInspection:'/qc/setCheckQty',
        updateCheckQty:'/qc/updateCheckQty',
        updateStatus:'/qc/updatePushStatus',
        storeQcClaim:'/QcClaim/store',
        claimIndex:'/QcClaim/pageIndex',
        replyPageindex:'/QcClaim/replyPageindex',
        review:'/QcClaim/personReply',
        showQcClaim:'/QcClaim/show',
        pushClaim:'/Srm/pushClaim',
        unit:'/Unit/pageIndex',
        export:'/qc/exportExcel',
        selectDim:'/qc/selectDim',
        storeApply:'/abnormal/store',
        list: '/Admin/pageIndex',
        checkCopy: '/qc/checkCopy',
        attachment: '/Download/attachment',
        uploadAttachment: '/Upload/attachment',
        deleteAttachment: '/Upload/destroy',
        destroyPicture: '/Image/destroyPicture',
        missingIitems:'/qc/missingIitems',
        delete:'/qc/checklistDelete',
        pushWqcToSap:'/qc/pushWqcToSap',
        updateMCdata:'/qc/addMCData'
    },
    abnormal:{
        select:'/abnormal/viewAll',
        dropdown:'/qc/dropdownSelect',
        add:'/abnormal/insert',
        view:'/abnormal/view',
        show:'/abnormal/show',
        edit:'/abnormal/edit',
        delete:'/abnormal/delete',
        department:'/department/list',
        employee:'/Employee/select',
        send:'/abnormal/transmission',
        sendEmployeeList:'/abnormal/sendEmployee',
        viewReportInfo:'/abnormal/viewReportInfo',
        backReportInfo:'/abnormal/backTransmission',
        reportInfo:'/abnormal/updateTransmission',
        deleteReportInfo:'/abnormal/deleteReportInfo',
        audit:'/abnormal/audit',
        list:'/abnormal/pageIndex',
        destroy:'/abnormal/destroy',
        update:'/abnormal/update',
        replyList:'/abnormalReply/pageIndex',
        viewAbnormalReply:'/abnormalReply/show',
        replyUpdate:'/abnormalReply/update',
        uploadAttachment: '/Upload/attachment',
        repulse: '/qc/repulse',
    },
    complaint:{
        select:'/qc/showAllComplaintToQc',
        selectNo:'/qc/showAllComplaintNotToQc',
        send:'/qc/sendQuestion',
        showSendAll:'/qc/listQuestion',
        back:'/qc/judgeQuestion',
        audit:'/qc/judgeComplaint',
        viewCurrentComplaint:'/qc/detailAnswer',
        reply:'/qc/storeAnswer',
        replySelect:'/qc/detailComplaintByAdmin',
        auditSelect:'/qc/listComplaintToJudge',
        addbasic:'/qc/storeComplaint',
        addPlan:'/qc/storeD3',
        storeMaterials:'/qc/storeMaterials',
        getMaterials:'/qc/getMaterials',
        submit:'/qc/submitJudgeComplaint',
        pigeonhole:'/qc/finishComplaint',
        terminate:'/qc/stopComplaint',
        overComplaint:'/qc/overComplaint',
        submitComplaint:'/qc/sendToQc',
        viewComplaint:'/qc/displayWholeComplaint',
        delete:'/qc/deleteSendQuestion',
        deleteComplaint:'/qc/deleteComplaint',
        updatebasic:'/qc/updateComplaint',
        updatePlan:'/qc/updateD3',
        viewAllComplaint:'/qc/showComplaint',
        dimPonumber:'/qc/dimPonumber',
        dimMaterial:'/qc/dimMaterial',
        unique:'/qc/uniqueComplaint',
        judge_person:'/Employee/pageIndex',
        addAttachments: '/qc/addAttachments',
        getCode: '/encoding/get',
        addQualityResume: '/CustomerComplaint/customercomplaintquality',
        factory: '/Factory/selectEmployeeFactory',
        endSendMessage: '/qc/endSendMessageById',
        relateMissingItem:'/qc/missingItemOrder'
    },
    plan:{
        getpartners:'/basedata/partnerShow',
        store:'/QcPlan/store',
        update:'/QcPlan/update',
        pageIndex:'/QcPlan/pageIndex',
        show:'/QcPlan/show',
        destroy:'/QcPlan/destroy',
        unique:'/QcPlan/unique',
    },
    order:{
        workOrderShow:'/WorkOrder/show?',

    },
    thinPro:{
        getCareLableList:'/CareLable/getCareLableList?',
        routingShow:'/WorkOrder/show?',
    },
    deviation:{
      list:'/specialmining/pageIndex',
      add:'/specialmining/specialAdd',
      destroy:'/specialmining/delete',
      show:'/specialmining/show',
      update:'/specialmining/update',
      audit:'/specialmining/audit',
      view:'/specialmining/pageIndexlist'
    },
    deviationReply:{
      list:'/specialmining/replyPageindex',
      reply:'/specialmining/personReply',
      show:'/specialmining/show',
      showMessage: '/specialmining/showMessage'
    },
    application: {
      list: '/Inspectionapplication/pageIndex',
      downloadTemplate: '/Inspectionapplication/downloadTemplate',
      excelImport: '/Inspectionapplication/excelImport',
      pushFinishedproduct: '/Inspectionapplication/pushFinishedproduct'
    },
    invalidCost:{
      invalidEnumList:'/InvalidCost/invalidEnumList',
      addInvalidEnum:'/InvalidCost/addInvalidEnum',
      editInvalidEnum:'/InvalidCost/editInvalidEnum',
      delInvalidEnum:'/InvalidCost/delInvalidEnum',
      invalidEnumOne:'/InvalidCost/invalidEnumOne',
      treeIndex:'/InvalidCost/treeIndex',
      getNextLevelList:'/InvalidCost/getNextLevelList',
      show:'/InvalidCost/show',
      unique:'/InvalidCost/unique',
      store:'/InvalidCost/store',
      update:'/InvalidCost/update',
      destroy:'/InvalidCost/destroy',
      getSalesOrderProjectCode:'/InvalidCost/getSalesOrderProjectCode',
      getMaterialByProductionOrder:'/InvalidCost/getMaterialByProductionOrder',
      addInvalidOffer:'/InvalidCost/addInvalidOffer',
      editInvalidOffer:'/InvalidCost/editInvalidOffer',
      delInvalidOfferById:'/InvalidCost/delInvalidOfferById',
      getInvalidOfferList:'/InvalidCost/getInvalidOfferList?',
      getHandleInvalidOfferList:'/InvalidCost/getHandleInvalidOfferList?',
      getInvalidOfferOne:'/InvalidCost/getInvalidOfferOne',
		  unitList:'/getUnits',
      getSalesOrderCode:'/InvalidCost/getSalesOrderCode',
      sendMessageBatch:'/InvalidCost/sendMessageBatch',
      dealInvalidOfferById:'/InvalidCost/dealInvalidOfferById',
        getInvalidList: '/InvalidCost/getInvalidList?'
    },
    personnelMessage:{
      addsetPushmessage:'/qc/questionSetting/addsetPushmessage',
      setpushmassagelist:'/qc/questionSetting/setpushmassagelist',
      deletesetPushmessage:'/qc/questionSetting/deletesetPushmessage',
      updatesetPushmessage:'/qc/questionSetting/updatesetPushmessage',
      setPushmessageshow:'/qc/questionSetting/setPushmessageshow',
      employeeShow:'/basedata/employeeShow?',
    }
};
