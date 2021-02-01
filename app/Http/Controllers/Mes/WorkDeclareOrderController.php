<?php
namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\WorkDeclareOrder;
use App\Http\Models\BatchWorkDeclareOrder;
use App\Libraries\Soap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Models\WorkDeclareOrder as New_Work_Declare_Order;
use Illuminate\Support\Facades\Redis;

class WorkDeclareOrderController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new WorkDeclareOrder();
         $this->batchmodel = new BatchWorkDeclareOrder();
         if(empty($this->mbh_declare_order)) $this->mbh_declare_order =new New_Work_Declare_Order\WorkDeclareOrder();
    }

    /**
     * @message 新增报工单
     * @author  liming
     * @time    年 月 日
     */
    public function store(Request $request)
    {
        $input = $request->all();
        $is_lock = Redis::setnx($input['work_order_id'].'_wdo',1); //设置锁
        if($is_lock == 1) {
            Redis::expire($input['work_order_id'].'_wdo', 60); //添加锁的过期时间
            try {
                $this->model->checkPushdeclareOrder($input);
                $result= $this->model->store($input);
            } catch (\Exception $e) {
                //释放锁
                Redis::del($input['work_order_id'].'_wdo');
                if($e->getCode()!=700 && $e->getCode()!=0)
                {
                    TEA($e->getCode());
                }
                else
                {
                    TEPA($e->getMessage());
                }

            }
            //释放锁
            Redis::del($input['work_order_id'].'_wdo');
        }
        else
        {
            // 防止死锁
            if(Redis::ttl($input['work_order_id'].'_wdo') == -1)//以秒为单位，返回key的过期时间
            {
                Redis::del($input['work_order_id'].'_wdo'); //超时释放锁
            }
            TEPA('当前报工单正在保存中，请稍后');
        }
        $response=get_api_response('200');
        $response['results']=$result;
        return  response()->json($response);
    }


    /**
     * 合并报工
     * author: szh
     * Date: 2019/7/10/010
     * Time: 15:35
     */
    public function storeMore(Request $request)
    {
        $input = $request->all();
        if(empty($input['moreItems'])) TEA('700');
        $moreItems = json_decode($input['moreItems'],true);
        if (count($moreItems) >0 )
        {
            $resp  = [];
            $response=get_api_response('200');
            DB::connection()->beginTransaction();
            foreach ($moreItems as  $item)
            {
                $is_lock = Redis::setnx($item['work_order_id'].'_wdo',1); //设置锁
                if($is_lock == 1) {
                    Redis::expire($item['work_order_id'] . '_wdo', 60); //添加锁的过期时间

                    $this->model->checkPushdeclareOrder($item);
                    $result = $this->model->store($item);
                    //释放锁
                    Redis::del($item['work_order_id'].'_wdo');
                    if (isset($result['message'])) {
                        DB::connection()->rollBack();
                        return response()->json($response);
                        break;
                    }
                    $response['results'][] = $result;
                }
                else
                {
                    // 防止死锁
                    if(Redis::ttl($item['work_order_id'].'_wdo') == -1)//以秒为单位，返回key的过期时间
                    {
                        Redis::del($item['work_order_id'].'_wdo'); //超时释放锁
                    }
                }
            }
            DB::connection()->commit();
        }
        return  response()->json($response);
    }

    /**
     * 委外合并报工
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function outStoreMore(Request $request)
    {
        $input = $request->all();
        if(empty($input['moreItems'])) TEA('700');
        $moreItems = json_decode($input['moreItems'],true);
        if (count($moreItems) >0 )
        {
            $resp  = [];
            $response=get_api_response('200');
            DB::connection()->beginTransaction();
            foreach ($moreItems as  $item)
            {
                $result= $this->model->outStore($item);
                if(isset($result['message'])){
                    DB::connection()->rollBack();
                    return  response()->json($response);
                    break;
                }
                $response['results'][]=$result;
            }
            DB::connection()->commit();
        }
        return  response()->json($response);
    }


    /**
     * @message 新增报工单
     * @author  liming
     * @time    年 月 日
     */
    public function outStore(Request $request)
    {
        $input = $request->all();
        //yu.peng 8.20 多报工单处理
        $now_work_order_res = DB::table('ruis_subcontract_order')->select('production_order_id','operation_id')->where('id',$input['sub_id'])->first();
        $all_work_order_res = DB::table('ruis_subcontract_order')//看是否一道工序对应两道工单
            ->select('*')
            ->where(['production_order_id'=>$now_work_order_res->production_order_id,'operation_id'=>$now_work_order_res->operation_id])
            ->where('id', '<>', $input['sub_id'])
            ->get();
        //自动生成的报工单不需要再次报工
        if(!empty($all_work_order_res))
        {
            foreach ($all_work_order_res as $ak=>$av)
            {
                $res = DB::table('ruis_work_declare_order')
                    ->where(['sub_id'=>$av->id,'type'=>1])//报工单类型  0车间报工   1 委外报工
                    ->count();
                if($res>0)
                {
                    unset($all_work_order_res[$ak]);
                }
            }
        }
        /*$ruis_work_declare_order = DB::table('ruis_work_declare_order')
            ->where(['sub_id'=>$input['sub_id'],'type'=>1])//报工单类型  0车间报工   1 委外报工
            ->get();*/
        if(count($all_work_order_res) > 0)
        {
            $insert_id= $this->model->outStore($input);//第一条必须分开处理，防止用户选择差异原因
            //其他的批量调用
            //拼接批量数据
            $res = $this->model->dealData($all_work_order_res,$input);
            if($res)
            {
                foreach ($res as $k=>$v)
                {
                    $this->model->outStore($v);
                }
            }
        }
        else
        {
            $insert_id= $this->model->outStore($input);
        }
        //yu.peng 8.20 多报工单处理
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];
        return  response()->json($response);
    }


    /**
     * 编辑
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author liming
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['other_instore_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 更改报工责任人
     * author: szh
     * Date: 2019/4/19/019
     * Time: 8:59
     */
    public function updateEmplyee(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->model->updateEmplyee($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['other_instore_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 分页列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     */
    public function  pageIndex(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        //$obj_list=$this->model->getPageList($input);
        $obj_list=$this->model->getOptimizationPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 分页列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     */
    public function  getDeclareOrderList(Request $request)
    {
        // header('Access-Control-Allow-Origin:*');
        // header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        // header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        // header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);

        if((!array_key_exists('sales_order_code', $input)||empty($input['sales_order_code']))
            &&(!array_key_exists('po_number', $input)||empty($input['po_number']))
            &&(!array_key_exists('wo_number', $input)||empty($input['wo_number']))
            &&(!array_key_exists('code', $input)||empty($input['code']))
            ){
            return  response()->json(get_api_exception_response("销售订单/生产订单/工单/报工单，必填其一"));
        }

        //获取数据
        $obj_list=$this->mbh_declare_order->getDeclareOrderList($input);

        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 查询某条记录
     * @param Request   $request
     * @return string   返回json
     */
    public function  getDeclareOrderDetail(Request $request)
    {
        //判断ID是否提交
        $input=$request->all();
        if(!array_key_exists('id', $input)|| !is_numeric($input['id'])
            ||!array_key_exists('is_delete', $input)|| !is_numeric($input['is_delete'])
            ) {
            return  response()->json(get_api_exception_response("参数错误"));
        }
        //呼叫M层进行处理
        $response=get_api_response('200');
        $result = $this->mbh_declare_order->getDeclareOrderDetail($input);

        if($result=='9514'){
            return response()->json(get_api_response(9514));
        }else{
            $response['results']=$result;
        }
        return  response()->json($response);
    }

    /**
     * 委外报工单分页列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndexNew(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getPageListNew($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    public function export(Request $request)
    {
        //防止超时
        set_time_limit(0);
        ini_set('memory_limit','1024M');
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->exportData($input);
        dd(123);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
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
        $response['results']=$this->model->show($id);
        return  response()->json($response);
    }

    /**
     * @message  推送报工单
     *
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     */
    public function pushWorkDeclareOrder(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //yu.peng 8.20 推送报工单时多报工单处理
        $rwdo_row  =  DB::table('ruis_work_declare_order')->select('type','production_order_id','operation_order_code','picking_line_id')->where('id', $input['id'])->first();
        if($rwdo_row->type == 1)//委外工单
        {
            //获取一条工序里包含的所有待报工订单
            /*$rwdo_rows =  DB::table('ruis_work_declare_order')
                ->select('id')
                ->where(['type'=>1,'production_order_id'=>$rwdo_row->production_order_id,'operation_order_code'=>$rwdo_row->operation_order_code,'status'=>1])
                ->get();*/
            $rwdo_rows = $this->model->getDeclareByPr1($rwdo_row->picking_line_id);
            //查看是否一条工序对应多条工单
            if(count($rwdo_rows)>1)
            {
                foreach ($rwdo_rows as $rk=>$rv)
                {
                    if($rv->status == 1)
                    {
                        $response = $this->model->pushWorkDeclareOrder($rv->id);
                        //推送成功，批量修改状态
                        if ($response['RETURNCODE'] == 0)
                        {
                            // 如果推送成功，状态为2
                            $this->model->updateStatus($rv->id, 2);
                        }

                        if ($response['RETURNCODE'] == 1)
                        {
                            #TODO 处理推送wms数据
                           // $this->model->dealWmsData([$input['id']],4);
                            TEPA($response['RETURNINFO']);
                        }
                        if ($response['RETURNCODE'] == 2)
                        {
                            #TODO 处理推送wms数据
                            //$this->model->dealWmsData([$input['id']],4);
                            $this->model->updateStatus($rv->id, 3);
                            TEPA($response['RETURNINFO']);
                        }

                        if ($response['RETURNCODE'] == 3)
                        {
                            #TODO 处理推送wms数据
                            //$this->model->dealWmsData([$input['id']],4);
                            $this->model->updateStatus($rv->id, 4);
                            TEPA($response['RETURNINFO']);
                        }
                    }
                }

            }
            else
            {
                $response = $this->model->pushWorkDeclareOrder($input['id']);
                if ($response['RETURNCODE'] == 0)
                {
                    // 如果推送成功，状态为2
                    $this->model->updateStatus($input['id'], 2);
                }

                if ($response['RETURNCODE'] == 2)
                {
                    $this->model->updateStatus($input['id'], 3);
                    TEPA($response['RETURNINFO']);
                }

                if ($response['RETURNCODE'] == 3)
                {
                    $this->model->updateStatus($input['id'], 4);
                    TEPA($response['RETURNINFO']);
                }
            }
        }
        else
        {
            $is_lock = Redis::setnx('WDO_LOCK'.$input['id'],1); //设置锁
            if($is_lock == 0){
                TEPA('正在推送中，请稍后！');
            }else{
                Redis::expire('WDO_LOCK'.$input['id'], 30); //添加锁的过期时间 有重复推送SAP情况,修改锁的过期时间

                $response = $this->model->pushWorkDeclareOrder($input['id']);
                if ($response['RETURNCODE'] == 0)
                {
                    // 如果推送成功，状态为2
                    $this->model->updateStatus($input['id'], 2);
                    //释放锁
                    Redis::del('WDO_LOCK'.$input['id']);
                }

                if ($response['RETURNCODE'] == 2)
                {
                    $this->model->updateStatus($input['id'], 3);
                    //释放锁
                    Redis::del('WDO_LOCK'.$input['id']);
                    TEPA($response['RETURNINFO']);
                }

                if ($response['RETURNCODE'] == 3)
                {
                    $this->model->updateStatus($input['id'], 4);
                    //释放锁
                    Redis::del('WDO_LOCK'.$input['id']);
                    TEPA($response['RETURNINFO']);
                }
            }
        }
        #处理推送wms数据
        //$this->model->dealWmsData([$input['id']],4);
        return response()->json(get_success_api_response($response));
    }

    /**
     * @message  批量推送报工单
     *
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     */
    public function batchPushWorkDeclareOrder(Request $request)
    {
        $input = $request->all();
        $ids  = $input['ids'];
        if (!is_array($ids)   ||   count($ids)<1) TEA('703','ids');
        $wms_ids = [];//需要推送的wms的数据
        $responses=[];//定义一个空数组
        foreach ($ids as  $id)
        {
            $is_lock = Redis::setnx('WDO_LOCK'.$id,1); //设置锁
            if($is_lock == 0){
                continue;
            }else {
                Redis::expire('WDO_LOCK'.$id, 30); //添加锁的过期时间 有重复推送SAP情况,修改锁的过期时间

                $response = $this->batchmodel->ready($id);
                $responses[] = $response;
                if (isset($response)) {
                    // 此处暂时禁用，开发完成后解除禁用
                    if (!empty($response['sap'])) {
                        if ($response['sap']['RETURNCODE'] === 0) {
                            $wms_ids[] = $id;
                            // 如果推送成功，状态为2
                            $this->model->updateStatus($id, 2);
                        }
                        if ($response['sap']['RETURNCODE'] === 2) {
                            $this->model->updateStatus($id, 3);
                            //TEPA($response['sap']['RETURNINFO']);
                        }
                        if ($response['sap']['RETURNCODE'] === 3) {
                            $this->model->updateStatus($id, 4);
                            //TEPA($response['RETURNINFO']);
                        }
                    }
                }
                //释放锁
                Redis::del('WDO_LOCK'.$id);
            }
        }
        //处理推送wms数据
        //$this->model->dealWmsData($wms_ids);

        return response()->json(get_success_api_response($responses));
    }


    /**
     * @message 生成单子
     * @author  liming
     * @time    年 月 日
     */
      public  function   capacityFill(Request $request)
      {
        $input = $request->all();
        // 推送成功之后  生成各种领料、补料、退料单子
        $response['insert_id'] = $this->model->capacityFill($input['id']);
        return response()->json(get_success_api_response($response));
      }


    /**
     * 报工单删单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function destroy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //正在报工中的报工单无法删除
        if(Redis::get('WDO_LOCK'.$id) == 1)
        {
            TEPA('当前工单推送中，无法删除');
        }
        //添加删除或撤单理由
        $qc_judge_result=$request->input('qc_judge_result');
        if(isset($qc_judge_result) && $qc_judge_result!='') {
            if(empty($request->input('employee_id'))) TEA('703','employee_id');
            $this->model->toexamineJudgeReason($id,$qc_judge_result,$request->input('employee_id'));
        }
        //呼叫M层进行处理
        $this->model->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);
    }


    /**
     * 报工单撤单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function recall(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //添加删除或撤单理由
        $qc_judge_result=$request->input('qc_judge_result');
        if(isset($qc_judge_result) && $qc_judge_result!='') {
            if(empty($request->input('employee_id'))) TEA('703','employee_id');
            $this->model->toexamineJudgeReason($id,$qc_judge_result,$request->input('employee_id'));
        }
        //成套报工
        $this->model->judgeCompleteSet($id);
        //呼叫M层进行处理
        $this->model->recallPush($id);
        $response=get_api_response('200');
        $response['results']=$id;
        return  response()->json($response);
    }


    /**
   * @message
   * @author  liming
   * @time    年 月 日
   */
    public  function   storageInstore(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->storageInstore($id);
        return  response()->json($response);
    }

  /**
   * @message
   * @author  liming
   * @time    年 月 日
   */
    public  function   getDeclareByPr(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->getDeclareByPr($id);
        return  response()->json($response);
    }

    /**
     * @message
     * @author  kevin
     */
    public function checkHasOverDeclare(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->checkHasOverDeclare($id);
        return  response()->json($response);
    }

    /**
     * 清单合并报工
     * author: szh
     * Date: 2019/7/10/010
     * Time: 15:35
     */
    public function inventoryStoreMore(Request $request)
    {
        $input = $request->all();
        if(empty($input['moreItems'])) TEA('700');
        $moreItems = json_decode($input['moreItems'],true);
        if (count($moreItems) >0 )
        {
            $resp  = [];
            $response=get_api_response('200');
            DB::connection()->beginTransaction();
            foreach ($moreItems as  $item)
            {
                $result= $this->model->inventoryStore($item);
                if(isset($result['message'])){
                    DB::connection()->rollBack();
                    return  response()->json($response);
                    break;
                }
                $response['results'][]=$result;
            }
            DB::connection()->commit();
        }
        return  response()->json($response);
    }

    /**
     *  报工超投数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function toexamineList(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $result = $this->model->toexamineList($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($result, $paging));
    }

    /**
     * 审核反审核
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function toexamineJudge(Request $request)
    {
        $input=$request->all();
        if(empty($input['declare_order_code'])) TEA('703','declare_order_code');
        //呼叫M层进行处理
        $this->model->toexamineJudge($input);
        $response=get_api_response('200');
        return  response()->json($response);
    }

    /**
     * 获取该工单对应的车间下所有责任人  hao.li
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
     public function getWorkShopEmployee(Request $request){
         $input=$request->all();
         if(empty($input['workshop_id'])){
            $response=get_api_response('200');
            $response['results']='';
         }else{
             $obj_list=$this->model->getWorkShopEmployee($input);
             $response=get_api_response('200');
             $response['results']=$obj_list;
         }
         return response()->json($response);
     }

    /**
     *  报工前检测前道工序是否报工
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiParamException
     */
     public function checkDeclareOrder(Request $request)
     {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkDeclareOrder($input);
        return response()->json(get_success_api_response('200'));
     }

    /**
     * 预报工
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
     public function preStore(Request $request)
     {
         $input = $request->all();
//         $is_lock = Redis::setnx($input['work_order_id'].'_pre_wdo',1); //设置锁
//         if($is_lock == 1) {
//             Redis::expire($input['work_order_id'].'_pre_wdo', 60); //添加锁的过期时间
             $result= $this->model->preStore($input);
             //释放锁
//             Redis::del($input['work_order_id'].'_pre_wdo');
//         }
//         else
//         {
//             TEPA('当前预报工单正在保存中，请稍后');
//             // 防止死锁
//             if(Redis::ttl($input['work_order_id'].'_pre_wdo') == -1)//以秒为单位，返回key的过期时间
//             {
//                 Redis::del($input['work_order_id'].'_pre_wdo'); //超时释放锁
//             }
//         }
         $response=get_api_response('200');
         $response['results']=$result;
         return  response()->json($response);
     }

    /**
     * 通过进料从iqc获取预报工的供应商
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function getSupplierByIqc(Request $request)
     {
         $input = $request->all();
         $results = $this->model->getSupplierByIqc($input);
         $response=get_api_response('200');
         $response['results']=$results;
         return  response()->json($response);
     }

    /**
     *
     * 获取预报工最新的数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function getPreWorkDeclare(Request $request)
     {
         $input = $request->all();
         $results = $this->model->getPreWorkDeclare($input);
         $response=get_api_response('200');
         $response['results']=$results;
         return  response()->json($response);
     }
}