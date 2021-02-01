<?php
/**
 * 模板管理器
 * @author  liming
 * @time    2017年12月7日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use function GuzzleHttp\Psr7\uri_for;
use Illuminate\Http\Request;
use App\Http\Models\StorageInve;//引入实时库存处理类


class StatementController extends Controller
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
     * 报表列表显示
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function pageIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getStatementList($input);

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
     * 导出车间再制库存报表
     * @param Request $request
     * @throws \PHPExcel_Exception
     * @throws \PHPExcel_Reader_Exception
     * @throws \PHPExcel_Writer_Exception
     */
    public function statementExportExcel(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $list=$this->model->getStatementExportExcel($input);

        $objPHPExcel = new \PHPExcel();
        $objPHPExcel->getProperties()->setTitle('export')->setDescription('Workshop Produced Excel Export');
        $objPHPExcel->setActiveSheetIndex(0);

        //添加表头
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,1, '销售订单号/行项号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,1, '生产订单');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,1, '工单');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,1, '物料编码');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,1, '物料名称');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,1, '数量');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,1, '单位');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,1, '批次号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,1, '厂区');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,1, '仓库');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,1, '车间');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(11,1, '报工状态');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(12,1, '库龄');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(13,1, '入库类型');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(14,1, '过账日期');

        $objPHPExcel->getActiveSheet()->getColumnDimension('A')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('B')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('C')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('D')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('E')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('J')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('K')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('O')->setAutoSize(true);
        if(count($list) > 0)
        {
            $rows = 1;
            foreach ($list as $v)
            {
                if($v['category_id'] == 14)
                {
                    $v['category_id'] = 'SAP领料';
                }
                elseif($v['category_id'] == 15)
                {
                    $v['category_id'] = '车间领料';
                }
                else
                {
                    $v['category_id'] = '其他';
                }
                if($v['rwdo_status'] == 1)
                {
                    $v['rwdo_status'] = '报工中';
                }
                elseif ($v['rwdo_status'] == 2)
                {
                    $v['rwdo_status'] = '已报工';
                }
                else
                {
                    $v['rwdo_status'] = '待报工';
                }
                $rows++;
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,$rows,$v['sale_order_code_info']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,$rows,' '.$v['po_number'].' ');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,$rows,$v['wo_number']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,$rows,' '.$v['item_no'].' ');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,$rows,$v['material_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,$rows,$v['quantity']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,$rows,$v['unit_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,$rows,$v['lot']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,$rows,$v['factory_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,$rows,$v['storage_depot_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,$rows,$v['work_shop_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(11,$rows,$v['rwdo_status']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(12,$rows,$v['inve_age']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(13,$rows,$v['category_id']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(14,$rows,$v['BUDAT']);
            }
        }

        $objPHPExcel->setActiveSheetIndex(0);

        ob_end_clean();//清除缓冲区,避免乱码
        header('Content-Type:application/vnd.ms-excel');
        header('Content-Disposition:attachment;filename="Workshop_Produced_' .date('Y-m-d') . '.xls"');
        header('Cache-Control:max-age=0');
        $objWrite = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel5');
        $objWrite->save('php://output');
    }

    /**
     * 获取进出料库存列表
     * @param Request $request
     * @return  string   返回json
     */
    public function getInOutMaterialInveInfo(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        if((!array_key_exists('sale_order_code', $input)||empty($input['sale_order_code']))
            &&(!array_key_exists('po_number', $input)||empty($input['po_number']))
            &&(!array_key_exists('wo_number', $input)||empty($input['wo_number']))
            ){
            return  response()->json(get_api_exception_response("销售订单/生产订单/工单，必填其一"));
        }

        // 获取列表信息
        $obj_list=$this->model->getInOutMaterialInveList($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

}
