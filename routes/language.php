<?php
/**
 * Created by PhpStorm.
 * User: hao.li
 * Date: 9/11
 * Time: 上午9:04
 */

/*
|------------------------------------------------------------------------------
|工艺多语言
|@author   hao.li
|------------------------------------------------------------------------------
*/

//新增语言
$router->post('Language/addLanguage','Language\LanguageController@addLanguage');

//获取语言列表
$router->get('Language/getLanguageList','Language\LanguageController@getLanguageList');

//获取所有语言
$router->get('Language/getAllLanguage','Language\LanguageController@getAllLanguage');

//修改语言列表
$router->post('Language/updateLanguage','Language\LanguageController@updateLanguage');

//删除语言列表
$router->get('Language/deleteLanguage','Language\LanguageController@deleteLanguage');

//获取所有能力列表
$router->get('Language/getAbility','Language\LanguageController@getAbility');

//能力与语言关联
$router->post('Language/relevanceAbillity','Language\LanguageController@relevanceAbillity');

//导出能力模版
$router->get('Language/exportExcel','Language\LanguageController@exportExcel');

//导入能力模版
$router->post('Language/importExcel','Language\LanguageController@importExcel');

//获取工序与语言列表
$router->get('Language/getOperation','Language\LanguageController@getOperation');

//导出工序与语言模版权
$router->get('Language/exportOperationExcel','Language\LanguageController@exportOperationExcel');

//导入工序模版
$router->post('Language/importOperationExcel','Language\LanguageController@importOperationExcel');

//工序与语言关联
$router->post('Language/operationLanguage','Language\LanguageController@operationLanguage');

//特殊工艺与语言列表
$router->get('Language/getSpecialCraftList','Language\LanguageController@getSpecialCraftList');

//特殊工艺与语言关联
$router->post('Language/specialLanguage','Language\LanguageController@specialLanguage');

//工艺图片与语言关联
$router->post('Language/imageLanguage','Language\LanguageController@imageLanguage');

//获取图片
$router->get('Language/getImage','Language\LanguageController@getImage');

//获取外语图片
$router->get('Language/getLanImage','Language\LanguageController@getLanImage');

//删除图片
$router->get('Language/deleteImage','Language\LanguageController@deleteImage');

//导出特殊工艺与多语言模版
$router->get('Language/exportSpecial','Language\LanguageController@exportSpecial');

//导入特殊工艺与多语言模版
$router->post('Language/importSpecial','Language\LanguageController@importSpecial');

//导出物料属性与多语言模版
$router->get('Language/exportAttribute','Language\LanguageController@exportAttribute');

//导入物料属性与多语言模版
$router->post('Language/importAttribute','Language\LanguageController@importAttribute');

//导出物料属性与多语言模版
$router->get('Language/exportValue','Language\LanguageController@exportValue');

//导入物料属性值与多语言模版
$router->post('Language/importValue','Language\LanguageController@importValue');

//版本升级
$router->post('Language/bomVersion','Language\LanguageController@bomVersion');

//进出料描述与多语言关联
$router->post('Language/materialDescription','Language\LanguageController@materialDescription');

//检查当前使用的工艺是否已经维护多语言
$router->get('Language/checkBomLan','Language\LanguageController@checkBomLan');

////检查要发布的是否已经有多语言
$router->get('Language/checkBom','Language\LanguageController@checkBom');

//获取工艺路线多语言列表
$router->get('Language/getProcedureRouteLanguage','Language\LanguageController@getProcedureRouteLanguage');

//工艺路线与多语言关联
$router->post('Language/procedureRouteLanguage','Language\LanguageController@procedureRouteLanguage');

//导出工艺路线模版
$router->get('Language/exportProcedureRouteExcel','Language\LanguageController@exportProcedureRouteExcel');

//导入工艺路线模版
$router->post('Language/importProcedureRouteExcel','Language\LanguageController@importProcedureRouteExcel');

//导出做法字段模版
$router->get('Language/exportPractice','Language\LanguageController@exportPractice');

//导入做法字段模版
$router->post('Language/importPractice','Language\LanguageController@importPractice');

//获取做法字段列表
$router->get('Language/getPracticeList','Language\LanguageController@getPracticeList');

//做法字段与多语言关联
$router->post('Language/practiceLanguage','Language\LanguageController@practiceLanguage');

//获取所有多语言工艺文件
$router->get('Language/pageIndex','Language\LanguageController@pageIndex');

//获取树状结构
$router->get('Language/show','Language\LanguageController@show');

// 多语言版工单工艺列表
$router->get('Language/pageIndexlist','Language\LanguageController@pageIndexlist');

// 多语言版销售订单工艺
$router->get('Language/salesorderProcess','Language\LanguageController@salesorderProcess');