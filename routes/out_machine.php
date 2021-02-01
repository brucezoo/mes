<?php 
/**
 * mes系统路由放置位置
 * @author liming
 * @time    2017年11月22日
 */

/**
 |------------------------------------------------------------------------------
 |委外领料单
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |委外领料单分页列表
 |
 |
 */
 $router->get('OutMachine/pageIndex','Mes\OutMachineController@pageIndex');
 $router->get('OutMachine/show','Mes\OutMachineController@show');
 $router->get('OutMachine/destory','Mes\OutMachineController@destory');
//委外采购订单是否已领料
$router->get('OutMachine/checkHasZY03','Mes\OutMachineController@checkHasZY03');
 //批量获取多条数据信息
 $router->get('OutMachine/showMore','Mes\OutMachineController@showMore');


 //通过委外订单获取 委外工单
 $router->get('OutMachine/showOutWork', 'Mes\OutMachineController@showOutWork');

 /**
 |------------------------------------------------------------------------------
 |委外退料 ZY04    ZY05 委外定额领料   ZY06 委外定额退料  ZB03委外补料
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 */
 /*委外相关单据
  */
 $router->post('OutMachineZy/storeZy', 'Mes\OutMachineZyController@storeZy');
 $router->post('OutMachineZy/storeMoreZy', 'Mes\OutMachineZyController@storeMoreZy');
 $router->get('OutMachineZy/destroyZy', 'Mes\OutMachineZyController@destroyZy');
//删除领料详情
$router->get('OutMachineZy/destroyItem','Mes\OutMachineZyController@destroyItem');



 //委外相关单据列表
 $router->get('OutMachineZy/pageIndex', 'Mes\OutMachineZyController@pageIndex');
 $router->get('OutMachineZy/show', 'Mes\OutMachineZyController@show');
 $router->get('OutMachineZy/export', 'Mes\OutMachineZyController@export');
//委外审核修改状态、原因、备注 hao.li
 $router->post('OutMachineZy/update', 'Mes\OutMachineZyController@updateOutsource');

/**
 /--------------------------------------------------------------------------------
 * 委外批量打印
 * shuaijie.feng
 /--------------------------------------------------------------------------------
 */
$router->get('OutMachineZy/getBatchprinting', 'Mes\OutMachineZyController@getBatchprinting');


/**
/--------------------------------------------------------------------------------
 * 委外修改车间补料审核状态
 * 7.16/2019
 * shuaijie.feng
/--------------------------------------------------------------------------------
 */
$router->get('OutMachineShop/supplementaryshopAudit', 'Mes\OutMachineShopController@supplementaryshopAudit');

/**
/--------------------------------------------------------------------------------
 * 委外补料导出
 * 7.27/2019
 * shuaijie.feng
/--------------------------------------------------------------------------------
 */
$router->get('OutMachineZy/FeedingExport', 'Mes\OutMachineZyController@FeedingExport');

/**
/--------------------------------------------------------------------------------
 * 委外订单导出
/--------------------------------------------------------------------------------
 */
$router->get('OutMachine/outsourceOrderExportExcel','Mes\OutMachineController@outsourceOrderExportExcel');

// 委外sap领料单删除未发料行项 shuaijie.feng  9.20/2019
$router->post('OutMachineZy/DeleteRetreatRow', 'Mes\OutMachineZyController@DeleteRetreatRow');






 ?>