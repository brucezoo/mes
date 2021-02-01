<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 17/12/04
 * Time: 上午 10:21
 */
namespace App\Http\Controllers\Mes;

use App\Libraries\Trace;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\Bom;
use App\Libraries\Soap;

/**
 *BOM控制器
 *@author    rick
 *@reviser   sam.shan  <sam.shan@ruis-ims.cn>
 */
class BomController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Bom();
    }

//region  增

    /**
     * 添加BOM所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        if(!empty($input['version'])) $where[]=['version','<>',$input['version']];
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * BOM添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author   rick
     * @reviser  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=['bom_id'=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }

    /**
     * sap 同步bom给mes
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncBom(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncBom($input);
        return response()->json(get_success_sap_response($response));
    }
//endregion

//region  改

    /**
     * 组装子项
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function assemblyItem(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->assemblyItem($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * BOM修改
     * @param Request $request
     * @throws \App\Exceptions\ApiException
     * @return \Illuminate\Http\JsonResponse
     * @author   rick
     */
    public function update(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $result = $this->model->update($input);
        $result = $result==null?$input['bom_id']:$result;
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$result]));
    }

    /**
     * 修改状态
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeStatus(Request $request)
    {
        $id = $request->input($this->model->apiPrimaryKey);
        //获得所有参数
        $input = $request->all();
        //呼叫M层进行处理
        $this->model->changeStatus($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }

    /**
     * 修改是否组装
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeAssembly(Request $request)
    {
        $id = $request->input('bom_item_id');
        //获得所有参数
        $input = $request->all();
        //呼叫M层进行处理
        $this->model->changeAssembly($input);
        //获取返回值
        return  response()->json(get_success_api_response(['bom_item_id'=>$id]));
    }

//endregion

//region  查

    /**
     * 查看详情
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
    {
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $need_find_level = !empty($input['need_find_level']) ? true : false;
        //呼叫M层进行处理
        $results= $this->model->get($input[$this->model->apiPrimaryKey],$need_find_level);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 查询物料的bom编号
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialBomNos(Request $request){
        $material_id = $request->input('material_id');
        if(empty($material_id)) TEA('700','material_id');
        $obj_list = $this->model->getMaterialBomNos($material_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 查询bom有效的发布记录
     */
    public function getBomReleaseRecord(Request $request){
        $input = $request->all();
        $obj_list = $this->model->getBomReleaseRecord($input);
        return response()->json(get_success_api_response($obj_list));
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
    /**
     * 获取BOM列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author   rick
     * @throws \App\Exceptions\ApiException
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //转换参数
        $this->transformSearchParams($input);
        //获取数据
        $obj_list=$this->model->getBomList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * @param Request $request
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function  getBomTree(Request $request)
    {
        //获取参数
        $bom_material_id=$request->input('bom_material_id');
        if(empty($bom_material_id))  TEA('700','bom_material_id');
        $version=$request->input('version');
        if(empty($version))  TEA('700','version');
        //默认不反回替代物料的
        $replace=$request->input('replace',0);
        //默认也不返回阶梯信息的
        $bom_item_qty_level=$request->input('bom_item_qty_level',0);
        //联系M层
        $trees=$this->model->getBomTree($bom_material_id,$version,false,false,false);
        //返回给前端
        return  response()->json(get_success_api_response($trees));

    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDesignBom(Request $request)
    {
        $input = $request->all();
        if(empty($input['material_id']) || !is_numeric($input['material_id'])) TEA('700','material_id');
        if(!isset($input['bom_no'])) TEA('700','bom_no');
        //呼叫M层进行处理
        $result = $this->model->getDesignBom($input['material_id'],$input['bom_no']);
        //获取返回值
        return  response()->json(get_success_api_response($result));
    }

    public function releaseBeforeCheck(Request $request)
    {
        $input = $request->all();
        if(empty($input['material_id']) || !is_numeric($input['material_id'])) TEA('700','material_id');
        if(!isset($input['bom_no'])) TEA('700','bom_no');
        //呼叫M层进行处理
        $result = $this->model->releaseBeforeCheck($input['material_id'],$input['bom_no']);
        //获取返回值
        return  response()->json(get_success_api_response(['num'=>$result]));
    }


    /**
     * 获取进料
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getEnterBomMaterial(Request $request){
        $bom_id = $request->input($this->model->apiPrimaryKey);
        if(empty($bom_id)) TEA('700',$this->model->apiPrimaryKey);
        $routing_id = $request->input('routing_id');
        if(empty($routing_id)) TEA('700','routing_id');
        $obj_list = $this->model->newGetEnterBomMaterial($bom_id,$routing_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据进料集合获取出料
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getOutBomMaterial(Request $request){
        $materials = $request->input('materials');
        if(empty($materials) || !is_json($materials)) TEA('700','materials');
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $obj_list = $this->model->newGetOutBomMaterial($bom_id,$materials);
        return response()->json(get_success_api_response($obj_list));
    }


    public function getBomByDrawingCode(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getBomByDrawingCode($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

//endregion

//region  删

    /**
     * 删除
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroy($id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }

    public function deleteReleaseRecord(Request $request){
        $input = $request->all();
        if(empty($input['release_record_id']) || !is_numeric($input['release_record_id'])) TEA('700','release_record_id');
        $this->model->deleteReleaseRecord($input['release_record_id']);
        return response()->json(get_success_api_response(200));
    }

//endregion

    public function getAllBomInmaterial(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getAllBomInmaterial($input);
        //$results = $this->model->getAllBomTree($input);
        return  response()->json(get_success_api_response($results));
    }

    public function updateBomMaterial(Request $request)
    {
        $input = $request->all();
        $data = $input['data'];
        if(empty($input['data'])) TEA('700','data');

        $results = [];
        foreach ($data as $v)
        {
            $temp = '';
            /*try {*/
                $response = $this->model->upgradeBomBatch($v);
            /*} catch (\Exception $e) {
                $temp=get_api_response($e->getCode());
            }*/
            if (isset($response) && !empty($response))
            {
                $result['message']='';
                $result['bom_num']=$v['code'];
            }
            else
            {
                $result['message']=$temp;
                $result['bom_num']=$v['code'];
            }
            $results[] = $result;
        }

        return  response()->json(get_success_api_response($results));
    }

    /**
     * bom设置基础款
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function setBomBase(Request $request)
    {
        $input = $request->all();
        if (empty($input['bom_id'])) TEA('700','bom_id');

        $this->model->setBomBase($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 获取待维护工时列表数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * hao.li
     */
     public function getBomWaitList(Request $request){
         $input=$request->all();
         $obj_list=$this->model->getBomWaitList($input);
         $response['results']=$obj_list;
         $response['total_records']=$obj_list->total_records;
         return  response()->json($response);
     }

     /**
     * 导出待维护工时
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * hao.li
     */
     public function exportBomWait(Request $request){
        $input=$request -> all();
        $response=$this->model->exportBomWait($input);
        return response() -> json(get_api_response('200'));
     }

     //导入批量修改工作中心表
     public function importBatchCenter(Request $request){
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
            if($values[0][$i]!='物料' && $values[0][$i]!='工厂' && $values[0][$i]!='TL类型' && $values[0][$i]!='组' && $values[0][$i]!='ID'&& $values[0][$i]!='行号'&& $values[0][$i]!='工作中心'
            && $values[0][$i]!='短描述'&& $values[0][$i]!='新工作中心'&& $values[0][$i]!='组计数器'){
                for($j=0;$j<count($values);$j++){
                    unset($values[$j][$i]);
                }
            }elseif($values[0][$i]=='物料'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['materialCode']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='工厂'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['factory']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='TL类型'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['TL']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='组'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['group']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='ID'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['noId']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='行号'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['operation']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='工作中心'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['oldCenter']=$values[$j][$i];
                }
            }
            elseif($values[0][$i]=='短描述'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['describle']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='新工作中心'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['newCenter']=$values[$j][$i];
                }
            }elseif($values[0][$i]=='组计数器'){
                for($j=0;$j<count($values);$j++){
                    $data[$j]['groupCount']=$values[$j][$i];
                }
            }
        }
        unset($data[0]);
        //检查表格中是否有相同的物料编码和行项
        $excel=$this->model->checkExcel($data);
        //检查物料编码、工厂、工序行号、工作中心是否符合
        $this->model->checkWorkcenter($data);
        //检查新工作中心是否与工序步骤关联
        $this->model->operationStepWorkcenter($data);
        $this->model->importBatchCenter($data);
        $response=get_api_response('200');
        //拼接返回值
        return  response()->json($response);
     }

     //批量修改工作中心
     public function batchUpdateWorkcenter(Request $request){
         $input=$request->all();
         $ids=\explode(',',$input['ids']);
         $this->model->batchUpdateWorkcenter($ids);
         return response()->json(get_success_api_response(200));  
     }

     //获取待修改的工作中心信息
     public function getAllUpdateWorkcenter(Request $request){
         $input=$request->all();
         $obj_list=$this->model->getAllUpdateWorkcenter($input);
         $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
     }

     //下载模版
     public function downTemplate(Request $request){
         $input=$request->all();
         $this->model->downTemplate($input);
         return response()->json(get_success_api_response(200));
     }

     //获取所有工厂
     public function getFactory(Request $request){
         $input=$request->all();
         $obj_list=$this->model->getFactory($input);
         return response()->json(get_success_api_response($obj_list));
     }

    //获取员工
    public function getEmployee(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getEmployee($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * Mes 同步工艺路线 给 SAP
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     * @author lester.you
     */
     public function batchSyncToSap(Request $request)
     {
         \set_time_limit(0);
         $input = $request->all();
        //  if (empty($input['bom_id'])) TEA('700', 'bom_id');
        //  if (empty($input['routing_id'])) TEA('700', 'routing_id');
 //        if(empty($input['factory_id'])) TEA('700', 'factory_id');
        $ids=\explode(',',$input['ids']);
 
         //$input['factory_id'] = $this->model->getFactoryID($input['bom_id'], $input['routing_id']);
         $obj_list=$this->model->getData($ids);
         foreach ($obj_list as $key => $value) {
             $data = $this->model->batchSyncToSap($value->id,$value->bom_id, $value->routing_id, $value->factoryId);
             if(empty($data)) continue;
             trace('开始时间'.date('Y-m-d H:i:s',time()));
             $resp = Soap::doRequest($data['data'], 'INT_PP000300009', '0003');
             trace('结束时间'.date('Y-m-d H:i:s',time()));
             if ($resp['RETURNCODE'] != 0) {
                 //$this->model->updateLog($value->id,$resp['RETURNINFO']);
                 $this->model->updatePushStatus($value->id,2,$resp['RETURNINFO']);
                 //TEPA($resp['RETURNINFO']);
                 continue;
             }
             // 处理返回的数据
             if (empty($resp['PLNNR'])) TEPA('SAP返回参数（PLNNR）有误。');
             if (empty($resp['PLNAL'])) TEPA('SAP返回参数（PLNAL）有误。');
             $this->model->updateGroupNumberAndCount($resp['PLNNR'], $resp['PLNAL'], $data['bomNo'], $data['materialCode'], $value->routing_id, $value->factoryId,$value->release_record_id,$value->bom_id);
             $this->model->updatePushStatus($value->id,1,'');
         }
         return response()->json(get_success_api_response($resp));
     }


     public function getTechnologymaterial(Request $request)
     {
         //获取文件
         $file = $request->file('file');
         $obj_list = $this->model->getTechnologymaterial($file);
         return response()->json(get_success_api_response($obj_list));
     }

    public function technologyImport(Request $request)
    {
        //获取文件
        $input = $request->all();
        $obj_list = $this->model->technologyImport($input);
        return response()->json(get_success_api_response($obj_list));
    }














}










