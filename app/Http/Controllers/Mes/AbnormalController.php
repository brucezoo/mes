<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2017/12/27
 * Time: 15:46
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\QC\QualityAbnormalityReport;
use App\Libraries\Tree;


class AbnormalController extends Controller
{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
        parent::__construct();
        $this->model=new QualityAbnormalityReport();
    }

    /**
     * 添加或者编辑仓库时候进行的提交数据处理
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);
        if(empty($input['key_persons'])) TEA('6250','key_persons');
        
    }

    /**
     * 添加
     * @return   string   json
     * @author   liming
     */
    public function store(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //检测参数
        $this->checkFormFields($input);

        // 单独检查 责任人是否存在 
        $persons= explode(',', $input['key_persons']);
        if (count($persons)<1 ) TEA('6251');

        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];
        return  response()->json($response);
    }

    /**
     * 异常单列表
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
//        $paging['total_records'] = $obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 查看某条信息
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  liming
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

         // 获取单个入库单信息
        $obj_list=$this->model->getOneOrder($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
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

        //集中营判断
        $this->checkFormFields($input);

        // 单独检查 责任人是否存在 
        $persons= explode(',', $input['key_persons']);
        if (count($persons)<1 ) TEA('6251');

        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 删除
     * @param Request $request
     * @return string  返回json字符串
     * @author liming
     */
    public  function  destroy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);
    }


    /**
     * 异常单完结
     * @param Request $request
     * @return  string  返回json
     * @author  
     */
    public  function audit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //结案内容
        if(empty($input['end_remark'])) TEA('703','end_remark');

        //呼叫M层进行处理
        $order_id   =   $this->model->audit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

    public function departmentList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->departmentList($input);
        $tree_list=Tree::findDescendants($qc_check_result);

        $response=get_api_response('200');
        $response['results']=$tree_list;
        return  response()->json($response);
    }

    /**
     *  异常回复导出 shuaijie.feng 7.3/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function exportExcel(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        trim_strings($input);
        $response = $this->model->exportExcel($input);
        return  response()->json(get_api_response('200'));
    }

    // 退回功能
    public function repulse(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->repulse($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     *  生成重大异常 hao.li 12.16/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function createAbnormal(Request $request){
         $input=$request->all();
         $response = $this->model->createAbnormal($input);
         return response()->json(get_success_api_response($response));
     }

    /**总汇数据
     * @param Request $request
     */
     public function  AbnormallistData(Request $request)
     {
         $params = $request->all();
         $this->model->searchData($params);
     }


}