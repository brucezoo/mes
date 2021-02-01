<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/6
 * Time: 下午2:03
 */

/*
 |-----------------------------------------------------------------------
 |生产订单
 |@author kevin
 |----------------------------------------------------------------------
 */

$router->post('ProductOrder/store','Mes\ProductOrderController@store');
$router->post('ProductOrder/update','Mes\ProductOrderController@update');
$router->get('ProductOrder/destroy','Mes\ProductOrderController@destroy');
$router->get('ProductOrder/pageIndex','Mes\ProductOrderController@pageIndex');
$router->get('ProductOrder/show','Mes\ProductOrderController@show');
$router->get('ProductOrder/release','Mes\ProductOrderController@release');
$router->get('ProductOrder/Rerelease','Mes\ProductOrderController@Rerelease');//重新发布，临时方案，等最早的单子跑完，删除此接口
// 批量发布 PO
$router->get('ProductOrder/batchRelease','Mes\ProductOrderController@batchRelease');
$router->get('ProductOrder/productOrderSchedule','Mes\ProductOrderController@productOrderSchedule');
$router->get('ProductOrder/isEcm','Mes\ProductOrderController@isEcm');
$router->get('ProductOrder/productBoard','Mes\ProductOrderController@productBoard');
$router->get('ProductOrder/cancelRelease','Mes\ProductOrderController@cancelRelease');
$router->get('ProductOrder/productOrderOnOff','Mes\ProductOrderController@productOrderOnOff');
$router->get('ProductOrder/checkCanDelete','Mes\ProductOrderController@checkCanDelete');

/*
 |-----------------------------------------------------------------------
 |生产任务
 |@author kevin
 |----------------------------------------------------------------------
 */

$router->post('WorkTask/store','Mes\WorkTaskController@store');
$router->post('WorkTask/update','Mes\WorkTaskController@update');
$router->post('WorkTask/split','Mes\WorkTaskController@split');
$router->get('WorkTask/destroy','Mes\WorkTaskController@destroy');
$router->get('WorkTask/pageIndex','Mes\WorkTaskController@pageIndex');
$router->get('WorkTask/show','Mes\WorkTaskController@show');

/*
 |-----------------------------------------------------------------------
 |工单
 |@author kevin
 |----------------------------------------------------------------------
 */
$router->get('WorkOrder/pageIndex','Mes\WorkOrderController@pageIndex');
//获取工作中心 hao.li
$router->get('WorkOrder/getWorkcenter','Mes\WorkOrderController@getWorkcenter');
$router->get('WorkOrder/NewPageIndex','Mes\WorkOrderController@NewPageIndex');
$router->get('WorkOrder/getAllOrderList','Mes\WorkOrderController@getAllOrderList');
$router->get('WorkOrder/show','Mes\WorkOrderController@show');
$router->get('WorkOrder/insertOrderInMaterial','Mes\WorkOrderController@insertOrderInMaterial');
$router->post('WorkOrder/edit','Mes\WorkOrderController@edit');
$router->get('WorkOrder/delete_item','Mes\WorkOrderController@delete_workorder_item');
$router->get('WorkOrder/updateConfirmNo','Mes\WorkOrderController@updateConfirmNo');
$router->get('WorkOrder/getReplaceLog','Mes\WorkOrderController@getReplaceLog');
$router->get('WorkOrder/excelExport','Mes\WorkOrderController@excelExport');
$router->get('WorkOrder/carefulPlanOrderList','Mes\WorkOrderController@carefulPlanOrderList');
$router->get('WorkOrder/getWorkbench','Mes\WorkOrderController@getWorkbench');
// @author guanghui.chen add
$router->get('WorkOrder/getTraceTechnics','Mes\WorkOrderController@getTraceTechnics');
$router->get('WorkOrder/getStatus','Mes\WorkOrderController@getStatus');
$router->post('WorkOrder/getLastGxInfo','Mes\WorkOrderController@getLastGxInfo');
$router->get('WorkOrder/moreShow','Mes\WorkOrderController@moreShow');
$router->get('WorkOrder/getPlanStartTime','Mes\WorkOrderController@getPlanStartTime');//获取排单时间
//替换料
$router->post('WorkOrder/replaceMaterial','Mes\WorkOrderController@replaceMaterial');
$router->get('WorkOrder/checkAddMaterial','Mes\WorkOrderController@checkAddMaterial');

//适配自制/委外/质检单的洗标文件 Add by Bruce.Chu
//传参type 1自制 2委外 3质检
$router->get('CareLable/getCareLableList','Mes\WorkOrderController@getCareLableList');
/*
 |-----------------------------------------------------------------------
 |APS排产
 |@author kevin
 |----------------------------------------------------------------------
 */

$router->get('APS/getProductOrder','Mes\APSController@getProductOrder');
$router->get('APS/getWorkTask','Mes\APSController@getWorkTask');
$router->get('APS/getWorkOrder','Mes\APSController@getWorkOrder');
$router->get('APS/getProductOrderInfo','Mes\APSController@getProductOrderInfo');

$router->post('APS/simplePlan','Mes\APSController@simplePlan');
$router->post('APS/carefulPlan','Mes\APSController@carefulPlan');
$router->get('APS/getCapacity','Mes\APSController@getCapacity');
$router->post('APS/splitWorkOrder','Mes\APSController@splitWorkOrder');
$router->get('APS/mergeWorkOrder','Mes\APSController@mergeWorkOrder');
$router->get('APS/destroy','Mes\APSController@destroy');
$router->post('APS/getCarefulPlan','Mes\APSController@getCarefulPlan');
$router->post('APS/checkCanPlan','Mes\APSController@checkCanPlan');
$router->post('APS/checkCanPlanByPeriod','Mes\APSController@checkCanPlanByPeriod');
$router->post('APS/simplePlanByPeriod','Mes\APSController@simplePlanByPeriod');
$router->get('APS/cancelGroupCarefulPlan','Mes\APSController@cancelGroupCarefulPlan');
$router->post('APS/groupCarefulPlan','Mes\APSController@groupCarefulPlan');
$router->get('APS/getLeftCapacity','Mes\APSController@getLeftCapacity');
$router->post('APS/RankCarefulPlan','Mes\APSController@RankCarefulPlan');

/*
 |-----------------------------------------------------------------------
 | 产能 细排
 |@author Bruce.Chu
 |----------------------------------------------------------------------
 */

$router->post('APS/getWorkCenterInfo','Mes\APSController@getWorkCenterInfo');
$router->get('APS/showAllWorkCenters','Mes\APSController@showAllWorkCenters');
$router->get('APS/showWorkCenterRankPlan','Mes\APSController@showWorkCenterRankPlan');
$router->get('APS/getWorkOrdersByDate','Mes\APSController@getWorkOrdersByDate');
/*
 |-----------------------------------------------------------------------
 | 领料单
 |@author lester.you
 |----------------------------------------------------------------------
 */
// 保存领料单
$router->post('MaterialRequisition/store', 'Mes\MaterialRequisitionController@store');
//领料单列表页
$router->get('MaterialRequisition/pageIndex', 'Mes\MaterialRequisitionController@pageIndex');
// 某一详情
$router->get('MaterialRequisition/show', 'Mes\MaterialRequisitionController@show');
// 更新实收数量
$router->post('MaterialRequisition/updateActualReceive', 'Mes\MaterialRequisitionController@updateActualReceiveNumber');
// 批量更新实收数量并更新库存
$router->post('MaterialRequisition/updateActualReceiveBatch', 'Mes\MaterialRequisitionController@updateActualReceiveNumberBatch');
// 修改子项
$router->post('MaterialRequisition/updateItem', 'Mes\MaterialRequisitionController@updateItem');
//刪除領料單
$router->get('MaterialRequisition/delete', 'Mes\MaterialRequisitionController@delete');
// 删除子项
$router->post('MaterialRequisition/deleteItem', 'Mes\MaterialRequisitionController@deleteItem');
// 验证子项可领数量
$router->get('MaterialRequisition/checkItemNumber', 'Mes\MaterialRequisitionController@checkItemNumber');
// 领料单审核
$router->get('MaterialRequisition/auditing', 'Mes\MaterialRequisitionController@auditing');
// 领料单反审
$router->get('MaterialRequisition/unAuditing', 'Mes\MaterialRequisitionController@unAuditing');
// 领料单 获取实时库存
$router->get('MaterialRequisition/getMaterialStorage', 'Mes\MaterialRequisitionController@getMaterialStorage');
// 根据 工单code 获取物料和相应批次
$router->get('MaterialRequisition/getMaterialBatch', 'Mes\MaterialRequisitionController@getMaterialBatch');

// 验证是否生成退料单
$router->get('MaterialRequisition/checkReturnMaterial','Mes\MaterialRequisitionController@checkReturnMaterial');
// 获取生成退料单数据
$router->get('MaterialRequisition/getCreateReturnMaterial','Mes\MaterialRequisitionController@getCreateReturnMaterial');
//生成退料单
$router->post('MaterialRequisition/storeReturnMaterial','Mes\MaterialRequisitionController@storeReturnMaterial');
// 工单齐料检测
$router->post('MaterialRequisition/checkApplyMes','Mes\MaterialRequisitionController@checkApplyMes');
//报工用到的获取实时库存
$router->get('MaterialRequisition/getMaterialStorageInPW','Mes\MaterialRequisitionController@getMaterialStorageInPW');
//合并报工查询实时库存
$router->get('MaterialRequisition/getMoreMaterialStorageInPW','Mes\MaterialRequisitionController@getMoreMaterialStorageInPW');
// 生成车间领/补料单
$router->post('MaterialRequisition/storeWorkShop','Mes\MaterialRequisitionController@storeWorkShop');
//验证是否允许生成 车间退料单
$router->get('MaterialRequisition/checkWorkShopReturnMaterial','Mes\MaterialRequisitionController@checkWorkShopReturnMaterial');
//获取车间退料的 可退库存数量
$router->get('MaterialRequisition/getWorkShopReturnStorage','Mes\MaterialRequisitionController@getWorkShopReturnStorage');
//车间领补退 确认发料、跟新实收数量
$router->post('MaterialRequisition/workShopConfirmAndUpdate','Mes\MaterialRequisitionController@workShopConfirmAndUpdate');
//生成车间退料单
$router->post('MaterialRequisition/storeWorkShopReturn','Mes\MaterialRequisitionController@storeWorkShopReturn');
  //  SAP领料 查询采购仓库和生产仓库
$router->get('MaterialRequisition/getMaterialDepot','Mes\MaterialRequisitionController@getMaterialDepot');
//SAP领料获取相关信息
$router->get('MaterialRequisition/getSapPackingInfo','Mes\MaterialRequisitionController@getSapPackingInfo');
$router->post('MaterialRequisition/updateReason','Mes\MaterialRequisitionController@updateReason');
// 导出补料单原因到excel中
$router->get('MaterialRequisition/exportExcel','Mes\MaterialRequisitionController@exportSupplementaryReason');
//QC质检列表
$router->get('MaterialRequisition/QCPageIndex','Mes\MaterialRequisitionController@QCPageIndex');
$router->get('MaterialRequisition/getMaterialUnit','Mes\MaterialRequisitionController@getMaterialUnit');
// 删除sap领料单成功之后发现错误的物料
$router->get('MaterialRequisition/sapdelete','Mes\MaterialRequisitionController@sapdelete');
// 获取 车间领料内容   shuaijie.feng
$router->get('MaterialRequisition/getMaterialWorkshop','Mes\MaterialRequisitionController@getMaterialWorkshop');
//车间批量领补退 确认发料、跟新实收数量
$router->post('MaterialRequisition/workShopConfirmAndUpdateBatch','Mes\MaterialRequisitionController@workShopConfirmAndUpdateBatch');

//hao.li  齐料检
$router->get('MaterialRequisition/checkMaterial','Mes\MaterialRequisitionController@checkMaterial');
/*
 |-----------------------------------------------------------------------
 | 合并领料
 |@author lester.you
 |----------------------------------------------------------------------
 */
$router->get('MaterialCombine/showCreateData','Mes\MaterialCombineController@showCreateData');
$router->post('MaterialCombine/store','Mes\MaterialCombineController@store');
$router->post('MaterialCombine/sync','Mes\MaterialCombineController@sync');
$router->get('MaterialCombine/pageIndex','Mes\MaterialCombineController@pageIndex');
$router->get('MaterialCombine/BatchInbound','Mes\MaterialCombineController@BatchInbound');
$router->get('MaterialCombine/show','Mes\MaterialCombineController@show');
$router->post('MaterialCombine/cancel','Mes\MaterialCombineController@cancel');

$router->get('MergerPicking/getStoreData', 'Mes\MergerPickingController@getStoreData');
$router->post('MergerPicking/store', 'Mes\MergerPickingController@store');
$router->get('MergerPicking/checkPicking', 'Mes\MergerPickingController@checkPicking');
$router->get('MergerPicking/pageIndex', 'Mes\MergerPickingController@pageIndex');

/*
 |-----------------------------------------------------------------------
 | 合并退料
 |@author Bruce.Chu
 |----------------------------------------------------------------------
 */
//工单列表
$router->get('MergerReturn/getWorkOrders', 'Mes\MergerReturnController@getWorkOrders');


/*
 |-----------------------------------------------------------------------
 |报工单
 |@author ming.li
 |----------------------------------------------------------------------
 */
 // 保存报工单
$router->post('WorkDeclareOrder/store', 'Mes\WorkDeclareOrderController@store');
$router->post('WorkDeclareOrder/storeMore', 'Mes\WorkDeclareOrderController@storeMore');
$router->post('WorkDeclareOrder/inventoryStoreMore', 'Mes\WorkDeclareOrderController@inventoryStoreMore');
 $router->post('WorkDeclareOrder/outStore', 'Mes\WorkDeclareOrderController@outStore');
 $router->post('WorkDeclareOrder/update', 'Mes\WorkDeclareOrderController@update');
 $router->get('WorkDeclareOrder/pageIndex', 'Mes\WorkDeclareOrderController@pageIndex');
 $router->get('WorkDeclareOrder/show', 'Mes\WorkDeclareOrderController@show');
 $router->get('WorkDeclareOrder/storageInstore', 'Mes\WorkDeclareOrderController@storageInstore');
 $router->get('WorkDeclareOrder/destroy','Mes\WorkDeclareOrderController@destroy');
 $router->get('WorkDeclareOrder/getDeclareByPr','Mes\WorkDeclareOrderController@getDeclareByPr');
$router->get('WorkDeclareOrder/updateEmployee','Mes\WorkDeclareOrderController@updateEmplyee');
$router->get('WorkDeclareOrder/recall','Mes\WorkDeclareOrderController@recall');

$router->get('WorkDeclareOrder/getDeclareOrderList', 'Mes\WorkDeclareOrderController@getDeclareOrderList');
$router->get('WorkDeclareOrder/getDeclareOrderDetail', 'Mes\WorkDeclareOrderController@getDeclareOrderDetail');

 //导出报工单export
$router->get('WorkDeclareOrder/export','Mes\WorkDeclareOrderController@export');
/*
|-----------------------------------------------------------------------
| 检查是否超报
|@author kevin
|----------------------------------------------------------------------
*/
 $router->get('WorkDeclareOrder/checkHasOverDeclare','Mes\WorkDeclareOrderController@checkHasOverDeclare');


/*
|-----------------------------------------------------------------------
| 预选原因
|@author lester.you
|----------------------------------------------------------------------
*/
$router->get('Preselection/unique', 'Mes\PreselectionController@unique');
$router->get('Preselection/pageIndex', 'Mes\PreselectionController@selectPage');
$router->get('Preselection/show', 'Mes\PreselectionController@selectOne');
$router->post('Preselection/store', 'Mes\PreselectionController@store');
$router->post('Preselection/update', 'Mes\PreselectionController@update');
$router->post('Preselection/delete', 'Mes\PreselectionController@delete');
//原因和车间关联
$router->post('Preselection/preselectionWorkshop', 'Mes\PreselectionController@preselectionWorkshop');
//根据原因获取已关联的车间
$router->get('Preselection/getpreselectionWorkshop', 'Mes\PreselectionController@getpreselectionWorkshop');
//根据车间获取已关联的原因
$router->get('Preselection/getWorkshopPreselection', 'Mes\PreselectionController@getWorkshopPreselection');


/*
|-----------------------------------------------------------------------
|委外工单列表
|@author Ming.Li
|----------------------------------------------------------------------
*/
 $router->get('OutWork/pageIndex','Mes\OutWorkController@pageIndex');
 $router->get('OutWork/show','Mes\OutWorkController@show');
 $router->get('OutWork/getFlowItems','Mes\OutWorkController@getFlowItems');
 $router->get('OutWork/getFlowItemsNew','Mes\OutWorkController@getFlowItemsNew');
 $router->get('OutWork/getMoreFlowItems','Mes\OutWorkController@getMoreFlowItems');
 $router->get('OutWork/checkOutwork','Mes\OutWorkController@checkOutwork'); // 委外报工前检测
//by kevin
$router->get('OutWork/deleteSubOrderInMaterial','Mes\OutWorkController@deleteSubOrderInMaterial');
$router->get('OutWork/insertSubOrderInMaterial','Mes\OutWorkController@insertSubOrderInMaterial');

  //委外相关单据列表
 $router->post('OutWork/storeFlowItems','Mes\OutMachineShopController@storeFlowItems');
 $router->post('OutWork/updateFlowItems','Mes\OutMachineShopController@updateFlowItems');
 $router->get('OutWorkShop/pageIndex', 'Mes\OutMachineShopController@pageIndex');
 $router->get('OutWorkShop/show', 'Mes\OutMachineShopController@show');
 $router->get('OutWorkShop/showSendBack', 'Mes\OutMachineShopController@showSendBack');
 $router->get('OutWorkShop/audit','Mes\OutMachineShopController@audit');
$router->get('OutWorkShop/noaudit','Mes\OutMachineShopController@noaudit');
$router->get('OutWorkShop/export','Mes\OutMachineShopController@export');
$router->get('OutWorkShop/destroy','Mes\OutMachineShopController@destroy');
$router->get('OutWorkShop/destroyItem','Mes\OutMachineShopController@destroyItem');
//批量新增委外单据
$router->post('OutWork/storeMoreShop','Mes\OutMachineShopController@storeMoreShop');
$router->get('OutWorkShop/batchOutdeliverylist','Mes\OutMachineShopController@batchOutdeliverylist');// 批量发料数据列表
$router->post('OutWorkShop/batchOutdelivery','Mes\OutMachineShopController@batchOutdelivery');// 批量发料接口
$router->get('OutWork/getOutWorkInfo','Mes\OutWorkController@getOutWorkInfo');//委外待报工详情

$router->get('OutWork/getOutWorkPickingInfo','Mes\OutWorkController@getOutWorkPickingInfo');//委外车间领补料详情

/*
|-----------------------------------------------------------------------
|报工计数(模塑车间专用)
|@author Lester.You
|----------------------------------------------------------------------
*/
$router->post('WorkDeclareCount/updateCount', 'Mes\WorkDeclareCountController@updateCount');
$router->get('WorkDeclareCount/pullWorkOrder', 'Mes\WorkDeclareCountController@pullWorkOrder');
$router->get('WorkDeclareCount/boardList', 'Mes\WorkDeclareCountController@boardList');
//获取已完成订单列表
$router->get('WorkDeclareCount/getCompletedList', 'Mes\WorkDeclareCountController@getCompletedList');
$router->get('WorkDeclareCount/getWorkbenchList', 'Mes\WorkDeclareCountController@getWorkbenchList');
//根据shift_code获取 count_shift 表中数据
$router->get('WorkDeclareCount/getShiftList', 'Mes\WorkDeclareCountController@getShiftList');
$router->post('WorkDeclareCount/updateShift', 'Mes\WorkDeclareCountController@updateShift');
//下架
$router->post('WorkDeclareCount/shiftOffShelves', 'Mes\WorkDeclareCountController@shiftOffShelves');



/*
|-----------------------------------------------------------------------
|库存领料
|@author Lester.You
|----------------------------------------------------------------------
*/
$router->post('MaterialPicking/store', 'Mes\MaterialPickingController@store');



/**
 * 验证SAP和MES工艺路线是否同步
 */
$router->get('ProductOrder/ValidRoutingBySAP', 'Mes\ProductOrderController@ValidRoutingBySAP');

/*
|-----------------------------------------------------------------------
|合并退料
|@author kevin
|----------------------------------------------------------------------
*/
$router->get('MergerReturnMaterial/getOrderMaterialList', 'Mes\MergerReturnController@getWorkOrdersMaterialList');
$router->get('MergerReturnMaterial/getMergerMaterial', 'Mes\MergerReturnController@getMergerReturnMaterial');
$router->post('MergerReturnMaterial/store', 'Mes\MergerReturnController@storeMergerReturnMaterial');
$router->get('MergerReturnMaterial/pageIndex', 'Mes\MergerReturnController@pageIndex');

/**
 /----------------------------------------------------------------------
 *  按单领料合并打印
 *  shuaijie.feng
 /----------------------------------------------------------------------
 */
$router->get('MaterialRequisition/getBatchprinting','Mes\MaterialRequisitionController@getBatchprinting');

/**
 /-------------------------------------------------------------------------
 * 排产计划导出
 * shuaijie.feng
 /-------------------------------------------------------------------------
 */
$router->get('WorkOrder/getPlannedexport','Mes\WorkOrderController@getPlannedexport');
/**
/-------------------------------------------------------------------------
 * 裁剪作业流转卡打印
 * shuaijie.feng
 *
/-------------------------------------------------------------------------
 */
$router->get('WorkOrder/TransferPrinting','Mes\WorkOrderController@TransferPrinting');

/**
/-------------------------------------------------------------------------
 * 裁剪作业流转卡导出
 * shuaijie.feng
 *
/-------------------------------------------------------------------------
 */
$router->get('WorkOrder/Transferexport','Mes\WorkOrderController@Transferexport');

/**
/-------------------------------------------------------------------------
 * 删除生产订单
 * shuaijie.feng
/-------------------------------------------------------------------------
 */
// 上传文件
$router->post('Tool/uploadFile','Mes\ToolController@uploadFile');
// 列表数据
$router->get('Tool/pageIndex','Mes\ToolController@pageIndex');
// 删除数据
$router->get('Tool/deleteOder','Mes\ToolController@deleteOder');
// 导出数据
$router->get('Tool/export','Mes\ToolController@export');

/**
/-------------------------------------------------------------------------
 *  车间退料更改状态
 *  shuaijie.feng
 *  5.28/2019
/-------------------------------------------------------------------------
 */
$router->get('MaterialRequisition/RetreatChangestats','Mes\MaterialRequisitionController@RetreatChangestats');

/**
/-------------------------------------------------------------------------
 *  车间退料删除行项
 *  shuaijie.feng
 *  5.29/2019
/-------------------------------------------------------------------------
 */
$router->get('MaterialRequisition/DeleteRetreatRowitem','Mes\MaterialRequisitionController@DeleteRetreatRowitem');

/**
/-------------------------------------------------------------------------
 *  合并退料批量推送  shuaijie.feng
 *  shuaijie.feng
 *  6.15/2019
/-------------------------------------------------------------------------
 */
$router->get('MergerReturnMaterial/BatchSending', 'Mes\MergerReturnController@BatchSending');

/**
/-------------------------------------------------------------------------
 *  查询跟包带数据   shuaijie.feng
 *  shuaijie.feng
 *  7.17/2019
/-------------------------------------------------------------------------
 */
$router->get('WorkOrder/heelBandget', 'Mes\WorkOrderController@heelBandget');
// 根据销售订单查看工艺  shuaijie.feng
$router->get('WorkOrder/processDocumentsshow', 'Mes\WorkOrderController@processDocumentsshow');
// 查询某物料的上级物料详情
$router->get('WorkOrder/GetprocessDocuments', 'Mes\WorkOrderController@GetprocessDocuments');


/*
|-----------------------------------------------------------------------
|委外工单合并报工
|@author Ming.Li
|----------------------------------------------------------------------
*/
$router->get('OutWork/moreShow','Mes\OutWorkController@moreShow');
$router->get('WorkDeclareOrder/pageIndexNew', 'Mes\WorkDeclareOrderController@pageIndexNew');
$router->get('MaterialRequisition/getMoreMaterialStorageInPWNew','Mes\MaterialRequisitionController@getMoreMaterialStorageInPWNew');//委外合并报工查询实时库存
$router->post('WorkDeclareOrder/outStoreMore', 'Mes\WorkDeclareOrderController@outStoreMore');


// 按单领料删除未发料行项 shuaijie.feng 8.22/2019
$router->post('MaterialRequisition/DeleteRetreatRow','Mes\MaterialRequisitionController@DeleteRetreatRow');
// 车间领料获取相关信息  shuaijie.feng  8.26/2019
$router->get('MaterialRequisition/getShopPackingInfo','Mes\MaterialRequisitionController@getShopPackingInfo');
// 领料单导出
$router->get('MaterialRequisition/getListexport','Mes\MaterialRequisitionController@getListexport');

// 根据工单获取合并退料列表 8.20/2019
$router->get('MergerReturnMaterial/pageIndexlist', 'Mes\MergerReturnController@pageIndexlist');


/*
|-----------------------------------------------------------------------
|工单清单
|@author yu.peng
|----------------------------------------------------------------------
*/
$router->get('Inventory/getWorkOrderInventory','Mes\WorkOrderInventoryController@getWorkOrderInventory');
$router->get('Inventory/getWorkOrderInventoryList','Mes\WorkOrderInventoryController@getWorkOrderInventoryList');
$router->post('Inventory/insertInventory','Mes\WorkOrderInventoryController@insertInventory');
$router->get('Inventory/inventoryExportExcel','Mes\WorkOrderInventoryController@inventoryExportExcel');
$router->get('Inventory/getInventorDetail','Mes\WorkOrderInventoryController@getInventorDetail');
$router->post('Inventory/delInventory','Mes\WorkOrderInventoryController@delInventory');
$router->get('Inventory/moreShow','Mes\WorkOrderInventoryController@moreShow');
$router->post('Inventory/printNum','Mes\WorkOrderInventoryController@printNum');

/*
| 委外，生产车间 看板数据
| @author  shuaijie.fefng
| 1. 车间看板信息    getWorkshoplist
| 2. 委外看板信息    getOutsourcinglist
 */
$router->get('Statisticalreport/getWorkshoplist','Statisticalreport\StatisticalreportController@getWorkshoplist');
$router->get('Statisticalreport/getOutsourcinglist','Statisticalreport\StatisticalreportController@getOutsourcinglist');

/*
|-----------------------------------------------------------------------
|批次追溯
|@author kevin
|----------------------------------------------------------------------
*/
$router->get('BatchTrace/pageIndex','Mes\BatchTraceController@pageIndex');
$router->get('BatchTrace/forwardTrace','Mes\BatchTraceController@forwardTrace');
$router->get('BatchTrace/backTrace','Mes\BatchTraceController@backTrace');
$router->get('BatchTrace/serialNumberTrace','Mes\BatchTraceController@serialNumberTrace');
$router->get('BatchTrace/getWorkorderInfo','Mes\BatchTraceController@getWorkorderInfo');
$router->get('BatchTrace/createBatchCode','Mes\BatchTraceController@createBatchCode');
$router->post('BatchTrace/saveBatchData','Mes\BatchTraceController@saveBatchData');
$router->get('BatchTrace/getWorkCenterList','Mes\BatchTraceController@getWorkCenterList');
$router->get('BatchTrace/getWorkBenchList','Mes\BatchTraceController@getWorkBenchList');
$router->get('BatchTrace/getMaterialList','Mes\BatchTraceController@getMaterialList');
$router->post('BatchTrace/getWeight','Mes\BatchTraceController@getWeight');
$router->post('BatchTrace/updateWeight','Mes\BatchTraceController@updateWeight');
$router->get('BatchTrace/getLastSelect','Mes\BatchTraceController@getLastSelect');
$router->post('BatchTrace/updateLength','Mes\BatchTraceController@updateLength');
$router->get('BatchTrace/getWorkorderInfo2','Mes\BatchTraceController@getWorkorderInfo2');
$router->get('BatchTrace/createBatchCode2','Mes\BatchTraceController@createBatchCode2');
$router->post('BatchTrace/saveBatchData2','Mes\BatchTraceController@saveBatchData2');
$router->get('BatchTrace/getBatchTraceDeclareList','Mes\BatchTraceController@getBatchTraceDeclareList');
$router->post('BatchTrace/updateBatchTraceDeclare','Mes\BatchTraceController@updateBatchTraceDeclare');
$router->get('BatchTrace/getInfoByFitBarCode','Mes\BatchTraceController@getInfoByFitBarCode');
$router->post('BatchTrace/createSerialCode','Mes\BatchTraceController@createSerialCode');
$router->get('BatchTrace/getBatchDetailList','Mes\BatchTraceController@getBatchDetailList');

/*
| 报工超投数据
| @author  shuaijie.fefng
| 1. 报工超投数据列表    toexamineList
| 2. 报工超投审核反审核
 */
$router->get('WorkDeclareOrder/toexamineList','Mes\WorkDeclareOrderController@toexamineList');
$router->post('WorkDeclareOrder/toexamineJudge','Mes\WorkDeclareOrderController@toexamineJudge');

//补料单反审
$router->post('MaterialRequisition/blCounterTrial','Mes\MaterialRequisitionController@blCounterTrial');

//工单对应补料列表
$router->get('MaterialRequisition/blList','Mes\MaterialRequisitionController@blList');
$router->get('MaterialRequisition/getOtherMergerByWorkOrder','Mes\MaterialRequisitionController@getOtherMergerByWorkOrder');

//获取该工单对应的车间下所有责任人  hao.li
$router->get('WorkDeclareOrder/getWorkShopEmployee','Mes\WorkDeclareOrderController@getWorkShopEmployee');
//各单位补料比例报表
$router->get('MaterialRequisition/blListReport','Mes\MaterialRequisitionController@blListReport');
$router->get('MaterialRequisition/exportBlListReport','Mes\MaterialRequisitionController@exportBlListReport');
$router->post('MaterialRequisition/updateResonToQcreson','Mes\MaterialRequisitionController@updateResonToQcreson');

//报工前检测上道是否报工
$router->get('WorkDeclareOrder/checkDeclareOrder','Mes\WorkDeclareOrderController@checkDeclareOrder');

/*
| 仓库实际收货数据，报表
| @author  hao.li
 */

 //导入
$router->post('Statisticalreport/importExcel','Statisticalreport\StatisticalreportController@importExcel');
//获取列表
$router->get('Statisticalreport/getStorageList','Statisticalreport\StatisticalreportController@getStorageList');
//导出
$router->get('Statisticalreport/exportExcel','Statisticalreport\StatisticalreportController@exportExcel');

//获取所有工厂
$router->get('Statisticalreport/getAllFactory','Statisticalreport\StatisticalreportController@getAllFactory');
//获取加工车间
$router->get('Statisticalreport/getWorkshop','Statisticalreport\StatisticalreportController@getWorkshop');
//获取委外加工点
$router->get('Statisticalreport/getPartner','Statisticalreport\StatisticalreportController@getPartner');
//下载模版
$router->get('Statisticalreport/downExcel','Statisticalreport\StatisticalreportController@downExcel');
//获取待确认数据
$router->get('Statisticalreport/getUnconfirmedList','Statisticalreport\StatisticalreportController@getUnconfirmedList');
//批量删除
$router->post('Statisticalreport/batchDelete','Statisticalreport\StatisticalreportController@batchDelete');
//确认
$router->post('Statisticalreport/commitData','Statisticalreport\StatisticalreportController@commitData');


$router->get('WorkOrder/beforeHoliday','Mes\WorkOrderController@beforeHoliday');

/**
 | 车间领料批量发料
 | 1.batchShopdeliverylist 发料数据列表
 | 2.batchShopdelivery 发料接口
 */
$router->get('MaterialRequisition/batchShopdeliverylist','Mes\MaterialRequisitionController@batchShopdeliverylist');
$router->post('MaterialRequisition/batchShopdelivery','Mes\MaterialRequisitionController@batchShopdelivery');
/*
| 预报工
| @author
 */
$router->post('WorkDeclareOrder/preStore','Mes\WorkDeclareOrderController@preStore');
$router->get('WorkDeclareOrder/getSupplierByIqc','Mes\WorkDeclareOrderController@getSupplierByIqc');
$router->get('WorkDeclareOrder/getPreWorkDeclare','Mes\WorkDeclareOrderController@getPreWorkDeclare');
