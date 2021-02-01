<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年12月7日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\StorageInve;//引入实时库存处理类


class StorageInveController extends Controller
{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new StorageInve();
    }

    /**
     * 实时库存列表显示
     * @param Request $request
     * @return  string   返回json
     */
    public function  getStorageInveListNew(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getStorageInveListNew($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        if(array_key_exists('page_no',$input )|| array_key_exists('page_size',$input ))//判断传入的key是否存在
        {
            //获取返回值
            $paging = $this->getPagingResponse($input);
            return response()->json(get_success_api_response($obj_list, $paging));
        }else
        {
            $response['results']=$obj_list;
            return  response()->json($response);
        }
    }

    /**
     * 根据实时库存ID，查询出入库明细列表
     * @param Request $request
     * @return  string   返回json
     */
    public function  getStorageItemList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //必传参数校验
        if(!array_key_exists('inve_ids',$input )){
            return  response()
                        ->json(get_api_exception_response('实时库存ID(inve_ids)必传'));
        }

        //获取列表信息
        $obj_list=$this->model->getStorageItemList($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    /**
     * 根据实时库存ID，查询相关单据
     * @param Request $request
     * @return  string   返回json
     */
    public function  getRelativeBill(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //必传参数校验
        if(!array_key_exists('item_id',$input )){
            return  response()
                        ->json(get_api_exception_response('出入库明细ID(item_id)必传'));
        }
        if(!array_key_exists('category_id',$input )){
            return  response()
                        ->json(get_api_exception_response('出入库类型ID(category_id)必传'));
        }

        if (!in_array($input['category_id'], [13, 32, 17, 35, 0, 21, 14, 19])) {
            return  response()
                        ->json(get_api_exception_response('当前类型不支持查询关联单据'));
        }

        //获取列表信息
        $obj_list=$this->model->getRelativeBill($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

  /**
     * 实时库存列表显示
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  pageIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getStorageInveList($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        if(array_key_exists('page_no',$input )|| array_key_exists('page_size',$input ))//判断传入的key是否存在
        {
            //获取返回值
            $paging = $this->getPagingResponse($input);
            return response()->json(get_success_api_response($obj_list, $paging));
        }else
        {
            $response['results']=$obj_list;
            return  response()->json($response);
        }
    }

     /**
     * 实时库存列表显示
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  pagecheckIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getStorageInve_checkList($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        if(array_key_exists('page_no',$input )|| array_key_exists('page_size',$input ))//判断传入的key是否存在
        {
            //获取返回值
            $paging = $this->getPagingResponse($input);
            return response()->json(get_success_api_response($obj_list, $paging));
        }else
        {
            $response['results']=$obj_list;
            return  response()->json($response);
        }
    }
     /**
     * 获取所选实时库存id显示
     * @param Request $request
     * @return  string   返回json
     * @author  fengjuan.xia
     */
    public function  pagecheckIndexids(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getStorageInve_IDS($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        if (!array_key_exists('page_no', $input) && !array_key_exists('page_size',$input)) TEA('8211','page');
        
        if(array_key_exists('page_no',$input )|| array_key_exists('page_size',$input ))//判断传入的key是否存在
        {
            //获取返回值
            $paging = $this->getPagingResponse($input);
            return response()->json(get_success_api_response($obj_list, $paging));
        }else
        {
            $response['results']=$obj_list;
            return  response()->json($response);
        }
    }
    
    /**
     * 仓位查询某条记录
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
        $response['results']=$this->model->get($id);
        return  response()->json($response);
    }



   /**
     * 查看出入库明细
     * @param Request   $request
     * @return string   返回json
     */
    public function  showItems(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->getitems($id);
        return  response()->json($response);
    }

    /**
     * 余料库存列表
     * @param Request   $request
     * @return string   返回json
     * hao.li
     */
     public function oddmentsList(Request $request){
         $input=$request->all();
         $obj_list=$this->model->oddmentsList($input);
         $response['results']=$obj_list;
         return  response()->json($response);
     }

  /**
   * 调账库存原因列表
  * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function stockreasonList(Request $request){
      $input=$request->all();
      $obj_list=$this->model->stockreasonList($input);
      $paging = $this->getPagingResponse($input);
      return response()->json(get_success_api_response($obj_list, $paging));
  }




}
