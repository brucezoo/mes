<?php
/**
 * 
 * User: hao.li
 * Date: 2019/8/17
 * Time: 8:00
 */

namespace App\Http\Models\OfflinePackage;

use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PHPExcel_Cell;

class OfflinePackage extends Base
{
    public function __construct()
    {
        $this->table='mbh_product_plan';  //生产计划表
        $this->taskTable='mbh_product_task'; //生产派工表
        $this->taryTable='mbh_tary'; //托盘表
        $this->containerTable='mbh_container'; //柜箱表
        $this->boxTable='mbh_box';  //箱表
        $this->rankTypeTable='ruis_rank_plan_type'; //班次类型表
        $this->rankTable='ruis_rank_plan';  //班次表
        $this->centerTable='ruis_workcenter';  //工作中心
        $this->benchTable='ruis_workbench';  //工位
        $this->materialSku='mbh_material_sku_relation'; //物料与SKU关系表
    }

    //检查数据
    public function checkData($file = null){
        if ($file === null) {
            $file = base_path('storage/exports/package.xlsx');
        }
        $cache = base_path('storage/exports/cache.package.php');
        if (is_file($cache) === true) {
            $data = include($cache);
            if (filemtime($file) === $data['time']) {
                return $data['data'];
            }
        }
        // 加载Excel文件
        $excel = Excel::load($file);
        // 选择标签页
        $sheet = $excel->setActiveSheetIndex(0);
        // 获取行数与列数,注意列数需要转换
        $highestRowNum = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $highestColumnNum = PHPExcel_Cell::columnIndexFromString($highestColumn);
        $usefullColumnNum = $highestColumnNum;
        // 对称数据表内的字段
        $field = [
            0 => 'SalesOrder',            //销售订单号
            1 => 'SalesOrderItem',       //行项目
            2 => 'MaterialCode',         //物料
            3 => 'MaterialCode',         //物料
            4 => 'MaterialLangCode',    //浪潮物料号
            5 => 'MaterialName',         //物料描述
            6 => 'planFactory',         //计划工厂
            7 => 'workFactory',         //生产工厂
            8 => 'OrderNumber',          //订单数量
            9 => 'Unit',                 //单位
            10 => 'Description',          //客户描述
            11 => 'text',          // 工序短文本
            12 => 'CenterId',            //工作中心
            13 => 'PlanDueDate',         //计划完成日期
            14 => 'supplier',        //供应商描述
            15 => 'Rrmark',              //备注
            16 => 'qian',             //前工序工厂
            17 => 'qiandate',               //前工序结束日期
            18 => 'hou',               //后工序工厂
            19 => 'houdate',               //后工序开始日期
            20 => 'productID',               //生产订单
            21 => 'miaosu',               //物料组描述
            22 => '22',               //模拟订单
            23 => '11',               //车间描述
            24 => 'supper',               //供应商
            25 => 'flag',               //排产标识
            26 => 'begindate'               //开始日期
        ];
        //开始取出数据并存入数组
        $data = [];
        // 遍历列
        for($i = 2; $i <= $highestRowNum; $i++) { //ignore row 1
            $row = array();
            // 遍历行
            for ($j = 0; $j <= $usefullColumnNum; $j++) {
                // 取列的值
                $cellVal = PHPExcel_Cell::stringFromColumnIndex($j) . $i;
                $cellVal = $excel->getActiveSheet()->getCell($cellVal)->getValue();
                if ($cellVal instanceof \PHPExcel_RichText) {
                    $cellVal = $cellVal->__toString();
                }
                // 过滤销售订单为空的
                if ($j === 0 && !$cellVal) {
                    break;
                }
                /* if ($j === 11) {
                    $cellVal = \PHPExcel_Shared_Date::ExcelToPHP((int) $cellVal);
                } */
                if($j === 26) break;
                $row[$field[$j]] = $cellVal;
            }
            if ($row) $data[$i] = $row;
        }
        $data = array_values($data);
        $data = [
            'time' => filemtime($file),
            'data' => $data
        ];
        file_put_contents($cache, "<?php\n return " . var_export($data, true) . ";");
        $data_ay=[];
        for ($i=0; $i < count($data['data']) ; $i++) { 
            $j=0;
            $data_ay[$i][$j++]=$data['data'][$i]['SalesOrder'];
            $data_ay[$i][$j++]=$data['data'][$i]['SalesOrderItem'];
            $data_ay[$i][$j++]=$data['data'][$i]['MaterialCode'];
            $data_ay[$i][$j++]=$data['data'][$i]['MaterialName'];
            $data_ay[$i][$j++]=$data['data'][$i]['CenterId'];
            $data_ay[$i][$j++]=$data['data'][$i]['OrderNumber'];
            $data_ay[$i][$j++]=$data['data'][$i]['Description'];
            $data_ay[$i][$j++]=$data['data'][$i]['PlanDueDate'];
            $data_ay[$i][$j++]=$data['data'][$i]['Rrmark'];
            $data_ay[$i][$j++]=$data['data'][$i]['Unit'];
        }

        $fieldData=[
            0 => 'SalesOrder',            //销售订单号
            1 => 'SalesOrderItem',       //行项目
            2 => 'MaterialCode',         //物料
            3 => 'MaterialName',         //物料描述
            4 => 'CenterId',         //工作中心
            5 => 'OrderNumber',         //订单数量
            6 => 'Description',         //客户描述
            7 => 'PlanDueDate',         //计划完成日期
            8 => 'Rrmark',         //备注
            9 => 'Unit',         //单位
        ];
        $ExcelData=[];
        for ($i=0; $i < count($data); $i++) { 
            for($j=0; $j < count($data[$i]); $j++){
                if($j==7){
                   $date= \PHPExcel_Shared_Date::ExcelToPHP((int) $data[$i][$j]);
                   $date=date('Y-m-d',$date);
                   $ExcelData[$i][$fieldData[$j]] = $date;
                   continue;
                }
                $ExcelData[$i][$fieldData[$j]] = $data[$i][$j];
            }
        }
        $data=[];
        foreach ($ExcelData as $key => $value) {
            $data=DB::table($this->table)
                  ->where('SalesOrder',$value['SalesOrder'])
                  ->where('SalesOrderItem',$value['SalesOrderItem'])
                  ->where('PlanDueDate','like','%'.$value['PlanDueDate'].'%')
                  ->select('mbh_product_plan.*')
                  ->first();
            if(!empty($data)){
                return $data;
            }
        }
        return $data;
    }

     // 从Excel文件中读取设备数据
    public function getExceldata($file = null)
    {
        if ($file === null) {
            $file = base_path('storage/exports/package.xlsx');
        }
        $cache = base_path('storage/exports/cache.package.php');
        if (is_file($cache) === true) {
            $data = include($cache);
            if (filemtime($file) === $data['time']) {
                return $data['data'];
            }
        }
        // 加载Excel文件
        $excel = Excel::load($file);
        // 选择标签页
        $sheet = $excel->setActiveSheetIndex(0);
        // 获取行数与列数,注意列数需要转换
        $highestRowNum = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $highestColumnNum = PHPExcel_Cell::columnIndexFromString($highestColumn);
        $usefullColumnNum = $highestColumnNum;
        // 对称数据表内的字段
        $field = [
            0 => 'SalesOrder',            //销售订单号
            1 => 'SalesOrderItem',       //行项目
            2 => 'MaterialCode',         //物料
            3 => 'Material',         //物料
            4 => 'MaterialLangCode',    //浪潮物料号
            5 => 'MaterialName',         //物料描述
            6 => 'planFactory',         //计划工厂
            7 => 'workFactory',         //生产工厂
            8 => 'OrderNumber',          //订单数量
            9 => 'Unit',                 //单位
            10 => 'Description',          //客户描述
            11 => 'text',          // 工序短文本
            12 => 'CenterId',            //工作中心
            13 => 'PlanDueDate',         //计划完成日期
            14 => 'supplier',        //供应商描述
            15 => 'Rrmark',              //备注
            16 => 'qian',             //前工序工厂
            17 => 'qiandate',               //前工序结束日期
            18 => 'hou',               //后工序工厂
            19 => 'houdate',               //后工序开始日期
            20 => 'productID',               //生产订单
            21 => 'miaosu',               //物料组描述
            22 => '22',               //模拟订单
            23 => '11',               //车间描述
            24 => 'supper',               //供应商
            25 => 'flag',               //排产标识
            26 => 'begindate'               //开始日期
        ];
        //开始取出数据并存入数组
        $data = [];
        // 遍历列
        for($i = 2; $i <= $highestRowNum; $i++) { //ignore row 1
            $row = array();
            // 遍历行
            for ($j = 0; $j <= $usefullColumnNum; $j++) {
                // 取列的值
                $cellVal = PHPExcel_Cell::stringFromColumnIndex($j) . $i;
                $cellVal = $excel->getActiveSheet()->getCell($cellVal)->getValue();
                if ($cellVal instanceof \PHPExcel_RichText) {
                    $cellVal = $cellVal->__toString();
                }
                // 过滤销售订单为空的
                if ($j === 0 && !$cellVal) {
                    break;
                }
                /* if ($j === 11) {
                    $cellVal = \PHPExcel_Shared_Date::ExcelToPHP((int) $cellVal);
                } */
                if($j === 26) break;
                $row[$field[$j]] = $cellVal;
            }
            if ($row) $data[$i] = $row;
        }
        $data = array_values($data);
        $data = [
            'time' => filemtime($file),
            'data' => $data
        ];
        file_put_contents($cache, "<?php\n return " . var_export($data, true) . ";");
        $data_ay=[];
        for ($i=0; $i < count($data['data']) ; $i++) { 
            $j=0;
            $data_ay[$i][$j++]=$data['data'][$i]['SalesOrder'];
            $data_ay[$i][$j++]=$data['data'][$i]['SalesOrderItem'];
            $data_ay[$i][$j++]=$data['data'][$i]['MaterialCode'];
            $data_ay[$i][$j++]=$data['data'][$i]['MaterialName'];
            $data_ay[$i][$j++]=$data['data'][$i]['CenterId'];
            $data_ay[$i][$j++]=$data['data'][$i]['OrderNumber'];
            $data_ay[$i][$j++]=$data['data'][$i]['Description'];
            $data_ay[$i][$j++]=$data['data'][$i]['PlanDueDate'];
            $data_ay[$i][$j++]=$data['data'][$i]['Rrmark'];
            $data_ay[$i][$j++]=$data['data'][$i]['Unit'];
        }
        return $data_ay;
    }


    //保存数据
    public function excelDataSave($data) {
        $field=[
            0 => 'SalesOrder',            //销售订单号
            1 => 'SalesOrderItem',       //行项目
            2 => 'MaterialCode',         //物料
            3 => 'MaterialName',         //物料描述
            4 => 'CenterId',         //工作中心
            5 => 'OrderNumber',         //订单数量
            6 => 'Description',         //客户描述
            7 => 'PlanDueDate',         //计划完成日期
            8 => 'Rrmark',         //备注
            9 => 'Unit',         //单位
        ];
        $ExcelData=[];
        for ($i=0; $i < count($data); $i++) { 
            for($j=0; $j < count($data[$i]); $j++){
                if($j==7){
                   $date= \PHPExcel_Shared_Date::ExcelToPHP((int) $data[$i][$j]);
                   $date=date('Y-m-d',$date);
                   $ExcelData[$i][$field[$j]] = $date;
                   continue;
                }
                $ExcelData[$i][$field[$j]] = $data[$i][$j];
            }
        }
        set_time_limit(0);
        //1.根据销售订单号、行项目、计划完成日期查找是否已经存在
        $data=[];
       /*  foreach ($ExcelData as $key => $value) {

            $data=DB::table($this->table)
                  ->where('SalesOrder',$value['SalesOrder'])
                  ->where('SalesOrderItem',$value['SalesOrderItem'])
                  ->where('PlanDueDate','like','%'.$value['PlanDueDate'].'%')
                  ->select('mbh_product_plan.*')
                  ->get();
            if(!empty($data)){
                continue;
            }
        } */
        foreach ($ExcelData as $key => $value) {
            $data=DB::table($this->table)
                  ->where('SalesOrder',$value['SalesOrder'])
                  ->where('SalesOrderItem',$value['SalesOrderItem'])
                  ->where('PlanDueDate','like','%'.$value['PlanDueDate'].'%')
                  ->select('mbh_product_plan.*')
                  ->get();
            if(!empty($data[0])){
                \TEA('804');
            }
        }
        $result=['insertNum'=>0];
        foreach ($ExcelData as $key => $value) {
            /* $data=DB::table($this->table)
                  ->where('SalesOrder',$value['SalesOrder'])
                  ->where('SalesOrderItem',$value['SalesOrderItem'])
                  ->where('PlanDueDate','like','%'.$value['PlanDueDate'].'%')
                  ->select('mbh_product_plan.*')
                  ->get();
            if(!empty($data[0])){
                \TEA('804');
            } */
            $num=substr($value['SalesOrder'],0,1);
            if(\strcmp('1',$num)==0){
                continue;
            }
            //出口国家
            $country='';
            if(\strcmp('2',$num)==0){         
                    $country='泰国';
             }
             if(\strcmp('3',$num)==0){
                $country='塞尔维亚';
              }
              if(\strcmp('4',$num)==0){
                $country='USA';
              }
              //以/分隔成数组
              $ay=explode('/',$value['MaterialName']);
              for($i=0;$i<count($ay);$i++){
                  if(strpos($ay[$i],'"')||strpos($ay[$i],'CM')){
                      $spec=$ay[$i];
                      break;
                  }
              }
                if(strpos($ay[$i],'"')){
                    //以"*分隔成数字（表示当前是英寸）
                    $num=explode('*',$spec);
                  for ($i=0; $i <count($num) ; $i++) { 
                      $num[$i]=str_replace('"','',$num[$i]);
                  }
                  for($i=0;$i<count($num);$i++){
                      $num[$i]=$num[$i]*2.54;
                    }
                  $str=$num[0];
                  for($i=1;$i<count($num);$i++){
                     $str=$str.'CM*'.$num[$i];
                  }
                  $str=$str.'CM';
              }else{
                $num=explode('*',$spec);
                for ($i=0; $i <count($num) ; $i++) { 
                    $num[$i]=str_replace('CM','',$num[$i]);
                }
                for($i=0;$i<count($num);$i++){
                    $num[$i]=round($num[$i]/2.54,3);
                  }
                $str=$num[0];
                for($i=1;$i<count($num);$i++){
                   $str=$str.'"*'.$num[$i];
                }
                $str=$str.'"';
              }
              $value['MaterialName']=$value['MaterialName'].'/'.$str;
               //根据销售订单和行目查找
             $count=DB::table($this->table)->where('SalesOrder',$value['SalesOrder'])->where('SalesOrderItem',$value['SalesOrderItem'])->select()->count();
             if($count==0){
                    $SalesOrderNo=1;         
             }else{
                $SalesOrderNo=1+$count; 
             }
            $data=[
                'SalesOrder'=>$value['SalesOrder'],
                'SalesOrderItem'=>$value['SalesOrderItem'],
                'MaterialCode'=>$value['MaterialCode'],
                'MaterialName'=>$value['MaterialName'],
                'OrderNumber'=>$value['OrderNumber'],
                'Unit'=>$value['Unit'],
                'PlanDueDate'=>$value['PlanDueDate'],
                'CenterId'=>$value['CenterId'],
                'Description'=>$value['Description'],
                'Remark'=>isset($value['Rrmark'])?$value['Rrmark']:'',
                'States'=>1,
                'country'=>$country,
                'SalesOrderNo'=>$SalesOrderNo        
            ];
             $result['insertNum']=DB::table($this->table)->insert($data);
        }
        return $result['insertNum'];
    }

    //检查出口美国与塞尔维亚的销售订单与行项是否与SKU关联
    public function checkSku($data){
       // pd($data);
        $data_ay[]=[];
        $k=0;
        foreach ($data as $key => $value) {
            if(empty($value['SalesOrder'])){
                continue;
               }
            $num=substr($value['SalesOrder'],0,1);
            if((\strcmp('3',$num)==0) || (\strcmp('4',$num)==0) || (\strcmp('6',$num)==0)){
                $data_ay[$k]['SalesOrder']=$value['SalesOrder'];
                $data_ay[$k]['salesOrderItem']=$value['SalesOrderItem'];
                $data_ay[$k]['Description']=$value['Description'];
                $k++;
            }
        }
        $checkData=[];
        $i=0;
        $noSku=[];
        if(!empty($data_ay[0])){
            foreach($data_ay as $k => $v){
                $checkData=DB::table('mbh_material_sku_relation')->where('salesOrder',$v['SalesOrder'])->where('salesOrderItem',$v['salesOrderItem'])->get();
                if(empty($checkData[0])){
                    $noSku[$i]['salesOrder']=$v['SalesOrder'];
                    $noSku[$i]['salesOrderItem']=$v['salesOrderItem'];
                    $noSku[$i]['Description']=$v['Description'];
                    $i++;
                }
            }
        }
        return $noSku;
    }

    //检查excel表格是否有重复
    public function checkExcel($data){
        foreach($data as $key => &$value){
            $date= \PHPExcel_Shared_Date::ExcelToPHP((int) $value['PlanDueDate']);
            $date=date('Y-m-d',$date);
            $value['PlanDueDate'] = $date;
        }
        $k=0;
        $excel=[];
        for($i=1;$i<count($data);$i++){
            if(empty($data[$i]['SalesOrder'])) continue;
            for($j=$i+1;$j<=count($data);$j++){
                if($data[$i]['SalesOrder']==$data[$j]['SalesOrder'] && $data[$i]['SalesOrderItem']==$data[$j]['SalesOrderItem'] && $data[$i]['PlanDueDate']==$data[$j]['PlanDueDate']){
                    $excel[$k]['SalesOrder']=$data[$i]['SalesOrder'];
                    $excel[$k]['SalesOrderItem']=$data[$i]['SalesOrderItem'];
                    $excel[$k]['PlanDueDate']=$data[$i]['PlanDueDate'];
                    $k++;
                }
            }
        }
        return $excel; 
    }

    //检查excel表格中不同时间段是否有相同的销售订单和行项
    public function checkExcelDifferentDate($data){
        foreach($data as $key => &$value){
            $date= \PHPExcel_Shared_Date::ExcelToPHP((int) $value['PlanDueDate']);
            $date=date('Y-m-d',$date);
            $value['PlanDueDate'] = $date;
        }
        $k=0;
        $excel=[];
        for($i=1;$i<count($data);$i++){
            if(empty($data[$i]['SalesOrder'])) continue;
            for($j=$i+1;$j<=count($data);$j++){
                if($data[$i]['SalesOrder']==$data[$j]['SalesOrder'] && $data[$i]['SalesOrderItem']==$data[$j]['SalesOrderItem'] && $data[$i]['PlanDueDate']!=$data[$j]['PlanDueDate']){
                    $excel[$k]['SalesOrder']=$data[$i]['SalesOrder'];
                    $excel[$k]['SalesOrderItem']=$data[$i]['SalesOrderItem'];
                    $excel[$k]['PlanDueDate']=$data[$i]['PlanDueDate'];
                    $k++;
                }
            }
        }
        return $excel;
    }

    //检查数据库中不同时间段是否有相同的销售订单和行项
    public function checkDifferentDate($data){
        foreach($data as $ke => &$val){
            $date= \PHPExcel_Shared_Date::ExcelToPHP((int) $val['PlanDueDate']);
            $date=date('Y-m-d',$date);
            $val['PlanDueDate'] = $date;
        }
        $list=[];
        $sameSalesOrder=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['SalesOrder'])){
                continue;
               }
            $list=DB::table($this->table)
                  ->where('SalesOrder',$value['SalesOrder'])
                  ->where('SalesOrderItem',$value['SalesOrderItem'])
                  ->select('mbh_product_plan.*')
                  ->get();
            if(!empty($list[0])){
                $sameSalesOrder[$i]['SalesOrder']=$value['SalesOrder'];
                $sameSalesOrder[$i]['SalesOrderItem']=$value['SalesOrderItem'];
                $sameSalesOrder[$i]['PlanDueDate']='';
                foreach($list as $k => $v){
                    $sameSalesOrder[$i]['PlanDueDate']=$sameSalesOrder[$i]['PlanDueDate'].$v->PlanDueDate.',';
                }
                $sameSalesOrder[$i]['PlanDueDate']=rtrim($sameSalesOrder[$i]['PlanDueDate'], ',');
                $i++;
            }
        }
        return $sameSalesOrder;
    }

    //检查同一销售订单、行项、计划完成日期是否已经存在
    public function checkSalesOrder($data){
        foreach($data as $ke => &$val){
            $date= \PHPExcel_Shared_Date::ExcelToPHP((int) $val['PlanDueDate']);
            $date=date('Y-m-d',$date);
            $val['PlanDueDate'] = $date;
        }
        $list=[];
        $sameSalesOrder=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['SalesOrder'])){
                continue;
               }
            $list=DB::table($this->table)
                  ->where('SalesOrder',$value['SalesOrder'])
                  ->where('SalesOrderItem',$value['SalesOrderItem'])
                  ->where('PlanDueDate','like','%'.$value['PlanDueDate'].'%')
                  ->select('mbh_product_plan.*')
                  ->get();
            if(!empty($list[0])){
                $sameSalesOrder[$i]['SalesOrder']=$value['SalesOrder'];
                $sameSalesOrder[$i]['SalesOrderItem']=$value['SalesOrderItem'];
                $sameSalesOrder[$i]['PlanDueDate']=$value['PlanDueDate'];
                $i++;
            }
        }
        return $sameSalesOrder;
    }
    //读取表头获取数据保存
    public function excelSave($data)
    {   
        foreach($data as $k => &$val)
        {
            $date= \PHPExcel_Shared_Date::ExcelToPHP((int) $val['PlanDueDate']);
            $date=date('Y-m-d',$date);
            $val['PlanDueDate'] = $date;
        }
        foreach ($data as $key => $value) 
        {
            if(empty($value['SalesOrder'])){
                continue;
               }
            $num=substr($value['SalesOrder'],0,1);
            if(\strcmp('1',$num)==0){
                continue;
            }
            //出口国家
            $country='';
            if(\strcmp('2',$num)==0){         
                    $country='泰国';
             }
             if(\strcmp('3',$num)==0){
                $country='塞尔维亚';
              }
              if((\strcmp('4',$num)==0)){
                $num1=substr($value['SalesOrder'],0,2);
                  if(strcmp('46',$num1)==0){
                    $country='西班牙';
                  }elseif(strcmp('44',$num1)==0||strcmp('42',$num1)==0){
                      $country='USA';
                  }
              }
              if((\strcmp('6',$num)==0)){
                $country='USA';
              }
              if(strpos($value['MaterialName'],'/')==false) continue;
              //以/分隔成数组
              $ay=explode('/',$value['MaterialName']);
              for($i=0;$i<count($ay);$i++){
                  if(strpos($ay[$i],'"')||strpos($ay[$i],'CM')){
                      $spec=$ay[$i];
                      break;
                  }
              }
                if(strpos($ay[$i],'"')){
                    //以"*分隔成数字（表示当前是英寸）
                    $num=explode('*',$spec);
                  for ($i=0; $i <count($num) ; $i++) { 
                      $num[$i]=str_replace('"','',trim($num[$i]));
                  }
                  for($i=0;$i<count($num);$i++){
                      $num[$i]=trim($num[$i])*2.54;
                    }
                  $str=$num[0];
                  for($i=1;$i<count($num);$i++){
                     $str=$str.'CM*'.$num[$i];
                  }
                  $str=$str.'CM';
              }else{
                $num=explode('*',$spec);
                for ($i=0; $i <count($num) ; $i++) { 
                    $num[$i]=str_replace('CM','',trim($num[$i]));
                }
                for($i=0;$i<count($num);$i++){
                    $num[$i]=round(trim($num[$i])/2.54,3);
                  }
                $str=$num[0];
                for($i=1;$i<count($num);$i++){
                   $str=$str.'"*'.$num[$i];
                }
                $str=$str.'"';
              }
              $value['MaterialName']=$value['MaterialName'].'/'.$str;
               //根据销售订单和行目查找
             $count=DB::table($this->table)->where('SalesOrder',$value['SalesOrder'])->where('SalesOrderItem',$value['SalesOrderItem'])->select()->count();
             if($count==0){
                    $SalesOrderNo=1;         
             }else{
                $SalesOrderNo=1+$count; 
             }
           //     pd($value['MaterialCode']);
            $insertData=[
                'SalesOrder'=>$value['SalesOrder'],
                'SalesOrderItem'=>$value['SalesOrderItem'],
                'MaterialCode'=>$value['MaterialCode'],
                'MaterialName'=>$value['MaterialName'],
                'OrderNumber'=>$value['OrderNumber'],
                'Unit'=>$value['Unit'],
                'PlanDueDate'=>$value['PlanDueDate'],
                'CenterId'=>$value['CenterId'],
                'Description'=>$value['Description'],
                'Remark'=>isset($value['Rrmark'])?$value['Rrmark']:'',
                'States'=>1,
                'country'=>$country,
                'SalesOrderNo'=>$SalesOrderNo        
            ];
            $insertNum=DB::table($this->table)->insert($insertData);
        }
        return $insertNum;
    }
    //计划列表搜索条件
    public function _planSearch(&$input){
        $where = array();
        //根据销售订单查询
        if (isset($input['SalesOrder']) && $input['SalesOrder']) {
            $where[]=['plan.SalesOrder','like','%'.$input['SalesOrder'].'%'];
        }
        //行目
        if (isset($input['SalesOrderItem']) && $input['SalesOrderItem']) {
            $where[]=['plan.SalesOrderItem','like','%'.$input['SalesOrderItem'].'%'];
        }
        //状态
        if ($input['States']!=0 && $input['States']) {
            $where[]=['plan.States',$input['States']];
        }
        //班次
        if (isset($input['RankPlanName']) && $input['RankPlanName']) {
            $where[]=['task.RankPlanName',$input['RankPlanName']];
        }
        //产线
        if ($input['ProductLine']!=0 && $input['ProductLine']) {
            $where[]=['task.ProductLine',$input['ProductLine']];
        }
        //交期
        if ($input['PlanDueDate']!=0 && $input['PlanDueDate']) {
            $where[]=['plan.PlanDueDate',$input['PlanDueDate']];
        }
        //排产日期
        if ($input['StartDate']!=0 && $input['StartDate']) {
            $where[]=['task.StartDate',$input['StartDate']];
        }
        return $where;
    }


    //获取生产计划列表
    public function getList($input){
        
        $where = $this->_planSearch($input);
        $data=[
            'plan.ID',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'plan.PlanDueDate',
            'plan.CenterId',
            'plan.Description',
            'plan.States',
            'plan.Remark',
            'task.ID as taskId',
            'task.RankPlanName',
            'task.ProductLine',
            'task.StartDate'
        ];
        $obj_list=DB::table($this->table.' as plan')
                   ->select($data)
                   ->leftjoin($this->taskTable.' as task','plan.ID','=','task.ProductPlanID')
                  ->where($where)
                  ->orderBy('plan.States','ASC')
                  ->orderBy('plan.PlanDueDate','ASC')
                  ->orderBy('plan.SalesOrder','ASC')
                  ->orderBy('plan.SalesOrderItem','ASC')
                  ->offset(($input['page_no']-1)*$input['page_size'])
                  ->limit($input['page_size'])
                  ->get();
                  
        $count_builder= DB::table($this->table)
        ->select()
        ->get();
        if (!$obj_list) TEA('404');
        foreach ($obj_list as $k => $v) {
            $PlanDueDate=\substr($v->PlanDueDate,0,10);
            $v->PlanDueDate=$PlanDueDate;
            $StartDate=\substr($v->StartDate,0,10);
            $v->StartDate=$StartDate;
        }
        //总共有多少条记录
        $obj_list->total_records=DB::table($this->table.' as plan')
                                 ->select($data)
                                 ->leftjoin($this->taskTable.' as task','plan.ID','=','task.ProductPlanID')
                                 ->where($where)
                                 ->count();
         return $obj_list;
    }

    //排产
    public function productionScheduling($tid,$StartDate,$RankPlanName){
        for ($i=0;$i<count($tid);$i++) {
            //获取编辑数组
            $data=[
                'ProductPlanID'=>$tid[$i],  //生产订单ID
                'StartDate'=>$StartDate,          //计划开始时间
                'RankPlanName'=>$RankPlanName,         //班次
                'RealStartDate'=>date('Y-m-d')      //实际开始时间
            ];
            $updData=['States'=>3];
            $num=0;
            $num=DB::table($this->taskTable)->insertGetId($data);
            $updNum=DB::table($this->table)->where('ID',$data['ProductPlanID'])->update($updData);
            if($updNum===false||$num===false) TEA('804');
        }

        return $num;
    }

    //分线
    public function branching($ids,$ProductLine){
        $planData=[
            'States'=>4            
        ];
        $data=[
            'ProductLine'=>$ProductLine
        ];
        $num=DB::table($this->taskTable)->whereIn('ProductPlanID',$ids)->update($data);
        $planNum=DB::table($this->table)->whereIn('ID',$ids)->update($planData);
        return $num;
    }

    //修改分线
    public function updateBraching($ids,$ProductLine){
        $data=[
            'ProductLine'=>$ProductLine
        ];
        $num=DB::table($this->taskTable)->whereIn('ProductPlanID',$ids)->update($data);
        return $num;
    }

    /**
     * 排产撤回
     * @throws \Exception
     * @author    xiafengjuan
     */
     /* public function noPlanProduction($input)
     {
         $ProductPlanID  = $input['ProductPlanID'];//获取排产单ID
         $id = $this->getFieldValueByWhere([['id','=',$ProductPlanID]], 'id','mbh_product_plan');//判断id是否存在
         if($id=='')
         {
             TEA('703','id');
         }
        
         //判断是否排产
         $states = $this->getStates($ProductPlanID);
         if ($states[0]->states  !=  3) TEA('2651');
 
         $tid = $this->getFieldValueByWhere([['ProductPlanID','=',$ProductPlanID]], 'id','mbh_product_task');//获取任务单id
      
         try{
             //开启事务
             DB::connection()->beginTransaction();
  //删除排产信息
   $res = DB::table($this->taskTable)->where($this->primaryKey,$tid)->delete();
         if(!$res) TEA('803');
             //修改排产状态
   $updNum=DB::table($this->table)->where('id',$input['ProductPlanID'])->update('States',1);
             if($updNum===false) TEA('804');
 
         }catch(\ApiException $e){
             //回滚
             DB::connection()->rollBack();
             TEA($e->getCode());
         }
         //提交事务
         DB::connection()->commit();
 
 
 
         return $ProductPlanID;
     } */

     /**
     * 排产撤回
     * @throws \Exception
     * @author    xiafengjuan
     */
     public function noPlanProduction($ids)
     {
         //删除排产信息
         DB::table($this->taskTable)->whereIn('ProductPlanID',$ids)->delete();
         $data=['States'=>1];
         //修改排产状态
         $ProductPlanID=DB::table($this->table)->whereIn('ID',$ids)->update($data);
 
 
 
         return $ProductPlanID;
     }

    //批量排产
    public function batchProductPlan($input)
    { 
        $this->productionScheduling($input['ProductPlanIds'],$input['StartDate'],$input['RankPlanName']);
    }

    //批量修改领料
    public function picking($ids){
        $data=['States'=>2];
        $num=DB::table($this->table)->whereIn('id',$ids)->update($data);
        return $num;
    }

    /**
     * 领料撤回
     * @throws \Exception
     * @author    xiafengjuan
     */
     public function noPicking($input)
     {
         $ProductPlanID  = $input['ProductPlanID'];//获取排产单ID
         $id = $this->getFieldValueByWhere([['id','=',$ProductPlanID]], 'id','mbh_product_plan');//判断id是否存在
         if($id=='')
         {
             TEA('703','id');
         }
        
         //判断是否领料
         $states = $this->getStates($ProductPlanID);
         if ($states[0]->states  !=  4) TEA('2650');
      
          //修改领料状态
         $updNum=DB::table($this->table)->where('id',$input['ProductPlanID'])->update('States',3);
             if($updNum===false) TEA('804');
         return $ProductPlanID;
     }

    //获取工位
    public function getStation($input){
        //根据工作中心获取ID
        $id=DB::table($this->centerTable)->where('code',$input['code'])->select('id')->get();

        //根据工作中心ID查找工位
        $obj_list=DB::table($this->benchTable)->whereIn('workcenter_id',$id)->select('name')->get();
        if(empty($obj_list)) \TEA('404');
        return $obj_list;
    }

    //生成托盘
    public function addTray($input){
        $data=date("Y/m/d");
        $data_ay=explode('/',$data);
        //日期
        $dataStr="";
        for ($i=0; $i <\count($data_ay) ; $i++) { 
            $dataStr=implode($data_ay);
        }
        //班次
        $beach=$input['RankPlanName'];

        //生产线
        $productLine=$input['ProductLine'];

        //根据日期查找是否当天是否已经有托盘，如果有则加，如果没有则为001
        $count=DB::table($this->taryTable)->where('Date','like','%'.date("Y-m-d").'%')->select()->count();
        if($count==0){
            //流水号
            $waterNo='001';
        }else{
            $waterNo='001'+$count;
        }
        $waterNo=sprintf('%03s',$waterNo);
        //托盘号
        $palletNo=$dataStr.$beach.$productLine."-".$waterNo;        
        return $palletNo;
    }


    //获取托盘列表数据
    public function getTrayList($input){
        //待报数量
        $num=0;
        //状态为待生产、生产中的
        $status=[4,5];
        $data=[
            'plan.*',
            'task.*'
        ];
        $where=[];
        if(isset($input['StartDate']) && $input['StartDate']){
            $where[]=['task.StartDate','like','%'.$input['StartDate'].'%'];
        }
        $trayList=DB::table($this->table.' as plan')
                ->select($data)
                ->distinct()
                ->leftjoin($this->taskTable.' as task','plan.ID','=','task.ProductPlanID')
                ->leftjoin($this->boxTable.' as box','task.ID','=','box.ProductTaskId')
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->groupBy('plan.ID')
                ->where([
                    ['task.RankPlanName',$input['RankPlanName']],
                    ['task.ProductLine',$input['ProductLine']],     
                ])
                ->where($where)
                ->whereIn('plan.States',$status)
                ->get();
        foreach($trayList as $key=>$val){
            $num=$val->OrderNumber-$val->InNumber;
            $val->waitNum=$num;
        }
        return $trayList;

    }

    //派工搜索条件
    public function _searchDispatching(&$input){
        $where = array();
        //根据销售订单查询
        if (isset($input['StartDate']) && $input['StartDate']) {
            $where[]=['task.StartDate','like','%'.$input['StartDate'].'%'];
        }
        //根据销售订单行项查询
        if (isset($input['RankPlanName']) && $input['RankPlanName']) {
            $where[]=['task.RankPlanName','like','%'.$input['RankPlanName'].'%'];
        }
        //根据班次查询
        if (isset($input['ProductLine']) && $input['ProductLine']) {
            $where[]=['task.ProductLine','like','%'.$input['ProductLine'].'%'];
        }
        return $where;
    }

    //获取派工数据
    public function getdispatching($ids,$input){
        $where=$this->_searchDispatching($input);  
        $data=['plan.*','task.*'];
        foreach ($ids as $key => $value) {
            $obj_list[$key]=DB::table($this->table.' as plan')
            ->select($data)
            ->leftjoin($this->taskTable.' as task','task.ProductPlanID','plan.ID')
            ->where($where)
            ->where('plan.ID',$value)
            ->get();
        }
        return $obj_list;

    }

    //生成箱号
    public function getBoxNo($input){
        //计划表表的ID
        $taskId=$input['ID'];
        $salesOrder=$input['SalesOrder'];
        $salesOrderItem=$input['SalesOrderItem'];
        $planId=DB::table($this->taskTable)->select('ProductPlanID')->where('ID',$taskId)->first();
        $planId=$planId->ProductPlanID;
        //序号
        $no=DB::table($this->table)->select('SalesOrderNo')->where('ID',$planId)->first();
        $no=$no->SalesOrderNo;
        //箱号
        $boxNo=$salesOrder.'-'.$salesOrderItem.'-'.$no;
        $count=DB::table($this->boxTable)->where('ProductTaskId',$taskId)->select()->count();
        if($count==0){
            $waterNo='001';
        }else{
            $waterNo='001'+$count;
        }
        $waterNo=sprintf('%03s',$waterNo);
        $boxNo=$boxNo.'-'.$waterNo;
        return $boxNo;


    }

    //将生成一托的数据放入托盘表
    public function putTary($input){
        //获取数据数组
        $data=[
            'TaryCode'=>$input['name'],
            'Date'=>date('Y-m-d'),
            'Operator'=>$input['Operator'],
            'States'=>2
        ];
        $num=DB::table($this->taryTable)->insertGetId($data);
        return $num;
    }

    //获得当天托盘
    public function getTaryCode(){
        $data=[
            'ID',
            'TaryCode'
        ];
        $obj_list=DB::table($this->taryTable)->select($data)->where('Date','like','%'.date('Y-m-d').'%')->orderBy('Date','desc')->orderBy('TaryCode','desc')->get();
        if(!$obj_list) TEA('404');
        return $obj_list;

    }

    //获取托盘页面数据
    public function getTary($ids){
        //待报数量
        $num=0;
        //状态为待生产、生产中的
        //$status=[4,5];
        $data=[
            'plan.*',
            'task.*',
            'box.operator as BoxOperator',
            
        ];
        $obj_list=DB::table($this->table.' as plan')
                ->select($data)
                ->distinct()
                ->leftjoin($this->taskTable.' as task','plan.ID','=','task.ProductPlanID')
                ->leftjoin($this->boxTable.' as box','task.ID','=','box.ProductTaskId')
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->groupBy('plan.ID')
                ->whereIn('task.ID',$ids)
                ->get();
        foreach($obj_list as $key=>$val){
            $num=$val->OrderNumber-$val->inNumber;
            $val->waitNum=$num;
        }
        return $obj_list;

    }

    //获取当前托盘页面数据
    public function getNowTary($id){
        // $id  = array_map('intval', str_split($id));
        //待报数量
        $num=0;
        //状态为待生产、生产中的
        //$status=[4,5];
        $data=[
            'plan.*',
            'task.ID as taskId',
            'task.*',
            'tary.*',
            'box.operator as BoxOperator'
            
        ];
        $obj_list=DB::table($this->table.' as plan')
                ->select($data)
                ->distinct()
                ->leftjoin($this->taskTable.' as task','plan.ID','=','task.ProductPlanID')
                ->leftjoin($this->boxTable.' as box','task.ID','=','box.ProductTaskId')
                ->leftjoin($this->taryTable.' as tary','tary.ID','=','box.TaryId')
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->groupBy('box.ProductTaskId')
                ->where('box.TaryId','=',$id)
                ->get();
        foreach($obj_list as $key=>$val){
            $num=$val->OrderNumber-$val->inNumber;
            $val->waitNum=$num;
        }
        return $obj_list;

    }

    //报工成箱
    public function pagaBox($input){
        //派工ID
        $taskId=$input['ID'];
        //销售订单
        $SalesOrder=$input['SalesOrder'];
        //行项
        $SalesOrderItem=$input['SalesOrderItem'];
        //报工数量
        $InNumber=$input['InNumber'];
        //装箱人
        $BoxOperator=$input['BoxOperator'];
        //托盘码
        $TaryCode=$input['TaryCode'];

        //调用方法获取箱号
        $boxCode=$this->getBoxNo($input);

        //计划ID
        $planId=DB::table($this->taskTable)->select('ProductPlanID')->where('ID',$input['ID'])->first();

        //总数量
        $number=DB::table($this->table)->select('OrderNumber')->where('ID',$planId->ProductPlanID)->first();

        //托盘码ID
        $taryId=DB::table($this->taryTable)->select('ID')->where('TaryCode',$input['TaryCode'])->first();

        $sumbitNum=DB::table($this->boxTable)
                ->addSelect(DB::raw('SUM(InNumber) as InNumber'))
                ->where('ProductPlanId',$planId->ProductPlanID)->first();
        //插入的数组
        $data=[
            'BoxCode'=>$boxCode,
            'ProductTaskId'=>$taskId,
            'ProductPlanId'=>$planId->ProductPlanID,
            'InNumber'=>$InNumber,
            'operator'=>$BoxOperator,
            'TaryId'=>$taryId->ID
        ];
        $num=DB::table($this->boxTable)->insertGetId($data);

        //报工数量
        if(!empty($sumbitNum->InNumber)){
            $sumbitNum=$InNumber+$sumbitNum->InNumber;
        }else{
            $sumbitNum=$InNumber;
        }
        if($number->OrderNumber<=$sumbitNum){
            $status=6;
        }else{
            $status=5;
        }
        $upd=[
            'States'=>$status,
            'DueDate'=>date('Y-m-d'),
            'InNumber'=>$sumbitNum
            ];

        $updNum=DB::table($this->table)->where('ID',$planId->ProductPlanID)->update($upd);
        return $num;

    }

    /**
     * 编辑装箱数据
     */
    public function editBox($input)
    {
        if($id > 0)//编辑
        {
            try{
                //开启事务
                DB::connection()->beginTransaction();  
                //获取编辑数组
                $data=[
                    'InNumber'=>$input['InNumber']
                ];
                $upd=DB::table($this->boxTable)->where('id',$input['Id'])->update($data);
                if($upd===false) TEA('804');
            }catch(\ApiException $e){
                //回滚
                DB::connection()->rollBack();
            }

            //提交事务
            DB::connection()->commit();
        }
       
    }

    //获取当前托盘明细
    public function getNowBox($id){
        // $id  = array_map('intval', str_split($id));
        $data=[
            'box.id',
            'box.BoxCode',
            'box.ProductTaskId',
            'box.ProductPlanId',
            'box.InNumber',
            'box.TaryId',
            'box.operator as BoxOperator',
            'task.RankPlanName',
            'task.ProductLine',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.country',
            'tary.TaryCode',
            'tary.Date'
            
        ];

        $obj_list=DB::table($this->boxTable.' as box')
                ->select($data)
                ->leftjoin($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                ->leftjoin($this->taskTable.' as task','box.ProductTaskId','=','task.ID')
                ->leftjoin($this->taryTable.' as tary','box.TaryId','=','tary.ID')
                ->where('box.TaryId','=',$id)
                ->get();
                foreach($obj_list as $key=>$val){
                    if($val->BoxOperator=='')
                    {
                        $val->BoxOperator='';
                    }
                   
                }
        return $obj_list;
    }

    //获取所有报工明细
    public function getBox($id){
        $data=[
            'box.ID',
            'box.BoxCode',
            'box.ProductTaskId',
            'box.ProductPlanId',
            'box.InNumber',
            'box.TaryId',
            'box.operator as BoxOperator',
            'task.RankPlanName',
            'task.ProductLine',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.country',
            'tary.TaryCode',
            'tary.Date'
            
        ];

        $obj_list=DB::table($this->boxTable.' as box')
                ->select($data)
                ->leftjoin($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                ->leftjoin($this->taskTable.' as task','box.ProductTaskId','=','task.ID')
                ->leftjoin($this->taryTable.' as tary','box.TaryId','=','tary.ID')
                ->where('box.ProductTaskId',$id)
                ->get();
        return $obj_list;
    }

    public function deleteBox($id){
        /* $data=[
            'ProductPlanId',
            'InNumber'
        ];
        $obj_list=DB::table($this->boxTable)->select($data)->where('ID',$id)->first();
        $inNumber=DB::table($this->table)->select('InNumber')->where('ID',$obj_list->ProductPlanId)->first();
        $number=$inNumber->InNumber-$obj_list->InNumber;
        $updData=[
            'InNumber'=>$number
        ];
        $updNum=DB::table($this->table)->where('ID',$obj_list->ProductPlanId)->update($updData); */
        $num=DB::table($this->boxTable)->where('ID',$id)->delete();
        return $num;
    }

    public function getAllTary(){
        $data=[
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'plan.Remark',
            'tary.ID',
            'tary.TaryCode',
            'tary.Date'
        ];
        

        $obj_list=DB::table($this->taryTable.' as tary')
                ->select($data)
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->distinct()
                ->leftjoin($this->boxTable.' as box','box.TaryId','=','tary.ID')
                ->join($this->table.' as plan','plan.ID','=','box.ProductPlanId')
                ->groupBy('box.TaryId')
                ->where('tary.States','2')
                ->get();
        return $obj_list;
    }

    //添加柜号
    public function insertCounter($input){
        //将data中数据以，分割成数组
        $ids=explode(',',$input['data']);
        $Operator=$input['Operator'];
        $data=[
            'ContainerCode'=>$input['ContainerCode'],
            'Date'=>$input['Date'],
            'Operator'=>$input['Operator']
        ];

        $containerId=DB::table($this->containerTable)->insertGetId($data);

        $upd=[
            'States'=>1,
            'ContainerId'=>$containerId
        ];
        $num=DB::table($this->taryTable)->whereIn('ID',$ids)->update($upd);
        return $num;

    }

    public function printBox($boxCode){
        $data=[
            'box.ID',
            'box.BoxCode',
            'box.ProductTaskId',
            'box.ProductPlanId',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit'
        ];
        $obj_list=DB::table($this->boxTable.' as box')
                ->select($data)
                ->leftjoin($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                ->addSelect(DB::raw('SUM(box.InNumber) as InNumber'))
                ->groupBy('box.ProductPlanId')
                ->where('box.BoxCode',$boxCode)
                ->get();
        return $obj_list;
    }

    //托盘汇总搜索条件
    public function _searchZtary($input){
        $where=array();
        if (isset($input['TaryCode']) && $input['TaryCode']) {//根据托盘编号查找
            $where[]=['tary.TaryCode','like','%'.$input['TaryCode'].'%'];
        }
        if (isset($input['Date']) && $input['Date']) {//根据打包时间查找
            $where[]=['tary.Date','like','%'.$input['Date'].'%'];
        }
        if (isset($input['Operator']) && $input['Operator']) {//根据打包人查找
            $where[]=['tary.Operator','like','%'.$input['Operator'].'%'];
        }
        if (isset($input['SalesOrder']) && $input['SalesOrder']) {//根据销售订单查找
            $where[]=['plan.SalesOrder','like','%'.$input['SalesOrder'].'%'];
        }
        if (isset($input['SalesOrderItem']) && $input['SalesOrderItem']) {//根据行项查找
            $where[]=['plan.SalesOrderItem','like','%'.$input['SalesOrderItem'].'%'];
        }
        if (isset($input['MaterialCode']) && $input['MaterialCode']) {//根据物料查找
            $where[]=['plan.MaterialCode','like','%'.$input['MaterialCode'].'%'];
        }
        if (isset($input['PlanDueDate']) && $input['PlanDueDate']) {//根据托盘 交期查找
            $where[]=['tary.Date','like','%'.$input['PlanDueDate'].'%'];
        }
        if (isset($input['Description']) && $input['Description']) {//根据托盘销售员查找
            $where[]=['plan.Description','like','%'.$input['Description'].'%'];
        }
        if (isset($input['States']) && $input['States']) {//根据托盘状态查找
            $where[]=['tary.States',$input['States']];
        }

        return $where;
    }

    //获取托盘汇总数据
    public function getZTaryList($input){

        $where=$this->_searchZtary($input);         
        $data=[
            'tary.ID',
            'tary.TaryCode',
            'tary.Date',
            'tary.Operator',
            'tary.taryType',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'plan.Description',
            'plan.country',
            'mcs.Stock'    //库位
        ];
        $obj_list=DB::table($this->taryTable.' as tary')
                      ->select($data)
                      ->leftjoin('mbh_cover_stock as mcs','mcs.id','tary.stockId')
                      ->join($this->boxTable.' as box','box.TaryId','=','tary.ID')
                      ->join($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                      ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                      ->groupBy('tary.TaryCode')
                      ->where($where)
                      ->get();
        return $obj_list;     
    }

    //托盘汇总表导出
    public function taryListImport($input){
        $where=$this->_searchZtary($input);
        $data=[
            'tary.ID',
            'tary.TaryCode',
            'tary.Date',
            'tary.Operator',
            'tary.taryType',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'plan.Description',
            'plan.country',
            'mcs.Stock'    //库位
        ];
        $obj_list=DB::table($this->taryTable.' as tary')
                      ->select($data)
                      ->leftjoin('mbh_cover_stock as mcs','mcs.id','tary.stockId')
                      ->join($this->boxTable.' as box','box.TaryId','=','tary.ID')
                      ->join($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                      ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                      ->groupBy('tary.ID')
                      ->groupBy('tary.TaryCode')
                      ->groupBy('plan.SalesOrder')
                      ->groupBy('plan.SalesOrderItem')
                      ->where($where)
                      ->orderBy('tary.TaryCode')
                      ->get();
                      $headerName=[
                        ['托盘码','打包时间','打包人','打包方式','销售订单','行项目','物料','规格','总数量','数量','单位','库位','备注']
                    ];
            
                    foreach ($obj_list as $key => $value) {
                        if($value->taryType==1){
                            $value->taryType='抽真空';
                        }else{
                            $value->taryType='蛇皮袋';
                        }
                        $headerName[]=[
                            $value->TaryCode,$value->Date,$value->Operator,$value->taryType,$value->SalesOrder,$value->SalesOrderItem,$value->MaterialCode,$value->MaterialName,$value->OrderNumber,
                            $value->inNumber,$value->Unit,$value->Stock,$value->country
                        ];
                    }
                    $fileName='托盘汇总报表'.date('Y-m-d H:i:s',time());
                    set_time_limit(0);
                     header('Content-Type: application/vnd.ms-excel');
                     header('Cache-Control:max-age=0');
                    //清除缓存
                    ob_end_clean();
                    //调用Excel组件进行导出
                    Excel::create($fileName,function($excel) use ($headerName){
                        $excel->sheet('first',function($sheet) use ($headerName){
                            $sheet->rows($headerName);
                            //冻结第一行
                            $sheet->freezeFirstRow();
                        });
                    })->export('xlsx');
                    exit();  

    }

    //获取托盘汇总数据明细
    public function getZTaryItem($id){
        $data=[
            'box.BoxCode',
            'box.InNumber',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'plan.Description',
            'plan.Remark'
        ];
        $item=DB::table($this->boxTable.' as box')
            ->select($data)
            ->leftjoin($this->table.' as plan','box.ProductPlanId','=','plan.ID')
            ->where('box.TaryId',$id)
            ->get();
        return $item;
    }


    //打印托盘标识
    public function printTary($input){
        $data=[
            'tary.TaryCode',
            'tary.Date',
            'tary.Operator',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'plan.Description',
            'plan.country'
        ];
        $obj_list=DB::table($this->taryTable.' as tary')
                      ->select($data)
                      ->join($this->boxTable.' as box','box.TaryId','=','tary.ID')
                      ->join($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                      ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                      ->groupBy('tary.TaryCode')
                      ->groupBy('plan.SalesOrder')
                      ->groupBy('plan.SalesOrderItem')
                      ->groupBy('plan.MaterialCode')
                      ->where('tary.TaryCode','=',$input['data'])
                      ->get(); 
        return $obj_list;  

    }

    //批量打印托盘标识
    public function batchprintTary($ids){
      
        $data=[
            'tary.TaryCode',
            'tary.Date',
            'tary.Operator',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'plan.Description',
            'plan.country'
        ];
        $obj_list=DB::table($this->taryTable.' as tary')
                      ->select($data)
                      ->join($this->boxTable.' as box','box.TaryId','=','tary.ID')
                      ->join($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                      ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                      ->groupBy('tary.TaryCode')
                      ->groupBy('plan.SalesOrder')
                      ->groupBy('plan.SalesOrderItem')
                      ->groupBy('plan.MaterialCode')
                      ->whereIn('tary.ID',$ids)
                      ->get(); 
               
         return $obj_list;  
    }

    //销售报表查询查询条件
    public function _searchSale($input){
        $where=array();
        if (isset($input['SalesOrder']) && $input['SalesOrder']) {//根据销售订单查找
            $where[]=['plan.SalesOrder','like','%'.$input['SalesOrder'].'%'];
        }
        if (isset($input['SalesOrderItem']) && $input['SalesOrderItem']) {//根据销售订单行项查找
            $where[]=['plan.SalesOrderItem','like','%'.$input['SalesOrderItem'].'%'];
        }
        if (['States']!=0 && $input['States']) {//根据状态查找
            $where[]=['plan.States','like','%'.$input['States'].'%'];
        }
        if (isset($input['MaterialCode']) && $input['MaterialCode']) {//根据物料查找
            $where[]=['plan.MaterialCode','like','%'.$input['MaterialCode'].'%'];
        }
        if (isset($input['PlanDueDate']) && $input['PlanDueDate']) {//根据交期查找
            $where[]=['plan.PlanDueDate','like','%'.$input['PlanDueDate'].'%'];
        }
        if (isset($input['Description']) && $input['Description']) {//根据销售员查找
            $where[]=['plan.Description','like','%'.$input['Description'].'%'];
        }
        //班次
        if (isset($input['RankPlanName']) && $input['RankPlanName']) {
            $where[]=['task.RankPlanName',$input['RankPlanName']];
        }
        //产线
        if ($input['ProductLine']!=0 && $input['ProductLine']) {
            $where[]=['task.ProductLine',$input['ProductLine']];
        }

        return $where;

    }
    //销售报表查询
    public function getSaleOrderList($input){
        $where=$this->_searchSale($input);
        $data=[
            'plan.*',
            'box.ProductPlanId',
            'box.InNumber',
            'task.StartDate',
            'task.RankPlanName',
            'task.ProductLine'
        ];
        $obj_list=DB::table($this->table.' as plan')
                ->select($data)
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->leftjoin($this->boxTable.' as box','plan.ID','box.ProductPlanId')
                ->leftjoin($this->taskTable.' as task','task.ProductPlanID','=','plan.ID')
                ->groupBy('plan.ID')
                ->where($where)
                ->get();
        foreach($obj_list as $k=>$v){
            $v->StartDate=\substr($v->StartDate,0,10);
            $v->PlanDueDate=\substr($v->PlanDueDate,0,10);
            //剩余数据=总数量-已报工数量
            $residueNum=$v->OrderNumber-$v->inNumber;
            $v->residueNum=$residueNum;
            if($v->inNumber==0){
                $v->efficiency='0';
            }else{
                $v->efficiency=round(($v->inNumber/$v->OrderNumber)*100,3);
            }
        }
        return $obj_list;
    }

    /**
    * 销售订单报表导出
    * hao.li
     */
     public function saleOrderExcel($input){
      //  $obj_list=$this->getSaleOrderList($input);
      $where=$this->_searchSale($input);
        $data=[
            'plan.*',
            'box.ProductPlanId',
            'box.InNumber',
            'task.StartDate',
            'task.RankPlanName',
            'task.ProductLine'
        ];
        $obj_list=DB::table($this->table.' as plan')
                ->select($data)
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->leftjoin($this->boxTable.' as box','plan.ID','box.ProductPlanId')
                ->leftjoin($this->taskTable.' as task','task.ProductPlanID','=','plan.ID')
                ->groupBy('plan.ID')
                ->where($where)
                ->get();
        foreach($obj_list as $k=>$v){
             $v->StartDate=\substr($v->StartDate,0,10);
             $v->PlanDueDate=\substr($v->PlanDueDate,0,10);
             //剩余数据=总数量-已报工数量
             $residueNum=$v->OrderNumber-$v->inNumber;
             $v->residueNum=$residueNum;
             if($v->inNumber==0){
                    $v->efficiency='0';
             }else{
                    $v->efficiency=round(($v->inNumber/$v->OrderNumber)*100,3);
             }
        }
        $headerName=[
            ['销售订单号','行项目','状态','计划生产时间','物料','物料描述','规格','已打包数量','剩余数量','单位','完成率','计划完成日期','实际完成日期','班次','产线','备注']
        ];

        foreach ($obj_list as $key => $value) {
            if($value->States==1){
                $value->States = '待排产';
            }else if($value->States==2){
                $value->States='待派工 ';
            }else if($value->States==3){
                $value->States='待领料';
            }else if($value->States==4){
                $value->States='待生产';
            }else if($value->States==5){
                $value->States='生产中';
            }else{
                $value->States='完工';
            }
            $value->efficiency=$value->efficiency.'%';
            $headerName[]=[
                $value->SalesOrder,$value->SalesOrderItem,$value->States,$value->StartDate,$value->MaterialCode,$value->MaterialName,$value->MaterialName,$value->inNumber,$value->residueNum,
                $value->Unit,$value->efficiency,$value->PlanDueDate,$value->DueDate,$value->RankPlanName,$value->ProductLine,$value->Remark
            ];
        }
        $fileName='销售订单报表'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit();  
    }

    //装柜列表搜索条件查询
    public function _searchContainer($input){
        $where=array();
        if (isset($input['ContainerCode']) && $input['ContainerCode']) {//根据柜号查找
            $where[]=['container.ContainerCode','like','%'.$input['ContainerCode'].'%'];
        }
        if (isset($input['TaryCode']) && $input['TaryCode']) {//根据托盘编号查找
            $where[]=['tary.TaryCode','like','%'.$input['TaryCode'].'%'];
        }
        if (isset($input['SalesOrder']) && $input['SalesOrder']) {//根据销售订单查找
            $where[]=['plan.SalesOrder','like','%'.$input['SalesOrder'].'%'];
        }
        if (isset($input['SalesOrderItem']) && $input['SalesOrderItem']) {//根据销售订单行项查找
            $where[]=['plan.SalesOrderItem','like','%'.$input['SalesOrderItem'].'%'];
        }
        if (isset($input['MaterialCode']) && $input['MaterialCode']) {//根据物料查找
            $where[]=['plan.MaterialCode','like','%'.$input['MaterialCode'].'%'];
        }
        if (isset($input['Date']) && $input['Date']) {//根据交期查找
            $where[]=['container.Date','like','%'.$input['Date'].'%'];
        }
        if (isset($input['invoicecode']) && $input['invoicecode']) {//根据发票号查找
            $where[]=['container.invoicecode','like','%'.$input['invoicecode'].'%'];
        }
        if (isset($input['Operator']) && $input['Operator']) {//根据装柜人查找
            $where[]=['container.Operator','like','%'.$input['Operator'].'%'];
        }
        return $where;


    }

    //装柜列表查询
    public function containerNumberList($input){
        $data=[
            'container.ContainerCode',
            'container.Date as containerDate'  ,
            'container.platform as platform'  ,
            'container.invoicecode as invoicecode'  ,
            'tary.TaryCode',
            'tary.Date as taryDate',
             'tary.taryType',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit',
            'box.InNumber'
        ];
        $where=$this->_searchContainer($input);
        $obj_list=DB::table($this->containerTable.' as container')
                ->select($data)
                ->leftjoin($this->taryTable.' as tary','tary.ContainerId','=','container.ID')
                ->leftjoin($this->boxTable.' as box','box.TaryId','=','tary.ID')
                ->leftjoin($this->table.' as plan','plan.ID','=','ProductPlanId')
                ->where($where)
                ->get();
        return $obj_list;


    }

    //装柜汇总列表
    public function getcontainerList($input){
        $where=$this->_searchContainer($input);
        $data=[
            'container.ContainerCode',
            'container.Date as containerDate'  ,
            'container.Operator as operator',
            'container.platform as platform'  ,
            'container.invoicecode as invoicecode'  ,
            'tary.TaryCode',
            'tary.Date as taryDate',
            'tary.taryType',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit'
        ];
        $obj_list=DB::table($this->containerTable.' as container')
                ->select($data)
                ->leftjoin($this->taryTable.' as tary','tary.ContainerId','=','container.ID')
                ->leftjoin($this->boxTable.' as box','box.TaryId','=','tary.ID')
                ->leftjoin($this->table.' as plan','plan.ID','=','ProductPlanId')
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->where($where)
                ->groupBy('tary.TaryCode')
                ->groupBy('plan.SalesOrder')
                ->groupBy('plan.SalesOrderItem')
                ->orderBy('container.ContainerCode')
                ->orderBy('container.Date')
                ->orderBy('tary.TaryCode')
                ->orderBy('plan.SalesOrder')
                ->orderBy('plan.SalesOrderItem')
                ->get();
        foreach ($obj_list as $key => $value) {
            $sku_list=DB::table('mbh_material_sku_relation as sku')->select('sku')->where('salesOrder',$value->SalesOrder)->where('salesOrderItem',$value->SalesOrderItem)->get();
            if(empty($sku_list[0])){
                $sku='';
            }else{
                $num=count($sku_list);
                foreach ($sku_list as $k => $v) {
                    $sku=$v->sku.'/';
                }
            }
            $sku=rtrim($sku,'/');
            $value->sku=$sku;
        }
        return $obj_list;
    }

    /**
    *装柜报表导出
    * hao.li
     */
     public function containerImport($input){
        $where=$this->_searchContainer($input);
        $data=[
            'container.ContainerCode',
            'container.Date as containerDate'  ,
            'container.Operator as operator',
            'container.platform as platform'  ,
            'container.invoicecode as invoicecode'  ,
            'tary.TaryCode',
            'tary.Date as taryDate',
            'tary.taryType',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.OrderNumber',
            'plan.Unit'
        ];
        $obj_list=DB::table($this->containerTable.' as container')
                ->select($data)
                ->leftjoin($this->taryTable.' as tary','tary.ContainerId','=','container.ID')
                ->leftjoin($this->boxTable.' as box','box.TaryId','=','tary.ID')
                ->leftjoin($this->table.' as plan','plan.ID','=','ProductPlanId')
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->where($where)
                ->groupBy('tary.TaryCode')
                ->groupBy('plan.SalesOrder')
                ->groupBy('plan.SalesOrderItem')
                ->orderBy('container.ContainerCode')
                ->orderBy('container.Date')
                ->orderBy('tary.TaryCode')
                ->orderBy('plan.SalesOrder')
                ->orderBy('plan.SalesOrderItem')
                ->get();
        foreach ($obj_list as $key => $value) {
            if($value->taryType==1){
                $value->taryType='抽真空';
            }else{
                $value->taryType='蛇皮袋';
            }
            $sku_list=DB::table('mbh_material_sku_relation as sku')->select('sku')->where('salesOrder',$value->SalesOrder)->where('salesOrderItem',$value->SalesOrderItem)->get();
            if(empty($sku_list[0])){
                $sku='';
            }else{
                $num=count($sku_list);
                foreach ($sku_list as $k => $v) {
                    $sku=$v->sku.'/';
                }
            }
            $sku=rtrim($sku,'/');
            $value->sku=$sku;
        }
        $headerName=[
            ['月台','装柜人','柜号','装柜时间','发票号','客户SKU','物料编码','物料规格','总数量','数量','单位','托盘号','打包方式','销售订单号','行项目']
        ];

        foreach ($obj_list as $key => $value) {
            /* if($value->States==1){
                $value->States = '待排产';
            }else if($value->States==2){
                $value->States='待派工 ';
            }else if($value->States==3){
                $value->States='待领料';
            }else if($value->States==4){
                $value->States='待生产';
            }else if($value->States==5){
                $value->States='生产中';
            }else{
                $value->States='完工';
            }
            $value->efficiency=$v->efficiency.'%'; */
            $headerName[]=[
                $value->platform,$value->operator,$value->ContainerCode,$value->containerDate,$value->invoicecode,$value->sku,$value->MaterialCode,$value->MaterialName,$value->OrderNumber,$value->inNumber,$value->Unit,$value->TaryCode,$value->taryType,$value->SalesOrder,$value->SalesOrderItem
            ];
        }
        $fileName='装柜报表'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit();  
    }

    //待生产和生产中的搜索条件
    public function _searchProduction($input){
        $where=[];
        if(isset($input['RankPlanName']) && $input['RankPlanName']){
            $where[]=['task.RankPlanName','like','%'.$input['RankPlanName'].'%'];
        }
        if(isset($input['ProductLine']) && $input['ProductLine']){
            $where[]=['task.ProductLine','like','%'.$input['ProductLine'].'%'];
        }
        if(isset($input['StartDate']) && $input['StartDate']){
            $where[]=['task.StartDate','like','%'.$input['StartDate'].'%'];
        }

        return $where;

    }

    //获取待生产和生产中的数据
    public function getProductionList($input){
        
        //待报数量
        $num=0;
        //状态为待生产、生产中的
        $status=[4,5];
        $data=[
            'plan.*',
            'task.*',
            'box.operator as BoxOperator'
        ];
        $where=$this->_searchProduction($input);
        $trayList=DB::table($this->table.' as plan')
                ->select($data)
                ->distinct()
                ->leftjoin($this->taskTable.' as task','plan.ID','=','task.ProductPlanID')
                ->leftjoin($this->boxTable.' as box','task.ID','=','box.ProductTaskId')
                ->addSelect(DB::raw('SUM(box.InNumber) as inNumber'))
                ->groupBy('plan.ID')
                ->where($where)
                ->whereIn('plan.States',$status)
                ->get();
        foreach($trayList as $key=>$val){
            $num=$val->OrderNumber-$val->inNumber;
            $val->waitNum=$num;
        }
        return $trayList;

    }

    //新增托盘
    public function insertTary($input){
        $data=date("Y/m/d");
        $data_ay=explode('/',$data);
        //日期
        $dataStr="";
        for ($i=0; $i <\count($data_ay) ; $i++) { 
            $dataStr=implode($data_ay);
        }
        //班次
        $beach=$input['RankPlanName'];

        //生产线
        $productLine=$input['ProductLine'];

        //根据日期查找是否当天是否已经有托盘，如果有则加，如果没有则为001
        $count=DB::table($this->taryTable)->where('Date','like','%'.date("Y-m-d").'%')->select()->count();
        if($count==0){
            //流水号
            $waterNo='001';
        }else{
            $waterNo='001'+$count;
        }
        $waterNo=sprintf('%03s',$waterNo);
        //托盘号
        $palletNo=$dataStr.$beach.$productLine."-".$waterNo;  
        $data=[
            'TaryCode'=>$palletNo,
            'Date'=>date('Y-m-d')
        ]; 
        $taryId=DB::table($this->taryTable)->insertGetId($data);     
        return $palletNo;
    }

    //装箱
    public function encasement($input){
        //派工ID
        $taskId=$input['ID'];
        //报工数量
        $InNumber=$input['InNumber'];
        //装箱人
        $BoxOperator=$input['BoxOperator'];

        //调用方法获取箱号
        $boxCode=$this->getBoxNo($input);

        //计划ID
        $planId=DB::table($this->taskTable)->select('ProductPlanID')->where('ID',$input['ID'])->first();

        //总数量
        $number=DB::table($this->table)->select('OrderNumber')->where('ID',$planId->ProductPlanID)->first();


        $sumbitNum=DB::table($this->boxTable)
                ->addSelect(DB::raw('SUM(InNumber) as InNumber'))
                ->where('ProductPlanId',$planId->ProductPlanID)->first();
        //插入的数组
        $data=[
            'BoxCode'=>$boxCode,
            'ProductTaskId'=>$taskId,
            'ProductPlanId'=>$planId->ProductPlanID,
            'InNumber'=>$InNumber,
            'operator'=>$BoxOperator
        ];
        $num=DB::table($this->boxTable)->insertGetId($data);

        //报工数量
        if(!empty($sumbitNum->InNumber)){
            $sumbitNum=$InNumber+$sumbitNum->InNumber;
        }else{
            $sumbitNum=$InNumber;
        }
        if($number->OrderNumber<=$sumbitNum){
            $status=6;
        }else{
            $status=5;
        }
        $upd=[
            'States'=>$status,
            'DueDate'=>date('Y-m-d')
            ];

        $updNum=DB::table($this->table)->where('ID',$planId->ProductPlanID)->update($upd);
        return $num;

    }

    //装托
    public function palletizer($ids,$operator,$taryCode){
        $taryId=DB::table($this->taryTable)->select('ID')->where('TaryCode',$taryCode)->first();
        $data=[
            'TaryId'=>$taryId->ID
        ];
        $num=DB::table($this->boxTable)->whereIn('ID',$ids)->update($data);
        $opeData=[
            'Operator'=>$operator
        ];
        $updNum=DB::table($this->taryTable)->where('ID',$taryId->ID)->update($opeData);
        return $updNum;
    }

    //获取所有装箱明细
    public function getBoxList($input){
        $where=$this->_searchProduction($input);
        $data=[
            'box.ID',
            'box.BoxCode',
            'box.ProductTaskId',
            'box.ProductPlanId',
            'box.InNumber',
            'box.TaryId',
            'box.operator as BoxOperator',
            'task.RankPlanName',
            'task.ProductLine',
            'plan.SalesOrder',
            'plan.SalesOrderItem',
            'plan.MaterialCode',
            'plan.MaterialName',
            'plan.country',
            'tary.TaryCode',
            'tary.Date'
            
        ];

        $obj_list=DB::table($this->boxTable.' as box')
                ->select($data)
                ->leftjoin($this->table.' as plan','box.ProductPlanId','=','plan.ID')
                ->leftjoin($this->taskTable.' as task','box.ProductTaskId','=','task.ID')
                ->leftjoin($this->taryTable.' as tary','box.TaryId','=','tary.ID')
                ->where('box.TaryId',0)
                ->where($where)
                ->get();
        return $obj_list;
    }

    //检查3开头的销售订单是否有CustomerPo
    public function checkInital($input){
        $checkData=[];
        $k=0;
        foreach ($input as $key => $value) {
            $num=substr($value['salesOrder'],0,1);
            if(\strcmp('3',$num)==0){
                if(empty($value['CustomerPo'])){
                    $checkData[$k]=$value['salesOrder'];
                    $k++;
                }
            }
        }
        return $checkData;
    }

    //物料与SKU的导入
    public function saveInitial($input){
        /* foreach($input as $k=>$v){
            $lists=DB::table($this->materialSku)->select('mbh_material_sku_relation.*')->where('material',$v['material'])->get();
            if(!empty($lists[0])) TEA('804');
        } */

        $data=[];
        foreach ($input as $key => $value) {
            if(empty($value['salesOrder'])){
                continue;
            }
            $data=[
                'salesOrder'=>$value['salesOrder'],
                'salesOrderItem'=>$value['salesOrderItem'],
                'number'=>$value['number'],
                'material'=>$value['material'],
                'sku'=>$value['sku'],
                'CustomerPo'=>$value['CustomerPo'],
                'CustomerPoItem'=>$value['CustomerPoItem']
            ];
            $insertId=DB::table($this->materialSku)->insertGetId($data);
            if(!$insertId) TEA('802');
        }
    }

    //物料与SKU关系列表搜索条件
    public function _searchMaterialSku(&$input){
        $where = array();
        //根据订单号查询
        if (isset($input['salesOrder']) && $input['salesOrder']) {
            $where[]=['salesOrder','like','%'.$input['salesOrder'].'%'];
        }
        //根据订单行项查询
        if (isset($input['salesOrderItem']) && $input['salesOrderItem']) {
            $where[]=['salesOrderItem','like','%'.$input['salesOrderItem'].'%'];
        }
        //根据SKU查询
        if (isset($input['sku']) && $input['sku']) {
            $where[]=['sku','like','%'.$input['sku'].'%'];
        }
        //根据物料查询
        if (isset($input['material']) && $input['material']) {
            $where[]=['material','like','%'.$input['material'].'%'];
        }
        return $where;
    }

    //获取物料与SKU关系列表
    public function getMaterialSku($input){
        $where=$this->_searchMaterialSku($input);
        $data=[
            'id',
            'material',
            'sku',
            'salesOrder',
            'salesOrderItem',
            'number',
            'CustomerPo',
            'CustomerPoItem'
        ];
        $obj_list=DB::table($this->materialSku)->select($data)
        ->where($where)
        ->offset(($input['page_no']-1)*$input['page_size'])
        ->limit($input['page_size'])
        ->get();
        //总共有多少条记录
        $obj_list->total_records=DB::table($this->materialSku)
                                 ->select($data)
                                 ->where($where)
                                 ->count();
        return $obj_list;
    }

    //根据ID获取信息
    public function getMaterialSkuById($id){
        if($id) TEA('404');
        $data=[
            'id',
            'material',
            'sku',
            'salesOrder',
            'salesOrderItem',
            'number'
        ];
        $obj_list=DB::table($this->materialSku)->where('id',$id)->select($data)->first();
        if($obj_list) TEA('802');
        return $obj_list;
    }

    //修改物料与SKU关系
    public function updateMaterialSku($input){
        $id=$input['id'];
        $data=[
            'number'=>$input['number'],
            'material'=>$input['material'],
            'sku'=>$input['sku'],
            'CustomerPoItem'=>$input['CustomerPoItem'],
            'CustomerPo'=>$input['CustomerPo']
        ];
        $upd=DB::table($this->materialSku)->where('id',$id)->update($data);
        return $upd;

    }

    //删除物料与SKU关联
    public function deleteMaterialSku($id){
        $num=DB::table($this->materialSku)->where('id',$id)->delete();
        return $num;
    }

    //新增物料与SKU关联
    public function addMaterialSku($input){
        //判断该物料是否已经添加
        /* $material=$input['material'];
        $lists=DB::table($this->materialSku)->where('material',$material)->get();
        if(!empty($lists[0])) TEA('804'); */
        $data=[
            'salesOrder'=>$input['salesOrder'],
            'salesOrderItem'=>$input['salesOrderItem'],
            'number'=>$input['number'],
            'material'=>$input['material'],
            'sku'=>$input['sku'],
            'CustomerPo'=>$input['CustomerPo'],
            'CustomerPoItem'=>$input['CustomerPoItem']
        ];
        $num=DB::table($this->materialSku)->insertGetId($data);
        if(!$num) TEA('804');
        return $num;

    }

    //删除待排产、待领料、待生产的订单
   public function deleteSalesOrder($ids){
    $num=DB::table($this->table)->whereIn('ID',$ids)->delete();
    return $num;
}

//物料与SKU导出模版
public function exportExcel($input){
    $headerName=[
                ['订单号','行项目号','SKU','编码','数量','客户PO','客户PO行项']
            ];
    $fileName='物料与SKU导出模版(3开头销售订单必须有客户PO)'.date('Y-m-d H:i:s',time());
    set_time_limit(0);
     header('Content-Type: application/vnd.ms-excel');
     header('Cache-Control:max-age=0');
    //清除缓存
    ob_end_clean();
    //调用Excel组件进行导出
    Excel::create($fileName,function($excel) use ($headerName){
        $excel->sheet('first',function($sheet) use ($headerName){
            $sheet->rows($headerName);
            //冻结第一行
            $sheet->freezeFirstRow();
        });
    })->export('xlsx');
    exit();
}

}