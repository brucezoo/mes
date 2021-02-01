<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/15 2:26
 * Desc:
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\MaterialCombine;
use App\Http\Models\MaterialRequisition;
use App\Jobs\MRInbound;
use App\Libraries\Soap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaterialCombineController extends Controller
{
    protected $model;
    public function __construct()
    {
        parent::__construct();
        empty($this->model) && $this->model = new MaterialCombine();
    }
//region Add

    /**
     * 获取保存页面的数据
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function showCreateData(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->showCreateData($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 保存
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function store(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkStoreParams($input);
        try {
            DB::connection()->beginTransaction();
            $this->model->store($input);
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }
        DB::connection()->commit();

        return response()->json(get_success_api_response(200));
    }
//endregion

//region Delete

    /**
     * 撤回领料单
     * 注：只允许status 为1 的时候撤回
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function cancel(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->cancel($input);
        return response()->json(get_success_api_response(200));
    }
//endregion

//region Update
    /**
     * 批量入库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function BatchInbound(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $respArr = $this->model->getBatchInBound($input);
        foreach ($respArr as $id) {
            $temp['material_requisition_id'] = $id;
            $temp['is_last'] = 0;   //是否为最后一次入库
            $job = (new MRInbound($temp))->onQueue('inbound');
            $this->dispatch($job);
        }
        //最后一次入库，将合并领料单 状态更改为4
        $temp['material_requisition_id'] = $input['material_combine_id'];
        $temp['is_last'] = 1;
        $job = (new MRInbound($temp))->onQueue('inbound');
        $this->dispatch($job);
        return response()->json(get_success_api_response(200));
    }
//endregion

//region Select
    /**
     * 列表页
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->pageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 详情
     *
     * @param Request $request
     * @throws \App\Exceptions\ApiException
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->show($input);
        return response()->json(get_success_api_response($resp));
    }
//endregion

//region Other
    /**
     * 推送给SAP
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function sync(Request $request)
    {
        /**
         * 1.推送
         * 2.插入批次
         * 3.把入库操作加入队列
         */
        $input = $request->all();
        trim_strings($input);
        $data = $this->model->getPushData($input);
        $resp = Soap::doRequest($data, 'INT_MM002200001', '0002');
//        $resp['RETURNCODE'] = 0;
        if (!isset($resp['RETURNCODE'])) {
            TEA('2454');
        }
        if ($resp['RETURNCODE'] != 0) {
            TEPA($resp['RETURNINFO']);
        }
        //更新合并领料单(MC)和领料单(MR)的状态为已推送
        $this->model->updateStatus($input, 2);

        //2.插入批次 & 3.自动入库
        $MRIDArr = $this->model->getMRID($input['mc_id']);
        $MRModel = new MaterialRequisition();
        foreach ($MRIDArr as $MRID) {
            // 插入批次
            $tempInput['material_requisition_id'] = $MRID;
            $MRModel->autoInsert($tempInput,false);
            // 自动入库 进队列
            $tempInput['is_last'] = 0;   //是否为最后一次入库
            $job = (new MRInbound($tempInput))->onQueue('inbound');
            $this->dispatch($job);
        }
        //更新 合并领料单状态为5 队列正在执行中
        $this->model->updateStatus($input, 5);

        //领料单都入库之后，在队列后面加个更新合并领料单的消息，用于更新合并领料单的状态。
        $temp['material_requisition_id'] = $input['mc_id'];
        $temp['is_last'] = 1;
        $job = (new MRInbound($temp))->onQueue('inbound');
        $this->dispatch($job);

        return response()->json(get_success_api_response($resp));
    }
//endregion

}