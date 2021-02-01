<?php
/**
 * Created by PhpStorm.
 * User: shuaijie.feng
 * Date: 2019/8/30
 * Time: 19:32
 */

/**
 * 样册号图片上传
 * 编码生成
 */

//样册号类型添加
$router->post('CurrentversionPicture/typeAdd','CurrentversionPicture\CurrentversionPictureController@typeAdd');

// 样册类型列表
$router->get('CurrentversionPicture/typeList','CurrentversionPicture\CurrentversionPictureController@typeList');

// 样册编码添加
$router->post('CurrentversionPicture/codeAdd','CurrentversionPicture\CurrentversionPictureController@codeAdd');

// 样册编码列表
$router->get('CurrentversionPicture/codeList','CurrentversionPicture\CurrentversionPictureController@codeList');

// 生成编码
$router->get('CurrentversionPicture/generateCode','CurrentversionPicture\CurrentversionPictureController@generateCode');

// 上传图片
$router->post('CurrentversionPicture/uploadPicture','CurrentversionPicture\CurrentversionPictureController@uploadPicture');

// 删除图片
$router->post('CurrentversionPicture/destroyPicture','CurrentversionPicture\CurrentversionPictureController@destroyPicture');

// 添加样册号信息
$router->post('CurrentversionPicture/CurrentversionAdd','CurrentversionPicture\CurrentversionPictureController@CurrentversionAdd');

// 样册号信息列表
$router->get('CurrentversionPicture/CurrentversionLitst','CurrentversionPicture\CurrentversionPictureController@CurrentversionLitst');

// 修改编码
$router->post('CurrentversionPicture/codeUpdate','CurrentversionPicture\CurrentversionPictureController@codeUpdate');

// 修改类型
$router->post('CurrentversionPicture/typeUpdate','CurrentversionPicture\CurrentversionPictureController@typeUpdate');

// 样册详情
$router->get('CurrentversionPicture/Currentversionshow','CurrentversionPicture\CurrentversionPictureController@Currentversionshow');

// 样册修改
$router->post('CurrentversionPicture/CurrentversionUpdate','CurrentversionPicture\CurrentversionPictureController@CurrentversionUpdate');

// 类型详情
$router->get('CurrentversionPicture/typeshow','CurrentversionPicture\CurrentversionPictureController@typeshow');

// 编码详情
$router->get('CurrentversionPicture/codeshow','CurrentversionPicture\CurrentversionPictureController@codeshow');

// 类型删除
$router->post('CurrentversionPicture/typeDelete','CurrentversionPicture\CurrentversionPictureController@typeDelete');

// 编码删除
$router->post('CurrentversionPicture/codeDelete','CurrentversionPicture\CurrentversionPictureController@codeDelete');

// 样册删除
$router->post('CurrentversionPicture/CurrentversionDelete','CurrentversionPicture\CurrentversionPictureController@CurrentversionDelete');

// 样册号批量下载
$router->get('CurrentversionPicture/downCurrentversion','CurrentversionPicture\CurrentversionPictureController@downCurrentversion');

