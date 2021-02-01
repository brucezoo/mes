<?php
/**
 * Created by PhpStorm.
 * User: hao.li
 * Date: 8/17
 * Time: 上午9:04
 */

/*
|------------------------------------------------------------------------------
|线下打包
|@author   hao.li
|------------------------------------------------------------------------------
*/

//导入计划表
$router->post('OfflinePackage/planExcelImport','OfflinePackage\OfflinePackageController@planExcelImport');
//获取数据
$router->get('OfflinePackage/getList','OfflinePackage\OfflinePackageController@getList');
//排产
$router->post('OfflinePackage/productionScheduling','OfflinePackage\OfflinePackageController@productionScheduling');

//分线
$router->post('OfflinePackage/branching','OfflinePackage\OfflinePackageController@branching');

//修改分线
$router->post('OfflinePackage/updateBraching','OfflinePackage\OfflinePackageController@updateBraching');

//批量排产
$router->post('OfflinePackage/batchProductPlan','OfflinePackage\OfflinePackageController@batchProductPlan');

//批量领料
$router->post('OfflinePackage/picking','OfflinePackage\OfflinePackageController@picking');

//添加托盘
$router->get('OfflinePackage/addTray','OfflinePackage\OfflinePackageController@addTray');
//获取托盘列表数据
$router->get('OfflinePackage/getTrayList','OfflinePackage\OfflinePackageController@getTrayList');

//获取派工数据
$router->get('OfflinePackage/getdispatching','OfflinePackage\OfflinePackageController@getdispatching');

//生成箱号
$router->get('OfflinePackage/getBoxNo','OfflinePackage\OfflinePackageController@getBoxNo');

//添加托盘数据
$router->post('OfflinePackage/putTary','OfflinePackage\OfflinePackageController@putTary');

//获取托盘页面数据
$router->get('OfflinePackage/getTary','OfflinePackage\OfflinePackageController@getTary');

//报工成箱
$router->post('OfflinePackage/pagaBox','OfflinePackage\OfflinePackageController@pagaBox');

//获取报工明细
$router->get('OfflinePackage/getBox','OfflinePackage\OfflinePackageController@getBox');

//删除报工明细
$router->get('OfflinePackage/deleteBox','OfflinePackage\OfflinePackageController@deleteBox');

//获取托盘数据
$router->get('OfflinePackage/getAllTary','OfflinePackage\OfflinePackageController@getAllTary');

//添加柜号
$router->post('OfflinePackage/insertCounter','OfflinePackage\OfflinePackageController@insertCounter');

//打印箱号
$router->get('OfflinePackage/printBox','OfflinePackage\OfflinePackageController@printBox');

//获取托盘汇总数据
$router->get('OfflinePackage/getZTaryList','OfflinePackage\OfflinePackageController@getZTaryList');

//获取托盘汇总数据明细
$router->get('OfflinePackage/getZTaryItem','OfflinePackage\OfflinePackageController@getZTaryItem');

//打印托盘标识
$router->get('OfflinePackage/printTary','OfflinePackage\OfflinePackageController@printTary');

//批量打印托盘标识
$router->get('OfflinePackage/batchprintTary','OfflinePackage\OfflinePackageController@batchprintTary');

//编辑装箱数据
$router->post('OfflinePackage/editBox','OfflinePackage\OfflinePackageController@editBox');

//销售报表查询
$router->get('OfflinePackage/getSaleOrderList','OfflinePackage\OfflinePackageController@getSaleOrderList');

//装柜列表查询
$router->get('OfflinePackage/containerNumberList','OfflinePackage\OfflinePackageController@containerNumberList');

//装柜汇总列表查询
$router->get('OfflinePackage/getcontainerList','OfflinePackage\OfflinePackageController@getcontainerList');

//获得当天托盘
$router->get('OfflinePackage/getTaryCode','OfflinePackage\OfflinePackageController@getTaryCode');

//获取当前托盘明细
$router->get('OfflinePackage/getNowBox','OfflinePackage\OfflinePackageController@getNowBox');

//获取当前托盘页面数据
$router->get('OfflinePackage/getNowTary','OfflinePackage\OfflinePackageController@getNowTary');

//检查excel数据
$router->post('OfflinePackage/checkData','OfflinePackage\OfflinePackageController@checkData');

//撤销排产
$router->post('OfflinePackage/noPlanProduction','OfflinePackage\OfflinePackageController@noPlanProduction');

//销售订单导出
$router->get('OfflinePackage/saleOrderExcel','OfflinePackage\OfflinePackageController@saleOrderExcel');

//装柜报表导出
$router->get('OfflinePackage/containerImport','OfflinePackage\OfflinePackageController@containerImport');

//托盘汇总报表导出
$router->get('OfflinePackage/taryListImport','OfflinePackage\OfflinePackageController@taryListImport');

//待生产和生产中的数据
$router->get('OfflinePackage/getProductionList','OfflinePackage\OfflinePackageController@getProductionList');

//新增托盘号
$router->post('OfflinePackage/insertTary','OfflinePackage\OfflinePackageController@insertTary');

//装箱
$router->post('OfflinePackage/encasement','OfflinePackage\OfflinePackageController@encasement');

//装托
$router->post('OfflinePackage/palletizer','OfflinePackage\OfflinePackageController@palletizer');
//获取装箱明细
$router->get('OfflinePackage/getBoxList','OfflinePackage\OfflinePackageController@getBoxList');

//物料与SKU导入
$router->post('OfflinePackage/importMaterialSku','OfflinePackage\OfflinePackageController@importMaterialSku');

//获取物料与SKU列表
$router->get('OfflinePackage/getMaterialSku','OfflinePackage\OfflinePackageController@getMaterialSku');

//根据ID获取物料与SKU
$router->get('OfflinePackage/getMaterialSkuById','OfflinePackage\OfflinePackageController@getMaterialSkuById');

//根据ID修改物料与SKU
$router->post('OfflinePackage/updateMaterialSku','OfflinePackage\OfflinePackageController@updateMaterialSku');

//根据ID删除物料与SKU
$router->post('OfflinePackage/deleteMaterialSku','OfflinePackage\OfflinePackageController@deleteMaterialSku');

//新增物料与SKU
$router->post('OfflinePackage/addMaterialSku','OfflinePackage\OfflinePackageController@addMaterialSku');

//删除待排产、待领料、待生产的订单
$router->get('OfflinePackage/deleteSalesOrder','OfflinePackage\OfflinePackageController@deleteSalesOrder');

//物料与SKU导出模版
$router->get('OfflinePackage/exportExcel','OfflinePackage\OfflinePackageController@exportExcel');

//检查不同时间段是否有相同的销售订单和行项
$router->post('OfflinePackage/checkExcelDifferentDate','OfflinePackage\OfflinePackageController@checkExcelDifferentDate');