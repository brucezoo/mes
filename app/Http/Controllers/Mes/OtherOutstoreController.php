<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年11月8日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\OtherOutstore;//引入入库处理类
use App\Http\Models\OtherOutstoreItem;//引入入库明细处理类
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class OtherOutstoreController extends Controller{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model =new OtherOutstore();
      if(empty($this->outstoreitem)) $this->outstoreitem =new OtherOutstoreItem();
    }

    /**
     * 数据过滤检验
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {

        if (empty($input['items'])) TEA('8404','items');
        //过滤
        trim_strings($input);
        //code
        if(empty($input['code'])) TEA('8401','code');
        //if(!preg_match('/^[A-Z]{1,10}+$/',$input['code'])) TEA('8402','code');
        //employee_id
        if(!isset($input['employee_id']) || !is_numeric($input['employee_id']))  TEA('730','employee_id');
        //creator
        if(!isset($input['creator']) || !is_numeric($input['creator']))  TEA('741','creator'); 
        if( mb_strlen($input['remark'])>500)  TEA('8403','remark');


    }

    /**
     * 获取其他入库单列表
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
     * 所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 其他出库单添加
     * @return   string   json
     * @author   liming
     */
    public function store(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //检测参数
        $this->checkFormFields($input);

        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        $response=get_api_response('200');
        $response['results']=['outstore_id'=>$insert_id];
        return  response()->json($response);
    }

    /**
     * 查看某条出库单信息
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
     * 编辑出库单
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
        $response['results']=['other_outstore_id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 其他出库单删除
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
     * 入库单审核
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

        //呼叫M层进行处理
        $order_id   =   $this->model->audit($input);


        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 其他出库单反审
     * @param Request $request
     * @return  string  返回json
     * @author  
     */
    public  function noaudit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //呼叫M层进行处理
        $this->model->noaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     *  获取成本中心 shuaijie.feng 6.24/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function GetcostcenterList(Request $request)
    {
        $input = $request->all();
        $response = $this->model->GetcostcenterList($input);
        return response()->json(get_api_response('200',$response));
    }

    /**
     *  共耗推送sap   shuaijie.feng 6.24/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiParamException
     * @throws \Exception
     */
    public function synctPropellingMovement(Request $request)
    {
        $input = $request->all();
        $key = 'synctPropellingMovement'.'$'.$input['id'];
        $is_lock = Redis::setnx($key,1); //设置锁，以防多次操作
        if($is_lock == 1) {
            Redis::expire($key, 120); //设置自动过期时间，120s，以防代码异常
            try {
                DB::connection()->beginTransaction();
                $response = $this->model->syncPropellingMovement($input);
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
            return response()->json(get_success_api_response('200', $response));
        }else{
            TEPA('正在处理中，请刷新，稍后再试！');
        }

    }

    // 搜索 共耗 列表
    public function Consumelist(Request $request)
    {
        $input = $request->all();
        $response = $this->model->Consumelist($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($response,$paging));
    }

    /**
     *  添加共耗数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function Consumeadd(Request $request)
    {
        $input = $request->all();
        $response = $this->model->Consumeadd($input);
        return response()->json(get_success_api_response($response));
    }

     /**
     *  获取余料共耗基础信息  12.20/2019 fengjuan.xia
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function GetComsumeBase(Request $request){
        $input = $request->all();
        $response = $this->model->GetComsumeBase($input);
        return response()->json(get_success_api_response($response));
    }

    // 查看某条
    public function ConsumeOnelist(Request $request){
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->ConsumeOnelist($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     *  删除某条数据  6.28/2019 shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function ConsumedeleteOne(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->ConsumedeleteOne($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     *  生成编码   6.28/2019 shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createCode(Request $request)
    {
        $input = $request->all();
        $response = $this->model->createCode($input);
        return response()->json(get_api_response('200',$response));
    }
}
