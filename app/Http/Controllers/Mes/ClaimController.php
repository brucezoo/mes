<?php
namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\WorkDeclareOrder;
use App\Libraries\Soap;
use App\Http\Models\Claim;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new Claim();
    }

    /**
     * @message 索赔单
     * @author  liming
     * @time    年 月 日
     */    
    public function store(Request $request)
    {
        $input = $request->all();
        $insert_id= $this->model->store1($input);
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];

//        $sap_response = $this->model->pushClaim($insert_id);
//        if ($sap_response['RESPONSE_STATUS'] != 'SUCCESSED')
//        {
//            TEA('2490');
//        }
//        // 如果推送成功，状态为2
//        $this->model->updateStatus($insert_id, 2);
        return response()->json(get_success_api_response(200));
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
     * 分页列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$input['total_count'];
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
     * @message  推送索赔单
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     */
    public function pushClaim(Request $request)
    {
        //来吧先给个默认值
        $input['id'] = 1;
        $input = $request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        $sap_response = $this->model->pushClaim($input['id']);
        if ($sap_response['RESPONSE_STATUS'] != 'SUCCESSED') 
        {
            TEA('2490');
        }
        // 如果推送成功，状态为2
        $this->model->updateStatus($input['id'], 2);
        return response()->json(get_success_api_response($sap_response));
    }


    /**
     * 索赔回复列表 shuaijie.feng 11.1/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function replyPageindex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->replylist($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 索赔单审核 shuaijie.feng 11.1/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function personReply(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        // 回复前检查
        $this->model->checkup($input);
        $results = $this->model->personReply($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 索赔单提示
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function claimPrompt(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->claimPrompt($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     *  导出数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function claimexport(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->claimexport($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     *  索赔单删除（逻辑删）
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * hao.li
     */
     public function deleteClaim(Request $request){
         $input=$request->all();
         $results = $this->model->deleteClaim($input);
         return response()->json(get_success_api_response(200));
     }

}