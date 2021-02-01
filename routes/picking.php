<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2019/4/3
 * Time: 1:26 PM
 */

/**
 * ----------------
 * 领料共用
 * ----------------
 */
//删除领料单行项
$router->get('Picking/deletePickingLine','Picking\PickingController@deletePickingLine');
//删除领料单
$router->post('Picking/deleteMergerPicking','Picking\PickingController@deleteMergerPicking');

/**
 * ----------------
 * sap领料
 * ----------------
 */
//获取合并工单要领的料
$router->get('Picking/getPlanNeedMaterial','Picking\SapPickingController@getPlanNeedMaterial');
//添加合并领料单
$router->post('Picking/addPickingBill','Picking\SapPickingController@addPickingBill');
//验证是否可以领料
$router->get('Picking/checkPicking','Picking\SapPickingController@checkPicking');
//根据单个工单号查找领料单集合
$router->get('Picking/getSapPickingByWorkOrder','Picking\SapPickingController@getSapPickingByWorkOrder');
//获取sap合并领料单分页列表
$router->get('Picking/getSapMergerPickingList','Picking\SapPickingController@getSapMergerPickingList');
//获取sap合并领料详情
$router->get('Picking/getSapMergerPickingDetail','Picking\SapPickingController@getSapMergerPickingDetail');
//删除sap合并领料单行项
$router->post('Picking/deleteSapMergerPickingLine','Picking\SapPickingController@deleteSapMergerPickingLine');
//推送sap领料单
$router->get('Picking/sendSapMergerPicking','Picking\SapPickingController@sendSapMergerPicking');
//批量推送sap领料单
$router->get('Picking/sendSapMergerPickingBatch','Picking\SapPickingController@sendSapMergerPickingBatch');
//删除sap合并领料单未发料的行项
$router->post('Picking/deleteSapPickingNotSendLine','Picking\SapPickingController@deleteSapPickingNotSendLine');

/**
 * ----------------
 * 车间领料
 * ----------------
 */
//获取合并工单要领的料
$router->get('Picking/getWorkShopMergerPickingData','Picking\WorkShopPickingController@getWorkShopMergerPickingData');
//添加合并领料单
$router->post('Picking/addShopMergerPicking','Picking\WorkShopPickingController@addShopMergerPicking');
//获取合并领料单
$router->get('Picking/getShopMergerPickingList','Picking\WorkShopPickingController@getShopMergerPickingList');
//车间合并领料检查
$router->get('Picking/checking','Picking\WorkShopPickingController@checking');
//查找领料单详情
$router->get('Picking/getShopMergerPickingDetail','Picking\WorkShopPickingController@getShopMergerPickingDetail');
//查找领料子项的实时库存
$router->get('Picking/getItemMaterialStorage','Picking\WorkShopPickingController@getItemMaterialStorage');
//车间合并领料单单个子项发料
$router->post('Picking/sendShopMergerPickingMaterial','Picking\WorkShopPickingController@sendShopMergerPickingMaterial');
//车间合并领料单入库
$router->post('Picking/shopMergerPickingInStorage','Picking\WorkShopPickingController@shopMergerPickingInStorage');
//车间合并领料单批量入库
$router->post('Picking/shopMergerPickingInStorageBatch','Picking\WorkShopPickingController@shopMergerPickingInStorageBatch');
//车间根据工单号获取车间领料单
$router->get('Picking/getShopPickingByWorkOrder','Picking\WorkShopPickingController@getShopPickingByWorkOrder');
//删除车间合并领料单行项
$router->post('Picking/deleteShopMergerPickingLine','Picking\WorkShopPickingController@deleteShopMergerPickingLine');
//删除车间合并领料单未发料的行项
$router->post('Picking/deleteShopPickingNotSendLine','Picking\WorkShopPickingController@deleteShopPickingNotSendLine');
//合并车间领料 一键全发料
$router->get('Picking/batchDelivery','Picking\WorkShopPickingController@batchDelivery');
//一键发料 显示库存数据
$router->get('Picking/batchDeliverystorage','Picking\WorkShopPickingController@batchDeliverystorage');




//获取合并工单要领的料
$router->get('Picking/getOutWorkShopMergerPickingData','Picking\OutWorkShopPickingController@getWorkShopMergerPickingData');
//添加合并领料单
$router->post('Picking/addOutShopMergerPicking','Picking\OutWorkShopPickingController@addShopMergerPicking');
//获取合并领料单
$router->get('Picking/getOutShopMergerPickingList','Picking\OutWorkShopPickingController@getShopMergerPickingList');
//委外车间合并领料检查
$router->get('Picking/outChecking','Picking\OutWorkShopPickingController@checking');
//查找领料单详情
$router->get('Picking/getOutShopMergerPickingDetail','Picking\OutWorkShopPickingController@getShopMergerPickingDetail');
//查找领料子项的实时库存
$router->get('Picking/getOutItemMaterialStorage','Picking\OutWorkShopPickingController@getItemMaterialStorage');
//车间合并领料单单个子项发料
$router->post('Picking/sendOutShopMergerPickingMaterial','Picking\OutWorkShopPickingController@sendShopMergerPickingMaterial');
//车间合并领料单入库
$router->post('Picking/OutshopMergerPickingInStorage','Picking\OutWorkShopPickingController@shopMergerPickingInStorage');
//车间根据工单号获取车间领料单
$router->get('Picking/getOutShopPickingByWorkOrder','Picking\OutWorkShopPickingController@getShopPickingByWorkOrder');


//手动 推送sap领料单
$router->get('Picking/sendWorkShopMergerPickingSyncSapData','Picking\WorkShopPickingController@sendWorkShopMergerPickingSyncSapData');