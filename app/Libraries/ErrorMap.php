<?php
//
//namespace  App\Libraries;
///**
// *错误码映射类,统一的API接口返回,错误信息字典
// *现在已经废弃了，请使用config/errors.php进行配置
// * @author  sam.shan <sam.shan@ruis-ims.cn>
// * @time    2017年09月15日07:23:16
// */
//class ErrorMap{
//    /**
//     * 错误映射常量数组
//     * @const
//     */
//    const ERRMAP=[
//
//        /*================== Restful风格的错误码======================*/
//        '200'=> 'OK',//服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
//        '201'=> 'CREATED',//用户新建或修改数据成功。
//        '202'=>'Accepted', //表示一个请求已经进入后台排队（异步任务）
//        '204'=>'NO CONTENT',//用户删除数据成功。
//        '400'=>'INVALID REQUEST',//用户发出的请求有错误，服务器没有进行新建或修改数据的操作
//        '401'=>'Unauthorized',//表示用户没有权限（令牌、用户名、密码错误）。
//        '403'=> 'Forbidden',//表示用户得到授权（与401错误相对），但是访问是被禁止的。
//        '404'=> 'NOT FOUND',//用户发出的请求针对的是不存在的记录，服务器没有进行操作
//        '406'=> 'Not Acceptable',//用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
//        '410'=> 'Gone',//用户请求的资源被永久删除，且不会再得到的。
//        '422'=> 'Unprocesable entity',//当创建一个对象时，发生一个验证错误。
//        '500'=> 'INTERNAL SERVER ERROR',//服务器发生错误，用户将无法判断发出的请求是否成功。
//        /*===================1打头的表示公共错误 ======================*/
//        //认证权限类错误
//        '10000'=>'请通过正确渠道提交',
//        '10001'=>'api认证失败',
//        '10002'=>'访问权限不够',
//        '10003'=>'The callback name is not valid',//callback参数有误
//        //数据库连接类错误
//        '10100'=>'数据库连接信息错误',
//        '10101'=>'数据库连接超时',
//        //数据库入库类错误
//        '10200'=>'添加失败',
//
//
//        '10201'=>'缺少必要的删除参数ID',
//        '10202'=>'删除失败',
//        '10203'=>'Not found',//要删除记录早已经不在数据库中了
//
//
//        '10204'=>'缺少必要的更新参数ID',
//        '10205'=>'更新失败',
//        '10206'=>'Query OK, 0 rows affected',//更新的内容未做任何改变 [亦或] 要更新的记录不存在
//
//
//        '10207'=>'缺少必要的查询参数ID',
//        /*==========2打头的是物料相关的=============================*/
//        //物料分类
//        '20000'=>'物料分类名称不可以为空',
//        '20001'=>'物料分类名称已经注册过',
//        '20002'=>'禁止选择自身或者子分类作为自己的上级分类',
//        //物料分组
//        '20050'=>'物料分组名称不可以为空',
//        '20051'=>'物料分组名称已经注册过',
//
//        //物料属性
//
//        '20100'=>'',
//
//
//        //物料模板类型
//        '20150'=>'',
//
//        //物料模板
//        '20200'=>'',
//
//
//        //物料管理
//        '20250'=>'',
//
//
//
//
//        '20300'=>'',
//
//        '20350'=>'',
//
//
//        '20400'=>'',
//
//
//    ];
//
//
//    /**
//     * 根据错误字典码,返回错误信息
//     * @param $code  int  错误码
//     * @return string     错误信息
//     * @author  sam.shan   <sam.shan@ruis-ims.cn>
//     */
//    static function  get($code)
//    {
//        return  !empty(self::ERRMAP[$code])?self::ERRMAP[$code]:'未定义的错误码-'.$code;
//    }
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//}