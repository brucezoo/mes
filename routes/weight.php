<?php
/**
 * Created by PhpStorm.
 * User: hao.li
 * Date: 10/08
 * Time: 上午9:04
 */

/*
|------------------------------------------------------------------------------
|称重
|@author   hao.li
|------------------------------------------------------------------------------
*/

//获取所有工厂
$router->get('Weight/getFactory','Weight\WeightController@getFactory');

//获取所有边角料树状列表
$router->get('Weight/select','Weight\WeightController@select');

//获取当天边角料无框称重列表
$router->get('Weight/selectWeight','Weight\WeightController@selectWeight');

//获取边角料称重列表
$router->get('Weight/getAllWeight','Weight\WeightController@getAllWeight');

//获取边角料推送称重列表
$router->get('Weight/getPushWeight','Weight\WeightController@getPushWeight');

//删除边角料称重
$router->get('Weight/deleteWeight','Weight\WeightController@deleteWeight');

//修改边角料框重
$router->post('Weight/updateWeight','Weight\WeightController@updateWeight');

//获取毛重
$router->get('Weight/getZwgt','Weight\WeightController@getZwgt');

//提交边角料称重
$router->post('Weight/commitWeight','Weight\WeightController@commitWeight');

//获取框重
$router->get('Weight/getBoxWeight','Weight\WeightController@getBoxWeight');

//获取框重
$router->post('Weight/weightPush','Weight\WeightController@weightPush');

//导出
$router->get('Weight/export','Weight\WeightController@export');