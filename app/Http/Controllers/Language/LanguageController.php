<?php
/**
 * 
 * User: hao.li
 * Date: 2019/9/11
 * Time: 8:00
 */

namespace App\Http\Controllers\Language;

use App\Http\Controllers\Controller;
use App\Http\Models\Language\Language;
use Illuminate\Http\Request;

class LanguageController extends Controller{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Language();
    }

    //新增语言
    public function addLanguage(Request $request){
        $input=$request->all();
        $this->model->addLanguage($input);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //获取语言列表
    public function getLanguageList(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getLanguageList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        $response['total_records']=$obj_list->total_records;
        return  response()->json($response);
    }

    //获取所有语言
    public function getAllLanguage(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getAllLanguage($input);
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    //修改语言
    public function updateLanguage(Request $request){
        $input=$request->all();
        $this->model->updateLanguage($input);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //删除
    public function deleteLanguage(Request $request){
        $input=$request->all();
        $id=$input['id'];
        $num=$this->model->deleteLanguage($id);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //获取所有能力列表
    public function getAbility(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getAbility($input);
        $response['results']=$obj_list;
        $response['total_records']=$obj_list->total_records;
        return  response()->json($response);
    }

    //能力与语言关联
    public function relevanceAbillity(Request $request){
        $input=$request->all();
        $data=json_decode($input['string']);
        $num=$this->model->relevanceAbillity($data);
        $response=\get_api_response('200');
        return \response()->json($response);

    }

    //批量导出能力模版
    public function exportExcel(Request $request){
        $input=$request->all();
        $response=$this->model->exportExcel($input);
        return response() -> json(get_api_response('200'));
    }

    //导入能力模版
    public function importExcel(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]=='能力ID'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['abilityId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['languageCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='name'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='description'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['description']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['language']=$values[$j][$i];
            }
        }elseif($values[0][$i]=='能力编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['abilityCode']=$values[$j][$i];
            }
        }elseif($values[0][$i]=='名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['abilityName']=$values[$j][$i];
            }
        }
     }  
        unset($data[0]);
        $noCode=$this->model->checkCode($data);
        if(empty($noCode)){
            $this->model->importExcel($data);
            $response=get_api_response('200');
        }else{
            $response=get_api_response('202');
        }
        $response['results']=$noCode;
    //拼接返回值
        return  response()->json($response);
    }

    //工序与语言关联列表
    public function getOperation(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getOperation($input);
        $response['results']=$obj_list;
        $response['total_records']=$obj_list->total_records;
        return  response()->json($response);
    }

    //工序与多语言导出模版
    public function exportOperationExcel(Request $request){
        $input=$request->all();
        $response=$this->model->exportOperationExcel($input);
        return response() -> json(get_api_response('200'));
    }

    //工序与多语言导入
    public function importOperationExcel(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]=='工序ID'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['operationId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['languageCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='工序编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['operationCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['operation']=$values[$j][$i];
            }
        }elseif($values[0][$i]=='name'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
        }
     }  
        unset($data[0]);
        $noCode=$this->model->checkCode($data);
        if(empty($noCode)){
            $this->model->importOperationExcel($data);
            $response=get_api_response('200');
        }else{
            $response=get_api_response('202');
        }
        $response['results']=$noCode;
    //拼接返回值
        return  response()->json($response);
    }

    //工序与多语言关联
    public function operationLanguage(Request $request){
        $input=$request->all();
        $data=json_decode($input['string']);
        $this->model->operationLanguage($data);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //特殊工艺列表
    public function getSpecialCraftList(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getSpecialCraftList($input);
        return  response()->json(get_success_api_response($obj_list));
    }

    //特殊工艺与多语言关联
    public function specialLanguage(Request $request){
        $input=$request->all();
        $input=\json_decode($input['data']);
        $this->model->specialLanguage($input);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //图片与多语言关联
    public function imageLanguage(Request $request){
        $input=$request->all();
        $num=$this->model->imageLanguage($input);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //获取图片
    public function getImage(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getImage($input);
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    //获取外语图片
    public function getLanImage(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getLanImage($input);
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    //删除图片
    public function deleteImage(Request $request){
        $input=$request->all();
        $num=$this->model->deleteImage($input['id']);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //特殊工艺导出
    public function exportSpecial(Request $request){
        $input=$request->all();
        
        $response=$this->model->exportSpecial($input);
        return response() -> json(get_api_response('200'));
    }

    //导入特殊工艺模版
    public function importSpecial(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]=='rbrb_id'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['specialId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['languageCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='特殊工艺'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['specialComment']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='special_desc'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['specialDesc']=$values[$j][$i];
            }
        }
     }  
        unset($data[0]);
        $noCode=$this->model->checkCode($data);
        if(empty($noCode)){
            $this->model->importSpecial($data);
            $response=get_api_response('200');
        }else{
            $response=get_api_response('202');
        }
        $response['results']=$noCode;
    //拼接返回值
        return  response()->json($response);
    }

    //导出物料属性
    public function exportAttribute(Request $request){
        $input=$request->all();
        $response=$this->model->exportAttribute($input);
        return response() -> json(get_api_response('200'));
    }

    //导入物料属性
    public function importAttribute(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]=='物料属性ID'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['attributeId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='属性键值'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['attributeKeys']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['languageCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='物料属性名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['attributeName']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='物料属性外语名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['attributeLanName']=$values[$j][$i];
            }
        }
     }  
        unset($data[0]);
        $noCode=$this->model->checkCode($data);
        if(empty($noCode)){
            $this->model->importAttribute($data);
            $response=get_api_response('200');
        }else{
            $response=get_api_response('202');
        }
        $response['results']=$noCode;
    //拼接返回值
        return  response()->json($response);
    }

     //导出物料属性值
     public function exportValue(Request $request){
        $input=$request->all();
        $response=$this->model->exportValue($input);
        return response() -> json(get_api_response('200'));
    }

    //导入物料属性值
    public function importValue(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        for($i=0;$i<count($values);$i++){
            for($j=0;$j<count($values[$i]);$j++){
                if(is_object($values[$i][$j]))  $values[$i][$j]= $values[$i][$j]->__toString();
            }
        }
       $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]=='物料属性ID'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['attributeId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='物料ID'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['materialId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['languageCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='物料名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['materialName']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='物料属性值名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['materialValue']=$values[$j][$i];
            }
        }elseif($values[0][$i]=='物料属性值多语言名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['lanValue']=$values[$j][$i];
            }
        }
     }  
        unset($data[0]);
        $noCode=$this->model->checkCode($data);
        if(empty($noCode)){
            $this->model->importValue($data);
            $response=get_api_response('200');
        }else{
            $response=get_api_response('202');
        }
        $response['results']=$noCode;
    //拼接返回值
        return  response()->json($response);
    }

    //版本升级
    public function bomVersion(Request $request){
        $input=$request->all();
        $num=$this->model->bomVersion($input);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //检查要发布的是否已经有多语言
    public function checkBom(Request $request){
        $input=$request->all();
        $obj_list=$this->model->checkBom($input);
        $response['obj_list']=$obj_list;
        $response['marterial_info']=$obj_list->marterial_info;
        return response()->json(get_success_api_response($response));
    }

    //检查当前使用的工艺是否已经维护多语言
    public function checkBomLan(Request $request){
        $input=$request->all();
        $obj_list=$this->model->checkBomLan($input);
        $response['obj_list']=$obj_list;
        $response['marterial_info']=$obj_list->marterial_info;
        $response['marterial_describle']=$obj_list->marterial_describle;
        return response()->json(get_success_api_response($response));
    }

    //进出料描述多语言关联
    public function materialDescription(Request $request){
        $input=$request->all();
        $data=\json_decode($input['datas']);
        $num=$this->model->materialDescription($data);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //获取工艺路线多语言列表
    public function getProcedureRouteLanguage(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getProcedureRouteLanguage($input);
        $response['results']=$obj_list;
        $response['total_records']=$obj_list->total_records;
        return  response()->json($response);
    }

    //工艺路线与多语言关联
    public function procedureRouteLanguage(Request $request){
        $input=$request->all();
        $data=json_decode($input['string']);
        $this->model->procedureRouteLanguage($data);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    //批量导出工艺路线模版
    public function exportProcedureRouteExcel(Request $request){
        $input=$request->all();
        $response=$this->model->exportProcedureRouteExcel($input);
        return response() -> json(get_api_response('200'));
    }

    //导入工艺路线模版
    public function importProcedureRouteExcel(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]=='工艺路线ID'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['rprId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['languageCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='name'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['language']=$values[$j][$i];
            }
        }elseif($values[0][$i]=='名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['rprName']=$values[$j][$i];
            }
        }
     }  
        unset($data[0]);
        $noCode=$this->model->checkCode($data);
        if(empty($noCode)){
            $this->model->importProcedureRouteExcel($data);
            $response=get_api_response('200');
        }else{
            $response=get_api_response('202');
        }
        $response['results']=$noCode;
    //拼接返回值
        return  response()->json($response);
    }

    //导出做法字段
    public function exportPractice(Request $request){
        $input=$request->all();
        $response=$this->model->exportPractice($input);
        return response() -> json(get_api_response('200'));
    }

    //导入做法字段
    public function importPractice(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]=='做法字段ID'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['rpfId']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='语言编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['languageCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='做法字段编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['rpfCode']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='name'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
        }elseif($values[0][$i]=='description'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['description']=$values[$j][$i];
            }
        }
     }  
        unset($data[0]);
        $noCode=$this->model->checkCode($data);
        if(empty($noCode)){
            $this->model->importPractice($data);
            $response=get_api_response('200');
        }else{
            $response=get_api_response('202');
        }
        $response['results']=$noCode;
    //拼接返回值
        return  response()->json($response);  
    }

    //获取做法字段列表
    public function getPracticeList(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getPracticeList($input);
        $response['results']=$obj_list;
        $response['total_records']=$obj_list->total_records;
        return  response()->json($response);
    }

    //做法字段与多语言关联
    public function practiceLanguage(Request $request){
        $input=$request->all();
        $data=json_decode($input['string']);
        $this->model->practiceLanguage($data);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    /**
     * 转换搜索参数
     * @param $input
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
     public function transformSearchParams(&$input)
     {
         //物料项
         if(!empty($input['item_material_id']))  $input['item_material_path']=','.$input['item_material_id'].',';
         //物料替代项
         if(!empty($input['replace_material_id']))  $input['replace_material_path']=','.$input['replace_material_id'].',';
         //bom状态
         $input['condition'] = empty($input['condition']) ? 'undefined' : $input['condition'];
         $input['status']=$input['condition'];
         if($input['condition']==config('app.bom.condition.released')){
             $input['status']=1;
             $input['is_version_on']=1;
         }else if($input['condition']==config('app.bom.condition.activated')){
             $input['is_version_on']=0;
         }
     }

    //获取所有多语言工艺文件
    public function pageIndex(Request $request){
        $input=$request->all();
        //分页参数判断
        $this->checkPageParams($input);
        //转换参数
        $this->transformSearchParams($input);
        //获取数据
        $obj_list=$this->model->getLanProductBomList($input);
        $response['results']=$obj_list;
        //$response['total_records']=$obj_list->total_records;
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    //获取树状图
    public function show(Request $request){
        $input=$request->all();
        $need_find_level = !empty($input['need_find_level']) ? true : false;
        //呼叫M层进行处理
        $results= $this->model->get($input['bom_id'],$need_find_level);
        return  response()->json(get_success_api_response($results));
    }

    /**
     *  多语言版本工单工艺列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndexlist(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list=$this->model->pageIndexlist($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 多语言版本销售订单工艺
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function salesorderProcess(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->salesorderProcess($input);
        return response()->json(get_success_api_response($result));

    }
}