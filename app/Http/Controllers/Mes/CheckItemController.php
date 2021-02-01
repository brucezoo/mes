<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/9
 * Time: 14:13
 */
namespace App\Http\Controllers\Mes;

use App\Http\Models\QC\Check;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\StorageInve;
use Excel;
use Illuminate\Support\Facades\DB;

class CheckItemController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Check();
    }

    /**
     * 根据条件列表，并将明细数据导出EXCEL
     * @param
     * @author  Ming.Li
     */
    //导出excel
    public function  exportExcel(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $resp = $this->model->expot($input);
        return response()->json(get_success_api_response($resp));
    }
    /**
     * 搜索
     */
    private function _search(&$input)
    {
        $where = array();
        if (isset($input['check_type']) && $input['check_type']) {
            $where[]=['qcheck.check_type','like','%'.$input['check_type'].'%'];
        }

        if (isset($input['man_check']) && $input['man_check']) {
            $where[]=['qcheck.man_check','=',$input['man_check']];
        }


        if (isset($input['sales_order_code']) && $input['sales_order_code']) {
            $where[]=['productionOrder.sales_order_code','=',$input['sales_order_code']];
        }

        if (isset($input['sales_order_project_code']) && $input['sales_order_project_code']) {
            $where[]=['productionOrder.sales_order_project_code','=',$input['sales_order_project_code']];
        }


        if (isset($input['po_number']) && $input['po_number']) {
            $where[]=['productionOrder.number','like','%'.$input['po_number'].'%'];
        }

        if (isset($input['amount_of_inspection']) && $input['amount_of_inspection']) {
            $where[]=['qcheck.amount_of_inspection','=',$input['amount_of_inspection']];
        }

        if (isset($input['sub_number']) && $input['sub_number']) {
            $where[]=['qcheck.sub_number','like','%'.$input['sub_number'].'%'];
        }

        if (isset($input['NAME1']) && $input['NAME1']) {
            $where[]=['qcheck.NAME1','like','%'.$input['NAME1'].'%'];
        }

        if (isset($input['wo_number']) && $input['wo_number']) {
            $where[]=['qcheck.wo_number','like','%'.$input['wo_number'].'%'];
        }

        if (isset($input['material_code']) && $input['material_code']) {
            $where[]=['material.item_no','like','%'.$input['material_code'].'%'];
        }

        if (isset($input['WMASN']) && $input['WMASN']) {
            $where[]=['qcheck.WMASN','like','%'.$input['WMASN'].'%'];
        }

        if (isset($input['LGPRO']) && $input['LGPRO']) {
            $where[]=['qcheck.LGPRO','like','%'.$input['LGPRO'].'%'];
        }

        if (isset($input['LGFSB']) && $input['LGFSB']) {
            $where[]=['qcheck.LGFSB','like','%'.$input['LGFSB'].'%'];
        }

        if (isset($input['code']) && $input['code']) {
            $where[]=['qcheck.code','like','%'.$input['code'].'%'];
        }

        if (isset($input['man_check']) && $input['man_check']) {
            $where[]=['qcheck.man_check','=',$input['man_check']];
        }

        if (isset($input['MC']) && $input['MC'] == 1) {
            $where[]=['qcheck.sub_order_id','>',0];
        }

        if (isset($input['material_name']) && $input['material_name']) {
            $where[]=['material.name','like','%'.$input['material_name'].'%'];
        }

        if (isset($input['factory_name']) && $input['factory_name']) {
            $where[]=['pro_factory.name','like','%'.$input['factory_name'].'%'];
        }

        if (isset($input['operation_name']) && $input['operation_name']) {
            $where[]=['operation.name','like','%'.$input['operation_name'].'%'];
        }

        if (isset($input['operation_id']) && $input['operation_id']) 
        {
            $where[]=['operation.id','=',$input['operation_id']];
        }

        if (isset($input['start_time']) && $input['start_time']) {//根据创建时间
            $where[]=['qcheck.ctime','>=',strtotime($input['start_time'])];
        }
        if (isset($input['end_time']) && $input['end_time']) {//根据创建时间
            $where[]=['qcheck.ctime','<=', strtotime($input['end_time'])];
        }

        if (isset($input['check_type_code']) && $input['check_type_code']) {
            $where[]=['qcheck.check_type_code','=',$input['check_type_code']];
        }
        
        if (isset($input['check_resource']) && $input['check_resource']) 
        {
            $where[]=['qcheck.check_resource','=',$input['check_resource']];
        }
        else
        {
            TEA('6525');
        }

        if ($input['check_resource'] == 1) 
        {
            // 如果是iqc
            if (isset($input['check_status']) && $input['check_status']) 
            {
                if ($input['check_status'] == 1) 
                {
                    //如果是没有推送
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='asc';$input['sort']='ctime';
                    } 
                }

                if ($input['check_status'] == 2) 
                {
                    //如果已经推送
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='desc';$input['sort']='ctime';
                    } 
                }

                $where[]=['qcheck.status','=',$input['check_status']];
            }
            else
            {
                //order  (多order的情形,需要多次调用orderBy方法即可)
                if (empty($input['order']) || empty($input['sort'])) 
                {
                    $input['order']='asc';$input['sort']='ctime';
                } 
                $where[]=['qcheck.status','<',2];
            }
        }

        if ($input['check_resource'] == 2) 
        {
            //如果 是ipqc
            if (isset($input['man_check']) && $input['man_check']) 
            {
                if ($input['man_check'] == 0) 
                {
                    //如果没有人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='asc';$input['sort']='ctime';
                    } 
                }

                if ($input['man_check'] == 1) 
                {
                    //如果已经人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='desc';$input['sort']='ctime';
                    } 
                }
                $where[]=['qcheck.man_check','=',$input['man_check']];
            }
            else
            {
                //order  (多order的情形,需要多次调用orderBy方法即可)
                if (empty($input['order']) || empty($input['sort'])) 
                {
                    $input['order']='asc';$input['sort']='ctime';
                } 
                $where[]=['qcheck.man_check','=',0];
            }
        }
        return $where;
    }







    /**
     * @message 添加ipqc送检单
     * @author  liming
     * @time    年 月 日
     */    
    public function  addIpqc(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        $workorder_id  = $input['id'];
        
        //呼叫M层进行处理
        $order_id   =   $this->model->addIpqc($workorder_id);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }  

    /**
     * @message 检验单复制
     * @author  liming
     * @time    年 月 日
     */
     public  function   checkCopy(Request $request)  
     {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $order_id   =   $this->model->checkCopy($input['id']);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
     }  
        


    /**
     * 审核
     * @param Request $request
     * @return  string  返回json
     * @author  
     */
    public  function audit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['ids'])) TEA('703','ids');

        //呼叫M层进行处理
        $order_id   =   $this->model->audit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['ids']];
        return  response()->json($response);
    }




    /**
     * 反审
     * @param Request $request
     * @return  string  返回json
     * @author  
     */
    public  function noaudit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['ids'])) TEA('703','id');
        //呼叫M层进行处理
        $this->model->noaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['ids']];
        return  response()->json($response);
    }

//region 修
//编辑检验
    public function updateCheck(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->update($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

    /**
     * @message 选择模板
     * @author  liming
     * @time    年 月 日
     */    
    public function selectTemplate(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->selectTemplate($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

    // 查看模板
    public  function   showTemplate(Request $request)
    {
       //判断ID是否提交
        $check_id=$request->input('check_id');
        if(empty($check_id)|| !is_numeric($check_id)) TEA('703','check_id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->showTemplate($check_id);
        return  response()->json($response);
    }


    /**
     * 添加检验结果
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkMore(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->model->checkMore($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }
//endregion

//region 查
//查看检验
    public function viewCheck(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->model->viewCheck($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

    /**
     * 查询某条记录
     * @param Request   $request
     * @return string   返回json
     */
    public function  show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->get($id);
        return  response()->json($response);
    }

//检验列表
    public function select(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->select($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * @message 模糊查询
     * @author  liming
     * @time    年 月 日
     */    
    public function selectDim(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->selectDim($input);
        //获取返回值
        return  response()->json(get_success_api_response($obj_list));
    }  



    //检验下拉框
    public function dropdownSelect(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->dropdownSelect($input);
        //获取返回值
        return  response()->json(get_success_api_response($obj_list));
    }
//endregion

//region 删
//endregion

    /**
     * @message  同步送检单
     * @author  liming
     * @time    年 月 日
     */    
    public function syncInspectOrder(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncInspectOrder($input);
        return response()->json(get_success_sap_response($response));
    } 


    /**
     * @message  同步送检单
     * @author  liming
     * @time    年 月 日
     */    
    public function pushInspectOrder(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['check_id']) || !is_numeric($input['check_id'])) TEA('703','check_id');
        $response = $this->model->pushInspectOrder($input);
        if ($response['SERVICERESPONSE']['RETURNCODE'] != 0)
        {
            return $response;
        }else{
            // 如果推送成功，状态为2
            $qc_check_type=$this->model->updatePushStatus($input);
        }
        return   $response;
    }


    /**
     * @message 编辑检验数量
     * @author  liming
     * @time    年 月 日
     */    
    public function setCheckQty(Request $request)
    {
        $input = $request->all();
        //id判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->setCheckQty($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }


    /**
     * @message 更改 检验单状态
     * @author  liming
     * @time    年 月 日
     */    
    public function updatePushStatus(Request $request)
    {
        $input = $request->all();
        //id判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->updatePushStatus($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

    /**
     * 批量推送 shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function batchSending(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['check_id']))TEA('703','check_id');
        $response = $this->model->BatchSending($input);
        return $response;
    }

    // 获取qc缺失项
    public function missingIitems(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->missingIitems($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     *  qc删除补料提示
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function feedingListremind(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->feedingListremind($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * qc 删除补料单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function feedingListdelete(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->feedingListdelete($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * qc 退回删除补料单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function feedingListrepulse(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->feedingListrepulse($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * oqc 成品送检推送sap
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function pushFinishedproduct(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['check_id']))TEA('703','check_id');
        $response = $this->model->pushFinishedproduct($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     *  ipqc、oqc检验数量 修改
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateCheckQty(Request $request)
    {
        $input=$request->all();
        if(empty($input['id']) || !is_numeric($input['id']))  TEA('703','id');
        $qc_check_type=$this->model->updateCheckQty($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     *  检验单删除
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function checklistDelete(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checklistDelete($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     *  生成失效  hao.li
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
     public function createInvalidOffer(Request $request){
        $input=$request->all();
        \trim_strings($input);
        $this->model->createInvalidOffer($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 生成委外报检单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createInspectionReport(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $res = $this->model->createInspectionReport($input);
        if($res)
        {
            return response()->json(get_success_sap_response($input));
        }
        else
        {
            return response()->json(get_fail_sap_response($input,'生成委外报检单失败'));
        }

    }

    /**
     * 委外报检推送sap
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function pushWqcToSap(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['check_id']) || !is_numeric($input['check_id'])) TEA('703','check_id');
        $response = $this->model->pushWqcToSap($input);
        if ($response['SERVICERESPONSE']['RETURNCODE'] != 0)
        {
            return $response;
        }else{
            // 如果推送成功，状态为2
            $qc_check_type=$this->model->updatePushStatus($input);
        }
        return   $response;
    }
}