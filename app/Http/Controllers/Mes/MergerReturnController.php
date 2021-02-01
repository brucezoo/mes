<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2019/3/19
 * Time: 4:48 PM
 */

namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\MergerReturn;
use App\Http\Models\MergerReturnMaterial;
use Illuminate\Http\Request;

/**
 * 合并退料 控制器
 * Class MergerReturnController
 * @package App\Http\Controllers\Mes
 * @author Bruce.Chu
 */
class MergerReturnController extends Controller
{
    protected  $merger_model;

    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new MergerReturn();
        !$this->merger_model && $this->merger_model = new MergerReturnMaterial();
    }

    /**
     * 验证是否允许创建SAP退料单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $workOrderIDs = explode(',', $input['work_order_ids']);
        $this->model->checkReturnMaterial($workOrderIDs);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 获取 创建SAP合并退料单数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
//    public function getCreateReturnMaterial(Request $request)
//    {
//        $return_info = $request->input('return_info');
//        trim_strings($input);
//        if (empty($return_info)) TEA('700', 'return_info');
//        $response = $this->model->getCreateMergeReturnMaterial($return_info);
//        return response()->json(get_success_api_response($response));
//    }

    /**
     * SAP合并退料工单列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * author kevin
     */
    public function getWorkOrdersMaterialList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->merger_model->getWorkOrdersMaterialList($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * author kevin
     * 获取SAP合并退料单数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMergerReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        if (empty($input['work_order_material_ids'])) TEA('700', 'work_order_material_ids');
        $array_ids = json_decode($input['work_order_material_ids'],true);

        //区分工单退料和通用物料退料
        if(isset($input['return_common_material']) && $input['return_common_material'] == 1){
            $this->merger_model->checkCommonMaterial($array_ids);
            $this->merger_model->checkCommonHasDepot($array_ids);
            $this->merger_model->checkHasNotFinishCommonMr($array_ids);
        }else{
            $this->merger_model->checkInOneWorkShop($array_ids);
            $this->merger_model->checkHasDepot($array_ids);
            $this->merger_model->checkHasNotFinishMr($array_ids);
            $this->merger_model->checkHasVirtualDepot($array_ids);
        }
        $response = $this->merger_model->getMergerReturnMaterial($input);

        return response()->json(get_success_api_response($response));
    }

    /**
     * 创建SAP合并退料单数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeMergerReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['work_order_material_ids'])) TEA('700', 'work_order_material_ids');
        $array_ids = json_decode($input['work_order_material_ids'],true);

//        $input['work_order_material_ids'] = json_encode([['work_order_id' => '','wo_number' => '','inve_id' =>1427,'material_id' => '71459']]);
//        $array_ids = [['work_order_id' => '','wo_number' => '','inve_id' =>1427,'material_id' => '71459']];
//        $input['return_common_material'] = 1;
//        $input['employee_id'] = 23;
        //区分工单退料和通用物料退料
        if(isset($input['return_common_material']) && $input['return_common_material'] == 1){
            $this->merger_model->checkCommonMaterial($array_ids);
            $this->merger_model->checkCommonHasDepot($array_ids);
            $this->merger_model->checkHasNotFinishCommonMr($array_ids);
        }else{
            $this->merger_model->checkInOneWorkShop($array_ids);
            $this->merger_model->checkHasDepot($array_ids);
            $this->merger_model->checkHasNotFinishMr($array_ids);
        }
        $response = $this->merger_model->storeMergerReturnMaterial($input);

        return response()->json(get_success_api_response($response));

    }

    /**
     * 合并退料单列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->merger_model->pageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));

    }

    /**
     * 合并退料批量推送  shuaijie.feng  6.15/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function BatchSending(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->merger_model->BatchSending($input);
        return response()->json(get_success_api_response($response));
    }

    // 根据工单搜索合并退料  shuaijie.feng  8.20/2019
    public function pageIndexlist(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->merger_model->pageIndexlist($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($response,$paging));
    }
}