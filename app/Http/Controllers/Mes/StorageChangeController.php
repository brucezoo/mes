<?php
/**
 * 库存签转
 * User: liming
 * Date: 2018/10/26
 * Time: 15:17
 */
namespace App\Http\Controllers\Mes;                    //定义命名空间
use App\Http\Controllers\Controller;                   //引入基础控制器类
use Illuminate\Http\Request;                           //获取请求参数
use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use App\Http\Models\StorageChange;
use App\Http\Models\StorageChangeItem;
use App\Http\Models\StorageInve;

class StorageChangeController extends Controller
{
    protected $storagechange = null;
    public function __construct()
    {
        parent::__construct();
        if (empty($this->storagechange)) $this->storagechange = new StorageChange();
        if (empty($this->storagechangeitem)) $this->storagechangeitem = new StorageChangeItem();
        if(empty($this->sinve)) $this->sinve =new StorageInve();
    }
    /**
     * 验证实际签转数据
     * @return  真实数量
     * @author  liming
     */
    public function  Verify_Data (Request $request)
    {
        $input = $request->all();
        if(!is_numeric($input['real_quantity']))//是否数字
        {
            TEA('6003');
        }
        //根据实时库存id获取数量
        $quantity = $this->sinve->getFieldValueById($input['id'],'quantity');
        if($quantity<$input['real_quantity'])
        {
            TEA('8801');
        }

        return $input['real_quantity'];
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
        $input['has']=$this->storagechange->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 签转单添加
     * @return   string   json
     * @author   liming
     */
    public function store(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //呼叫M层进行处理
        $insert_id=$this->storagechange->add($input);
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];
        return  response()->json($response);
    }
    /**
     * 获取调拨单列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  getChangeList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->storagechange->getOrderList($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * 查看某条调拨单信息
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
        $obj_list=$this->storagechange->getOneOrder($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
     * 编辑调拨单
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
        $this->storagechange->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 调拨单删除
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
        $this->storagechange->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);
    }
    /**
     * 调拨单批量审核
     * @param Request $request
     * @return  string  返回json
     * @author liming
     */
    public  function batchaudit(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if($input['ids']=="")
        {
            TEA('8800','ids');
        }
        //呼叫M层进行处理
        $this->storagechange->batchaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['ids']];
        return  response()->json($response);
    }
    /**
     * 调拨单审核
     * @param Request $request
     * @return  string  返回json
     * @author liming
     */
    public  function audit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $order_id   =   $this->storagechange->audit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 领料 迁转
     *
     * @param Request $request
     * @return  string  返回json
     * @throws \App\Exceptions\ApiException
     * @author liming
     * @since Lester.You
     */
    public function publicChange(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input = $request->all();
        trim_strings($input);
        $this->storagechange->checkPublicChange($input);

        //呼叫M层进行处理
        $this->storagechange->publicChange($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 导出模版
     *
     * @param Request $request
     * @return  string  返回json
     * @throws \App\Exceptions\ApiException
     * @author liming
     * @since Lester.You
     */
     public function exportTemplate(Request $request){
        $input=$request->all();
        $this->storagechange->exportTemplate($input);
        $response=\get_api_response('200');
        return \response()->json($response);
     }

    /**
     * 批量迁转导入
     *
     * @param Request $request
     * @return  string  返回json
     * @throws \App\Exceptions\ApiException
     * @author hao.li
     */
     public function importMaterialSku(Request $request){
       
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }
        $number=count($values[0]);
       $data=[];
       $k=0;
     for($i=0;$i<$number;$i++){
         if($values[0][$i]!='发出销售订单' && $values[0][$i]!='发出销售订单行项目' && $values[0][$i]!='发出生产订单' && $values[0][$i]!='发出工单' && $values[0][$i]!='发出工厂'&& $values[0][$i]!='发出库存地点'&& $values[0][$i]!='物料编号'
            && $values[0][$i]!='数量' && $values[0][$i]!='单位' && $values[0][$i]!='批次号' && $values[0][$i]!='接收销售订单' && $values[0][$i]!='接收销售订单行项目' && $values[0][$i]!='接收生产订单' && $values[0][$i]!='接收工单' && $values[0][$i]!='备注'){
            for($j=0;$j<count($values);$j++){
                unset($values[$j][$i]);
            }
         }elseif($values[0][$i]=='发出销售订单'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['sendSalesOrder']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='发出销售订单行项目'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['sendSalesOrderItem']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='发出生产订单'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['sendProductOrder']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='发出工单'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['sendWorkOrder']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='发出工厂'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['factory']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='发出库存地点'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['storage']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='物料编号'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['material']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='数量'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['qty']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='单位'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['unit']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='批次号'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['batch']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='接收销售订单'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['acceptSalesOrder']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='接收销售订单行项目'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['acceptSalesOrderItem']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='接收生产订单'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['accpetProductOrder']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='接收工单'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['acceptWorkOrder']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='备注'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['remark']=$values[$j][$i];
            }
         }
     }  
     unset($data[0]);

     //检验是否有物料编码或数量为空
     $this->storagechange->checkIsEmpty($data);
     $beatchMaterial='';
     $material=$this->storagechange->checkData($data);
     if(empty($material)){
         $beatchMaterial=$this->storagechange->checkBeatch($data);
         if(empty($beatchMaterial)){
             $this->storagechange->saveStorageChange($data);
             $response=get_api_response('200');
         }else{
            $response=get_api_response('206');
         }
     }else{
        $response=get_api_response('204');
     }
        $response['results']=$material;
        $response['beatch']=$beatchMaterial;
        //拼接返回值
        return  response()->json($response);
    }


}