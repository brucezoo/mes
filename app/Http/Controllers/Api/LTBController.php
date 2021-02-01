<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiJwtController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LTBController extends ApiJwtController
{
    const localhost = 'http://127.0.0.1:8000/';

    protected $user = null;

    protected $isSuperAdmin = false;

    protected $input = [];

    protected $filter_status = [
        ['code' => '0', 'name' => '待领料', 'flag' => 0],
        ['code' => '3', 'name' => '领料中', 'flag' => 0],
        ['code' => '4', 'name' => '已领料', 'flag' => 0],
        ['code' => '6', 'name' => '已完工', 'flag' => 0],
    ];

    public function __construct(Request $request)
    {
        header('Content-Type: application/json; charset=utf-8');
        //
        $input = file_get_contents('php://input');
        if (!$input) {
            echo $this->outputJSON(false, null, 500, 'POST数据无效');
            exit;
        }
        //
        $input = json_decode($input, true);
        if (!$input) {
            echo $this->outputJSON(false, null, 501, 'POST数据必须为JSON');
            exit;
        }
        //
        if (isset($input['userid']) !== true) {
            echo $this->outputJSON(false, null, 502, '请传入UID');
            exit;
        }
        $uid = $input['userid'];
        $user = DB::select('SELECT * FROM `ruis_employee` WHERE `admin_id`=? AND `is_admin`=1 LIMIT 1', [$uid]);
        if (!$user) {
            echo $this->outputJSON(false, null, 503, 'UID为“' . $uid . '”的用户不存在');
            exit;
        }
        $user = $user[0];
        if (!$user->workcenter_id) {
            echo $this->outputJSON(false, null, 504, 'UID为“' . $uid . '”的用户未分配“生产单元”');
            exit;
        }
        // 是否为管理员
        $isSuperAdmin = DB::select('SELECT `superman` FROM `ruis_rbac_admin` WHERE `id`=? LIMIT 1', [$user->admin_id]);
        if ($isSuperAdmin && $isSuperAdmin[0]->superman == '1') {
            $this->isSuperAdmin = true;
        }
        //
        $this->user = $user;
        $this->input = isset($input['params']) ? $input['params'] : array();
    }

    // 获取用户信息
    // Request URL: api/ltb/GetUserInfo
    // Method: POST
    public function getUserInfo()
    {
        $data = DB::select(
        'SELECT
            `wc`.`id` AS `wcid`,
            `wc`.`code` AS `wccode`,
            `wc`.`name` AS `wcname`,
            `ws`.`id` AS `wsid`,
            `ws`.`code` AS `wscode`,
            `ws`.`name` AS `wsname`
        FROM
            `ruis_workcenter` AS `wc`
        LEFT JOIN `ruis_workshop` AS `ws`
        ON
            `ws`.`id` = `wc`.`workshop_id`
        WHERE
            `wc`.`id` = ?
        LIMIT 1', [$this->user->workcenter_id]);
        if (!$data) {
            return $this->outputJSON(false, null, 1, '无法获取用户相关信息');
        }
        $data = $data[0];
        $ret = [];
        $ret['name'] = $this->user->name;
        $ret['employeeid'] = $this->user->id;
        $ret['cardid'] = (int) $this->user->card_id;
        $ret['userid'] = $this->user->admin_id;
        $ret['isSuperAdmin'] = $this->isSuperAdmin;
        $ret['workshop'] = ['id' => $data->wsid, 'code' => $data->wscode, 'name' => $data->wsname];
        $ret['workcenter'] = ['id' => $data->wcid, 'code' => $data->wccode, 'name' => $data->wcname];
        return $this->outputJSON(true, $ret);
    }

    // 获取用户信息
    // Request URL: api/ltb/getWorks
    // Method: POST    
    public function getWorks()
    {
        $ret = [];
        $ret['name'] = $this->user->name;
        $ret['employeeid'] = $this->user->id;
        $ret['cardid'] = (int) $this->user->card_id;
        $ret['userid'] = $this->user->admin_id;
        $ret['isSuperAdmin'] = $this->isSuperAdmin;
        $ret['workshop'] = DB::select('SELECT `id`,`code`,`name`,`address` FROM `ruis_workshop` WHERE `address` != ""');
        $ret['workcenter'] = DB::select('SELECT `id`,`code`,`name`,`workshop_id` FROM `ruis_workcenter`');
        $ret['status'] = $this->filter_status;
        foreach ($ret['workcenter'] as $i => &$center) {
            if ($center->id != $this->user->workcenter_id) {
                $center->flag = 0;
                continue;
            }
            $center->flag = 1;
        }
        return $this->outputJSON(true, $ret);
    }

    // 获取工单列表
    public function getWorkOrders()
    {
        $ret = array(
            'scope' => ['name' => 'all', 'value' => 0]
        );
        $where = array();
        // 如果用户不是超级管理员，则根据车间或工厂列举工单数据
        if ($this->isSuperAdmin != true && $this->user->factory_id != 0) {
            if ($this->user->workshop_id != 0) {
                $where[] = ['a1.work_shop_id', '=', $this->user->workshop_id];  // 区分到车间
                $ret['scope'] = ['name' => 'workshop', 'value' => $this->user->workshop_id];
            } else {
                $where[] = ['a1.factory_id', '=', $this->user->factory_id];     // 区分到厂
                $ret['scope'] = ['name' => 'factory', 'value' => $this->user->factory_id];
            }
        }
        // 搜索
        $filters = [
            'sales_order_code' => 'a3.sales_order_code',                    // 销售订单号
            'sales_order_project_code' => 'a3.sales_order_project_code',    // 销售订单行项目
            'po_number' => 'a3.number',                                     // 生产订单号
            'inspur_sales_order_code' => 'a3.inspur_sales_order_code',      // 浪潮销售订单号
            'inspur_material_code' => 'a3.inspur_material_code',            // 旧物料编码
            'work_center_id' => 'a1.work_center_id',                        // 工位号
            'work_shop_id' => 'a1.work_shop_id',                            // 车间号
        ];
        foreach ($filters as $key => $field) {
            if (isset($this->input[$key]) && $this->input[$key]) {
                $where[] = [$field, 'like', '%' .$this->input[$key] . '%'];
            }
        }
        // 非已被删除数据
        $where[] = ['a1.is_delete', '=', 0];
        // 分页
        // ---- 页码
        $pn = isset($this->input['pn']) ? intval($this->input['pn']) : 1;
        $pn = max(1, $pn);
        // ---- 每页显示条数
        $pl = isset($this->input['pl']) ? intval($this->input['pl']) : 15;
        $pl = min(100, max(15, $pl));
        //
        $ret['pn'] = $pn;
        $ret['pl'] = $pl;
        /////////////////////////////////////////
        $builder = DB::table(config('alias.rwo') . ' as a1')
            ->select('a1.id as woid',
                'a1.number as wo_number',
                'a2.number as wt_number',
                'a3.number as po_number',
                'a3.sales_order_code',
                'a3.inspur_material_code',
                'a3.inspur_sales_order_code',
                'a3.sales_order_project_code',
                'a1.total_workhour',
                // 'a2.in_material',
                'a2.out_material',
                'a4.item_no',
                'a1.work_station_time',
                'a1.qty',
                'a1.status',
                'a1.on_off',
                'factory.name as factory_name',
                'work_center.name as work_center',
                'rwb.name as workbench_name',
                'ruu.commercial',
                // 'a3.confirm_number',
                'a1.plan_start_time',
                'a1.plan_end_time',
                'a1.production_order_id as poid',
                'a1.operation_order_id as wtid',
                'a2.status as wt_status',
                'a3.status as po_status'
            )
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rpo').' as a3','a3.id','=','a1.production_order_id')
            ->leftJoin(config('alias.ruu').' as ruu','a3.unit_id','=','ruu.id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a3.product_id')
            ->leftJoin(config('alias.rf').' as factory','a1.factory_id','factory.id')
            ->leftJoin(config('alias.rwc').' as work_center','a1.work_center_id','work_center.id')
            ->leftJoin(config('alias.rwb').' as rwb','a1.work_shift_id','rwb.id')
            ->offset(($pn - 1) * $pl)->limit($pl);
        if ($where) {
            $builder->where($where);
        }
        // 计划日期开始时间
        if (isset($this->input['work_station_time_min']) == true && $this->input['work_station_time_min']) {
            if (is_numeric($this->input['work_station_time_min']) != true) {
                $this->input['work_station_time_min'] = strtotime($this->input['work_station_time_min']);
            }
            // 计划日期结束时间
            if (isset($this->input['work_station_time_max']) == true) {
                if (is_numeric($this->input['work_station_time_max']) != true) {
                    $this->input['work_station_time_max'] = strtotime($this->input['work_station_time_max']);
                }
            } else {
                $this->input['work_station_time_max'] = time();
            }
            $builder->whereBetween('a1.work_station_time', [
                $this->input['work_station_time_min'],
                $this->input['work_station_time_max']
            ]);
        }
        //get获取接口
        $woids = [];
        $ret['list'] = $builder->get();
        foreach ($ret['list'] as $key => &$value) {
            $woids[] = $value->woid;
            $value->work_station_time = $value->work_station_time ? date('Y-m-d H:i:s', $value->work_station_time) : '';
            $value->status = 0;
            $value->out_material = json_decode($value->out_material, true);
            if ($value->out_material) {
                $value->out_material = $value->out_material[0];
            }
            !isset($value->work_center) && $value->work_center = '';
            !isset($value->factory_name) && $value->factory_name = '';
        }
        // 获取状态
        if (isset($this->input['session_id']) == true) {
            $status = file_get_contents(static::localhost . 'WorkOrder/getStatus?woid=' . implode(',', $woids), false, stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "Cookie: honesty=" . $this->input['session_id'] . "\r\n",
                ]
            ]));
            $status = json_decode($status, true);
            if ($status) {
                $status = $status['data'];
                foreach ($ret['list'] as $key => &$value) {
                    if (isset($status[$value->woid]) == true && in_array($status[$value->woid], ['3', '4', '6']) == true) {
                        $value->status = $status[$value->woid];
                    } else {
                        $value->status = 0;
                    }
                }
            }
        }
        //总共有多少条记录
        $builder = DB::table(config('alias.rwo') . ' as a1');
        if ($where) {
            $builder
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rpo').' as a3','a3.id','=','a1.production_order_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a3.product_id')
            ->leftJoin(config('alias.rwb').' as rwb','a1.work_shift_id','rwb.id')
            ->where($where);
        }
        if (isset($this->input['work_station_time_min']) == true && $this->input['work_station_time_min']) {
            $builder->whereBetween('a1.work_station_time', [
                $this->input['work_station_time_min'],
                $this->input['work_station_time_max']
            ]);
        }
        $ret['total'] = $builder->count();
        return $this->outputJSON(true, $ret);
    }

    // 获取详情
    public function getWorkOrderDetail()
    {
        if (!isset($this->input['wolist']) || !$this->input['wolist']) {
            return $this->outputJSON(false, null, 10, '请传入工单列表，字段 “wolist”');
        }
        if (is_array($this->input['wolist']) != true) {
            $this->input['wolist'] = [
                $this->input['wolist']
            ];
        }
        $data = DB::select('SELECT `po`.`in_material` FROM `ruis_work_order` AS `wo` LEFT JSON `ruis_production_order` AS `po` ON `po`.`id` = `wo`.`production_order_id`  WHERE `number` IN("' . implode('","', $this->input['wolist']) . '")');
        print_r($data);
    }

    public function buildMaterialRequisition()
    {
        if (isset($this->input['wolist']) != true || !$this->input['wolist']) {
            return outputJSON(false, null, 10, '请传入工单列表，字段 “wolist”');
        }
        print_r($this->input['wolist']);
    }

    private function outputJSON($status, $data, $code = null, $msg = '')
    {
        if ($status && $code == null) {
            $code = 0;
        }
        $return = ['status' => $status, 'code' => $code, 'msg' => $msg];
        if ($data != null) {
            $return['data'] = $data;
        }
        return json_encode($return);
    }
}