<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/5 14:04
 * Desc:
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\MaterialRequisition;
use App\Libraries\Soap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Models\MergerPicking;
use Illuminate\Support\Facades\Redis;

class MaterialRequisitionController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new MaterialRequisition();
    }

//region 检

    /**
     * 检验 领料单 子项 当前可领的数量
     *
     * 可领的数量 = WO里面总的数量 - 已被领取的数量
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkItemNumber(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->checkItemNumber($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     * 验证是否允许退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkReturnMaterial($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 齐料检测(工单是否允许向mes领料)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function checkApplyMes(Request $request)
    {
        $input = $request->all();
//        $json_string = '[{"work_order_id":361,"materials":[{"material_id":60092,"qty":50,"line_depot":"1008","product_depot":""}]},{"work_order_id":362,"materials":[{"material_id":60093,"qty":140,"line_depot":"1008","product_depot":""}]}]';
//        $input['items'] = json_decode($json_string, true);
        trim_strings($input);
        if (empty($input['items'])) TEA('700', 'items');
        $responseArr = [];
        foreach ($input['items'] as $item) {
            $this->model->checkAppLyMesParams($item);
            $is_full = $this->model->checkApplyMes($item);
            $responseArr[] = [
                'work_order_id' => $item['work_order_id'],
                'is_full' => $is_full,
            ];
        }
        return response()->json(get_success_api_response($responseArr));
    }

    /**
     * 验证是否允许生成 车间退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkShopReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkShopReturnMaterial($input);
        return response()->json(get_success_api_response(200));
    }
//endregion

//region 增

    /**
     * 生成领料单 Mes/Sap
     *
     * @todo mes需要验证实时库存
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @since 2018-09-13 lester.you 保存后不再同步，同步这个步骤 单独提出来
     */
    public function store(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        $this->model->checkFormField($input);
        $this->model->getProductOrder($input);
        if ($input['push_type'] == 0) {     // 0:针对MES 需要验证实时库存
//            $this->model->checkStorage($input);
        }
        $idArr = $this->model->store($input);
        // 如果是mes领料，直接入库
        if ($input['push_type'] == 0 && !empty($idArr[0])) {
            $_input[$this->model->apiPrimaryKey] = $idArr[0];
            $this->model->auditing($_input);
        }
        $key = 'syncaddMaterialRequisition'.'$'.$idArr[0];
        $is_lock = Redis::setnx($key,1); //设置锁，以防多次入库
        if($is_lock == 1) {
            Redis::expire($key, 120); //设置自动过期时间，120s，以防代码异常
        //要保存完就要发送给sap
        if($input['push_type'] == 1 && $input['type'] == 1)
        {
            foreach ($idArr as $k=>$v){
                $data = $this->model->getMaterialRequisition($v);
                $resp = Soap::doRequest($data, 'INT_MM002200001', '0002');
                if (!isset($resp['RETURNCODE'])) TEA('2454');
                if ($resp['RETURNCODE'] != 0) {   //如果为退料，则需要回滚
                    TEPA($resp['RETURNINFO']);
                }
                // 推送成功
                $this->model->updateStatus($v, 2);
            }
        }

            Redis::del($key);
        return response()->json(get_success_api_response(['id' => $idArr]));
        }else{
            TEPA('正在处理中，请刷新，稍后再试！');
        }
    }

    /**
     * 生成退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkStoreReturnMaterialParams($input);
        $resp = $this->model->storeReturnMaterial($input);
        return response()->json(get_success_api_response(['ids' => $resp]));
    }

    /**
     * 生成车间领/补料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShop(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkShopParams($input);
        $resp = $this->model->storeWorkShop($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     * 生成车间退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShopReturn(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkStopReturnParams($input);
        $response = $this->model->storeWorkShopReturn($input);
        return response()->json(get_success_api_response($response));

    }
//endregion

//region 删

    /**
     * 删除子项
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function deleteItem(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->deleteItem($input);
        return response()->json(get_success_api_response(['item_id' => $input['item_id']]));
    }

    /**
     * 刪除整個領料單
     * 只允許刪除狀態為1 的訂單
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delete(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $key = 'syncaddMaterialRequisition'.'$'.$input[$this->model->apiPrimaryKey];
        $is_lock = Redis::setnx($key,1); //设置锁，以防多次入库
        if($is_lock == 1) {
            Redis::expire($key, 120); //设置自动过期时间，120s，以防代码异常
        try {
            DB::connection()->beginTransaction();
            $this->model->delete($input);
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            if ($e->getCode()==0)
            {
                Redis::del($key);
                TEPA($e->getMessage());
            }else{
                Redis::del($key);
                TEA($e->getCode(), $e->getMessage());
            }
        }
        DB::connection()->commit();
        Redis::del($key);
        return response()->json(get_success_api_response(['mr_id' => $input[$this->model->apiPrimaryKey]]));
        }else{
            TEPA('正在处理中，请刷新，稍后再试！');
        }
    }

//endregion

//region 改

    /**
     * 更改某一子项
     * 只限修改 需求数量和单位
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateItem(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->updateItem($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 更新实收数量&入库
     * 添加入库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateActualReceiveNumber(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        trim_strings($input);

        $is_lock = Redis::setnx($input['material_requisition_id'],1); //设置锁，以防多次入库
        if($is_lock == 1){
            Redis::expire($input['material_requisition_id'], 360); //设置自动过期时间，360s，以防代码异常
            try {
                DB::connection()->beginTransaction();
                $this->model->updateActualReceiveNumber($input);
                $work_order_ids = $this->model->auditing($input);     //入库
                $this->model->updateWork_picking_status($work_order_ids,[]);
            } catch (\Exception $e) {
                DB::connection()->rollBack();
                Redis::del($input['material_requisition_id']);
                TEA($e->getCode(), $e->getMessage());
            }
            DB::connection()->commit();
            Redis::del($input['material_requisition_id']);
            return response()->json(get_success_api_response(200));
        }else{
            TEPA('正在处理中，请刷新，稍后再试！');
        }
    }

    /**
     * 更新实收数量&入库
     * 批量入库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateActualReceiveNumberBatch(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        $material_requisition_id_arr = explode(',',$input['material_requisition_id_arr']);
        if(empty($material_requisition_id_arr))
        {
            TEA('700', 'material_requisition_id_arr');
        }

        $key = 'updateActualReceiveNumberBatch'.'$'.$input['material_requisition_id_arr'];
        $is_lock = Redis::setnx($key,1); //设置锁，以防多次入库
        if($is_lock == 1){
            Redis::expire($key, 360); //设置自动过期时间，360s，以防代码异常

            //获取领料单信息
            $batch_auditing_arr = $this->model->getRequisionItemBath($material_requisition_id_arr);
            //var_dump(json_encode($batch_auditing_arr));exit;
            try{
                foreach ($batch_auditing_arr as $v)
                {
                    $this->model->updateActualReceiveNumber($v);
                    $work_order_ids = $this->model->auditing($v);     //入库
                    $this->model->updateWork_picking_status($work_order_ids,[]);
                }
                DB::connection()->beginTransaction();

            }catch (\Exception $e){
                DB::connection()->rollBack();
                Redis::del($key);
                TEA($e->getCode(), $e->getMessage());
            }
            DB::connection()->commit();
            Redis::del($key);
            return response()->json(get_success_api_response(200));
        }else{
            TEPA('正在处理中，请刷新，稍后再试！');
        }        
    }

    /**
     * 退料单 出库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function auditing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->auditing($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 领料单核验
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function unAuditing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->unAuditing($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 车间领补退 确认发料、更新实收数量
     * 并 出/入库
     *
     * 1.添加实收数据
     * 2.出入库 并更新状态
     * 3.收集所有物料id，根据其分类，判断是否需要同步给SAP。(如果 1,2,3执行失败回滚，并不执行以下步骤)
     * 4.发送SAP请求。
     * 5.根据4,成功与否， 判断是提交，还是回滚
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function workShopConfirmAndUpdate(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        try {
            DB::connection()->beginTransaction();
            $this->model->workShopConfirmAndUpdate($input);
            $work_order_ids = $this->model->auditing($input);     //入库
            $this->model->updateWork_picking_status($work_order_ids,[]);
            if($input['type'] == 2 && $input['status'] == 3){
                $this->model->updateById($work_order_ids,['picking_status'=>0],config('alias.rwo'));
            }
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }
        //3.判断是否需要发送给SAP,如果为空，就不需要发送。
        $sendData = $this->model->getWorkShopSyncSapData($input);
        // 发料时状态为2 ，所以发料的时候必须给sap传车间领料过去  shuaijie.feng  2019年6月30日00:40:03
        if (!empty($sendData) && ($input['status'] == 2 || $input['status'] == 3)) {
            $resp = Soap::doRequest($sendData, 'INT_MM002200003', '0002');
            if (!isset($resp['RETURNCODE']) || !isset($resp['RETURNINFO'])) {
                DB::connection()->rollBack();
                TEA('2454');
            }
            if ($resp['RETURNCODE'] != 0) {
                DB::connection()->rollBack();
                TEPA($resp['RETURNINFO']);
            }
        }

        //4.如果 3 执行成功，就提交.
        DB::connection()->commit();
        return response()->json(get_success_api_response(200));
    }

    /**
     * 一键批量入库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function workShopConfirmAndUpdateBatch(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        //获取领料单信息
        $material_requisition_id_arr = explode(',',$input['material_requisition_id_arr']);
        if(empty($material_requisition_id_arr))
        {
            TEA('700', 'material_requisition_id_arr');
        }
        if(!isset($input['type']) && empty($input['type']))
        {
            TEA('700', 'type');
        }
        $batch_auditing_arr = $this->model->getRequisionItemBath($material_requisition_id_arr);
        try {
            DB::connection()->beginTransaction();
            foreach ($batch_auditing_arr as &$v)
            {
                $v['status'] = 3;
                $v['type'] = $input['type'];
                $this->model->workShopConfirmAndUpdate($v);
                $this->model->auditing($v);     //入库
            }
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }

        //4.如果 3 执行成功，就提交.
        DB::connection()->commit();
        return response()->json(get_success_api_response(200));
    }

    /**
     * 更新补料原因
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateReason(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkReasonParams($input);
        $this->model->updateReason($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 补料单反审
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function blCounterTrial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->blCounterTrial($input);
        return response()->json(get_success_api_response(200));
    }
//endregion

//region 查

    /**
     * 获取列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->pageindexlist($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * QC质检 领料列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function QCPageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->Qcpageindex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 获取详情
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function show(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->show($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 获取实时库存
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialStorage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->getProductOrder($input);
        $results = $this->model->getMaterialStorage($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 根据 工单code 获取物料和相应批次
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialBatch(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->getMaterialBatch($input);
        return response()->json(get_success_api_response($result));
    }

    /**
     * 获取 创建SAP退料单数据
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getCreateReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkReturnMaterial($input);
        $response = $this->model->getCreateReturnMaterialNew($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * 报工用到的 获取实时库存
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialStorageInPW(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->getMaterialStorageInPW($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * 合并报工用到的查询实时库存
     * author: szh
     * Date: 2019/7/18/018
     * Time: 13:17
     */
    public function getMoreMaterialStorageInPw(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = [];
        $input['item'] = is_json($input['item']) ? json_decode($input['item'],true) : [];
        foreach ($input['item'] as $key => $val) {         
            $result[] = $this->model->getMaterialStorageInPW($val);
        }
        return response()->json(get_success_api_response($result));
    }

    /**
     * 委外合并报工用到的查询实时库存
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMoreMaterialStorageInPwNew(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = [];
        $input['item'] = is_json($input['item']) ? json_decode($input['item'],true) : [];
        foreach ($input['item'] as $key => $val) {
            $result[] = $this->model->getMaterialStorageInPWNew($val);
        }
        return response()->json(get_success_api_response($result));
    }

    /**
     * 获取 车间退料的 可退的库存数量
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getWorkShopReturnStorage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkShopReturnMaterial($input);
        $response = $this->model->getWorkShopReturnStorage($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * SAP领料 查询采购仓库和生产仓库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialDepot(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->getMaterialDepot($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * SAP领料获取相关信息
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getSapPackingInfo(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->getSapPackingInfo($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     * 导出excel
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Laravel\Lumen\Http\Redirector
     * @throws \App\Exceptions\ApiException
     */
    public function exportSupplementaryReason(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->exportSupplementaryReason($input);
        return redirect($resp);
    }

    /**
     * 获取物料的bom单位
     * 仅用于物料领料
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialUnit(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->getMaterialUnit($input);
        return response()->json(get_success_api_response($resp));
    }
//endregion

//region 推送

    /**
     * 同步领料单给SAP
     *
     * 还有状态为1的时候允许推送
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     * @since 2018.11.22 直接推送(不需要出库)
     */
    public function syncMaterialRequisition(Request $request)
    {
        $input = $request->all();
        if (empty($input['id'])) TEA('700', 'id');
        if (empty($input['type'])) TEA('700', 'type');
        // 验证所属工单是否被锁定
        if (!$this->model->checkIsDepotPicking($input['id'])) {
            $this->model->checkWorkOrderLockByMRID($input['id']);
        }

        $key = 'syncaddMaterialRequisition'.'$'.$input['id'];
        $is_lock = Redis::setnx($key,1); //设置锁，以防多次入库
        if($is_lock == 1) {
            Redis::expire($key, 120); //设置自动过期时间，120s，以防代码异常
//        // 1.如果为退料，需要出库
//        if ($input['type'] == 2) {
//            $input[$this->model->apiPrimaryKey] = $input['id'];
//            try {
//                DB::connection()->beginTransaction();
//                $this->model->auditing($input);     //退料出库
//            } catch (\Exception $e) {
//                DB::connection()->rollBack();
//                TEA($e->getCode(), $e->getMessage());
//            }
//        }

        if ($input['type'] == 2) {  // SAP退料
            $data = $this->model->getReturnMaterial($input['id']);
//            $updateStatus = 3;
            $updateStatus = 2;  // 11.23 生成退料后 推送 状态: 1->2
        } else {            // SAP 领、补料
            $is_merger_picking = $this->model->getMrIsMergerPicking($input['id']);
            if($is_merger_picking){
                $data = $this->model->getSapMergerPickingData($input['id']);
            }else{
                $data = $this->model->getMaterialRequisition($input['id']);
            }
            $updateStatus = 2;
        }
        $resp = Soap::doRequest($data, 'INT_MM002200001', '0002');
        if (!isset($resp['RETURNCODE'])) {
//            if ($input['type'] == 2) {     //如果为退料，则需要回滚
//                DB::connection()->rollBack();
//            }
            Redis::del($key);
            TEA('2454');
        }
        if ($resp['RETURNCODE'] != 0) {   //如果为退料，则需要回滚
//            if ($input['type'] == 2) {
//                DB::connection()->rollBack();
//            }
            Redis::del($key);
            TEPA($resp['RETURNINFO']);
        }

//        //如果为退料，成功需要提交
//        if ($input['type'] == 2) {
//            DB::connection()->commit();
//        }

        // 推送成功
        $this->model->updateStatus($input['id'], $updateStatus);
        /**
         * @todo 自动发料&入库
         */
//        try {
//            DB::connection()->beginTransaction();
//            if (!$this->model->checkIsDepotPicking($input['id'])) {
//                $tempInput[$this->model->apiPrimaryKey] = $input['id'];
//                $this->model->autoInsert($tempInput);
//            }
//        } catch (\Exception $e) {
//            DB::connection()->rollBack();
//            TEA($e->getCode(), $e->getMessage());
//        }
//        DB::connection()->commit();
            Redis::del($key);
        return response()->json(get_success_api_response($resp));
        }else{
            TEPA('正在处理中，请刷新，稍后再试！');
        }
    }


    /**
     * sap  同步委外领料单结果
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     * @author  liming
     */
    public function syncPickingResult(Request $request)
    {
        $input = $request->all();
        $response = $this->model->syncPickingResult($input);
        return response()->json(get_success_sap_response($input, $response));
    }


    /**
     * sap  同步车间领料单结果
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     * @author  liming
     */
    public function syncShopResult(Request $request)
    {
        $input = $request->all();
//        $json_str = '[{"LLDH":"MER120190227140406907","LLHH":"00001","LLLX":"ZY01","ITEMS":[{"SQNM":"00001","MATNR":"000000605300000024","BATCH":"","MATQTY":700,"MEINS":"PC"}]}]';
//        $input['DATA'] = json_decode($json_str, true);

        //$json_str='{"CONTROL":{"SERVICEID":"INT_MM000200012","SRVGUID":"005056B539851EE990A8AB2A55208A90","SRVTIMESTAMP":20190308015611,"SOURCESYSID":"0002","TARGETSYSID":"0022"},"DATA":[{"LLDH":"MER22019041910450874","LLHH":"0000200001","LLLX":"ZY02","ITEMS":[{"SQNM":"00001","MATNR":"000000300201000015","BATCH":"1","MATQTY":284.6,"MEINS":"KG"}]}]}';
//        $json_str='{"CONTROL":{"SERVICEID":"INT_MM000200012","SRVGUID":"005056B539851EE990A8AB2A55208A90","SRVTIMESTAMP":20190308015611,"SOURCESYSID":"0002","TARGETSYSID":"0022"},"DATA":
//        [
//    {
//        "LLDH": "MER22019042014112372",
//        "LLHH": "0000300003",
//        "LLLX": "ZY02",
//        "ITEMS": [
//            {
//                "SQNM": "00001",
//                "MATNR": "000000601900000004",
//                "BATCH": "",
//                "MATQTY": 0.1,
//                "MEINS": "KG"
//            }
//        ]
//    }
//]
//}';
//        $input= json_decode($json_str, true);
//        return $response = $this->model->syncShopResult($input);

        try {
            DB::connection()->beginTransaction();
            $response = $this->model->syncShopResult($input);
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TESAP($e->getCode(), $e->getMessage());
        }
        DB::connection()->commit();
        return response()->json(get_success_sap_response($input, $response));
    }

    /**
     *  删除sap领料单单个行项   shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function sapdelete(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->sapdelete($input);
        return response()->json(get_success_api_response(['item_id' => $input['item_id']]));
    }

    /**
     *  获取 车间领料内容 shuaijie.feng 2019-4.17
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialWorkshop(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->getProductOrder($input);
        $results = $this->model->getMaterialWorkshop($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 按单领料合并打印  shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBatchprinting(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->getBatchprinting($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 需求 车间退料更改状态 shuaijie.feng 5.28/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function  RetreatChangestats(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->RetreatChangestats($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     *  删除退料单某行向 shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function DeleteRetreatRowitem(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->DeleteRetreatRowitem($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     *  按单领料一键删除未发料行项 shuaijie.feng 8.22/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function DeleteRetreatRow(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->DeleteRetreatRow($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 车间领料获取相关信息  shuaijie.feng 8.26/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getShopPackingInfo(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->getShopPackingInfo($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     *  领料单导出
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getListexport(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->getListexport($input);
        return response()->json(get_success_api_response('200'));
    }
//endregion

/**
     * 齐料检
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     * @author  hao.li
     */
     public function checkMaterial(Request $request){
         $input=$request->all();
         $data=json_decode($input['data']);
         $flag=$this->model->checkMaterial($data);
         return response()->json(get_success_api_response($flag));
     }

    /**
     * 工单对应其他补料单列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function blList(Request $request)
    {
        $input = $request->all();
        if (empty($input['work_order_code'])) TEA('700', 'work_order_code');
        trim_strings($input);
        $resp = $this->model->getblList($input);
        return response()->json(get_success_api_response($resp));
    }

    public function getOtherMergerByWorkOrder(Request $request)
    {
        $input = $request->all();
        if (empty($input['work_order_code'])) TEA('700', 'work_order_code');
        trim_strings($input);
        $resp = $this->model->getOtherMergerByWorkOrder($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     * 各单位补料比例报表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function blListReport(Request $request)
    {
        $input = $request->all();
        if (empty($input['type'])) TEA('700', 'type');
        trim_strings($input);
        $resp = $this->model->blListReport($input);
        return response()->json(get_success_api_response($resp));
    }

    public function exportBlListReport(Request $request)
    {
        $input = $request->all();
        if (empty($input['type'])) TEA('700', 'type');
        trim_strings($input);
        $resp = $this->model->blListReport($input);


        //处理数据
        $bl_number = $resp['bl_number'];
        $bl_date = $resp['bl_date'];

        //设置excel表头

        $objPHPExcel = new \PHPExcel();
        $objPHPExcel->getProperties()->setTitle('export')->setDescription('补料报表');

        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getActiveSheet()->setTitle('补料报表');

        //添加表头
        //配合SAP调整导出格式
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,1, "补料单位");
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,2, "补料次数");
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,3, "操作失误");
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,5, "问题");
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,6, "数量");
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,7, "百分比");
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,8, "累计百分比");

        if(count($bl_number)>0)
        {
            foreach ($bl_number as $key => $value)
            {
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($key+1,1, $value->name);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($key+1,2, $value->num);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($key+1,3, $value->sw_num);
            }
        }
        if(count($bl_date)>0)
        {
            foreach ($bl_date as $key => $value)
            {
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($key+1,5, $value->name);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($key+1,6, $value->num);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($key+1,7, $value->percentage);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow($key+1,8, $value->all_percentage);
            }
        }
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getActiveSheet()->getstyle('B7')->getNumberFormat()->setFormatCode(\PHPExcel_Style_NumberFormat::FORMAT_PERCENTAGE_00);
        $objPHPExcel->getActiveSheet()->duplicatestyle($objPHPExcel->getActiveSheet()->getstyle('B7'), 'B7:Q10' );
        $objPHPExcel->getActiveSheet()->duplicatestyle($objPHPExcel->getActiveSheet()->getstyle('B7'), 'B7:Q10' );
        set_time_limit(0);
        header('Content-Type: application/vnd.ms-excel');
        header('Cache-Control:max-age=0');
        ob_end_clean();//清除缓冲区,避免乱码
        $objWrite = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel2007');
        //Sending headers to force the user to download the file
        header('Content-Type:application/vnd.ms-excel');
        $file_name = '';
        if($input['type'] == 1)
        {
            $file_name = '生产补料线边仓';
        }
        elseif ($input['type'] == 2)
        {
            $file_name = '生产补料sap';
        }
        elseif ($input['type'] == 3)
        {
            $file_name = '生产补料车间';
        }
        elseif ($input['type'] == 4)
        {
            $file_name = '委外sap补料';
        }
        elseif ($input['type'] == 5)
        {
            $file_name = '委外车间补料';
        }
        header('Content-Disposition:attachment;filename="'.$file_name.'报表 ' .$input['start_time'] .'~'.$input['end_time']. '.xlsx"');

        header('Cache-Control:max-age=0');

        $objWrite->save('php://output');exit;
    }


    public function updateResonToQcreson(Request $request)
    {
        $input = $request->all();
        if (empty($input['type'])) TEA('700', 'type');
        trim_strings($input);
        $this->model->updateResonToQcreson($input);
        return response()->json(get_success_api_response([]));
    }

    /**
     * 批量发料列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiParamException
     */
    public function batchShopdeliverylist(Request $request){
        $input = $request->all();
        trim_strings($input);
        $response  = $this->model->batchShopdeliverylist($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * 批量发料
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function batchShopdelivery(Request $request){
        $input = $request->all();
        trim_strings($input);
        $batch_auditing_res = $this->model->getRequisionItem($input);
        foreach ($batch_auditing_res as $key=>$value) {
            try {
                DB::connection()->beginTransaction();
                $this->model->workShopConfirmAndUpdate($value);
                $work_order_ids = $this->model->auditing($value);     //入库
                $this->model->updateWork_picking_status($work_order_ids, []);
                if ($value['type'] == 2 && $value['status'] == 3) {
                    $this->model->updateById($work_order_ids, ['picking_status' => 0], config('alias.rwo'));
                }
            } catch (\ApiException $e) {
                DB::connection()->rollBack();
                TEA($e->getCode(), $e->getMessage());
            }
            //3.判断是否需要发送给SAP,如果为空，就不需要发送。
            $sendData = $this->model->getWorkShopSyncSapData($value);
            if (!empty($sendData) && $value['status'] == 2) {
                $resp = Soap::doRequest($sendData, 'INT_MM002200003', '0002');
                if (!isset($resp['RETURNCODE']) || !isset($resp['RETURNINFO'])) {
                    DB::connection()->rollBack();
                    TEA('2454');
                }
                if ($resp['RETURNCODE'] != 0) {
                    DB::connection()->rollBack();
                    TEPA($resp['RETURNINFO']);
                }
            }
            //4.如果 3 执行成功，就提交.
            DB::connection()->commit();
        }
        return response()->json(get_success_api_response(200));
    }

    //
    public function updateWork_picking_status(Request $request){
        $input = $request->all();
        trim_strings($input);
        $response  = $this->model->updateWork_picking_status($input['work_order_id'],[]);
        return response()->json(get_success_api_response($response));
    }



}