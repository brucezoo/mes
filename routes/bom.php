<?php
/**
 * BOM路由放置位置
 * @author  rick.rui
 * @time    2017年12月04日13:26:18
 */

/*
 |-----------------------------------------------------------------------
 |物料清单
 |@author rick.rui
 |@reviser sam.shan
 |----------------------------------------------------------------------
 | 唯一性检测:               Bom/unique
 | 添加:                    Bom/store
 | 修改:                    Bom/update
 | 详情:                    Bom/show
 | 分页列表:                 Bom/pageIndex
 | 获取bom树信息:            Bom/getBomTree
 | 获取设计bom列表:           Bom/getDesignBom
 | 修改bom状态:              Bom/changeStatus
 | 发布版本前检查:            Bom/releaseBeforeCheck
 */


$router->get('Bom/unique','Mes\BomController@unique');
$router->post('Bom/store','Mes\BomController@store');
$router->post('Bom/update','Mes\BomController@update');
$router->get('Bom/destroy','Mes\BomController@destroy');
$router->get('Bom/show','Mes\BomController@show');
$router->get('Bom/pageIndex','Mes\BomController@pageIndex');
$router->get('Bom/getBomTree','Mes\BomController@getBomTree');
$router->get('Bom/getDesignBom','Mes\BomController@getDesignBom');
$router->get('Bom/changeStatus','Mes\BomController@changeStatus');
$router->get('Bom/changeAssembly','Mes\BomController@changeAssembly');
$router->get('Bom/releaseBeforeCheck','Mes\BomController@releaseBeforeCheck');
$router->get('Bom/getEnterBomMaterial','Mes\BomController@getEnterBomMaterial');
$router->get('Bom/getOutBomMaterial','Mes\BomController@getOutBomMaterial');
$router->get('Bom/getMaterialBomNos','Mes\BomController@getMaterialBomNos');
$router->post('Bom/assemblyItem','Mes\BomController@assemblyItem');
$router->get('Bom/getBomReleaseRecord','Mes\BomController@getBomReleaseRecord');
$router->post('Bom/deleteReleaseRecord','Mes\BomController@deleteReleaseRecord');
$router->get('Bom/getBomByDrawingCode','Mes\BomController@getBomByDrawingCode');
$router->get('Bom/getAllBomInmaterial','Mes\BomController@getAllBomInmaterial');
$router->post('Bom/updateBomMaterial','Mes\BomController@updateBomMaterial');
$router->post('Bom/setBomBase','Mes\BomController@setBomBase');

//hao.li 获取所有待维护工时列表
$router->get('Bom/getBomWaitList','Mes\BomController@getBomWaitList');
//hao.li 导出待维护工时列表
$router->get('Bom/exportBomWait','Mes\BomController@exportBomWait');

/*
 |-----------------------------------------------------------------------
 |物料清单分组
 |@author rick.rui
 |@reviser sam.shan
 |----------------------------------------------------------------------
 | 唯一性检测:               BomGroup/unique
 | 添加:                    BomGroup/store
 | 修改:                    BomGroup/update
 | 查看:                    BomGroup/show
 | select列表:              BomGroup/select
 | 分页列表:                 BomGroup/pageIndex
 | 删除:                    BomGroup/destroy
 */

$router->get('BomGroup/unique','Mes\BomGroupController@unique');
$router->post('BomGroup/store','Mes\BomGroupController@store');
$router->post('BomGroup/update','Mes\BomGroupController@update');
$router->get('BomGroup/show','Mes\BomGroupController@show');
$router->get('BomGroup/select','Mes\BomGroupController@select');
$router->get('BomGroup/pageIndex','Mes\BomGroupController@pageIndex');
$router->get('BomGroup/destroy','Mes\BomGroupController@destroy');

/*
 |-----------------------------------------------------------------------
 |制造bom
 |@author rick.rui
 |----------------------------------------------------------------------
 | 添加:                    Bom/store
 | 详情:                    Bom/show
 | 分页列表:                 Bom/pageIndex
 */
$router->get('ManufactureBom/pageIndex','Mes\ManufactureBomController@pageIndex');
$router->post('ManufactureBom/store','Mes\ManufactureBomController@store');
$router->get('ManufactureBom/show','Mes\ManufactureBomController@show');
$router->get('ManufactureBom/destroy','Mes\ManufactureBomController@destroy');
$router->post('ManufactureBom/update','Mes\ManufactureBomController@update');

/*
 |-----------------------------------------------------------------------
 |bom工艺路线
 |@author hao.wei
 |----------------------------------------------------------------------

 */
$router->post('BomRouting/storeLZP','Mes\BomRoutingController@storeLZP');
$router->get('BomRouting/getBomRouting','Mes\BomRoutingController@getBomRouting');
$router->post('BomRouting/saveBomRoutinginfo','Mes\BomRoutingController@saveBomRoutinginfo');
$router->get('BomRouting/getBomRoutings','Mes\BomRoutingController@getBomRoutings');
$router->get('BomRouting/deleteBomRouting','Mes\BomRoutingController@deleteBomRouting');
$router->get('BomRouting/getPreviewData','Mes\BomRoutingController@getPreviewData');
$router->get('BomRouting/getNeedCopyBomRoutingNodeInfo','Mes\BomRoutingController@getNeedCopyBomRoutingNodeInfo');
$router->get('BomRouting/getNeedCopyBomList','Mes\BomRoutingController@getNeedCopyBomList');
$router->get('BomRouting/getBomRoutingDownloadData','Mes\BomRoutingController@getBomRoutingDownloadData');
$router->get('BomRouting/getBomRoutingBaseQty','Mes\BomRoutingController@getBomRoutingBaseQty');
$router->post('BomRouting/updateBomRoutingBaseQty','Mes\BomRoutingController@updateBomRoutingBaseQty');
$router->post('BomRouting/deleteEnterMaterialLzp','Mes\BomRoutingController@deleteEnterMaterialLzp');
$router->post('BomRouting/replaceBomRoutingGn','Mes\BomRoutingController@replaceBomRoutingGn');
$router->get('BomRouting/getCanReplaceBom','Mes\BomRoutingController@getCanReplaceBom');
$router->get('BomRouting/deleteBomRoutingTemplate','Mes\BomRoutingController@deleteBomRoutingTemplate');
$router->get('BomRouting/getUnFinishWoAndPoByBomRouting','Mes\BomRoutingController@getUnFinishWoAndPoByBomRouting');
$router->post('BomRouting/hasNotUsedMaterial','Mes\BomRoutingController@hasNotUsedMaterial');
$router->post('BomRouting/saveBomRoutingCheck','Mes\BomRoutingController@saveBomRoutingCheck');
/*
 |-----------------------------------------------------------------------
 |调用ERP接口，添加bom
 |@author kevin
 |----------------------------------------------------------------------

 */
$router->get('ERP/handleOrder','Mes\ErpbomController@handleOrder');

/*
 |-----------------------------------------------------------------------
 |添加bomg工艺路线模板
 |@author hao.wei
 |----------------------------------------------------------------------
 */
$router->post('BomRouting/addBomRoutingTemplate','Mes\BomRoutingController@addBomRoutingTemplate');
$router->get('BomRouting/getBomRoutingTempLatePageIndex','Mes\BomRoutingController@getBomRoutingTempLatePageIndex');
$router->get('BomRouting/getBomRoutingTemplateDetail','Mes\BomRoutingController@getBomRoutingTemplateDetail');
$router->get('BomRouting/getBomRoutingHasSave','Mes\BomRoutingController@getBomRoutingHasSave');
$router->post('BomRouting/addBomRoutingTemplateQuerys','Mes\BomRoutingTemplateQuerysController@addBomRoutingTemplateQuerys');
$router->get('BomRouting/getBomRoutingTemplateQuerys','Mes\BomRoutingTemplateQuerysController@getBomRoutingTemplateQuerys');

$router->get('BomRouting/exportByOperationId','Mes\BomRoutingController@exportByOperationId');

/*
 |-----------------------------------------------------------------------
 |批量修改工作中心
 |@author hao.li
 |----------------------------------------------------------------------
 */
//导入
$router->post('Bom/importBatchCenter','Mes\BomController@importBatchCenter');
//修改
$router->post('Bom/batchUpdateWorkcenter','Mes\BomController@batchUpdateWorkcenter');
//获取所有需要替换的信息
$router->get('Bom/getAllUpdateWorkcenter','Mes\BomController@getAllUpdateWorkcenter');
//下载模版
$router->get('Bom/downTemplate','Mes\BomController@downTemplate');
//获取工厂
$router->get('Bom/getFactory','Mes\BomController@getFactory');
//获取员工
$router->get('Bom/getEmployee','Mes\BomController@getEmployee');
//批量同步
$router->get('Bom/batchSyncToSap','Mes\BomController@batchSyncToSap');
$router->post('Bom/getTechnologymaterial','Mes\BomController@getTechnologymaterial');
$router->get('Bom/technologyImport','Mes\BomController@technologyImport');