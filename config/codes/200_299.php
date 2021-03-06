<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/21
 * Time: 下午5:02
 */


return [

    /*
     |--------------------------------------------------
     |Restful风格的成功状态提醒码配置
     |----------------------------------------------------
     |@author sam.shan  <sam.shan@ruis-ims.cn>
     */
    '200'=>'OK',//服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
    '201'=>'Created',//用户新建或修改数据成功。
    '202'=>'Accepted', //表示一个请求已经进入后台排队（异步任务）
    '204'=>'No Content',//用户删除数据成功。

];