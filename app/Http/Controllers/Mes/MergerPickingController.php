<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2019/2/25 10:53
 * Desc:
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\MergerPicking;
use Illuminate\Http\Request;

class MergerPickingController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new MergerPicking();
    }

    /**
     * 领料之前先判断是否能领
     *
     * 进行如下判断
     * 1.是否同属一个车间
     * 2.是否已进行普通的SAP领料
     * 3.仓储地点是否存在
     * 4.工单参与合并 都需发料
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function checkPicking(Request $request)
    {
        $input = $request->all();
        $workOrderIDs = explode(',', $input['work_order_ids']);
        $this->model->checkInOneWorkShop($workOrderIDs);
        $this->model->checkHasDepot($workOrderIDs);
//        $this->model->checkHasSendMaterial($workOrderIDs);
        return response()->json(get_success_api_response(200));
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function getStoreData(Request $request)
    {
        $input = $request->all();
        $workOrderIDs = explode(',', $input['work_order_ids']);
        $this->model->checkInOneWorkShop($workOrderIDs);
        $this->model->checkHasDepot($workOrderIDs);
        $response = $this->model->getStoreData($workOrderIDs);
        return response()->json(get_success_api_response($response));
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function store(Request $request)
    {
        $input = $request->all();
        $this->model->checkStoreParams($input);
        $workOrderIDs = explode(',', $input['work_order_ids']);
        $this->model->checkInOneWorkShop($workOrderIDs);
        $this->model->checkHasDepot($workOrderIDs);
        $response = $this->model->store($input);
        return response()->json(get_success_api_response($response));

    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function PageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->pageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    public function show(Request $request)
    {

    }

}