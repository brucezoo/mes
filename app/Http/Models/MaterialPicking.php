<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/16 20:36
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class MaterialPicking extends Base
{
    public $apiPrimaryKey = 'material_requisition_id';
    protected $itemTable;
    private $mrCode = [];

    public function __construct()
    {
        parent::__construct();
        empty($this->table) && $this->table = config('alias.rmr');
        $this->itemTable = config('alias.rmri');
    }

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkStoreParams(&$input)
    {
        $input['type'] = 1;
        $input['push_type'] = 1;
        $input['is_depot_picking'] = 1;

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', '=', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        if (empty($input['workbench_id'])) TEA('700', 'workbench_id');
        $has = $this->isExisted([['id', '=', $input['workbench_id']]], config('alias.rwb'));
        if (!$has) TEA('700', 'workbench_id');

        if (empty($input['rank_plan_type_id'])) TEA('700', 'rank_plan_type_id');
        $has = $this->isExisted([['id', '=', $input['rank_plan_type_id']]], config('alias.rrpt'));
        if (!$has) TEA('700', 'rank_plan_type_id');

        if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
        $has = $this->isExisted([['id', '=', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('700', 'line_depot_id');

        if (empty($input['plan_time'])) TEA(700, 'plan_time');

        if (empty($input['employee_id'])) TEA('700', 'employee_id');
        $has = $this->isExisted([['id', '=', $input['employee_id']]], config('alias.re'));
        if (!$has) TEA('700', 'employee_id');

        foreach ($input['materials'] as $key => &$value) {
            if (empty($value['material_id'])) TEA('700', 'material_id');
            if (empty($value['material_code'])) TEA('700', 'material_code');
            $count = DB::table(config('alias.rm'))
                ->where([['id', $value['material_id']], ['item_no', '=', $value['material_code']]])
                ->count();
            if (!$count) TEA('700', 'material_id');

            if (empty($value['demand_qty'])) TEA(700, 'demand_qty');

            if (empty($value['unit_id'])) TEA('700', 'unit_id');
            $has = $this->isExisted([['id', '=', $value['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            $obj = DB::table(config('alias.ramc') . ' as ramc')
                ->leftJoin(config('alias.rf') . ' as rf', 'rf.code', '=', 'ramc.WERKS')
                ->select(['ramc.LGFSB', 'ramc.LGPRO'])
                ->where([
                    ['ramc.material_id', '=', $value['material_id']],
                    ['rf.id', '=', $input['factory_id']]
                ])
                ->first();
            $value['send_depot'] = '';
            if (!empty($obj)) {
                $value['send_depot'] = !empty($obj->LGFSB) ? $obj->LGFSB : $obj->LGPRO;
            }
            if (empty($value['send_depot'])) {
                $value['send_depot'] = get_value_or_default($input, 'depot_code');
            }
        }

        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 生成领料单号
     *
     * @param int $type
     * @return string
     */
    public function createCode($type = 1)
    {
        $timeStr = date('ymdHis');
        $code = 'MP' . $type . $timeStr . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        while (in_array($code, $this->mrCode)) {
            $code = 'MP' . $type . $timeStr . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        }
        ($this->mrCode)[] = $code;
        return $code;
    }

    /**
     * 获取一个新的领料单号
     *
     * @param int $type
     * @return string
     */
    public function getNewCode($type = 1)
    {
        $code = $this->createCode($type);
        $obj = DB::table($this->table)->select(['code'])->where('code', $code)->first();
        while (!empty($obj)) {
            $code = $this->createCode($type);
            $obj = DB::table($this->table)->where('code', $code)->select('code')->first();
        }
        return $code;
    }

    /**
     * 生成一个行项目号
     *
     * @param $i
     * @return string
     */
    public function createLineCode($i)
    {
        if (count($i) > 5) {
            return rand(10000, 99999);
        }
        return str_pad($i, 5, '0', STR_PAD_LEFT);
    }

    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        $keyVal = [
            'type' => $input['type'],
            'push_type' => $input['push_type'],
            'factory_id' => $input['factory_id'],
            'line_depot_id' => $input['line_depot_id'],
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => $input['push_type'] ?: 3,   // 如果SAP领料，状态为1,;mes领料状态为3
            'creator_id' => $input['creator_id'],
            'plan_start_time' => strtotime($input['plan_time']),
            'is_depot_picking' => 1,
            'is_delete' => 0,
        ];

        $depotItemsArr = [];
        $iArr = []; // 用于生成行项目号
        foreach ($input['materials'] as $key => $value) {
            $sendDepot = $value['send_depot'];
            !isset($iArr[$sendDepot]) && $iArr[$sendDepot] = 1;
            // item表数据数组
            $tempItemArr = [
                'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                'material_id' => $value['material_id'],
                'material_code' => $value['material_code'],
                'demand_qty' => ceil_dot($value['demand_qty'], 1),
                'demand_unit_id' => $value['unit_id'],  //此为 bom_unit_id
                'is_special_stock' => get_value_or_default($value, 'special_stock', ''),
                'send_status' => 1,
                'reason' => get_value_or_default($value, 'reason', ''),
                'remark' => get_value_or_default($value, 'remark', ''),
                'custom_inspur_sale_order_code' => get_value_or_default($value, 'custom_inspur_sale_order_code', ''),
                'inspur_material_code' => get_value_or_default($value, 'old_material_code', ''),
            ];
            $depotItemsArr[$sendDepot][] = $tempItemArr;
            $iArr[$sendDepot]++;
        }

        /**
         * @var array $mrKeyValArr 组装数据 顶层数组
         */
        $mrKeyValArr = [];
        foreach ($depotItemsArr as $sendDepot => $depotItem) {
            $keyVal['code'] = $this->getNewCode($input['type']);    //生产领料单
            $keyVal['send_depot'] = $sendDepot;
            $keyVal['items'] = $depotItem;
            $mrKeyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();

            // 遍历 插入mr表
            foreach ($mrKeyValArr as $mr) {
                $itemsArr = $mr['items'];
                unset($mr['items']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    unset($item['batchArr']);
                    $item['material_requisition_id'] = $mr_id;
                    DB::table($this->itemTable)->insertGetId($item);  //插入 item表
                }
            }
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420', $e->getMessage());
        }
        DB::connection()->commit();
        return $mrIDArr;
    }

}