<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/3/8
 * Time: 上午9:41
 */

 /*
 |-----------------------------------------------------------------------
 |领退补模块
 |@author guanghui.chen
 |----------------------------------------------------------------------
 */
 $router->post('api/ltb/GetWorkOrders', 'Api\LTBController@getWorkOrders');
 $router->post('api/ltb/GetUserInfo', 'Api\LTBController@getUserInfo');
 $router->post('api/ltb/GetWorks', 'Api\LTBController@getWorks');
 $router->post('api/ltb/BuildMaterialRequisition', 'Api\LTBController@buildMaterialRequisition');
 $router->post('api/ltb/GetWorkOrderDetail', 'Api\LTBController@getWorkOrderDetail');

/*
 |-----------------------------------------------------------------------
 |钉钉模块
 |@author guanghui.chen
 |----------------------------------------------------------------------
 */
 $router->get('api/dd/getAccesstoken','Api\DingDingController@getAccesstoken');
 $router->get('api/dd/getDeviceInfo','Api\DingDingController@getDeviceInfo');
 $router->get('api/dd/getUser','Api\DingDingController@getUser');
 $router->get('api/dd/getDeviceFaultType','Api\DingDingController@getDeviceFaultType');
 $router->post('api/dd/uploadDeviceRepairFile','Api\DingDingController@uploadDeviceRepairFile');
 $router->post('api/dd/checkExistWaitRepair','Api\DingDingController@checkExistWaitRepair');
 $router->post('api/dd/submitRepairData', 'Api\DingDingController@submitRepairData');
 $router->get('api/dd/getRepairOrders', 'Api\DingDingController@getRepairOrders');
 $router->get('api/dd/getSystemDatetime', 'Api\DingDingController@getSystemDatetime');
 $router->get('api/dd/cancelOrder', 'Api\DingDingController@cancelOrder');
 $router->get('api/dd/detail', 'Api\DingDingController@detail');
 $router->get('api/dd/completedOrder', 'Api\DingDingController@completedOrder');
 $router->post('api/dd/acceptOrder', 'Api\DingDingController@acceptOrder');
 $router->get('api/dd/bindOrCheckExistBind', 'Api\DingDingController@bindOrCheckExistBind');
 $router->post('api/dd/devicePublishProgramme', 'Api\DingDingController@devicePublishProgramme');
 $router->get('api/dd/getDepartments', 'Api\DingDingController@getDepartments');
 $router->get('api/dd/getDepartmentListUserinfo', 'Api\DingDingController@getDepartmentListUserinfo');
 $router->get('api/dd/getUserDetail', 'Api\DingDingController@getUserDetail');
 $router->get('api/dd/getNoticeUsers', 'Api\DingDingController@getNoticeUsers');
 $router->post('api/dd/sendNoticeMsg', 'Api\DingDingController@sendNoticeMsg');
 $router->get('api/dd/sendNoticeDeviceOrder', 'Api\DingDingController@sendNoticeDeviceOrder');
 $router->get('api/dd/getDeviceOptions', 'Api\DingDingController@getDeviceOptions');
 $router->get('api/dd/setDeviceStatus', 'Api\DingDingController@setDeviceStatus');
/*
 |-----------------------------------------------------------------------
 |员工模块
 |@author rick.rui
 |----------------------------------------------------------------------
 */
$router->post('api/Employee/getAllEmployee','Api\EmployeeController@getAllEmployee');
$router->post('api/Employee/getEmployeeInfo','Api\EmployeeController@getEmployeeInfo');


/*
 |-----------------------------------------------------------------------
 |工单模块
 |@author rick.rui
 |----------------------------------------------------------------------
 */
$router->post('api/WorkOrder/unfinishedWorkOrder','Api\WorkOrderController@unfinishedWorkOrder');
$router->post('api/WorkOrder/submitPiece','Api\WorkOrderController@submitPiece');
$router->post('api/WorkOrder/listHistoryWorkOrder','Api\WorkOrderController@listHistoryWorkOrder');
$router->post('api/WorkOrder/submitWorkOrder','Api\WorkOrderController@submitWorkOrder');
$router->post('api/WorkOrder/startUnfinishedWorkOrder','Api\WorkOrderController@startUnfinishedWorkOrder');
$router->post('api/WorkOrder/saveWorkOrder','Api\WorkOrderController@saveWorkOrder');
$router->post('api/WorkOrder/getUsedQty','Api\WorkOrderController@getUsedQty');


/*
 |-----------------------------------------------------------------------
 |报警模块
 |@author rick.rui
 |----------------------------------------------------------------------
 */
$router->post('api/Alarm/getErrorType','Api\AlarmController@getErrorType');
$router->post('api/Alarm/submitErrorType','Api\AlarmController@submitErrorType');
$router->post('api/Alarm/handleWorkOrderAlarm','Api\AlarmController@handleWorkOrderAlarm');



/*
 |-----------------------------------------------------------------------
 | 供测试
 | @author lester.you
 |----------------------------------------------------------------------
 */
$router->get('sap/test[/{apiCode}]', function ($apiCode='INT_PP000300012') {
    $data= [
        [
            'MATNR' => 300105110001,
            'MAKTX' => '物料描述',
            'WERKS' => '1101',
            'KTEXT' => '工艺路线描述',
            'PLNAL' => '01',
            'LOSVN1' => '0',
            'LOSBS1' => 999999,
            'PLNME1' => 'PC',
            'VORNR' => '0010',
            'LTXA1' => '工序描述',
            'ARBPL' => 'MBMS010',
            'STEUS' => 'PP01',
            'BMSCH1' => 100,
            'MEINH' => 'PC',
            'VGW011' => '1',
            'VGE011' => 'H',
            'VGW021' => 2,
            'VGE021' => 'MIN',
            'VGW031' => '',
            'VGE031' => '',
            'VGW041' => '',
            'VGE041' => '',
            'VGW051' => '',
            'VGE051' => '',
            'VGW061' => '',
            'VGE061' => '',
        ],
        [
            'MATNR' => 300105110001,
            'MAKTX' => '物料描述',
            'WERKS' => '1101',
            'KTEXT' => '工艺路线描述',
            'PLNAL' => '01',
            'LOSVN1' => '0',
            'LOSBS1' => 999999,
            'PLNME1' => 'PC',
            'VORNR' => '0020',
            'LTXA1' => '工序描述',
            'ARBPL' => 'MBMS010',
            'STEUS' => 'PP01',
            'BMSCH1' => 100,
            'MEINH' => 'PC',
            'VGW011' => '1',
            'VGE011' => 'H',
            'VGW021' => 2,
            'VGE021' => 'MIN',
            'VGW031' => '',
            'VGE031' => '',
            'VGW041' => '',
            'VGE041' => '',
            'VGW051' => '',
            'VGE051' => '',
            'VGW061' => '',
            'VGE061' => '',
        ]
    ];
    $response = \App\Libraries\Soap::doRequest($data,$apiCode,'0003');
    return json_encode($response);
});