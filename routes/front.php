<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 18/1/8
 * Time: 下午5:41
 */



/*
 |错误控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */

$router->get('error/404','Front\ErrorController@noPage');
$router->get('error/412','Front\ErrorController@stop');
$router->get('error/419','Front\ErrorController@expired');
$router->get('error/429','Front\ErrorController@tooMany');
$router->get('error/500','Front\ErrorController@error');
$router->get('error/503','Front\ErrorController@unavailable');





/*
 |首页控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 | 默认后台欢迎页面:     /
 |
 */
$router->get('/','Front\IndexController@index');


/*
 |个人中心控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('CenterManagement/setting','Front\CenterController@setting');
$router->get('CenterManagement/msg','Front\CenterController@msg');
$router->get('CenterManagement/loginLog','Front\CenterController@loginLog');


/*
 |工艺管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('CraftManagement/attributeIndex','Front\CraftManagementController@attributeIndex');

/*
 |物料管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('MaterialManagement/attributeIndex','Front\MaterialManagementController@attributeIndex');
$router->get('MaterialManagement/templateIndex','Front\MaterialManagementController@templateIndex');
$router->get('MaterialManagement/templateCreate','Front\MaterialManagementController@templateCreate');
$router->get('MaterialManagement/templateEdit','Front\MaterialManagementController@templateEdit');
$router->get('MaterialManagement/templateView','Front\MaterialManagementController@templateView');
$router->get('MaterialManagement/categoryIndex','Front\MaterialManagementController@categoryIndex');
$router->get('MaterialManagement/materialIndex','Front\MaterialManagementController@materialIndex');
$router->get('MaterialManagement/materialCreate','Front\MaterialManagementController@materialCreate');
$router->get('MaterialManagement/materialEdit','Front\MaterialManagementController@materialEdit');
$router->get('MaterialManagement/materialView','Front\MaterialManagementController@materialView');

/*
 |物料清单管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('BomManagement/groupIndex','Front\BomManagementController@groupIndex');
$router->get('BomManagement/bomIndex','Front\BomManagementController@bomIndex');
$router->get('BomManagement/lookTechnicsFile','Front\BomManagementController@lookTechnicsFile');
$router->get('BomManagement/bomCreate','Front\BomManagementController@bomCreate');
$router->get('BomManagement/bomEdit','Front\BomManagementController@bomEdit');
$router->get('BomManagement/bomView','Front\BomManagementController@bomView');
$router->get('BomManagement/bomFormView','Front\BomManagementController@bomFormView');
$router->get('BomManagement/manufactureBomView','Front\BomManagementController@manufactureBomView');
$router->get('BomManagement/bomSoView','Front\BomManagementController@bomSoView');
$router->get('BomManagement/bomReplaceView','Front\BomManagementController@bomReplaceView');
/*
 |账户管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('AccountManagement/menuIndex','Front\AccountManagementController@menuIndex');
$router->get('AccountManagement/nodeIndex','Front\AccountManagementController@nodeIndex');
$router->get('AccountManagement/nodeStore','Front\AccountManagementController@nodeStore');
$router->get('AccountManagement/nodeUpdate','Front\AccountManagementController@nodeUpdate');

$router->get('AccountManagement/roleIndex','Front\AccountManagementController@roleIndex');
$router->get('AccountManagement/roleStore','Front\AccountManagementController@roleStore');
$router->get('AccountManagement/roleUpdate','Front\AccountManagementController@roleUpdate');


$router->get('AccountManagement/adminIndex','Front\AccountManagementController@adminIndex');
$router->get('AccountManagement/adminStore','Front\AccountManagementController@adminStore');
$router->get('AccountManagement/adminUpdate','Front\AccountManagementController@adminUpdate');

$router->get('AccountManagement/logIndex','Front\AccountManagementController@logIndex');
$router->get('AccountManagement/maintain', 'Front\AccountManagementController@maintain');

$router->get('AccountManagement/login','Front\AccountManagementController@adminLogin');
$router->get('AccountManagement/logout','Front\AccountManagementController@adminLogout');


/*
 |人事管理控制器
 |-----------------------------------------------------------------------
 |@author rick
 |----------------------------------------------------------------------
 |
 */
$router->get('Personnel/jobIndex','Front\PersonnelController@jobIndex');

$router->get('Personnel/departmentIndex','Front\PersonnelController@departmentIndex');
$router->get('Personnel/departmentCreate','Front\PersonnelController@departmentCreate');
$router->get('Personnel/departmentEdit','Front\PersonnelController@departmentEdit');

$router->get('Personnel/employeeIndex','Front\PersonnelController@employeeIndex');
$router->get('Personnel/employeeCreate','Front\PersonnelController@employeeCreate');
$router->get('Personnel/employeeEdit','Front\PersonnelController@employeeEdit');
$router->get('Personnel/employeeView','Front\PersonnelController@employeeView');

/*
 |图纸库
 |-----------------------------------------------------------------------
 |@author weihao
 |----------------------------------------------------------------------
 |
 */
$router->get('ImageManagement/imageIndex','Front\ImageManagementController@imageIndex');
$router->get('ImageManagement/imageCategoryIndex','Front\ImageManagementController@imageCategoryIndex');
$router->get('ImageManagement/imageGroupIndex','Front\ImageManagementController@imageGroupIndex');
$router->get('ImageManagement/addImage','Front\ImageManagementController@addImage');
$router->get('ImageManagement/updateImage','Front\ImageManagementController@updateImage');
$router->get('ImageManagement/imageAttributeDefine','Front\ImageManagementController@imageAttributeDefine');
$router->get('ImageManagement/ImageGroupType','Front\ImageManagementController@ImageGroupType');
$router->get('ImageManagement/careLabelIndex','Front\ImageManagementController@careLabelIndex');
$router->get('ImageManagement/addCareLabel','Front\ImageManagementController@addCareLabel');



/*
 |系统管理
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('SystemManagement/config','Front\SystemManagementController@config');
$router->get('SystemManagement/msg','Front\SystemManagementController@msg');

/*
 |实施导航
 |-----------------------------------------------------------------------
 |@author rick
 |----------------------------------------------------------------------
 |
 */
$router->get('Implement/dataExport','Front\ImplementController@dataExport');
$router->get('Implement/materialEncoding','Front\ImplementController@materialEncoding');   //物料编码设置
$router->get('Implement/unitSetting','Front\ImplementController@unitSetting');   //物料编码设置

/*
 |工序模块
 |-----------------------------------------------------------------------
 |@author leo
 |----------------------------------------------------------------------
 |
 */
//change by minxin20180316
$router->get('Operation/operationIndex','Front\OperationManagementController@operationIndex');//工序列表

//change by guangyang,wang
$router->get('Operation/operationOrWorkHourSetting','Front\OperationManagementController@operationOrWorkHourSetting');//工艺维护

//add by lesteryou
//做法字段页面：
$router->get('Operation/practiceField','Front\OperationManagementController@practiceField');
//end add

//add by lesteryou
//做法字段页面：
$router->get('Operation/productType','Front\OperationManagementController@productType');
//end add

/*
 |IE模块
 |-----------------------------------------------------------------------
 |@author leo
 |----------------------------------------------------------------------
 |
 */
$router->get('WorkHour/workHourIndex','Front\WorkHourManagementController@workHourIndex');
$router->get('WorkHour/addWorkHour','Front\WorkHourManagementController@addWorkHour');
$router->get('WorkHour/editWorkHour','Front\WorkHourManagementController@editWorkHour');

// add by jiyu
$router->get('Operation/liningType','Front\OperationManagementController@liningType');
$router->get('Operation/plieNumber','Front\OperationManagementController@plieNumber');

//add by minxin 20180320
//功能列表页;
$router->get('Ability/abilityList','Front\AbilityManagementController@abilityList');
$router->get('Language_management/lm', 'Front\LmController@mLm');
$router->get('Translate/translate','Front\LmController@mTranslate');
$router->get('Translate/process','Front\LmController@mProcess');
$router->get('Translate/maintain','Front\LmController@mMaintain');
$router->get('Translate/show','Front\LmController@mShow');
$router->get('Translate/teclist', 'Front\LmController@mTec');
$router->get('Translate/praTra', 'Front\LmController@mPra');
$router->get('Translate/processFile', 'Front\LmController@mProcessFile');
$router->get('Translate/attachment', 'Front\LmController@mAttachment');
$router->get('Translate/workOrderProcess', 'Front\LmController@workOrder');
$router->get('Translate/workProcess', 'Front\LmController@workView');
//end add


/*
 |工艺路线模块
 |-----------------------------------------------------------------------
 |@author minxin20180411
 |----------------------------------------------------------------------
 |
 */
$router->get('Procedure/procedureIndex','Front\ProcedureManagementController@procedureIndex');//工艺路线列表
$router->get('Procedure/procedureEdit','Front\ProcedureManagementController@procedureEdit');//工艺路线编辑
$router->get('Procedure/procedureDetail','Front\ProcedureManagementController@procedureDetail');//工艺路线查看
$router->get('Procedure/procedureAdd','Front\ProcedureManagementController@procedureAdd');//工艺路线添加
$router->get('Procedure/procedureGroup','Front\ProcedureManagementController@procedureGroup');//工艺路线添加

/*
 |做法模块
 |-----------------------------------------------------------------------
 |@author minxin20180412
 |----------------------------------------------------------------------
 |
 */
$router->get('Practice/practiceEdit','Front\PracticeManagementController@practiceEdit');//做法维护
$router->get('Practice/useIndex','Front\PracticeManagementController@useIndex');//做法维护
$router->get('Practice/practiceCategoryIndex','Front\PracticeManagementController@practiceCategoryIndex'); //做法分类
$router->get('Practice/gadgets', 'Front\PracticeManagementController@gadgetsIndex');//做法分类
/*
|------------------------------------------------------------------------------
|工厂管理
|@author hao.wei <weihao>
|------------------------------------------------------------------------------
|
*/
$router->get('FactoryManagement/companyIndex','Front\FactoryManagementController@companyIndex');
$router->get('FactoryManagement/rankPlanDefine','Front\FactoryManagementController@rankPlanDefine');
$router->get('FactoryManagement/rankPlanManage','Front\FactoryManagementController@rankPlanManage');
$router->get('FactoryManagement/factoryDefine','Front\FactoryManagementController@factoryDefine');
$router->get('FactoryManagement/rankPlanType','Front\FactoryManagementController@rankPlanType');
/*
|------------------------------------------------------------------------------
|生产管理
|@author  rick
|------------------------------------------------------------------------------
|
*/
$router->get('ProductOrder/productOrderIndex','Front\ProductOrderController@productOrderIndex');
$router->get('ProductOrder/productOrderCreate','Front\ProductOrderController@productOrderCreate');
$router->get('ProductOrder/productOrderEdit','Front\ProductOrderController@productOrderEdit');
$router->get('ProductOrder/productOrderView','Front\ProductOrderController@productOrderView');
//生产看板
$router->get('ProductOrder/productOrderBoardView','Front\ProductOrderController@productOrderBoardView');

$router->get('WorkTask/workTaskIndex','Front\WorkTaskController@workTaskIndex');
$router->get('WorkTask/workTaskView','Front\WorkTaskController@workTaskView');
//查看工单工艺
$router->get('ProductOrder/productOrderWoCraftView','Front\ProductOrderController@productOrderWoCraftView');
//查看销售订单工艺
$router->get('ProductOrder/productOrderSoCraftView','Front\ProductOrderController@productOrderSoCraftView');


/*
-----------------------------------------------------------------------------------
打包上线
-----------------------------------------------------------------------------------
*/
// 导入计划表与排产
$router->get('Pack/import','Front\PackController@mImport');
// 装柜
$router->get('Pack/cabinet','Front\PackController@mCabinet');
// 报工
$router->get('Pack/worker','Front\PackController@mWorker');
// 销售查询
$router->get('Pack/summaryTable','Front\PackController@mTable');
// 装柜查询
$router->get('Pack/find','Front\PackController@mFind');
// 汇总
$router->get('Pack/summary','Front\PackController@mSummary');
// 装箱
$router->get('Pack/boxing','Front\PackController@mBoxing');
// sku
$router->get('Pack/sku','Front\PackController@mSku');

/*------------------------------------- end ---------------------------------------*/


// 生产报表
// guanghui.chen
$router->get('WorkReport/workReportIndex','Front\WorkReportController@workReportIndex');
//change by guangyang,wang
$router->get('WorkOrder/workOrderIndex','Front\WorkOrderController@workOrderIndex');
$router->get('WorkOrder/combineIndex','Front\WorkOrderController@combineIndex');
$router->get('WorkOrder/combineShopIndex','Front\WorkOrderController@combineShopIndex');
$router->get('WorkOrder/combineItems','Front\WorkOrderController@combineItems');
$router->get('WorkOrder/combineShopItems','Front\WorkOrderController@combineShopItems');
$router->get('WorkOrder/combineReturnIndex','Front\WorkOrderController@combineReturnIndex');
$router->get('WorkOrder/combineReturnItems','Front\WorkOrderController@combineReturnItems');
$router->get('WorkOrder/workOrderView','Front\WorkOrderController@workOrderView');
//change by guangyang,wang
$router->get('WorkOrder/createPickingList','Front\WorkOrderController@createPickingList');
$router->get('WorkOrder/createPickingForm','Front\WorkOrderController@createPickingForm');
$router->get('WorkOrder/createWorkshopPickingList','Front\WorkOrderController@createWorkshopPickingList');
$router->get('WorkOrder/viewPickingList','Front\WorkOrderController@viewPickingList');
//发料详情
$router->get('WorkOrder/viewWorkshopPickingList','Front\WorkOrderController@viewWorkshopPickingList');
//车间合并发料详情
$router->get('WorkOrder/viewWorkshopPickingListSend','Front\WorkOrderController@viewWorkshopPickingListSend');
$router->get('WorkOrder/viewPickingListForPicking','Front\WorkOrderController@viewPickingList');
$router->get('WorkOrder/viewPickingListForAllPicking','Front\WorkOrderController@viewPickingListForAllPicking');
$router->get('WorkOrder/viewShopPickingListForAllPicking','Front\WorkOrderController@viewShopPickingListForAllPicking');
$router->get('WorkOrder/pickingList','Front\WorkOrderController@pickingList');
$router->get('WorkOrder/workshopPickingList','Front\WorkOrderController@workshopPickingList');
$router->get('WorkOrder/workshopPickingListPage','Front\WorkOrderController@workshopPickingListPage');
//委外发料@zhaobc
$router->get('WorkOrder/outsourcingSendMaterials','Front\WorkOrderController@outsourcingSendMaterials');

//实时看板
$router->get('WorkTask/realTimeBashboard','Front\TestManagementController@testFour');

//异常原因维护
$router->get('SpecialCause/specialCauseIndex','Front\WorkOrderController@specialCauseIndex');

$router->get('Schedule/master','Front\ScheduleController@master');
$router->get('Schedule/detail','Front\ScheduleController@detail');
$router->get('Schedule/detailProduction','Front\ScheduleController@detailProduction');
$router->get('Schedule/splitOrder','Front\ScheduleController@splitOrder');
//add by guangyang.wang
$router->get('ProductOrder/pullOrderIndex','Front\ProductOrderController@pullOrderIndex');
$router->get('ProductOrder/pullOrderbom','Front\ProductOrderController@pullOrderbom');

$router->get('ProductOrder/productOrderReleased','Front\ProductOrderController@productOrderReleased');
$router->get('ProductOrder/productOrderReleasedView','Front\ProductOrderController@productOrderReleasedView');
/*
|------------------------------------------------------------------------------
|测试区域
|@author  sam.shan  <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|
*/
$router->get('TestManagement/ally','Front\TestManagementController@ally');
$router->get('TestManagement/chaidan','Front\TestManagementController@chaidan');
$router->get('TestManagement/testThree','Front\TestManagementController@testThree');
$router->get('TestManagement/testFour','Front\TestManagementController@testFour');


/*
|------------------------------------------------------------------------------
|仓库设置
|@author  liming
|------------------------------------------------------------------------------
|
*/
$router->get('WareHouse/depotSetting','Front\DepotsController@depotIndex');
$router->get('WareHouse/subareaSetting','Front\SubareasController@subareaIndex');
$router->get('WareHouse/binSetting','Front\BinsController@binIndex');

/*
|------------------------------------------------------------------------------
|仓库业务
|@author  liming
|------------------------------------------------------------------------------
|
*/
$router->get('WareHouse/otherInstoreIndex','Front\StorageOtherInstoreController@instoreIndex');
$router->get('WareHouse/otherInstoreAdd','Front\StorageOtherInstoreController@addInstore');
$router->get('WareHouse/otherInstoreEdit','Front\StorageOtherInstoreController@editInstore');
$router->get('WareHouse/otherInstoreView','Front\StorageOtherInstoreController@viewInstore');

$router->get('WareHouse/otherOutstoreIndex','Front\StorageOtherOutstoreController@outstoreIndex');
$router->get('WareHouse/otherOutstoreAdd','Front\StorageOtherOutstoreController@addOutstore');
$router->get('WareHouse/otherOutstoreEdit','Front\StorageOtherOutstoreController@editOutstore');
$router->get('WareHouse/otherOutstoreView','Front\StorageOtherOutstoreController@viewOutstore');

$router->get('WareHouse/storageConsumptionIndex','Front\StorageConsumptionController@storageConsumptionIndex');
$router->get('WareHouse/storageConsumptionAdd','Front\StorageConsumptionController@addStorageConsumption');
$router->get('WareHouse/storageConsumptionEdit','Front\StorageConsumptionController@editStorageConsumption');
$router->get('WareHouse/storageConsumptionView','Front\StorageConsumptionController@viewStorageConsumption');

$router->get('WareHouse/storageInitialIndex','Front\StorageInitialController@initialIndex');
$router->get('WareHouse/storageInitialAdd','Front\StorageInitialController@addInitial');
$router->get('WareHouse/storageInitialEdit','Front\StorageInitialController@editInitial');
$router->get('WareHouse/storageInitialView','Front\StorageInitialController@viewInitial');


$router->get('WareHouse/storageCheckIndex','Front\StorageCheckController@checkIndex');
$router->get('WareHouse/storageCheckAdd','Front\StorageCheckController@addCheck');
$router->get('WareHouse/storageCheckEdit','Front\StorageCheckController@editCheck');
$router->get('WareHouse/storageCheckView','Front\StorageCheckController@viewCheck');
$router->get('WareHouse/StoreView','Front\StorageCheckController@StoreView');//库存盘点单

$router->get('WareHouse/storageAllocateIndex','Front\StorageAllocateController@allocateIndex');
$router->get('WareHouse/storageAllocateAdd','Front\StorageAllocateController@addAllocate');
$router->get('WareHouse/storageAllocateEdit','Front\StorageAllocateController@editAllocate');
$router->get('WareHouse/storageAllocateView','Front\StorageAllocateController@viewAllocate');

$router->get('WareHouse/storageMoveIndex','Front\StorageMoveController@moveIndex');
$router->get('WareHouse/storageMoveAdd','Front\StorageMoveController@addMove');
$router->get('WareHouse/storageMoveEdit','Front\StorageMoveController@editMove');
$router->get('WareHouse/storageMoveView','Front\StorageMoveController@viewMove');


$router->get('WareHouse/storageInstoreItem','Front\StorageInstoreItemController@storageInItemIndex');
$router->get('WareHouse/storageOutstoreItem','Front\StorageOutstoreItemController@storageOutItemIndex');
$router->get('WareHouse/storageInve','Front\StorageInveController@inveIndex');


/*
|------------------------------------------------------------------------------
|QC management
|@author  guangyang.wang
|------------------------------------------------------------------------------
|
*/
//委外SAP补料审核列表
$router->get('QC/outSourceReviewList','Front\WorkOrderController@outSourceReviewList');
//委外补料审核
$router->get('QC/outSourceReview','Front\WorkOrderController@outSourceReview');


$router->get('QC/outSourceFeedingPageIndex','Front\OutsourceController@outSourceFeedingPageIndex');
$router->get('QC/outSourceFeedingShow','Front\OutsourceController@outSourceFeedingShow');
$router->get('Out/waterCode', 'Front\OutsourceController@waterCodes');
$router->get('Out/addWaterCode', 'Front\OutsourceController@addWaterCodes');
$router->get('Out/editWaterCode', 'Front\OutsourceController@editWaterCodes');
$router->get('Out/adWaterCode', 'Front\OutsourceController@editWaterCodes');


$router->get('QC/typeSetting','Front\QCBasicSettingController@typeSetting');
$router->get('QC/missingItemsSetting','Front\QCBasicSettingController@missingItems');
$router->get('QC/templateCreate','Front\QCBasicSettingController@templateCreate');
$router->get('QC/inspectObject','Front\QCBasicSettingController@inspectObject');

$router->get('QC/inspectionIQCIndex','Front\QCInspectionecordController@inspectionIQCIndex');
$router->get('QC/inspectionIQCPlan','Front\QCInspectionecordController@inspectionIQCPlan');
$router->get('QC/inspectionIPQCIndex','Front\QCInspectionecordController@inspectionIPQCIndex');
$router->get('QC/inspectionOQCIndex','Front\QCInspectionecordController@inspectionOQCIndex');
$router->get('QC/inspectionOSQCIndex','Front\QCInspectionecordController@inspectionOSQCIndex');

$router->get('QC/viewDeviationApply','Front\QCInspectionecordController@deviationApplyList');
$router->get('QC/acceptOnDeviationApply','Front\QCInspectionecordController@acceptOnDeviationApply');
$router->get('QC/acceptOnDeviationAudit','Front\QCInspectionecordController@acceptOnDeviationAudit');
$router->get('QC/addSpecialPurchaseApply','Front\QCInspectionecordController@addSpecialPurchaseApply');
$router->get('QC/viewSpecialPurchaseApply','Front\QCInspectionecordController@viewSpecialPurchaseApply');
$router->get('QC/editSpecialPurchaseApply','Front\QCInspectionecordController@editSpecialPurchaseApply');
$router->get('QC/viewSpecialPurchaseReply','Front\QCInspectionecordController@viewSpecialPurchaseReply');
$router->get('QC/editSpecialPurchaseReply','Front\QCInspectionecordController@editSpecialPurchaseReply');

$router->get('QC/abnormalApply','Front\QCInspectionecordController@abnormalApply');
$router->get('QC/abnormalView','Front\QCInspectionecordController@abnormalView');
$router->get('QC/addAbnormalApply','Front\QCInspectionecordController@addAbnormalApply');
$router->get('QC/viewAbnormalApply','Front\QCInspectionecordController@viewAbnormalApply');
$router->get('QC/editAbnormalApply','Front\QCInspectionecordController@editAbnormalApply');
$router->get('QC/abnormalReply','Front\QCInspectionecordController@abnormalReply');
$router->get('QC/viewAbnormalReply','Front\QCInspectionecordController@viewAbnormalReply');
$router->get('QC/editAbnormalReply','Front\QCInspectionecordController@editAbnormalReply');

$router->get('QC/abnormalSendList','Front\QCInspectionecordController@abnormalSendList');

$router->get('QC/addComplaint','Front\QCComplaintManagementController@addComplaint');

$router->get('QC/viewComplaint','Front\QCComplaintManagementController@viewComplaint');
$router->get('QC/disposeComplaint','Front\QCComplaintManagementController@disposeComplaint');
$router->get('QC/replyComplaint','Front\QCComplaintManagementController@replyComplaint');
$router->get('QC/auditComplaint','Front\QCComplaintManagementController@auditComplaint');

$router->get('QC/viewComplaintById','Front\QCComplaintManagementController@viewComplaintById');
$router->get('QC/disposeComplaintSend','Front\QCComplaintManagementController@disposeComplaintSend');
$router->get('QC/replyComplaintView','Front\QCComplaintManagementController@replyComplaintView');


$router->get('QC/addComplaintItem','Front\QCComplaintManagementController@addComplaintItem');
$router->get('QC/viewComplaintItem','Front\QCComplaintManagementController@viewComplaintItem');
$router->get('QC/editComplaintItem','Front\QCComplaintManagementController@editComplaintItem');
$router->get('QC/message','Front\QCComplaintManagementController@message');

$router->get('QC/qualityResumeList','Front\QCInspectionecordController@qualityResumeList');
$router->get('QC/viewQualityResume','Front\QCInspectionecordController@viewQualityResume');
$router->get('QC/editQualityResume','Front\QCInspectionecordController@editQualityResume');
$router->get('QC/application','Front\QCInspectionecordController@application');

$router->get('QC/personnelMessage','Front\QCInspectionecordController@personnelMessage');
/*
|------------------------------------------------------------------------------
|销售管理
|@author  weihao
|------------------------------------------------------------------------------
|
*/
$router->get('/Sell/customerDefine','Front\SellManagementController@customerDefine');
$router->get('/Sell/sellOrder','Front\SellManagementController@sellOrder');
$router->get('/Sell/sellOrderAdd','Front\SellManagementController@sellOrderAdd');
$router->get('/Sell/sellOrderUpdate','Front\SellManagementController@sellOrderUpdate');
$router->get('/Sell/sellOrderShow','Front\SellManagementController@sellOrderShow');


/*
|------------------------------------------------------------------------------
|设备管理
|@author   guangyang.wang & guanghui.chen 
|------------------------------------------------------------------------------
|
*/
$router->get('/Device/BeiJianType','Front\DeviceManagementController@BeiJianType');
$router->get('/Device/warehouseDefine','Front\DeviceManagementController@warehouseDefine');
$router->get('/Device/BeiJianInOutType','Front\DeviceManagementController@BeiJianInOutType');
$router->get('/Device/deviceTeam','Front\DeviceManagementController@deviceTeam');
$router->get('/Device/deviceDepartment','Front\DeviceManagementController@deviceDepartment');
$router->get('/Device/deviceType','Front\DeviceManagementController@deviceType');
$router->get('/Device/faultType','Front\DeviceManagementController@faultType');
$router->get('/Device/otherOption','Front\DeviceManagementController@otherOpthion');
$router->get('/Device/upkeeRequire','Front\DeviceManagementController@upkeeRequire');
$router->get('/Device/upkeeExpreience','Front\DeviceManagementController@upkeeExpreience');
$router->get('/Device/operateUpkeeExpreience','Front\DeviceManagementController@operateUpkeeExpreience');
$router->get('/Device/deviceList','Front\DeviceManagementController@deviceList');
$router->get('/Device/deviceListQRcode','Front\DeviceManagementController@deviceListQRcode');
$router->get('/Device/repairsList','Front\DeviceManagementController@repairsList');
$router->get('/Device/repairsOrder','Front\DeviceManagementController@repairsOrder');
$router->get('/Device/requirePlan','Front\DeviceManagementController@requirePlan');
$router->get('/Device/maintainOrder','Front\DeviceManagementController@maintainOrder');
$router->get('/Device/maintainPlan','Front\DeviceManagementController@maintainPlan');
$router->get('/Device/deviceRepairs','Front\DeviceManagementController@deviceRepairs');
$router->get('/Device/deviceMember','Front\DeviceManagementController@deviceMember');



/*
|------------------------------------------------------------------------------
|版本管理
|@author   kevin
|------------------------------------------------------------------------------
|
*/
$router->get('Version/versionList','Front\VersionManagerController@versionList');

/*
|------------------------------------------------------------------------------
|委外管理
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Outsource/outsourceIndex','Front\OutsourceController@outsourceIndex');
$router->get('Outsource/outsourceAllItems','Front\OutsourceController@outsourceAllItems');
$router->get('Outsource/outsourceIndexForCustomer','Front\OutsourceController@outsourceIndexForCustomer');
$router->get('Outsource/viewOutsource','Front\OutsourceController@viewOutsource');
$router->get('Outsource/viewOutsourceCopy','Front\OutsourceController@viewOutsource');
$router->get('Outsource/createOutsource','Front\OutsourceController@createOutsource');
$router->get('Outsource/editOutsource','Front\OutsourceController@editOutsource');

$router->get('Outsource/outsourceOrderIndex','Front\OutsourceController@outsourceOrderIndex');
$router->get('Outsource/viewOutsourceOrder','Front\OutsourceController@viewOutsourceOrder');
$router->get('Outsource/viewOutsourceOrderCopy','Front\OutsourceController@viewOutsourceOrder');

$router->get('Outsource/createOutsourceOrder','Front\OutsourceController@createOutsourceOrder');
$router->get('Outsource/editOutsourceOrder','Front\OutsourceController@editOutsourceOrder');
$router->get('Outsource/sendOutsourceOrder','Front\OutsourceController@sendOutsourceOrder');
$router->get('Outsource/busteOutsourceOrder','Front\OutsourceController@busteOutsourceOrder');
$router->get('Outsource/outsourcePickingIndex','Front\OutsourceController@outsourcePickingIndex');

// 修改  start ----------------------------------------------

$router->get('Out/editOut','Front\OutsourceController@editOut');

// 修改  end  --------------------------------------------------

$router->get('Outsource/outsourceWorkshopManage','Front\OutsourceController@outsourceWorkshopManage');
$router->get('Outsource/consolidateRequisition','Front\OutsourceController@consolidateRequisition');
$router->get('Outsource/outsourceWorkshopPicking','Front\OutsourceController@outsourceWorkshopPicking');
$router->get('Outsource/outsourceWorkshopStoreIssue','Front\OutsourceController@outsourceWorkshopStoreIssue');
$router->get('Outsource/outsourceShopAllItems','Front\OutsourceController@outsourceShopAllItems');


/*
|------------------------------------------------------------------------------
|边角料及称重
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Offcut/offcutIndex','Front\OffcutController@pageIndex');
$router->get('Offcut/offcutWeightIndex','Front\OffcutController@pageWeightIndex');
$router->get('Offcut/offcutWeightShowAll','Front\OffcutController@offcutWeightShowAll');

// 地磅称重
$router->get('Offcut/weigh','Front\OffcutController@mWeigh');


/*
|------------------------------------------------------------------------------
|报工
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/


$router->get('Buste/busteIndex','Front\BusteController@busteIndex');
$router->get('Buste/bustePageIndex','Front\BusteController@bustePageIndex');
$router->get('Buste/reportWorkers', 'Front\BusteController@reportWorkers');
$router->get('Buste/reportDetails', 'Front\BusteController@reportDetails');

/**
 * 
 * 合并报工
 * @author zhaobc
 * 
 */
$router->get('Buste/mergeBuste','Front\BusteController@mergeBuste');
$router->get('Buste/mergeBusteIndex','Front\BusteController@mergeBusteIndex');
$router->get('Buste/inventoryMergeBusteIndex','Front\BusteController@inventoryMergeBusteIndex');

/**
 * 
 * 委外合并报工
 * @author zhaobc
 * 
 */
$router->get('Outsource/outsourceMergeBuste','Front\OutsourceController@outsourceMergeBuste');
$router->get('Outsource/outsourceMergeBusteIndex','Front\OutsourceController@outsourceMergeBusteIndex');

/*
|------------------------------------------------------------------------------
|索赔单
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Claim/claimIndex','Front\QCComplaintManagementController@claimIndex');
$router->get('Claim/addClaim','Front\QCComplaintManagementController@addClaim');
$router->get('Claim/viewClaim','Front\QCComplaintManagementController@viewClaim');
$router->get('Claim/reviewClaim','Front\QCComplaintManagementController@reviewClaim');
$router->get('Claim/replyClaimIndex','Front\QCComplaintManagementController@replyClaimIndex');
$router->get('Log/viewLogRecord','Front\LogRecordController@viewLogRecord');

/**
 * 
 * 失效成本管理
 * @author zhaobc
 */
$router->get('QC/invalidCostIndex','Front\QCComplaintManagementController@invalidCostIndex');
$router->get('QC/invalidCostList','Front\QCComplaintManagementController@invalidCostList');
$router->get('QC/invalidList','Front\QCComplaintManagementController@getInvalidList');
$router->get('QC/invalidCostHandleList','Front\QCComplaintManagementController@invalidCostHandleList');
$router->get('QC/invalidCostCheckList','Front\QCComplaintManagementController@invalidCostCheckList');
$router->get('QC/defectiveItemList','Front\QCComplaintManagementController@defectiveItemList');//不良项目
$router->get('QC/processingMethodList','Front\QCComplaintManagementController@processingMethodList');
$router->get('QC/expiredItemList','Front\QCComplaintManagementController@expiredItemList');//失效项目
$router->get('QC/departmentList','Front\QCComplaintManagementController@departmentList');//失效项目
$router->get('QC/departmentLists','Front\QCComplaintManagementController@departmentLists');

/**
 * 
 * 系统分析管理
 * @author zhaobc
 */
$router->get('QC/AnnualSummary','Front\QCSystemAnalysisController@AnnualSummary');
$router->get('QC/invalidCostReport','Front\QCSystemAnalysisController@invalidCostReport');
$router->get('QC/invalidCostAnnualReport','Front\QCSystemAnalysisController@invalidCostAnnualReport');
$router->get('QC/failureSummary','Front\QCSystemAnalysisController@failureSummary');
$router->get('QC/MonthlySummary','Front\QCSystemAnalysisController@monthlySummary');
$router->get('QC/blReport','Front\QCSystemAnalysisController@blReport');
//客诉
$router->get('QC/customerComplaint','Front\QCSystemAnalysisController@CustomerComplaint');
$router->get('QC/anomalyAnalysis','Front\QCSystemAnalysisController@anomalyAnalysis');
//$router->get('QC/MonthlySummary','Front\QCSystemAnalysisController@monthlySummary');

/*
|------------------------------------------------------------------------------
|委外数据导入
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Outsource/ImportExcel','Front\ImportExcelController@ImportExcel');
$router->get('Outsource/ImportExcelItem','Front\ImportExcelController@ImportExcelItem');

/*
|------------------------------------------------------------------------------
|往来业务伙伴
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/
$router->get('PartnerView/pageIndex','Front\PartnerController@pageIndex');
//新旧对照
$router->get('CodeComparative/pageIndex','Front\CodeComparativeController@pageIndex');
//模塑车间看板
$router->get('Molding/taskboard','Front\TaskboardController@taskboard');
//模塑生产统计
$router->get('Molding/productionStatistics','Front\TaskboardController@productionStatistics');

//补料审核列表
$router->get('WorkOrder/auditPickingListPageIndex','Front\WorkOrderController@auditPickingListPageIndex');

//补料审核
$router->get('WorkOrder/auditPickingList','Front\WorkOrderController@auditPickingList');

// 超投审核
$router->get('WorkOrder/toexamine','Front\WorkOrderController@toexamine');

//批领料

$router->get('PickingAll/PickingAllPageIndex','Front\WorkOrderController@pickingAllPageIndex');
$router->get('PickingAll/addPickingAllItems','Front\WorkOrderController@addPickingAllItems');
$router->get('PickingAll/editPickingAllItems','Front\WorkOrderController@editPickingAllItems');
$router->get('PickingAll/viewickingAllItems','Front\WorkOrderController@addPickingAllItems');

$router->get('PickingAll/PickingAllNewPageIndex','Front\WorkOrderController@pickingAllNewPageIndex');
$router->get('PickingAll/addPickingAllNewItems','Front\WorkOrderController@addPickingAllNewItems');
$router->get('PickingAll/editPickingAllNewItems','Front\WorkOrderController@editPickingAllNewItems');


/*
|------------------------------------------------------------------------------
|模板字段
|@author   cm
|------------------------------------------------------------------------------
|
*/ 
$router->get('SetTemplate/templateField','Front\OperationManagementController@templateField');

$router->get('BomManagement/bomgyView','Front\BomManagementController@bomgyView');


/*
|------------------------------------------------------------------------------
|报工pad
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/
$router->get('Buste/bustePad','Front\BusteController@bustePad');

/**
 * 
 * 删除订单工具
 */

 $router->get('Tools/deleteProductOrder','Front\ProductOrderController@deleteDeleteableProductOrder');

/*
|------------------------------------------------------------------------------
|根据工位查看排班
|@author   bingchun.zhao
|------------------------------------------------------------------------------
|
*/
$router->get('Schedule/viewStationOrder','Front\ScheduleController@viewStationOrder');

/*
|------------------------------------------------------------------------------
|报表管理
|@author   bingchun.zhao
|------------------------------------------------------------------------------
|
*/
//车间在制库存列表
$router->get('ReportCharts/workshopProducedList','Front\ReportChartsController@viewWorkshopProducedList');
//车间报表
$router->get('ReportCharts/workShopList','Front\ReportChartsController@viewWorkshopList');
//批次追溯报表
$router->get('ReportCharts/batchList','Front\ReportChartsController@viewBatchList');
//委外车间报表
$router->get('ReportCharts/outsourceWorkshopList','Front\ReportChartsController@viewOutsourceWorkshopList');

$router->get('ReportCharts/warehouse', 'Front\ReportChartsController@viewWarehouse');
$router->get('ReportCharts/batchDetailList','Front\ReportChartsController@batchDetailList');

$router->get('ReportCharts/inspection', 'Front\ReportChartsController@viewInspection');

/*
|------------------------------------------------------------------------------
|替换料日志
|@author   bingchun.zhao
|------------------------------------------------------------------------------
|
*/
$router->get('WorkShop/ReplacementLogList','Front\ProductOrderController@viewReplacementLogList');

/*
|------------------------------------------------------------------------------
|样册号管理
|@author   bingchun.zhao
|------------------------------------------------------------------------------
|
*/
$router->get('SampleNumber/SampleNumberList','Front\SampleNumberController@sampleNumberList');
$router->get('SampleNumber/SampleNumberTypeList','Front\SampleNumberController@sampleNumberTypeList');
$router->get('SampleNumber/SampleNumberCodeList','Front\SampleNumberController@sampleNumberCodeList');
$router->get('SampleNumber/addSampleNumber','Front\SampleNumberController@addSampleNumber');
$router->get('SampleNumber/viewSampleNumber','Front\SampleNumberController@viewSampleNumber');

/**
 * 
 * 清单管理
 * @author zhaobc
 */
//清单列表
$router->get('WorkOrder/InventoryManagement','Front\WorkOrderController@inventoryManagement');
//生成清单列表
$router->get('WorkOrder/InventorySave','Front\WorkOrderController@inventorySave');


/**
 * 
 * 批次管理
 * @author zhaobc
 */
$router->get('Batch/TraceBackBatch','Front\BatchManagementController@traceBackBatch');
$router->get('Batch/TraceBackFinishedBatch','Front\BatchManagementController@TraceBackFinishedBatch');
$router->get('Batch/batchList','Front\BatchManagementController@batchList');
$router->get('Batch/batchTraceDeclareList','Front\BatchManagementController@batchTraceDeclareList');	
$router->get('Batch/finishedProductBatchList','Front\BatchManagementController@finishedProductBatchList');


/*
|------------------------------------------------------------------------------
|余料库存清理
|
|------------------------------------------------------------------------------
|
*/
$router->get('Consume/consume', 'Front\ConsumeController@lConsume');
$router->get('Consume/consumeAdd', 'Front\ConsumeController@consumeAdd');

/*
|------------------------------------------------------------------------------
|库存查询
|
|------------------------------------------------------------------------------
|
*/
$router->get('Stock/stockSearch', 'Front\StockController@stockSearch');
$router->get('Stock/stockSee', 'Front\StockController@stockSee');

/*
|------------------------------------------------------------------------------
|新替换料日志
|@author   bingchun.zhao
|------------------------------------------------------------------------------
|
*/
$router->get('WorkOrder/replaceMaterial','Front\ProductOrderController@replaceMaterial');
