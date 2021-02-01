<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2018年4月3日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\DeviceList;//设备台账model

class DeviceListController extends Controller
{

	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new DeviceList();
    }

    public function deviceExcelImport(Request $request)
    {
        $file = $request->all()['file'];
        if (!$file->isValid()) {
            return '{"success": 0, "error": "无效上传1！"}';
        }
        $fext = $file->getClientOriginalExtension();
        $file = $file->move('storage/exports', 'upload_devices.' . $fext);
        if (!$file) {
            return '{"success": 0, "error": "无效上传2！"}';
        }
        $data = $this->model->getExceldata($file);
        if (!$data) {
            return '{"success": 0, "error": "系统无法解析该Excel内的数据"}';
        }
        $this->model->excelDataSave($data);
        return '{"success": 1, "error": ""}';
    }

    //设备导入
    public function importDevice(Request $request){
        \set_time_limit(0);
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
         if($values[0][$i]!='设备编码' && $values[0][$i]!='资产编号' && $values[0][$i]!='设备名称' && $values[0][$i]!='规格型号' && $values[0][$i]!='设备功率'&& $values[0][$i]!='设备重量'&& $values[0][$i]!='设备类型'
         &&$values[0][$i]!='部门名称'&&$values[0][$i]!='使用状况'&&$values[0][$i]!='维修班组'&&$values[0][$i]!='设备标记'&&$values[0][$i]!='生产厂商'&&$values[0][$i]!='供应商'&&$values[0][$i]!='资产负责人'&&$values[0][$i]!='资产原值'
         &&$values[0][$i]!='资产净值'&&$values[0][$i]!='安装地点'&&$values[0][$i]!='购置时间'&&$values[0][$i]!='租用单位'&&$values[0][$i]!='备注'){
            for($j=0;$j<count($values);$j++){
                unset($values[$j][$i]);
            }
         }elseif($values[0][$i]=='设备编码'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['code']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='资产编号'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['asset_code']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='设备名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['name']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='规格型号'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['sam']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='设备功率'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['power']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='设备重量'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['weight']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='设备类型'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['device_type']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='部门名称'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['use_department']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='使用状况'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['use_status']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='维修班组'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['operation_team']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='设备标记'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['device_sign']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='生产厂商'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['procude_partner']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='供应商'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['supplier']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='资产负责人'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['employee_id']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='资产原值'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['initial_price']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='资产净值'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['net_price']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='安装地点'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['placement_address']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='购置时间'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['purchase_time']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='租用单位'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['rent_partner']=$values[$j][$i];
            }
         }elseif($values[0][$i]=='备注'){
            for($j=0;$j<count($values);$j++){
                $data[$j]['remark']=$values[$j][$i];
            }
         }
     }
     unset($data[0]);
     //1.检查设备编码是否重复
     $checkExcel=$this->model->checkExcel($data);
     //2.检查设备编码是否已经导入
     $checkMysql=$this->model->checkMysql($data);
     //3.检查设备类型是否存在
     $deviceType=$this->model->checkDeviceType($data);
     //4.检查部门名称是否存在
     $department=$this->model->checkDepartment($data);
     //5.检查使用状况是否存在
     $options=$this->model->checkOptions($data);
     //6.检查维修班组是否存在
     $team=$this->model->checkTeam($data);
     //7.检查设备标记是否存在
     $sign=$this->model->checkSign($data);
     //8.检查供应商是否存在
     $partner=$this->model->checkPartner($data);
     //9.检查资产负责人是否存在
     $employee=$this->model->checkEmployee($data);
     $this->model->saveInitial($data);
     $response=get_api_response('200');
     //拼接返回值
     return  response()->json($response);
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
        //code
        if(empty($input['code'])) TEA('9402','code');
        // if(!preg_match('/^[A-Z]{1,10}+$/',$input['code'])) TEA('9401','code');
        //name
        if(empty($input['name'])) TEA('9400','name');
        if(!isset($input['remark'])) TEA('732','remark');
        if( mb_strlen($input['remark'])>500)  TEA('9410','remark');
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
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        $response=get_api_response('200');
        $response['results']=['bin_id'=>$insert_id];
        return  response()->json($response);
    }



    /**
	 * 获取列表
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  select(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();
      	$obj_list=$this->model->getList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }




    /**
     * 设备台账删除
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
     * 设备台账列表批量删除
     * @param Request $request
     * @return string  返回json字符串
     * @author hao.li
     * @date  2019/07/29
     */
     public function batchDelete(Request $request){
         //获取前端数据
        $input=$request->all();
        //将data中数据以，分割成数组
        $ids=explode(',',$input['data']);
        //调用model执行删除
        $num=$this->model->batchDelete($ids);
        $response=\get_api_response('200');
        return \response()->json($response);
    }

    /**
     * 编辑设备台账
     * @param Request $request
     * @return  string  返回json
     * @author  liming
     */
    public  function update(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //集中营判断
        $this->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['decive'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 设备台账查询某条
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
     * 分页列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     */
    public  function  pageindex(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();

        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));

    }
    /**
     * 分页列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     */
    public  function  selects(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();

        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getPageLists($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));

    }





}