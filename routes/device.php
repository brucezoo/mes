<?php 
/**
 * mes系统路由放置位置
 * 设备管理
 * @author liming
 * @time    2018年3月29日
 */

   /**
 |------------------------------------------------------------------------------
 |设备参数
 |仓库备件类型
 |@author   guanghui.chen    
 |@reviser  guanghui.chen 
 |------------------------------------------------------------------------------
 |
 */
 $router->get('BeiJianType','Mes\DeviceBeiJianTypeController@select');
 $router->get('BeiJianType/unique','Mes\DeviceBeiJianTypeController@unique');
 $router->post('BeiJianType/store','Mes\DeviceBeiJianTypeController@store');
 $router->post('BeiJianType/storeBatch','Mes\DeviceBeiJianTypeController@storeBatch');
 $router->get('BeiJianType/destroy','Mes\DeviceBeiJianTypeController@destroy');
 $router->post('BeiJianType/update','Mes\DeviceBeiJianTypeController@update');
 $router->get('BeiJianType/show','Mes\DeviceBeiJianTypeController@show');
 $router->get('BeiJianType/treeIndex','Mes\DeviceBeiJianTypeController@treeIndex');

  /**
 |------------------------------------------------------------------------------
 |设备参数
 |仓库定义
 |@author   guanghui.chen    
 |@reviser  guanghui.chen 
 |------------------------------------------------------------------------------
 |
 */
 $router->get('warehouseDefine','Mes\DeviceWarehouseController@select');
 $router->get('warehouseDefine/allshow','Mes\DeviceWarehouseController@allshow');
 $router->get('warehouseDefine/unique','Mes\DeviceWarehouseController@unique');
 $router->post('warehouseDefine/store','Mes\DeviceWarehouseController@store');
 $router->get('warehouseDefine/destroy','Mes\DeviceWarehouseController@destroy');
 $router->post('warehouseDefine/update','Mes\DeviceWarehouseController@update');
 $router->get('warehouseDefine/show','Mes\DeviceWarehouseController@show');
 $router->get('warehouseDefine/pageIndex','Mes\DeviceWarehouseController@pageIndex');

  /**
 |------------------------------------------------------------------------------
 |设备参数
 |备件出入库类型
 |@author   guanghui.chen    
 |@reviser  guanghui.chen 
 |------------------------------------------------------------------------------
 |
 */
 $router->get('BeiJianInOutType','Mes\DeviceBJIOTController@select');
 $router->get('BeiJianInOutType/allshow','Mes\DeviceBJIOTController@allshow');
 $router->get('BeiJianInOutType/unique','Mes\DeviceBJIOTController@unique');
 $router->post('BeiJianInOutType/store','Mes\DeviceBJIOTController@store');
 $router->get('BeiJianInOutType/destroy','Mes\DeviceBJIOTController@destroy');
 $router->post('BeiJianInOutType/update','Mes\DeviceBJIOTController@update');
 $router->get('BeiJianInOutType/show','Mes\DeviceBJIOTController@show');
 $router->get('BeiJianInOutType/pageIndex','Mes\DeviceBJIOTController@pageIndex');

 /**
 |------------------------------------------------------------------------------
 |设备参数
 |设备部门
 |@author   guanghui.chen    
 |@reviser  guanghui.chen 
 |------------------------------------------------------------------------------
 |
 */
$router->get('deviceDepartment','Mes\deviceDepartmentController@select');
$router->get('deviceDepartment/unique','Mes\deviceDepartmentController@unique');
$router->post('deviceDepartment/store','Mes\deviceDepartmentController@store');
$router->post('deviceDepartment/storeBatch','Mes\deviceDepartmentController@storeBatch');
$router->get('deviceDepartment/destroy','Mes\deviceDepartmentController@destroy');
$router->post('deviceDepartment/update','Mes\deviceDepartmentController@update');
$router->get('deviceDepartment/show','Mes\deviceDepartmentController@show');
$router->get('deviceDepartment/treeIndex','Mes\deviceDepartmentController@treeIndex');

/**
 |------------------------------------------------------------------------------
 |设备参数
 |设备类型
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('devicetype','Mes\DeviceTypeController@select');
$router->get('devicetype/unique','Mes\DeviceTypeController@unique');
$router->post('devicetype/store','Mes\DeviceTypeController@store');
$router->post('devicetype/storeBatch','Mes\DeviceTypeController@storeBatch');
$router->get('devicetype/destroy','Mes\DeviceTypeController@destroy');
$router->post('devicetype/update','Mes\DeviceTypeController@update');
$router->get('devicetype/show','Mes\DeviceTypeController@show');
$router->get('devicetype/treeIndex','Mes\DeviceTypeController@treeIndex');
$router->get('devicetype/getParent','Mes\DeviceTypeController@getParent');



/**
 |------------------------------------------------------------------------------
 |设备参数
 |故障类型
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('faulttype','Mes\FaultTypeController@select');
$router->get('faulttype/unique','Mes\FaultTypeController@unique');
$router->post('faulttype/store','Mes\FaultTypeController@store');
$router->get('faulttype/destroy','Mes\FaultTypeController@destroy');
$router->post('faulttype/update','Mes\FaultTypeController@update');
$router->get('faulttype/show','Mes\FaultTypeController@show');
$router->get('faulttype/treeIndex','Mes\FaultTypeController@treeIndex');

 /**
 |------------------------------------------------------------------------------
 |设备参数
 |班组设置
 |@author   guanghui.chen    
 |@reviser  guanghui.chen 
 |------------------------------------------------------------------------------
 |
 */
 $router->get('deviceTeam','Mes\DeviceTeamController@select');
 $router->get('deviceTeam/allshow','Mes\DeviceTeamController@allshow');
 $router->get('deviceTeam/unique','Mes\DeviceTeamController@unique');
 $router->post('deviceTeam/store','Mes\DeviceTeamController@store');
 $router->get('deviceTeam/destroy','Mes\DeviceTeamController@destroy');
 $router->post('deviceTeam/update','Mes\DeviceTeamController@update');
 $router->get('deviceTeam/show','Mes\DeviceTeamController@show');
 $router->get('deviceTeam/pageIndex','Mes\DeviceTeamController@pageIndex');
 $router->post('deviceTeam/getTeamCount','Mes\DeviceTeamController@getTeamCount');
 //设备列表批量删除 hao.li 2019/07/29
 $router->get('devicelist/batchDelete','Mes\DeviceListController@batchDelete');


 /**
 |------------------------------------------------------------------------------
 |设备参数
 |其他选项
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('otheroption','Mes\OtherOptionController@select');
$router->get('otheroption/allshow','Mes\OtherOptionController@allshow');
$router->get('otheroption/unique','Mes\OtherOptionController@unique');
$router->post('otheroption/store','Mes\OtherOptionController@store');
$router->get('otheroption/destroy','Mes\OtherOptionController@destroy');
$router->post('otheroption/update','Mes\OtherOptionController@update');
$router->get('otheroption/show','Mes\OtherOptionController@show');
$router->get('otheroption/pageIndex','Mes\OtherOptionController@pageIndex');



 /**
 |------------------------------------------------------------------------------
 |保养要求
 |其他选项
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('upkeerequire','Mes\UpkeeRequireController@select');
$router->post('upkeerequire/update','Mes\UpkeeRequireController@update');
$router->post('upkeerequire/store','Mes\UpkeeRequireController@store');
$router->get('upkeerequire/destroy','Mes\UpkeeRequireController@destroy');
$router->get('upkeerequire/show','Mes\UpkeeRequireController@show');
$router->get('upkeerequire/pageIndex','Mes\UpkeeRequireController@pageIndex');



 /**
 |------------------------------------------------------------------------------
 |维保经验
 |其他选项
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('upkeeexpreience','Mes\UpkeeExpreienceController@select');
$router->post('upkeeexpreience/update','Mes\UpkeeExpreienceController@update');
$router->post('upkeeexpreience/store','Mes\UpkeeExpreienceController@store');
$router->get('upkeeexpreience/destroy','Mes\UpkeeExpreienceController@destroy');
$router->get('upkeeexpreience/show','Mes\UpkeeExpreienceController@show');
$router->get('upkeeexpreience/pageIndex','Mes\UpkeeExpreienceController@pageIndex');




 /**
 |------------------------------------------------------------------------------
 |设备台账
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */

$router->get('devicelist','Mes\DeviceListController@select');
$router->get('devicelist/unique','Mes\DeviceListController@unique');
$router->post('devicelist/update','Mes\DeviceListController@update');
$router->post('devicelist/store','Mes\DeviceListController@store');
$router->get('devicelist/destroy','Mes\DeviceListController@destroy');
$router->get('devicelist/show','Mes\DeviceListController@show');
$router->get('devicelist/pageIndex','Mes\DeviceListController@pageIndex');
$router->get('devicelist/selects','Mes\DeviceListController@selects');
$router->post('Device/deviceExcelImport','Mes\DeviceListController@deviceExcelImport');
$router->post('Device/importDevice','Mes\DeviceListController@importDevice');

/**
 |------------------------------------------------------------------------------
 |设备报修
 |@author   guanghui.chen   
 |@reviser  guanghui.chen
 |------------------------------------------------------------------------------
 |
 */

 $router->get('deviceRepair','Mes\deviceRepairController@select');
 $router->get('deviceRepair/unique','Mes\deviceRepairController@unique');
 $router->post('deviceRepair/update','Mes\deviceRepairController@update');
 $router->post('deviceRepair/store','Mes\deviceRepairController@store');
 $router->get('deviceRepair/destroy','Mes\deviceRepairController@destroy');
 $router->get('deviceRepair/show','Mes\deviceRepairController@show');
 $router->get('deviceRepair/pageIndex','Mes\deviceRepairController@pageIndex');
 $router->get('deviceRepair/selects','Mes\deviceRepairController@selects');
//导出报修单
 $router->get('deviceRepair/exportDeviceRepair','Mes\deviceRepairController@exportDeviceRepair');

 /**
 |------------------------------------------------------------------------------
 |设备 - 成员管理
 |@author   guanghui.chen   
 |@reviser  guanghui.chen
 |------------------------------------------------------------------------------
 |
 */

 $router->get('deviceMember','Mes\deviceMemberController@select');
 $router->get('deviceMember/unique','Mes\deviceMemberController@unique');
 $router->post('deviceMember/update','Mes\deviceMemberController@update');
 $router->post('deviceMember/store','Mes\deviceMemberController@store');
 $router->get('deviceMember/destroy','Mes\deviceMemberController@destroy');
 $router->get('deviceMember/show','Mes\deviceMemberController@show');
 $router->get('deviceMember/pageIndex','Mes\deviceMemberController@pageIndex');
 $router->get('deviceMember/selects','Mes\deviceMemberController@selects');





 /**
 |------------------------------------------------------------------------------
 |设备报修
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */

$router->get('repairslist','Mes\RepairListController@select');
$router->post('repairslist/audit','Mes\RepairListController@audit');
$router->post('repairslist/noaudit','Mes\RepairListController@noaudit');
$router->post('repairslist/update','Mes\RepairListController@update');
$router->post('repairslist/store','Mes\RepairListController@store');
$router->get('repairslist/destroy','Mes\RepairListController@destroy');
$router->get('repairslist/show','Mes\RepairListController@show');
$router->get('repairslist/pageIndex','Mes\RepairListController@pageIndex');





 /**
 |------------------------------------------------------------------------------
 |维修工单
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('repairsorder','Mes\RepairOrderController@select');
$router->post('repairsorder/audit','Mes\RepairOrderController@audit');
$router->post('repairsorder/noaudit','Mes\RepairOrderController@noaudit');
$router->post('repairsorder/update','Mes\RepairOrderController@update');
$router->post('repairsorder/store','Mes\RepairOrderController@store');
$router->get('repairsorder/destroy','Mes\RepairOrderController@destroy');
$router->get('repairsorder/show','Mes\RepairOrderController@show');
$router->get('repairsorder/pageIndex','Mes\RepairOrderController@pageIndex');




 /**
 |------------------------------------------------------------------------------
 |备件类型
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('sparetype','Mes\SpareTypeController@select');
$router->get('sparetype/unique','Mes\SpareTypeController@unique');
$router->post('sparetype/store','Mes\SpareTypeController@store');
$router->get('sparetype/destroy','Mes\SpareTypeController@destroy');
$router->post('sparetype/update','Mes\SpareTypeController@update');
$router->get('sparetype/show','Mes\SpareTypeController@show');
$router->get('sparetype/treeIndex','Mes\SpareTypeController@treeIndex');



 /**
 |------------------------------------------------------------------------------
 |配件列表
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('sparelist','Mes\SpareListController@select');
$router->get('sparelist/unique','Mes\SpareListController@unique'); 
$router->post('sparelist/update','Mes\SpareListController@update'); 
$router->post('sparelist/store','Mes\SpareListController@store');
$router->get('sparelist/destroy','Mes\SpareListController@destroy');
$router->get('sparelist/show','Mes\SpareListController@show');
$router->get('sparelist/pageIndex','Mes\SpareListController@pageIndex');



 /**
 |------------------------------------------------------------------------------
 |维修计划
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
 $router->get('requireplan/unique','Mes\RequirePlanController@unique');
 $router->post('requireplan/store','Mes\RequirePlanController@store');
 $router->get('requireplan/destroy','Mes\RequirePlanController@destroy');
 $router->post('requireplan/audit','Mes\RequirePlanController@audit');
 $router->post('requireplan/noaudit','Mes\RequirePlanController@noaudit');
 $router->get('requireplan/pageIndex','Mes\RequirePlanController@pageIndex');
 $router->get('requireplan/show','Mes\RequirePlanController@show');
 $router->post('requireplan/update','Mes\RequirePlanController@update');


 /**
 |------------------------------------------------------------------------------
 |保养工单
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('maintainorder','Mes\MaintainOrderController@select');
$router->post('maintainorder/audit','Mes\MaintainOrderController@audit');
$router->post('maintainorder/noaudit','Mes\MaintainOrderController@noaudit');
$router->post('maintainorder/update','Mes\MaintainOrderController@update');
$router->post('maintainorder/store','Mes\MaintainOrderController@store');
$router->get('maintainorder/destroy','Mes\MaintainOrderController@destroy');
$router->get('maintainorder/show','Mes\MaintainOrderController@show');
$router->get('maintainorder/pageIndex','Mes\MaintainOrderController@pageIndex');


 /**
 |------------------------------------------------------------------------------
 |保养计划
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('maintainplan','Mes\MaintainPlanController@select');
$router->post('maintainplan/update','Mes\MaintainPlanController@update');
$router->post('maintainplan/store','Mes\MaintainPlanController@store');
$router->get('maintainplan/destroy','Mes\MaintainPlanController@destroy');
$router->get('maintainplan/show','Mes\MaintainPlanController@show');
$router->get('maintainplan/pageIndex','Mes\MaintainPlanController@pageIndex');



 /**
 |------------------------------------------------------------------------------
 |备件领用
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('sparereceive','Mes\SpareReceiveController@select');
$router->get('sparereceive/unique','Mes\SpareReceiveController@unique');
$router->post('sparereceive/audit','Mes\SpareReceiveController@audit');
$router->post('sparereceive/noaudit','Mes\SpareReceiveController@noaudit');
$router->post('sparereceive/update','Mes\SpareReceiveController@update');
$router->post('sparereceive/store','Mes\SpareReceiveController@store');
$router->get('sparereceive/destroy','Mes\SpareReceiveController@destroy');
$router->get('sparereceive/show','Mes\SpareReceiveController@show');
$router->get('sparereceive/pageIndex','Mes\SpareReceiveController@pageIndex');



 /**
 |------------------------------------------------------------------------------
 |备件购置
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |
 */
$router->get('sparepur','Mes\SparePurController@select');
$router->get('sparepur/unique','Mes\SparePurController@unique');
$router->post('sparepur/audit','Mes\SparePurController@audit');
$router->post('sparepur/noaudit','Mes\SparePurController@noaudit');
$router->post('sparepur/update','Mes\SparePurController@update');
$router->post('sparepur/store','Mes\SparePurController@store');
$router->get('sparepur/destroy','Mes\SparePurController@destroy');
$router->get('sparepur/show','Mes\SparePurController@show');
$router->get('sparepur/pageIndex','Mes\SparePurController@pageIndex');



