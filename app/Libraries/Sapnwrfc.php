<?php
/**
 * Created by PhpStorm.
 * User: uid10342
 * Date: 2020/7/2
 * Time: 10:13
 */

namespace App\Libraries;

use SAPNWRFC\Connection as SapConnection;
use SAPNWRFC\Exception as SapException;

class Sapnwrfc
{
    /**
     * saprfc客户端实例
     * @var \SoapClient $soap
     */
    public  $saprfc;

    public function __construct(){

        $config = [
            'ashost' => config('app.sapnwrfc_service.ashost'), // sap服务器地址
            'sysnr'  => '00',  //sap给的
            'client' => config('app.sapnwrfc_service.client'), //sap给的
            'user'   => config('app.sapnwrfc_service.user'), //sap给的
            'passwd' => config('app.sapnwrfc_service.passwd'), //sap给的
            'trace'  => SapConnection::TRACE_LEVEL_OFF,
        ];
        $this->saprfc = new SapConnection($config);
    }


    public function doRequest($requestData,$serviceID){

        $abap = 'ZFM_MM_MATERIALS_READ_QUANTITY';
        $f = $this->saprfc->getFunction($serviceID); //sap的方法/函数
        $result = $f->invoke($requestData); // 传参
        return $result;
    }


}