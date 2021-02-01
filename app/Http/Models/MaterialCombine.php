<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/15 0:12
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class MaterialCombine extends Base
{
    protected $apiPrimaryKey = 'material_combine_id';

    public function __construct()
    {
        parent::__construct();
        empty($this->table) && $this->table = config('alias.rmco');
    }

//region 检

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkStoreParams(&$input)
    {
        if (empty($input['data'])) TEA(700, 'data');
        $input['data'] = json_decode($input['data'], true);

        if (empty($input['employee_id'])) TEA('700', 'employee_id');
        $has = $this->isExisted([['id', '=', $input['employee_id']]], config('alias.re'));
        if (!$has) TEA('700', 'employee_id');

        foreach ($input['data'] as &$value) {

            if (empty($value['line_depot_id'])) TEA('700', 'line_depot_id');
            $has = $this->isExisted([['id', '=', $value['line_depot_id']]], config('alias.rsd'));
            if (!$has) TEA('700', 'line_depot_id');

//            if (empty($value['workbench_id'])) TEA('700', 'workbench_id');
//            $has = $this->isExisted([['id', '=', $value['workbench_id']]], config('alias.rwb'));
//            if (!$has) TEA('700', 'workbench_id');

            if (empty($value['factory_id'])) TEA('700', 'factory_id');
            $has = $this->isExisted([['id', '=', $value['factory_id']]], config('alias.rf'));
            if (!$has) TEA('700', 'factory_id');

            if (empty($value['send_depot'])) TEA(700, 'send_depot');

            foreach ($value['materials'] as $key => &$material) {

                if (!isset($material['sum_demand_qty'])) TEA(700, 'sum_demand_qty');
                if ($material['sum_demand_qty'] == 0) {
                    unset($value['materials'][$key]);
                    continue;
                }

                if (empty($material['material_id'])) TEA('700', 'material_id');
                $obj = DB::table(config('alias.rm'))
                    ->select(['id', 'item_no as material_code'])
                    ->where('id', $material['material_id'])
                    ->first();
                if (!isset($obj->material_code) || $obj->material_code != $material['material_code']) TEA('700', 'material_id');

                if (empty($material['demand_unit_id'])) TEA('700', 'demand_unit_id');    // 此unit_id 是bom_unit_id
                $has = $this->isExisted([['id', '=', $material['demand_unit_id']]], config('alias.ruu'));
                if (!$has) TEA('700', 'demand_unit_id');

                foreach ($material['mrs'] as &$mr) {

//                    if (!isset($mr['sum_demand_qty'])) TEA(700, 'sum_demand_qty');
//                    if ($mr['sum_demand_qty'] == 0) {
//                        unset($material['mrs'][$key]);
//                        continue;
//                    }

                    if (empty($mr['demand_unit_id'])) TEA('700', 'demand_unit_id');    // 此unit_id 是bom_unit_id
                    $has = $this->isExisted([['id', '=', $mr['demand_unit_id']]], config('alias.ruu'));
                    if (!$has) TEA('700', 'demand_unit_id');

                    if (empty($mr['material_requisition_id'])) TEA('700', 'material_requisition_id');
                    $has = $this->isExisted([['id', '=', $mr['material_requisition_id']]], config('alias.rmr'));
                    if (!$has) TEA('700', 'material_requisition_id');

                    if (empty($mr['item_id'])) TEA('700', 'item_id');
                    $has = $this->isExisted([['id', '=', $mr['item_id']]], config('alias.rmri'));
                    if (!$has) TEA('700', 'item_id');
                }
            }
        }
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }
//endregion

//region 增

    /**
     * 生成一个新的 单号
     * @return string
     */
    public function createNewCode()
    {
        return 'MC' . date('ymdHis') . rand(100000, 999999);
    }

    /**
     * @param $input
     */
    public function store(&$input)
    {
        $insertArr = [];
        foreach ($input['data'] as $value) {
            $keyVal = [
                'code' => $this->createNewCode(),
                'line_depot_id' => $value['line_depot_id'],
                'send_depot' => $value['send_depot'],
                'factory_id' => $value['factory_id'],
                'workbench_id' => get_value_or_default($value, 'workbench_id', 0),
                'employee_id' => $input['employee_id'],
                'creator_id' => $input['creator_id'],
                'ctime' => time(),
                'mtime' => time(),
                'status' => 1
            ];
            $material_combine_id = DB::table($this->table)->insertGetId($keyVal);

            $i = 1;
            foreach ($value['materials'] as $key => $material) {
                $subitemKeyVal = [
                    'material_id' => $material['material_id'],
                    'material_code' => $material['material_code'],
                    'inspur_material_code' => get_value_or_default($material, 'inspur_material_code', ''),
//                    'sale_order_code' => get_value_or_default($material, 'sale_order_code', ''),
//                    'sale_order_project_code' => get_value_or_default($material, 'sale_order_project_code', ''),
                    'sum_demand_qty' => $material['sum_demand_qty'],
                    'demand_unit_id' => $material['demand_unit_id'],
                    'is_special_stock' => get_value_or_default($material, '$material', ''),
                    'line_project_code' => str_pad($i, 5, '0', STR_PAD_LEFT),
                    'material_combine_id' => $material_combine_id,
                ];
                $i++;

                $subitemID = DB::table(config('alias.rmcs'))->insertGetId($subitemKeyVal);
                foreach ($material['mrs'] as $mr) {
                    $mrKeyVal = [
                        'material_combine_id' => $material_combine_id,
                        'subitem_id' => $subitemID,
                        'material_requisition_id' => $mr['material_requisition_id'],
                        'inspur_sales_order_code' => get_value_or_default($mr, 'inspur_sales_order_code', ''),
                        'item_id' => $mr['item_id'],
                        'demand_qty' => $mr['demand_qty'],
                        'demand_unit_id' => $mr['demand_unit_id'],
                    ];
                    $insertArr[] = $mrKeyVal;
                }
            }
        }
        DB::table(config('alias.rmcsi'))->insert($insertArr);
    }
//endregion

//region 删

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function cancel($input)
    {
        if (empty($input[$this->apiPrimaryKey])) {
            TEA(700, $this->apiPrimaryKey);
        }
        $has_existed = $this->isExisted([
            ['status', '=', 1],
            ['id','=',$input[$this->apiPrimaryKey]]
        ]);
        if (!$has_existed) {
            TEA(2650);
        }

        try{
            DB::beginTransaction();
            DB::table(config('alias.rmcsi').' as rmcsi')
                ->leftJoin($this->table.' as rmco','rmco.id','=','rmcsi.material_combine_id')
                ->where([
                    ['rmcsi.material_combine_id', $input[$this->apiPrimaryKey]],
                    ['rmco.status','=',1]
                ])
                ->delete();
            DB::table(config('alias.rmcs') . ' as rmcs')
                ->leftJoin($this->table . ' as rmco', 'rmco.id', '=', 'rmcs.material_combine_id')
                ->where([
                    ['rmcs.material_combine_id', $input[$this->apiPrimaryKey]],
                    ['rmco.status', '=', 1]
                ])
                ->delete();
            DB::table($this->table)->where([['id', $input[$this->apiPrimaryKey]],['status','=','1']])->delete();
        }catch (\Exception $e){
            DB::rollBack();
            TEA(2651);
        }
        DB::commit();

//        DB::table($this->table . ' as rmco')
//            ->leftJoin(config('alias.rmcs') . ' as rmcs', 'rmcs.material_combine_id.', '=', 'rmco.id')
//            ->leftJoin(config('alias.rmcsi') . ' as rmcsi', 'rmcsi.material_combine_id', '=', 'rmco.id')
//            ->where([
//                ['rmco.id','=',$input[$this->apiPrimaryKey]],
//                ['rmco.status','=',1]
//
//            ])
//            ->delete();
    }
//endregion

//region 改
    /**
     * @param $input
     * @param $status
     * @throws \App\Exceptions\ApiException
     */
    public function updateStatus($input, $status)
    {
        if (empty($input['mc_id'])) TEA(700, 'mc_id');
        DB::table($this->table)->where('id', $input['mc_id'])->update(['status' => $status]);

        //如果更改的状态是 实发(2),则需要同步更新其下的所有领料单的状态
        if ($status == 2) {
            $objs = DB::table(config('alias.rmco') . ' as rmco')
                ->leftJoin(config('alias.rmcsi') . ' as rmcsi', 'rmcsi.material_combine_id', '=', 'rmco.id')
                ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmcsi.material_requisition_id')
                ->select([
                    'rmr.id'
                ])
                ->where([
                    ['rmr.status', '=', 1],
                    ['rmco.id', '=', $input['mc_id']],
                ])
                ->get();
            $MRIDArr = [];
            foreach ($objs as $obj) {
                $MRIDArr[] = $obj->id;
            }
            !empty($MRIDArr) && DB::table(config('alias.rmr'))->whereIn('id', $MRIDArr)->update(['status' => 2]);
        }
    }

    /**
     * 实发
     *
     * @param $input
     * @throws \App\Exceptions\ApiSapException
     */
    public function updateResult($input)
    {
        $mcOrder = $input['LLDH'];  //合并领料单号
        $lineProjectOrder = $input['LLHH'];     //行项目号
        $items = $input['ITEMS'];

        $materialCodeIDArr = [];    //物料CODE数组
        $keyValArr = [];            //将要插入 rmcsi表的数组
        $MR_IDs = [];               //领料单ID
        $rmcs_IDs = [];     //rmcs表的ID,用于更新 物料已发送的字段

        $rmco_id = 0;   //合并领料单ID

        $objs = DB::table($this->table . ' as rmco')
            ->leftJoin(config('alias.rmcs') . ' as rmcs', 'rmcs.material_combine_id', '=', 'rmco.id')
            ->leftJoin(config('alias.rmcsi') . ' as rmcsi', 'rmcsi.subitem_id', '=', 'rmcs.id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmcsi.demand_unit_id')
            ->select([
                'rmco.id as rmco_id',
                'rmcs.id as rmcs_id',
                'rmcs.material_id',
                'rmcs.material_code',
                'rmcsi.material_requisition_id',
                'rmcsi.item_id',
                'rmcsi.demand_qty',
                'rmcsi.demand_unit_id',
                'ruu.commercial as unit'
            ])
            ->where([
                ['rmco.code', '=', $mcOrder],
                ['rmcs.line_project_code', '=', $lineProjectOrder],
                ['rmco.status', '=', 2],
                ['rmcs.is_finished', '=', 0]
            ])
            ->get();
        foreach ($objs as $obj) {
            $rmcs_IDs[] = $obj->rmcs_id;
            empty($rmco_id) && $rmco_id = $obj->rmco_id;
            $materialCodeIDArr[$obj->material_code] = [
                'id' => $obj->material_id,
                'unit_id' => $obj->demand_unit_id
            ];
            $MR_IDs[$obj->material_requisition_id] = $obj->material_requisition_id;
        }

        foreach ($items as &$item) {
            if (!isset($item['MATNR'])) {
                TESAP(2428);
            }
            $item['MATNR'] = ltrim($item['MATNR'], '0');
            //判断物料是否存在
            if (!isset($materialCodeIDArr[$item['MATNR']])) {
                TESAP(2428);
            }
            $bomUnitArr = $this->baseUnitToBomUnit(
                $materialCodeIDArr[$item['MATNR']]['id'],
                $item['MEINS'],
                $item['MATQTY'],
                $materialCodeIDArr[$item['MATNR']]['unit_id']
            );
            $item['bom_qty'] = $bomUnitArr['bom_qty'];
            $item['bom_unit_id'] = $bomUnitArr['bom_unit_id'];
        }
        $i = 1;
        foreach ($objs as $obj) {
            foreach ($items as $key => &$item) {
//                $temp_qty = 0;
//                if ($item['bom_qty'] <= 0) {
//                  unset($items[$key]);
//                 continue;
//                }
                if ($item['bom_qty'] >= $obj->demand_qty) {
                    $temp_qty = $obj->demand_qty;
                    $obj->demand_qty = 0;
                    $item['bom_qty'] -= $obj->demand_qty;

                } else {
                    $temp_qty = $item['bom_qty'];
                    $obj->demand_qty -= $item['bom_qty'];
                    $item['bom_qty'] = 0;
                }
                $keyVal = [
                    'material_requisition_id' => $obj->material_requisition_id,
                    'item_id' => $obj->item_id,
                    'order' => str_pad($i++, 5, '0', STR_PAD_LEFT),
                    'batch' => $item['BATCH'],
                    'actual_send_qty' => $temp_qty,
                    'bom_unit_id' => $item['bom_unit_id'],
                    'base_unit' => $item['MEINS']
                ];
                $keyValArr[] = $keyVal;
                if ($item['bom_qty'] == 0) {    //当前批次不够用,继续下一个批次
                    continue;
                } else {      //当前批次够用，继续下一个物料
                    break;
                }
            }
        }

        /**
         * 把剩余的料都分给 最后一个订单
         */
        foreach ($items as &$_item) {
            $lastKeyVal = array_pop($keyValArr);
            if ($_item['bom_qty'] == 0) {
                continue;
            }

            if ($_item['BATCH'] == $lastKeyVal['batch']) {
                $lastKeyVal['actual_send_qty'] += $_item['bom_qty'];
                array_pop($keyValArr);
                $keyValArr[] = $lastKeyVal;
            } else {
                $lastKeyVal['batch'] = $_item['BATCH'];
                $lastKeyVal['actual_send_qty'] = $_item['bom_qty'];
                $keyValArr[] = $lastKeyVal;
            }
        }

        //插入
        DB::table(config('alias.rmrib'))->insert($keyValArr);

        /**
         * 判断 领料单是否为最后一次领料
         * 如果是，则更新状态
         */
        $MRModel = new MaterialRequisition();
        foreach ($MR_IDs as $MR_ID) {
            if ($MRModel->checkIsLastSend($MR_ID)) {
                DB::table(config('alias.rmr'))->where('id', $MR_ID)->update(['status' => 3]);
            }
        }

        // 更新 子项，表明 该物料SAP已发料
        DB::table(config('alias.rmcs'))->whereIn('id', array_unique($rmcs_IDs))->update(['is_finished' => 1]);

        /**
         * 查询 当前 合并领料单，尚未完成发货的物料(子项)个数。
         * 如果为 0, 则表示 当前合并领料单 已完成发料,需要更新主表状态为 3
         */
        $count = DB::table(config('alias.rmco') . ' as rmco')
            ->leftJoin(config('alias.rmcs') . ' as rmcs', 'rmcs.material_combine_id', '=', 'rmco.id')
            ->where([
                ['rmco.id', '=', $rmco_id],
                ['rmcs.is_finished', '=', 0]
            ])
            ->count();
        if (!$count) {
            // 更新 状态 为待入库
            DB::table($this->table)->where('code', $mcOrder)->update(['status' => 3]);
        }
    }
//endregion

//region 查

    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function showCreateData(&$input)
    {
        if (empty($input['material_requisition_ids'])) {
            TEA(700, 'material_requisition_ids');
        }
        $idArr = explode(',', $input['material_requisition_ids']);
        foreach ($idArr as $key => $id) {
            $has = DB::table(config('alias.rmr'))
                ->select(['id', 'status', 'push_type', 'type'])
                ->where('id', $id)
                ->first();
            if (empty($has)) {
                TEA(700, 'material_requisition_ids');
            }

            // 如果不是 待推送的SAP领料，则去除这个领料单
            if (!($has->type == 1 && $has->push_type == 1 && $has->status == 1)) {
                TEA(2495);
            }
        }

        $where = [
            ['rmr.status', '=', 1],
            ['rmr.type', '=', 1],
            ['rmr.push_type', '=', 1],
            ['rwo.on_off', '=', 1],
            ['rwo.is_delete', '=', 0]
        ];

        $objList = DB::table(config('alias.rmr') . ' as rmr')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
//            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmri.demand_unit_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->select([
                'rwo.id as work_order_id',
                'rmr.work_order_id',
                'rmr.id as material_requisition_id',
                'rmr.code as material_requisition_code',
                'rmr.sale_order_code',
                'rmr.sale_order_project_code',
                'rmr.send_depot',
                'rmr.inspur_sales_order_code',

                'rmr.factory_id',
                'rf.name as factory_name',
                'rf.code as factory_code',

                'rwb.id as workbench_id',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',

                'rmri.id as item_id',

                'rmri.material_id',
                'rmri.material_code',
                'rm.name as material_name',
                'rmri.inspur_material_code',

                'rmri.demand_qty',
                'rmri.demand_unit_id',
                'ruu.commercial as demand_unit',

                'rmr.line_depot_id',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',

                'rmri.is_special_stock',
//                'rpo.inspur_sales_order_code',        //rmr表 添加冗余字段
            ])
            ->where($where)
            ->whereIn('rmr.id', explode(',', $input['material_requisition_ids']))
            ->get();
        $lists = obj2array($objList);

        $headerArr = [];
        $materialsArr = [];
        foreach ($lists as $list) {

            if (empty($headerArr[$list['send_depot']])) {
                $headerArr[$list['send_depot']] = [
                    'factory_id' => $list['factory_id'],
                    'factory_name' => $list['factory_name'],
                    'factory_code' => $list['factory_code'],
                    'send_depot' => $list['send_depot'],
                    'line_depot_id' => $list['line_depot_id'],
                    'line_depot_code' => $list['line_depot_code'],
                    'line_depot_name' => $list['line_depot_name'],
                    'workbench_id' => $list['workbench_id'],
                    'workbench_code' => $list['workbench_code'],
                    'workbench_name' => $list['workbench_name'],
                ];
            }

            if (empty($materialsArr[$list['material_id']])) {
                $materials = [
                    'material_id' => $list['material_id'],
                    'material_code' => $list['material_code'],
                    'material_name' => $list['material_name'],
                    'demand_unit_id' => $list['demand_unit_id'],
                    'demand_unit' => $list['demand_unit'],
                    'is_special_stock' => $list['is_special_stock'],
                    'send_depot' => $list['send_depot'],
//                    'sale_order_code' => $list['sale_order_code'],        //废弃字段
//                    'sale_order_project_code' => $list['sale_order_project_code'],    //废弃字段
                    'inspur_material_code' => $list['inspur_material_code'],

                ];
//                $materials = $list;
                $materials['sum_demand_qty'] = 0;
                $materialsArr[$list['material_id']] = $materials;
            }
            $materialsArr[$list['material_id']]['sum_demand_qty'] += $list['demand_qty'];
            $materialsArr[$list['material_id']]['mrs'][] = [
                'sale_order_code' => $list['sale_order_code'],
                'sale_order_project_code' => $list['sale_order_project_code'],
                'material_requisition_id' => $list['material_requisition_id'],
                'material_requisition_code' => $list['material_requisition_code'],
                'inspur_sales_order_code' => $list['inspur_sales_order_code'],
                'item_id' => $list['item_id'],
                'demand_qty' => $list['demand_qty'],
                'demand_unit_id' => $list['demand_unit_id'],
            ];
        }

        /**
         * 根据采购仓库(发料地点)拆单
         */
        $depotArr = [];
        foreach ($materialsArr as $value) {
            if (empty($depotArr[$value['send_depot']])) {
//                $depots = [
//                    'factory_id' => $value['factory_id'],
//                    'factory_name' => $value['factory_name'],
//                    'factory_code' => $value['factory_code'],
//                    'send_depot' => $value['send_depot'],
//                    'line_depot_id' => $value['line_depot_id'],
//                    'line_depot_code' => $value['line_depot_code'],
//                    'line_depot_name' => $value['line_depot_name'],
//                    'workbench_id' => $value['workbench_id'],
//                    'workbench_code' => $value['workbench_code'],
//                    'workbench_name' => $value['workbench_name'],
//                ];
                $depots = isset($headerArr[$value['send_depot']]) ? $headerArr[$value['send_depot']] : [];
                $depotArr[$value['send_depot']] = $depots;
            }
            $depotArr[$value['send_depot']]['materials'][] = $value;
        }

        return array_values($depotArr);
    }

    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getPushData($input)
    {
        if (empty($input['mc_id'])) TEA(700, 'mc_id');
        $objList = DB::table($this->table . ' as rmco')
            ->leftJoin(config('alias.rmcs') . ' as rmcs', 'rmcs.material_combine_id', '=', 'rmco.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmco.factory_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmco.line_depot_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmco.employee_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmcs.material_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmco.workbench_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmcs.demand_unit_id')
            ->select([
                'rmco.code as mc_code',
                'rmco.send_depot',
                'rmco.ctime as time',
                'rmcs.line_project_code',

                'rmcs.is_special_stock',
                'rmcs.material_id',
                'rmcs.material_code',
                'rm.name as material_name',
                'rmcs.sum_demand_qty',

                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rsd.code as line_depot_code',
                'ruu_d.id as bom_unit_id',
                'ruu_d.commercial as demand_unit', // bom单位
            ])
            ->where('rmco.id', $input['mc_id'])
            ->get();
        if (empty(obj2array($objList))) {
            TEA('2432');    // 不允许推送或已推送
        }
        $sendData = [];
        foreach ($objList as $obj) {

            $baseUnitArr = $this->bomUnitToBaseUnit($obj->material_id, $obj->bom_unit_id, $obj->sum_demand_qty);
            $temp = [
                'LLDH' => $obj->mc_code,
                'LLHH' => $obj->line_project_code,
                'LLLX' => 'ZY01',
                'RQDAT' => date('Ymd', time()),    //领料到货时间
                'LLRQ' => date('Ymd', $obj->time),
                'LLSJ' => date('His', $obj->time),
                'LLR' => $obj->employee_name,
                'WERKS' => $obj->factory_code,
                'XNBK' => $obj->line_depot_code,     //需求线边库
                'GONGW' => empty($obj->workbench_code) ? '' : $obj->workbench_code,
                'GONGD' => '',
                'FCKCDD' => $obj->send_depot,     //发出库存地点
                'AUFNR' => '',      //VSFZCZ--PO
                'KDAUF' => $obj->is_special_stock == 'E' ? $obj->sale_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $obj->is_special_stock == 'E' ? $obj->sale_order_project_code : '',    //销售订单项目
                'MATNR' => $obj->material_code,
                'MAKTX' => $obj->material_name,
                'XQSL' => $baseUnitArr['base_qty'],
                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),

                'XTLY' => 1,  //系统来源
//                'SOBKZ' => $value->is_special_stock,  //特殊库存
                'RQTIM'=>date('His',time()),
            ];
            $sendData[] = $temp;
        }
        return $sendData;
    }

    /**
     * 列表
     *
     * @param $input
     * @return mixed
     */
    public function pageIndex(&$input)
    {
        $where = [];
        $builder = DB::table($this->table . ' as rmco')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmco.line_depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmco.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmco.workbench_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmco.employee_id')
            ->select([
                'rmco.id',
                'rmco.code',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
//                'rmcs.line_project_code',
                'rwb.name as workbench_name',
                'rmco.send_depot',
                'rmco.ctime',
                'rmco.status'
            ])
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->forPage($input['page_no'], $input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('rmco.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj) {
            $obj->ctime = date('Y-m-d H:i:s', $obj->ctime);
        }
        return $obj_list;
    }

    /**
     * 获取批量入库的领料单ID
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getBatchInBound($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA(700, $this->apiPrimaryKey);
        $obj = $this->isExisted([['id', '=', $input[$this->apiPrimaryKey]]]);
        if (!$obj) {
            TEA(2424);
        }

        $objs = DB::table($this->table . ' as rmco')
            ->leftJoin(config('alias.rmcsi') . ' as rmcsi', 'rmcsi.material_combine_id', '=', 'rmco.id')
            ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmcsi.material_requisition_id')
            ->select([
                'rmr.id as rmr_id',
            ])
            ->where([
                ['rmco.status', '=', 3],
                ['rmr.status', '=', 3],
                ['rmr.type', '=', 1],
                ['rmr.push_type', '=', 1],
                ['rmco.id', '=', $input[$this->apiPrimaryKey]]
            ])
            ->get();
        $rmrIDArr = [];
        foreach ($objs as $obj) {
            $rmrIDArr[$obj->rmr_id] = $obj->rmr_id;
        }
        $rmrIDArr = array_values($rmrIDArr);
        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['status' => 5]);
        return $rmrIDArr;
    }

    /**
     * @param $input
     * @return array|mixed
     * @throws \App\Exceptions\ApiException
     */
    public function show($input)
    {
        if (empty($input[$this->apiPrimaryKey])) {
            TEA(700, json_encode($input));
        }
        $objs = DB::table(config('alias.rmco') . ' as rmco')
            ->leftJoin(config('alias.rmcs') . ' as rmcs', 'rmcs.material_combine_id', '=', 'rmco.id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmco.line_depot_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmco.workbench_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmco.factory_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmco.employee_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmcs.demand_unit_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmcs.material_id')
            ->select([
                'rmco.id as ' . $this->apiPrimaryKey,
                'rmco.send_depot',
                'rmco.code',
                'rmco.ctime',
                'rmco.status',

                'rsd.id as line_depot_id',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',

                're.id as employee_id',
                're.name as employee_name',

                'rf.id as factory_id',
                'rf.name as factory_name',
                'rf.code as factory_code',

                'rm.id as material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',

                'rwb.id as workbench_id',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',

                'ruu_d.commercial as demand_unit',

                'rmcs.id as rmcs_id',
                'rmcs.sale_order_code',
                'rmcs.sale_order_project_code',
                'rmcs.sum_demand_qty',
                'rmcs.is_special_stock',
                'rmcs.line_project_code'

            ])
            ->where('rmco.id', $input[$this->apiPrimaryKey])
            ->get();

        $list = obj2array($objs);
        $header = [];
        foreach ($list as &$value) {
            if (empty($header)) {
                $header = [
                    'material_combine_id' => $value['material_combine_id'],
                    'code' => $value['code'],
                    'send_depot' => $value['send_depot'],
                    'ctime' => empty($value['ctime']) ? '' : date('Y-m-d H:i:s', $value['ctime']),
                    'employee_name' => $value['employee_name'],
                    'employee_id' => $value['employee_id'],

                    'factory_id' => $value['factory_id'],
                    'factory_name' => $value['factory_name'],
                    'factory_code' => $value['factory_code'],

                    'workbench_id' => $value['workbench_id'],
                    'workbench_code' => $value['workbench_code'],
                    'workbench_name' => $value['workbench_name'],

                    'line_depot_id' => $value['line_depot_id'],
                    'line_depot_code' => $value['line_depot_code'],
                    'line_depot_name' => $value['line_depot_name'],

                    'status' => $value['status'],
                ];
            }


            $objs = DB::table(config('alias.rtnomc'))
                ->select('old_code')
                ->where('new_code', $value['material_code'])
                ->get();

            $inspurMaterialCodeArr = [];
            foreach ($objs as $obj) {
                $inspurMaterialCodeArr[] = $obj->old_code;
            }
            $value['old_material_code'] = implode(',', $inspurMaterialCodeArr);
            $objs = DB::table(config('alias.rmcsi') . ' as rmcsi')
                ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmcsi.material_requisition_id')
                ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
                ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmcsi.demand_unit_id')
                ->select([
                    'rmcsi.demand_qty',

                    'ruu_d.commercial as demand_unit',

                    'rmr.code as material_requisition_code',
                    'rmr.sale_order_code',
                    'rmr.sale_order_project_code',
                    'rpo.inspur_sales_order_code'
                ])
                ->where([
                    ['rmcsi.material_combine_id', '=', $value['material_combine_id']],
                    ['rmcsi.subitem_id', '=', $value['rmcs_id']],

                ])
                ->get();

            foreach ($header as $k => $v) {
                unset($value[$k]);
            }
            $value['items'] = obj2array($objs);
        }

        $header['lists'] = $list;
        return $header;
    }


    /**
     * @param $id
     * @return array
     */
    public function getMRID($id)
    {
        $objs = DB::table(config('alias.rmco') . ' as rmco')
            ->leftJoin(config('alias.rmcsi') . ' as rmcsi', 'rmcsi.material_combine_id', '=', 'rmco.id')
            ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmcsi.material_requisition_id')
            ->select([
                'rmr.id'
            ])
            ->where([
                ['rmco.id', '=', $id],
                ['rmco.status', '=', 2],
                ['rmr.status', '=', 2],
                ['rmr.type', '=', 1],
                ['rmr.push_type', '=', 1]
            ])
            ->get();
        $IDArr = [];
        foreach ($objs as $obj) {
            $IDArr[$obj->id] = $obj->id;
        }
        return array_values($IDArr);
    }
//endregion

    /**
     * @param $material_id
     * @param $base_unit
     * @param $qty
     * @param $bom_unit_id
     * @return array
     * @throws \App\Exceptions\ApiSapException
     */
    private function baseUnitToBomUnit($material_id, $base_unit, $qty, $bom_unit_id)
    {
        $unit_obj = DB::table(config('alias.ruu'))
            ->select('id')
            ->where('commercial', $base_unit)
            ->first();
        if (empty($unit_obj)) {
            TESAP('700', 'MEINS');
        }

        $Units = new Units();
        $bom_qty = $Units->getExchangeUnitValueById($unit_obj->id, $bom_unit_id, $qty, $material_id);
        if (empty($bom_qty)) {
            TESAP('2433');
        }
        return ['bom_qty' => $bom_qty, 'bom_unit_id' => $bom_unit_id];
    }

    /**
     * @param $material_id
     * @param $bom_unit_id
     * @param $qty
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    private function bomUnitToBaseUnit($material_id, $bom_unit_id, $qty)
    {
        $material_obj = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rm.unit_id')
            ->select(['rm.unit_id as base_unit_id', 'ruu.commercial as base_unit'])
            ->where('rm.id', $material_id)
            ->first();
        if (empty($material_obj)) {
            TEA('2433');
        }
        $Units = new Units();
        $base_qty = $Units->getExchangeUnitValueById($bom_unit_id, $material_obj->base_unit_id, $qty, $material_id);
        if (empty($base_qty)) {
            TEA('2433');
        }
        return ['base_qty' => ceil_dot($base_qty, 1), 'base_unit_id' => $material_obj->base_unit_id, 'base_unit' => $material_obj->base_unit];
    }


}