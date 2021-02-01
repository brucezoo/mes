<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年11月8日
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\OutWorkOrder;//
use App\Http\Models\OutMachineShop;

class OutWorkController extends Controller{

    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model =new OutWorkOrder();
      if(empty($this->machineShopModel)) $this->machineShopModel =new OutMachineShop();
    }

    /**
     * 获取列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  pageIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] = $obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 查看某条入库单信息
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  liming
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

         // 获取单个单信息
        $obj_list=$this->model->getOneOrder($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
     * @message 查找该委外单的委外工单的进出料
     * @author  liming
     * @time    年 月 日
     */    
    public  function  getFlowItems(Request $request)
    {
         //判断ID是否提交
         $id=$request->input('id');
         if(empty($id)|| !is_numeric($id)) TEA('703','id');

         // 获取单个入库单信息
         $obj_list=$this->model->getFlowItems($id);
         # 获取全部入库单信息
         //$obj_list = $this->model->getFlowItemsAll($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    /**
     * 委外待报工详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getOutWorkInfo(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

        // 获取单个入库单信息
        $obj_list=$this->model->getOptimizationFlowItems($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    public function getFlowItemsNew(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

        // 获取单个入库单信息
        $obj_list=$this->model->getFlowItems($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    public  function  getMoreFlowItems(Request $request)
    {
        //判断ID是否提交
        $input = $request->all();
        if(empty($input['picking_ids'])) TEA('700','picking_ids');
        $picking_ids = explode(',',$input['picking_ids']);
        $lineIds = $this->machineShopModel->getPickLineIds($picking_ids);
        if(empty($lineIds)) TEA('700','picking_line_id');

        // 获取单个入库单信息
        $result = [];
        foreach($lineIds as $key => $val) {
            $obj_list=$this->model->getFlowItems($val);
            $result[] = $obj_list;
        }
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$result;
        return  response()->json($response);
    }

    /**
     * 合并报工工单列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function moreShow(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        $input = $request->all();
        $work_order_ids = $this->model->getWorkOrderId($input['ids']);
        //$work_order_ids  = explode(',',$input['work_order_id']);
        if(empty($work_order_ids)) TEA('700','work_order_id');
        $result = [];
        foreach($work_order_ids as $key => $val) {
//            $input['work_order_id'] = $val['work_order_id'];
//            $input['picking_id'] = $val['picking_id'];
//            $input['picking_line_id'] = $val['picking_line_id'];
            //$result[] = $this->model->get($input);
            $result[$key] = $this->model->getOptimizationFlowItems($val['picking_line_id']);
            $result[$key]->wo_number = $val['wo_number'];
            $result[$key]->po_number = $val['po_number'];
            $result[$key]->production_order_id = $val['production_order_id'];
            $result[$key]->picking_line_id = $val['picking_line_id'];

        }
        return response()->json(get_success_api_response($result));
    }

    /**
     * 委外工单替换料
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function deleteSubOrderInMaterial(Request $request)
    {
        $input = $request->all();
        if(empty($input['subcontract_order_item_id'])) TEA('700','subcontract_order_item_id');
        $obj = $this->model->deleteSubOrderInMaterial($input);
        return response()->json(get_success_api_response($obj));
    }

    public function insertSubOrderInMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        if(empty($input['material_code']) || empty($input['qty']) || empty($input['commercial'])) TEA('700','material_code or qty or commercial');
        if(empty($input['subcontract_order_id'])) TEA('700','subcontract_order_id');
        $json = $this->model->insertSubOrderInMaterial($input);
        return response()->json(get_success_api_response($json));

    }

    /**
     *  委外跨工序报工提示
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function checkOutwork(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        // 区分报工情况，1.按单 2.合并
        if($input['type'] == 1){
            $this->model->checkOutwork($input);
        }else{
            $work_order_ids = $this->model->getWorkOrderId($input['ids']);
            foreach($work_order_ids as $key => $val) {
                $input['picking_ids'][] = $val['picking_id'];
            }
            foreach($work_order_ids as $key => $val) {
                $input['id'] = $val['picking_line_id'];
                $this->model->checkOutwork($input);
            }
        }
        return response()->json(get_success_api_response('200'));
    }

    /**
     * 委外车间领补料接口
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getOutWorkPickingInfo(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

        // 获取单个入库单信息
        $obj_list=$this->model->getOutWorkShop($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }
}