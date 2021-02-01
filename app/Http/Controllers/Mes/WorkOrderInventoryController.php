<?php

namespace App\Http\Controllers\Mes;

use App\Http\Models\WorkOrderInventory;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\DB;

class WorkOrderInventoryController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new WorkOrderInventory();
    }

    /**
     * 获取清单保存页
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getWorkOrderInventory(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        if(!isset($input['work_order_id_batch'])) TEA('700','work_order_id');
        $work_order_id_arr = explode(',',$input['work_order_id_batch']);
        $response = [];
        foreach ($work_order_id_arr as $k=>$v)
        {
            $response[$k] = $this->model->getWorkOrderInventory($v);
        }

        return response()->json(get_success_api_response($response));
    }

    /**
     * 清单列表页
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWorkOrderInventoryList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list=$this->model->getWorkOrderInventoryList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $response = get_success_api_response($obj_list, $paging);
        $response['recordsTotal'] = $paging['total_records'];
        $response['recordsFiltered'] = $paging['total_records'];
        return  response()->json($response);
    }

    /**
     * 保存清单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function insertInventory(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        if(!isset($input['data_batch'])) TEA('700','data_batch');
        foreach ($input['data_batch'] as $k=>$v)
        {
             $this->model->insertInventory($v);
        }
        return  response()->json(get_success_api_response('新增清单成功'));
    }

    /**
     * 删除清单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delInventory(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        if(!isset($input['id'])) TEA('700','id');

        $this->model->delInventory($input['id']);
        return response()->json(get_success_api_response('删除成功'));
    }

    /**
     * 导出数据
     *
     * @param Request $request
     * @throws \PHPExcel_Exception
     * @throws \PHPExcel_Reader_Exception
     * @throws \PHPExcel_Writer_Exception
     */
    public function inventoryExportExcel(Request $request)
    {
        $input = $request->all();

        $objPHPExcel = new \PHPExcel();
        $objPHPExcel->getProperties()->setTitle('export')->setDescription('Inventory Excel Export');
        $objPHPExcel->setActiveSheetIndex(0);

        $list=$this->model->getListExportExcel($input);
        //print_r($list);
        //添加表头
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,1, '销售订单号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,1, '行号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,1, '生产订单号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,1, '物料编码');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,1, '规格');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,1, '数量');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,1, '备注');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,1, '日期');

        $id_arr = [];
        if(count($list) > 0)
        {
            $rows = 1;
            foreach ($list as $k=> $v)
            {
                $id_arr[$k] = $v['id'];
                $rows++;
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,$rows,$v['sales_order_code']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,$rows,$v['sales_order_project_code']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,$rows,$v['po_number'].' ');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,$rows,$v['item_no'].' ');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,$rows,$v['specification']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,$rows,$v['qty']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,$rows,$v['remark']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,$rows,$v['date_time']);
            }
        }
        DB::table('ruis_work_order_inventory')->whereIn('id',$id_arr)->increment('export_num');
        $objPHPExcel->setActiveSheetIndex(0);

        ob_end_clean();//清除缓冲区,避免乱码
        header('Content-Type:application/vnd.ms-excel');
        header('Content-Disposition:attachment;filename="Inventory_' .date('Y-m-d') . '.xls"');
        header('Cache-Control:max-age=0');
        $objWrite = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel5');
        $objWrite->save('php://output');
    }

    /**
     * 清单打印数据与清单详情页
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInventorDetail(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $id_batch = explode(',',$input['id_batch']);
        $obj_list=$this->model->getInventorDetail($id_batch);
        //获取返回值
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 从托盘清单那边报工
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function moreShow(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        //该接口支持用工单id或者工单号查询
        $input = $request->all();
        $ids  = explode(',',$input['ids']);
        //处理实报数据,实报数据以托盘清单数据为准
        $declareCount = $this->model->declareCount($ids);
        if(empty($ids)) TEA('700','ids');
        $result = [];
        foreach($declareCount['work_order_arr'] as $key => $val) {
            $input[$this->model->apiPrimaryKey] = $key;
            $result[] = $this->model->get($input,$declareCount['qty_data'][$key],$val);
        }
        return response()->json(get_success_api_response($result));
    }

    /**
     * 打印次数
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiParamException
     */
    public function printNum(Request $request)
    {
        $input = $request->all();
        $ids  = explode(',',$input['ids']);

        $res = DB::table('ruis_work_order_inventory')->whereIn('id',$ids)->increment('print_num');
        if($res)
        {
            return response()->json(get_success_api_response('调用成功'));
        }
        else
        {
            TEPA('调用失败');
        }

    }

}

