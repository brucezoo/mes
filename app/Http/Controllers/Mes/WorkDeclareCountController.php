<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/9 11:01
 * Desc:
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\WorkDeclareCount;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class WorkDeclareCountController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        empty($this->model) && $this->model = new WorkDeclareCount();
    }


//region 增

    /**
     * 拉取最近七天的工单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pullWorkOrder(Request $request)
    {
        $input = $request->all();
        $pullNumber = $this->model->pullWorkOrder($input);
        return response()->json(get_success_api_response(['pull_number' => $pullNumber]));
    }
//endregion

//region 删
//endregion

//region 改
    /**
     * 更新计数
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateCount(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkParams($input);
        $response = $this->model->updateCount($input);
        return response()->json(get_success_api_response($response));
    }
//endregion

//region 查
    /**
     * 车间看板列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function boardList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->boardList($input);
        return response()->json(get_success_api_response($response));
    }
//endregion

    /**
     * 根据时间查看完成清单
     * author: szh
     * Date: 2019/4/11/011
     * Time: 15:31
     */
    public function getCompletedList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->completedList($input);
        return response()->json(get_success_api_response($response));
    }




    /**
     * 根据时间查看
     * author: szh
     * Date: 2019/4/11/011
     * Time: 15:31
     */
    public function getWorkbenchList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->WorkbenchList($input);
        return response()->json(get_success_api_response($response));
    }


    /**
     * 获取挂件条码清单
     * author: szh
     * Date: 2019/4/19/019
     * Time: 9:58
     */
    public function getShiftList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->shiftList($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * 修改计数条形码数据
     * author: szh
     * Date: 2019/4/19/019
     * Time: 13:53
     */
    public function updateShift(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->updateShiftData($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * 下架
     * author: szh
     * Date: 2019/4/19/019
     * Time: 14:22
     */
    public function shiftOffShelves(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->shiftOffShelves($input);
        return response()->json(get_success_api_response($response));
    }


}