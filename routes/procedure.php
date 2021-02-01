<?php 
//  ERPTOMES API
$router->get('Probom/showBom','Proce\ProceController@getBom');
$router->get('Proinv/showInv','Proce\ProceController@getInv');
$router->get('Proorder/showOrder','Proce\ProceController@getOrder');
$router->get('Probom/showBomTree','Proce\ProceController@getBomTree');
$router->get('Proorder/showOrderStatus','Proce\ProceController@getOrderStatus');

// 获取订单以及状态
$router->get('Proorder/showEnterPriseOrder','Proce\ProceController@showEnterPriseOrder');

$router->get('test/liming','Proce\ProceController@limingtest');

/**
 * 获取工序对应的工作中心
 * @author Bruce.Chu
 */
$router->get('procedure/getWorkCenters','Procedure\ProcedureController@getWorkCenters');

/**
 * 获取车间底下的工作中心
 * @author kevin
 */
$router->get('procedure/getWorkshopCenters','Procedure\ProcedureController@getWorkshopCenters');
