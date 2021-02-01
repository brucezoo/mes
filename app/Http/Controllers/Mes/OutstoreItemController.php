<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2018年1月9日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\StorageItem;//引入库存明细处理类


class OutstoreItemController extends Controller
{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new StorageItem();
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
        $obj_list=$this->model->getItemList($input , '-1');
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] = $obj_list->outitemtotal_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }



    /**
     * @message 撤回明细 重新计算
     * @author  liming
     * @time    年 月 日
     */    
    public  function  backitem(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        // pd($input['item_id']);
        // 获取列表信息
        $res = $this->model->backitem($input['item_id']);
        $response=get_api_response('200');
        return  response()->json(get_success_api_response($response));
    }

}
