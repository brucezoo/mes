<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/3/23
 * Time: 15:50
 */


namespace App\Http\Controllers\Mes;

use App\Http\Models\QC\Question;
use App\Libraries\Tree;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
class QuestionSettingController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Question();
    }

//region 增
    public function addItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->addItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }
//endregion
//region 修

    public function updateItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->updateItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

//endregion
//region 查

    public function viewItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->viewItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

    public function viewItemsList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->viewItemsList($input);
        $tree_list=Tree::findDescendants($qc_check_result);

        $response=get_api_response('200');
        $response['results']=$tree_list;
        return  response()->json($response);
    }

//endregion
//region 删
    public function deleteItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->deleteItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

//endregion

    /**
     * 添加 设置专门接收消息的人员
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function addsetPushmessage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->setPushmessage($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 设置专门接收消息的人员 列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setpushmassagelist(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->pushmassagelist($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 删除设置专门接收消息的人员
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deletesetPushmessage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->deletesetPushmessage($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 修改设置专门接收消息的人员
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatesetPushmessage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->updatesetPushmessage($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 查看设置专门接收消息的人员
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setPushmessageshow(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->setPushmessageshow($input);
        return response()->json(get_success_api_response($results));
    }

//endregion

}
