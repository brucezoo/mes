<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 2018/9/23
 * Time: 上午10:41
 */

namespace App\Http\Controllers\Mes;

use App\Http\Models\WorkOrder;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

// @author guanghui.chen
// DB manager
use Illuminate\Support\Facades\DB;

class WorkOrderController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new WorkOrder();
    }

    public function  getAllOrderList(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getAloneWorkOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        $response = get_success_api_response($obj_list, $paging);
        return  response()->json($response);
    }

    //获取工作中心  hao.li
    public function getWorkcenter(Request $request){
        $input=$request->all();
        \trim_strings($input);
        $obj_list=$this->model->getWorkcenter($input);
        $response=\get_api_response('200');
        $response=\get_success_api_response($obj_list);
        return \response()->json($response);
    }

    public function  pageIndex(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getWorkOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        // datatable response data
        // @author guanghui.chen
        $response = get_success_api_response($obj_list, $paging);
        $response['recordsTotal'] = $paging['total_records'];
        $response['recordsFiltered'] = $paging['total_records'];
        return  response()->json($response);
    }

    public function show(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        //该接口支持用工单id或者工单号查询 Modify By Bruce.Chu in 2018-09-12
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey]) && empty($input['wo_number'])) TEA('700',$this->model->apiPrimaryKey.' or wo_number');
        $obj = $this->model->get($input);
        return response()->json(get_success_api_response($obj));
    }

    public function insertOrderInMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        if(empty($input['material_code']) || empty($input['qty']) || empty($input['commercial'])) TEA('700','material_code or qty or commercial');
        if(empty($input['product_order_id']) || empty($input['work_order_id']) || empty($input['number'])) TEA('700','product_order_id or work_order_id or number');
        $this->model->checkRepeatMaterial($input);
        $json = $this->model->insertNewOrderInMaterial($input);
        return response()->json(get_success_api_response($json));

    }
    //编辑工单仓储
    public function edit(Request $request)
    {
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey])&& empty($input['in_material'])) TEA('700',$this->model->apiPrimaryKey.' or in_material');
        $obj = $this->model->edit_work_order($input);
        return response()->json(get_success_api_response($obj));
    }

    public function delete_workorder_item(Request $request)
    {
        $input = $request->all();
        if(empty($input['work_order_item_id'])) TEA('700','work_order_item_id');
        $this->model->checkHasRequisition($input);
        $obj = $this->model->delete_work_order_item($input);
        return response()->json(get_success_api_response($obj));
    }

    //替换料日志
    public function getReplaceLog(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getReplaceLog($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        $response = get_success_api_response($obj_list, $paging);
        return  response()->json($response);
    }


    //更新工单确认号
    public function updateConfirmNo(Request $request)
    {
        $input = $request->all();
        if(empty($input['work_order_id'])) TEA('700','work_order_id');
        $obj = $this->model->updateConfirmNo($input);
        return response()->json(get_success_api_response($obj));
    }

    public function  excelExport(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //导出
        $this->model->excelExport($input);
    }

    /**
     * 按时间段进行粗排
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  kevin
     */
    public function carefulPlanOrderList(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //if(empty($input['operation_start_time'])) TEA('700','operation_start_time');

        //获取数据
        $obj_list = $this->model->carefulPlanOrderList($input);

        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    // WO工单往上追溯工艺列表
    // @author guanghui.chen
    public function getTraceTechnics(Request $request)
    {
        $input = $request->all();

        if (!isset($input['poid']) || !$input['poid']) {
            return '{"status": false, "code": 700, "msg": "invalid parameter"}';
        }
        $input['poid'] = explode(',', $input['poid']);
        sort($input['poid']);
        $result = DB::select(
            'SELECT
                `id`,
                `production_order_id`,
                `operation_id`,
                `operation_name`,
                `is_end_operation`,
                `is_outsource`
            FROM
                `ruis_operation_order`
            WHERE
                `production_order_id` IN(' . str_pad('?', (count($input['poid']) - 1) * 3 + 1, '?, ', STR_PAD_LEFT) . ')
            ORDER BY
                `routing_operation_order` ASC',
        $input['poid']);
        $return = array();
        foreach ($result as $row) {
            $return[$row->production_order_id][] = [
                'wtid' => $row->id,
                'opid' => $row->operation_id,
                'opname' => $row->operation_name,
                'islast' => $row->is_end_operation == '1',
                'isouts' => $row->is_outsource == '1'
            ];
        }
        return '{"status": true, "code": 0, "msg": "success", "data": ' . json_encode($return) . '}';
    }

    // 取出状态
    // @author guanghui.chen
    public function getStatus(Request $request)
    {
        $input = $request->all();

        if (!isset($input['woid']) || !$input['woid']) {
            return '{"status": false, "code": 700, "msg": "invalid parameter"}';
        }
        // data var
        $ret = [];
        // 领料状态
        $input['woid'] = explode(',', $input['woid']);
        sort($input['woid']);
        $result = DB::select(
            'SELECT
                `id`,
                `type`,
                `work_order_id`,
                `status`
            FROM
                `ruis_material_requisition`
            WHERE
                `work_order_id` IN(' . str_pad('?', (count($input['woid']) - 1) * 3 + 1, '?, ', STR_PAD_LEFT) . ')
            ORDER BY
                `work_order_id` ASC',
        $input['woid']);
        $newResult = [];
        foreach ($result as $i => $row) {
            $newResult[$row->work_order_id][] = [ 't' => $row->type, 's' => $row->status ];
        }
        foreach ($newResult as $woid => $wots) {
            $ret[$woid] = 4;
            foreach ($wots as $ts) {
                if ($ts['s'] != 4) {
                    $ret[$woid] = 3;
                    break;
                }
            }
        }
        // 报工状态
        $bgid = [];
        foreach ($ret as $woid => $status) {
            if ($status == 4) {
                array_push($bgid, $woid);
            }
        }
        if ($bgid) {
            $result = DB::select(
                'SELECT
                    `id`,
                    `work_order_id`,
                    `status`
                FROM
                    `ruis_work_declare_order`
                WHERE
                    `work_order_id` IN (' . str_pad('?', (count($bgid) - 1) * 3 + 1, '?, ', STR_PAD_LEFT) . ')
                ORDER BY
                    `work_order_id` ASC',
            $bgid);
            foreach ($result as $i => $row) {
                $ret[$row->work_order_id] = $row->status == 2 ? 6 : 5;
            }
        }
        //
        return '{"status": true, "code": 0, "msg": "success", "data": ' . json_encode($ret) . '}';
    }

    public function getLastGxInfo(Request $request)
    {
        $input = $request->all();
        if (!isset($input['data']) || !$input['data']) {
            return '{"status": false, "code": 1, "msg": "fail", "data": []}';
        }

        $input = $input['data'];

        // 查找工序id对应的Code
        // opmap 对照变量
        // k = 工序id
        // v = 工序code
        $opmap = [];
        $opids = array_unique(array_column($input, 'opid'));
        sort($opids);
        $rs = DB::select('SELECT `id`,`code` FROM `ruis_ie_operation` WHERE `id` IN(' . implode(',', $opids) . ')');
        foreach ($rs as $row) {
            $opmap[$row->id] = $row->code;
        }
        // 最后一道工序
        // woLastGx 对照变量
        // k = 工单id
        // v = 采购申请编号的数据（BANFN）
        foreach ($input as $row) {
            $code = $opmap[$row['opid']];
            if (isset($row['data']) != true || !$row['data']) {
                continue;
            }
            foreach ($row['data'] as $r) {
                if (isset($r['operation_code']) && $code == $r['operation_code']) {
                    $woLastGx[$row['woid']] =  $r['BANFN'] ? $r['BANFN'] : 'unknown:BANFN';
                    break;
                }
            }
        }
        if ($woLastGx) {
            // 筛选出含有采购申请编号的数据（BANFN）
            $tempArr = array_filter($woLastGx, function ($v) {
                return $v != 'unknown:BANFN';
            });
            // 如果为自制，则显示工厂
            $woids = [];
            foreach ($woLastGx as $woid => $banfn) {
                if ($banfn == 'unknown:BANFN') {
                    $woids[] = $woid;
                }
            }
            $rs = DB::select(
                'SELECT
                    `wo`.`id` AS `woid`,
                    `f`.`code`,
                    `f`.`name`
                FROM
                    `ruis_work_order` AS `wo`
                LEFT JOIN `ruis_production_order` AS `po`
                ON
                    `po`.`id` = `wo`.`production_order_id`
                LEFT JOIN `ruis_factory` AS `f`
                ON
                    `f`.`id` = `po`.`plan_factory_id`
                WHERE
                    `wo`.`id` IN(' . implode(',', $woids) . ')'
            );
            foreach ($rs as $i => $row) {
                $woLastGx[$row->woid] = 'unknown:BANFN_' . $row->code . '#' . $row->name;
            }
            // setup 1
            // 根据采购申请编号取出采购凭证ID
            if ($tempArr) {
                //
                $rs = DB::select('SELECT `BANFN`, `picking_id` FROM `ruis_sap_out_picking_line` WHERE `BANFN` IN("' . implode('","', $tempArr) . '")');
                foreach ($rs as $i => $row) {
                    $rs[$row->BANFN] = $row->picking_id;
                    unset($rs[$i]);
                }
                // 
                foreach ($tempArr as $woid => &$banfn) {
                    if (isset($rs[$banfn]) == true && $rs[$banfn]) {
                        $banfn = $rs[$banfn];
                    } else {
                        $woLastGx[$woid] = 'unknown:pickid_' . $banfn;
                        unset($tempArr[$woid]);
                    }
                }
                // $tempArr
                // k = 工单id, v = 采购凭证ID
            }
            // setup 2
            // 根据采购凭证ID取得供应商编号
            if ($tempArr) {
                // 
                $rs = DB::select('SELECT `id`, `LIFNR` FROM `ruis_sap_out_picking` WHERE `id` IN("' . implode('","', $tempArr) . '")');
                foreach ($rs as $i => $row) {
                    $rs[$row->id] = ltrim($row->LIFNR, '0');
                    unset($rs[$i]);
                }
                // 
                foreach ($tempArr as $woid => &$pickid) {
                    if (isset($rs[$pickid]) == true && $rs[$pickid]) {
                        $banfn = $rs[$pickid];
                    } else {
                        $woLastGx[$woid] = 'unknown:lifnr_' . $pickid;
                        unset($tempArr[$woid]);
                    }
                }
                // $tempArr
                // k = 工单id, v = 供应商编号
            }
            // setup 3
            // 根据供应商编号取得供应商信息
            if ($tempArr) {
                // 
                $rs = DB::select('SELECT `code`, `name`, `phone` FROM `ruis_partner_new` WHERE `code` IN("' . implode('","', $tempArr) . '")');
                foreach ($rs as $i => $row) {
                    $rs[$row->code] = ['name' => $row->name, 'phone' => $row->phone];
                    unset($rs[$i]);
                }
                // 
                foreach ($tempArr as $woid => $code) {
                    if (isset($rs[$code]) == true && $rs[$code]) {
                        $woLastGx[$woid] = $rs[$code];
                    } else {
                        $woLastGx[$woid] = 'unknown:partner_' . $code;
                    }
                }
            }
        }
        return '{"status": true, "code": 0, "msg": "success", "data": ' . json_encode($woLastGx) . '}';
    }

    /**
     * 适配自制/委外/质检单的洗标文件
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce.Chu
     */
    public function getCareLableList(Request $request)
    {
        //前端传参 主键id+类型
        $id = $request->input('id');
        $type = $request->input('type');
        //参数校验
        $this->checkPrimaryKey($id,'id');
        if(empty($type) || !in_array($type,[1,2,3])) TEA('700','type');
        //联系M层处理
        $results = $this->model->getCareLableList($id,$type);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 通过工作中心获取工作台
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author kevin
     */
    public function getWorkbench(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);

        if(empty($input['workcenter_id'])) TEA('700','workcenter_id');

        //联系M层处理
        $results = $this->model->getWorkbench($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     *  导出计划排产  shuaijie.feng
     * @param Request $request
     * @throws \PHPExcel_Exception
     * @throws \PHPExcel_Reader_Exception
     * @throws \PHPExcel_Writer_Exception
     */
    public function getPlannedexport(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $resp = $this->model->getPlannedexport($input);
        return $resp;
    }

    /**
     *  裁剪作业流转卡打印 shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function TransferPrinting(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $resp = $this->model->TransferPrinting($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     * 裁剪作业流转卡导出 shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function Transferexport(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $resp = $this->model->Transferexport($input);
        return response()->json(get_success_api_response($resp));
    }


    public function moreShow(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        //该接口支持用工单id或者工单号查询 Modify By Bruce.Chu in 2018-09-12
        $input = $request->all();
        $work_order_ids  = explode(',',$input[$this->model->apiPrimaryKey]);
        if(empty($work_order_ids)) TEA('700','work_order_id');
        $result = [];
        foreach($work_order_ids as $key => $val) {
            $input[$this->model->apiPrimaryKey] = $val;
            $result[] = $this->model->get($input);
        }
        return response()->json(get_success_api_response($result));
    }

    /**
     *   查询跟包带数据   shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function heelBandget(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->heelBandget($input);
        return response()->json(get_success_api_response($result));
    }

    /**
     * 获取排单时间 yu.peng
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlanStartTime(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->getPlanStartTime($input);
        return response()->json(get_success_api_response($result));
    }

    // 根据销售订单行项获取工艺文件  shuaijie.fenng
    public function processDocumentsshow(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->processDocumentsshow($input);
        return response()->json(get_success_api_response($result));
    }

    public function  newPageIndex(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getNewWorkOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        // datatable response data
        // @author guanghui.chen
        $response = get_success_api_response($obj_list, $paging);
        $response['recordsTotal'] = $paging['total_records'];
        $response['recordsFiltered'] = $paging['total_records'];
        return  response()->json($response);
    }

    // 查询某物料的上级物料详情  shuaijie.feng
    public function GetprocessDocuments(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->GetprocessDocuments($input);
        return response()->json(get_success_api_response($result));
    }


    /**
     * 上传临时工艺
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function UploadWorkOrderFile(Request $request)
    {
        $this->model->UploadWorkOrderFile($request);
        $response=get_api_response('200');
        return  response()->json($response);
    }

    /**
     * 获取临时工艺文件
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWorkOrderFile(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->getWorkOrderFile($input);
        return response()->json(get_success_api_response($result));
    }

    /**
     * 物料替换
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function replaceMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkReplaceMaterial($input);

        $result = $this->model->replaceMaterial($input);
        return response()->json(get_success_api_response($result));
    }

    /**
     * 物料检查和仓储地址带出
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkAddMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        $result = $this->model->checkAddMaterial($input);
        return response()->json(get_success_api_response($result));
    }

    /**
     * PDA打印跟包带，规避法定节假日
     * @return \Illuminate\Http\JsonResponse
     */
    public function beforeHoliday()
    {
        $result = $this->model->beforeHoliday();
        return response()->json(get_success_api_response($result));
    }
}

