<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/15
 * Time: 下午3:09
 */

/*
|------------------------------------------------------------------------------
|图纸库
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|上传图纸：Image/upload
|添加图纸属性并关联图纸：Image/store
|图纸分页列表：Image/pageIndex
|图纸详情：Image/show
|更新图纸：Image/update
|删除图纸：Image/destroy
 */
$router->post('Image/upload','Mes\ImageController@uploadDrawing');
$router->post('Image/store','Mes\ImageController@store');
$router->get('Image/pageIndex','Mes\ImageController@pageIndex');
$router->get('Image/show','Mes\ImageController@show');
$router->post('Image/update','Mes\ImageController@update');
$router->get('Image/destroy','Mes\ImageController@destroy');
$router->get('Image/getImagesByCategory','Mes\ImageController@getImagesByCategory');
$router->get('Image/getImagesAttributes','Mes\ImageController@getImagesAttributes');
$router->get('Image/selectByCategory','Mes\ImageController@selectByCategory');
//处理 drawing表新增 width 和 height 引发的历史数据宽高为0的问题
$router->get('Image/updateImg','Mes\ImageController@updateImg');
//批量导入图片属性
$router->post('Image/importImage','Mes\ImageController@importImage');

// 获取和做法关联的图纸数据(分页)  Add by lesteryou 2018-04-26
$router->get('Image/selectPracticeDrawing','Mes\ImageController@selectPracticeDrawing');
// 只根据属性和属性值获取列表  Add by lesteryou 2018-05-02
$router->get('Image/listBySearchStr','Mes\ImageController@listBySearchStr');
//编辑图纸重新上传
$router->post('Image/reUploadImage','Mes\ImageController@reUploadImage');
//批量上传图片
$router->post('Image/batchUploadDrawing','Mes\ImageController@batchUploadDrawing');
$router->post('Image/batchStore','Mes\ImageController@batchStore');
//上传文件(上传洗标图片专用)
$router->post('Image/uploadFile','Mes\ImageController@uploadFile');

// 批量上传图片 区别图纸
$router->post('Image/batchUploadPicture','Mes\ImageController@batchUploadPicture');

// 删除 图片
$router->get('Image/destroyPicture','Mes\ImageController@destroyPicture');

//图片上传
$router->post('Image/uploadPicture','Mes\ImageController@uploadPicture');

/*
|------------------------------------------------------------------------------
|图纸库图纸模块
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|添加图纸分类/模块：ImageCategory/store
|修改图纸分类/模块：ImageCategory/update
|删除图纸分类/模块：ImageCategory/destroy
|删除图纸分类/模块详情：ImageCategory/show
|图纸分类/模块分页列表：ImageCategory/pageIndex
|图纸分类/模块select：ImageCategory/select
|
 */
$router->get('ImageCategory/unique','Mes\ImageCategoryController@unique');
$router->post('ImageCategory/store','Mes\ImageCategoryController@store');
$router->post('ImageCategory/update','Mes\ImageCategoryController@update');
$router->get('ImageCategory/destroy','Mes\ImageCategoryController@destroy');
$router->get('ImageCategory/show','Mes\ImageCategoryController@show');
$router->get('ImageCategory/pageIndex','Mes\ImageCategoryController@pageIndex');
$router->get('ImageCategory/select','Mes\ImageCategoryController@select');

/*
|------------------------------------------------------------------------------
|图纸库图纸分组
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|添加图纸分组：ImageGroup/store
|修改图纸分组：ImageGroup/update
|删除图纸分组：ImageGroup/destroy
|删除图纸分组详情：ImageGroup/show
|图纸分组分页列表：ImageGroup/pageIndex
|图纸分组select：ImageGroup/select
|
 */
$router->get('ImageGroup/unique','Mes\ImageGroupController@unique');
$router->post('ImageGroup/store','Mes\ImageGroupController@store');
$router->post('ImageGroup/update','Mes\ImageGroupController@update');
$router->get('ImageGroup/destroy','Mes\ImageGroupController@destroy');
$router->get('ImageGroup/show','Mes\ImageGroupController@show');
$router->get('ImageGroup/pageIndex','Mes\ImageGroupController@pageIndex');
$router->get('ImageGroup/select','Mes\ImageGroupController@select');

/*
|------------------------------------------------------------------------------
|图纸库图纸分组分类
|@author   lesteryou
|------------------------------------------------------------------------------
|图纸分组分类唯一性检测：ImageGroupType/unique
|添加图纸分组分类：ImageGroupType/store
|修改图纸分组分类：ImageGroupType/update
|删除图纸分组分类：ImageGroupType/delete
|获取所有图纸分组分类(不分页)：ImageGroupType/selectAll
|获取所有图纸分组分类(分页)：ImageGroupType/selectPages
|获取单一图纸分组分类：ImageGroupType/selectOne
|
 */
$router->get('ImageGroupType/unique', 'Mes\ImageGroupTypeController@unique');
$router->post('ImageGroupType/store', 'Mes\ImageGroupTypeController@store');
$router->post('ImageGroupType/update', 'Mes\ImageGroupTypeController@update');
$router->get('ImageGroupType/delete', 'Mes\ImageGroupTypeController@delete');
$router->get('ImageGroupType/selectAll', 'Mes\ImageGroupTypeController@selectAll');
$router->get('ImageGroupType/selectPages', 'Mes\ImageGroupTypeController@selectPages');
$router->get('ImageGroupType/selectOne', 'Mes\ImageGroupTypeController@selectOne');


/*
|------------------------------------------------------------------------------
|图纸库图纸属性
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|检查唯一性
|
 */
$router->get('ImageAttribute/unique','Mes\ImageAttributeController@unique');

/*
|------------------------------------------------------------------------------
|图纸库图纸属性定义
|@author  lesteryou
|------------------------------------------------------------------------------
|检查唯一性： ImageAttributeDefinition/unique
|添加图纸属性定义： ImageAttributeDefinition/store
|修改图纸属性定义： ImageAttributeDefinition/update
|删除图纸属性定义： ImageAttributeDefinition/delete
|获取所有图纸属性定义(不分页)： ImageAttributeDefinition/selectAll
|获取所有图纸属性定义(分页)： ImageAttributeDefinition/selectPage
|获取一个图纸属性定义： ImageAttributeDefinition/selectOne
|
 */
$router->get('ImageAttributeDefinition/unique', 'Mes\ImageAttributeDefinitionController@unique');
$router->post('ImageAttributeDefinition/store', 'Mes\ImageAttributeDefinitionController@store');
$router->post('ImageAttributeDefinition/update', 'Mes\ImageAttributeDefinitionController@update');
$router->get('ImageAttributeDefinition/delete', 'Mes\ImageAttributeDefinitionController@delete');
$router->get('ImageAttributeDefinition/selectAll', 'Mes\ImageAttributeDefinitionController@selectAll');
$router->get('ImageAttributeDefinition/selectPage', 'Mes\ImageAttributeDefinitionController@selectPage');
$router->get('ImageAttributeDefinition/selectOne', 'Mes\ImageAttributeDefinitionController@selectOne');

/*
|------------------------------------------------------------------------------
| 洗标
|@author  lester.you
|------------------------------------------------------------------------------
|
 */
// 详情
$router->get('CareLabel/show', 'Mes\CareLabelController@show');
// 添加
$router->post('CareLabel/store', 'Mes\CareLabelController@store');
//列表
$router->get('CareLabel/careLabelPageIndex', 'Mes\ImageController@careLabelPageIndex');
//附件英文列表
$router->get('CareLabel/careLabelPageIndexEN', 'Mes\ImageController@careLabelPageIndexEN');
$router->get('CareLabel/get', 'Mes\CareLabelController@get');
$router->get('CareLabel/getList', 'Mes\CareLabelController@getList');

//hao.li 获取已开启的国家
$router->get('CareLabel/getCountroy', 'Mes\ImageController@getCountroy');

//hao.li 批量下载附件
$router->get('CareLabel/getImagesUrl', 'Mes\ImageController@getImagesUrl');


//流水码附件
$router->get('Image/waterCodeEnclosureList','Mes\ImageController@waterCodeEnclosureList');//列表
$router->get('Image/waterCodeShow','Mes\ImageController@waterCodeShow');//流水码附件详情
$router->post('Image/waterCodeBatchStore','Mes\ImageController@waterCodeBatchStore');//新增流水码附件
$router->post('Image/updateWaterCode','Mes\ImageController@updateWaterCode');//修改流水码附件
$router->post('Image/delWaterCode','Mes\ImageController@delWaterCode');//删除流水码附件
$router->post('Image/waterCodeUploadFile','Mes\ImageController@waterCodeUploadFile');//上传流水码原pdf文件

