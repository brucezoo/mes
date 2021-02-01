<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 2019/10/10
 * Time: 下午1:53
 */

namespace App\Http\Controllers\Mes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\BatchTrace;

/**
 * 批次追溯接口 控制器
 * @author kevin
 */
class BatchTraceController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new BatchTrace();
    }

    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getBatchTraceList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $response = get_success_api_response($obj_list, $paging);
        return  response()->json($response);
    }

    //正向追溯
    public function forwardTrace(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        if(empty($input['batch'])) TEA('700','batch');
        if(empty($input['material_code'])) TEA('700','material_code');
        //获取数据
        $obj_list=$this->model->getForwardTraceData($input,true,[]);
        //去重
        $obj_list = $this->model->dealObjList($obj_list,'SORT_ASC');
        //获取返回值
        $response = get_success_api_response($obj_list);
        return  response()->json($response);
    }

    //逆向追溯
    public function backTrace(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        if(empty($input['batch'])) TEA('700','batch');
        if(empty($input['material_code'])) TEA('700','material_code');
        //获取数据
        $obj_list=$this->model->getBackTraceData($input,true,[]);
        //去重
        $obj_list = $this->model->dealObjList($obj_list,'SORT_DESC');
        //获取返回值
        $response = get_success_api_response($obj_list);
        return  response()->json($response);
    }

    //序列号追溯
    public function serialNumberTrace(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        if(empty($input['serial_code'])) TEA('700','serial_code');
        //获取数据
        $obj_list=$this->model->serialNumberTrace($input,true,[]);

        //去重
        $obj_list = $this->model->dealObjList($obj_list);
        //获取返回值
        $response = get_success_api_response($obj_list);
        return  response()->json($response);
    }

    //获取工单详情
    public function getWorkorderInfo(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        if(empty($input['work_order_code'])) TEA('700','work_order_code');
        if(empty($input['type'])) TEA('700','type');
        //获取数据
        $obj_list=$this->model->getWorkorderInfo($input);
        //获取返回值
        $response = get_success_api_response($obj_list);
        return  response()->json($response);
    }

    //生成棉泡或成品批次
    public function createBatchCode(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        //if(empty($input['prefix'])) TEA('700','prefix');
        //获取数据
        $obj_list=$this->model->createBatchCode3($input);
        //获取返回值
        $response = get_success_api_response($obj_list);
        return  response()->json($response);
    }

    //获取工单详情
    //获取成品工单详情
    public function getWorkorderInfo2(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        if(empty($input['work_order_code'])) TEA('700','work_order_code');
        //获取数据
        $obj_list=$this->model->getWorkorderInfo2($input);
        //获取返回值
        $response = get_success_api_response($obj_list);
        return  response()->json($response);
    }

    //生成序列号
    public function createBatchCode2(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        //if(empty($input['prefix'])) TEA('700','prefix');
        //获取数据
        //$obj_list=$this->model->createSerialNumber($input);
        $obj_list=$this->model->createBatchCode2($input);
        //获取返回值
        $response = get_success_api_response($obj_list);
        return  response()->json($response);
    }

    //保存数据
    public function saveBatchData2(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        //$this->model->checkBatchParams($input);
        //获取数据
        $res=$this->model->saveBatchData2($input);
        //获取返回值
        $response = get_success_api_response($res);
        return  response()->json($response);
    }

    //保存数据
    public function saveBatchData(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //校验参数
        //$this->model->checkBatchParams($input);
        //获取数据
        $res=$this->model->saveBatchDataNew($input);
        //获取返回值
        $response = get_success_api_response($res);
        return  response()->json($response);
    }

    //通过工作中心和工位获取工单
    public function getMaterialList(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getMaterialList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $response = get_success_api_response($obj_list, $paging);
        return  response()->json($response);
    }

    //工作中心
    public function getWorkCenterList(Request $request)
    {
        $input = $request->all();
        $obj_list = $this->model->getWorkCenterList($input);
        return response()->json(get_success_api_response($obj_list));
    }

    //工位
    public function getWorkBenchList(Request $request)
    {
        $input = $request->all();
        if(empty($input['workcenter_id'])) TEA('700','workcenter_id');
        $obj_list = $this->model->getWorkBenchList($input);
        return response()->json(get_success_api_response($obj_list));
    }

    //获取重量同时自动更新重量
    public function getWeight(Request $request)
    {
        $input = $request->all();
        if(empty($input['material_id'])) TEA('700','material_id');
        if(empty($input['work_order_code'])) TEA('700','work_order_code');
        if(empty($input['workbench_id'])) TEA('700','workbench_id');

        $response = $this->model->getWeight($input);
        return  response()->json(get_success_api_response($response));
    }

    //手动更新重量
    public function updateWeight(Request $request)
    {
        $input = $request->all();
        if(empty($input['material_id'])) TEA('700','material_id');
        if(empty($input['work_order_code'])) TEA('700','work_order_code');
        if(!isset($input['weight'])) TEA('700','weight');

        $this->model->updateWeight($input);
        return response()->json(get_success_api_response('更新成功'));
    }

    public function getLastSelect()
    {
        $response = $this->model->getLastSelect();
        return  response()->json(get_success_api_response($response));
    }

    /**
     * 更新米数
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiParamException
     */
    public function updateLength(Request $request)
    {
        $input = $request->all();
        $this->model->updateLength($input);
        return response()->json(get_success_api_response('更新成功'));
    }

    /**
     * 获取当天棉泡，切割棉等预报工信息
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBatchTraceDeclareList(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getBatchTraceDeclareList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 修改棉泡长度以及重量信息
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiParamException
     */
    public function updateBatchTraceDeclare(Request $request)
    {
        $input = $request->all();
        $this->model->updateBatchTraceDeclare($input);
        return response()->json(get_success_api_response('更新成功'));
    }

    /**
     * 扫码获取复合棉信息
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInfoByFitBarCode(Request $request)
    {
        $input = $request->all();
        //增加统一销售订单产品的校验
        $check = $this->model->checkFitBarCode($input);

        $response = $this->model->getInfoByFitBarCode($input);
        return  response()->json(get_success_api_response($response));
    }

    /**
     * 生成成品序列号(唯一)
     * @return \Illuminate\Http\JsonResponse
     */
    public function createSerialCode(Request $request)
    {
        $input = $request->all();
        $response = $this->model->createSerialCode($input);
        return  response()->json(get_success_api_response($response));
    }

    /**
     * 批次数据明细
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBatchDetailList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getBatchDetailList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
}