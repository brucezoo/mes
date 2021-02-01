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
use App\Http\Models\QC\AbnormalityReply;

class AbnormalReplyController  extends Controller
{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
        parent::__construct();
        $this->model=new AbnormalityReply();
    }

    /**
     * 添加或者编辑时候进行的提交数据处理
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);
        if(empty($input['cause'])) TEA('703','cause');
        if(empty($input['final_method'])) TEA('703','final_method');
        if(empty($input['result_final_method'])) TEA('703','result_final_method');
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
        $paging['total_records'] = $obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 特殊异常单列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  specialpageIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $total_count=$this->model->getspecialOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] = $total_count;
        return  response()->json(get_success_api_response($total_count,$paging));
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

        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 导出导常回复单
     * @author hao.li
     */
     public function differentFromExcel(Request $request){
        //pd('进入controller');
        $input=$request -> all();
        trim_strings($input);
        $response=$this->model->abnormalExportExcel($input);
      //  pd($request);
        return response() -> json(get_api_response('200'));
    }

}