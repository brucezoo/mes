<?php
/**
 * Created by PhpStorm.
 * User: shuaijie.feng
 * Date: 2019/5/16
 * Time: 15:51
 */
namespace App\Http\Controllers\Mes;

use App\Http\Controllers\Controller;
use App\Http\Models\Tool;
use App\Libraries\Soap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ToolController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Tool();
    }
    // 上传文件,导入数据
    public function uploadFile(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $resp = $this->model->saveCheck($input);
        return response()->json(get_success_api_response($resp));
    }

    //数据列表
    public function pageIndex(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        // 获取数据
        $obj_list = $this->model->lists($input);
        //获取返回值
        $paging = $this->getPagingResponse($input);
        $response = get_success_api_response($obj_list, $paging);
        return response()->json($response);
    }

    //数据删除
    public function deleteOder(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $resp = $this->model->deleteOrder($input);
        $response=get_api_response('200');
        $response = get_success_api_response($resp);
        return response()->json($response);
    }

    //数据导出
    public function export(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $this->model->export($input);
    }

    /**
     *  修改 合并退料，合并领料状态
     *  shuaijie.feng 6.5/2019
     * @param Request $request
     */
    public function Updatestatus(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $this->model->Updatestatus($input);
    }

    // 查看物料的转换关系
    public function MaterialConversionRelation(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $response = $this->model->MaterialConversionRelation($input);
        response()->json(get_success_api_response($response));
    }

}