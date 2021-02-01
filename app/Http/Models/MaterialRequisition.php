<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/5 14:08
 * Desc:
 */

namespace App\Http\Models;


use App\Http\Models\Picking\WorkShopPicking;
use App\Libraries\Soap;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Models\MergerReturnMaterial;
use App\Http\Models\OutMachineZy;
use App\Libraries\Trace;

class MaterialRequisition extends Base
{
    public $apiPrimaryKey = 'material_requisition_id';
    protected $itemTable;
    protected $ZyTable;
    protected $ZyItemTable;
    private $mrCode = [];

    public function __construct()
    {
        !$this->table && $this->table = config('alias.rmr');
        $this->itemTable = config('alias.rmri');

        $this->ZyTable = 'ruis_out_machine_zxxx_order';
        $this->ZyItemTable = 'ruis_out_machine_zxxx_order_item';

    }
//region 检

    /**
     * 验证 领补料参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input)
    {
        if (empty($input['type']) || !is_numeric($input['type']) || $input['type'] > 9) TEA('700', 'type');
        if (!isset($input['push_type']) || ($input['push_type'] != 0 && $input['push_type'] != 1)) TEA('700', 'push_type');

        //领料单不可以重复开

        //如果是SAP领料，并且尚未完成领料，则拒绝
        if ($input['type'] == 1 && $input['push_type'] == 1) {
//            $obj = DB::table($this->table)
//                ->where([
//                    ['work_order_id', '=', $input['work_order_id']],
//                    ['type', '=', 1],
//                    ['push_type', '=', 1],
//                    ['status', '<>', 4],
//                    ['is_delete', '=', 0],
//                ])
//                ->count();

            // 查询领料记录表,查询是否有未完成订单 shuaijie.feng 5.20/2019
            $obj = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.push_type', '=', 1],
                    ['rmr.status', '<>', 4],
                    ['rmr.is_delete', '=', 0],
                ])
                ->count();
            if ($obj) TEA('2410');
        }

        //判断工单是否参与合并领料 是 拒绝 Add By Bruce.Chu
//        $has_merge=$this->isExisted([['work_order_id',$input['work_order_id']]],config('alias.rmre'));
//        if($has_merge) TEA('2414');
        //未插入关系表的工单 做下面判断 是 拒绝 Add By Bruce.Chu
//        $old_has_merge=$this->isExisted([['id',$input['work_order_id']],['is_sap_picking',1]],config('alias.rwo'));
//        if($old_has_merge) TEA('2414');

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', '=', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        // 判断 不是补料就要验证需要填写责任人   qc需求  7.10/2019 shuaijie.feng
        if($input['type'] != 7 && $input['push_type'] != 1){
            if (empty($input['employee_id'])) TEA('700','请输入责任人！');
            $has = $this->isExisted([['id', '=', $input['employee_id']]], config('alias.re'));
            if (!$has) TEA('700', 'employee_id');
        }

        // 非mes定额领料才有 line_depot_id
        if ($input['push_type'] != 0) {
            if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
            $has = $this->isExisted([['id', '=', $input['line_depot_id']]], config('alias.rsd'));
            if (!$has) TEA('700', 'line_depot_id');
        }

//        if (empty($input['send_depot_id'])) TEA('700', 'send_depot_id');
//        $has = $this->isExisted([['id', '=', $input['send_depot_id']]], config('alias.rsd'));
//        if (!$has) TEA('700', 'send_depot_id');

//        if (empty($input['workbench_id'])) TEA('700', 'workbench_id');
//        $has = $this->isExisted([['id', '=', $input['workbench_id']]], config('alias.rwb'));
//        if (!$has) TEA('700', 'workbench_id');

        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        // 验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');

        if (empty($input['materials']) || is_array($input['materials']) || trim($input['materials']) == '[]') TEA('700', 'materials');
        $input['materials'] = json_decode($input['materials'], true);
        $materialQtyArr = [];
        foreach ($input['materials'] as $key => &$value) {
            if (empty($value['material_id'])) TEA('700', 'material_id');
            $obj = DB::table(config('alias.rm'))
                ->select(['id', 'item_no as material_code'])
                ->where('id', $value['material_id'])
                ->first();
            if (!isset($obj->material_code)) TEA('700', 'material_id');

            //虚拟进料 无需领料
            if ($obj->material_code == '99999999') {
                unset($input['materials'][$key]);
                continue;
            }
            $value['material_code'] = $obj->material_code;

            if (empty($value['unit_id'])) TEA('700', 'unit_id');    // 此unit_id 是bom_unit_id
            $has = $this->isExisted([['id', '=', $value['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            // 非mes领料，有发出库存地点
            if ($input['push_type'] != 0) {
                if (!isset($value['send_depot'])) TEA('700', 'send_depot');
                // 判断是否为特出类型的物料，发料地点的值用生产库存地点代替
//                $is_butao = $this->checkIsButao($value['material_id']);
//                if (empty($value['send_depot']) || $is_butao) {
//                    if (!isset($value['produce_depot'])) TEA('700', 'produce_depot');
//                    $value['send_depot'] = $value['produce_depot'];
//                }
                // 获取仓储地点,如果前端传输有采购仓储则取采购仓储，没有采购仓储则取生产仓储 shuaijie.feng 5.16/2019
                if(empty($value['send_depot'])){
                    $value['send_depot'] = $value['produce_depot'];
                }
                if(empty($value['send_depot']) && empty($value['produce_depot'])) TEPA('请填入采购仓储或者生产仓储！！！');
                $senddepot = DB::table('mbh_deport')->where([['factory_id',$input['factory_id']],['deport',$value['send_depot']]])->select('id')->first();
                if(empty($senddepot)){
                    TEPA('您填写的仓储地和工厂不匹配，请检查修改后，再提交！');
                }
               
            }

            /**
             * 向mes领料，使用 rated_qty 定额总数
             * 其他，使用 demand_qty 需求总数
             */
            if ($input['push_type'] == 0) {
                empty($value['rated_qty']) && TEA('700', 'rated_qty');
            } else {
                //如果为SAP领料也会有额定数量(即WO的计划数量)
                $input['push_type'] == 1 && $input['type'] == 1 && empty($value['rated_qty']) && TEA('700', 'rated_qty');
                empty($value['demand_qty']) && TEA('700', '请输入要领取数量!');
            }

            // 统计物料需求数量
            if ($input['type'] == 1 && $input['push_type'] == 1) {
                $stmt_teturn = [];
                $stmt_teturn = DB::table($this->table.' as rmr')
                    ->leftJoin(config('alias.rrmr').' as rrmr','rrmr.material_requisition_id','rmr.id')
                    ->where([
                        ['rrmr.work_order_id', '=', $input['work_order_id']],
                        ['rmr.type', '=', 2],
                        ['rmr.is_delete', '=', 0],
                        ['rmr.push_type', '=', 1],
                        ['rrmr.material_id',$value['material_id']],
                    ])
                    ->addSelect(DB::raw('SUM(rrmr.qty) as sum'))
                    ->first();
                if (bccomp(($value['demand_qty']-$stmt_teturn->sum), $value['rated_qty'], 3) > 0) TEA(2411, json_encode($value));
                if (!empty($materialQtyArr[$value['material_id']])) {
                    $materialQtyArr[$value['material_id']]['demand_qty'] += $value['demand_qty'];
                } else {
                    $materialQtyArr[$value['material_id']] = [
                        'rated_qty' => $value['rated_qty'],
                        'demand_qty' => $value['demand_qty']
                    ];
                }
            }

            if ($input['type'] == 7) {
                empty($value['rated_qty']) && TEA('700', 'rated_qty');
                $value['reason'] = get_value_or_default($value, 'reason', '');
                $preselectionIDArr = explode(',', $value['reason']);
                foreach ($preselectionIDArr as $preselectionID) {
                    $has = $this->isExisted([['id', trim($preselectionID)]], config('alias.rps'));
                    if (!$has) TEA(700, '请选择原因!!');
                }
            }

            // 只有 mes领料的时候 才有批次
            if ($input['push_type'] == 0) {
                if (empty($value['batches'])) TEA('700', 'batches');
                $batch_qty_sum = 0;
                foreach ($value['batches'] as &$batch) {
                    if (!isset($batch['batch'])) TEA('700', 'batch');
                    // 验证库存地点
                    if (empty($batch['depot_id'])) TEA('700', 'depot_id');
                    $has = $this->isExisted([['id', '=', $batch['depot_id']]], config('alias.rsd'));
                    if (!$has) TEA('700', 'depot_id');

                    //验证单位
                    if (empty($batch['unit_id'])) TEA('700', 'unit_id');
                    $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.ruu'));
                    if (!$has) TEA('700', 'batch unit_id');

                    //验证库存id
                    if (empty($batch['inve_id'])) TEA('700', 'inve_id');
                    $has = $this->isExisted([['id', '=', $batch['inve_id']]], config('alias.rsi'));
                    if (!$has) TEA('700', 'inve_id');

                    // 累加 计算定额总数
                    empty($batch['batch_qty']) && TEA('700', 'batch_qty');
                    $batch_qty_sum += $batch['batch_qty'];
                }
                /**
                 * @TODO 先让流程走下去
                 */
//                if (bccomp($batch_qty_sum ,$value['rated_qty'],3)) {
//                    TEA('2429', '物料：' . $value['material_code'] . ',定额总数为' . $value['rated_qty'] . ',需求总数为' . $batch_qty_sum);
//                }
            }
        }
        // SAP领料： 遍历当前领料是否超额
        if ($input['type'] == 1 && $input['push_type'] == 1) {
            foreach ($materialQtyArr as $material_id => $m) {
                $stmt_teturn = [];
                $stmt_teturn = DB::table($this->table.' as rmr')
                    ->leftJoin(config('alias.rrmr').' as rrmr','rrmr.material_requisition_id','rmr.id')
                    ->where([
                        ['rrmr.work_order_id', '=', $input['work_order_id']],
                        ['rmr.type', '=', 2],
                        ['rmr.is_delete', '=', 0],
                        ['rmr.push_type', '=', 1],
                        ['rrmr.material_id',$material_id],
                    ])
                    ->addSelect(DB::raw('SUM(rrmr.qty) as sum'))
                    ->first();
                if (bccomp(($m['demand_qty']-$stmt_teturn->sum), $m['rated_qty'], 3) > 0) TEA(2411, json_encode($m));
                $obj = DB::table($this->table . ' as rmr')
                    ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                    ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                    ->where([
                        ['rmr.work_order_id', '=', $input['work_order_id']],
                        ['rmr.type', '=', 1],
                        ['rmr.push_type', '=', 1],
                        ['rmr.status', '=', 4],
                        ['rmr.is_delete', '=', 0],
                        ['rmri.material_id', '=', $material_id]
                    ])
                    ->sum('rmrib.actual_receive_qty');
                if (bccomp(($obj-$stmt_teturn->sum), $m['rated_qty'], 3) > 0)

                    TEA(2411, json_encode(['sum_demand_qty' => $obj + $m['demand_qty'], 'rated_qty' => $m['rated_qty']]));
            }
        }
        /**
         *  增加限制 没有细排产  不能开领料单
         *  缝纫车间可以领料 返工订单可以领料
         *  shuaijie.feng   update  6.21/2019
         */
        $work_order = DB::table(config('alias.rwo').' as rwo')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','=','rwo.production_order_id')
            ->where([
                ['rwo.id',$input['work_order_id']],
                ['rwo.is_delete',0]
            ])
            ->select('rwo.status','rwo.work_shop_id','rpo.number')
            ->first();
        $number = substr($work_order->number,0,2);
        if($work_order->status !=2 && $work_order->work_shop_id != 13 && $number != '19'){
            TEPA('没有细排产，不能领料！');
        }

        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 检验 领料单 子项 当前可领的数量
     *
     * 可领的数量 = WO里面总的数量 - 已被领取的数量
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function checkItemNumber($input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');

        // 验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);

        if (empty($input['material_id'])) TEA('700', 'material_id');
        $obj = DB::table(config('alias.rwo'))->select(['in_material'])->where('id', '=', $input['work_order_id'])->first();
        if (!isset($obj->in_material)) {
            TEA('700', 'work_order_id');
        }
        if (empty($obj->in_material)) {
            TEA('2482');
        }
        $temp = [];
        try {
            $temp = json_decode($obj->in_material, true);
        } catch (\Exception $e) {
            TEA('700', 'work_order_id');
        }
        $qty = 0; // WO带出的物料总的数量
        foreach ($temp as $key => $value) {
            if ($value['material_id'] == $input['material_id']) {
                $qty = $value['qty'];
                break;
            }
        }

        if ($qty == 0) {
            return ['qty' => 0];
        }

        /**
         * 查询已被领取的数量
         * 只查 类型为领料的数据
         */
        $mr_obj = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->select(['rmri.demand_qty'])
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmri.material_id', '=', $input['material_id']]
            ])
            ->get();
        $lq_qty = 0;    //已经被领取的数量
        foreach ($mr_obj as $k => $v) {
            if (is_numeric($v->demand_qty)) {
                $lq_qty += $v->demand_qty;
            }
        }

        /**
         * @var int $kl_qty 可领取的数量
         */
        if ($qty < $lq_qty) {
            $kl_qty = 0;
        } else {
            $kl_qty = $qty - $lq_qty;
        }

        return ['qty' => $kl_qty, 'lq_qty' => $lq_qty];
    }

    /**
     * 根据 wo 获取 PO
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function getProductOrder(&$input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');

        $wo_obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->select(['rpo.number', 'rpo.id','rpo.sales_order_code','rpo.sales_order_project_code'])
            ->where('rwo.id', $input['work_order_id'])
            ->first();
        if (empty($wo_obj) || !isset($wo_obj->number)) {
            TEA('2427');
        }
        $input['product_order_code'] = $wo_obj->number;
        $input['product_order_id'] = $wo_obj->id;
        $input['sales_order_code'] = $wo_obj->sales_order_code;
        $input['sales_order_project_code'] = $wo_obj->sales_order_project_code;
    }

    /**
     * 验证库存数量
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkStorage($input)
    {
        /**
         * @var array $materialArr 物料需求数量数组
         *   key=>物料ID, value=>需求数量
         */
        $materialArr = [];
        $material_ID_arr = [];
        foreach ($input['materials'] as $value) {
            $materialArr[$value['material_id']] = $value['demand_qty'];
            $material_ID_arr[] = $value['material_id'];
        }
        $obj_lists = DB::table(config('alias.rsi'))
            ->select(['material_id', 'storage_validate_quantity as storage_number'])
            ->where([['depot_id', '=', $input['line_depot_id']], ['po_number', '=', $input['product_order_code']]])
            ->whereIn('material_id', $material_ID_arr)
            ->get();
        $arr_lists = obj2array($obj_lists);

        /**
         * 获取不到数据 或者 数据条目和物料数目不同，也意味着线边库余量不足
         */
        if ($input['push_type'] == 0) {
            //mes
            if (empty($arr_lists) || count($material_ID_arr) != count($arr_lists)) {
                TEA('2426');        //线边库余量不足
            }
        } else if ($input['push_type'] == 1) {
            //sap
        }


        /**
         * @var array $storage_arr 物料库存数组
         *   (key=>物料ID，value=>库存数量)
         */
        $storage_arr = [];
        foreach ($arr_lists as $value) {
            $storage_arr[$value['material_id']] = $value['storage_number'];
        }
        foreach ($materialArr as $key => $value) {
            if ($input['push_type'] == 0) {
                // 如果该物料需求数量 大于 库存数量 则提示余量不足
                if (!isset($storage_arr[$key]) || $value > $storage_arr[$key]) {
                    TEA('2426');        //线边库余量不足
                }
            } else if ($input['push_type'] == 1) {
                //sap
            }
        }
    }

    /**
     * 验证是否允许生成退料单
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkReturnMaterial($input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('9500');

//        $has = $this->isExisted([
//            ['work_order_id', '=', $input['work_order_id']],
//            ['status', '=', 4],
//            ['type', '=', 1],
//            ['push_type', '=', 1],
//            ['is_delete', '=', 0],
//        ]);
//        if (!$has) TEA('2431');  // 尚未完成领料单

        $has=DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmre.material_requisition_id')
            ->where([
                ['rmre.work_order_id',$input['work_order_id']],
                ['rmr.status', '<>', 4],
                ['rmr.type', '=', 1],
                ['rmr.push_type', '=', 1],
                ['rmr.is_delete', '=', 0]
            ])
            ->distinct('rmre.material_requisition_id')
            ->get(['rmre.material_requisition_id'])
            ->count();
        if ($has) TEA('2431');  // 尚未完成领料单 Modify By Bruce.Chu

        $has = $this->isExisted([
            ['work_order_id', '=', $input['work_order_id']],
            ['type', '=', 2],
            ['push_type', '=', 1],
            ['status', '<>', 4],
            ['is_delete', '=', 0],
        ]);
        if ($has) TEA('2410');  // 有未完成的退料单，请先完成

        //验证是否已创建退料单
//        $has = $this->isExisted([
//            ['type', '=', 2],
//            ['push_type', '=', 1],
//            ['work_order_id', '=', $input['work_order_id']]
//        ]);
//        if ($has) TEA('2430');  // 补料单已重复创建
    }


    /**
     * 验证 生成退料单参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkStoreReturnMaterialParams(&$input)
    {
        if (empty($input['product_order_id'])) TEA('700', 'product_order_id');
        if (empty($input['product_order_code'])) TEA('700', 'product_order_code');
        $has = $this->isExisted([['id', '=', $input['product_order_id']], ['number', '=', $input['product_order_code']]], config('alias.rpo'));
        if (!$has) TEA('700', 'product_order_id');

        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');

        // 如果当前有存在退料单尚未完成，则禁止操作
        $obj = DB::table($this->table)
            ->where([
                ['work_order_id', '=', $input['work_order_id']],
                ['type', '=', 2],
                ['push_type', '=', 1],
                ['is_delete', '=', 0],
                ['status', '<>', 4]
            ])
            ->count();
        if ($obj) TEA('2410');

        //如果 参数line_depot_id 存在异常，说明该工单对应的车间 没有维护线边仓
        if (empty($input['line_depot_id'])) TEA('2412', 'line_depot_id');
        if (empty($input['line_depot_code'])) TEA('2412', 'line_depot_code');
        $has = $this->isExisted([['id', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('2412', 'line_depot_id');

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        /**
         * 判断是否为特殊库存
         * 原理：
         * 如果为特殊库存，则WO.in_material.special_stock 为E
         */
        $woObj = DB::table(config('alias.rwo'))
            ->select([
                'in_material'
            ])
            ->where('id', '=', $input['work_order_id'])
            ->first();
        $materialSpecialStockArr = [];
        $inMaterialStr = empty($woObj) ? '[]' : $woObj->in_material;
        $inMaterialArr = json_decode($inMaterialStr, true);
        //invalid argument supplied for foreach() Modify By Bruce.Chu
        if(is_array($inMaterialArr)) foreach ($inMaterialArr as $m) {
            // 如果物料ID 字段和 特殊库存字段都在，则放入临时数组，供下面使用
            isset($m['material_id']) && isset($m['special_stock']) && $materialSpecialStockArr[$m['material_id']] = $m['special_stock'];
        }
        unset($woObj, $inMaterialArr, $inMaterialStr);

        if (empty($input['items'])) TEA('700', 'items');
        foreach ($input['items'] as $k => &$item) {
            //如果batches为空，表示当前无退料，需要跳过。
            if (empty($item['batches'])) {
                unset($input['items'][$k]);
                continue;
            }

            if (empty($item['material_id'])) TEA('700', 'material_id');
            if (empty($item['material_code'])) TEA('700', 'material_code');
            $has = $this->isExisted([['id', $item['material_id']], ['item_no', $item['material_code']]], config('alias.rm'));
            if (!$has) TEA('700', 'material_id');

            /**
             * 查询是否为特殊库存
             */
            $item['special_stock'] = isset($materialSpecialStockArr[$item['material_id']]) ? $materialSpecialStockArr[$item['material_id']] : '';

//            if (!isset($item['send_depot'])) TEA('700', 'send_depot');
//            $is_butao = $this->checkIsButao($item['material_id']);
//            if ($is_butao) {
//                if (empty($item['produce_depot'])) TEA('700', 'produce_depot');
//                $item['send_depot'] = $item['produce_depot'];
//            }

            foreach ($item['batches'] as $batch) {
                if (!isset($batch['storage_number'])) TEA('700', 'storage_number');
                if (!isset($batch['return_number'])) TEA('700', 'return_number');
                if (!isset($batch['batch'])) TEA('700', 'batch');

                if (empty($batch['inve_id'])) TEA('700', 'inve_id');
                $has = $this->isExisted([['id', '=', $batch['inve_id']]], config('alias.rsi'));
                if (!$has) TEA('700', 'inve_id');
//                if (empty($batch['unit_id'])) TEA('700', 'unit_id');
//                $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.rsd'));
//                if (!$has) TEA('700', 'unit_id');
            }
        }
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 验证物料分类是不是布套
     *
     * @param $material_id
     * @return bool
     */
    public function checkIsButao($material_id)
    {
        // 如果物料id为空 false
        if (empty($material_id)) {
            return false;
        }

        $categoryObj = DB::table(config('alias.rm'))
            ->select(['material_category_id'])
            ->where('id', $material_id)
            ->first();
        // 获取失败 false
        if (empty($categoryObj) || empty($categoryObj->material_category_id)) {
            return false;
        }

        return $this->checkMaterialCategoryIsInArray($categoryObj->material_category_id, config('app.material_category', []));
    }

    /**
     * 验证 物料分类ID以及父级ID 是否在给定的数组内
     *
     * @param int $category_id
     * @param array $inArray
     * @return bool
     */
    private function checkMaterialCategoryIsInArray($category_id, $inArray = [])
    {
        // 如果 为空直接返回
        if (empty($inArray) || !is_array($inArray)) {
            return false;
        }
        if (in_array($category_id, $inArray)) {
            return true;
        }
        // 设置flag，默认 false，如果找到则为 true
        $flag = false;
        $obj = DB::table(config('alias.rmc'))->select('parent_id')->where('id', $category_id)->first();
        while (!empty($obj)) {
            if (in_array($obj->parent_id, $inArray)) {
                $flag = true;
                break;
            }
            $obj = DB::table(config('alias.rmc'))->select('parent_id')->where('id', $obj->parent_id)->first();
        }
        return $flag;
    }

    /**
     * 验证 齐料检测(是否允许向mes领料)的参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkAppLyMesParams(&$input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        $wo_obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->select(['rwo.id', 'rpo.number as product_order_code'])
            ->where([['rwo.id', '=', $input['work_order_id']]])
            ->first();
        if (empty($wo_obj)) TEA('700', 'work_order_id');
//        $input['product_order_code'] = $wo_obj->product_order_code;

        $input['sale_order_code'] = empty($input['sale_order_code']) ? '' : $input['sale_order_code'];

        if (empty($input['materials'])) TEA('700', 'materials');
        foreach ($input['materials'] as &$material) {
            if (empty($material['material_id'])) TEA('700', 'material_id');
            $exist = $this->isExisted([['id', '=', $material['material_id']]], config('alias.rm'));
            if (!$exist) TEA('700', 'material_id');
            if (empty($material['qty'])) TEA('700', 'qty');
        }
    }

    /**
     * 验证是否允许向mes领料
     *
     * 条件：
     * 1.尚未进行额定领料
     * 2.线边库满足WO下面的物料库存
     * @param array $input
     * @return boolean
     */
    public function checkApplyMes($input)
    {
        // 1.查询 额定领料单是否存在
        $rmr_obj = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->select([
                'rmr.sale_order_code',
                'rmr.product_order_code',
                'rwo.number as work_order_code'
            ])
            ->where([
                ['rmr.type', '=', 1],
                ['is_delete', '=', 0],
                ['rmr.push_type', '=', 0],
                ['rmr.work_order_id', '=', $input['work_order_id']]
            ])
            ->first();
        if (empty($rmr_obj)) {
            return false;
        }


        // 2. 判断 库存 >? 额定数
        /**
         * @var array $material_ID_Arr 查询实时库存的whereIn的material_id条件的值
         * @var array $lineDepot_ID_Arr 查询实时库存的whereIn的line_depot_id条件的值
         */
        $material_ID_Arr = [];
        if (empty($input['materials'])) {
            return false;
        }
        foreach ($input['materials'] as $material) {
            $material_ID_Arr[] = $material['material_id'];
        }

        /**
         * 先根据SO,PO,WO查实时库存，然后再根据SO查出的结果取交集
         */
        $input['sale_order_code'] = $rmr_obj->sale_order_code;
        $input['product_order_code'] = $rmr_obj->product_order_code;
        $input['work_order_code'] = $rmr_obj->work_order_code;
        $input['material_id_arr'] = $material_ID_Arr;

        /**
         * @todo 流转品查询的时候 PO SO WO 均为空 12.09
         */
        $objs = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.material_id',
            ])
            ->addSelect(DB::raw('SUM(rsi.storage_validate_quantity) as storage_number'))
            ->where(function ($query) use ($input) {
                $query->where([
                    ['rsi.sale_order_code', '=', $input['sale_order_code']],
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ])
                    ->orWhere([
                        ['rm.lzp_identity_card', '<>', ''],
                        ['rsi.sale_order_code', '=', ''],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
            ->where('rsi.sale_order_code', '=', $input['sale_order_code'])
            ->whereIn('rsi.material_id', $input['material_id_arr'])
            ->groupBy('rsi.material_id', 'rsi.lot', 'rsi.depot_id')
            ->get();

//        // 构造查询实时库存
//        $objs = DB::table(config('alias.rsi'))
//            ->select([
//                'material_id',
//                'storage_validate_quantity as storage_number',
//                'depot_id as line_depot_id'
//            ])
//            ->where([['sale_order_code', '=', $input['sale_order_code']]])
//            ->whereIn('material_id', $material_ID_Arr)
//            ->get();
        // 遍历查询结果 拼接成 key 为line_depot_id _ material_id的数组
        $storageArr = [];
        foreach ($objs as $obj) {
            $storageArr[$obj->material_id] = obj2array($obj);
        }

        //遍历进料数组，判断每一个物料的实时库存是否满足额定值
        foreach ($input['materials'] as $material) {
            $storageNumber = empty($storageArr[$material['material_id']]) ? 0 :
                $storageNumber = $storageArr[$material['material_id']]['storage_number'];
            // 如果 实时库存小于额定值，则返回 false
            if ($storageNumber < $material['qty']) {
                return false;
            }
        }
        // 如果以上判断都通过，则返回成功
        return true;
    }


    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkShopParams(&$input)
    {
        if (empty($input['type']) || !in_array($input['type'], [1, 2, 7])) TEA('700', 'type');

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', '=', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        if (empty($input['employee_id'])) TEA('700', 'employee_id');
        $has = $this->isExisted([['id', '=', $input['employee_id']]], config('alias.re'));
        if (!$has) TEA('700', 'employee_id');

        if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
        $has = $this->isExisted([['id', '=', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('700', 'line_depot_id');

//        if (empty($input['workbench_id'])) TEA('700', 'workbench_id');
//        $has = $this->isExisted([['id', '=', $input['workbench_id']]], config('alias.rwb'));
//        if (!$has) TEA('700', 'workbench_id');

        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']], ['number', '=', $input['wo_number']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');
        $input['work_order_code'] = $input['wo_number'];

        $wo_obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->select(['rpo.number', 'rpo.id'])
            ->where('rwo.id', $input['work_order_id'])
            ->first();
        if (empty($wo_obj) || !isset($wo_obj->number)) {
            TEA('2427');
        }
        $input['product_order_code'] = $wo_obj->number;
        $input['product_order_id'] = $wo_obj->id;

        if (empty($input['materials']) || !is_array($input['materials'])) TEA('700', 'materials');
        foreach ($input['materials'] as $key => &$value) {
            if (empty($value['material_id'])) TEA('700', 'material_id');
            $obj = DB::table(config('alias.rm'))
                ->select(['id', 'item_no as material_code'])
                ->where('id', $value['material_id'])
                ->first();
            if (!isset($obj->material_code)) TEA('700', 'material_id');
            //虚拟进料 无需领料
            if ($obj->material_code == '99999999') {
                unset($input['materials'][$key]);
                continue;
            }
            $value['material_code'] = $obj->material_code;

            if (empty($value['unit_id'])) TEA('700', 'unit_id');    // 此unit_id 是bom_unit_id
            $has = $this->isExisted([['id', '=', $value['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            if ($input['type'] == 7) {
                $value['reason'] = get_value_or_default($value, 'reason', '');
                $preselectionIDArr = explode(',', $value['reason']);
                foreach ($preselectionIDArr as $preselectionID) {
                    $has = $this->isExisted([['id', trim($preselectionID)]], config('alias.rps'));
                    if (!$has) TEA(700, 'reason');
                }
            }

            if (empty($value['demand_qty'])) TEA('700', 'demand_qty');
//            $input['type'] == 7 && empty($value['rated_qty']) && TEA('700', 'rated_qty');

            if (empty($value['batches'])) TEA('700', 'batches');
            $batch_qty_sum = 0;
            foreach ($value['batches'] as &$batch) {
                if (!isset($batch['batch'])) TEA('700', 'batch');
                // 验证库存地点
                if (empty($batch['depot_id'])) TEPA('上道未报工');
                $has = $this->isExisted([['id', '=', $batch['depot_id']]], config('alias.rsd'));
                if (!$has) TEA('700', 'depot_id');

                //验证单位
                if (empty($batch['unit_id'])) TEA('700', 'unit_id');
                $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.ruu'));
                if (!$has) TEA('700', 'batch unit_id');

                //验证库存id
                if (empty($batch['inve_id'])) TEA('700', 'inve_id');
                $has = $this->isExisted([['id', '=', $batch['inve_id']]], config('alias.rsi'));
                if (!$has) TEA('700', 'inve_id');

                // 累加 计算定额总数
                empty($batch['batch_qty']) && TEA('700', 'batch_qty');
                $batch_qty_sum += $batch['batch_qty'];
            }
            /**
             *  增加限制 没有细排产  不能开领料单
             *  缝纫车间可以领料 返工订单可以领料
             *  shuaijie.feng   update  6.21/2019
             */
            $work_order = DB::table(config('alias.rwo').' as rwo')
                ->leftJoin(config('alias.rpo').' as rpo','rpo.id','=','rwo.production_order_id')
                ->where([
                    ['rwo.id',$input['work_order_id']],
                    ['rwo.is_delete',0]
                ])
                ->select('rwo.status','rwo.work_shop_id','rpo.number')
                ->first();
            $number = substr($work_order->number,0,2);
            if($work_order->status !=2 && $work_order->work_shop_id != 13 && $number != '19'){
                TEPA('没有细排产，不能领料！');
            }
//            if ($input['type'] == 1 && bccomp($batch_qty_sum, $value['demand_qty'], 3)) {
//                TEA('2429', '物料：' . $value['material_code'] . ',定额总数为' . $value['demand_qty'] . ',需求总数为' . $batch_qty_sum);
//            }
        }

        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 验证是否允许生成车间退料单
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkShopReturnMaterial($input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('9500');

        $has = $this->isExisted([
            ['work_order_id', '=', $input['work_order_id']],
            ['status', '=', 4],
            ['type', '=', 1],
            ['push_type', '=', 2],
        ]);
        //  增加合并车间领料
        $has1 = $this->isExisted([
            ['work_order_id', '=', $input['work_order_id']],
        ],'ruis_material_received');
        if (!$has && !$has1) TEA('2431');  // 尚未完成领料单

        // 退料 可以重复创建 shuaijie.feng 6.1/2019
        //验证是否已创建退料单
//        $has = $this->isExisted([
//            ['type', '=', 2],
//            ['push_type', '=', 2],
//            ['work_order_id', '=', $input['work_order_id']]
//        ]);
//        if ($has) TEA('2430');  // 退料单已重复创建
    }

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkStopReturnParams(&$input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');

        if (empty($input['batches'])) TEA('700', 'batches');
        foreach ($input['batches'] as &$batch) {
            if (!isset($batch['return_qty'])) TEA('700', 'return_qty');

            //如果退料数量为 0 or负数，则跳过
            if ($batch['return_qty'] <= 0) {
                continue;
            }

            if (!isset($batch['batch'])) TEA('700', 'batch');
            // 验证上个车间库存地点
            if (empty($batch['origin_depot_id'])) TEA('700', 'origin_depot_id');
            $has = $this->isExisted([['id', '=', $batch['origin_depot_id']]], config('alias.rsd'));
            if (!$has) TEA('700', 'origin_depot_id');

            //验证单位
            if (empty($batch['unit_id'])) TEA('700', 'unit_id');
            $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            if (empty($batch['material_id'])) TEA('700', 'material_id');
            $obj = DB::table(config('alias.rm'))
                ->select(['id', 'item_no as material_code'])
                ->where('id', $batch['material_id'])
                ->first();
            if (!isset($obj->material_code)) TEA('700', 'material_id');
            $batch['material_code'] = $obj->material_code;

            //验证库存id
            if (empty($batch['inve_id'])) TEA('700', 'inve_id');
            $inve_obj = DB::table(config('alias.rsi'))
                ->select([
                    'id',
                    'storage_validate_quantity as storage_number',
                ])
                ->where('id', $batch['inve_id'])
                ->first();
            if (empty($inve_obj) || $inve_obj->storage_number < $batch['return_qty']) TEA('700', 'inve_id');
        }
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 验证 SAP发料是否为最后一次
     *
     * @param int $material_requisition_id
     * @return bool
     */
    public function checkIsLastSend($material_requisition_id)
    {
        if (empty($material_requisition_id)) return false;
        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->select([
                'rmr.id as rmr_id',
                'rmri.id as rmri_id',
                'rmrib.id as rmrib_id'
            ])
            ->where([
                ['rmr.is_delete', '=', 0],
                ['rmr.id', '=', $material_requisition_id],
                ['rmri.item_is_delete','<>','1'],  // 增加 行项是否删除  1:被删除   0:未删除
            ])
            ->get();
        if (empty(obj2array($obj_list))) {
            return false;
        }

        /**
         * 判断 是否为最后一次发料。
         *
         * 原理：
         * 默认为最后一次，
         * 如果物料对应的批次表的ID 不存在/空/NULL，则不是最后一次
         */
        $flag = true;
        foreach ($obj_list as $obj) {
            if (!isset($obj->rmrib_id) || empty($obj->rmrib_id) || is_null($obj->rmrib_id)) {
                $flag = false;
                break;
            }
        }
        return $flag;
    }

    /**
     * 验证 是否为退料最后一次更新实收数量
     *
     * @param $material_requisition_id
     * @return bool
     */
    public function checkIsLastReturn($material_requisition_id)
    {
        if (empty($material_requisition_id)) return false;
        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.material_requisition_id', '=', 'rmr.id')
            ->select([
                'rmr.id as rmr_id',
                'rmrib.id as rmrib_id',
                'rmrib.actual_send_qty',
                'rmrib.actual_receive_qty',
            ])
            ->where([
                ['rmr.is_delete', '=', 0],
                ['rmr.id', '=', $material_requisition_id]
            ])
            ->get();
        if (empty(obj2array($obj_list))) {
            return false;
        }

        /**
         * 判断 是否为最后一次实收
         *
         * 原理：
         * 如果物料对应的批次表，其实收数量为 空/NULL/0 ，则不是最后一次
         */
        $flag = true;
        foreach ($obj_list as $obj) {
            if (empty($obj->actual_receive_qty) || is_null($obj->actual_receive_qty) || $obj->actual_receive_qty == 0) {
                $flag = false;
                break;
            }
        }
        return $flag;
    }

    /**
     * 判断当前工单是否被锁定
     *
     * @param $work_order_id
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkOrderLock($work_order_id)
    {
        $obj = DB::table(config('alias.rwo'))
            ->select([
                'on_off',   // 0->锁定; 1->正常
                'number as work_order_code'
            ])
            ->where([
                ['id', '=', $work_order_id],
                ['is_delete', '=', 0],
            ])
            ->first();
        if (empty($obj) || empty($obj->on_off)) {
            TEA(2413, 'Line:997');
        }
    }

    /**
     * 判断当前工单是否被锁定（根据领料单ID）
     *
     * @param $material_requisition_id
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkOrderLockByMRID($material_requisition_id)
    {
        $mrObj = DB::table($this->table)
            ->select([
                'is_depot_picking',
                'is_merger_picking'
            ])
            ->where([
                ['id', '=', $material_requisition_id],
            ])
            ->first();
        if (empty($mrObj)) {
            TEA(2421);
        }
        //如果是 库存领料，就不用判断是否工单被锁定了
        if ($mrObj->is_depot_picking == 1 || $mrObj->is_merger_picking == 1) {
            return;
        }

        $obj = DB::table(config('alias.rmr') . ' as rmr')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->select(['rwo.on_off'])
            ->where([
                ['rmr.id', '=', $material_requisition_id],
                ['rmr.is_delete', '=', 0],
                ['rwo.is_delete', '=', 0],
            ])
            ->first();
        if (empty($obj) || empty($obj->on_off)) {
            TEA(2413, 'Line:1019');
        }
    }

    /**
     * 判断当前工单是否被锁定（根据领料单CODE）
     *
     * @param $material_requisition_code
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkOrderLockByMRCode($material_requisition_code)
    {
        $obj = DB::table(config('alias.rmr') . ' as rmr')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->select(['rmr.id'])
            ->where([
                ['rmr.code', '=', $material_requisition_code],
                ['rmr.is_delete', '=', 0],
            ])
            ->where(function ($query) {
                $query->where([
                    ['rwo.is_delete', '=', 0],
                    ['rwo.on_off', '=', 1],
                ])
                    ->orWhere([
                        ['rmr.is_merger_picking', '=', 1]
                    ]);
            })
            ->first();
        if (empty($obj)) {
//            TEA(2413);
        }
    }

    /**
     * 更新补料原因参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkReasonParams(&$input)
    {
        if (empty($input['data'])) {
            TEA(700, 'data');
        }

        $input['auditing_operator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;

        foreach ($input['data'] as &$value) {
            if (empty($value['item_id'])) TEA(700, 'item_id');
            $has = $this->isExisted([['id', '=', $value['item_id']]], $this->itemTable);
            if (!$has) TEA(700, 'item_id');

            if (!empty($value['reason'])) {
                $preselectionIDArr = explode(',', $value['reason']);
                foreach ($preselectionIDArr as $preselectionID) {
                    $has = $this->isExisted([['id', trim($preselectionID)]], config('alias.rps'));
                    if (!$has) TEA(700, 'reason');
                }
            }

        }
    }

    /**
     * 验证是否为库存领料
     *
     * @param $material_requisition_id
     * @return bool
     */
    public function checkIsDepotPicking($material_requisition_id)
    {
        $obj = DB::table($this->table)
            ->select('is_depot_picking')
            ->where('id', $material_requisition_id)
            ->first();
        if (empty($obj)) {
            return false;
        }

        if ($obj->is_depot_picking == 1) {
            return true;
        }
        return false;
    }
//endregion

//region 增

    /**
     * 生成领料单号
     *
     * @param int $type
     * @return string
     */
    public function createCode($type = 1)
    {
        $timeStr = date('YmdHis');
        $code = 'MR' . $type . $timeStr . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        while (in_array($code, $this->mrCode)) {
            $code = 'MR' . $type . $timeStr . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
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
     * 新增领料单
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     */
    public function store($input)
    {
        //如果是额定领料，需要判断是否为首次，否则需拒绝
        if ($input['type'] == 1 && $input['push_type'] == 0) {
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['is_delete', '=', 0],
                    ['push_type', '=', 0]
                ])
                ->count();
           if ($obj) TEA('2488');            
        }
//        // 查询是否加入合并领料
//        $received = DB::table(config('alias.rmre'))
//            ->where([
//                ['work_order_id',$input['work_order_id']]
//            ])
//            ->count();
//        if ($received) TEPA('当前工单参与合并领料');

        // 超能转厂补丁  查询生产订单是否有超能转厂标记  6.27/shuaijie.feng
        $po_data = DB::table(config('alias.rpo'))
            ->where([
                ['id',$input['product_order_id']],
                ['on_off',1],
                ['is_delete',0]
            ])
            ->select([
                'factory_id',// sap字段 工厂id
                'WERKS',    //虚拟工厂
                'WERKS_id', //虚拟工厂id
                'LGORT1',   // 虚拟库存地点（收货）
                'LGORT2',   //半成品和原材料虚拟库存地点（仓库发料）
                'LGORT3',  //车间虚拟库存地点（车间收料）
            ])
            ->first();
        // 获取虚拟仓库的id
        $LGORT3 = DB::table(config('alias.rsd'))->where('code',$po_data->LGORT3)->first();
        // 查询车间的id 区分2108包装车间-床垫or2109包装车间-枕头
        $line_depot = DB::table(config('alias.rsd'))->where('id',$input['line_depot_id'])->first();
        $keyVal = [
            'type' => $input['type'],
            // 超能转厂 使用 po内SAP工厂id  6.28/2019  shuaijie.feng
            'factory_id' => !empty($po_data->WERKS)?$po_data->factory_id:$input['factory_id'],
            // 超能转厂 使用 po内虚拟库存地点（车间收料）  6.27/2019  shuaijie.feng
            'line_depot_id' => !empty($LGORT3)?($po_data->WERKS_id == '12' ?$line_depot->id:$LGORT3->id):get_value_or_default($input, 'line_depot_id', 0),  // 如果为mes领料，则没有线边库
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sales_order_code']) ? '' : $input['sales_order_code'],
            'sale_order_project_code' => empty($input['sales_order_project_code']) ? '' : $input['sales_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => $input['push_type'] ?: 3,   // 如果SAP领料，状态为1,;mes领料状态为3
            'push_type' => $input['push_type'],
            'creator_id' => $input['creator_id'],
            'dispatch_time'=>$input['date']
        ];
        //SAP领料 加入配送时间 Add By Bruce.Chu
        if($input['push_type']==1 && $input['type']==1) $keyVal['dispatch_time']=$input['date'];

        $depotItemsArr = [];
        $iArr = []; // 用于生成行项目号
        foreach ($input['materials'] as $key => $value) {
            /**
             * 1.如果是mes领料，
             */
            if ($input['push_type'] == 0) {
                $tempItemArr = [
//                'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                    'material_id' => $value['material_id'],
                    'material_code' => $value['material_code'],
//                    'demand_qty' => ceil_dot($input['push_type'] ? $value['demand_qty'] : $value['rated_qty'], 1),
                    'demand_qty' => sprintf("%.3f",substr(sprintf("%.4f", $input['push_type'] ? $value['demand_qty'] : $value['rated_qty']), 0, -1)),
                    'rated_qty' => $input['push_type'] == 7 ? ceil_dot($value['rated_qty'], 1) : 0,
                    'demand_unit_id' => $value['unit_id'],  //此为 bom_unit_id
                    'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                    'send_status' => 1,
                    'reason' => get_value_or_default($value, 'reason', ''),
                    'remark' => get_value_or_default($value, 'remark', ''),
//                'batchArr' => $tempBatchArr
                ];
                // 1.遍历 batches
                /**
                 * @var array $temp_depot_arr 根据库存地点，进行分组
                 */
                $temp_depot_arr = [];
                foreach ($value['batches'] as $batch) {
                    // 如果物料为 0，则舍弃
                    if ($batch['batch_qty'] <= 0) {
                        continue;
                    }
                    $temp_depot_arr[$batch['depot_id']][] = $batch;
                }

                //遍历 库存地点分组 数组，封装itemArr
                foreach ($temp_depot_arr as $temp_depot_id => $temp_batch) {
                    !isset($iArr[$temp_depot_id]) && $iArr[$temp_depot_id] = 1;
                    $tempItemArr['line_project_code'] = $this->createLineCode($iArr[$temp_depot_id]);
                    $tempItemArr['depot_id'] = $temp_depot_id;
                    $batchArr = [];
                    $j = 1;
                    foreach ($temp_batch as $t_batch) {
                        $batchArr[] = [
                            'order' => str_pad($j, 5, '0', STR_PAD_LEFT),
                            'batch' => empty($t_batch['batch']) ? '' : $t_batch['batch'],
                            'actual_send_qty' => $t_batch['batch_qty'],
                            'actual_receive_qty' => $t_batch['batch_qty'],  //mes領料不需要填寫實收數據，實收數據為實發數據
                            'bom_unit_id' => $t_batch['unit_id'],
                            'inve_id' => $t_batch['inve_id']
                        ];
                        $j++;
                    }
                    $tempItemArr['batchArr'] = $batchArr;
                    $iArr[$temp_depot_id]++;
                    $depotItemsArr[0][] = $tempItemArr;
                }
            } else {
                // 只有在补料的时候转换关系
                if($input['push_type'] == 1 && $input['type'] == 7){
                    //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
                    $code_pre = substr($value['material_code'], 0,4);
                    if($code_pre == '3002' && $value['unit_id'] == '96'){
                        //获取米／公斤的转换比例
                        $Units = new Units();
                        $base_qty = $Units->getExchangeUnitValueById('135', $value['unit_id'], $value['demand_qty'], $value['material_id']);
                        $format_base_qty = floor($base_qty * 10) / 10;
                        $value['demand_qty'] = $format_base_qty;
                    }
                }
                // 超能转厂 使用 po内虚拟库存地点（仓库发料）  6.27/2019  shuaijie.feng
//                $sendDepot = empty($po_data->WERKS)?$value['send_depot']:$po_data->LGORT2;
                $sendDepot = $value['send_depot'];
                !isset($iArr[$sendDepot]) && $iArr[$sendDepot] = 1;
                // item表数据数组
                $tempItemArr = [
                    'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                    'material_id' => $value['material_id'],
                    'material_code' => $value['material_code'],
//                    'demand_qty' => ceil_dot($input['push_type'] ? $value['demand_qty'] : $value['rated_qty'], 1),
                    'demand_qty' => sprintf("%.3f",substr(sprintf("%.4f", $input['push_type'] ? $value['demand_qty'] : $value['rated_qty']), 0, -1)),
                    'rated_qty' => $input['push_type'] == 7 ? ceil_dot($value['rated_qty'], 1) : 0,
                    'demand_unit_id' => $value['unit_id'],  //此为 bom_unit_id
                    'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                    'send_status' => 1,
                    'reason' => get_value_or_default($value, 'reason', ''),
                    'remark' => get_value_or_default($value, 'remark', ''),
                    'batchArr' => []
                ];
                $depotItemsArr[$sendDepot][] = $tempItemArr;
                $iArr[$sendDepot]++;
            }

        }

        /**
         * @var array $mrKeyValArr 组装数据 顶层数组
         */
        $mrKeyValArr = [];
        foreach ($depotItemsArr as $sendDepot => $depotItem) {
            $keyVal['code'] = $this->getNewCode($input['type']);    //生产领料单
            // 如果为 向SAP领料，则需要 添加send_depot字段
            if ($input['push_type'] == 1) {
//                $keyVal['send_depot'] = $sendDepot;
                $keyVal['send_depot'] = empty($po_data->WERKS)?$sendDepot:$po_data->LGORT2;
            } else {
                $keyVal['send_depot'] = '';
            }
            $keyVal['items'] = $depotItem;
            $mrKeyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        // 插入到RMRE表
        $tempRMREKeyVal = [];
        try {
            DB::connection()->beginTransaction();

            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($mrKeyValArr as $mr) {
                $itemsArr = $mr['items'];
                unset($mr['items']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;
                //如果是普通的SAP领料 则更新 is_sap_picking -->2 (0:不是SAP领料, 1->合并领料, 2->普通SAP领料)
                //更新工单状态 picking_status=>1 领料中 Add By Bruce.Chu
//                if ($mr['push_type'] == 1 && $mr['type'] == 1) {
//                    DB::table(config('alias.rwo'))->where('id', $mr['work_order_id'])->update(['is_sap_picking' => 2,'picking_status'=>1]);
//                }
//                //mes领料 Add By Bruce.Chu
//                if($mr['push_type'] == 0 && $mr['type'] == 1){
//                    DB::table(config('alias.rwo'))->where('id', $mr['work_order_id'])->update(['picking_status'=>1]);
//                }
                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    if($mr['push_type'] == 1 && $mr['type'] == 1){
                        $tempRMREKeyVal[] = [
                            'work_order_id' => $input['work_order_id'],
                            'material_id' => $item['material_id'],
                            'material_code' => $item['material_code'],
                            'unit_id' => $item['demand_unit_id'],
                            'qty' => 0,
                            'rated_qty' => $item['demand_qty'],
                            'material_requisition_id' => $mr_id,
                            'special_stock' => $item['is_special_stock'],
                            'is_merger'=>2,
                            'ctime' => time()
                        ];
                    }

                    $batchArr = $item['batchArr'];
                    unset($item['batchArr']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }

                //更新ruis_qc_check的领料状态
                DB::table(config('alias.rqc'))->where([['VBELN','=', '00' . $mr['sale_order_code']],['VBELP','=', $mr['sale_order_project_code']],['MATNR','like', '%' . $item['material_code']],['check_resource','=',1]])->update(['istop'=>1]);
            }

            //插入合并工单与领料单关系表
            DB::table(config('alias.rmre'))->insert($tempRMREKeyVal);

            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();

        foreach ($mrKeyValArr as $mrs) {
            //如果是普通的SAP领料 则更新 is_sap_picking -->2 (0:不是SAP领料, 1->合并领料, 2->普通SAP领料)
            //更新工单状态 picking_status=>1 领料中 Add By Bruce.Chu
            if ($mrs['push_type'] == 1 && $mrs['type'] == 1) {
//                    DB::table(config('alias.rwo'))->where('id', $mr['work_order_id'])->update(['is_sap_picking' => 2,'picking_status'=>1]);
                $this->updateWork_picking_status($mrs['work_order_id'],['is_sap_picking' => 2,'picking_status'=>1]);
            }
            //mes领料 Add By Bruce.Chu
            if($mrs['push_type'] == 0 && $mrs['type'] == 1){
//                    DB::table(config('alias.rwo'))->where('id', $mr['work_order_id'])->update(['picking_status'=>1]);
                $this->updateWork_picking_status($mrs['work_order_id'],['picking_status'=>1]);
            }
        }
        return $mrIDArr;
    }

    /**
     * 废弃
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function mesStore($input)
    {
        //如果是额定领料，需要判断是否为首次，否则需拒绝
        if ($input['type'] == 1 && $input['push_type'] == 0) {
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['is_delete', '=', 0],
                    ['push_type', '=', 0]
                ])
                ->count();
            if ($obj) TEA('2488');
        }

        $keyVal = [
            'type' => $input['type'],
            'factory_id' => $input['factory_id'],
            'line_depot_id' => $input['line_depot_id'],
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sales_order_code']) ? '' : $input['sales_order_code'],
            'sale_order_project_code' => empty($input['sales_order_project_code']) ? '' : $input['sales_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => $input['push_type'] ?: 3,   // 如果SAP领料，状态为1,;mes领料状态为2
            'push_type' => $input['push_type'],
            'creator_id' => $input['creator_id']
        ];
        $depotItemsArr = [];
        $iArr = []; // 用于生成行项目号
        foreach ($input['materials'] as $key => $value) {
            $sendDepot = $input['push_type'] == 0 ? $input['line_depot_id'] : $value['send_depot'];

            !isset($iArr[$sendDepot]) && $iArr[$sendDepot] = 1;

            /**
             * @var array $tempBatchArr 批次表插入值数组
             */
            $tempBatchArr = [];
            if ($input['push_type'] == 0) {
                $j = 1;  // 用于生成批次表的序号
                foreach ($value['batches'] as $batchItem) {
                    // 如果 为mes领料 则会需要有插入批次表数据
                    if ($input['push_type'] == 0) {
                        $tempBatchArr[] = [
                            'order' => str_pad($j, 5, '0', STR_PAD_LEFT),
                            'batch' => empty($batchItem['batch']) ? '' : $batchItem['batch'],
                            'actual_send_qty' => $batchItem['batch_qty'],
                            'bom_unit_id' => $value['unit_id']
                        ];
                    }
                    $j++;
                }
            }

            // item表数据数组
            $tempItemArr = [
                'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                'material_id' => $value['material_id'],
                'material_code' => $value['material_code'],
                'demand_qty' => ceil_dot($input['push_type'] ? $value['demand_qty'] : $value['rated_qty'], 1),
                'demand_unit_id' => $value['unit_id'],  //此为 bom_unit_id
                'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                'send_status' => 1,
                'batchArr' => $tempBatchArr
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
            // 如果为 向SAP领料，则需要 添加send_depot字段
            if ($input['push_type'] == 1) {
                $keyVal['send_depot'] = $sendDepot;
            } else {
                $keyVal['send_depot'] = '';
            }
            $keyVal['items'] = $depotItem;
            $mrKeyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();

            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($mrKeyValArr as $mr) {
                $itemsArr = $mr['items'];
                unset($mr['items']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    $batchArr = $item['batchArr'];
                    unset($item['batchArr']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }


    /**
     * 生成SAP退料单
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function storeReturnMaterial($input)
    {
        // 超能转厂补丁  查询生产订单是否有超能转厂标记  6.27/shuaijie.feng
        $po_data = DB::table(config('alias.rpo'))
            ->where([
                ['id',$input['product_order_id']],
                ['on_off',1],
                ['is_delete',0]
            ])
            ->select([
                'factory_id',// sap字段 工厂id
                'WERKS',    //虚拟工厂
                'WERKS_id', //虚拟工厂id
                'LGORT1',   // 虚拟库存地点（收货）
                'LGORT2',   //半成品和原材料虚拟库存地点（仓库发料）
                'LGORT3',  //车间虚拟库存地点（车间收料）
            ])
            ->first();
        // 获取虚拟仓库的id
        $LGORT3 = DB::table(config('alias.rsd'))->where('code',$po_data->LGORT3)->first();
        // 查询车间的id 区分2108包装车间-床垫or2109包装车间-枕头
        $line_depot = DB::table(config('alias.rsd'))->where('id',$input['line_depot_id'])->first();
        // 查询Z195 id
        $line_z = DB::table(config('alias.rsd'))->where('code','Z195')->first();
        $keyVal = [
            'type' => 2, //ZY02 车间退料
            // 超能转厂 使用 po内SAP工厂id  6.28/2019  shuaijie.feng
            'factory_id' => !empty($po_data->WERKS)?$po_data->factory_id:$input['factory_id'],
            // 超能转厂 使用 po内虚拟库存地点 （车间收料）  6.27/2019  shuaijie.feng
            'line_depot_id' => !empty($LGORT3)?($po_data->WERKS_id == '12'? $line_depot->id:$LGORT3->id):$input['line_depot_id'],
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sale_order_code']) ? '' : $input['sale_order_code'],
            'sale_order_project_code' => empty($input['sale_order_project_code']) ? '' : $input['sale_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 1,
            'push_type' => 1,   // sap退料
            'creator_id' => $input['creator_id']
        ];
        $depotItemsArr = [];
        $iArr = []; // 用于生成行项目号
        foreach ($input['items'] as $key => $value) {
            //$sendDepot = empty($value['send_depot']) ? '' : !empty($po_data->WERKS)? $po_data->LGORT2:$value['send_depot'];
            $sendDepot = empty($value['send_depot']) ? '' :$value['send_depot'];
            !isset($iArr[$sendDepot]) && $iArr[$sendDepot] = 1;

            /**
             * @var array $tempBatchArr 批次表插入值数组
             */
            $tempBatchArr = [];
            $j = 1;  // 用于生成批次表的序号
            foreach ($value['batches'] as $batchItem) {
                $tempBatchArr[] = [
                    'order' => str_pad($j, 5, '0', STR_PAD_LEFT),
//                    'order' => $this->createLineCode($iArr[$sendDepot]),
                    'batch' => empty($batchItem['batch']) ? '' : $batchItem['batch'],
                    'actual_send_qty' => $batchItem['return_number'],
                    'base_unit' => '',  //基本单位
                    'bom_unit_id' => $batchItem['unit_id'],     // bom单位
                    'inve_id' => $batchItem['inve_id'],     // bom单位
                ];
                $j++;
            }
            // 查询工单用料表，物料是否特殊库存
            $stmt = DB::table(config('alias.rwoi'))
                ->where([
                    ['work_order_id',$input['work_order_id']],
                    ['material_id',$value['material_id']],
                    ['type',0],
                ])
                ->first();
            // item表数据数组
            $tempItemArr = [
                'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                'material_id' => $value['material_id'],
                'material_code' => $value['material_code'],
                'demand_qty' => $input['push_type'] ? $batchItem['return_number'] : $value['rated_qty'],
                'demand_unit_id' => $batchItem['unit_id'],
                'sales_order_code' => empty($input['sale_order_code']) ? '' : $input['sale_order_code'],
                'sales_order_project_code' => empty($input['sale_order_project_code']) ? '' : $input['sale_order_project_code'],
//                'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                'is_special_stock' => empty($stmt)? '':$stmt->special_stock,
                'send_status' => 1,
//                'send_depot' => $value['send_depot'],
                'batchArr' => $tempBatchArr,
                'remark' => isset($batchItem['reason'])?$batchItem['reason']:''
            ];
            $depotItemsArr[$sendDepot][] = $tempItemArr;

            $iArr[$sendDepot]++;
        }

        /**
         * @var array $mrKeyValArr 组装数据 顶层数组
         */
        $mrKeyValArr = [];
        foreach ($depotItemsArr as $sendDepot => $depotItem) {
            $keyVal['code'] = $this->getNewCode(2);    //生成退料单
           // $keyVal['send_depot'] = $sendDepot;
            $keyVal['send_depot']=empty($po_data->WERKS)?$sendDepot:$po_data->LGORT2;

            $keyVal['items'] = $depotItem;
            $mrKeyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();

            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($mrKeyValArr as $mr) {
                $itemsArr = $mr['items'];
                unset($mr['items']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {

                    $batchArr = $item['batchArr'];
                    unset($item['batchArr']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {

                        $tempRMREKeyVal[] = [
                            'push_type'=>1,
                            'work_order_id' => $input['work_order_id'],
                            'material_id' => $item['material_id'],
                            'material_code' => $item['material_code'],
                            'unit_id' => $item['demand_unit_id'],
                            'qty' => 0,
                            'rated_qty' => $batch['actual_send_qty'],
                            'material_requisition_id' => $mr_id,
                            'special_stock' => $item['is_special_stock'],
                            'batch' => $batch['batch'],
                            'is_merger'=>2,
                            'ctime' => time()
                        ];

                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
            // 添加退料记录表
            DB::table(config('alias.rrmr'))->insert($tempRMREKeyVal);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEPA('退料单添加失败！');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }


    /**
     * 生成 车间领/补料订单
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShop($input)
    {
        //如果是额定领料，需要判断是否为首次，否则需拒绝
        if ($input['type'] == 1) {
            // 查询该工单是否有未完成的任务
            $stmt = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['push_type', '=', 2],
                    ['status', '<>', 4],
                    ['is_delete', '=', 0],
                ])
                ->count();
            if ($stmt) TEA('2410');

            // 获取工单内领料数据
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['is_delete', '=', 0],
                    ['push_type', '=', 2]
                ])
                ->get();
            // 不等于0 说明里面已经领过了
            if(count($obj) != 0){
                // 如果是第二次领料 查找他的领料单，获取到领料单 id   根据领料单 查询 item
                foreach ($obj as $k=>$v){
                    $arr[] = DB::table($this->itemTable)
                        ->where('material_requisition_id',$v->id)
                        ->get();
                }
                $stmt_teturn  = [];
                // 获取接收数据的编码id
                foreach ($input['materials'] as $k=>$v){
                    $material_id[] = $v['material_id'];
                    $mate_item[] = DB::table(config('alias.rmr').' as rmr')
                        ->leftJoin(config('alias.rmri').' as rmri','rmri.material_requisition_id','=','rmr.id')
                        ->leftJoin(config('alias.rmrib').' as rmrib','rmri.id','=','rmrib.item_id')
                        ->select([
                            'rmri.material_id',
                            'rmri.material_code',
                            'rmrib.actual_send_qty',
                            'rmrib.actual_receive_qty',
                        ])
                        ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as sum'))
                        ->where([
                            ['rmr.work_order_id',$input['work_order_id']],
                            ['rmr.type',1],
                            ['rmr.push_type',2],
                            ['rmr.is_delete',0],
                            ['rmri.material_id',$material_id[$k]],
                        ])
                        ->get();
                                        // 查询退料单记录表  shuaijie.feng 5.28/2019
                    $stmt_teturn[] = DB::table($this->table.' as rmr')
                        ->leftJoin(config('alias.rrmr').' as rrmr','rrmr.material_requisition_id','rmr.id')
                        ->where([
                            ['rrmr.work_order_id', '=', $input['work_order_id']],
                            ['rmr.type', '=', 2],
                            ['rmr.is_delete', '=', 0],
                            ['rmr.push_type', '=', 2],
                            ['rrmr.material_id',$material_id[$k]]
                        ])
                        ->addSelect(DB::raw('SUM(rrmr.qty) as sum'))
                        ->first();
                }
                foreach ($mate_item as $k=>$v)
                {
                   if (!empty($v[$k]->material_id)){
                       if ($input['materials'][$k]['material_id'] == $v[$k]->material_id){
                           if(($v[$k]->sum - $stmt_teturn[$k]->sum) == $input['materials'][$k]['demand_qty']){
                               TEA('2488');
                           }elseif ($input['materials'][$k]['demand_qty'] < ($v[$k]->sum+$input['materials'][$k]['batches'][$k]['batch_qty'])- $stmt_teturn[$k]->sum){
                               TEA('2429');
                           }
                       }
                   }
                }
            }
        }
//        // 查询是否加入合并领料
//        $received = DB::table(config('alias.rmre'))
//            ->where([
//                ['work_order_id',$input['work_order_id']]
//            ])
//            ->count();
//        if ($received) TEPA('当前工单参与合并领料');

// 超能转厂补丁  查询生产订单是否有超能转厂标记  6.27/shuaijie.feng
        $po_data = DB::table(config('alias.rpo'))
            ->where([
                ['id',$input['product_order_id']],
                ['on_off',1],
                ['is_delete',0]
            ])
            ->select([
                'factory_id',// sap字段 工厂id
                'WERKS',    //虚拟工厂
                'WERKS_id', //虚拟工厂id
                'LGORT1',   // 虚拟库存地点（收货）
                'LGORT2',   //半成品和原材料虚拟库存地点（仓库发料）
                'LGORT3',  //车间虚拟库存地点（车间收料）
            ])
            ->first();
        // 获取虚拟仓库的id
        $LGORT3 = DB::table(config('alias.rsd'))->where('code',$po_data->LGORT3)->first();
        $LGORT2 = DB::table(config('alias.rsd'))->where('code',$po_data->LGORT2)->first();
        // 查询车间的id 区分2108包装车间-床垫or2109包装车间-枕头
        $line_depot = DB::table(config('alias.rsd'))->where('id',$input['line_depot_id'])->first();
        $keyVal = [
            'type' => $input['type'],
            // 超能转厂 使用 po内SAP工厂id  6.28/2019  shuaijie.feng
            'factory_id' => !empty($po_data->WERKS)?$po_data->factory_id:$input['factory_id'],
            // 超能转厂 使用 po内虚拟库存地点 （车间收料）  6.27/2019  shuaijie.feng
            'line_depot_id' => !empty($LGORT3)?($po_data->WERKS_id == '12'? $line_depot->id:$LGORT3->id):$input['line_depot_id'],  // 领补料的需求车间库存地点
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sales_order_code']) ? '' : $input['sales_order_code'],
            'sale_order_project_code' => empty($input['sales_order_project_code']) ? '' : $input['sales_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 2,   // 状态均为2
            'push_type' => 2,   //类型固定为 车间领料
            'creator_id' => $input['creator_id'],
            'dispatch_time' => $input['date']
        ];

        $tempMaterialArr = [];
        foreach ($input['materials'] as $material) {
            // 把batches拆分为 key为depot_id的数组(第三层)
            $tempBatchArr = [];
            foreach ($material['batches'] as $batch) {
                $tempBatchArr[$batch['depot_id']][] = $batch;
            }

            /**
             * 遍历上面的数组，然后拆分为 key为depot_id的数组(第二层)
             */
            foreach ($tempBatchArr as $key => $depotArr) {
                $material['batches'] = $depotArr;   //rm_item 层数组
                $material['depot_id'] = $key;
                $tempMaterialArr[$key][] = $material;
            }
        }
        $keyValArr = [];
        foreach ($tempMaterialArr as $depot_id => $materialArr) {
            $keyVal['code'] = $this->getNewCode($input['type']);
            $keyVal['send_depot'] = $depot_id;  //发料地点ID(冗余item.depot_id字段)
            $i = 1;
            $itemsArr = [];
            foreach ($materialArr as $material) {

                // 查询工单用料表，物料是否特殊库存  shuaijie.feng 8.19/1019
                $stmt = DB::table(config('alias.rwoi'))
                    ->where([
                        ['work_order_id',$input['work_order_id']],
                        ['material_id',$material['material_id']],
                        ['type',0],
                    ])
                    ->first();

                $item = [
                    'line_project_code' => $this->createLineCode($i),
                    'material_id' => $material['material_id'],
                    'material_code' => $material['material_code'],
                    'demand_qty' => $material['demand_qty'],
                    'rated_qty' => get_value_or_default($material, 'rated_qty', 0),
                    'demand_unit_id' => $material['unit_id'],
                    'depot_id' => !empty($po_data->WERKS)?$LGORT2->id :$material['depot_id'],    //发料地点
                    'send_status' => 2,
//                    'is_special_stock' => isset($material['special_stock']) ? $material['special_stock'] : '',
                    'is_special_stock' => empty($stmt) ? '' : $stmt->special_stock,
                    'reason' => get_value_or_default($material, 'reason', ''),
                    'remark' => get_value_or_default($material, 'remark', ''),
                ];
                $j = 1;
                foreach ($material['batches'] as $batch) {
                    $batchKeyVal = [
                        'order' => $this->createLineCode($j),
                        'batch' => $batch['batch'],
                        'actual_send_qty' => $batch['batch_qty'],
                        'bom_unit_id' => $batch['unit_id'],
//                        'actual_receive_qty' => $batch['batch_qty'],
                        'inve_id' => $batch['inve_id']
                    ];
                    $j++;
                    $item['batches'][] = $batchKeyVal;
                }
                $i++;
                $itemsArr[] = $item;
            }
            $keyVal['materials'] = $itemsArr;
            $keyValArr[] = $keyVal;
        }
        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();
            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($keyValArr as $mr) {
                $itemsArr = $mr['materials'];
                unset($mr['materials']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {

                    $tempRMREKeyVal[] = [
                        'work_order_id' => $input['work_order_id'],
                        'material_id' => $item['material_id'],
                        'material_code' => $item['material_code'],
                        'unit_id' => $item['demand_unit_id'],
                        'qty' => 0,
                        'rated_qty' => $item['demand_qty'],
                        'material_requisition_id' => $mr_id,
                        'special_stock' => $item['is_special_stock'],
                        'is_merger'=>2,
                        'ctime' => time()
                    ];
                    $batchArr = $item['batches'];
                    unset($item['batches']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            //插入合并工单与领料单关系表
            DB::table(config('alias.rmre'))->insert($tempRMREKeyVal);
            // 插入 batch 表
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
            //再更新工单的信息
//            DB::table(config('alias.rwo'))->where('id', $input['work_order_id'])->update(['picking_status' => 1]);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        $this->updateWork_picking_status($input['work_order_id'],['picking_status'=>1]);
        return $mrIDArr;
    }

    /**
     * 生成 车间退料单
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShopReturn($input)
    {
        //先根据工单判断是否是合并领料
        $obj_is_merge = DB::table(config('alias.rmre'). ' as rmre')
            ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmre.material_requisition_id')
            ->select('is_merger_picking')
            ->where([
                ['rmre.work_order_id', '=', $input['work_order_id']],
                ['rmr.push_type', '=', 2],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
            ])
            ->first();
        //如果为空，则直接返回
        if (empty($obj_is_merge)) {
            TEA('2431');
        }

        if($obj_is_merge->is_merger_picking == 1){
            $obj = DB::table(config('alias.rmre'). ' as rmre')
                ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmre.material_requisition_id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmre.work_order_id')
                ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
                ->select([
                    'rmr.id',
                    'rpo.sales_order_code as sale_order_code',
                    'rpo.sales_order_project_code as sale_order_project_code',
                    'rmr.factory_id',
                    'rmr.line_depot_id',
                    'rmr.workbench_id',
                    'rwo.id as work_order_id',
                    'rpo.number as product_order_code',
                    'rpo.id as product_order_id',
                ])
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.status', '=', 4],
                    ['rmr.push_type', '=', 2],
                    ['rmr.is_delete', '=', 0],
                ])
                ->whereIn('rmr.type', [1, 7])
                ->first();

        }else{
            $obj = DB::table($this->table)
                ->select([
                    'id',
                    'sale_order_code',
                    'sale_order_project_code',
                    'factory_id',
                    'line_depot_id',
                    'workbench_id',
                    'work_order_id',
                    'product_order_code',
                    'product_order_id',
                ])
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['status', '=', 4],
                    ['push_type', '=', 2],
                    ['is_delete', '=', 0],
                ])
                ->whereIn('type', [1, 7])
                ->first();
        }
        if (empty($obj)) {
            TEA('2431');
        }
        // 超能转厂补丁  查询生产订单是否有超能转厂标记  6.27/shuaijie.feng
        $po_data = DB::table(config('alias.rpo'))
            ->where([
                ['id',$obj->product_order_id],
                ['is_delete',0],
                ['on_off',1]
            ])
            ->select([
                'factory_id',// sap字段 工厂id
                'WERKS',    //虚拟工厂
                'WERKS_id', //虚拟工厂id
                'LGORT1',   // 虚拟库存地点（收货）
                'LGORT2',   //半成品和原材料虚拟库存地点（仓库发料）
                'LGORT3',  //车间虚拟库存地点（车间收料）
            ])
            ->first();
        // 获取虚拟仓库的id
        $LGORT3 = DB::table(config('alias.rsd'))->where('code',$po_data->LGORT3)->first();
        // 查询车间的id 区分2108包装车间-床垫or2109包装车间-枕头
        $line_depot = DB::table(config('alias.rsd'))->where('id',$obj->line_depot_id)->first();
        $keyVal = [
            'type' => 2,
            // 超能转厂 使用 po内SAP工厂id  6.28/2019  shuaijie.feng
//            'factory_id' => !empty($po_data->WERKS)?$po_data->factory_id:$obj->factory_id,
            'factory_id' => $obj->factory_id,
            // 超能转厂 使用 po内虚拟库存地点 （车间收料）  6.28/2019  shuaijie.feng
//            'line_depot_id' => !empty($LGORT3)?($po_data->WERKS_id == '12'? $line_depot->id:$LGORT3->id):$obj->line_depot_id,  // 领补料的需求车间库存地点
            'line_depot_id' => $obj->line_depot_id,  // 领补料的需求车间库存地点
            'workbench_id' => $obj->workbench_id,
            'work_order_id' => $obj->work_order_id,
            'product_order_id' => $obj->product_order_id,
            'product_order_code' => $obj->product_order_code,
            'sale_order_code' => $obj->sale_order_code,
            'sale_order_project_code' => $obj->sale_order_project_code,
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 2,   // 状态均为2
            'push_type' => 2,   //类型固定为 车间领料
            'creator_id' => $input['creator_id']
        ];

        $tempDepotArr = [];
        foreach ($input['batches'] as $batch) {
            //如果退料数量为0，则直接跳过
            if ($batch['return_qty'] <= 0) {
                continue;
            }

            //$batch['origin_depot_id'] 为上一个仓库地点
            //生成领料单的时候，rmr.line_depot_id为当前库存地点，rmri.depot_id为上一个库存地点
            //地点顺序和SAP退料单保持一致。
            //出入库的时候，做特别处理。
            $temp_key = $batch['material_id'] . '_' . $batch['origin_depot_id'];
            if (empty($tempDepotArr[$temp_key]['material_id'])) {
                $tempDepotArr[$temp_key]['material_id'] = $batch['material_id'];
                $tempDepotArr[$temp_key]['material_code'] = $batch['material_code'];
                $tempDepotArr[$temp_key]['depot_id'] = $batch['origin_depot_id'];
            }
            $tempDepotArr[$temp_key]['batches'][] = $batch;
        }

        $tempMaterialArr = [];
        foreach ($tempDepotArr as $temp_depot) {
            $tempMaterialArr[$temp_depot['depot_id']][] = $temp_depot;
        }

        $keyValArr = [];
        foreach ($tempMaterialArr as $depot_id => $materialArr) {
            $keyVal['code'] = $this->getNewCode(2);
            $keyVal['send_depot'] = $depot_id;  //发料地点ID(冗余item.depot_id字段)
            $itemArr = [];
            $i = 1;
            foreach ($materialArr as $material) {

                // 查询工单用料表，物料是否特殊库存  6.27/2019 shuaijie.feng
                $stmt = DB::table(config('alias.rwoi'))
                    ->where([
                        ['work_order_id',$input['work_order_id']],
                        ['material_id',$material['material_id']],
                        ['type',0],
                    ])
                    ->first();
                $item = [
                    'line_project_code' => $this->createLineCode($i++),
                    'material_id' => $material['material_id'],
                    'material_code' => $material['material_code'],
                    'demand_qty' => 0,
                    'demand_unit_id' => 0,
                    'depot_id' => $depot_id,    //对于车间退料，该地址是上个车间的地址
                    'send_status' => 2,
                    'is_special_stock' => empty($stmt)?'':$stmt->special_stock,
                    'remark' => ''
                ];
                $j = 1;
                foreach ($material['batches'] as $batch) {
                    $batchKeyVal = [
                        'order' => $this->createLineCode($j++),
                        'batch' => $batch['batch'],
                        'actual_send_qty' => $batch['return_qty'],
                        'bom_unit_id' => $batch['unit_id'],
                        'inve_id' => $batch['inve_id']
                    ];
                    $item['batches'][] = $batchKeyVal;
                    $item['remark'] .= $batch['reason'];
                }
                $itemArr[] = $item;
            }
            $keyVal['materials'] = $itemArr;
            $keyValArr[] = $keyVal;
        }
        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();
            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($keyValArr as $mr) {
                $itemsArr = $mr['materials'];
                unset($mr['materials']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {

                    $tempRMREKeyVal[] = [
                        'push_type'=>2,
                        'work_order_id' => $input['work_order_id'],
                        'material_id' => $item['material_id'],
                        'material_code' => $item['material_code'],
                        'unit_id' => $item['demand_unit_id'],
                        'qty' => 0,
                        'rated_qty' => $item['batches'][0]['actual_send_qty'],
                        'material_requisition_id' => $mr_id,
                        'special_stock' => $item['is_special_stock'],
                        'is_merger'=>2,
                        'ctime' => time()
                    ];
                    $batchArr = $item['batches'];
                    unset($item['batches']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
            // 添加退料记录表
            DB::table(config('alias.rrmr'))->insert($tempRMREKeyVal);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }
//endregion


//region 删


    /**
     * 删除整条记录（包含子项)
     * 只允許刪除狀態為1的單子
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //判断所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);

        // 判斷訂單是否存在
        $obj = DB::table($this->table)
            ->select(['id', 'status', 'type', 'is_merger_picking','code','push_type','work_order_id'])
            ->where([
                ['id', '=', $input[$this->apiPrimaryKey]],
                ['is_delete', '=', 0],
            ])
            ->first();
        if (empty($obj)) TEA('2421');

        /**
         * 如果为合并领料 则不允许删除
         * 原因是，一个领料单只是合并领料中的一个
         * @time 2019.2.27
         */
//        if ($obj->is_merger_picking == 1) {
//            TEA(2654);
//        }

        //如果 已经实发或者实收，则不允许删除
        if (!in_array($obj->status, [1, 2])) {
            TEA(2489, 'Line:1900');
        }
        // 查看合并记录表实收
        $rmre_count = DB::table(config('alias.rmre'))->where([['qty','>',0],['material_requisition_id','=',$input[$this->apiPrimaryKey]]])->count();
        // 查询是否为领料单类型
        $rmre = DB::table(config('alias.rmr').' as rmr')
            ->leftJoin(config('alias.rmre').' as rmre','rmr.id','=','rmre.material_requisition_id')
            ->where('rmr.id',$input[$this->apiPrimaryKey])
            ->select('rmr.id','rmr.status','rmr.code','rmr.type','rmr.repairstatus','rmre.is_merger','push_type')
            ->first();

        if (($rmre->push_type == 2 || $rmre->push_type == 1) && $rmre->is_merger && $rmre->is_merger == 1){
            $rmrib_count = DB::table(config('alias.rmrib'))->where([['material_requisition_id','=',$input[$this->apiPrimaryKey]],['actual_send_qty','>',0]])->count();
            if($rmre_count > 0 || $rmrib_count > 0) TEA('2660');
        }
        // 增加车间领料条件判断  领料 补料 退料
        if($obj->push_type == 2 && in_array($obj->type, [1,2,7])){
            // 删除 有回填字段则不同意删除
            $rmrib_count = DB::table(config('alias.rmrib'))->where([
                ['material_requisition_id',$input[$this->apiPrimaryKey]],
                ['actual_receive_qty','>',0],
            ])->count();
            if($rmrib_count >0) TEA('2660');
        }
        if ($obj->is_merger_picking == 1) {
            // 删除 有回填字段则不同意删除
            $rmrib_count = DB::table(config('alias.rmrib'))->where([
                ['material_requisition_id',$input[$this->apiPrimaryKey]],
                ['actual_receive_qty','>',0],
            ])->count();
            if($rmrib_count >0) TEA('2660');

            $sendData = $this->getpushsapshow($input[$this->apiPrimaryKey],'');
            if(!empty($sendData)){
                $resp = Soap::doRequest($sendData, 'INT_MM002200004', '0002');
                if (!isset($resp['RETURNCODE'])) TEA('2454');
                if ($resp['RETURNCODE'] != 0) {
                    TEPA($resp['RETURNINFO']);
                }
            }

            DB::table(config('alias.rmr'))->where('id',$input[$this->apiPrimaryKey])->update(['is_delete'=>1]);
//            DB::table(config('alias.rmri'))->where('material_requisition_id',$input[$this->apiPrimaryKey])->delete();
            //更新WO状态
            $work_order_ids=DB::table(config('alias.rmre'))
                ->where('material_requisition_id',$input[$this->apiPrimaryKey])
                ->distinct()
                ->pluck('work_order_id')->toArray();
//            DB::table(config('alias.rwo'))->whereIn('id', obj2array($work_order_ids))->update(['is_sap_picking' => 0,'picking_status'=>0]);
            $this->updateWork_picking_status(obj2array($work_order_ids),['is_sap_picking' => 0,'picking_status'=>0]);
            DB::table(config('alias.rmre'))->where('material_requisition_id',$input[$this->apiPrimaryKey])->delete();
            if ($obj->type == 2) {
                DB::table(config('alias.rrmr'))->where('material_requisition_id', $input[$this->apiPrimaryKey])->delete();
            }
            //  删除领料单增加日志记录
            $events = [
                'action'=>'delete',
                'desc'=>'编码为['.$obj->code.']的领料单',
            ];
            Trace::save(config('alias.rmr'),$obj->id,session('administrator')->admin_id,$events);
        }
        // 判断 非退料单 在推送后 到实发完成的这段时间内
        // 如果 rmrib 表有相关数据存在，表示已部分发货，此时也无法删除
        $count = DB::table($this->table . ' as rmr')
            ->where([
                ['rmr.type', '<>', 2],
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', 2],
                ['rmr.is_depot_picking', '=', '0'],
                ['rmr.push_type', '<>', 2]
            ])
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from(config('alias.rmrib') . ' as rmrib')
                    ->whereRaw('rmrib.material_requisition_id = rmr.id');
            })
            ->count();
        if ($count) {
            TEA(2489, 'Line:1915');
        }

        //如果为退料，则需要判断 实收字段是否已经更新。
        //如果已经更新，则也不能删除
        if ($obj->type == 2) {
            $count = DB::table(config('alias.rmrib'))
                ->where([
                    ['material_requisition_id', '=', $input[$this->apiPrimaryKey]],
                    ['actual_receive_qty', '>', 0]
                ])
                ->count();
            if ($count) {
                TEA(2489, 'Line:1928');
            }
        }
        $sendData = $this->getpushsapshow($input[$this->apiPrimaryKey],'');
        if(!empty($sendData)){
            $resp = Soap::doRequest($sendData, 'INT_MM002200004', '0002');
            if (!isset($resp['RETURNCODE'])) TEA('2454');
            if ($resp['RETURNCODE'] != 0) {
                TEPA($resp['RETURNINFO']);
            }
        }

//        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->delete();
        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['is_delete' => 1]);
//        DB::table($this->itemTable)->where('material_requisition_id', $input[$this->apiPrimaryKey])->delete();
//        DB::table(config('alias.rmrib'))->where('material_requisition_id', $input[$this->apiPrimaryKey])->delete();
        //  删除领料单增加日志记录
        $events = [
            'action'=>'delete',
            'desc'=>'编码为['.$obj->code.']的领料单',
        ];
        Trace::save(config('alias.rmr'),$obj->id,session('administrator')->admin_id,$events);
        if($obj->work_order_id){
            $this->updateWork_picking_status($obj->work_order_id,['is_sap_picking' => 0,'picking_status'=>0]);
        }
    }

    /**
     * 删除某一子项
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function deleteItem($input)
    {
        if (empty($input['item_id'])) TEA('700', 'item_id');
        $item_obj = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->select([
                'rmr.id',
                'rmr.status',
            ])
            ->where([
                ['rmri.id', '=', $input['item_id']],
                ['rmr.is_delete', '=', 0],
            ])
            ->first();
        if (empty($item_obj) || empty($item_obj->id) || $item_obj->status != 1) {
            TEA(2423);
        }
        //验证当前所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($item_obj->id);

        DB::table($this->itemTable)->where('id', $input['item_id'])->delete();
        DB::table(config('alias.rmrib'))->where('item_id', $input['item_id'])->delete();
    }

//endregion


//region 改

    /**
     * 更改状态
     *
     * 1->填完申请单，未推送或推送失败
     * 2->推送成功（完成申请)
     * 3->完成（已填写实收数量）
     *
     * @param integer $id
     * @param integer $status
     * @throws \App\Exceptions\ApiException
     */
    public function updateStatus($id, $status)
    {
        //验证所属工单是否被锁定
//        $this->checkWorkOrderLockByMRID($id);
        $db_rep = DB::table($this->table)->where('id', $id)->update(['status' => $status]);
        if ($db_rep === false) {
            TEA('500');
        }
    }

    /**
     * 更改子项需求数量
     *
     * 只有状态为 1 才可以修改
     *
     * @param array $input
     * @throws \App\Exceptions\ApiException
     */
    public function updateItem($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        if (empty($input['demands'])) TEA('700', 'demands');
        $mr_obj = DB::table($this->table . ' as rmr')
            ->select(['rmr.status', 'rmr.id'])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', 1],
                ['rmr.is_delete', '=', 0],
            ])
            ->first();
        if (!isset($mr_obj->id)) {
            TEA('2423');
        }

        foreach ($input['demands'] as $demand) {
            if (empty($demand['item_id'])) TEA('700', 'item_id');
            if (empty($demand['demand_qty'])) TEA('700', 'demand_qty');
            $isExist = $this->isExisted([
                ['id', '=', $demand['item_id']],
                ['material_requisition_id', '=', $input[$this->apiPrimaryKey]]
            ], $this->itemTable);

            if (!$isExist) {
                continue;
            }
            DB::table($this->itemTable)
                ->where([
                    ['id', '=', $demand['item_id']],
                    ['material_requisition_id', '=', $input[$this->apiPrimaryKey]]
                ])
                ->update(['demand_qty' => $demand['demand_qty']]);
        }
    }

    /**
     * 更改每个子项的实收数量
     *
     * 只有状态为 3 时候才允许修改
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function updateActualReceiveNumber($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        if (empty($input['batches'])) TEA('700', 'batches');
        $mr_obj = DB::table($this->table . ' as rmr')
            ->select(['rmr.status', 'rmr.id'])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.is_delete', '=', 0],
            ])
            ->whereIn('rmr.status', [3])
            ->first();
        if (!isset($mr_obj->id)) {
            TEA('2423');
        }

        foreach ($input['batches'] as $batch) {
            if (empty($batch['batch_id'])) TEA('700', 'batch_id');
            if (empty($batch['actual_receive_qty'])) TEA('700', 'actual_receive_qty');
            $is_exist = $this->isExisted([
                ['id', '=', $batch['batch_id']],
                ['material_requisition_id', '=', $mr_obj->id]
            ], config('alias.rmrib'));
            if (!$is_exist) TEA('2422');
            DB::table(config('alias.rmrib'))
                ->where([
                    ['id', '=', $batch['batch_id']],
                    ['material_requisition_id', '=', $mr_obj->id]
                ])
                ->update([
                    'actual_receive_qty' => $batch['actual_receive_qty']
                ]);
            // 查找物料编号
            $arr =  DB::table(config('alias.rmri').' as rmri')
                ->leftJoin(config('alias.rmrib').' as rmrib','rmri.id','=','rmrib.item_id')
                ->where([
                    ['rmrib.id', '=', $batch['batch_id']],
                ])
                ->select('rmri.material_code')
                ->first();
            // 查询 领料单类型
            $stmt = DB::table(config('alias.rmre'))->where([['material_requisition_id', '=', $mr_obj->id],])->first();
            // 按单领料区分物料更新
            if(!empty($stmt) && $stmt->is_merger == 2){
                // 更新 合并记录表
                DB::table(config('alias.rmre'))
                    ->where([
                        ['material_requisition_id', '=', $mr_obj->id],
                        ['material_code',$arr->material_code]
                    ])
                    ->update([
                        'qty' => $batch['actual_receive_qty']
                    ]);
            }
        }
//        DB::table($this->table)->where('id', $mr_obj->id)->update(['status' => 4]);
    }

    /**
     * 领/退/补 出入库
     * 并自动更改状态
     *
     * @param $input
     * @param int $is_last_produce_work 是否为最后一次报工
     * @throws \App\Exceptions\ApiException
     */
    public function auditing($input, $is_last_produce_work = 0)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        //委外工单不走以下验证
        if(isset($input['sub_id']) && $input['sub_id'] > 0) {
            ;
        }else{
            $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        }
        $obj = DB::table($this->table)
            ->select([
                'id',
                'status',
                'type',
                'work_order_id',
                'push_type',
                'is_merger_picking'
            ])
            ->where([
                ['id', '=', $input[$this->apiPrimaryKey]],
                ['status', '<', 4],
                ['is_delete', '=', 0],
            ])
            ->first();

        if (!isset($obj->id)) {
            TEA('2421');
        }
        $status = 3;
        $updateStatus = 4;
        if ($obj->type == 2) {
//            $status = 1;
//            $updateStatus = 2;
            $status = 2;        // 11.23 修改：推送后出库 状态：2->3
            $updateStatus = 3;
        }

        // 报工生成的mes领补退
        if (in_array($obj->type, [1, 2, 7]) && $obj->push_type == 0) {
            $status = 1;
            $updateStatus = 4;
        }

        // 车间的领补退
        if (in_array($obj->type, [1, 2, 7]) && $obj->push_type == 2) {
            $status = $obj->status; // 实发->2; 实收->3
            $updateStatus = $status + 1;    // 实发更新状态为3，实收状态改为4
        }
        if($obj->is_merger_picking==0) {
            $obj_list = DB::table($this->table . ' as rmr')
                ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                ->select([
                    'rmr.id as mr_id',
                    'rmr.status',
                    'rmr.factory_id',
                    'rmr.line_depot_id',
                    'rmr.send_depot',
                    'rmr.work_order_id',
                    'rmr.product_order_code',
                    'rmr.sale_order_code',
                    'rmr.sale_order_project_code',
                    'rmr.type',
                    'rmri.id as item_id',
                    'rmri.material_id',
                    'rmri.is_special_stock',
                    'rmri.demand_unit_id as bom_unit_id',
                    'rmri.depot_id as depot_id',
//                'rmri.actual_receive_qty as qty',
                    'rmrib.id as rmrib_id',
                    'rmrib.batch',
                    'rmrib.actual_send_qty as send_qty',    //车间领补退 发料的时候使用这个字段
                    'rmrib.actual_receive_qty as qty',
                    'rmrib.inve_id',
                    'rmrib.bom_unit_id as batch_bom_unit_id',
                    'rwo.number as work_order_code',
                    'rwo.id as work_order_id',
                ])
                ->where([
                    ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                    ['rmr.status', '=', $status],
                    ['rmr.is_delete', '=', 0],
                    ['rmri.item_is_delete', '<>', '1'], // 增加 行项是否删除  1:被删除   0:未删除
                ])
                ->get();
        }
        if($obj->is_merger_picking==1){
            //合并领料单 按工单入库 Modify By Bruce.Chu
            $obj_list = DB::table(config('alias.rmr') . ' as rmr')
                ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                ->leftJoin(config('alias.rmrw').' as rmrw','rmrw.batch_id','rmrib.id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmrw.work_order_id')
                ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
                ->select([
                    'rmr.id as mr_id',
                    'rmr.status',
                    'rmr.factory_id',
                    'rmr.line_depot_id',
                    'rmr.send_depot',
//                    'rmr.work_order_id',
//                    'rmr.product_order_code',
//                    'rmr.sale_order_code',
//                    'rmr.sale_order_project_code',
                    'rmr.type',
                    'rmri.id as item_id',
                    'rmri.material_id',
                    'rmri.is_special_stock',
                    'rmri.demand_unit_id as bom_unit_id',
                    'rmri.depot_id as depot_id',
//                'rmri.actual_receive_qty as qty',
                    'rmrib.id as rmrib_id',
                    'rmrib.batch',
                    'rmrw.id as rmrw_id',
//                    'rmrib.actual_send_qty as send_qty',    //车间领补退 发料的时候使用这个字段
//                    'rmre.qty',//每个工单的每个料的qty Modify By Bruce.Chu
                    'rmrw.qty',//每个工单的每个料的每个批次的qty Modify By Bruce.Chu
                    'rmrw.inve_id as merger_inve_id',
                    'rmrib.inve_id',
                    'rmrib.bom_unit_id as batch_bom_unit_id',
                    'rwo.number as work_order_code',
                    'rwo.id as work_order_id',
                    'rpo.number as product_order_code',
                    'rpo.sales_order_code as sale_order_code',
                    'rpo.sales_order_project_code as sale_order_project_code',
                ])
//                ->addSelect(DB::raw('SUM(rmrw.qty) as qty'))
                ->where([
                    ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                    ['rmr.status', '=', $status],
                    ['rmr.is_delete', '=', 0],
                    ['rmri.item_is_delete', '<>', '1'], // 增加 行项是否删除  1:被删除   0:未删除
                ])
//                ->groupBy('rmrw.batch_id')
                ->get();
        }
        if (empty(obj2array($obj_list))) {
            TEA('2424');
        }

        /**
         * @todo 销售订单号没获取
         */

        /**
         * 根据type判断 入库还是出库
         * type=2 车间退料 为出库
         * type=7 车间补料 为入库
         * type=1 & push_type=0 生产领料 出库
         */
        //车间向WMS领料
        $storageArr = [
            'id' => 14,
            'io' => '1'
        ];
        //车间向WMS退料
        if ($obj->type == 2) {
            $storageArr = [
                'id' => 36,
                'io' => '-1'
            ];
        }
        if ($obj->type == 7) {    //车间向WMS补料
            $storageArr = [
                'id' => 19,
                'io' => '1'
            ];
        }

        // 报工生成的 mes领补退
        if ($obj->push_type == 0) {
            if ($obj->type == 1) {    //领料
                $storageArr = [
                    'id' => 34,
                    'io' => '-1'
                ];
            }
            if ($obj->type == 2) {    //退料
                $storageArr = [
                    'id' => 18,
                    'io' => '1'
                ];
            }
            if ($obj->type == 7) {    //补料
                $storageArr = [
                    'id' => 33,
                    'io' => '-1'
                ];
            }
        }

        // 车间的 领补退
        if ($obj->push_type == 2) {
            if ($obj->type == 1) {    //领料
                //实发
                $storageArr = [
                    'id' => 39,
                    'io' => '-1',
                    'depot_field_name' => 'depot_id'
                ];
                //实收
                if ($obj->status == 3) {    //需求地点入库
                    $storageArr = [
                        'id' => 51,
                        'io' => '1',
                        'depot_field_name' => 'line_depot_id'
                    ];
                }
            }
            if ($obj->type == 2) {    //退料
                $storageArr = [
                    'id' => 41,
                    'io' => '-1',
                    'depot_field_name' => 'line_depot_id',    //领补的需求地点出库
                ];
                if ($obj->status == 3) {    //领补的发料地点入库
                    $storageArr = [
                        'id' => 53,
                        'io' => '1',
                        'depot_field_name' => 'depot_id'
                    ];
                }
            }
            if ($obj->type == 7) {    //补料
                $storageArr = [     //发料地点出库
                    'id' => 40,
                    'io' => '-1',
                    'depot_field_name' => 'depot_id'
                ];
                if ($obj->status == 3) {    //需求地点入库
                    $storageArr = [
                        'id' => 52,
                        'io' => '1',
                        'depot_field_name' => 'line_depot_id'
                    ];
                }
            }
        }

        $StorageItem = new StorageItem();

        $work_order_ids = [];
        foreach ($obj_list as $key => $value) {
            /**
             * 车间在退料的时候将工单制空
             * update shuaijie.feng 11.19/2019
             */
            if($obj->push_type == 2 && $obj->type == 2){
                $value->work_order_code = '' ;
            }
            //  获取工单id
            $work_order_ids[] = $value->work_order_id;

            //委外报工消耗，取委外工单
            if(isset($input['sub_id']) && $input['sub_id'] > 0) {
                $value->work_order_code = $input['work_order_code'];
            }

            /**
             * 如果满足一下三种条件，则入库的时候作为通用库存，
             * 即PO、WO、SO均为空
             * 1.是否为最后一次报工
             * 2.不是特殊库存
             * 3.为退料
             */
            $is_usual_storage = $value->is_special_stock != 'E' && $is_last_produce_work && $obj->type == 2 ? 1 : 0;
            $temp['plant_id'] = $value->factory_id;
            $temp['po_number'] = $is_usual_storage ? '' : $value->product_order_code;
            $temp['wo_number'] = $is_usual_storage ? '' : $value->work_order_code;
            $temp['sale_order_code'] = $is_usual_storage ? '' : $value->sale_order_code;
            $temp['sales_order_project_code'] = $is_usual_storage ? '' : $value->sale_order_project_code;

            /**
             * 如果 push_type -> 0 mes领料，地点为 depot_id
             * 如果 push_type -> 1 SAP领料，地点为 line_depot_id
             * 如果 push_type -> 2 车间领料，地点取 $storageArr['depot_field_name']
             */
            $temp['depot_id'] = $obj->push_type == 1 ?
                $value->line_depot_id : ($obj->push_type == 2 ? $value->{$storageArr['depot_field_name']} : $value->depot_id);    //如果是想mes领补退，则取rmri.depot_id
            $temp['send_depot'] = $obj->push_type == 1 ? $value->send_depot : '';
            $temp['material_id'] = $value->material_id;
            $temp['unit_id'] = $value->batch_bom_unit_id;
            // ($obj->status == 2 && $obj->push_type == 2) ||    车间发料去除  shuaijie.feng 5.7/2019
//            $temp['quantity'] = ($obj->push_type == 1 && $obj->type == 2 && $obj->is_merger_picking != 1) ?
//                $value->send_qty : $value->qty;   //如果为车间领补退(实发)以及SAP退料 使用send_qty，其他都是qty

            $temp['quantity'] = ($obj->push_type == 1 && $obj->type == 2 && $obj->is_merger_picking != 1) ? (($obj->push_type== 1 && $obj->type==2) ?$value->qty: $value->send_qty): $value->qty;

            $temp['lot'] = $value->batch;
            $storageArr['io'] == '-1' && $temp['inve_id'] = ($obj->push_type == 1 && $obj->type == 2 && $obj->is_merger_picking == 1) ?
                $value->merger_inve_id : $value->inve_id;   //如果为SAP合并退料 使用merger_inve_id，其他都是inve_id; 出库的时候才会有inve_id
            $arr = $StorageItem->merge_data($temp, $storageArr['id'], $storageArr['io'], 1);
            $StorageItem->save($arr);
            $storage_item_id = $StorageItem->pk;
            $StorageItem->passageway($storage_item_id);
            //入库的时候更新inve_id
            if($obj->is_merger_picking==1){
                DB::table(config('alias.rmrw'))->where('id', $value->rmrw_id)->update(['storage_item_id' => $storage_item_id]);
                if ($storageArr['io'] == '1') {
                    $storage_item_obj = DB::table(config('alias.rsit'))->select('inve_id')->where('id', $storage_item_id)->first();
                    if (!empty($storage_item_obj->inve_id)) {
                        DB::table(config('alias.rmrw'))->where('id', $value->rmrw_id)->update(['inve_id' => $storage_item_obj->inve_id]);
                    }
                }
            }else{
                DB::table(config('alias.rmrib'))->where('id', $value->rmrib_id)->update(['storage_item_id' => $storage_item_id]);
                if ($storageArr['io'] == '1') {
                    $storage_item_obj = DB::table(config('alias.rsit'))->select('inve_id')->where('id', $storage_item_id)->first();
                    if (!empty($storage_item_obj->inve_id)) {
                        DB::table(config('alias.rmrib'))->where('id', $value->rmrib_id)->update(['inve_id' => $storage_item_obj->inve_id]);
                    }
                }
            }
        }


        // 更新状态
        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['status' => $updateStatus,'time'=>time()]);
        return $work_order_ids;
    }

    /**
     * 领料单 反审
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function unAuditing($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        //只有mes领补退，却状态为4
        $obj = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rwdo') . ' as rwdo', 'rwdo.id', '=', 'rmr.declare_id')
            ->select(['rmr.id', 'rmr.status', 'rwdo.status as rwdo_status'])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 0],
            ])
            ->first();
        //如果id不存在 或者 rwdo状态不为1，则不允许反审
        if (!isset($obj->id) || (isset($obj->rwdo_status) && $obj->rwdo_status > 1)) {
            TEA('2425', json_encode($obj));
        }

        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.material_requisition_id', '=', 'rmr.id')
            ->select([
                'rmr.id as mr_id',
                'rmrib.id as rmrib_id',
                'rmrib.storage_item_id',
                'rmrib.item_id'
            ])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 0]
            ])
            ->get();
        if (empty(obj2array($obj_list))) {
            TEA('2424');
        }

        /**
         * 调用 李明 的方法 进行反审操作
         */
        $StorageItem = new StorageItem();
        try {
            DB::connection()->beginTransaction();
            foreach ($obj_list as $value) {
                #TODO
                //获取是否是lzp
                $lzp_identity_card = DB::table('ruis_material_requisition_item as rmri')
                    ->leftJoin('ruis_material as rm','rmri.material_id','rm.id')
                    ->where([
                        ['rmri.id','=',$value->item_id],
                        ['material_requisition_id','=',$value->mr_id]
                    ])
                    ->value('lzp_identity_card');
                if($lzp_identity_card)
                {
                    $is_production = 2;
                }
                else
                {
                    $is_production = '';
                }
                $StorageItem->del($value->storage_item_id,$is_production);
                DB::table(config('alias.rmrib'))->where('id', $value->rmrib_id)->update(['storage_item_id' => 0]);
            }
            // 更新状态
            DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['status' => 5]);
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 车间领补退 确认发料、更新实收数量 统一接口
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function workShopConfirmAndUpdate($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        if (empty($input['status']) || !in_array($input['status'], [2, 3])) TEA('700', 'status');
        if (empty($input['type']) || !in_array($input['type'], [1, 2, 7])) TEA('700', 'type');
        $obj = DB::table($this->table)
            ->select('id','work_order_id')
            ->where([
                ['type', '=', $input['type']],
                ['push_type', '=', 2],
                ['is_delete', '=', 0],
                ['status', '=', $input['status']],
                ['id', '=', $input[$this->apiPrimaryKey]]
            ])
            ->first();
        if (!isset($obj->id)) {
            TEA('2423');
        }

        // 如果是 补退料单，需要修改实收数量
        if (in_array($input['type'], [1, 2, 7]) && $input['status'] == 2) {
            if (empty($input['batches'])) TEA('700', 'batches');
            foreach ($input['batches'] as $batch) {
                if (empty($batch['batch_id'])) TEA('700', 'batch_id');
                // 添加发料为0的情况  shuaijie.feng 5.7/2019
                if (!is_numeric($batch['actual_receive_qty'])) TEA('700', 'actual_receive_qty');
                //验证子项是否存在
                $is_exist = $this->isExisted([
                    ['id', '=', $batch['batch_id']],
                    ['material_requisition_id', '=', $obj->id]
                ], config('alias.rmrib'));
                if (!$is_exist) TEA('2422');

                //更新实收数量
                DB::table(config('alias.rmrib'))
                    ->where([
                        ['id', '=', $batch['batch_id']],
                        ['material_requisition_id', '=', $obj->id]
                    ])
                    ->update([
                        'actual_receive_qty' => $batch['actual_receive_qty']
                    ]);
                // 查找物料编号
                $arr =  DB::table(config('alias.rmri').' as rmri')
                    ->leftJoin(config('alias.rmrib').' as rmrib','rmri.id','=','rmrib.item_id')
                    ->where([
                        ['rmrib.id', '=', $batch['batch_id']],
                    ])
                    ->select('rmri.material_code')
                    ->first();

                // type == 1 为领料  type== 2 为退料  shuaijie.feng 5.28/2019
                if($input['type'] == 1){
                    DB::table(config('alias.rmre'))
                        ->where([
                            ['material_requisition_id', '=', $obj->id],
                            ['material_code',$arr->material_code]
                        ])
                        ->update([
                            'qty' => $batch['actual_receive_qty']
                        ]);
                }
                else if ($input['type'] == 2)
                {
                    DB::table(config('alias.rrmr'))
                        ->where([
                            ['material_requisition_id', '=', $obj->id],
                            ['material_code',$arr->material_code]
                        ])
                        ->update([
                            'qty' => $batch['actual_receive_qty']
                        ]);
                }
            }
        }
//        DB::table(config('alias.rwo'))->where('id', $obj->work_order_id)->update(['picking_status' => 2]);
        $this->updateWork_picking_status($obj->work_order_id,['picking_status'=>2]);

//        DB::table($this->table)->where([['id', '=', $input[$this->apiPrimaryKey]]])->update(['status' => $input['status'] + 1]);
    }

    /**
     * 更新补料原因
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function updateReason($input)
    {
        if (empty($input['data'])) {
            TEA(700, 'data');
        }
        $item_id = [];
        foreach ($input['data'] as $value) {
            $keyVal = [
                'remark' => get_value_or_default($value, 'remark', ''),
                'qc_reason' => get_value_or_default($value, 'reason', ''),
                'auditing_operator_id' => $input['auditing_operator_id'],
                'auditing_time' => time(),
            ];
            $item_id = $value['item_id'];
            DB::table($this->itemTable)->where('id', $value['item_id'])->update($keyVal);
            //记录第一次审核原因 hao.li
            $this->saveFirstQcReason($item_id,$keyVal);
        }
        $item = DB::table($this->itemTable)->select('material_requisition_id')->where('id',$item_id)->first();
        DB::table(config('alias.rmr'))->where('id',$item->material_requisition_id)->update(['repairstatus'=>1,'employee_id'=>$input['employee_id']]);
    }

    /**
     * 记录第一次补料原因，审核操作人、审核时间
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
     public function saveFirstQcReason($item_id,$data){
         $itemId=DB::table('mbh_first_qc_reason')->select('id')->where('item_id',$item_id)->first();
         if(empty($itemId->id)){
             $insertData=[
                 'item_id' => $item_id,
                 'qc_reason' => $data['qc_reason'],
                 'auditing_time' => $data['auditing_time'],
                 'auditing_operator_id' => $data['auditing_operator_id']
             ];
             $id=DB::table('mbh_first_qc_reason')->insertGetId($insertData);
         }
     }

    /**
     * 补料单反审
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function blCounterTrial($input){
        $id = $input['id'];
        if (empty($id)) {
            TEA(700, 'id');
        }
        DB::table(config('alias.rmr'))->where('id',$id)->update(['repairstatus'=>0]);

        DB::table('ruis_send_message')
            ->where([
                ['type','=','12'],
                ['customer_complaint_id','=',$id]
            ])
            ->update(['is_end'=>2]);
    }

    /**
     * @param array $input
     * @param bool $isNeedAuditing
     * @throws \App\Exceptions\ApiException
     */
    public function autoInsert($input, $isNeedAuditing = true)
    {
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->select([
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmri.id as item_id',
                'rmr.type',
                'rmr.push_type',
                'rmri.demand_qty',
                'rmri.demand_unit_id'
            ])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.push_type', '=', 1],
                ['rmr.status', '=', 2]
            ])
            ->get();
        $keyValArr = [];
        $keyVal = [
            'material_requisition_id' => $input[$this->apiPrimaryKey],
            'batch' => '1',
        ];

        foreach ($objs as $obj) {
            $keyVal['item_id'] = $obj->item_id;
            $keyVal['bom_unit_id'] = $obj->demand_unit_id;
            $keyVal['actual_send_qty'] =
            $keyVal['actual_receive_qty'] = $obj->demand_qty;
            $keyVal['order'] = '00001';
            $keyValArr[] = $keyVal;
        }
        DB::table(config('alias.rmrib'))->insert($keyValArr);
        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['status' => 3]);
        $isNeedAuditing && $this->auditing($input);
//        DB::table(config('alias.rmrib'))->where('material_requisition_id', $input[$this->apiPrimaryKey])->delete();
//        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['status' => 2]);
    }

    /**
     * 自动入库
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function autoInbound($input)
    {
        if (empty($input[$this->apiPrimaryKey])) {
            TEA(700, 'material_requisition_id');
        }

        $objs = DB::table(config('alias.rmr') . ' as rmr')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.material_requisition_id', '=', 'rmr.id')
            ->select([
                'rmr.id',
                'rmrib.id as rmrib_id',
                'rmrib.actual_send_qty',
                'rmrib.actual_receive_qty',
            ])
            ->where([
                ['rmr.id', '=', $input['material_requisition_id']],
                ['rmr.status', '=', 3],
                ['rmr.type', '=', 1],
                ['rmr.push_type', '=', 1]
            ])
            ->get();
        foreach ($objs as $obj) {
            DB::table(config('alias.rmrib'))
                ->where('id', $obj->rmrib_id)
                ->update(['actual_receive_qty' => $obj->actual_send_qty]);
        }
        $this->auditing($input);
    }

//endregion


//region 查

    /**
     * @param $input
     * @param bool $isQC
     * @return mixed
     */
    public function lists(&$input, $isQC = false)
    {
        $where = [];
        $whereres = [];
        $whereres[] = ['rmr.is_delete', '=', 0];
        if (!(isset($input['is_depot_picking']) && $input['is_depot_picking'] == 1)) {
            $whereres[] = ['rwo.is_delete', '=', 0];
            $whereres[] = ['rwo.on_off', '=', 1];
        }
        //状态为反审的单子不显示
        //$whereres[] = ['rmr.status', '<', 5];
        if (!empty($input['code'])) $where[] = ['rmr.code', 'like',  $input['code'] . '%'];
        if (!empty($input['work_order_id'])) $where[] = ['rmr.work_order_id', '=',$input['work_order_id']];
        if (!empty($input['type']) && is_numeric($input['type'])) $whereres[] = ['rmr.type', '=', $input['type']];
        if (!empty($input['status']) && in_array($input['status'], [1, 2, 3, 4])) $where[] = ['rmr.status', '=', $input['status']];
        if (isset($input['push_type']) && in_array($input['push_type'], [0, 1, 2])) $whereres[] = ['rmr.push_type', '=', $input['push_type']];
        if (!empty($input['work_order_code'])) $where[] = ['rwo.number', 'like', $input['work_order_code'] . '%'];
        if (!empty($input['product_order_code'])) $where[] = ['rmr.product_order_code', 'like', $input['product_order_code'] . '%'];
        if (!empty($input['line_depot_id'])) $where[] = ['rmr.line_depot_id', '=', $input['line_depot_id']];
        if (!empty($input['workbench_id'])) $where[] = ['rmr.workbench_id', '=', $input['workbench_id']];
        if (!empty($input['employee_name'])) $where[] = ['re.name', 'like', '%' . $input['employee_name'] . '%'];
        if (!empty($input['inspur_material_code'])) $where[] = ['rpo.inspur_material_code', 'like', '%' . $input['inspur_material_code'] . '%'];
        if (!empty($input['inspur_sales_order_code'])) $where[] = ['rpo.inspur_sales_order_code', 'like', '%' . $input['inspur_sales_order_code'] . '%'];
        if (!empty($input['is_depot_picking'])) $where[] = ['rmr.is_depot_picking', '=', 1];
        if (!empty($input['rankplan'])) $where[] = ['rrp.id', '=', $input['rankplan']];  // 添加班次搜索条件  shuaijie.feng
        if (!empty($input['send_deport'])) $where[] = ['rmr.send_depot', '=', $input['send_deport']];  // 添加采购仓储地搜索条件  shuaijie.feng
        if (!empty($input['dispatch_start_time'])) $where[] = ['rmr.dispatch_time', '>=', strtotime($input['dispatch_start_time'])];  // 配送日期搜索条件  shuaijie.feng
        if (!empty($input['dispatch_end_time'])) $where[] = ['rmr.dispatch_time', '<=', strtotime($input['dispatch_end_time'])];  // 配送日期搜索条件  shuaijie.feng
        $rfwhere = [];
        if (!empty($input['factory_id'])) $rfwhere[] = ['rmr.id', '=', $input['factory_id']];  // 工厂搜索条件  shuaijie.feng
        // 销售订单号+行号
        if (!empty($input['sales_order_code'])) $where[] = ['rmr.sale_order_code', '=', $input['sales_order_code']];
        if (!empty($input['sales_order_project_code'])) $where[] = ['rmr.sale_order_project_code', '=', $input['sales_order_project_code']];

//        if (!empty($input['start_time']) && !empty($input['end_time'])) {
//            $start_time = strtotime(date('Y-m-d', strtotime($input['start_time']))) - 1;
//            $end_time = strtotime(date('Y-m-d', strtotime($input['end_time']))) + 86390;
//            $where[] = ['rwo.plan_start_time', '>', $start_time];
//            $where[] = ['rwo.plan_end_time', '<', $end_time];
//        }
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            $where[] = ['rmr.ctime', '>', strtotime(trim($input['start_time']))];
            $where[] = ['rmr.ctime', '<', strtotime(trim($input['end_time']))];
        }
        //   IQC搜索条件    shuaijie.feng
        if($isQC == true)
        {
            if(isset($input['repairstatus'])){
                $where[] = ['rmr.repairstatus', '=', $input['repairstatus']]; // 是否审核
            }
            if (!empty($input['auditing_operator'])){
                $auditing = DB::table(config('alias.rmri').' as rmri')
                    ->leftJoin(config('alias.rrad').' as rrad','rmri.auditing_operator_id','=','rrad.id')
                    ->select([
                        'rrad.id',
                        'rmri.material_requisition_id'
                    ])
                    ->where('rrad.name','like','%'.$input['auditing_operator'].'%')
                    ->orWhere('rrad.cn_name','like','%'.$input['auditing_operator'].'%')
                    ->first();
                $where[] = ['rmr.id', '=', $auditing->material_requisition_id]; // 审核人搜索
            }
            // 开单人搜索
            if (!empty($input['creator_name']))
            {
                $auditing = DB::table(config('alias.rrad'))
                    ->select([
                        'id',
                    ])
                    ->where('name','like','%'.$input['creator_name'].'%')
                    ->orWhere('cn_name','like','%'.$input['creator_name'].'%')
                    ->first();
                $where[] = ['rmr.creator_id', '=', $auditing->id];
            }
            // 补料审核 添加搜索条件  shuaijie.feng 7.12/2019
            !empty($input['sale_order_code']) && $where[] = ['rmr.sale_order_code', '=', $input['sale_order_code']];
            !empty($input['sale_order_project_code']) && $where[] = ['rmr.sale_order_project_code', '=', $input['sale_order_project_code']];
            !empty($input['LGFSB']) && $where[] = ['rmr.send_depot', '=', $input['LGFSB']];
        }
        if (!$isQC) {
            //按员工档案那配置的生产单元，按厂对po进行划分
            $admin_id = session('administrator')->admin_id;
            $admin_is_super = session('administrator')->superman;
            $where2 = [['re.admin_id', '=', $admin_id]];
            $emploee_info = DB::table(config('alias.re') . ' as re')
                ->select('re.id', 're.factory_id', 're.workshop_id')
                ->where($where2)
                ->first();
            $orwhere = [];
            if(!empty($emploee_info)) {
                if ($admin_is_super != 1) {
                    if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                        //超产能转厂补丁
                        if (!empty($emploee_info)) {
                            $orwhere = function ($query) use ($emploee_info) {
                                $query->where([
                                    ['rpo.WERKS', '<>', ''],
                                    ['rpo.WERKS_id', '=', $emploee_info->factory_id]
                                ])
                                    ->orWhere([
                                        ['rpo.factory_id', '=', $emploee_info->factory_id]
                                    ]);
                            };
                        }
                        //$where[] = ['a1.factory_id', '=', $emploee_info->factory_id];//区分到厂
                    } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                        if(isset($input['issuance']) && $input['issuance'] == 1){
                            $where[] = ['rws.id', '=', $emploee_info->workshop_id];//发料按线边仓区分
                        }else{
                            $where[] = ['rwo.work_shop_id', '=', $emploee_info->workshop_id];//区分车间
                        }
                    }
                }
            }

//            if (!empty($emploee_info)) {
//                if ($admin_is_super != 1) {
//                    if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
//                        $where[] = ['rwo.factory_id', '=', $emploee_info->factory_id];//区分到厂
//                    } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
//                        if(isset($input['issuance']) && $input['issuance'] == 1){
//                            $where[] = ['rws.id', '=', $emploee_info->workshop_id];//发料按线边仓区分
//                        }else{
//                            $where[] = ['rwo.work_shop_id', '=', $emploee_info->workshop_id];//区分车间
//                        }
//                    }
//                }
//            }
        }

        $builder = DB::table($this->table . ' as rmr')
//            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
            ->leftJoin(config('alias.rws') . ' as rws', 'rsd_s.code', '=', 'rws.address')
            ->leftJoin(config('alias.rrp') . ' as rrp', 'rwo.rank_plan_id', '=', 'rrp.id')  // 关联班次表  shuaijie.feng
            ->select([
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmr.code as code',
                'rmr.time',
                'rmr.ctime',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.status',
                'rmr.product_order_code',
                'rmr.sale_order_code',
                'rmr.sale_order_project_code',
                'rmr.send_depot',
                'rmr.is_depot_picking',
                'rmr.feeding_ratio',
                /*'rmr.dispatch_time',*/
                'rwo.plan_start_time as dispatch_time',// yu.peng 配送时间为最早的工单的计划开始时间
                're.name as employee_name',
                're.id as employee_id',
//                'rf.name as factory_name',
//                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
                'rwo.number as work_order_code',
                'rwo.id as work_order_id',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rsd.id as line_depot_id',
                'rsd_s.code as send_depot_code',
                'rsd_s.name as send_depot_name',
                'rsd_s.id as send_depot_id',
                'rpo.inspur_sales_order_code',
                'rmr.repairstatus', // 审核状态
                'rmr.qc_is_delete', // 生产删除补料单标记
            ])
            ->where($where)->where($whereres);
        if (!$isQC) $builder->where($orwhere);
//        $input['total_records'] = $builder->count();
        if(!$isQC){
            // 车间发料列表count值
            if(isset($input['issuance']) && $input['issuance'] == 1){
                $key = 'requisition'.'issuance'.$input['issuance'];
                if(Redis::exists($key)){
                    $input['total_records'] = Redis::get($key);
                }else{
                    // 设置 12个小时后删除数据
                    Redis::setex($key,'43200',$builder->count());
                    $input['total_records'] = Redis::get($key);
                }
            }
            else if(!$where){
                $input['total_records'] = DB::table($this->table . ' as rmr')
                    ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                    ->where($whereres)->where($rfwhere)->count();
            }
            else{
                $input['total_records'] = DB::table($this->table . ' as rmr')
                    ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
                    ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                    ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
                    ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
                    ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
                    ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
                    ->leftJoin(config('alias.rws') . ' as rws', 'rsd_s.code', '=', 'rws.address')
                    ->leftJoin(config('alias.rrp') . ' as rrp', 'rwo.rank_plan_id', '=', 'rrp.id')
                    ->where($where)->where($whereres)->where($rfwhere)
                    ->count();
            }

        }else{
            $input['total_records'] = DB::table($this->table . ' as rmr')
                ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
                ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
                ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
                ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
                ->leftJoin(config('alias.rws') . ' as rws', 'rsd_s.code', '=', 'rws.address')
                ->leftJoin(config('alias.rrp') . ' as rrp', 'rwo.rank_plan_id', '=', 'rrp.id')
                ->where($where)->where($whereres)->where($rfwhere)->count();
        }
        $builder->forPage($input['page_no'], $input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('rmr.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        $array= [
            'obj_list' =>$obj_list,
            'input' =>$input,
        ];
        return $array;
    }
    // 按单领料接口拆分
    public function pageindexlist(&$input)
    {
        $array = $this->lists($input);
        $obj_list = $array['obj_list'];
        $input = $array['input'];
        $material_requisition_id = [];
        foreach ($obj_list as $k => &$v) {
            //2019/12/02 time字段为领/退/补的发料时间，ctime为创建或申请时间
            $v->time = $v->time==$v->ctime?'': date('Y-m-d H:i:s',$v->time);
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->dispatch_time= date('Y-m-d H:i:s', $v->dispatch_time);

            if ($v->push_type != 1) {
                $v->send_depot = '';
            }

            if ($v->push_type != 2) {
                $v->send_depot_code = '';
                $v->send_depot_name = '';
            }
            $material_requisition_id[] = $v->material_requisition_id;
            //处理生产补料线边仓问题
            if(empty($v->line_depot_id))
            {
                $line_depot_name = DB::table('ruis_work_order as rwo')
                    ->leftJoin('ruis_workshop as rws','rwo.work_shop_id','rws.id')
                    ->leftJoin('ruis_storage_depot as rsd','rws.address','rsd.code')
                    ->where('rwo.id',$v->work_order_id)
                    ->value('rsd.name');
                if($line_depot_name)
                {
                    $v->line_depot_name = $line_depot_name;
                }
            }
        }
        // 打印次数
        $rmbp = DB::table(config('alias.rmbp'))->whereIn('material_requisition_id',$material_requisition_id)->pluck('count','material_requisition_id')->toArray();
        // 工厂数据
        $rf = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->whereIn('rmr.id',$material_requisition_id)
            ->select('rf.code','rf.name','rmr.id')->get()->groupBy('id')->toArray();
        foreach ($obj_list as $k => &$v) {
            $v->printingcount = !empty($rmbp[$v->material_requisition_id]) ? $rmbp[$v->material_requisition_id] : 0;
            $v->factory_name = !empty($rf[$v->material_requisition_id]) ? $rf[$v->material_requisition_id][0]->name : '';
            $v->factory_code = !empty($rf[$v->material_requisition_id]) ? $rf[$v->material_requisition_id][0]->code : '';
        }
        // 根据物料的分类查询 查询参与转厂的物料，获取到物料的之前的领料地点
        foreach ($obj_list as $k=>&$v){
            // 查询领料单子表 获取到物料
            $item = DB::table('ruis_material_requisition_item')
                ->where('material_requisition_id',$v->material_requisition_id)
                ->select('material_code')
                ->first();
            if(empty($item)) continue;
            // 根据物料分类查询到物料组
            $code_res = DB::table('ruis_material'.' as rm')
                ->leftJoin('ruis_material_category'.' as rmc','rm.material_category_id','=','rmc.id')
                ->select('code')
                ->where('item_no',$item->material_code)
                ->first();
            // 查询生产订单
            $product_res = DB::table('ruis_production_order')
                ->where([
                    ['number',$v->product_order_code],
                    ['is_delete',0],
                    ['on_off',1],
                ])
                ->select('WERKS')
                ->first();
            if(empty($product_res)) continue;
            // 根据物料组查询到该物料的领料地点
            $code_res_arr = DB::table('ruis_materials_warehouse')
                ->select('storage_code')
                ->where([
                    ['code',$code_res->code],
//                    ['factory_code',$v->factory_code],
                    ['factory_code',$product_res->WERKS]
                ])
                ->first();
            // 为空 则跳过
            if(empty($code_res_arr)) continue;
            // 如果 两者不同则 追加
            if($v->send_depot != $code_res_arr->storage_code)
            {
                $v->send_depot .= '('.$code_res_arr->storage_code.')';
            }
        }
        return $obj_list;
    }

    // qc列表拆分
    public function Qcpageindex(&$input)
    {
        $array = $this->lists($input, true);
        $obj_list = $array['obj_list'];
        $input = $array['input'];
        $material_requisition_id = [];
        foreach ($obj_list as $k => &$v) {
            //2019/12/02 time字段为领/退/补的发料时间，ctime为创建或申请时间
            $v->time = $v->time==$v->ctime?'': date('Y-m-d H:i:s',$v->time);
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->dispatch_time= date('Y-m-d H:i:s', $v->dispatch_time);

            if ($v->push_type != 1) {
                $v->send_depot = '';
            }

            if ($v->push_type != 2) {
                $v->send_depot_code = '';
                $v->send_depot_name = '';
            }
            $material_requisition_id[] = $v->material_requisition_id;
            //处理生产补料线边仓问题
            if(empty($v->line_depot_id))
            {
                $line_depot_name = DB::table('ruis_work_order as rwo')
                    ->leftJoin('ruis_workshop as rws','rwo.work_shop_id','rws.id')
                    ->leftJoin('ruis_storage_depot as rsd','rws.address','rsd.code')
                    ->where('rwo.id',$v->work_order_id)
                    ->value('rsd.name');
                if($line_depot_name)
                {
                    $v->line_depot_name = $line_depot_name;
                }
            }

            if($v->type == 7 && $v->push_type == 1)
            {
                $v->feeding_ratio = $this->feedingRatioSap($v->material_requisition_id,$v->work_order_id);
            }
            else
            {
                $v->feeding_ratio = $this->feedingRatio($v->material_requisition_id,$v->work_order_id,$v->work_order_code);
            }
        }
        // 创建人数据
        $Founder = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rmr.creator_id')
            ->select([
                'rmr.id',
                'rrad.id as admin_id',
                'rrad.cn_name as cn_name',
                'rrad.name as creator_name'
            ])
            ->whereIn('rmr.id',$material_requisition_id)
            ->get()->groupby('id')->toArray();

        // 审核人数据
        $Auditor = DB::table(config('alias.rmri').' as rmri')
            ->leftJoin(config('alias.rrad').' as rrad','rrad.id','=','rmri.auditing_operator_id')
            ->select([
                'rmri.material_requisition_id',
                'rrad.id as admin_id',
                'rrad.cn_name as cn_name',
                'rrad.name as creator_name'
            ])
            ->whereIn('rmri.material_requisition_id',$material_requisition_id)
            ->get()->groupby('material_requisition_id')->toArray();
        // 工厂数据
        $rf = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->whereIn('rmr.id',$material_requisition_id)
            ->select('rf.code','rf.name','rmr.id')->get()->groupBy('id')->toArray();
        // 赋值数据
        foreach ($obj_list as $listkey=>$listval){
            // 创建人数据
            $listval->cn_name = isset($Founder[$listval->material_requisition_id]) ? $Founder[$listval->material_requisition_id][0]->cn_name : '';
            $listval->creator_name = isset($Founder[$listval->material_requisition_id]) ? $Founder[$listval->material_requisition_id][0]->creator_name : '';
            $listval->admin_id = isset($Founder[$listval->material_requisition_id]) ? $Founder[$listval->material_requisition_id][0]->admin_id : '';
            // 审核人数据
            $listval->auditing_operator = isset($Auditor[$listval->material_requisition_id]) ? $Auditor[$listval->material_requisition_id][0]->cn_name : '';
            $listval->auditing_operator_name = isset($Auditor[$listval->material_requisition_id]) ? $Auditor[$listval->material_requisition_id][0]->creator_name : '';
            $listval->factory_name = !empty($rf[$listval->material_requisition_id]) ? $rf[$listval->material_requisition_id][0]->name : '';
            $listval->factory_code = !empty($rf[$listval->material_requisition_id]) ? $rf[$listval->material_requisition_id][0]->code : '';
        }
        return $obj_list;
    }

    //sap补料比例
    public function feedingRatioSap($material_requisition_id,$work_order_id)
    {
        $item = DB::table('ruis_material_requisition_item')
            ->where('material_requisition_id',$material_requisition_id)
            ->select('demand_qty','material_id')
            ->first();
        $qty = DB::table('ruis_work_order_item')
            ->where([
                ['work_order_id',$work_order_id],
                ['type',0],//进料
                ['material_id',$item->material_id]
            ])
            ->value('qty');
        if(!empty(intval($item->demand_qty)) && !empty(intval($qty)))
        {
            return bcdiv($item->demand_qty,$qty,4);
        }
        return 0;
    }
    //补料比例
    public function feedingRatio($material_requisition_id,$work_order_id,$work_order_code)
    {
        //获取补料比例
//        $bl_qty = DB::table('ruis_material_requisition_item_batch')
//            ->select('actual_send_qty')
//            ->where([
//                ['material_requisition_id',$material_requisition_id]
//            ])
//            ->sum('actual_send_qty');
//        if(empty($bl_qty))
//        {
//            return 0;
//        }
        //补料数量
        $bl_qty1 = DB::table('ruis_material_requisition as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->select(DB::raw('sum(rmrib.actual_receive_qty) as bl_qty'))
            ->addSelect('rmri.material_id')
            ->where([
                ['rmr.type',7],
                ['rmr.push_type',0],
                ['rmr.work_order_id', '=', $work_order_id],
                ['rmr.status',4],
                //['rmri.material_id',$temp['material_id']],
            ])
            ->groupBy('rmri.material_id')
            ->orderBy('bl_qty','desc')
            ->first();
        if(!$bl_qty1)
        {
            return 0;
        }
        $bl_qty=$bl_qty1->bl_qty;
        if(empty($bl_qty))
        {
            return 0;
        }
        //需求数量
        $qty = $this->getAllRatedQty($work_order_code,$bl_qty1->material_id);
        if($qty == 0)
        {
            $qty = DB::table('ruis_work_order_item')
            ->where([
                ['work_order_id',$work_order_id],
                ['type',0],//进料
                ['material_id',$bl_qty1->material_id]
            ])->value('qty');

        }

        if(empty($bl_qty) || empty($qty))
        {
            return 0;
        }
        return bcdiv($bl_qty,$qty,4);
    }
    /**
     * 详情
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function show($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //查找一下是否是合并领料单
        $is_merger = DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->limit(1)->value('is_merger_picking');
        $field = [
            'rmr.id as id',
            'rmr.declare_id',
            'rmr.code as code',
            'rmr.type',
            'rmr.push_type',
            'rmr.ctime',
            'rmr.mtime',
            'rmr.time',
            'rmr.from',
            'rmr.status',
            'rmr.product_order_id',
            'rmr.product_order_code',
            'rmr.send_depot',
            'rmr.is_depot_picking',
            'rmr.plan_start_time',
            'rmr.is_merger_picking',
            'rmr.dispatch_time',
            'rmr.bench_no',
            'rmr.delete_reason',
            're.id as employee_id',
            're.name as employee_name',
            'rf.id as factory_id',
            'rf.name as factory_name',
            'rf.code as factory_code',
            'rwb.id as workbench_id',
            'rwb.code as workbench_code',
            'rwb.name as workbench_name',
            'rwo.number as work_order_code',
            'rwo.plan_start_time as wo_plan_start_time',
            'rsd.id as line_depot_id',
            'rsd.code as line_depot_code',
            'rsd.name as line_depot_name',
            'rm.id as material_id',
            'rm.item_no as material_code',
            'rm.name as material_name',
            'rmri.id as item_id',
            'rmri.line_project_code',
            'rmri.demand_qty',
            'rmri.rated_qty',
            'rmri.remark',
            'rmri.reason',
            'rmri.qc_reason',
            'ruu_d.id as demand_unit_id',
            'ruu_d.commercial as demand_unit',
            'rmri.is_special_stock',
            'rmri.custom_inspur_sale_order_code',
            'rmri.inspur_material_code',
            'rsd_i.id as depot_id',
            'rsd_i.code as depot_code',
            'rsd_i.name as depot_name',
            'rmr.sale_order_code',
            'rmr.sale_order_project_code',
            'rwo.id as work_order_id',
            'rmr.repairstatus',
            'rmr.creator_id', // 创建人id
            'rra.name as creator_name', // 创建人名称
            'rra.cn_name as creator_cn_name', // 创建人名称
            'rmri.item_is_delete', // 行项是否删除
        ];
        if($is_merger){
            $field[] = 'rmri.sales_order_code';
            $field[] = 'rmri.sales_order_project_code';
        }else{
            $field[] = 'rmr.sale_order_code as sales_order_code';
            $field[] = 'rmr.sale_order_project_code as sales_order_project_code';
        }
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_i', 'rsd_i.id', '=', 'rmri.depot_id')
            ->leftJoin('ruis_rbac_admin' . ' as rra', 'rra.id', '=', 'rmr.creator_id') // 关联admin 查询创建人
            ->select($field)
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.is_delete', '=', 0],
            ])
//            ->where(function ($query) {
//                $query->where(function ($q) {
//                    $q->where([
//                        ['rmr.is_depot_picking', '=', 1]
//                    ])
//                        ->orWhere([
//                            ['rmr.is_depot_picking', '=', 0],
//                            ['rwo.is_delete', '=', 0],
//                            ['rwo.on_off', '=', 1],
//                        ]);
//                })
//                    ->orWhere(function ($qu) {
//                        $qu->where([
//                            ['rmr.is_merger_picking', '=', 1]
//                        ])
//                            ->orWhere([
//                                ['rmr.is_merger_picking', '=', 0],
//                                ['rwo.is_delete', '=', 0],
//                                ['rwo.on_off', '=', 1],
//                            ]);
//                    });
//
//            })
            ->get();
        if (empty($objs) || empty(obj2array($objs))) TEA('2421');
        //收集物料id，用来查询眼转换的浪潮单位
        $material_ids = [];
        foreach ($objs as $k=>$v){
            $material_ids[] = $v->material_id;
        }
        //查找物料基本单位和浪潮基本转换关系
        $base_change_list = DB::table(config('alias.rmx'))->select('material_id','lc_no','lc_scale','sap_scale','lc_unit')->whereIn('material_id',$material_ids)->get();
        $ref_base_change_list = [];
        foreach ($base_change_list as $k=>$v){
            $ref_base_change_list[$v->material_id.'-'.$v->lc_no] = $v;
        }
        $material_attributes = DB::table(config('alias.ma').' as ma')
            ->select('ma.value','ad.name','ma.material_id')
            ->leftJoin(config('alias.ad').' as ad','ma.attribute_definition_id','ad.id')
            ->whereIn('ma.material_id',$material_ids)->get();
        //组合物料属性
        foreach ($objs as $k=>&$v){
            $v->attribute = '';
            $v->attributes = [];
            $v->red_light = 0;
            foreach ($material_attributes as $j=>$w){
                if($w->material_id == $v->material_id){
                    $v->attributes[] = $w;
                }
            }
            foreach($v->attributes as $key => $val){
                $val->name = $val->name ? $val->name : '';
                $val->value = $val->value ? $val->value : '';
                $v->attribute .= $val->name.':'.$val->value.',';
            }
            $v->attribute = substr($v->attribute,0,-1);
            $v->attribute = $v->attribute ? $v->attribute : '';

            //1.如果是生产补料线边仓补料单，计划数量取报工单计划数量
            //2.其他情况，查询工单是否参加合并领料单 参加合并领料单需要将合并总数量填入  解决iqc质检补料审核查看计划计划数量  shuaijie.feng 6.18/2019
            if(isset($input['is_production_feeding']) && $input['is_production_feeding']==1)
            {
                $qty = DB::table('ruis_work_order_item')
                    ->where([
                        ['work_order_id',$v->work_order_id],
                        ['type',0],//进料
                        ['material_id',$v->material_id]
                    ])
                    ->value('qty');
                if($v->rated_qty == 0 && $qty){
                    $v->rated_qty = $qty;
                }
            }
            else
            {
                $material_rmre = DB::table(config('alias.rmre'))
                    ->where([
                        ['work_order_id',$v->work_order_id],
                    ])
                    ->select('is_merger','material_requisition_id')
                    ->first();

                if(!empty($material_rmre)){
                    $material = DB::table(config('alias.rmre'))
                        ->where([
                            ['material_requisition_id',$material_rmre->material_requisition_id],
                            ['material_id',$v->material_id],
                        ])
                        ->select('material_id','material_code','material_requisition_id')
                        ->addSelect(DB::raw('SUM(rated_qty) as sum'))
                        ->first();
                    if($v->rated_qty == 0 && $material && $material_rmre->is_merger == 1){
                        $v->rated_qty = $material->sum;
                    }
                }
            }

            // 添加 物料的定额领料   解决iqc质检补料审核查看计划计划数量  shuaijie.feng 6.3/2019
            $mate_code = DB::table(config('alias.rwoi'))->select('qty')
                ->where([
                    ['work_order_id',$v->work_order_id],
                    ['material_code',$v->material_code],
                ])
                ->first();
            // 为0时取物料的定额数量  不为0取保存的字段   shuaijie.feng 6.3/2019
            if($v->rated_qty == 0 && $mate_code){
                $v->rated_qty = $mate_code->qty;
            }
            // 判断是否为补料，为补料时做操作， shuaijie.feng 7.12/2019
            $v->type == 7 ?($v->repairstatus == 0 ? $v->creator_cn_name = '': $v->creator_cn_name): $v->creator_cn_name;
        }
        // 进行查找销售订单+行项 + 物料编码 +  仓储地点   shuaijie.feng 7.26
        $select_res = [];
        foreach ($objs as $k=>$v){
            if($v->type==7){
                $select_res[] = DB::table(config('alias.rmr').' as rmr')
                    ->leftJoin(config('alias.rmri').' as rmri','rmr.id','=','rmri.material_requisition_id')
                    ->leftJoin(config('alias.rmrib').' as rmrib','rmr.id','=','rmrib.material_requisition_id')
                    ->leftJoin(config('alias.rwo').' as rwo','rmr.work_order_id','=','rwo.id')
                    ->where([
                        ['rmr.sale_order_code',$v->sale_order_code], // 销售订单
                        ['rmr.sale_order_project_code',$v->sale_order_project_code], // 销售行项
                        ['rmr.factory_id',$v->factory_id], // 工厂
                        ['rmr.line_depot_id',$v->line_depot_id], // 线边库
                        ['rmri.material_code',$v->material_code], // 物料编码
                        ['rmr.is_delete',0],
                        ['rmr.type',7], // 是补料的
                    ])
                    ->select([
                        'rmr.code',
                        'rmr.sale_order_code',
                        'rmr.sale_order_project_code',
//                        'rmr.product_order_code', //  生产订单
                        'rmri.material_code', // 物料编码
                        'rmri.demand_qty',// 需求数量
                        'rwo.number', // 工单
                        'rmrib.actual_receive_qty', // 实发数量
                    ])
                    ->get()->toArray();
            }
        }
         // 进行查找销售订单+行项 + 物料编码 +  仓储地点     shuaijie.feng 7.26
        $select_res_arr = '';           // 定义值
        if (!empty($select_res[0])){
            foreach ($select_res as $item){
                foreach ($item as $k=>$v){
                    $select_res_arr .= '工单:'.$v->number.' 需求数量:'.$v->demand_qty.' 实发数量:'.$v->actual_receive_qty.'  ';
                }
            }
        }

        // 根据物料的分类查询 查询参与转厂的物料，获取到物料的之前的领料地点
        foreach ($objs as $k=>&$v)
        {
            // 根据物料分类查询到物料组
            $code_res = DB::table('ruis_material'.' as rm')
                ->leftJoin('ruis_material_category'.' as rmc','rm.material_category_id','=','rmc.id')
                ->select('code')
                ->where('item_no',$v->material_code)
                ->first();
            if(empty($code_res)) continue;
            // 查询生产订单
            $product_res = DB::table('ruis_production_order')
                ->where([
                    ['id',$v->product_order_id],
                    ['is_delete',0],
                    ['on_off',1],
                ])
                ->select('WERKS')
                ->first();
            if(empty($product_res)) continue;
            // 根据物料组查询到该物料的领料地点
            $code_res_arr = DB::table('ruis_materials_warehouse')
                ->select('storage_code')
                ->where([
                    ['code',$code_res->code],
//                    ['factory_code',$v->factory_code],
                    ['factory_code',$product_res->WERKS]
                ])
                ->first();
            // 为空 则跳过
            if(empty($code_res_arr)) continue;
            // 如果 两者不同则 追加
            if($v->send_depot != $code_res_arr->storage_code)
            {
                $v->send_depot .= '('.$code_res_arr->storage_code.')';
            }
        }

        $wo_nubmer_list_implode = '';
       if(!empty($material)){
           // 查询参与合并领料
           $wo_nubmer_list = DB::table(config('alias.rmre').' as rmre')
               ->leftJoin(config('alias.rwo').' as rwo','rwo.id','=','rmre.work_order_id')
               ->where([
                   ['rmre.material_requisition_id',$material->material_requisition_id],
                   ['material_id',$material->material_id],
               ])
               ->select('rwo.number')
               ->get();
           $wo_nubmers = [];
           $wo_nubmer = obj2array($wo_nubmer_list);
           foreach ($wo_nubmer as $k=>$v)
           {
               $wo_nubmers[] = $v['number'];
           }
           $wo_nubmer_list_implode = implode('//',$wo_nubmers);
       }
        //查询工单领料信息
        $rmre_list = DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rmre.work_order_id')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
            ->select(
                'rmre.material_id',
                'rmre.special_stock',
                'rwo.number as work_order_code',
                'rpo.number as product_order_code',
                'rpo.sales_order_code',
                'rpo.sales_order_project_code'
            )
            ->where('rmre.material_requisition_id',$input[$this->apiPrimaryKey])
            ->get();
        $ref_rmre_list = [];
        foreach ($rmre_list as $k=>$v){
            if(isset($ref_rmre_list[$v->material_id.'-'.$v->special_stock.'-'.$v->sales_order_code.'-'.$v->sales_order_project_code])){
                $ref_rmre_list[$v->material_id.'-'.$v->special_stock.'-'.$v->sales_order_code.'-'.$v->sales_order_project_code][] = $v;
            }else{
                $ref_rmre_list[$v->material_id.'-'.$v->special_stock.'-'.$v->sales_order_code.'-'.$v->sales_order_project_code] = [$v];
            }
        }
        /**
         * 获取批次表
         */
        $batch_objs = DB::table(config('alias.rmrib') . ' as rmrib')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.id', '=', 'rmrib.item_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmrib.bom_unit_id')
            ->leftJoin(config('alias.rsi') . ' as rsi', 'rsi.id', '=', 'rmrib.inve_id')
            ->select([
                'rmrib.id as batch_id',
                'rmrib.bl_qty',
                'rmrib.material_requisition_id',
                'rmrib.item_id',
                'rmrib.order',
                'rmrib.batch',
                'rmrib.actual_send_qty',
                'rmrib.base_unit',
                'rmrib.actual_receive_qty',
                'rmrib.bom_unit_id',
                'rmri.remark',
                'ruu.commercial as bom_unit',
                'rsi.storage_validate_quantity as storage_count',
                'rmri.material_id',
                'rmc.code as category_code',
                'rm.item_no as material_code',
                'rmri.item_is_delete', // 行项是否删除
            ])
            ->where('rmrib.material_requisition_id', '=', $input[$this->apiPrimaryKey])
            ->get();
        $batchArr = [];
        foreach ($batch_objs as &$batch) {
            //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
            $code_pre = substr($batch->category_code, 0,4);
            $batch->m_display = 0;
            if($code_pre == '3002' && $batch->bom_unit_id == '96'){
                //针对批次为1，进行消耗，从仓库收集的表中获得比例
                $switch = config('app.batch1');
                if($batch->batch == 1 && $switch == 1){
//                    $where2 = [];
//                    $where2[] = ['rrb.material_code','=',$batch->material_code];
//                    $where2[] = ['rrb.lot','=',$batch->batch];
//                    $where2[] = ['rrb.conversion','>=','0'];
//                    $conversion = DB::table('ruis_robe_batch as rrb')->select('conversion')
//                        ->where($where2)
//                        ->first();
                    //获取米／公斤的转换比例
                    $Units = new Units();
                    $base_qty = $Units->getExchangeUnitValueById($batch->bom_unit_id, '135', $batch->actual_send_qty, $batch->material_id);
                    $format_base_qty = floor($base_qty * 1000) / 1000;

                    $batch->m_value = $format_base_qty;
                    $batch->m_unit = 'M';
                    $batch->m_display = 1;

                }else {
                    //获取米／公斤的转换比例
                    $where = [];
                    $where[] = ['rwdoi.material_id', '=', $batch->material_id];
                    $where[] = ['rwdoi.lot', '=', $batch->batch];
                    $where[] = ['rwdoi.type', '=', '-1'];
                    $where[] = ['rwdoi.conversion', '>=', '0'];
                    $conversion = DB::table(config('alias.rwdoi') . ' as rwdoi')->select('conversion')
                        ->where($where)
                        ->first();
                    if(!isset($conversion) || empty($conversion) || $conversion->conversion == 0){
                        $batch->m_display = 0;
                    }else{
                        //取一位小数
                        $batch->m_value = floor($batch->actual_send_qty / $conversion->conversion * 1000) / 1000;
                        $batch->m_unit = 'M';
                        $batch->m_display = 1;
                    }
                }
            }

            if (isset($batch->item_id)) {
                $batchArr[$batch->item_id][] = $batch;
            }
        }
        $data = [];
        $sales_order_codes = [];
        $sales_order_project_codes = [];
        foreach ($objs as $key => $value) {
            if (empty($data)) {
                $data['id'] = $value->id;
                $data['code'] = $value->code;
                $data['type'] = $value->type;
                $data['line_depot_id'] = $value->line_depot_id;
                $data['line_depot_name'] = $value->line_depot_name;
                $data['send_depot'] = $value->send_depot;
                $data['work_order_code'] = $value->work_order_code;
                $data['workbench_code'] = $value->workbench_code;
                $data['workbench_name'] = $value->workbench_name;
                $data['ctime'] = date('Y-m-d H:i:s', $value->ctime);
                $data['time'] = date('Y-m-d H:i:s', $value->time);
                $data['dispatch_time'] = !empty($value->dispatch_time) ? date('Y-m-d H:i:s', $value->dispatch_time):0;
                $data['employee_name'] = $value->type == 7?(empty($value->creator_cn_name)?'':$value->creator_cn_name):$value->employee_name;
                $data['employee_id'] = $value->employee_id;
                $data['factory_name'] = $value->factory_name;
                $data['factory_code'] = $value->factory_code;
                $data['factory_id'] = $value->factory_id;
                $data['status'] = $value->status;
                $data['push_type'] = $value->push_type;
//                $data['sales_order_code'] = $value->sale_order_code;
//                $data['sales_order_project_code'] = $value->sale_order_project_code;
                $data['product_order_id'] = $value->product_order_id;
                $data['product_order_code'] = $value->product_order_code;
                $data['bench_no'] = $value->bench_no;
                $plan_start_time = $value->is_depot_picking == 1 ? $value->plan_start_time : $value->wo_plan_start_time;
                $data['plan_start_time'] = empty($plan_start_time) ? '' : date('Y-m-d H:i:s', $plan_start_time);
            }
            if (!empty($value->item_id)) {
                if(!in_array($value->sales_order_code,$sales_order_codes)) $sales_order_codes[] = $value->sales_order_code;
                if(!in_array($value->sales_order_project_code,$sales_order_project_codes)) $sales_order_project_codes[] = $value->sales_order_project_code;
                $temp = [
                    'item_id' => $value->item_id,
                    'line_project_code' => $value->line_project_code,
                    'material_id' => $value->material_id,
                    'material_code' => $value->material_code,
                    'material_name' => $value->material_name,
                    'rated_qty' => $value->rated_qty,
                    'demand_qty' => $value->demand_qty,
                    'demand_unit' => $value->demand_unit,
                    'depot_id' => get_value_or_default($value, 'depot_id', 0),
                    'depot_name' => get_value_or_default($value, 'depot_name', ''),
                    'depot_code' => get_value_or_default($value, 'depot_code', ''),
                    'special_stock' => $value->is_special_stock,
                    'remark' => $value->remark,
                    'reason' => $this->getReason(explode(',', $value->reason)),
                    'qc_reason' => $this->getReason(explode(',', $value->qc_reason)),
                    'custom_inspur_sale_order_code' => $value->custom_inspur_sale_order_code,
                    'old_material_code' => $value->inspur_material_code,
                    'batches' => isset($batchArr[$value->item_id]) ? $batchArr[$value->item_id] : [],
                    'attributes' => $value->attribute,
                    'item_is_delete' => $value->item_is_delete
                ];
                $temp['wo_po_so'] = !isset($ref_rmre_list[$value->material_id.'-'.$value->is_special_stock.'-'.$value->sales_order_code.'-'.$value->sales_order_project_code]) ? [] : $ref_rmre_list[$value->material_id.'-'.$value->is_special_stock.'-'.$value->sales_order_code.'-'.$value->sales_order_project_code];
                //将单位转为sap的单位
                $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->demand_unit_id, $value->demand_qty);
                if ($baseUnitArr['base_qty'] == -1) {
                    $temp['sap_demand_qty']='';
                    $temp['sap_demand_unit']='';
                }else{
                    $temp['sap_demand_qty']=$baseUnitArr['base_qty'];
                    $temp['sap_demand_unit']=$baseUnitArr['base_unit'];
                }
                /**
                 * 单位转换 这个是转换sap另一个单位 针对千克转换米
                 *  不是千克转换米，取SAP转换关系
                 */
                $bom = $this->RelationalTransformation($value->material_id,$value->material_code,$value->demand_qty,$value->demand_unit);
                if($bom == 0){
                    $temp['lc_demand_qty'] = '';
                    $temp['lc_demand_unit'] = '';
                }else{
                    $temp['lc_demand_qty'] = $bom['sum'];
                    $temp['lc_demand_unit'] = $bom['lc_unit'];
                }
                //差异原因
                $MKPF_BKTXT_ARR1 = DB::table('ruis_work_declare_order_item')
                    ->select('MKPF_BKTXT','diff_remark')
                    ->where(['declare_id'=>$value->declare_id,'material_id'=>$value->material_id,'type'=>1])
                    ->get();
                if($MKPF_BKTXT_ARR1)
                {
                    $MKPF_BKTXT = '';
                    $diff_remark = '';
                    foreach ($MKPF_BKTXT_ARR1 as $v)
                    {
                        $MKPF_BKTXT .= ','.$v->MKPF_BKTXT;
                        if(!empty($v->diff_remark)) $diff_remark .= $v->diff_remark.';';
                    }
                    $MKPF_BKTXT_ARR = explode(',',$MKPF_BKTXT);
                    $rps = DB::table(config('alias.rps'))
                        ->select(['id','name','description'])
                        ->whereIn('id',$MKPF_BKTXT_ARR)
                        ->get();
                    $temp['MKPF_BKTXT_ARR'] = $rps;
                    $temp['diff_remark'] = $diff_remark;
                }
                else
                {
                    $temp['MKPF_BKTXT_ARR'] = [];
                    $temp['diff_remark'] = [];
                }

                //如果备注被修改过，拿修改过的备注
                if(!empty($value->remark))
                {
                    $temp['diff_remark'] = $value->remark;
                }

                if($value->type == '7' && $value->push_type== '0' && $value->status == '4')
                {
                    // 获取总的比例
                    $work_order_id = DB::table(config('alias.rmr'))->where('id',$input['material_requisition_id'])->value('work_order_id');
                    $all_bl_aty = DB::table($this->table . ' as rmr')
                        ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                        ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                        ->where([
                            ['rmr.type',7],
                            ['rmr.push_type',0],
                            ['rmr.work_order_id', '=', $work_order_id],
                            ['rmr.status',4],
                            ['rmri.material_id',$temp['material_id']],
                        ])
                        ->sum('rmrib.actual_receive_qty');
                    $temp['all_bl_aty'] = $all_bl_aty;

                    $rated_qty = $this->getAllRatedQty($value->work_order_code,$value->material_id);
                    if($rated_qty != 0)
                    {
                        $temp['rated_qty'] = $rated_qty;
                    }
                }


                $data['materials'][] = $temp;
            }
        }
        if(count($sales_order_codes) == 1){
            $data['sales_order_code'] = $sales_order_codes[0];
        }else{
            $data['sales_order_code'] = '';
        }
        if(count($sales_order_project_codes) == 1){
            $data['sales_order_project_code'] = $sales_order_project_codes[0];
        }else{
            $data['sales_order_project_code'] = '';
        }

        $all_material = DB::table(config('alias.rwoi').' as rwoi')
            ->leftJoin(config('alias.rm').' as rm','rm.item_no','=','rwoi.material_code')
            ->select([
                'rwoi.material_id', // 物料id
                'rwoi.material_code', // 物料id
                'rm.name', // 物料名称
            ])
            ->where([
                ['type', '1'],
                ['work_order_id',$value->work_order_id]
            ])->get();
        $producename = [];
        foreach ($all_material as $k=>$v){
            $producename[] = $v->name;
        }
        $data['producename'] = [];
        $data['producename'] = implode('/-/',$producename);
        $stmt = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rmr.creator_id')
            ->select([
                'rmr.id',
                'rrad.id as admin_id',
                'rrad.cn_name as cn_name',
                'rrad.name as creator_name'
            ])
            ->where('rmr.id',$data['id'])->first();
        $data['cn_name'] = $stmt->cn_name;
        $data['creator_name'] = $stmt->creator_name;
        $data['admin_id'] = $stmt->admin_id;
        $data['wo_nubmers'] = $wo_nubmer_list_implode;
        $data['select_res_arr'] = $select_res_arr;
        $data['delete_reason'] = $objs[0]->delete_reason;
        //处理生产补料线边仓问题
        if(empty($data['line_depot_id']))
        {
            $res = DB::table('ruis_work_order as rwo')
                ->select('rsd.id','rsd.name')
                ->leftJoin('ruis_workshop as rws','rwo.work_shop_id','rws.id')
                ->leftJoin('ruis_storage_depot as rsd','rws.address','rsd.code')
                ->where('rwo.id',$objs[0]->work_order_id)
                ->first();
            if($res)
            {
                $data['line_depot_id'] = $res->id;
                $data['line_depot_name'] = $res->name;
            }
        }
        return $data;
    }

    /**
     * 获取预选方案
     *
     * @param $reasonIDArr
     * @return array|mixed
     */
    private function getReason($reasonIDArr)
    {
        if (empty($reasonIDArr)) {
            return [];
        }
        $objList = DB::table(config('alias.rps'))
            ->select(['id', 'name', 'description'])
            ->whereIn('id', $reasonIDArr)
            ->get();
        return obj2array($objList);
    }

    /**
     * 获取领料单数据（推送给SAP）
     *
     * @param int $id 领料单ID
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     * @since 2018-10-12 添加发出线边库 send_depot_code
     */
    public function getMaterialRequisition($id)
    {
        $isDepotPicking = $this->checkIsDepotPicking($id);
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
//            ->leftJoin(config('alias.rsd') . ' as rsd2', 'rsd2.id', '=', 'rmr.send_depot_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
//            ->leftJoin(config('alias.rtnomc') . ' as rtnomc', 'rtnomc.new_code', '=', 'rmri.material_code')
            ->leftJoin('ruis_rbac_admin' . ' as rra', 'rra.id', '=', 'rmr.creator_id') // 关联admin 查询创建人
            ->select([
                'rmr.code as mr_code',
                'rmr.time',
                'rmr.from',
                'rmr.type',
                'rmr.product_order_code',  //PO
                'rmr.sale_order_code',  // 销售订单号
                'rmr.sale_order_project_code', //销售订单项目号
                'rmr.send_depot',
                'rmr.plan_start_time',
                'rmr.is_depot_picking',
                'rmr.dispatch_time',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwo.number as work_order_code',
                'rwo.plan_start_time as wo_plan_start_time',  //领料到货时间
                'rsd.code as line_depot_code',
//                'rsd2.code as send_depot_code',
                'rmri.line_project_code',
                'rmri.custom_inspur_sale_order_code',
                'rmri.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rmri.demand_qty',
                'ruu_d.id as bom_unit_id',
                'ruu_d.commercial as demand_unit', // bom单位
//                'rmri.actual_send_qty',
//                'rmri.actual_send_unit',
//                'rmri.actual_receive_qty',
                'rmri.wait_send_qty',
                'rmri.over_send_qty',
                'rmri.is_special_stock',
                'rpo.inspur_sales_order_code',
                'rmc.code as category_code',
//                'rtnomc.old_code',
                'rmr.creator_id', // 创建人id
                'rra.name as creator_name', // 创建人名称
                'rra.cn_name as creator_cn_name', // 创建人名称
            ])
            ->where([
                ['rmr.id', '=', $id],
                ['rmr.status', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 1],
                ['rmri.item_is_delete', '<>', 1],// 增加 行项是否删除  1:被删除   0:未删除
            ])
            ->get();
        if (empty(obj2array($objs))) {
            TEA('2432');    // 不允许推送或已推送
        }
        $sendData = [];
        foreach ($objs as $key => $value) {

            // bom单位转为基本单位
            if (!$isDepotPicking) {
                //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
                $code_pre = substr($value->category_code, 0,4);
                $pao_change = 0;
                if($code_pre == '3002' && $value->bom_unit_id == '96'){
                    //获取米／公斤的转换比例
                    $Units = new Units();
                    $base_qty = $Units->getExchangeUnitValueById($value->bom_unit_id, '135', $value->demand_qty, $value->material_id);
                    $format_base_qty = floor($base_qty * 1000) / 1000;
                    $baseUnitArr =  [
                        'base_qty' => $format_base_qty,
                        'base_unit_id' => '135',
                        'base_unit' => 'M'
                    ];
                    $pao_change = 1;
                }

                if($pao_change == 0){
                    $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $value->demand_qty);
                }
//                // bom单位转为基本单位
//                $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $value->demand_qty);
                if ($baseUnitArr['base_qty'] == -1) {
                    TEA(2600);
                }
            }
//            return $baseUnitArr['base_qty'];
//            $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $value->demand_qty);
//            if ($baseUnitArr['base_qty'] == -1) {
//                TEA(2600);
//            }
            $plan_start_time = $value->is_depot_picking == 1 ? $value->plan_start_time : $value->wo_plan_start_time;
            $oldMaterialObj = DB::table(config('alias.rtnomc'))
                ->select('old_code')
                ->where('new_code', $value->material_code)
                ->first();

            //合并领料单的销售订单号和行项号拼接 Add By Bruce.Chu
//            if(empty($value->sale_order_code)){
//                //拿到销售订单号集合
//                $sales_order_code=DB::table(config('alias.rmre').' as rmre')
//                    ->leftJoin(config('alias.rwo').' as wo','wo.id','rmre.work_order_id')
//                    ->leftJoin(config('alias.rpo').' as po','po.id','wo.production_order_id')
//                    ->where([['rmre.material_requisition_id',$id],['rmre.material_code',$value->material_code]])
//                    ->pluck('po.sales_order_code');
//                //去重 转化为字符串 销售订单行项号 同理
//                $value->sale_order_code=implode(',',array_unique(obj2array($sales_order_code)));
//                //销售订单行项号 同理
//                $sales_order_project_code=DB::table(config('alias.rmre').' as rmre')
//                    ->leftJoin(config('alias.rwo').' as wo','wo.id','rmre.work_order_id')
//                    ->leftJoin(config('alias.rpo').' as po','po.id','wo.production_order_id')
//                    ->where([['rmre.material_requisition_id',$id],['rmre.material_code',$value->material_code]])
//                    ->pluck('po.sales_order_project_code');
//                $value->sale_order_project_code=implode(',',array_unique(obj2array($sales_order_project_code)));
//            }
            $temp = [
                'LLDH' => $value->mr_code,
                'LLHH' => $value->line_project_code,
                'LLLX' => $this->intToType($value->type),
                'RQDAT' => date('Ymd', time()),    //领料到货时间
//                'LLRQ' => date('Ymd', $value->time),
//                'LLSJ' => date('His', $value->time),
                'LLRQ' => date('Ymd',$value->dispatch_time),//日期时间更改为 前端传参 Modify By Bruce.Chu
                'LLSJ' => date('His',$value->dispatch_time),
                'LLR' => $value->type == 7?(empty($value->creator_cn_name)?$value->creator_name:$value->creator_cn_name):$value->employee_name,
                'WERKS' => $value->factory_code,
                'XNBK' => $value->line_depot_code,     //需求线边库
//                'GOGNW' => $value->workbench_code,
                'GONGW' => empty($value->workbench_code) ? '' : $value->workbench_code,
                'GONGD' => get_value_or_default($value, 'work_order_code', ''),
                'FCKCDD' => $value->send_depot,     //发出库存地点
                'AUFNR' => $value->product_order_code,      //订单号--PO
                'KDAUF' => $value->is_special_stock == 'E' ? $value->sale_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $value->is_special_stock == 'E' ? $value->sale_order_project_code : '',    //销售订单项目
                'LCORD' => $value->sale_order_code,     // sap需求 去除判断，全部都要传 shuaijie.feng 2019/9.20
                'BISMT' => $oldMaterialObj->old_code ?? '',
                'MATNR' => $value->material_code,
                'MAKTX' => $value->material_name,
//                'LIFNR' => '',    //供应商或债权人的账号
//                'NAME1' => '',    //供应商描述
//                'XQSL' => $value->demand_qty,
                'XQSL' => $isDepotPicking ? $value->demand_qty : $baseUnitArr['base_qty'],
                'XQSLDW' => $isDepotPicking ? $value->demand_unit : (empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit'])),
//                'XQSL' => $baseUnitArr['base_qty'],
//                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),
//                'SFHSL' => '',      //实发数量
//                'SFHSLDW' => '',    //实发数量单位
//                'SSSL' => '',       //实收数量
//                'DFSL' => '',       //待发数量
//                'CFSL' => '',       //超发数量
//                'FLZT' => 1,        //发料状态
//                'BUDAT' => '',    //凭证中的过账日期
//                'BZ' => '',
                'XTLY' => 1,  //系统来源
//                'SOBKZ' => $value->is_special_stock,  //特殊库存
                'RQTIM'=>date('His',time()),
            ];
            $sendData[] = $temp;
        }
        if (empty($sendData)) {
            TEA('2421');
        }
        return $sendData;
    }

    public function getMrIsMergerPicking($id){
        $is_merger_picking = DB::table(config('alias.rmr'))->where('id',$id)->value('is_merger_picking');
        return $is_merger_picking;
    }

    public function getSapMergerPickingData($id){
        $field = [
            'rmr.code as mr_code',
            'rmri.line_project_code',
            'rmr.type',
            'rmr.dispatch_time',
            'rmr.bench_no',
            're.name as employee_name',
            'rf.code as factory_code',
            'rsd.code as line_depot_code',
            'rmr.send_depot',
            'rmri.is_special_stock',
            'rmri.sales_order_code',
            'rmri.sales_order_project_code',
            'rmri.demand_qty',
            'rmri.demand_unit_id as bom_unit_id',
            'rmri.material_id',
            'rmri.material_code',
            'rmri.material_name',
            'rmri.inspur_material_code',
            'rmri.custom_inspur_sale_order_code',
            'rmc.code as category_code',
        ];
        $mr_material_list = DB::table(config('alias.rmri').' as rmri')
            ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmri.material_requisition_id')
            ->leftJoin(config('alias.re').' as re','re.id','rmr.employee_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rmr.factory_id')
            ->leftJoin(config('alias.rsd').' as rsd','rsd.id','rmr.line_depot_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rmri.material_id')
            ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
            ->where([
                ['rmr.id', '=', $id],
                ['rmr.status', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 1]
            ])
            ->select($field)
            ->get();
        if(empty($mr_material_list)) TEA('2432');

        $sendData = [];
        foreach ($mr_material_list as $k=>$v){
            //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
            $code_pre = substr($v->category_code, 0,4);
            $pao_change = 0;
            if($code_pre == '3002' && $v->bom_unit_id == '96'){
                //获取米／公斤的转换比例
                $Units = new Units();
                $base_qty = $Units->getExchangeUnitValueById($v->bom_unit_id, '135', $v->demand_qty, $v->material_id);
                $format_base_qty = floor($base_qty * 1000) / 1000;
                $baseUnitArr =  [
                    'base_qty' => $format_base_qty,
                    'base_unit_id' => '135',
                    'base_unit' => 'M'
                ];
                $pao_change = 1;
            }

            if($pao_change == 0){
                $baseUnitArr = $this->bomUnitToBaseUnit($v->material_id, $v->bom_unit_id, $v->demand_qty);
            }

            if ($baseUnitArr['base_qty'] == -1) {
                TEA(2600);
            }
            $temp = [
                'LLDH' => $v->mr_code,
                'LLHH' => $v->line_project_code,
                'LLLX' => $this->intToType($v->type),
                'RQDAT' => date('Ymd', time()),    //领料到货时间
                'LLRQ' => date('Ymd',$v->dispatch_time),//日期时间更改为
                'LLSJ' => date('His',$v->dispatch_time),
                'LLR' => $v->employee_name,
                'WERKS' => $v->factory_code,
                'XNBK' => $v->line_depot_code,     //需求线边库
                'GONGW' => $v->bench_no,
                'GONGD' => '',
                'FCKCDD' => $v->send_depot,     //发出库存地点
                'AUFNR' => '',      //订单号--PO
                'KDAUF' => $v->is_special_stock == 'E' ? $v->sales_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $v->is_special_stock == 'E' ? $v->sales_order_project_code : '',    //销售订单项目
                'LCORD' => $v->custom_inspur_sale_order_code ,
                'BISMT' => $v->inspur_material_code,
                'MATNR' => $v->material_code,
                'MAKTX' => $v->material_name,
//                'LIFNR' => '',    //供应商或债权人的账号
//                'NAME1' => '',    //供应商描述
//                'XQSL' => $value->demand_qty,
                'XQSL' => $baseUnitArr['base_qty'],
                'XQSLDW' => strtoupper($baseUnitArr['base_unit']),
//                'XQSL' => $baseUnitArr['base_qty'],
//                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),
//                'SFHSL' => '',      //实发数量
//                'SFHSLDW' => '',    //实发数量单位
//                'SSSL' => '',       //实收数量
//                'DFSL' => '',       //待发数量
//                'CFSL' => '',       //超发数量
//                'FLZT' => 1,        //发料状态
//                'BUDAT' => '',    //凭证中的过账日期
//                'BZ' => '',
                'XTLY' => 1,  //系统来源
                'SOBKZ' => $v->is_special_stock,  //特殊库存
                'RQTIM'=>date('His',time()),
            ];
            $sendData[] = $temp;
        }
        if(empty($sendData)) TEA('2421');
        return $sendData;
    }
    /**
     * 获取退料单数据（推送给SAP）
     * @param $id
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getReturnMaterial($id)
    {
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
//            ->leftJoin(config('alias.rsd') . ' as rsd2', 'rsd2.id', '=', 'rmr.send_depot_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmrib.bom_unit_id')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
//            ->leftJoin(config('alias.rtnomc') . ' as rtnomc', 'rtnomc.new_code', '=', 'rmri.material_code')
            ->select([
                'rmr.code as mr_code',
                'rmr.time',
                'rmr.from',
                'rmr.type',
                'rmr.product_order_code',  //po
                'rmr.sale_order_code',  // 销售订单号
                'rmr.sale_order_project_code', //销售订单项目号
                'rmr.send_depot', //发出库存地点
                'rmr.is_merger_picking',
                'rmri.line_project_code',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwo.number as work_order_code',
                'rwo.plan_start_time',      //领料到货时间
                'rsd.code as line_depot_code',
                'rmri.line_project_code',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rm.id as material_id',
                'rmri.demand_qty',
                'ruu_d.commercial as base_unit',
                'rmri.wait_send_qty',
                'rmri.over_send_qty',
                'rmri.is_special_stock',
                'rmri.sales_order_code as item_sales_order_code',
                'rmri.sales_order_project_code as item_sales_order_project_code',
                'rmrib.order',
                'rmrib.batch',
                'rmrib.actual_send_qty as return_number',
//                'rmrib.base_unit',
                'rmrib.bom_unit_id',
                'rpo.inspur_sales_order_code',
                'rmc.code as category_code',
//                'rtnomc.old_code',

            ])
            ->where([
                ['rmr.id', '=', $id],
//                ['rmr.status', '=', 2],
                ['rmr.status', '=', 1],     // 11.23 修改： 生成退料单 后就推送 状态：1->2
                ['rmr.push_type', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmr.type', '=', 2],
            ])
            ->get();

        if (empty(obj2array($objs))) {
            TEA('2432');    // 不允许推送或已推送
        }
        $sendData = [];
        foreach ($objs as $key => $value) {

            // 合并退料单 退料单 增加销售订单及行项   update shuaijie.feng  18/10/2019 10点33分
            $value->sale_order_code = empty($value->sale_order_code) ? $value->item_sales_order_code: $value->sale_order_code;
            $value->sale_order_project_code = empty($value->sale_order_project_code) ? $value->item_sales_order_project_code: $value->sale_order_project_code;

            //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
            $code_pre = substr($value->category_code, 0,4);
            $pao_change = 0;
            if($code_pre == '3002' && $value->bom_unit_id == '96'){
                //针对批次为1，进行消耗，从仓库收集的表中获得比例
                $switch = config('app.batch1');
                if($value->batch == 1 && $switch == 1){
//                    $where2 = [];
//                    $where2[] = ['rrb.material_code','=',$value->material_code];
//                    $where2[] = ['rrb.lot','=',$value->batch];
//                    $where2[] = ['rrb.conversion','>=','0'];
//                    $conversion = DB::table('ruis_robe_batch as rrb')->select('conversion')
//                        ->where($where2)
//                        ->first();

                    //获取米／公斤的转换比例
                    $Units = new Units();
                    $base_qty = $Units->getExchangeUnitValueById($value->bom_unit_id, '135', $value->return_number, $value->material_id);
                    $format_base_qty = floor($base_qty * 1000) / 1000;

                    $baseUnitArr['base_qty'] = $format_base_qty;
                    $baseUnitArr['base_unit'] = 'M';
                    $pao_change = 1;
                }else {
                    //获取米／公斤的转换比例
                    $where = [];
                    $where[] = ['rwdoi.material_id', '=', $value->material_id];
                    $where[] = ['rwdoi.lot', '=', $value->batch];
                    $where[] = ['rwdoi.type', '=', '-1'];
                    $where[] = ['rwdoi.conversion', '>=', '0'];
                    $conversion = DB::table(config('alias.rwdoi') . ' as rwdoi')->select('conversion')
                        ->where($where)
                        ->first();

                    if(!isset($conversion) || empty($conversion) || $conversion->conversion == 0){
                        $pao_change = 0;
                    }else{
                        //取一位小数
                        $baseUnitArr['base_qty'] = floor($value->return_number / $conversion->conversion * 1000) / 1000;
                        $baseUnitArr['base_unit'] = 'M';
                        $pao_change = 1;
                    }
                }
            }

            if($pao_change == 0){
                $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $value->return_number);
            }

            $oldMaterialObj = DB::table(config('alias.rtnomc'))
                ->select('old_code')
                ->where('new_code', $value->material_code)
                ->first();
            $temp = [
                'LLDH' => $value->mr_code,
                'LLHH' => str_pad($value->line_project_code, 5, '0', STR_PAD_LEFT).str_pad($value->order, 5, '0', STR_PAD_LEFT),
                'LLLX' => $this->intToType($value->type),
                'RQDAT' => date('Ymd', time()),    //领料到货时间
                'LLRQ' => date('Ymd', $value->time),
                'LLSJ' => date('His', $value->time),
                'LLR' => $value->employee_name,
                'WERKS' => $value->factory_code,
                'XNBK' => $value->line_depot_code,     //需求线边库
                'GONGW' => '',
                'GONGD' => $value->work_order_code,
                'FCKCDD' => $value->send_depot,     //发出库存地点
                'AUFNR' => $value->product_order_code,      //订单号 PO
                'KDAUF' => $value->is_special_stock == 'E' ? $value->sale_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $value->is_special_stock == 'E' ? $value->sale_order_project_code : '',    //销售订单项目
                'LCORD' => $value->sale_order_code, // sap需求 去除判断，全部都要传 shuaijie.feng 2019/9.20
                'BISMT' => $oldMaterialObj->old_code ?? '',
                'MATNR' => $value->material_code,
                'MAKTX' => $value->material_name,
//                'XQSL' => $value->return_number,
                'XQSL' => $baseUnitArr['base_qty'],
                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),
                'XTLY' => 1,  //系统来源
                'BATCH' => $value->batch,
                'RQTIM'=>date('His',time()),
            ];
            $sendData[] = $temp;
        }
        if (empty($sendData)) {
            TEA('2421');
        }
        return $sendData;
    }

    /**
     * 获取实时库存
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     * @since 2018-10-14 lester.you 返回值添加批次
     */
    public function getMaterialStorage($input)
    {
        if (empty($input['material_ids'])) TEA('700', 'material_ids');
        $material_ids_arr = array_unique(explode(',', $input['material_ids']));
        $material_codes = ['3001','300101','300103','300105','300107','300199','32','3201','3203','3204','6101'];
        /**
         * 1.查询所有的仓库(默认)
         * 2.查询当前仓库
         * 3.查询非当前仓库
         * 注：2,3 需要传入当前仓库字段 line_depot_id
         */
        if (!isset($input['type'])) $input['type'] = 1;
        if (in_array($input['type'], [2, 3])) {
            if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
            $depotObj = DB::table(config('alias.rsd'))
                ->select(['id', 'plant_id as factory_id'])
                ->where([
                    ['id', '=', $input['line_depot_id']],
//                    ['is_line_depot', '=', 1]
                ])
                ->first();
            if (empty($depotObj)) TEA(8212);
            $input['factory_id'] = $depotObj->factory_id;
        }

        // 验证 物料id是否存在
        $material_count = DB::table(config('alias.rm'))
            ->whereIn('id', $material_ids_arr)
            ->count();
        if ($material_count != count($material_ids_arr)) TEA('700', 'material_ids');

        //验证 工单
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        $wo_obj = DB::table(config('alias.rwo'))
            ->select(['id', 'number as work_order_code'])
            ->where('id', $input['work_order_id'])
            ->first();
        if (empty($wo_obj)) TEA('700', 'work_order_id');
        $input['work_order_code'] = $wo_obj->work_order_code;

        //如果销售订单为空，查询的时候也要带上条件，值为空字符串
        $input['sale_order_code'] = empty($input['sale_order_code']) ? '' : $input['sale_order_code'];
        // 没有检测到销售订单行项 或者为空 则为空字符串 shuaijie.feng 10.23/2019
        $input['sales_order_project_code'] = !isset($input['sales_order_project_code']) || empty($input['sales_order_project_code']) ? '' : $input['sales_order_project_code'];

        /**
         * @todo 流转品查询的时候 PO SO WO 均为空 12.09
         */
        $builder = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.material_id',
                'rsi.lot as batch',
                'rsi.depot_id',
                'rsi.unit_id',
                'rsi.sale_order_code',
                'rsi.sales_order_project_code',
                'rsi.wo_number as work_order_code',
                'rsi.po_number as product_order_code',
                'rsi.storage_validate_quantity as storage_number',
                'ruu.commercial as unit_name',
                'rsd.code as depot_code',
                'rsd.name as depot_name',
                'rf.code as factory_code',
                'rf.name as factory_name',
            ])
//            ->addSelect(DB::raw('SUM(rsi.storage_validate_quantity) as storage_number'))
            ->where(function ($query) use ($input) {
//                $query->where([
//                    ['rsi.po_number', '=', $input['product_order_code']],
//                    ['rsi.wo_number', '=', $input['work_order_code']]
//                ])
//                    ->orWhere([
//                        ['rsi.po_number', '=', ''],
//                        ['rsi.wo_number', '=', '']
//                    ]);
                $query->where([
                    ['rsi.sale_order_code', '=', $input['sale_order_code']],
//                    ['rsi.sales_order_project_code', '=', $input['sales_order_project_code']],
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
//                        ['rsi.sales_order_project_code', '=', $input['sales_order_project_code']],
                        ['rsi.po_number', '=', $input['product_order_code']],
                        ['rsi.wo_number', '=', '']
                    ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
//                        ['rsi.sales_order_project_code', '=', $input['sales_order_project_code']],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ])
                    //change by guangyang,wang
//                    ->orWhere([
//                        ['rm.lzp_identity_card', '<>', ''],
//                        ['rsi.sale_order_code', '=', ''],
//                        ['rsi.po_number', '=', ''],
//                        ['rsi.wo_number', '=', '']
//                    ]);
                    ->orWhere([
                        ['rsi.sale_order_code', '=', ''],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
//            ->where([['rsi.sale_order_code', '=', $input['sale_order_code']]])
            ->whereIn('rsi.material_id', $material_ids_arr);
//            ->groupBy('rsi.material_id', 'rsi.lot', 'rsi.depot_id');
        if ($input['type'] == 2) {  //查询当前仓库
            $builder->where([['rsi.depot_id', '=', $input['line_depot_id']]]);
        }
        if ($input['type'] == 3) {  //查询非当前仓库
            $builder->where([
                ['rsi.depot_id', '<>', $input['line_depot_id']],
                ['rsi.plant_id', '=', $input['factory_id']],
            ]);
        }
        $obj_lists = $builder->get();
        $tempArr = [];

        /**
         * 如果物料分类在 storage_material_category_preg 中 则匹配库存的时候加入销售行向
         */
        $storage_category_preg_arr = config('app.pattern.storage_material_category_preg1');
        foreach ($obj_lists as $obj) {
            $arr = DB::table(config('alias.rwo').' as rwo')
                ->leftJoin(config('alias.rpo').' as rpo','rpo.id','=','rwo.production_order_id')
                ->leftJoin(config('alias.rwoi').' as rwoi','rwoi.work_order_id','=','rwo.id')
                ->leftJoin(config('alias.rm').' as rm','rm.item_no','=','rwoi.material_code')
                ->leftJoin(config('alias.rmc'). ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
                ->where([
                    ['rwo.id',$input['work_order_id']],
                    ['rwoi.material_id',$obj->material_id]
                ])
                ->select([
                    'rwoi.special_stock',
                    'rwoi.material_id',
                    'rwoi.material_code',
                    'rmc.code as category_code',
                    'rpo.sales_order_project_code as sales_order_project_code',
                    'rwoi.bom_unit_id',
                ])
                ->first();

            //只有实时库存大于0，才会收集
            if ($obj->storage_number > 0) {

                // 增加 如果工单物料单位与库存单位不一致，进行转换.....    此处与工单库存迁转关联，
                if($obj->unit_id != $arr->bom_unit_id){
                    $curren_unit = DB::table(config('alias.ruu'))->where('id',$obj->unit_id)->first();
                    $unit = $this->RelationalTransformation('',$arr->material_code,$obj->storage_number,$curren_unit->commercial,'2');
                    $obj->storage_number = $unit['sum'];
                    $obj->unit_name = $unit['lc_unit'];
                    $unit_id = DB::table(config('alias.ruu'))->where('commercial',$unit['lc_unit'])->first(['id']);
                    $obj->unit_id = $unit_id->id;
                }

                // 获取当前实时库存id存在的领料数据
                $storage = DB::table('ruis_material_requisition'.' as rmr')
                    ->leftJoin('ruis_material_requisition_item'. ' as rmri','rmr.id','=','rmri.material_requisition_id')
                    ->leftJoin('ruis_material_requisition_item_batch'.' as rmrib','rmri.id','=','rmrib.item_id')
                    ->where([
                        ['rmrib.inve_id','=',$obj->inve_id],
                        ['rmr.status','<','4'],
                        ['rmr.is_delete','=','0'],
                    ])
                    ->count();
                /**
                 * 如果 PO WO 均为空表示为 通用库存
                 */
                $obj->is_comment = 0;
                if ($obj->work_order_code == '' && $obj->product_order_code == '') {
                    $obj->is_comment = 1;
                }
                $needcheck = false;
                foreach ($storage_category_preg_arr as $keee=> $vaaa)
                {
                    if(preg_match($vaaa,$arr->category_code))
                    {
                        $needcheck = true;
                        continue;
                    }
                }
                if($needcheck){
                    if($obj->sales_order_project_code!=$arr->sales_order_project_code){
                        continue;
                    }else{
                        // 增加限制，如果存在该实时库存id 的领料单则不取值
                        if($storage>0){
                            continue;
                        }else{
                            $tempArr[$obj->material_id][] = $obj;
                        }
                    }
                } else {
                    // 增加限制，如果存在该实时库存id 的领料单则不取值
                    if($storage>0){
                        continue;
                    }else{
                        $tempArr[$obj->material_id][] = $obj;
                    }
                }
            }
        }
        // 查询物料分類是否屬於線邊庫管理
        $materialObjList = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->select(['rm.id', 'rmc.warehouse_management'])
            ->whereIn('rm.id', $material_ids_arr)
            ->get();
        $lzArr = [];
        foreach ($materialObjList as $material) {
            $lzArr[$material->id]['is_lzp'] = $material->warehouse_management == 1 ? 1 : 0;
        }

        // 判断当前工单是否已经领过定额订单
        $mr_obj = DB::table($this->table)
            ->select(['id', 'code'])
            ->where([
                ['work_order_id', '=', $input['work_order_id']],
                ['type', '=', 1],
                ['push_type', '=', 0],
                ['is_delete', '=', 0]
            ])
            ->first();
        $is_rated = 0;
        $mr_code = '';
        if (!empty($mr_obj)) {
            $is_rated = 1;
            $mr_code = $mr_obj->code;
        }

        if($input['type'] == 3){
            $material_id = [];
            $stmt_teturn = [];
            // 获取  material_id
            foreach ($materialObjList as $k){
                if($k->warehouse_management == 1)
                {
                    $material_id[] = $k->id;
                    // 查询该工单 领料实收
                    $materialarr[] = DB::table($this->table.' as rmr')
                        ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                        ->where([
                            ['rmre.work_order_id', '=', $input['work_order_id']],
                            ['rmr.type', '=', 1],
                            ['rmr.is_delete', '=', 0],
                            ['rmr.push_type', '=', 2],
                            ['rmre.material_id',$k->id],
                        ])
                        ->select('rmre.material_id','rmre.material_code')
                        ->addSelect(DB::raw('SUM(rmre.qty) as sum')) // 实收
                        ->addSelect(DB::raw('SUM(rmre.rated_qty) as rated_qty')) // 领料数量
                        ->first();
                    // 查询退料单记录表  shuaijie.feng 5.28/2019
                    $stmt_teturn[] = DB::table($this->table.' as rmr')
                        ->leftJoin(config('alias.rrmr').' as rrmr','rrmr.material_requisition_id','rmr.id')
                        ->where([
                            ['rrmr.work_order_id', '=', $input['work_order_id']],
                            ['rmr.type', '=', 2],
                            ['rmr.is_delete', '=', 0],
                            ['rmr.push_type', '=', 2],
                            ['rrmr.material_id',$k->id]
                        ])
                        ->addSelect(DB::raw('SUM(rrmr.qty) as sum'))
                        ->first();
                }
            }


            if(!empty($material_id))
            {
                foreach ($materialarr as $k=>$v){
                    $stmt[$k]['material_id'] = $v->material_id;
                    $stmt[$k]['material_code'] = $v->material_code;
                    $stmt[$k]['sum'] = $v->sum-$stmt_teturn[$k]->sum;
                }
                return ['materials' => $tempArr, 'lzps' => $lzArr, 'is_rated_picking' => $is_rated, 'mr_code' => $mr_code,'materialarr'=>$stmt];
            }else{
                $stmt['material_id'] = '';
                $stmt['material_code'] = '';
                $stmt['sum'] = '';
                return ['materials' => $tempArr, 'lzps' => $lzArr, 'is_rated_picking' => $is_rated, 'mr_code' => $mr_code,'materialarr'=>$stmt];
            }
        }

        return ['materials' => $tempArr, 'lzps' => $lzArr, 'is_rated_picking' => $is_rated, 'mr_code' => $mr_code];
    }

    /**
     * 根据 工单code 获取物料和相应批次
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialBatch($input)
    {
        if (empty($input['work_order_code'])) TEA('700', 'work_order_code');
        /**
         * 查询额定领料单
         * 一遍情况下，只会有一张额定领料单
         */
        $obj_list = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmri.demand_unit_id')
            ->select([
                'rmri.material_id',
                'rmri.material_code',
                'ruu.commercial as unit',
                'rmrib.batch',
            ])
            ->addSelect(DB::raw('SUM(rmrib.actual_send_qty) as sum_qty'))
            ->where([
                ['rwo.number', '=', $input['work_order_code']],
                ['rmr.type', '=', 1],
                ['rmr.push_type', '=', 0],
                ['rmr.is_delete', '=', 0],
            ])
            ->groupBy('rmri.material_code', 'rmrib.batch')
            ->get();
        $temp = [];
        foreach ($obj_list as $obj) {
            is_null($obj->batch) && $obj->batch = '';
            $temp[$obj->material_code . $obj->batch] = [
                'material_id' => $obj->material_id,
                'material_code' => $obj->material_code,
                'qty' => $obj->sum_qty,
                'batch' => $obj->batch,
                'is_rated' => 1
            ];
        }

//        $obj_list2 = DB::table($this->itemTable . ' as rmri')
//            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
//            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
//            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
//            ->select([
//                'rmri.material_id',
//                'rmri.material_code',
//                'rmrib.batch',
//            ])
//            ->where([
//                ['rwo.number', '=', $input['work_order_code']],
//                ['rmr.type', '=', 1],
//                ['rmr.push_type', '=', 1]
//            ])
//            ->distinct()
//            ->get();
//        foreach ($obj_list2 as $obj) {
//            is_null($obj->batch) && $obj->batch = '';
//            if (!isset($temp[$obj->material_code . $obj->batch])) {
//                $temp[$obj->material_code . $obj->batch] = [
//                    'material_id' => $obj->material_id,
//                    'material_code' => $obj->material_code,
//                    'batch' => $obj->batch,
//                    'qty' => 0,
//                    'is_rated' => 0
//                ];
//            }
//        }
        return array_values($temp);
    }

    /**
     * 获取 用于生成退料单的数据（废弃）
     *
     * 批次+库存 --> 物料数组 --> items
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getCreateReturnMaterial($input)
    {
        // 1.获取PO，线边库，
        $mr_obj = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->select([
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmr.line_depot_id',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rmr.work_order_id',
                'rwo.number as work_order_code',
//                'rmr.send_depot',
                'rmr.product_order_code',
                'rmr.product_order_id',
                'rmr.product_order_code',
                'rmr.sale_order_code',
                'rmr.sale_order_project_code',
                'rmr.factory_id',
                'rf.name as factory_name',
            ])
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.push_type', 1],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
            ])
            ->first();
        if (empty($mr_obj)) TEA('2431');

        // 2.去重获取物料和批次
        $obj_list = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->select([
                'rmr.product_order_code',
                'rmr.line_depot_id',
                'rmr.send_depot',
                'rmri.material_id',
                'rmri.material_code',
                'rmrib.batch',
                'rm.name as material_name'
            ])
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.push_type', 1],
                ['rmr.is_delete', '=', 0]
            ])
            ->distinct()
            ->get();
        $materialIDArr = [];
        $batchArr = [];
        $sendDepotArr = [];
        foreach ($obj_list as $obj) {
            $materialIDArr[] = $obj->material_id;
            !empty($obj->batch) && $batchArr[] = $obj->batch;
            !empty($obj->send_depot) && $sendDepotArr[] = $obj->send_depot;
        }

        // 3.获取实时库存
        $storage_builder = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->select([
                'rsi.material_id',
                'rsi.storage_validate_quantity as storage_number',
                'rsi.lot as batch',
                'rsi.po_number as product_order_code',
                'rsi.depot_id as line_depot_id',
                'rsi.unit_id',  // bom_unit_id
                'rsi.send_depot',
                'rsi.id as inve_id',
                'ruu.commercial as unit'
            ])
            ->where([
                ['rsi.po_number', '=', $mr_obj->product_order_code],
                ['rsi.depot_id', '=', $mr_obj->line_depot_id],
            ])
            ->whereIn('rsi.material_id', $materialIDArr);
        // 如果批次/发出库存地点为空，则不做查询
        !empty($batchArr) && $storage_builder->whereIn('rsi.lot', $batchArr);
        !empty($sendDepotArr) && $storage_builder->whereIn('rsi.send_depot', $sendDepotArr);
        $storage_obj_list = $storage_builder->get();
        /**
         * @var array $tempStorageArr 用于存库存的数组
         * key 为 send_depot,material_id,batch 拼接
         */
        $tempStorageArr = [];
        foreach ($storage_obj_list as $obj) {
            $tempStorageArr[$obj->send_depot . '_' . $obj->material_id . '_' . $obj->batch] = [
                'storage_number' => $obj->storage_number,
                'batch' => $obj->batch,
                'unit_id' => $obj->unit_id,
                'unit' => $obj->unit,
                'inve_id' => $obj->inve_id
            ];
        }

        /**
         * @var array $tempMaterialArr 用于存物料的数组
         * key为 send_depot,material_id 拼接
         */
        $tempMaterialArr = [];
        foreach ($obj_list as $obj) {

            // 如果是虚拟进料则不会生成退料单
            if ($obj->material_code == '99999999') {
                continue;
            }

            if (!isset($tempMaterialArr[$obj->send_depot . '_' . $obj->material_id])) {
                $tempMaterialArr[$obj->send_depot . '_' . $obj->material_id] = [
                    'send_depot' => $obj->send_depot,
                    'material_id' => $obj->material_id,
                    'material_code' => $obj->material_code,
                    'material_name' => $obj->material_name,
                ];
            }

            // 当前批次如果有实时库存，则插入到 batches数组中
            if (isset($tempStorageArr[$obj->send_depot . '_' . $obj->material_id . '_' . $obj->batch])) {
                $tempBatch = $tempStorageArr[$obj->send_depot . '_' . $obj->material_id . '_' . $obj->batch];
                $tempMaterialArr[$obj->send_depot . '_' . $obj->material_id]['batches'][] = [
                    'storage_number' => $tempBatch['storage_number'],
                    'batch' => $tempBatch['batch'],
                    'unit_id' => $tempBatch['unit_id'],
                    'bom_commercial' => $tempBatch['unit'],
                    'inve_id' => $tempBatch['inve_id'],
                ];
            }
        }

        $data = obj2array($mr_obj);
        $data['items'] = array_values($tempMaterialArr);
        return $data;
    }

    /**
     * 获取 用于生成退料单的数据
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getCreateReturnMaterialNew($input)
    {
        //1.先获取PO，WO，SO
        $obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rwo.factory_id')
            ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', '=', 'rwo.work_center_id')
            ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', '=', 'rwc.workshop_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.code', '=', 'rws.address')
            ->select([
                'rwo.number as work_order_code',
                'rwo.id as work_order_id',
                'rpo.id as product_order_id',
                'rpo.number as product_order_code',
                'rpo.sales_order_code as sale_order_code',
                'rpo.sales_order_project_code as sale_order_project_code',
                'rf.id as factory_id',
                'rf.code as factory_code',
                'rf.name as factory_name',
                'rsd.id as line_depot_id',
                'rsd.name as line_depot_name',
                'rsd.code as line_depot_code',
                'rpo.LGORT3'
            ])
            ->where([
                ['rwo.id', '=', $input['work_order_id']]
            ])
            ->first();
        //超能转场补丁
        if(!empty($obj->LGORT3))
        {
            //如果是二厂包装车间从z195到z192退料
            if($obj->line_depot_code =='2108' && $obj->factory_code=='1102')
            {
                // 获取虚拟仓库的id
                $LGORT3 = DB::table(config('alias.rsd'))->where('code','Z195')->first();
            }
            else
            {
                // 获取虚拟仓库的id
                $LGORT3 = DB::table(config('alias.rsd'))->where('code',$obj->LGORT3)->first();
            }

            if(!empty($LGORT3))
            {
                $obj->line_depot_id = $LGORT3->id;
                $obj->line_depot_name = $LGORT3->name;
                $obj->line_depot_code = $LGORT3->code;
            }
        }

        if (empty($obj)) {
            TEA(2421);
        }
        $result = [];
        if (!empty($obj)) {
            $result = [
                'factory_id' => $obj->factory_id,
                'factory_code' => $obj->factory_code,
                'factory_name' => $obj->factory_name,
                'sale_order_code' => $obj->sale_order_code,
                'sale_order_project_code' => $obj->sale_order_project_code,
                'work_order_id' => $obj->work_order_id,
                'work_order_code' => $obj->work_order_code,
                'product_order_id' => $obj->product_order_id,
                'product_order_code' => $obj->product_order_code,
                'line_depot_id' => $obj->line_depot_id,
                'line_depot_name' => $obj->line_depot_name,
                'line_depot_code' => $obj->line_depot_code,
            ];
        }
        //2.根据PO，WO，SO查询实时库存表
        $obj_list = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.storage_validate_quantity as storage_number',
                'rsi.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rsi.unit_id',
                'ruu.commercial as bom_commercial',
                'rsi.depot_id as line_depot_id',
                'rsd.name as line_depot_name',
                'rsd.code as line_depot_code',
                'rf.id as factory_id',
                'rf.code as factory_code',
                'rf.name as factory_name',
                'rsi.send_depot',
                'rsi.lot as batch',
            ])
            ->where([
                ['rsi.sale_order_code', '=', $obj->sale_order_code],
                ['rsi.po_number', '=', $obj->product_order_code],
                ['rsi.wo_number', '=', $obj->work_order_code],
                ['rsi.storage_validate_quantity', '>', 0]
            ])
            ->get();
        $material_ID_arr = [];
        foreach ($obj_list as $item) {
            $material_ID_arr[] = $item->material_id;
        }
        //3.提出是否属于线边仓管理
        // 查询物料分類是否屬於線邊庫管理
        $materialObjList = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->select(['rm.id', 'rmc.warehouse_management','rm.item_no'])
            ->whereIn('rm.id', $material_ID_arr)
            ->get();
        $is_mes_manager = [];
        foreach ($materialObjList as $material)
        {
            // 弹簧网 (32)  螺旋穿簧 (3201)  独立筒弹簧 (3203)  面包簧 (3204) 直条 (6101)  去除线边仓标记
            if(substr($material->item_no,0,2) == '32'|| substr($material->item_no,0,4) == '3201' ||substr($material->item_no,0,4) == '3203' ||substr($material->item_no,0,4) == '3204' || substr($material->item_no,0,4) == '6101' )
            {
                $material->warehouse_management = 0;
            }
            !isset($is_mes_manager[$material->id]) && $is_mes_manager[$material->id] = $material->warehouse_management == 1 ? 1 : 0;
        }
        //4.组装数据
        $materialSendDepotArr = [];
        $batchSendDepotArr = [];
        foreach ($obj_list as $key => $value) {
            //如果属于线边仓管理，就剔除
            if (isset($is_mes_manager[$value->material_id]) && $is_mes_manager[$value->material_id] == 1) {
                continue;
            }
            //如果原始发料地点为空，则是用采购仓储
            if (empty($value->send_depot) || !empty($obj->LGORT3)) {
                $value->send_depot = $this->getSaleDepotAndProduceDepot($value->material_id, $value->factory_id);
            }
            if (empty($materialSendDepotArr[$value->material_id . '_' . $value->send_depot])) {
                $materialSendDepotArr[$value->material_id . '_' . $value->send_depot] = [
                    'send_depot' => $value->send_depot,
                    'material_id' => $value->material_id,
                    'material_code' => $value->material_code,
                    'material_name' => $value->material_name,
                ];
            }
            $batchSendDepotArr[$value->material_id . '_' . $value->send_depot][] = [
                'storage_number' => $value->storage_number,
                'batch' => $value->batch,
                'unit_id' => $value->unit_id,
                'bom_commercial' => $value->bom_commercial,
                'inve_id' => $value->inve_id,
            ];
        }

        foreach ($materialSendDepotArr as $k => &$v) {
            $v['batches'] = isset($batchSendDepotArr[$k]) ? $batchSendDepotArr[$k] : [];
        }
        $result['items'] = array_values($materialSendDepotArr);
        return $result;
    }

    /**
     * 获取 车间退料的 可退的库存数量
     *
     * 1.获取当前WO下面所有的领、补料单(的inve_id)
     * 2.统计所有的分组
     * @param $input
     * @return array
     */
    public function getWorkShopReturnStorage($input)
    {
        //先根据工单判断是否是合并领料
        $obj_is_merge = DB::table(config('alias.rmre'). ' as rmre')
            ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmre.material_requisition_id')
            ->select('is_merger_picking')
            ->where([
                ['rmre.work_order_id', '=', $input['work_order_id']],
                ['rmr.push_type', '=', 2],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
            ])
            ->get();
        //如果为空，则直接返回
        if (empty(obj2array($obj_is_merge))) {
            return [];
        }
        // 获取wo 数据
        $wo = DB::table(config('alias.rwo').' as rwo')
            ->leftJoin(config('alias.rpo').' as rpo','rwo.production_order_id','=','rpo.id')
            ->where([
                ['rwo.id','=',$input['work_order_id']],
                ['rwo.on_off','=','1'],
                ['rwo.is_delete','=','0'],
                ['rpo.on_off','=','1'],
                ['rpo.is_delete','=','0'],
            ])
            ->select('rwo.number as wo_number','rpo.number as product_order_code','rpo.sales_order_code','rpo.sales_order_project_code')
            ->first();
        // 根据wo 数据重新赋值
        $input['work_order_code'] = $wo->wo_number;
        $input['product_order_code'] = $wo->product_order_code;
        $input['sale_order_code'] = $wo->sales_order_code;
        $input['sales_order_project_code'] = $wo->sales_order_project_code;

        $obj_is_merge = array_column(obj2array($obj_is_merge), 'is_merger_picking');
        $obj1 = [];
        $obj2 = [];
        if(in_array(1,$obj_is_merge)){
            $obj1 = DB::table(config('alias.rmrw'). ' as rmrw')
                ->leftJoin(config('alias.rmr') . ' as rmr', 'rmr.id', '=', 'rmrw.material_requisition_id')
                ->leftJoin($this->itemTable . ' as rmri', [['rmri.material_requisition_id', '=', 'rmr.id'], ['rmri.material_id', '=', 'rmrw.material_id']])
                ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmrw.material_id')
                ->leftJoin(config('alias.rsi') . ' as rsi', 'rsi.id', '=', 'rmrw.inve_id')
                ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
                ->leftJoin(config('alias.rsd') . ' as rsd_o', 'rsd_o.id', '=', 'rmri.depot_id')//原发料仓库
                ->leftJoin(config('alias.rsd') . ' as rsd_n', 'rsd_n.id', '=', 'rsi.depot_id')//现库存仓库
                ->select([
                    'rmr.line_depot_id',    //当前线边库(当前库存仓库)
                    'rmrw.material_id',
                    'rm.item_no as material_code',
                    'rmrw.inve_id',
                    'rsd_n.id  as  now_depot_id',     //物料当前库存仓库
                    'rsd_n.code as now_depot_code',
                    'rsd_n.name as now_depot_name',
                    'rsd_o.id  as  origin_depot_id',     //物料上个车间（原发料仓库）
                    'rsd_o.code as origin_depot_code',
                    'rsd_o.name as origin_depot_name',
                    'rsi.lot as batch',
                    'rsi.storage_validate_quantity as storage_number',
                    'rsi.unit_id',
                    'ruu.commercial as unit_name',
                ])
                ->where([
                    ['rmrw.work_order_id', '=', $input['work_order_id']],
                    ['rmr.push_type', '=', 2],
                    ['rmr.status', '=', 4],
                    ['rmr.is_delete', '=', 0],
                ])
                ->whereIn('rmr.type', [1, 7])
                ->groupBy('rsi.id')
                ->get();

        }

        if(in_array(0,$obj_is_merge))
        {
            $obj2 = DB::table($this->table . ' as rmr')
                ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                ->leftJoin(config('alias.rsi') . ' as rsi', [['rsi.id', '=', 'rmrib.inve_id'], ['rsi.depot_id', '=', 'rmr.line_depot_id']])
                ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
                ->leftJoin(config('alias.rsd') . ' as rsd_o', 'rsd_o.id', '=', 'rmri.depot_id')//原发料仓库
                ->leftJoin(config('alias.rsd') . ' as rsd_n', 'rsd_n.id', '=', 'rsi.depot_id')//现库存仓库
                ->select([
                    'rmr.line_depot_id',    //当前线边库(当前库存仓库)
                    'rmri.material_id',
                    'rmri.material_code',
                    'rmrib.inve_id',
//                'rmrib.actual_receive_qty as received_qty',
                    'rsd_n.id  as  now_depot_id',     //物料当前库存仓库
                    'rsd_n.code as now_depot_code',
                    'rsd_n.name as now_depot_name',
                    'rsd_o.id  as  origin_depot_id',     //物料上个车间（原发料仓库）
                    'rsd_o.code as origin_depot_code',
                    'rsd_o.name as origin_depot_name',
                    'rsi.lot as batch',
                    'rsi.storage_validate_quantity as storage_number',
                    'rsi.unit_id',
                    'ruu.commercial as unit_name',
                ])
//            ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as received_qty'))
                ->where([
                    ['rmr.work_order_id', '=', $input['work_order_id']],
                    ['rmr.push_type', '=', 2],
                    ['rmr.status', '=', 4],
                    ['rmr.is_delete', '=', 0],
                ])
                ->whereIn('rmr.type', [1, 7])
                ->groupBy('rsi.id')
                ->get();
        }
        // 合并数据
        $storage_list = array_merge(obj2array($obj1),obj2array($obj2));

        $material_ids_arr = [];
        $material_ref_arr = [];
        /**
         * 根据合并数据处理
         * 重新赋值到 material_ref_arr  id为key
         * */
        foreach ($storage_list as $ka=>$va){
            $material_ids_arr[] = $va['material_id'];
            if(!isset($input['line_depot_id'])) $input['line_depot_id'] = $va['now_depot_id'];
            $material_ref_arr[$va['material_id']] = $va;
        }

        // 重新获取实时库存数据
        $builder = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.material_id',
                'rsi.lot as batch',
                'rsi.unit_id',
                'rsi.sale_order_code',
                'rsi.sales_order_project_code',
                'rsi.wo_number as work_order_code',
                'rsi.po_number as product_order_code',
                'rsi.storage_validate_quantity as storage_number',
                'ruu.commercial as unit_name',
                'rf.code as factory_code',
                'rf.name as factory_name',
            ])
            ->where(function ($query) use ($input) {
                $query->where([
                    ['rsi.sale_order_code', '=', $input['sale_order_code']],
                    ['rsi.sales_order_project_code', '=', $input['sales_order_project_code']],
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
                        ['rsi.sales_order_project_code', '=', $input['sales_order_project_code']],
                        ['rsi.po_number', '=', $input['product_order_code']],
                        ['rsi.wo_number', '=', '']
                    ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
                        ['rsi.sales_order_project_code', '=', $input['sales_order_project_code']],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', ''],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
            ->whereIn('rsi.material_id', $material_ids_arr);
        //查询当前仓库
        $builder->where([['rsi.depot_id', '=', $input['line_depot_id']]]);
        $obj_lists = $builder->get();

        /**
         *  重组数据
         *  根据 material_ref_arr 数据key 重新取值
         **/
        foreach ($obj_lists as $kee => $vaa){
            if(isset($material_ref_arr[$vaa->material_id])){
                $vaa->material_code = $material_ref_arr[$vaa->material_id]['material_code'];
                $vaa->now_depot_id = $material_ref_arr[$vaa->material_id]['now_depot_id'];
                $vaa->now_depot_code = $material_ref_arr[$vaa->material_id]['now_depot_code'];
                $vaa->now_depot_name = $material_ref_arr[$vaa->material_id]['now_depot_name'];
                $vaa->origin_depot_id = $material_ref_arr[$vaa->material_id]['origin_depot_id'];
                $vaa->origin_depot_code = $material_ref_arr[$vaa->material_id]['origin_depot_code'];
                $vaa->origin_depot_name = $material_ref_arr[$vaa->material_id]['origin_depot_name'];
            }
        }

        $obj_list = obj2array($obj_lists);

        //如果为空，则直接返回
        if (empty($obj_list)) {
            return [];
        }

        $tempArr = [];
        foreach ($obj_list as $obj) {
            //库存小于等于0，则不返回
            if ($obj['storage_number'] <= 0) {
                continue;
            }
            $tempArr[$obj['material_id']][] = $obj;
        }
        return $tempArr;
    }

    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getWorkShopSyncSapData($input)
    {
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')//需求库存车间(当前)
            ->leftJoin(config('alias.rsd') . ' as rsd2', 'rsd2.id', '=', 'rmri.depot_id')//发料车间(上一个)
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmrib.bom_unit_id')
            ->select([
                'rmr.code as mr_code',
                'rmr.time',
                'rmr.from',
                'rmr.type',
                'rmr.status',
                'rmr.sale_order_code',  // 销售订单号
                'rmr.sale_order_project_code', //销售订单项目号
                'rmr.send_depot',
                'rmr.product_order_code',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwo.number as work_order_code',
                'rsd.code as line_depot_code',
                'rsd2.code as depot_code',
                'rmri.line_project_code',
                'rmri.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rm.material_category_id',
                'rmri.demand_qty',
                'ruu_d.id as bom_unit_id',
                'ruu_d.commercial as unit_name', // bom单位
                'rmrib.actual_send_qty',
                'rmrib.actual_receive_qty',
                'rmrib.batch',
                'rmri.is_special_stock',

            ])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.push_type', '=', 2],
                ['rmr.is_delete', '=', 0],
            ]);
            //   type   1->ZY01:车间领料 2->ZY02:车间退料  7->ZB01 车间补料
            /**
             * status
             *   1->领料单生产，尚未发送申请  2->已申请（领料中） 3->完成领料(填完实收数量) 4->审核订单(固定订单，只需要查看，不允许修改)
             *   \r\n退料：     1->退料单生成，尚未发送申请。   2->已推送     3->出库&更新实退数量    4->完成
             */
            // 需求    需要在发料的时候调用sap接口  车间退料兼容车间发料调用sap
        if($input['type'] == 2){
            $objs->whereIn('rmr.status', [4]);
        }else{
            $objs->whereIn('rmr.status', [3]);
        };
        $objs = $objs->get();
//        if (empty(obj2array($objs))) {
//            TEA('2432');    // 不允许推送或已推送
//        }
        $sendData = [];
        foreach ($objs as $key => $value) {
            //如果当前物料的分类不在限定之列，则不需要发送
            if (!$this->checkMaterialCategoryIsInArray(
                $value->material_category_id, config('app.need_send_to_sap_material_category', []))
            ) {
                continue;
            }
            // bom单位转为基本单位
            //如果状态为3，则为实发;状态为4，则为实收
            // $qty = $value->status == 3 ? $value->actual_send_qty : $value->actual_receive_qty;
            // 修复 发料的时候将发料数量传入sap shuaijie.feng  11.13/2019
            $qty = $value->actual_receive_qty;
            if($qty == 0) continue; // 实收为0 跳过本次发送
            $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $qty);
            $temp = [
                'LLDH' => $value->mr_code,
                'LLHH' => $value->line_project_code,
                'LLLX' => $this->intToType($value->type),
                'LLRQ' => date('Ymd', $value->time),
                'LLSJ' => date('His', $value->time),
                'LLR' => $value->employee_name,
                'WERKS' => $value->factory_code,
                'XNBK' => $value->line_depot_code,     //需求线边库
                'GONGW' => empty($value->workbench_code) ? '' : $value->workbench_code,
                'GONGD' => $value->work_order_code,
                'FCKCDD' => $value->depot_code,     //发出库存地点
                'AUFNR' => $value->product_order_code,      //订单号
                'KDAUF' => $value->is_special_stock == 'E' ? $value->sale_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $value->is_special_stock == 'E' ? $value->sale_order_project_code : '',    //销售订单项目
                'LIFNR' => '',
                'MATNR' => $value->material_code,
                'MAKTX' => $value->material_name,
                'XQSL' => $baseUnitArr['base_qty'],
                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),
                'XTLY' => 1,  //系统来源
                'BATCH' => $value->batch,
                'RQTIM'=>date('His',time()),
            ];
            $sendData[] = $temp;
        }
        return $sendData;
    }

    /**
     * SAP领料 查询采购仓库和生产仓库
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialDepot($input)
    {
        if (empty($input['materials'])) TEA(700, 'materials');
        try {
            $input['materialArr'] = explode(',', $input['materials']);
        } catch (\Exception $e) {
            TEA(700, 'materials');
        }
        if (empty($input['factory_id'])) TEA(700, 'factory_id');

        $obj_list = DB::table(config('alias.ramc') . ' as ramc')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.code', '=', 'ramc.WERKS')
            ->select(['ramc.material_id', 'ramc.LGPRO', 'ramc.LGFSB'])
            ->where([['rf.id', '=', $input['factory_id']]])
            ->whereIn('ramc.material_id', $input['materialArr'])
            ->get();

        $data = [];
        foreach ($obj_list as $obj) {
            $data[$obj->material_id] = $obj;
        }
        return $data;
    }

    /**
     * 获取采购仓储，如果无，则用生产仓储
     *
     * @param $material_id
     * @param $factory_id
     * @return string
     */
    private function getSaleDepotAndProduceDepot($material_id, $factory_id)
    {
        $obj = DB::table(config('alias.ramc') . ' as ramc')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.code', '=', 'ramc.WERKS')
            ->select([
                'ramc.material_id',
                'ramc.LGPRO',  //生产仓储
                'ramc.LGFSB', //采购仓储
            ])
            ->where([
                ['rf.id', '=', $factory_id],
                ['ramc.material_id', '=', $material_id]
            ])
            ->first();
        $depot_code = '';
        if (!empty($obj)) {
            $depot_code = empty($obj->LGFSB) ? $obj->LGPRO : $obj->LGFSB;
        }
        return $depot_code;
    }

    /**
     * sap领料查询时间数据
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getSapPackingInfo($input)
    {
        if (empty($input['work_order_id'])) TEA(700, 'work_order_id');

        $is_first = 1;
        $is_unfinished = 0;

//        $obj = DB::table($this->table)
//            ->where([
//                ['work_order_id', '=', $input['work_order_id']],
//                ['type', '=', 1],
//                ['is_delete', '=', 0],
//                ['push_type', '=', 1],
//                ['is_delete', '=', 0],
//            ])
//            ->count();

        // 查询工单补料
        $already_repair_material = DB::table(config('alias.rmr') . ' as rmr')
            ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rmr.work_order_id')
            ->select('rmr.status','rwo.number')
            ->where([
                ['rmr.type','=','7'],
                ['rmr.push_type','=','1'],
                ['rmr.is_delete','=','0'],
                ['rmr.status','<','3'],
            ])
            ->where('rmr.work_order_id',$input['work_order_id'])->count();
        if($already_repair_material){
            TEPA('当前工单存在补料单未完成，不允许开领料单');
        }
        //判断工单是否向SAP领料过 Modify By Bruce.Chu
        $obj = DB::table($this->table.' as rmr')
            ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
            ->where([
                ['rmre.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 1],
                ['rmr.is_delete', '=', 0],
            ])
            ->count();
        // 如果存在，则不是第一次领料
        if ($obj) {
            //  如果存在领料记录，查询是否完成额定数量 shuaijie.feng 5.20/2019
            $stmt = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.is_delete', '=', 0],
                    ['rmr.push_type', '=', 1],
                    ['rmr.is_delete', '=', 0],
                ])
                ->select('rmre.rated_qty')
                ->addSelect(DB::raw('SUM(rmre.qty) as sum'))
                ->addSelect(DB::raw('SUM(rmre.rated_qty) as rated_qty'))
                ->first();
            // 查询退料单记录表  shuaijie.feng 5.22/2019
            $stmt_teturn = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rrmr').' as rrmr','rrmr.material_requisition_id','rmr.id')
                ->where([
                    ['rrmr.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 2],
                    ['rmr.is_delete', '=', 0],
                    ['rmr.push_type', '=', 1],
                    ['rmr.is_delete', '=', 0],
                ])
                ->addSelect(DB::raw('SUM(rrmr.qty) as sum'))
                ->first();
            // 领料数量减去退料数量是否大于物料的额定数量
            if(($stmt->sum-$stmt_teturn->sum) == $stmt->rated_qty || ($stmt->sum-$stmt_teturn->sum) > $stmt->rated_qty) {
                $is_first = 0;
            }
            // 查询领料记录表,查询是否有未完成订单 shuaijie.feng 5.20/2019
            $obj_count = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.push_type', '=', 1],
                    ['rmr.status', '<>', 4],
                    ['rmr.is_delete', '=', 0],
                ])
                ->count();
            if($obj_count){
                $is_first = 0;
            }
            // 查询领料记录表,查询是否已经完成领料 shuaijie.feng 6.4/2019
            $obj_count = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.push_type', '=', 1],
                    ['rmr.status', '=', 4],
                    ['rmr.is_delete', '=', 0],
                ])
                ->count();
            //  查询工单用料表 获取用料数量
            $work_count = DB::table(config('alias.rwoi'))->where([['work_order_id',$input['work_order_id']], ['type',0],])->count();
            // 查询退料数量
            $stmt_teturn_count = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rrmr').' as rrmr','rrmr.material_requisition_id','rmr.id')
                ->where([
                    ['rrmr.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 2],
                    ['rmr.is_delete', '=', 0],
                    ['rmr.push_type', '=', 1],
                    ['rmr.is_delete', '=', 0],
                ])
                ->count();

            //  待修改  shuaijie.feng 6.11/2019
            /**
             *  领料数量减去退料数量是否大于物料的额定数量
             *  查询领料记录表,查询是否有未完成订单
             *  领料的数量减去退料的数量是否等于工单用料数量 等于则不显示领料数据 shuaijie.feng 6.11/2019
             */
//            if(($stmt->sum-$stmt_teturn->sum) == $stmt->rated_qty || ($stmt->sum-$stmt_teturn->sum) > $stmt->rated_qty || $obj_count>0 ||($obj_count-$stmt_teturn_count) == $work_count){
//            if($obj_count == $work_count){
//                $is_first = 0;
//            }


//            $is_first = 0;
            //查询是否有未完成的领料单
//            $obj = DB::table($this->table)
//                ->where([
//                    ['work_order_id', '=', $input['work_order_id']],
//                    ['type', '=', 1],
//                    ['push_type', '=', 1],
//                    ['is_delete', '=', 0],
//                    ['status', '<>', 4]
//                ])
//                ->count();
            $obj = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.push_type', '=', 1],
                    ['rmr.is_delete', '=', 0],
                    ['rmr.status', '<>', 4]
                ])
                ->count();
            if ($obj) {
                $is_unfinished = 1;
            }
        }

        //查询所有领料的实收数据总和
//        $obj_list = DB::table($this->table . ' as rmr')
//            ->leftJoin(config('a3lias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
//            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
//            ->select([
//                'rmri.material_id',
//            ])
//            ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as sum'))
//            ->where([
//                ['rmr.work_order_id', '=', $input['work_order_id']],
//                ['rmr.push_type', '=', 1],
//                ['rmr.type', '=', 1],
//                ['rmr.is_delete', '=', 0],
//            ])
//            ->groupBy('rmri.material_id')
//            ->get();
        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
            ->leftJoin(config('alias.rmri') . ' as rmri', function ($join) {
                $join->on('rmri.material_requisition_id', '=', 'rmr.id')
                    ->on('rmri.material_id', '=', 'rmre.material_id');
            })
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->select([
                'rmri.material_id',
            ])
            ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as sum'))
            ->where([
                ['rmre.work_order_id', '=', $input['work_order_id']],
                ['rmr.push_type', '=', 1],
                ['rmr.type', '=', 1],
                ['rmr.is_delete', '=', 0],
            ])
            ->groupBy('rmri.material_id')
            ->get();
        $data = [];
        foreach ($obj_list as $o) {
            $data[$o->material_id] = $o->sum;
        }
        return [
            'is_first' => $is_first,
            'is_unfinished' => $is_unfinished,
            'materials' => $data
        ];
    }

    /**
     * 获取物料的bom单位
     * 仅用于物料领料
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialUnit($input)
    {
        if (empty($input['materials']) || $input['materials'] == '[]') {
            TEA(700, 'materials');
        }

        $materialsIDArr = explode(',', $input['materials']);

        $objs = DB::table(config('alias.ramm') . ' as ramm')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.commercial', '=', 'ramm.MEINH')
            ->select([
                'ramm.material_id',
                'ramm.MEINH as unit_name',
                'ruu.id as unit_id'
            ])
            ->whereIn('ramm.material_id', $materialsIDArr)
            ->get();

        if (empty(obj2array($objs))) {
            TEA(2621);
        }

        $temp = [];
        foreach ($objs as $obj) {
            $temp[$obj->material_id][] = obj2array($obj);
        }

        return $temp;
    }

//endregion

//region 推送
    /**
     * 同步委外领料单结果
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncPickingResult($input)
    {
         $ApiControl = new SapApiRecord();
         $ApiControl->store($input);

        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */
 
        $out_picking_ids = []; //定义一个空数组 用来存放委外领料单 id

        foreach ($input['DATA'] as $value) {
            if (empty($value['LLDH'])) TESAP('703', 'LLDH');
            if (empty($value['LLHH'])) TESAP('703', 'LLHH');

            $keyVal = [
                'actual_send_qty' => $value['SFHSL'],
                'actual_send_unit' => $value['SFHSLDW'],
            ];
            $order_obj_z = DB::table($this->ZyTable)->where('code', $value['LLDH'])->first();
            if (!$order_obj_z) TESAP('2479');
            $order_id = $order_obj_z->id;
            $out_picking_id = $order_obj_z->out_picking_id;
            $out_picking_ids[]= $out_picking_id;
            $where = [
                'out_machine_zxxx_order_id' => $order_id,
                'line_project_code' => str_pad($value['LLHH'], 4, '0', STR_PAD_LEFT),
            ];
            $upd = DB::table($this->ZyItemTable)->where($where)->update($keyVal);
            if ($upd === false) TESAP('804');

            //更改委外订单的发料状态 只要有发料则 更改单子状态
            $reply_data = [
                'reply_ZY03' => 1,
            ];
            $rep_upd = DB::table('ruis_sap_out_picking')->where('id',$out_picking_id)->update($reply_data);
            /**
             * 如果已经过账 则单据状态改为完成
             */
            $updateZy = DB::table('ruis_out_machine_zxxx_order')->where('id',$order_id)->update(['status' => '3']);
            if ($rep_upd === false) TESAP('804');


        }
        // 更新是否缺料状态
        $pickings=array_unique($out_picking_ids);
        foreach ($pickings as  $picking) 
        {
            //定义一个标记 sign
            $sign  = 0;  //默认不少发

           //拿到委外领料单的id 开始处理
           //找到picking 的明细行
           $lines = DB::table('ruis_sap_out_picking_line')->where('picking_id',$picking)->select('id')->get();
           if (count($lines)>0) 
           {
                 //定义一个数组 存放行ids
                 $temp_lines = [];
                 //存在行  就找所有的明细id
                 foreach ($lines as  $line) 
                 {
                    // 行id  
                    $temp_lines[] = $line->id;
                 }

                 // 获取所有的明细行
                 $items  = DB::table('ruis_sap_out_picking_line_item') 
                                ->select('id','DBDMNG')
                                ->wherein('line_id', $temp_lines)
                                ->get();
                if (count($items)>0) 
                {
                    foreach ($items as $item) 
                    {
                      //得到明细id
                      //得到明细的计划量
                      $DBDMNG =  $item->DBDMNG;
                      $in_type_code=['ZY05','ZB03','ZY03'];
                      //获取所有领料补料  该明细的数量总和
                      $temp_in_qty= DB::table('ruis_out_machine_zxxx_order_item')
                              ->where('picking_line_item_id',$item->id)
                              ->wherein('type_code', $in_type_code)
                              ->sum('actual_send_qty');
                        //如果 所有的进料 加起来 小余 需求  更改标记
                        if ($temp_in_qty < $DBDMNG) 
                        {
                           $sign = 1;
                           //标记为1 的时候 直接跳出当前 遍历
                           break;
                        }
                    }
                }
           } 

           //判断sign
           if ($sign == 1) 
           {
                $reply_status_data = [
                    'replyz_ZY03_status' => 1,
                ];
                $rep_uupd = DB::table('ruis_sap_out_picking')->where('id',$picking)->update($reply_status_data);
                if ($rep_uupd === false) TESAP('804');
           }
           else
           {
                $reply_status_data = [
                    'replyz_ZY03_status' => 0,
                ];
                $rrep_uupd = DB::table('ruis_sap_out_picking')->where('id',$picking)->update($reply_status_data);
                if ($rrep_uupd === false) TESAP('804');
           }

        }
        return [];
    }

    /**
     * 同步车间领料单结果
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncShopResult($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->store($input);

//        $data = json_decode($input['DATA'],true);
        $data = $input['DATA'];
        foreach ($data as $datum) {
            if (empty($datum['LLDH'])) TESAP('703', 'LLDH');
            if (empty($datum['LLHH'])) TESAP('703', 'LLHH');
            if (empty($datum['LLLX'])) TESAP('700', 'LLLX');

            //判断当前所属工单是否被锁定，暂时去掉验证
//            $this->checkWorkOrderLockByMRCode($datum['LLDH']);

            //如果是合并领料的回执
            if (substr($datum['LLDH'], 0, 2) == 'MC') {
                (new MaterialCombine())->updateResult($datum);
                return [];
            }

            /**
             * 如果是退料类型，行项目号取前五位
             */
            //应SAP要求 状态改为2,4 Modify By Bruce.Chu
//            $datum['status'] = [2,4];
            $datum['status'] = 2;
            if ($datum['LLLX'] == 'ZY02') {
                // order 为行项目的后五位
                $order = substr($datum['LLHH'], 5,5);
                $datum['LLHH'] = substr($datum['LLHH'], 0, 5);
//                $datum['status'] = 3;
//                $datum['status'] = [2,4];   //应SAP要求 状态改为2,4 Modify By Bruce.Chu
                $datum['status'] = 2;   //2018.11.23 先出库在更改状态完成
            }
            $obj = DB::table($this->table . ' as rmr')
                ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
                ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
                ->select([
                    'rmr.id as mr_id',
                    'rmr.work_order_id',
                    'rmri.id as item_id',
                    'rmri.material_code',
                    'rmri.material_id',
                    'rmri.demand_unit_id as bom_unit_id',
                    'rmr.is_merger_picking',
                    'rmr.type',
                    'rmri.is_special_stock',
                    'rmri.sales_order_code',
                    'rmri.sales_order_project_code',
                    'rmc.code as category_code',
                ])
                ->where([
                    ['rmr.code', '=', $datum['LLDH']],
                    ['rmri.line_project_code', '=', $datum['LLHH']],
                    ['rmr.status', '=', $datum['status']],
                    ['rmr.is_delete', '=', 0],
                    ['rmri.item_is_delete', '<>', 1], // 增加 行项是否删除  1:被删除   0:未删除
                ])
//                ->whereIn('rmr.status',$datum['status'])
                ->first();
            if (empty($obj)) {
                TESAP('2421', 'line4104');
            }

//            $insertKeyValArrays = [];
            $keyVal = [
                'material_requisition_id' => $obj->mr_id,
                'item_id' => $obj->item_id,
            ];
            $MergerPicking = null;

            /**
             * 如果类型为 退料， 则执行更新。
             * 其他则为添加。
             * ps:
             * 如果为退料，ITEMS数组中只会有一条数据
             */
            if ($datum['LLLX'] == 'ZY02') {
                foreach ($datum['ITEMS'] as $value) {

                    !isset($value['SQNM']) && TESAP('700', 'SQNM');
                    !isset($value['MATNR']) && TESAP('700', 'MATNR');
                    !isset($value['BATCH']) && TESAP('700', 'BATCH');
                    !isset($value['MATQTY']) && TESAP('700', 'MATQTY');
                    !isset($value['MEINS']) && TESAP('700', 'MEINS');

                    if ($obj->material_code != ltrim($value['MATNR'], '0')) {
                        TESAP('2428');
                    }

                    $rmribObj = DB::table(config('alias.rmrib'))
                        ->select(['id', 'bom_unit_id'])
                        ->where([
                            ['material_requisition_id', '=', $obj->mr_id],
                            ['item_id', '=', $obj->item_id],
                            ['order', '=', $order],
                            ['batch', '=', $value['BATCH']]
                        ])
                        ->first();
                    if (empty($rmribObj)) {
                        TESAP('2421');
                    }

                    //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
                    $code_pre = substr($obj->category_code, 0,4);
                    $pao_change = 0;
                    if($code_pre == '3002' && $value['MEINS'] == 'M'){
                        //针对批次为1，进行消耗，从仓库收集的表中获得比例
                        $switch = config('app.batch1');
                        if($value['BATCH'] == 1 && $switch == 1){
//                            $where2 = [];
//                            $where2[] = ['rrb.material_code','=',$obj->material_code];
//                            $where2[] = ['rrb.lot','=',$value['BATCH']];
//                            $where2[] = ['rrb.conversion','>=','0'];
//                            $conversion = DB::table('ruis_robe_batch as rrb')->select('conversion')
//                                ->where($where2)
//                                ->first();

                            //获取米／公斤的转换比例
                            $Units = new Units();
                            $bom_qty = $Units->getExchangeUnitValueById('135', '96', $value['MATQTY'], $obj->material_id);
                            $format_bom_qty = floor($bom_qty * 1000) / 1000;

                            $baseUnitArr['bom_qty'] = $format_bom_qty;
                            $baseUnitArr['base_unit'] = 'KG';
                            $bomUnitArr['bom_unit_id'] = $obj->bom_unit_id;
                            $pao_change = 1;

                        }else{
                            //获取米／公斤的转换比例
                            $where = [];
                            $where[] = ['rwdoi.material_id','=',$obj->material_id];
                            $where[] = ['rwdoi.lot','=',$value['BATCH']];
                            $where[] = ['rwdoi.type','=','-1'];
                            $where[] = ['rwdoi.conversion','>=','0'];
                            $conversion = DB::table(config('alias.rwdoi') . ' as rwdoi')->select('conversion')
                                ->where($where)
                                ->first();

                            if(!isset($conversion) || empty($conversion) || $conversion->conversion == 0){
                                $pao_change = 0;
                            }else{
                                //取一位小数
                                $bomUnitArr['bom_qty'] = floor($value['MATQTY'] * $conversion->conversion * 1000) / 1000;
                                $bomUnitArr['bom_unit'] = 'KG';
                                $bomUnitArr['bom_unit_id'] = $obj->bom_unit_id;
                                $pao_change = 1;
                            }
                        }
                    }

                    if($pao_change == 0){
                        $bomUnitArr = $this->baseUnitToBomUnit($obj->material_id, $value['MEINS'], $value['MATQTY'], $rmribObj->bom_unit_id);
                    }
                    #####################


//                    // SAP传过来的基本单位转为 bom单位
//                    $bomUnitArr = $this->baseUnitToBomUnit($obj->material_id, $value['MEINS'], $value['MATQTY'], $rmribObj->bom_unit_id);
                    $where = [
                        ['material_requisition_id', '=', $obj->mr_id],
                        ['item_id', '=', $obj->item_id],
                        ['order', '=', $order],
                        ['batch', '=', $value['BATCH']]
                    ];
                    $update = [
                        'actual_receive_qty' => $bomUnitArr['bom_qty'],
//                        'bom_unit_id' => $bomUnitArr['bom_unit_id'],
                        'base_unit' => $value['MEINS'],
                    ];
                    DB::table(config('alias.rmrib'))->where($where)->update($update);
                    if ($obj->type = 2) {
                        if (empty($MergerReturnMaterial)) {
                            $MergerReturnMaterial = new MergerReturnMaterial();
                        }
                        $MergerReturnMaterial->backFillReturnMaterial($obj->mr_id, ltrim($value['MATNR'], '0'), $bomUnitArr['bom_qty'],$value['BATCH'],$rmribObj->id,$obj->is_special_stock,$obj->sales_order_code,$obj->sales_order_project_code);
                    }
                }
                //如果当前 退料单的所有明细批次实收数据已完成修改，则表明退料完成，更新状态为4
                if ($this->checkIsLastReturn($obj->mr_id)) {
                    $auditingParam[$this->apiPrimaryKey] = $obj->mr_id;
                    $this->auditing($auditingParam);        // SAP退料 出库  状态：2->3
                    $this->updateStatus($obj->mr_id, 4);    // 实退数，退料完成 状态 3->4
                }
                // 获取 退料工单
                $work_ids = DB::table('ruis_return_material_received')
                    ->where([
                        ['material_requisition_id','=',$obj->mr_id],
                        ['material_id','=',$obj->material_id]
                    ])->pluck('work_order_id')->toArray();
                // 修改工单状态
                if($work_ids) $this->updateById($work_ids,['picking_status'=>0],config('alias.rwo'));
            } else {
                foreach ($datum['ITEMS'] as $value) {

                    !isset($value['SQNM']) && TESAP('700', 'SQNM');
                    !isset($value['MATNR']) && TESAP('700', 'MATNR');
                    !isset($value['BATCH']) && TESAP('700', 'BATCH');
                    !isset($value['MATQTY']) && TESAP('700', 'MATQTY');
                    !isset($value['MEINS']) && TESAP('700', 'MEINS');

                    if ($obj->material_code != ltrim($value['MATNR'], '0')) {
                        TESAP('2428');
                    }

                    //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
                    $code_pre = substr($obj->category_code, 0,4);
                    $pao_change = 0;
                    if($code_pre == '3002' && $value['MEINS'] == 'M'){
                        //针对批次为1，进行消耗，从仓库收集的表中获得比例
                        $switch = config('app.batch1');
                        if($value['BATCH'] == 1 && $switch == 1){
//                            $where2 = [];
//                            $where2[] = ['rrb.material_code','=',$obj->material_code];
//                            $where2[] = ['rrb.lot','=',$value['BATCH']];
//                            $where2[] = ['rrb.conversion','>=','0'];
//                            $conversion = DB::table('ruis_robe_batch as rrb')->select('conversion')
//                                ->where($where2)
//                                ->first();

                            $pao_change = 0;
                        }else {
                            //获取米／公斤的转换比例
                            $where = [];
                            $where[] = ['rwdoi.material_id', '=', $obj->material_id];
                            $where[] = ['rwdoi.lot', '=', $value['BATCH']];
                            $where[] = ['rwdoi.type', '=', '-1'];
                            $where[] = ['rwdoi.conversion', '>=', '0'];
                            $conversion = DB::table(config('alias.rwdoi') . ' as rwdoi')->select('conversion')
                                ->where($where)
                                ->first();

                            if(!isset($conversion) || empty($conversion) || $conversion->conversion == 0){
                                $pao_change = 0;
                            }else{
                                //取一位小数
                                $bomUnitArr['bom_qty'] = floor($value['MATQTY'] * $conversion->conversion * 1000) / 1000;
                                $bomUnitArr['bom_unit'] = 'KG';
                                $bomUnitArr['bom_unit_id'] = $obj->bom_unit_id;
                                $pao_change = 1;
                            }
                        }
                    }

                    if($pao_change == 0){
                        $bomUnitArr = $this->baseUnitToBomUnit($obj->material_id, $value['MEINS'], $value['MATQTY'], $obj->bom_unit_id);
                    }
                    #####################

                    // SAP传过来的基本单位转为 bom单位
                    //$bomUnitArr = $this->baseUnitToBomUnit($obj->material_id, $value['MEINS'], $value['MATQTY'], $obj->bom_unit_id);
                    $keyVal['order'] = str_pad($value['SQNM'], 5, '0', STR_PAD_LEFT);
                    $keyVal['batch'] = $value['BATCH'];
                    $keyVal['actual_send_qty'] = $bomUnitArr['bom_qty'];
                    $keyVal['bom_unit_id'] = $bomUnitArr['bom_unit_id'];
                    $keyVal['base_unit'] = $value['MEINS'];
//                    $insertKeyValArrays[] = $keyVal;
                    //取出插入批次表记录id 做工单物料与批次关系表的记录 Add By Bruce.Chu
                    $batch_id=DB::table(config('alias.rmrib'))->insertGetId($keyVal);
                    // 把总的物料分散到各个物料中 拿到循环内部 Modify By Bruce.Chu
                    if ($obj->type = 1) {
                        if (empty($MergerPicking)) {
                            $MergerPicking = new MergerPicking();
                        }
                        // 增加根据物料来进行分配数量
                         if($code_pre == '3002'){
                             $MergerPicking->backFilldistribution($obj->mr_id, ltrim($value['MATNR'], '0'), $bomUnitArr['bom_qty'],$batch_id,$obj->is_special_stock,$obj->sales_order_code,$obj->sales_order_project_code);
                         }else{
                            $MergerPicking->backFill($obj->mr_id, ltrim($value['MATNR'], '0'), $bomUnitArr['bom_qty'],$batch_id,$obj->is_special_stock,$obj->sales_order_code,$obj->sales_order_project_code);
                         }
                    }
                }
//                DB::table(config('alias.rmrib'))->insert($insertKeyValArrays);
                //如果 当前领补料单 所有的明细批次已完成发料，则表示发料完成，更新状态为3
                if ($this->checkIsLastSend($obj->mr_id)) {
                    $this->updateStatus($obj->mr_id, 3);    //实发数
                }
//                return $value;
                // 合并领料
                // 把总的物料分散到各个物料中
//                if ($obj->type = 1 && $obj->is_merger_picking == 1) {
//                    if (empty($MergerPicking)) {
//                        $MergerPicking = new MergerPicking();
//                    }
//                    $MergerPicking->backFill($obj->mr_id, ltrim($value['MATNR'], '0'), $value['MATQTY']);
//                }
                //将工单状态更新为 已领料 picking_status=>2  Add By Bruce.Chu
                if(empty($obj->work_order_id)){
                    $work_order_ids=DB::table(config('alias.rmre'))
                        ->where('material_requisition_id',$obj->mr_id)
                        ->distinct()
                        ->pluck('work_order_id');
                    $work_order_ids=obj2array($work_order_ids);
                    // 修改工单状态
//                    DB::table(config('alias.rwo'))->whereIn('id', $work_order_ids)->update(['picking_status'=>2]);
                    $this->updateWork_picking_status($work_order_ids,['picking_status'=>2]);
                    //更新ruis_qc_check的置顶状态
                    DB::table(config('alias.rqc'))->where([['VBELN','=', '00' . $obj->sales_order_code],['VBELP','=', $obj->sales_order_project_code],['MATNR','like', '%' . $obj->material_code],['check_resource','=',1]])->update(['istop'=>0]);

                    //更新工单发料状态 Add By Bruce.Chu 料状态 0:未发，1:少发，2:正常，3:超发
                    foreach ($work_order_ids as $work_order_id){
                        $qty_info=DB::table(config('alias.rmre'))
                            ->where([['material_requisition_id',$obj->mr_id],['work_order_id',$work_order_id]])
                            ->get(['qty','rated_qty']);
                        $qty_info=obj2array($qty_info);
                        $i = 0;
                        $j = 0;
                        foreach ($qty_info as $info) {
                            if ($info['qty'] < $info['rated_qty']){
                                $i++;
                            }elseif($info['qty'] > $info['rated_qty']){
                                $j++;
                            }
                        }
                        if($i>0){
                            $this->updateById($work_order_id,['send_status'=>1],config('alias.rwo'));
                        }elseif ($j>0){
                            $this->updateById($work_order_id,['send_status'=>3],config('alias.rwo'));
                        }
                        else{
                            $this->updateById($work_order_id,['send_status'=>2],config('alias.rwo'));
                        }
                    }
                }else{
//                    DB::table(config('alias.rwo'))->where('id', $obj->work_order_id)->update(['picking_status'=>2]);
                    $this->updateWork_picking_status($obj->work_order_id,['picking_status'=>2]);
                    //更新ruis_qc_check的置顶状态
                    DB::table(config('alias.rqc'))->where([['VBELN','=', '00' . $obj->sales_order_code],['VBELP','=', $obj->sales_order_project_code],['MATNR','like', '%' . $obj->material_code],['check_resource','=',1]])->update(['istop'=>0]);

                    //因为按单领料未生成工单领料记录，所以需要求和所有的批次和领料单上的子项需求量做对比
                    $batch_list = DB::table(config('alias.rmrib'))
                        ->select(DB::raw('item_id,sum(actual_send_qty) as total_actual_send_qty'))
                        ->where('material_requisition_id',$obj->mr_id)
                        ->groupBy('item_id')
                        ->get();
                    $need_list = DB::table(config('alias.rmri'))->where('material_requisition_id',$obj->mr_id)
                        ->pluck('demand_qty','id')->toArray();
                    // 更新SAP发料状态   0:未发，1:少发，2:正常，3:超发
                    $flag = 0;
                    foreach ($batch_list as $k=>$v) {
                        if ($v->total_actual_send_qty < $need_list[$v->item_id]){
                            $flag = 1;
                            break;
                        }elseif ($v->total_actual_send_qty > $need_list[$v->item_id]){
                            $flag = 3;
                            break;
                        }else{
                            $flag = 2;
                            break;
                        }
                    }
                    if($flag == 1){
                        $this->updateById($obj->work_order_id,['send_status'=>1],config('alias.rwo'));
                    }elseif ($flag == 3){
                        $this->updateById($obj->work_order_id,['send_status'=>3],config('alias.rwo'));
                    }else{
                        $this->updateById($obj->work_order_id,['send_status'=>2],config('alias.rwo'));
                    }
                }
            }
        }
        return [];
    }
//endregion

//region 报工&mes领料

    /**
     * 报工用到的适合库存
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialStorageInPW($input)
    {

        if (empty($input['material_ids'])) return [];
        $input['material_id_arr'] = array_unique(explode(',', $input['material_ids']));
        if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
        $has = $this->isExisted([['id', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('700', 'line_depot_id');

        // 验证 物料id是否存在
        $material_count = DB::table(config('alias.rm'))
            ->whereIn('id', $input['material_id_arr'])
            ->count();
        if ($material_count != count($input['material_id_arr'])) TEA('700', 'material_ids');
        
        //验证 工单
        if (empty($input['work_order_code'])) TEA('700', 'work_order_code');
        $has = $this->isExisted([['number', '=', $input['work_order_code']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_code');

        //验证 订单
        if (empty($input['product_order_code'])) TEA('700', 'product_order_code');
        $has = $this->isExisted([['number', '=', $input['product_order_code']]], config('alias.rpo'));
        if (!$has) TEA('700', 'product_order_code');

        //如果销售订单为空，查询的时候也要带上条件，值为空字符串
        $input['sale_order_code'] = empty($input['sale_order_code']) ? '' : $input['sale_order_code'];

        /**
         * @todo 流转品查询的时候 PO SO WO 均为空 12.09
         */
        $obj_list = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.plant_id as factory_id',
                'rsi.depot_id',
                'rsi.lot as batch',
                'rsi.unit_id',
                'ruu.commercial as unit_name',
                'rsi.sale_order_code',
                'rsi.po_number as product_order_code',
                'rsi.wo_number as work_order_code',
                'rsi.material_id',
                'rsi.lot as inve_lot',
                'rsi.send_depot',
                'rm.item_no as material_code',
                'rsd.code as depot_code',
                'rsd.name as depot_name',
                'rf.code as factory_code',
                'rf.name as factory_name',
                'rsi.storage_validate_quantity as storage_number',
            ])
//            ->addSelect(DB::raw('SUM(rsi.storage_validate_quantity) as storage_number'))
            ->where(function ($query) use ($input) {
//                $query->where([
//                    ['rsi.po_number', '=', $input['product_order_code']],
//                    ['rsi.wo_number', '=', $input['work_order_code']]
//                ])
//                    ->orWhere([
//                        ['rsi.po_number', '=', ''],
//                        ['rsi.wo_number', '=', '']
//                    ]);
                $query->where([
                    ['rsi.sale_order_code', '=', $input['sale_order_code']],
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
                        ['rsi.po_number', '=', $input['product_order_code']],
                        ['rsi.wo_number', '=', '']
                    ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ])
//                    ->orWhere([
//                        ['rm.lzp_identity_card', '<>', ''],
//                        ['rsi.sale_order_code', '=', ''],
//                        ['rsi.po_number', '=', ''],
//                        ['rsi.wo_number', '=', '']
//                    ]);
                    ->orWhere([
                        ['rsi.sale_order_code', '=', ''],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
            ->where([
//                ['rsi.sale_order_code', '=', $input['sale_order_code']],
                ['rsi.depot_id', '=', $input['line_depot_id']]
            ])
            ->whereIn('rsi.material_id', $input['material_id_arr'])
//            ->groupBy('rsi.material_id', 'rsi.lot', 'rsi.depot_id', 'rsi.po_number')
            ->get();
        $material_res = DB::table(config('alias.rwo').' as rwo')
            ->leftJoin(config('alias.rwoi').' as rwoi','rwoi.work_order_id','=','rwo.id')
            ->where([
                ['rwo.number',$input['work_order_code']],
            ])
            ->select('rwoi.bom_unit_id','rwoi.material_id')
            ->pluck('bom_unit_id','material_id')->toArray();
        $tempArr = [];
        //获取所有物料的单位
        $returnMaterialRegion = ['1','2','3'];

        //获取预报工的部分信息
        $WorkDeclareOrder = new WorkDeclareOrder();
        $PreWorkDeclareList = $WorkDeclareOrder->getPreWorkDeclare(['work_order_code'=>$input['work_order_code']]);//获取最新的预报工单

        foreach ($obj_list as $obj) {
            //只有实时库存大于0，才会收集
            if ($obj->storage_number > 0) {
                //获取进料商
                //$obj->LIFNR = $WorkDeclareOrder->getSupplierByIqc(['material_ids'=>$obj->material_id]);
                $obj->LIFNR = '';
                $obj->CHOSE_LIFNR = '';
                $obj->MKPF_BKTXT = '';
                $obj->diff_remark = '';
                //获取选中的进料商
                if(!empty($PreWorkDeclareList) && isset($PreWorkDeclareList->items))
                {
                    //根据库存地获取供应商
                    foreach ($PreWorkDeclareList->items as $pv)
                    {
                        if($pv->inve_id == $obj->inve_id)
                        {
                            $obj->CHOSE_LIFNR = $pv->LIFNR;
                            $obj->MKPF_BKTXT = $pv->MKPF_BKTXT;
                            $obj->diff_remark = $pv->diff_remark;

                            unset($pv);
                        }
                    }
                }

                // 增加 如果工单物料单位与库存单位不一致，进行转换.....    此处与报工保存关联，
                if(isset($material_res[$obj->material_id]) && $obj->unit_id != $material_res[$obj->material_id]){
                    $curren_unit = DB::table(config('alias.ruu'))->where('id',$obj->unit_id)->first();
                    $unit = $this->RelationalTransformation('',$obj->material_code,$obj->storage_number,$curren_unit->commercial,'2');
                    $obj->storage_number = $unit['sum'];
                    $obj->unit_name = $unit['lc_unit'];
                    $unit_id = DB::table(config('alias.ruu'))->where('commercial',$unit['lc_unit'])->first(['id']);
                    $obj->unit_id = $unit_id->id;
                }
                $where[] = ['rmr.type','=',2];
                $where[] = ['rmr.is_delete', '=' ,0];
                $receiveInfo = DB::table(config('alias.rrmr').' as rrmr')
                    ->leftJoin(config('alias.rmr').' as  rmr', 'rmr.id', '=', 'rrmr.material_requisition_id')
                    ->select('rmr.id','rrmr.rated_qty')
                    ->where($where)
                    ->where('rrmr.inve_id','=',$obj->inve_id)
                    ->whereIn('rmr.status',$returnMaterialRegion)
                    ->first();
                if($receiveInfo){
                    $obj->storage_number = $obj->storage_number - $receiveInfo->rated_qty;
                }
                if($obj->storage_number > 0){
                    $categoryInfo =  DB::table(config('alias.rm').' as rm')
                        ->leftJoin(config('alias.rmc').' as  rmc', 'rmc.id', '=', 'rm.material_category_id')
                        ->select('rmc.code')
                        ->where('rm.id','=',$obj->material_id)
                        ->first();
                    /**
                     * 如果是棉泡获取报工的一个转换比例
                     */
                    if (strpos($categoryInfo->code,'3002') !== false) {
                       $declareInfo = DB::table(config('alias.rwdoi').' as rwdoi')
                           ->select('rwdoi.conversion')
                           ->where(['material_id' => $obj->material_id])
                           ->where(['rwdoi.lot' => $obj->inve_lot])
                           ->where(['rwdoi.type' => '-1'])
                           ->where('conversion', '>',0)
                           ->first();
                       /**
                        * 如果该物料的单位是kg才会启用这个转换比
                        */
                        $materialUnit = DB::table(config('alias.rwoi').' as rwoi')
                            ->select('rwoi.bom_commercial','rwoi.material_id')
                            ->where('rwoi.bom_commercial','=','KG')
                            ->where('rwoi.material_id', '=', $obj->material_id)
                            ->where('rwoi.work_order_code','=', $input['work_order_code'])
                            ->first();
                       if($materialUnit && $declareInfo){
                            $obj->conversion = $declareInfo->conversion;
                       } else {
                            $obj->conversion = 0;
                       }

                       /**
                        * 如果棉泡为1 启用转换比
                        */
                       if ($obj->inve_lot == 1) {
                           $marmInfo = DB::table(config('alias.ramm'))
                               ->select([
                                   'UMREZ',
                                   'UMREN',
                                   'MEINH',
                               ])
                               ->where([
                                   ['material_id', $obj->material_id],
                                   ['MEINH', 'M']
                               ])
                               ->first();
                           if ($marmInfo && $materialUnit) {
                               $obj->conversion = round($marmInfo->UMREZ / $marmInfo->UMREN,3);
                           } else {
                               $obj->conversion = 0;
                           }
                       }
                       if($obj->conversion > 0){
                           if(round($obj->storage_number / $obj->conversion,3) <= 0){
                               continue;
                           }
                       }
                    }
                    $tempArr[$obj->material_id][] = $obj;
                }
            }
        }
        return $tempArr;
    }

    /**
     * 委外报工用到的适合库存
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialStorageInPWNew($input)
    {

        if (empty($input['material_ids'])) return [];
        $input['material_id_arr'] = array_unique(explode(',', $input['material_ids']));
        if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
        $has = $this->isExisted([['id', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('700', 'line_depot_id');

        // 验证 物料id是否存在
        $material_count = DB::table(config('alias.rm'))
            ->whereIn('id', $input['material_id_arr'])
            ->count();
        if ($material_count != count($input['material_id_arr'])) TEA('700', 'material_ids');

        //验证 工单
        if (empty($input['work_order_code'])) TEA('700', 'work_order_code');
        $has = $this->isExisted([['number', '=', $input['work_order_code']]], config('alias.rsco'));
        if (!$has) TEA('700', 'work_order_code');

        //验证 订单
        if (empty($input['product_order_code'])) TEA('700', 'product_order_code');
        $has = $this->isExisted([['number', '=', $input['product_order_code']]], config('alias.rpo'));
        if (!$has) TEA('700', 'product_order_code');

        //如果销售订单为空，查询的时候也要带上条件，值为空字符串
        $input['sale_order_code'] = empty($input['sale_order_code']) ? '' : $input['sale_order_code'];

        /**
         * @todo 流转品查询的时候 PO SO WO 均为空 12.09
         */
        $obj_list = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.plant_id as factory_id',
                'rsi.depot_id',
                'rsi.lot as batch',
                'rsi.unit_id',
                'ruu.commercial as unit_name',
                'rsi.sale_order_code',
                'rsi.po_number as product_order_code',
                'rsi.wo_number as work_order_code',
                'rsi.material_id',
                'rsi.lot as inve_lot',
                'rsi.send_depot',
                'rm.item_no as material_code',
                'rsd.code as depot_code',
                'rsd.name as depot_name',
                'rf.code as factory_code',
                'rf.name as factory_name',
                'rsi.storage_validate_quantity as storage_number',
            ])
//            ->addSelect(DB::raw('SUM(rsi.storage_validate_quantity) as storage_number'))
            ->where(function ($query) use ($input) {
//                $query->where([
//                    ['rsi.po_number', '=', $input['product_order_code']],
//                    ['rsi.wo_number', '=', $input['work_order_code']]
//                ])
//                    ->orWhere([
//                        ['rsi.po_number', '=', ''],
//                        ['rsi.wo_number', '=', '']
//                    ]);
                $query->where([
                    ['rsi.sale_order_code', '=', $input['sale_order_code']],
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.sale_order_code', '=', $input['sale_order_code']],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ])
//                    ->orWhere([
//                        ['rm.lzp_identity_card', '<>', ''],
//                        ['rsi.sale_order_code', '=', ''],
//                        ['rsi.po_number', '=', ''],
//                        ['rsi.wo_number', '=', '']
//                    ]);
                    ->orWhere([
                        ['rsi.sale_order_code', '=', ''],
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
            ->where([
//                ['rsi.sale_order_code', '=', $input['sale_order_code']],
                ['rsi.depot_id', '=', $input['line_depot_id']]
            ])
            ->whereIn('rsi.material_id', $input['material_id_arr'])
//            ->groupBy('rsi.material_id', 'rsi.lot', 'rsi.depot_id', 'rsi.po_number')
            ->get();
        $tempArr = [];
        //获取所有物料的单位
        $returnMaterialRegion = ['1','2','3'];
        foreach ($obj_list as $obj) {
            //只有实时库存大于0，才会收集
            if ($obj->storage_number > 0) {
                $where[] = ['rmr.type','=',2];
                $where[] = ['rmr.is_delete', '=' ,0];
                $receiveInfo = DB::table(config('alias.rrmr').' as rrmr')
                    ->leftJoin(config('alias.rmr').' as  rmr', 'rmr.id', '=', 'rrmr.material_requisition_id')
                    ->select('rmr.id','rrmr.rated_qty')
                    ->where($where)
                    ->where('rrmr.inve_id','=',$obj->inve_id)
                    ->whereIn('rmr.status',$returnMaterialRegion)
                    ->first();
                if($receiveInfo){
                    $obj->storage_number = $obj->storage_number - $receiveInfo->rated_qty;
                }
                if($obj->storage_number > 0){
                    $categoryInfo =  DB::table(config('alias.rm').' as rm')
                        ->leftJoin(config('alias.rmc').' as  rmc', 'rmc.id', '=', 'rm.material_category_id')
                        ->select('rmc.code')
                        ->where('rm.id','=',$obj->material_id)
                        ->first();
                    /**
                     * 如果是棉泡获取报工的一个转换比例
                     */
                    if (strpos($categoryInfo->code,'3002') !== false) {
                        $declareInfo = DB::table(config('alias.rwdoi').' as rwdoi')
                            ->select('rwdoi.conversion')
                            ->where(['material_id' => $obj->material_id])
                            ->where(['rwdoi.lot' => $obj->inve_lot])
                            ->where(['rwdoi.type' => '-1'])
                            ->where('conversion', '>',0)
                            ->first();
                        /**
                         * 如果该物料的单位是kg才会启用这个转换比
                         */
                        $materialUnit = DB::table(config('alias.rwoi').' as rwoi')
                            ->select('rwoi.bom_commercial','rwoi.material_id')
                            ->where('rwoi.bom_commercial','=','KG')
                            ->where('rwoi.material_id', '=', $obj->material_id)
                            ->where('rwoi.work_order_code','=', $input['work_order_code'])
                            ->first();
                        if($materialUnit && $declareInfo){
                            $obj->conversion = $declareInfo->conversion;
                        } else {
                            $obj->conversion = 0;
                        }

                        /**
                         * 如果棉泡为1 启用转换比
                         */
                        if ($obj->inve_lot == 1) {
                            $marmInfo = DB::table(config('alias.ramm'))
                                ->select([
                                    'UMREZ',
                                    'UMREN',
                                    'MEINH',
                                ])
                                ->where([
                                    ['material_id', $obj->material_id],
                                    ['MEINH', 'M']
                                ])
                                ->first();
                            if ($marmInfo && $materialUnit) {
                                $obj->conversion = round($marmInfo->UMREZ / $marmInfo->UMREN,3);
                            } else {
                                $obj->conversion = 0;
                            }
                        }
                        if($obj->conversion > 0){
                            if(round($obj->storage_number / $obj->conversion,3) <= 0){
                                continue;
                            }
                        }
                    }
                    $tempArr[$obj->material_id][] = $obj;
                }
            }
        }
        return $tempArr;
    }

    /**
     * 验证报工中的mes领料参数
     *
     * @param array $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkMixedStoreParams(&$input)
    {
        if (empty($input['product_order_code'])) TEA('700', 'product_order_code');
        $po_obj = DB::table(config('alias.rpo'))->select('id')->where('number', $input['product_order_code'])->first();
        if (empty($po_obj)) TEA('700', 'product_order_code');
        $input['product_order_id'] = $po_obj->id;

        if(isset($input['sub_id']) && $input['sub_id'] > 0){
            ;
        }else{
            if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
            $wo_obj = DB::table(config('alias.rwo'))->select('number as code')->where('id', $input['work_order_id'])->first();
            if (empty($po_obj)) TEA('700', 'work_order_code' . json_encode($wo_obj));
            $input['work_order_code'] = $wo_obj->code;
        }


        if (!isset($input['sale_order_code'])) TEA('700', 'sale_order_code');
        if (!isset($input['sales_order_project_code'])) TEA('700', 'sales_order_project_code');
        $input['sale_order_project_code'] = $input['sales_order_project_code'];

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', '=', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        if (!isset($input['in_materials'])) TEA('700', 'in_materials');
        try {
            $input['materials'] = json_decode($input['in_materials'], true);
        } catch (\Exception $e) {
            TEA('700', 'in_materials');
        }
        if (empty($input['materials'])) TEA('700', 'in_materials');
        foreach ($input['materials'] as $_k => &$material) {
            // 如果消耗量为0，则跳过这个进料
            if (!isset($material['GMNGA'])) TEA('700', 'GMNGA');        //消耗数
            if ($material['GMNGA'] <= 0) {
                unset($input['materials'][$_k]);
                continue;
            }

            if (empty($material['material_id'])) TEA('700', 'material_id');
            $material_obj = DB::table(config('alias.rm'))
                ->where('id', $material['material_id'])
                ->select(['id', 'item_no as material_code'])
                ->first();
            if (empty($material_obj)) TEA('700', 'material_id');
            $material['material_code'] = $material_obj->material_code;

            //验证单位
            if (empty($material['unit_id'])) TEA('700', 'unit_id');
            $has = $this->isExisted([['id', '=', $material['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            //验证库存地点
            if (empty($material['depot_id'])) TEA('700', 'depot_id');
            $has = $this->isExisted([['id', '=', $material['depot_id']]], config('alias.rsd'));
            if (!$has) TEA('700', 'depot_id');

            if (empty($material['inve_id'])) TEA('700', 'inve_id');
            $has = $this->isExisted([['id', '=', $material['inve_id']]], config('alias.rsi'));
            if (!$has) TEA('700', 'inve_id');

            if (!isset($material['qty'])) TEA('700', 'qty'); //计划数量 从WO过来的
            if (!isset($material['batch_qty'])) TEA('700', 'batch_qty');    //额定数量
            if (!isset($material['storage_number'])) TEA('700', 'storage_number');        //库存数量
            $material['plan_qty'] = $material['qty'];
            $material['rated_qty'] = $material['batch_qty'];
            $material['actual_qty'] = $material['GMNGA'];
            //额定数量不能大于计划数量
            if(isset($material['rated_quantily']))//此处判断是为了兼容其他调用这个方法
            {
                if ($material['rated_quantily'] > $material['plan_qty']) {
                    TEPA('额定数量不能大于计划数量');
                }
            }
            else
            {
                if ($material['rated_qty'] > $material['plan_qty']) {
                    TEPA('额定数量不能大于计划数量');
                }
            }
//            if ($material['rated_qty'] > $material['plan_qty']) {

            //消耗数量不能大于实际库存
            if ($material['actual_qty'] > $material['storage_number']) {
                TEA('700', 'GMNGA');
            }
        }
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        if(!$input['employee_id']) {
            $employeeInfo = DB::table(config('alias.re'))->select('id')->where('admin_id',$input['creator_id'])->first();
            $input['employee_id'] = isset($employeeInfo->id) ? $employeeInfo->id : 0;
        }
    }

    /**
     * @param $input
     * @param int $is_last_produce_work 是否为最后一次报工
     * @param int $declare_id 报工单id
     * @throws \App\Exceptions\ApiException
     */
    public function mixedStore($input, $is_last_produce_work = 0, $declare_id)
    {
        $this->checkMixedStoreParams($input);
        $mr_keyVal = [
            'push_type' => 0,
            'sale_order_code' => get_value_or_default($input, 'sale_order_code', ''),
            'sale_order_project_code' => get_value_or_default($input, 'sale_order_project_code', ''),
            'factory_id' => get_value_or_default($input, 'factory_id', 0),
            'line_depot_id' => get_value_or_default($input, 'depot_id', 0),
            'send_depot' => get_value_or_default($input, 'send_depot', ''),
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_code' => $input['product_order_code'],
            'product_order_id' => $input['product_order_id'],
            'employee_id' => get_value_or_default($input, 'employee_id', 0),
            'creator_id' => get_value_or_default($input, 'creator_id', 0),
            'declare_id' => $declare_id, //报工单id
            'from' => 1,
            'ctime' => time(),
            'mtime' => time(),
            'time' => time(),
            'status' => 1,
            'dispatch_time' => time()
        ];
        //委外工单报工is_depot_picking定义为1，后面不需要进行工单验证
        if(isset($input['sub_id']) && $input['sub_id'] > 0){
            $mr_keyVal['is_depot_picking'] = 1;
        }

        //补丁 如果该工单切换了工作中心
        $workInfo = DB::table(config('alias.rwo'))->select('actual_work_shift_id')
            ->where(['id' => $input['work_order_id'],'is_switch_workcenter' => '1'])->first();
        if ($workInfo) {
            $mr_keyVal['workbench_id'] = $workInfo->actual_work_shift_id;
        }

        /**
         * @var array $mes_material_arr mes领料的物料数据数组
         * @var array $return_material_arr 退料的物料数据数组
         * @var array $fullUp_material_arr 补料的物料数据数组
         */
        $mes_material_arr = [];
        $return_material_arr = [];
        $fullUp_material_arr = [];
        // 根据计划用量和实际用量关系 分出领补退物料数据数组
        foreach ($input['materials'] as $material) {
            if ($material['rated_qty'] > 0) {
                $mes_material_arr[] = $material;
            }
            if ($material['rated_qty'] > $material['actual_qty']) {
                $return_material_arr[] = $material;
            }
            /*$production_patch = $this->productionPatch($material,$input['work_order_id']);
            if(!empty($production_patch))
            {
                $fullUp_material_arr[] = $production_patch;
            }*/
            if ($material['rated_qty'] < $material['actual_qty']) {
                $fullUp_material_arr[] = $material;
            }
        }

        // 1. 分别组装数据，插入到三张表中
        // 2. 然后分别对三个订单 进行出入库操作

        //领
        if (!empty($mes_material_arr)) {
            $mes_mr_id = $this->createMR($mes_material_arr, $mr_keyVal, 1);
            $input[$this->apiPrimaryKey] = $mes_mr_id;
            $mes_mr_id && $this->auditing($input);
        }

        //退
        if (!empty($return_material_arr)) {
            $return_mr_id = $this->createMR($return_material_arr, $mr_keyVal, 2);
            $input[$this->apiPrimaryKey] = $return_mr_id;
            $return_mr_id && $this->auditing($input, $is_last_produce_work);
        }

        //补
        if (!empty($fullUp_material_arr)) {
            //如果未传workbench_id，同时没有切换工作中心,那么拿工单里的工作中心
            if($mr_keyVal['workbench_id'] == 0 && !$workInfo)
            {
                $work_shift_id = DB::table(config('alias.rwo'))->where(['id' => $input['work_order_id']])->value('work_shift_id');
                if($work_shift_id)
                {
                    $mr_keyVal['workbench_id'] = $work_shift_id;
                }
            }
            $fullUp_mr_id = $this->createMR($fullUp_material_arr, $mr_keyVal, 7);
            $input[$this->apiPrimaryKey] = $fullUp_mr_id;
            $fullUp_mr_id && $this->auditing($input);
        }
    }

    public function productionPatch($material,$work_order_id)
    {
        $fullUp_material = [];
        //生成补料逻辑变化
        //1.如果没有生产累计超耗补料单，那么（消耗+累计消耗>计划数量）生成补料单；补料数量 = （消耗+累计）-计划
        //2.如果有生成累计超耗补料单，那么 （消耗数量）直接生成补料单; 补料数量=消耗数量

        //获取生产累计超耗补料单
        $rmr_num = DB::table('ruis_material_requisition')
            ->where([
                ['type','7'],
                ['work_order_id',$work_order_id],
                ['push_type',0],
                ['is_delete',0]
            ])
            ->count();
        if($rmr_num == 0)
        {
            //工单累计消耗数量,
            //因为前面已经将消耗写入数据库中，所以这边直接拿就可以，注意前面的事务
            $total_consume_qty= DB::table('ruis_work_declare_order_item')
                ->where(['type'=>1,'work_order_id'=>$work_order_id,'material_id'=>$material['material_id']])
                ->sum('GMNGA');
            $plan_qty = $material['plan_qty'];//计划数量
            //$actual_qty = $material['actual_qty'];//实报消耗数量;
            if($total_consume_qty>$plan_qty)//累计消耗>计划数量
            {
                //补料数量 = 累计消耗-计划消耗
                $bl_qty = bcsub($total_consume_qty,$plan_qty,2);
                $material['bl_qty'] = $bl_qty;
                $fullUp_material = $material;
            }
        }
        else
        {
            $material['bl_qty'] = $material['actual_qty'];
            $fullUp_material = $material;
        }
        return $fullUp_material;
    }

    /**
     * 创建领、补、退料单
     *
     * @param array $materials 需要处理的数组
     * @param array $mrKeyVal mr的主表(领、补、退)的 公共字段
     * @param int $type [1,2,7] 分别为 mes领料，车间退料，车间补料
     * @return mixed
     */
    public function createMR($materials, $mrKeyVal, $type = 1)
    {
        if (empty($materials)) {
            return false;
        }
        //按照物料和地点分组
        $temp_material_arr = [];
        foreach ($materials as $material) {
            $temp_material_arr[$material['material_id'] . '_' . $material['depot_id']][] = $material;
        }

        $i = 1;
        $itemKeyValArr = [];
        $line_depot_id = '';
        foreach ($temp_material_arr as $key => $value) {
            $itemTempKeyValArr = [];

            $batchKeyValArr = [];
            $j = 1;
            foreach ($value as $v) {
                empty($itemTempKeyValArr) && $itemTempKeyValArr = [
                    'line_project_code' => str_pad($i++, 5, '0', STR_PAD_LEFT),
                    'material_id' => $v['material_id'],
                    'material_code' => $v['material_code'],
                    'demand_qty' => $v['plan_qty'],
                    'demand_unit_id' => $v['unit_id'],  //此为 bom_unit_id
                    'send_status' => 1,
                    'is_special_stock' => isset($v['is_spec_stock']) ? $v['is_spec_stock'] : '',
                    'depot_id' => $v['depot_id'],
                ];
                $qtyArr = $this->getQty($v, $type);
                //如果数量为0，则不生成领料单
                if ($qtyArr['actual_receive_qty'] <= 0) {
                    continue;
                }
                $batchKeyValArr[] = [
                    'order' => str_pad($j++, 5, '0', STR_PAD_LEFT),
                    'batch' => empty($v['batch']) ? '' : $v['batch'],
                    'actual_send_qty' => $qtyArr['actual_send_qty'],
                    'actual_receive_qty' => $qtyArr['actual_receive_qty'],
                    'bom_unit_id' => $v['unit_id'],
                    'inve_id' => $v['inve_id']
                ];
            }
            $itemTempKeyValArr['batchArr'] = $batchKeyValArr;
            $itemKeyValArr[] = $itemTempKeyValArr;
            if(empty($line_depot_id)){
                $line_depot_id = $v['depot_id'];
            }
        }
        $mrKeyVal['code'] = $this->getNewCode($type);
        $mrKeyVal['type'] = $type;
        // 线边仓id 重新赋值
        $mrKeyVal['line_depot_id'] = empty($mrKeyVal['line_depot_id']) ? $line_depot_id : $mrKeyVal['line_depot_id'];
        $insert_batch_key_val_arr = [];     //收集要插入rmrib表的KeyVal数组
        if($type == 7 && $mrKeyVal['push_type']==0)//补料
        {
            $mr_id = DB::table($this->table)->insertGetId($mrKeyVal);
            //1.如果消耗数量<=计划数量，审核通过
            $repairstatus = 1;//审核状态 0：未审核，1：已审核
            $feeding_ratio = 0;//补料比例
            $feeding_ratio_1 = 0;//除3002开头最大的补料比例
            foreach ($itemKeyValArr as $itemKeyVal) {
                $bl_all_qty = 0;//补料数量
                $plan_qty = $itemKeyVal['demand_qty'];//计划数量
                foreach ($itemKeyVal['batchArr'] as $iv)//兼容一个物料多个库存
                {
                    $bl_all_qty = bcadd($bl_all_qty,$iv['actual_send_qty'],4);
                }

                //获取这个工单的补料总数量
                $work_order_id = DB::table(config('alias.rmr'))->where('id',$mr_id)->value('work_order_id');
                $bl_all_qty += DB::table(config('alias.rmr').' as rmr')
                    ->leftJoin(config('alias.rmri').' as rmri','rmr.id','=','rmri.material_requisition_id')
                    ->leftJoin(config('alias.rmrib').' as rmrib','rmri.id','=','rmrib.item_id')
                    ->where([
                        ['rmr.type',7],
                        ['rmr.push_type',0],
                        ['rmr.work_order_id',$work_order_id],
                        ['rmr.status',4],
                        ['rmri.material_id',$itemKeyVal['material_id']]
                    ])
                    ->where('rmr.id','<>',$mr_id)
                    ->sum('rmrib.actual_receive_qty');

                //计划数量如果有总计划数量获取总计划数量
                $work_order_code = DB::table(config('alias.rwo'))->where('id',$work_order_id)->value('number');
                $plan_qty1 = $this->getAllRatedQty($work_order_code,$itemKeyVal['material_id']);
                if($plan_qty1 && $plan_qty1!=0) $plan_qty = $plan_qty1;
                //计算补料比例
                $feeding_ratio_temp = bcdiv($bl_all_qty,$plan_qty,4);
                //获取最大补料比例
                if($feeding_ratio<$feeding_ratio_temp)
                {
                    $feeding_ratio = $feeding_ratio_temp;
                }
                //除3002开头最大的补料比例
                if($feeding_ratio_1<$feeding_ratio_temp && substr($itemKeyVal['material_code'],0,4)!=3002)
                {
                    $feeding_ratio_1 = $feeding_ratio_temp;
                }
                //3002开头的必须要审核
                if(substr($itemKeyVal['material_code'],0,4)==3002)
                {
                    $repairstatus = 0;
                }
                if($bl_all_qty>$plan_qty)
                {
                    $repairstatus = 0;
                }

                $batchArr = $itemKeyVal['batchArr'];
                unset($itemKeyVal['batchArr']);

                $itemKeyVal['material_requisition_id'] = $mr_id;
                $mri_id = DB::table($this->itemTable)->insertGetId($itemKeyVal);

                //遍历，并添加主表的id
                foreach ($batchArr as $batch) {
                    $batch['material_requisition_id'] = $mr_id;
                    $batch['item_id'] = $mri_id;
                    $insert_batch_key_val_arr[] = $batch;
                }
            }

            //2.除3002开头，补料比例大于0.02,需要审核,同时已生成的补料数量大雨0.02也需要审核
            if($repairstatus == 1 && $feeding_ratio_1>0.02)
            {
                $repairstatus = 0;
            }

            DB::table($this->table)->where('id',$mr_id)->update(['feeding_ratio'=>$feeding_ratio,'repairstatus'=>$repairstatus]);
        }
        else
        {
            $mr_id = DB::table($this->table)->insertGetId($mrKeyVal);
            foreach ($itemKeyValArr as $itemKeyVal) {
                $batchArr = $itemKeyVal['batchArr'];
                unset($itemKeyVal['batchArr']);

                $itemKeyVal['material_requisition_id'] = $mr_id;
                $mri_id = DB::table($this->itemTable)->insertGetId($itemKeyVal);

                //遍历，并添加主表的id
                foreach ($batchArr as $batch) {
                    $batch['material_requisition_id'] = $mr_id;
                    $batch['item_id'] = $mri_id;
                    $insert_batch_key_val_arr[] = $batch;
                }
            }
        }



        DB::table(config('alias.rmrib'))->insert($insert_batch_key_val_arr);
        return $mr_id;
    }

    /**
     * 获取领退补数据
     *
     * @param array $array
     * @param int $type [1,2,7] 分别为 mes领料，车间退料，车间补料
     * @return array
     */
    public function getQty($array, $type = 1)
    {
        $arr = [];
        switch ($type) {
            case 1:
            default:
                $arr['actual_send_qty'] = $array['rated_qty'];
                $arr['actual_receive_qty'] = $array['rated_qty'];
                break;
            case 2:     //车间退料
                $arr['actual_send_qty'] =
                $arr['actual_receive_qty'] = $array['rated_qty'] - $array['actual_qty'];
                break;
            case 7:
                $arr['actual_send_qty'] =
                $arr['actual_receive_qty'] = $array['actual_qty'] - $array['rated_qty'];
                break;
        }
        return $arr;
    }
//endregion

//region other

    public function exportSupplementaryReason($input)
    {
        $push_type = $input['push_type'];
        if($push_type==0)//生产补料线边仓
        {
            /**
             * 筛选条件
             * 1.开始时间和结束时间
             * 2.补料
             * 3.开单的人
             * 4.审核的人
             * 5.工厂
             * 6.工位
             * 7.
             */
            $headerNameKeyArr = [
                '工单号' => 'work_order_code',
                '编码' => 'code',
                '销售订单号' => 'sale_order_code',
                '销售订单行项目号' => 'sale_order_project_code',
                '生产订单号' => 'product_order_code',
                '发料仓库编码' => 'send_depot_code',
                '发料仓库名称' => 'send_depot_name',
                '需求仓库编码' => 'demand_depot_code',
                '需求仓库名称' => 'demand_depot_name',
                '工厂名称' => 'factory_name',
                '工厂编码' => 'factory_code',
                '工作台' => 'workbench_name',
                '责任人' => 'employee_name',
                '开单人' => 'creator_name',
                '开单时间' => 'ctime',
                '物料号' => 'material_code',
                '物料名称' => 'material_name',
                '物料属性' => 'material_attribute',
                '计划数量' => 'demand_qty',
                '补料数量' => 'actual_receive_sum_qty',
                '单位' => 'unit',
                '是否为特殊库存' => 'is_special_stock',
                '补料原因' => 'reason',
                '补料原因备注' => 'remark',
                '审核人' => 'auditing_operator_name',
                '审核时间' => 'auditing_time',
                '合并工单' => 'merge_work_order',
                '补料比例' => 'bl_radio',
            ];
            $cellData = [
                [
                    '工单号','编码', '销售订单号', '销售订单行项目号', '生产订单号', '发料仓库编码', '发料仓库名称', '需求仓库编码', '需求仓库名称', '工厂名称',
                    '工厂编码', '工作台', '责任人', '开单人', '开单时间', '物料号', '物料名称', '物料属性',  '计划数量', '补料数量', '单位', '是否为特殊库存',
                    '生产补料原因', 'QC补料原因','生产QC补料原因对比','补料原因备注', '审核人', '审核时间','首次补料原因','首次审核人','首次审核时间','合并工单','补料比例'
                ]
            ];
        }
        else
        {
            $headerNameKeyArr = [
                '编码' => 'code',
                '销售订单号' => 'sale_order_code',
                '销售订单行项目号' => 'sale_order_project_code',
                '生产订单号' => 'product_order_code',
                '工单号' => 'work_order_code',
                '发料仓库编码' => 'send_depot_code',
                '发料仓库名称' => 'send_depot_name',
                '需求仓库编码' => 'demand_depot_code',
                '需求仓库名称' => 'demand_depot_name',
                '工厂名称' => 'factory_name',
                '工厂编码' => 'factory_code',
                '工作台' => 'workbench_name',
                '责任人' => 'employee_name',
                '开单人' => 'creator_name',
                '开单时间' => 'ctime',
                '物料号' => 'material_code',
                '物料名称' => 'material_name',
                '物料属性' => 'material_attribute',
                '额定数量' => 'rated_qty',
                '需求数量' => 'demand_qty',
                '实收数量' => 'actual_receive_sum_qty',
                '补料比例' => 'bl_radio',
                '单位' => 'unit',
                '是否为特殊库存' => 'is_special_stock',
                '补料原因' => 'reason',
                '补料原因备注' => 'remark',
                '审核人' => 'auditing_operator_name',
                '审核时间' => 'auditing_time',
            ];
//        $cellData [] = array_keys($headerNameKeyArr);
            $cellData = [
                [
                    '编码', '销售订单号', '销售订单行项目号', '生产订单号', '工单号', '发料仓库编码', '发料仓库名称', '需求仓库编码', '需求仓库名称', '工厂名称',
                    '工厂编码', '工作台', '责任人', '开单人', '开单时间', '物料号', '物料名称', '物料属性', '额定数量', '需求数量', '实收数量','补料比例', '单位', '是否为特殊库存',
                    '生产补料原因', 'QC补料原因','生产QC补料原因对比','补料原因备注', '审核人', '审核时间','首次补料原因','首次审核人','首次审核时间'
                ]
            ];
        }

        $where = [];
        $where[] = ['rmr.type', '=', 7];
        $where[] = ['rmr.is_delete', '=', 0];
        $where[] = ['rwo.is_delete', '=', 0];
        $where[] = ['rwo.on_off', '=', 1];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            $where[] = ['rmr.ctime', '>', strtotime(trim($input['start_time']))];
            $where[] = ['rmr.ctime', '<', strtotime(trim($input['end_time']))];
        }
        if (!empty($input['code'])) $where[] = ['rmr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['work_order_code'])) $where[] = ['rwo.number', 'like', '%' . $input['work_order_code'] . '%'];
        if (!empty($input['product_order_code'])) $where[] = ['rmr.product_order_code', 'like', '%' . $input['product_order_code'] . '%'];
        if (!empty($input['line_depot_id'])) $where[] = ['rmr.line_depot_id', '=', $input['line_depot_id']];
        if (!empty($input['employee_name'])) $where[] = ['re.name', 'like', '%' . $input['employee_name'] . '%'];
        if (isset($input['push_type'])) $where[] = ['rmr.push_type', '=', $input['push_type']];
        isset($input['repairstatus']) && $where[] = ['rmr.repairstatus' ,'=',$input['repairstatus']];
        // 仓储地点
        if(isset($input['line_depot_id']) && !empty($input['line_depot_id'])){
            $where[] = ['rmr.line_depot_id','=',$input['line_depot_id']];
        }

        $builder = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftjoin('mbh_first_qc_reason'.' as mfqr','rmri.id','mfqr.item_id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rmri.auditing_operator_id')
            ->leftJoin(config('alias.rrad') . ' as rrad2', 'rrad2.id', '=', 'mfqr.auditing_operator_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_o', 'rsd_o.id', '=', 'rmri.depot_id')
            ->leftJoin(config('alias.rrad') . ' as rrad_c', 'rrad_c.id', '=', 'rmr.creator_id')
//            ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
            ->select([
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmr.code as code',
                'rmr.time',
                'rmr.ctime',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.status',
                'rmr.product_order_code',
                'rmr.sale_order_code',
                'rmr.sale_order_project_code',
                'rmr.work_order_id',
                'rmr.declare_id',
                'rmri.material_code',
                'rmri.material_id',
                'rm.name as material_name',
                'rmri.demand_qty',
                'rmri.rated_qty',
                'rmri.is_special_stock',
                'rmri.material_code',
                'ruu_d.commercial as unit',
                'rmri.remark',
                'rmri.reason',
                'rmri.qc_reason',
                'rrad.cn_name as auditing_operator_name',
                'rmri.auditing_time',

                //操作人
                'rrad_c.cn_name as creator_name',

                //SAP 发料地点
                'rmr.send_depot as sap_send_depot',

                //车间和mes
                'rsd_o.code as o_send_depot',
                'rsd_o.name as o_send_name',

                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
                'rwo.number as work_order_code',
                'rsd.code as demand_depot_code',
                'rsd.name as demand_depot_name',
                'rsd.id as line_depot_id',
//                'rsd_s.code as send_depot_code',
//                'rsd_s.name as send_depot_name',
//                'rsd_s.id as send_depot_id',
//                'SUM(rmrib.actual_receive_qty) as actual_receive_sum_qty'
                'mfqr.qc_reason as qc_first_reason',   //QC首次补料原因
                'mfqr.auditing_time as auditing_first_time',   //QC首次补料时间
                'rrad2.cn_name as auditing_first_operator_name'                    //QC首次审核人
            ])
            ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as actual_receive_sum_qty'))
            ->where($where)
            ->groupBy('rmr.id', 'rmri.id');
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->auditing_time = empty($v->auditing_time) ? '' : date('Y-m-d H:i:s', $v->auditing_time);
            $v->auditing_first_time = empty($v->auditing_first_time) ? '' : date('Y-m-d H:i:s', $v->auditing_first_time);
            $v->is_special_stock = $v->is_special_stock == 'E' ? '是' : '否';
            $v->merge_work_order = '';
            if($v->type == '7' && $v->push_type == '0' && $v->status=='4')
            {
                $MKPF_BKTXT_ARR = DB::table('ruis_work_declare_order_item')
                    ->select('MKPF_BKTXT','diff_remark')
                    ->where(['declare_id'=>$v->declare_id,'material_id'=>$v->material_id,'type'=>1])
                    ->get();
                if($MKPF_BKTXT_ARR && !empty($MKPF_BKTXT_ARR))
                {
                    foreach ($MKPF_BKTXT_ARR as $mv)
                    {
                        if($mv->MKPF_BKTXT!='')
                        {
                            $v->reason =  $mv->MKPF_BKTXT.',';
                        }
                        if($mv->diff_remark!='' && empty($v->remark))
                        {
                            $v->remark = $mv->diff_remark;
                        }
                    }
                    trim($v->reason,',');
                }
                //合并工单号
                $v->merge_work_order = $this->getMergeWorkOrderCode($v->work_order_code,$v->material_id);
            }
            //qc补料原因没有的默认拿生产补料原因
            if(empty($v->qc_reason))
            {
                $v->qc_reason = $v->reason;
            }
            if (!empty($v->reason)) {
                $reasonObjs = DB::table(config('alias.rps'))
                    ->select(['id', 'name', 'description'])
                    ->whereIn('id', explode(',', $v->reason))
                    ->get();
                $temp_reason_arr = [];
                foreach ($reasonObjs as $reasonObj) {
                    $temp_reason_arr[] = $reasonObj->name . (!empty($reasonObj->description) ? '-' : '') . $reasonObj->description;
                }
                $v->reason = implode(',', $temp_reason_arr);
            }
            // 增加qc 选择原因
            if (!empty($v->qc_reason)) {
                $reasonObjs_arr = DB::table(config('alias.rps'))
                    ->select(['id', 'name', 'description'])
                    ->whereIn('id', explode(',', $v->qc_reason))
                    ->get();
                $temp_reason_res = [];
                foreach ($reasonObjs_arr as $reasonObj) {
                    $temp_reason_res[] = $reasonObj->name . (!empty($reasonObj->description) ? '-' : '') . $reasonObj->description;
                }
                $v->qc_reason = implode(',', $temp_reason_res);
            }

            // 增加qc 选择第一次选择原因
            if (!empty($v->qc_first_reason)) {
                $reasonObjs_first_arr = DB::table(config('alias.rps'))
                    ->select(['id', 'name', 'description'])
                    ->whereIn('id', explode(',', $v->qc_first_reason))
                    ->get();
                $temp_reason_first_res = [];
                foreach ($reasonObjs_first_arr as $reasonObjFirst) {
                    $temp_reason_first_res[] = $reasonObjFirst->name . (!empty($reasonObjFirst->description) ? '-' : '') . $reasonObjFirst->description;
                }
                $v->qc_first_reason = implode(',', $temp_reason_first_res);
            }
            else
            {
                $v->qc_first_reason = $v->reason;
            }
            if ($v->push_type == 1) {
                $v->send_depot_code = $v->sap_send_depot;
                $v->send_depot_name = '';
            } else {
                $v->send_depot_code = $v->o_send_depot;
                $v->send_depot_name = $v->o_send_name;
            }
            // 查询工单是否参加合并领料单 参加合并领料单需要将合并总数量填入  解决iqc质检补料审核查看计划计划数量  shuaijie.feng 7.4/2019
            $material_rmre = DB::table(config('alias.rmre'))
                ->where([
                    ['work_order_id',$v->work_order_id],
                ])
                ->select('is_merger','material_requisition_id')
                ->first();

            if(!empty($material_rmre)){
                $material = DB::table(config('alias.rmre'))
                    ->where([
                        ['material_requisition_id',$material_rmre->material_requisition_id],
                        ['material_code',$v->material_code],
                    ])
                    ->select('material_id','material_code','material_requisition_id')
                    ->addSelect(DB::raw('SUM(rated_qty) as sum'))
                    ->first();
                if($v->rated_qty == 0 && $material && $material_rmre->is_merger == 1){
                    $v->rated_qty = $material->sum;
                }
            }
            $mate_code = DB::table(config('alias.rwoi'))->select('qty')
                ->where([
                    ['work_order_code',$v->work_order_code],
                    ['material_code',$v->material_code],
                ])
                ->first();
            // 为0时取物料的定额数量  不为0取保存的字段   shuaijie.feng 6.14/2019
            if($v->rated_qty == 0 && $mate_code){
                $v->rated_qty = $mate_code->qty;
            }
            // 如果是合并工单，那么获取总计划数量
            if($push_type==0)//生产补料线边仓
            {
                $demand_qty = $this->getAllRatedQty($v->work_order_code,$v->material_id);
                if($demand_qty!=0) $v->demand_qty = $demand_qty;
                $v->bl_radio = (bcdiv($v->actual_receive_sum_qty,$v->demand_qty,4)*100).'%';
            }
            elseif($push_type)
            {
                $v->bl_radio = (bcdiv($v->demand_qty,$v->rated_qty,4)*100).'%';
            }
        }
        $data = [];
        if($push_type==0)//生产补料线边仓
        {
            foreach ($obj_list as $k=>$v){
                $sum = $k+2;
                $data[$v->work_order_code][] = [
                    /*$v->work_order_code,*/$v->work_order_code,$v->code,$v->sale_order_code,$v->sale_order_project_code,$v->product_order_code,$v->send_depot_code,$v->send_depot_name,
                    $v->demand_depot_code,$v->demand_depot_name,$v->factory_name,$v->factory_code,$v->workbench_name,$v->employee_name,
                    $v->creator_name,
                    $v->ctime, $v->material_code, $v->material_name,
                    '',
                    $v->demand_qty,$v->actual_receive_sum_qty,$v->unit,
                    $v->is_special_stock,$v->reason,$v->qc_reason,"=IF(W$sum=X$sum,\"相同\",\"不相同\")",$v->remark,
                    $v->auditing_operator_name,
                    $v->auditing_time,
                    $v->qc_first_reason,
                    $v->auditing_first_operator_name,
                    $v->auditing_first_time,
                    $v->merge_work_order,
                    $v->bl_radio
                ];
            }
        }
        else
        {
            foreach ($obj_list as $k=>$v){
                $sum = $k+2;
                $cellData[] = [
                    $v->code,$v->sale_order_code,$v->sale_order_project_code,$v->product_order_code,$v->work_order_code,$v->send_depot_code,$v->send_depot_name,
                    $v->demand_depot_code,$v->demand_depot_name,$v->factory_name,$v->factory_code,$v->workbench_name,$v->employee_name,
                    $v->creator_name,
                    $v->ctime, $v->material_code, $v->material_name,
//                $v->material_attribute,
                    '',
                    $v->rated_qty,$v->demand_qty,$v->actual_receive_sum_qty,$v->bl_radio,$v->unit,
                    $v->is_special_stock,$v->reason,$v->qc_reason,"=IF(Y$sum=Z$sum,\"相同\",\"不相同\")",$v->remark,
                    $v->auditing_operator_name,
                    $v->auditing_time,
                    $v->qc_first_reason,
                    $v->auditing_first_operator_name,
                    $v->auditing_first_time
                ];
            }
        }

        $mergeCells = [];
        //$num = 0;
        foreach ($data as $dk=>$dv)
        {
            $cellData = array_merge($cellData,$dv);

        }
        //获取相同的工单数据，合并工单用
        $fileName = '';
        if($push_type==0)
        {
            $fileName = '线边仓补料';
        }
        elseif ($push_type == 1)
        {
            $fileName = 'SAP补料';
        }
        elseif ($push_type == 2)
        {
            $fileName = '车间补料';
        }
        $fileName = $fileName.'_' . $input['start_time'].'至'.$input['end_time'];
        //$fileName = 'Supplementary_' . date('Y-m-d H:i:s',time());

        set_time_limit(0);
        header('Content-Type: application/vnd.ms-excel');
        header('Cache-Control:max-age=0');
        ob_end_clean();//清除缓冲区,避免乱码
        //调用excel组件进行导出
        Excel::create($fileName,function($excel) use ($cellData/*,$mergeCells*/){
            $excel->sheet('first', function($sheet) use ($cellData/*,$mergeCells*/){
                $sheet->rows($cellData);
                $sheet->freezeFirstRow();// 冻结第一行
//                foreach ($mergeCells as $v)
//                {
//                    $sheet->mergeCells('A'.$v[0].':A'.$v[1]);
//                }

            });

        })->export('xlsx');
        exit();
//        $file = $fileName . '.xls';
//        $truePath = config('excel.export.store.path') . '/';
//        if (!is_file($truePath . $file) || !is_readable($truePath . $file)) {
//            TEA(2620, $truePath . $file);
//        }
//        return Storage::url(config('excel.export.store.relative_path')) . $file;
    }

    /**
     * 发料类型 数字转字符串
     *
     * 如：1->ZY01
     *
     * @param int $i
     * @return string
     */
    private function intToType($i)
    {
        $type = 'ZY01';
        if (!is_numeric($i)) {
            return $type;
        }
        switch ($i) {
            case 1:
                $type = 'ZY01';
                break;
            case 2:
                $type = 'ZY02';
                break;
            case 3:
                $type = 'ZY03';
                break;
            case 4:
                $type = 'ZY04';
                break;
            case 5:
                $type = 'ZY05';
                break;
            case 6:
                $type = 'ZY06';
                break;
            case 7:
                $type = 'ZB01';
                break;
            case 8:
                $type = 'ZB03';
                break;
            default:
                $type = 'ZY01';
                break;
        }
        return $type;
    }

    /**
     * 基本单位 转 bom(生产)单位
     *
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
     * bom单位 转 基本单位
     *
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
        //update by shuaijie.feng 取三位小数   需求
        $format_base_qty = floor($base_qty * 1000) / 1000;
        return ['base_qty' => $format_base_qty, 'base_unit_id' => $material_obj->base_unit_id, 'base_unit' => $material_obj->base_unit];
        //return ['base_qty' => ceil_dot($base_qty, 1), 'base_unit_id' => $material_obj->base_unit_id, 'base_unit' => $material_obj->base_unit];
    }

    /**
     * 删除sap领料单成功之后发现错误的物料   shuaijie.feng
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function sapdelete($input)
    {
        if (empty($input['item_id'])) TEA(700,'item_id');
        // 查询总表
        $item_obj = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->where([
                ['rmri.id', '=', $input['item_id']],
                ['rmri.item_is_delete', '<>', '1'],
            ])
            ->first();

        // 检测是否存在子单
        if (empty($item_obj)) TEA('2422');
        // 检测状态是否为完成领料
        if ($item_obj->status !=2 ) TEA('2423','item_id');

        $sendData = $this->getpushsapshow($item_obj->material_requisition_id,$input['item_id']);
        if(!empty($sendData)){
            $resp = Soap::doRequest($sendData, 'INT_MM002200004', '0002');
            if (!isset($resp['RETURNCODE'])) TEA('2454');
            if ($resp['RETURNCODE'] != 0) {
                TEPA($resp['RETURNINFO']);
            }
        }

        // 判断总表状态
        if ($item_obj->status == 2){
            // 检测batch里面是否有数据
            $batch = DB::table(config('alias.rmrib'))
                ->where('item_id', $input['item_id'])
                ->first();
            if (empty($batch)) {
                // 删除 发料子表数据
                DB::table($this->itemTable)->where('id', $input['item_id'])->update(['item_is_delete'=>1]);
            }else{
                TEA('2423','batch');
            }
        }else{
            TEA('2423','status');
        }

        // 获取item 总数
        $item_sum = DB::table(config('alias.rmri'))->where('material_requisition_id',$item_obj->material_requisition_id)->count();
        // 获取item 被删 总数
        $item_delete_sum = DB::table(config('alias.rmri'))
            ->where([
                ['material_requisition_id','=',$item_obj->material_requisition_id],
                ['item_is_delete','=','1']
            ])
            ->count();
        // 判断 总数 与 被删除的 总数是否相同  相同则删除
        if($item_sum == $item_delete_sum){
            $data = ['is_delete'=>1];
            DB::table(config('alias.rmr'))->where('id',$item_obj->id)->update($data);
            return [];
        }
        // 获取item 没有被删 总数
        $item_nodelete_sum = DB::table(config('alias.rmri'))
            ->where([
                ['material_requisition_id','=',$item_obj->material_requisition_id],
                ['item_is_delete','<>','1']
            ])
            ->count();
        // 获取 被发料总数
        $batch_sum = DB::table(config('alias.rmrib'))->where('material_requisition_id',$item_obj->material_requisition_id)->count();
        //  没有被删除的数量 与发料数量相同 则更改为入库状态
        if($item_nodelete_sum == $batch_sum){
            DB::table($this->table)->where('id', $item_obj->material_requisition_id)->update(['status' => 3]);
        }

        // 增加删除日志
        $events = [
            'action'=>'delete',
            'desc'=>'编码为['.$item_obj->code.']的领料单',
        ];
        Trace::save(config('alias.rmr'),$item_obj->material_requisition_id,session('administrator')->admin_id,$events);
        if($item_obj->work_order_id){
            $this->updateWork_picking_status($item_obj->work_order_id,[]);
        }
    }

    /**
     *  获取车间 内容 shuaijie.feng 2019-4.17
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialWorkshop($input)
    {
        if(empty($input['work_order_id']))TEA('700','work_order_id');
        //查询工单领料单上面的物料
        $work_order_item = DB::table(config('alias.rwoi') . ' as a')
            ->leftJoin(config('alias.rm') . ' as b', 'a.material_id', '=', 'b.id')
            ->leftJoin(config('alias.rmc').' as d','d.id','=','b.mfaterial_category_id')
            ->where([
                ['a.work_order_id', '=', $input['work_order_id']],
                ['a.type', '=', 0],
                ['warehouse_management',1],
            ])
            ->select([
                'a.work_order_id',
                'a.material_id',
                'a.material_code',
                'a.bom_commercial',
                'a.qty',
                'a.bom_commercial',
                'b.identity_card_string',
                'b.name',
                'b.material_category_id',
            ])
            ->get();
        //  查询物料线边仓 - 仓库 - 工厂
        foreach ($work_order_item as $k => $v)
        {
            $storage[] = DB::table(config('alias.rsi').' as rsi')
                ->leftJoin(config('alias.rsd').' as rsd','rsd.id','=','rsi.depot_id')
                ->leftJoin(config('alias.rf').' as rf','rf.id','=','rsd.plant_id')
                ->where([
                    ['material_id',$v->material_id],
//                    ['storage_validate_quantity','<>','0']   // 查询库存数据
                ])
                ->select([
                    'rsi.material_id',
                    'rsi.storage_validate_quantity',
                    'rsd.code as depot_code',
                    'rsd.name as depot_name',
                    'rf.code as factory_code',
                    'rf.name as factory_name',
                ])
                ->get();
        }
        // 查询该工单 领料实收
        foreach ($work_order_item as $k=>$v){
            $material[] = DB::table(config('alias.rmr').' as rmr')
                ->leftJoin(config('alias.rmri').' as rmri','rmri.material_requisition_id','=','rmr.id')
                ->leftJoin(config('alias.rmrib').' as rmrib','rmri.id','=','rmrib.item_id')
                ->where([
                    ['rmr.work_order_id',$v->work_order_id],
                    ['rmr.type',1],
                    ['rmr.push_type',2],
                    ['rmr.is_delete',0],
                    ['rmri.material_id',$v->material_id],
                    ['rmri.material_id',$v->material_id],
                ])
                ->select([
                    'rmri.material_id',
                    'rmri.material_code',
                    'rmrib.actual_receive_qty',
                ])
                ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as sum'))
                ->get();
        }
        $tempArr['work_order_item'] = $work_order_item;
        $tempArr['storage'] = $storage;
        return ['materials'=>$tempArr,'material'=>$material];
    }

    /**
     * 按单领料合并打印  shuaijie.feng
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function getBatchprinting($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);

        $material_requsition_id = explode(',',$input['material_requisition_id']);
        $x = DB::table(config('alias.rmre'))
            ->select('is_merger')
            ->whereIn('material_requisition_id',$material_requsition_id)
            ->get()->toArray();
        if(empty($x) || $x[0]->is_merger == 2) {
            for ($i = 0; $i < count($material_requsition_id); $i++) {
                $objs = DB::table($this->table . ' as rmr')
                    ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                    ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
                    ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
                    ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                    ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
                    ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
                    ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
                    ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
                    ->leftJoin(config('alias.rsd') . ' as rsd_i', 'rsd_i.id', '=', 'rmri.depot_id')
                    ->leftJoin('ruis_rbac_admin' . ' as rra', 'rra.id', '=', 'rmr.creator_id') // 关联admin 查询创建人
                    ->select([
                        'rmr.id as id',
                        'rmr.code as code',
                        'rmr.type',
                        'rmr.push_type',
                        'rmr.ctime',
                        'rmr.mtime',
                        'rmr.time',
                        'rmr.from',
                        'rmr.status',
                        'rmr.sale_order_code',
                        'rmr.sale_order_project_code',
                        'rmr.product_order_id',
                        'rmr.product_order_code',
                        'rmr.send_depot',
                        'rmr.is_depot_picking',
                        'rmr.plan_start_time',
                        'rmr.is_merger_picking',
                        'rmr.dispatch_time',
                        'rmr.bench_no',
                        're.id as employee_id',
                        're.name as employee_name',
                        'rf.id as factory_id',
                        'rf.name as factory_name',
                        'rf.code as factory_code',
                        'rwb.id as workbench_id',
                        'rwb.code as workbench_code',
                        'rwb.name as bench_no',
                        'rwo.number as work_order_code',
                        'rwo.plan_start_time as wo_plan_start_time',
                        'rsd.id as line_depot_id',
                        'rsd.code as line_depot_code',
                        'rsd.name as line_depot_name',
                        'rm.id as material_id',
                        'rm.item_no as material_code',
                        'rm.name as material_name',
                        'rmri.id as item_id',
                        'rmri.line_project_code',
                        'rmri.demand_qty',
                        'rmri.rated_qty',
                        'rmri.remark',
                        'rmri.reason',
                        'ruu_d.id as demand_unit_id',
                        'ruu_d.commercial as demand_unit',
                        'rmri.is_special_stock',
                        'rmri.custom_inspur_sale_order_code',
                        'rmri.inspur_material_code',
                        'rsd_i.id as depot_id',
                        'rsd_i.code as depot_code',
                        'rsd_i.name as depot_name',
                        'rmr.sale_order_code as sales_order_code',
                        'rmr.sale_order_project_code as sales_order_project_code',
                        'rwo.id as work_order_id', //工单id
                        'rmr.creator_id', // 创建人id
                        'rra.name as creator_name', // 创建人名称
                        'rra.cn_name as creator_cn_name', // 创建人名称
                    ])
                    ->where([
                        ['rmr.id', '=', $material_requsition_id[$i]],
                        ['rmr.is_delete', '=', 0],
                    ])
                    ->where(function ($query) {
                        $query->where(function ($q) {
                            $q->where([
                                ['rmr.is_depot_picking', '=', 1]
                            ])
                                ->orWhere([
                                    ['rmr.is_depot_picking', '=', 0],
                                    ['rwo.is_delete', '=', 0],
                                    ['rwo.on_off', '=', 1],
                                ]);
                        })
                            ->orWhere(function ($qu) {
                                $qu->where([
                                    ['rmr.is_merger_picking', '=', 1]
                                ])
                                    ->orWhere([
                                        ['rmr.is_merger_picking', '=', 0],
                                        ['rwo.is_delete', '=', 0],
                                        ['rwo.on_off', '=', 1],
                                    ]);
                            });

                    })
                    ->get();
                if (empty($objs) || empty(obj2array($objs))) TEA('2421');

                // 根据物料的分类查询 查询参与转厂的物料，获取到物料的之前的领料地点
                foreach ($objs as $k=>&$v)
                {
                    // 根据物料分类查询到物料组
                    $code_res = DB::table('ruis_material'.' as rm')
                        ->leftJoin('ruis_material_category'.' as rmc','rm.material_category_id','=','rmc.id')
                        ->select('code')
                        ->where('item_no',$v->material_code)
                        ->first();
                    // 查询生产订单
                    $product_res = DB::table('ruis_production_order')
                        ->where([
                            ['id',$v->product_order_id],
                            ['is_delete',0],
                            ['on_off',1],
                        ])
                        ->select('WERKS')
                        ->first();
                    if(empty($product_res)) continue;
                    // 根据物料组查询到该物料的领料地点
                    $code_res_arr = DB::table('ruis_materials_warehouse')
                        ->select('storage_code')
                        ->where([
                            ['code',$code_res->code],
//                            ['factory_code',$v->factory_code],
                            ['factory_code',$product_res->WERKS]
                        ])
                        ->first();
                    // 为空 则跳过
                    if(empty($code_res_arr)) continue;
                    // 如果 两者不同则 追加
                    if($v->send_depot != $code_res_arr->storage_code)
                    {
                        $v->send_depot .= '('.$code_res_arr->storage_code.')';
                    }
                }
                /**
                 * 获取批次表
                 */
                $batch_objs = DB::table(config('alias.rmrib') . ' as rmrib')
                    ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmrib.bom_unit_id')
                    ->select([
                        'rmrib.id as batch_id',
                        'rmrib.material_requisition_id',
                        'rmrib.item_id',
                        'rmrib.order',
                        'rmrib.batch',
                        'rmrib.actual_send_qty',
                        'rmrib.base_unit',
                        'rmrib.actual_receive_qty',
                        'rmrib.bom_unit_id',
                        'ruu.commercial as bom_unit',
                    ])
                    ->where('rmrib.material_requisition_id', '=', $material_requsition_id[$i])
                    ->get();
                $batchArr = [];
                foreach ($batch_objs as $batch) {
                    if (isset($batch->item_id)) {
                        $batchArr[$batch->item_id][] = $batch;
                    }
                }

                $data = [];
                $sales_order_codes = [];
                $sales_order_project_codes = [];
                foreach ($objs as $key => $value)
                {
                    if (empty($data)) {
                        $data['id'] = $value->id;
                        $data['code'] = $value->code;
                        $data['type'] = $value->type;
                        $data['line_depot_id'] = $value->line_depot_id;
                        $data['line_depot_name'] = $value->line_depot_name;
                        $data['send_depot'] = $value->send_depot;
                        $data['work_order_code'] = $value->work_order_code;
                        $data['bench_no'] = $value->bench_no;
                        $data['workbench_code'] = $value->workbench_code;
                        $data['ctime'] = date('Y-m-d H:i:s', $value->ctime);
                        $data['time'] = date('Y-m-d H:i:s', $value->time);
                        $data['dispatch_time'] = !empty($value->dispatch_time) ? date('Y-m-d H:i:s', $value->dispatch_time) : 0;
                        $data['employee_name'] = $value->type == 7?(empty($value->creator_cn_name)?$value->creator_name:$value->creator_cn_name):$value->employee_name;
                        $data['factory_name'] = $value->factory_name;
                        $data['factory_code'] = $value->factory_code;
                        $data['factory_id'] = $value->factory_id;
                        $data['status'] = $value->status;
                        $data['push_type'] = $value->push_type;
                        $data['sales_order_code'] = $value->sale_order_code;
                        $data['sales_order_project_code'] = $value->sale_order_project_code;
                        $data['product_order_id'] = $value->product_order_id;
                        $data['product_order_code'] = $value->product_order_code;
                        $data['bench_no'] = $value->bench_no;
                        $plan_start_time = $value->is_depot_picking == 1 ? $value->plan_start_time : $value->wo_plan_start_time;
                        $data['plan_start_time'] = empty($plan_start_time) ? '' : date('Y-m-d H:i:s', $plan_start_time);
                    }
                    // 查询浪潮编码
                    $lc_no = DB::table(config('alias.rtnomc'))->select('old_code')->where('new_code', $value->material_code)->first();
                    if (!empty($value->item_id)) {
                        if (!in_array($value->sales_order_code, $sales_order_codes)) $sales_order_codes[] = $value->sales_order_code;
                        if (!in_array($value->sales_order_project_code, $sales_order_project_codes)) $sales_order_codes[] = $value->sales_order_project_code;
                        $temp = [
                            'item_id' => $value->item_id,
                            'line_project_code' => $value->line_project_code,
                            'material_id' => $value->material_id,
                            'material_code' => $value->material_code,
                            'material_name' => $value->material_name,
                            'rated_qty' => $value->rated_qty,
                            'demand_qty' => $value->demand_qty,
                            'demand_unit' => $value->demand_unit,
                            'depot_id' => get_value_or_default($value, 'depot_id', 0),
                            'depot_name' => get_value_or_default($value, 'depot_name', ''),
                            'depot_code' => get_value_or_default($value, 'depot_code', ''),
                            'special_stock' => $value->is_special_stock,
                            'remark' => $value->remark,
                            'reason' => $this->getReason(explode(',', $value->reason)),
                            'custom_inspur_sale_order_code' => $value->custom_inspur_sale_order_code,
                            'old_material_code' => !empty($lc_no) ? $lc_no->old_code : '',  // 浪潮编码
                            'batches' => isset($batchArr[$value->item_id]) ? $batchArr[$value->item_id] : []
                        ];

                        //将单位转为sap的单位
                        $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->demand_unit_id, $value->demand_qty);
                        if ($baseUnitArr['base_qty'] == -1) {
                            $temp['sap_demand_qty'] = '';
                            $temp['sap_demand_unit'] = '';
                        } else {
                            $temp['sap_demand_qty'] = $baseUnitArr['base_qty'];
                            $temp['sap_demand_unit'] = $baseUnitArr['base_unit'];
                        }
                        /**
                         * 单位转换 这个是转换sap另一个单位 针对千克转换米
                         *  不是千克转换米，取SAP转换关系
                         */
                        $bom = $this->RelationalTransformation($value->material_id, $value->material_code, $value->demand_qty, $value->demand_unit);
                        if ($bom == 0) {
                            $temp['lc_demand_qty'] = '';
                            $temp['lc_demand_unit'] = '';
                        } else {
                            $temp['lc_demand_qty'] = $bom['sum'];
                            $temp['lc_demand_unit'] = $bom['lc_unit'];
                        }
                        $data['materials'][] = $temp;
                    }
                }
                $array = DB::table(config('alias.rmbp'))
                    ->where('material_requisition_id', $material_requsition_id[$i])
                    ->first();

                if (empty($array)) {
                    $arr[$i]['material_requisition_id'] = $material_requsition_id[$i];// 领料单id
                    $arr[$i]['status'] = 1; // 打印状态
                    $arr[$i]['count'] = 1; // 打印次数
                    $arr[$i]['ctime'] = time(); // 打印时间
                    DB::table(config('alias.rmbp'))->insert($arr);
                } else {
                    DB::table(config('alias.rmbp'))->where('material_requisition_id', $array->material_requisition_id)->update(['count' => $array->count + 1]);
                }
                $all_material = DB::table(config('alias.rwoi').' as rwoi')
                    ->leftJoin(config('alias.rm').' as rm','rm.item_no','=','rwoi.material_code')
                    ->select([
                        'rwoi.material_id', // 物料id
                        'rwoi.material_code', // 物料id
                        'rm.name', // 物料名称
                    ])
                    ->where([
                        ['type', '1'],
                        ['work_order_id',$value->work_order_id]
                    ])->get();
                $producename = [];
                foreach ($all_material as $k=>$v){
                    $producename[] = $v->name;
                }
                $data['producename'] = [];
                $data['producename']  = implode('/-/',$producename);

                $rmr = DB::table($this->table . ' as rmr')
                    ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rmr.creator_id')
                    ->select([
                        'rmr.id',
                        'rrad.id as admin_id',
                        'rrad.cn_name as cn_name',
                        'rrad.name as creator_name'
                    ])
                    ->where('rmr.id',$data['id'])->first();
                $data['cn_name'] = $rmr->cn_name;
                $data['creator_name'] = $rmr->creator_name;
                $data['admin_id'] = $rmr->admin_id;
                $stmt[$i] = $data;
            }
            return $stmt;
        }else {
            for ($i = 0; $i < count($material_requsition_id); $i++) {
                //1.先查找出领料单抬头
                $rmr_info = DB::table(config('alias.rmr') . ' as rmr')
                    ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', 'rmr.line_depot_id')
                    ->leftJoin(config('alias.re') . ' as re', 're.id', 'rmr.employee_id')
                    ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', 'rmr.factory_id')
                    ->select(
                        'rmr.id',
                        'rmr.code',
                        'rmr.type',
                        'rmr.line_depot_id',
                        'rsd.name as line_depot_name',
                        'rmr.send_depot',
                        'rmr.bench_no',
                        'rmr.ctime',
                        'rmr.dispatch_time',
                        're.name as employee_name',
                        'rf.name as factory_name',
                        'rf.code as factory_code',
                        'rmr.status',
                        'rmr.push_type'
                    )
                    ->where('rmr.id', $material_requsition_id[$i])
                    ->first();
                if (empty($rmr_info)) TEA(404);
                $rmr_info->ctime = date('Y-m-d H:i:s', $rmr_info->ctime);
                $rmr_info->dispatch_time = date('Y-m-d H:i:s', $rmr_info->dispatch_time);
                //2.查找领料单子项
                $rmri_list = DB::table(config('alias.rmri') . ' as rmri')
                    ->leftJoin(config('alias.ruu') . ' as ruu_bom', 'ruu_bom.id', 'rmri.demand_unit_id')
                    ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', 'rmri.material_id')
                    ->leftJoin(config('alias.ruu') . ' as ruu_base', 'ruu_base.id', 'rm.unit_id')
                    ->select(
                        'rmri.id as item_id',
                        'rmri.line_project_code',
                        'rmri.material_id',
                        'rmri.material_code',
                        'rmri.material_name',
                        'rmri.rated_qty',
                        'rmri.demand_qty',
                        'ruu_bom.commercial as demand_unit',
                        'ruu_bom.id as demand_unit_id',
                        'ruu_base.id as base_unit_id',
                        'ruu_base.commercial as base_unit',
                        'rmri.is_special_stock as special_stock',
                        'rmri.remark',
                        'rmri.custom_inspur_sale_order_code',
                        'rmri.inspur_material_code as old_material_code',
                        'rmri.sales_order_code',
                        'rmri.sales_order_project_code'
                    )
                    ->where('rmri.material_requisition_id', $material_requsition_id[$i])
                    ->get();
                //3.收集物料id，用来查询眼转换的浪潮单位
                $material_ids = [];
                foreach ($rmri_list as $k => $v) {
                    $material_ids[] = $v->material_id;
                }
                //4.查找批次信息
                $batch_objs = DB::table(config('alias.rmrib') . ' as rmrib')
                    ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmrib.bom_unit_id')
                    ->select([
                        'rmrib.id as batch_id',
                        'rmrib.material_requisition_id',
                        'rmrib.item_id',
                        'rmrib.order',
                        'rmrib.batch',
                        'rmrib.actual_send_qty',
                        'rmrib.actual_receive_qty',
                        'rmrib.bom_unit_id',
                        'ruu.commercial as bom_unit',
                    ])
                    ->where('rmrib.material_requisition_id', '=', $material_requsition_id[$i])
                    ->get();
                $batchArr = [];
                foreach ($batch_objs as $k => $v) {
                    if (isset($batchArr[$v->item_id])) {
                        $batchArr[$v->item_id][] = $v;
                    } else {
                        $batchArr[$v->item_id] = [$v];
                    }
                }
                //5.查询工单领料信息
                $rmre_list = DB::table(config('alias.rmre') . ' as rmre')
                    ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', 'rmre.work_order_id')
                    ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', 'rwo.production_order_id')
                    ->select(
                        'rmre.material_id',
                        'rmre.special_stock',
                        'rwo.number as work_order_code',
                        'rpo.number as product_order_code',
                        'rpo.sales_order_code',
                        'rpo.sales_order_project_code'
                    )
                    ->where('rmre.material_requisition_id', $material_requsition_id[$i])
                    ->get();
                $ref_rmre_list = [];
                $sales_order_codes = [];
                $sales_order_project_codes = [];
                $product_order_codes = [];
                $work_order_codes = [];
                foreach ($rmre_list as $k => $v) {
                    if (!empty($v->special_stock)) {
                        if (isset($ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code])) {
                            $ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code][] = $v;
                        } else {
                            $ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code] = [$v];
                        }
                    } else {
                        if (isset($ref_rmre_list[$v->material_id])) {
                            $ref_rmre_list[$v->material_id][] = $v;
                        } else {
                            $ref_rmre_list[$v->material_id] = [$v];
                        }
                    }
                    if (!in_array($v->sales_order_code, $sales_order_codes)) $sales_order_codes[] = $v->sales_order_code;
                    if (!in_array($v->sales_order_project_code, $sales_order_project_codes)) $sales_order_project_codes[] = $v->sales_order_project_code;
                    if (!in_array($v->work_order_code, $work_order_codes)) $work_order_codes[] = $v->work_order_code;
                    if (!in_array($v->product_order_code, $product_order_codes)) $product_order_codes[] = $v->product_order_code;
                }
                //6.组合子项信息
                $unitDao = new Units();
                foreach ($rmri_list as $k => &$v) {
                    if (empty($v->special_stock)) {
                        $v->wo_po_so = !isset($ref_rmre_list[$v->material_id]) ? [] : $ref_rmre_list[$v->material_id];
                    } else {
                        $v->wo_po_so = !isset($ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code]) ? [] : $ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code];
                    }
                    //转换为sap单位，即基本单位
                    $base_qty = $unitDao->getExchangeUnitValueById($v->demand_unit_id, $v->base_unit_id, $v->demand_qty, $v->material_id);
                    if (empty($base_qty) || $base_qty == -1) {
                        $v->sap_demand_qty = '';
                        $v->sap_demand_unit = '';
                    } else {
                        $v->sap_demand_qty = $base_qty;
                        $v->sap_demand_unit = $v->base_unit;
                    }
                    /**
                     * 单位转换 这个是转换sap另一个单位 针对千克转换米
                     *  不是千克转换米，取SAP转换关系
                     * 修复打印转换关系无效bug  by xia
                     */
//                    $base_change_list = DB::table(config('alias.rmx'))->select('material_id','lc_no','lc_scale','sap_scale','lc_unit')->whereIn('material_id',$material_ids)->get();
//                    $ref_base_change_list = [];
//                    foreach ($base_change_list as $k=>$val){
//                        $ref_base_change_list[$val->material_id.'-'.$val->lc_no] = $val;
//                    }
//                    if(!empty($base_qty) && $base_qty != -1 && isset($ref_base_change_list[$v->material_id.'-'.$v->old_material_code])){
//                        $v->lc_demand_qty = ceil($base_qty * ($ref_base_change_list[$v->material_id.'-'.$v->old_material_code]->lc_scale / $ref_base_change_list[$v->material_id.'-'.$v->old_material_code]->sap_scale) * 1000) / 1000;
//                        $v->lc_demand_unit = $ref_base_change_list[$v->material_id.'-'.$v->old_material_code]->lc_unit;
//                    }
//                    else
//                    {
//                        $v->lc_demand_qty = '';
//                        $v->lc_demand_unit = '';
//                    }
                   
                     $bom = $this->RelationalTransformation($v->material_id, $v->material_code, $v->demand_qty, $v->demand_unit);
                     if ($bom == 0) {
                         $v->lc_demand_qty = '';
                         $v->lc_demand_unit = '';
                     } else {
                         $v->lc_demand_qty = $bom['sum'];
                         $v->lc_demand_unit = $bom['lc_unit'];
                     }

                    $v->batches = isset($batchArr[$v->item_id]) ? $batchArr[$v->item_id] : [];
                }
                if (count($sales_order_codes) == 1) {
                    $rmr_info->sales_order_code = $sales_order_codes[0];
                } else {
                    $rmr_info->sales_order_code = '';
                }
                if (count($sales_order_project_codes) == 1) {
                    $rmr_info->sales_order_project_code = $sales_order_project_codes[0];
                } else {
                    $rmr_info->sales_order_project_code = '';
                }
                if (count($product_order_codes) == 1) {
                    $rmr_info->product_order_code = $product_order_codes[0];
                } else {
                    $rmr_info->product_order_code = '';
                }
                if (count($work_order_codes) == 1) {
                    $rmr_info->work_order_code = $work_order_codes[0];
                } else {
                    $rmr_info->work_order_code = '';
                }
                $rmr_info->materials = $rmri_list;
                $rmr = DB::table($this->table . ' as rmr')
                    ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rmr.creator_id')
                    ->select([
                        'rmr.id',
                        'rrad.id as admin_id',
                        'rrad.cn_name as cn_name',
                        'rrad.name as creator_name'
                    ])
                    ->where('rmr.id',$rmr_info->id)->first();
                $stmt[$i] = $rmr_info;
                $stmt[$i]->cn_name = $rmr->cn_name;
                $stmt[$i]->creator_name = $rmr->creator_name;
                $array = DB::table(config('alias.rmbp'))
                    ->where('material_requisition_id', $rmr_info->id)
                    ->first();
                if (empty($array)) {
                    $arr[$i]['material_requisition_id'] = $rmr_info->id;// 领料单id
                    $arr[$i]['status'] = 1; // 打印状态
                    $arr[$i]['count'] = 1; // 打印次数
                    $arr[$i]['ctime'] = time(); // 打印时间
                    DB::table(config('alias.rmbp'))->insert($arr);
                } else {
                    DB::table(config('alias.rmbp'))->where('material_requisition_id', $array->material_requisition_id)->update(['count' => $array->count + 1]);
                }
            }
            return $stmt;
        }
    }

    /**
     * 针对打印关系转换
     * @param $material_id
     * @param $material_code
     * @param $qty
     * @param $base_unit
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function  RelationalTransformation($material_id,$material_code,$qty,$base_unit,$type = 1)
    {
        // 查询物料所有的转换单位
        $arr = DB::table(config('alias.ramm'))
            ->select([
                'UMREZ',
                'UMREN',
                'MEINH',
            ])
            ->where([
                ['MATNR', $material_code],
            ])
            ->get();
        if(count($arr)==0){
            return count($arr);
        }
        if(count($arr) >= 2)
        {
            $material_category_code = DB::table('ruis_material'.' as rm')
                ->leftJoin('ruis_material_category'.' as rmc','rm.material_category_id','=','rmc.id')
                ->select('rmc.code')
                ->where('rm.item_no',$material_code)->first();
            if($material_category_code && substr($material_category_code->code, 0,4) == '3002'){
                $stmt = DB::table(config('alias.ramm'))
                    ->select([
                        'UMREZ',
                        'UMREN',
                        'MEINH',
                    ])
                    ->where([
                        ['MATNR', $material_code],
                        ['MEINH','=','M']
                    ])
                    ->first();
            }else{
                $stmt = DB::table(config('alias.ramm'))
                    ->select([
                        'UMREZ',
                        'UMREN',
                        'MEINH',
                    ])
                    ->where([
                        ['MATNR', $material_code],
                        ['MEINH','<>',$base_unit],
                    ])
                    ->first();
            }
            if($base_unit== 'M')
            {
                $UMREZ = DB::table(config('alias.ramm'))->where([['MATNR', $material_code], ['MEINH','=','KG']])->first();
                $UMREN = DB::table(config('alias.ramm'))->where([['MATNR', $material_code], ['MEINH','<>','KG']])->first();
                if(!$UMREZ) $UMREZ = $UMREN;
                $sum = $type == 1 ?ceil_dot($qty * (($UMREN->UMREZ/$UMREN->UMREN)/($UMREZ->UMREZ/$UMREZ->UMREN)),0) : sprintf("%.3f",substr(sprintf("%.4f", $qty * ($UMREN->UMREZ/$UMREN->UMREN)/($UMREZ->UMREZ/$UMREZ->UMREN)), 0, -1));
            }
            else if($base_unit == 'KG')
            {
                $UMREZ = DB::table(config('alias.ramm'))->where([['MATNR', $material_code], ['MEINH','=','KG']])->first();
                $UMREN = DB::table(config('alias.ramm'))->where([['MATNR', $material_code], ['MEINH','<>','KG']])->first();
                if(!$UMREN) $UMREN = $UMREZ;
                $sum = $type == 1 ?ceil_dot($qty * (($UMREZ->UMREZ/$UMREZ->UMREN)/($UMREN->UMREZ/$UMREN->UMREN)),0) : sprintf("%.3f",substr(sprintf("%.4f", $qty * ($UMREZ->UMREZ/$UMREZ->UMREN)/($UMREN->UMREZ/$UMREN->UMREN)), 0, -1));
            }else{
                $UMREZ = DB::table(config('alias.ramm'))->where([['MATNR', $material_code], ['MEINH','=',$base_unit]])->first();
                $UMREN = DB::table(config('alias.ramm'))->where([['MATNR', $material_code], ['MEINH','<>',$base_unit]])->first();
                if(!$UMREN) $UMREN = $UMREZ;
                $sum = $type == 1 ?ceil_dot($qty * (($UMREZ->UMREZ/$UMREZ->UMREN)/($UMREN->UMREZ/$UMREN->UMREN)),0) : sprintf("%.3f",substr(sprintf("%.4f", $qty * ($UMREZ->UMREZ/$UMREZ->UMREN)/($UMREN->UMREZ/$UMREN->UMREN)), 0, -1));
            }
            $base_unit = empty($stmt)?$base_unit:$stmt->MEINH;
            return ['sum'=>$sum,'lc_unit'=>$base_unit];
        }else{
           $sum = $type == 1 ? ceil_dot($qty * ($arr[0]->UMREZ/$arr[0]->UMREN),0) : sprintf("%.3f",substr(sprintf("%.4f",$qty * ($arr[0]->UMREZ/$arr[0]->UMREN)), 0, -1));
           $base_unit = $arr[0]->MEINH;
            return ['sum'=>$sum,'lc_unit'=>$base_unit];
        }
    }

    /**
     * 车间退料更改状态 shuaijie.feng
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function RetreatChangestats($input)
    {
        $material_requsition_id = explode(',',$input['material_requisition_id']);
        for($i=0;$i<count($material_requsition_id);$i++)
        {
            $arr = [];
            // 查询领料单
            $material = DB::table(config('alias.rmr'))
                ->select([
                    'id as material_requisition_id',
                    'type',
                    'status',
                ])
                ->where('id',$material_requsition_id[$i])
                ->first();
            // 重新写入数据
            $arr['material_requisition_id'] = $material->material_requisition_id;
            $arr['status'] = $material->status;
            $arr['type'] = $material->type;
            // 查询领料单batch
            $batch = DB::table('ruis_material_requisition_item_batch')
                ->select([
                    'id as batch_id',
                    'actual_send_qty as actual_receive_qty'
                ])
                ->where('material_requisition_id',$material->material_requisition_id)
                ->get()->toArray();
            // 重新写入数据
            foreach ($batch as $k=>$v){
                $arr['batches'][$k]['batch_id'] = $v->batch_id;
                $arr['batches'][$k]['actual_receive_qty'] = $v->actual_receive_qty;
            }
            // 开启事务
            try {
                    DB::connection()->beginTransaction();
                    $this->workShopConfirmAndUpdate($arr);
                    $this->auditing($arr);     //入库
                } catch (\ApiException $e) {
                    DB::connection()->rollBack();
                    TEA($e->getCode(), $e->getMessage());
                }
            //判断是否需要发送给SAP,如果为空，就不需要发送。
//            $sendData = $this->getWorkShopSyncSapData($input);
//            if (!empty($sendData)) {
//                    $resp = Soap::doRequest($sendData, 'INT_MM002200003', '0002');
//                    if (!isset($resp['RETURNCODE']) || !isset($resp['RETURNINFO'])) {
//                            DB::connection()->rollBack();
//                            TEA('2454');
//                        }
//                if ($resp['RETURNCODE'] != 0) {
//                            DB::connection()->rollBack();
//                            TEPA($resp['RETURNINFO']);
//                        }
//            }
            // 执行成功，就提交.
            DB::connection()->commit();
        }
    }

    /**
     *  删除退料单某行向
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function DeleteRetreatRowitem($input)
    {
        if (empty($input['item_id'])) TEA(700,'item_id');
        // 查询总表
        $item_obj = DB::table($this->table . ' as rmr')
            ->leftJoin($this->itemTable . ' as rmri', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->select([
                'rmr.id',
                'rmr.code',
                'rmr.status',
                'rmr.work_order_id',
                'rmri.material_requisition_id',
                'rmri.material_id',
                'rmri.material_code',
                'rmr.code',
            ])
            ->where([
                ['rmri.id', '=', $input['item_id']],
            ])
            ->first();

        // 检测是否存在子单
        if (empty($item_obj)) TEA('2422');
        // 检测状态是否为完成领料
        if ($item_obj->status !=2 ) TEA('2423','item_id');

        // 判断总表状态
        if ($item_obj->status == 2){
            // 检测batch里面是否有数据
            $batch = DB::table(config('alias.rmrib'))
                ->where([
                    ['item_id', $input['item_id']],
                    ['actual_receive_qty','>',0]
                ])
                ->first();
            if (empty($batch->actual_receive_qty))
            {
                try {
                    DB::connection()->beginTransaction();

                    $sendData = $this->getpushsapshow($item_obj->material_requisition_id,$input['item_id']);
                    if(!empty($sendData)){
                        $resp = Soap::doRequest($sendData, 'INT_MM002200004', '0002');
                        if (!isset($resp['RETURNCODE'])) TEA('2454');
                        if ($resp['RETURNCODE'] != 0) {
                            TEPA($resp['RETURNINFO']);
                        }
                    }
                    // 删除 退料子表数据
                    DB::table($this->itemTable)->where('id', $input['item_id'])->update(['item_is_delete'=>1]);
                    // 删除批次表
                    DB::table('ruis_material_requisition_item_batch')->where('item_id', $input['item_id'])->delete();

                    // 增加删除日志
                    $events = [
                        'action'=>'delete',
                        'desc'=>'编码为['.$item_obj->code.']的领料单',
                    ];
                    Trace::save(config('alias.rmr'),$item_obj->material_requisition_id,session('administrator')->admin_id,$events);
                } catch (\ApiException $e) {
                    DB::connection()->rollBack();
                    TEA($e->getCode(), $e->getMessage());
                }
                DB::connection()->commit();
            }else{
                TEA('2423','batch');
            }
        }else{
            TEA('2423','status');
        }

        // 获取 item 数据
        $arr = DB::table($this->itemTable)
            ->where([
                ['material_requisition_id','=',$item_obj->id],
                ['item_is_delete','=','0'],
            ])
            ->count();
        // 获取 batch表中实际退的数量大于0的数据
        $stmt = DB::table(config('alias.rmrib'))
            ->where('material_requisition_id',$item_obj->material_requisition_id)
            ->where('actual_receive_qty','>',0)
            ->count();
        // 如果 item 表内为空，则将退料单标记删除
        if(empty($arr)){
            $data = ['is_delete'=>1];
            DB::table(config('alias.rmr'))->where('id',$item_obj->id)->update($data);
            // 增加删除日志
            $events = [
                'action'=>'delete',
                'desc'=>'编码为['.$item_obj->code.']的领料单',
            ];
            Trace::save(config('alias.rmr'),$item_obj->material_requisition_id,session('administrator')->admin_id,$events);
            return [];
        }
        //  判断 item 里面是否与 batch 个数相同，相同则修改状态进行出库
        if ($arr == $stmt){
            try {
                $auditingParam[$this->apiPrimaryKey] = $item_obj->id;
                $this->auditing($auditingParam);        // SAP退料 出库  状态：2->3
                $this->updateStatus($item_obj->id, 4);    // 实退数，退料完成 状态 3->4
            } catch (\ApiException $e) {
                DB::connection()->rollBack();
                TEA($e->getCode(), $e->getMessage());
            }
            DB::connection()->commit();
        }
    }

    /**
     * 批量获取批次信息
     *
     * @param $input 传入一组material_requisition_id
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getRequisionItemBath($input)
    {
        //根据material_requisition_id获取批次ID和actual_send_qty
        $rmrib = DB::table(config('alias.rmrib'))
            ->whereIn('material_requisition_id',$input)
            ->select(['material_requisition_id','actual_send_qty','id'])
            ->get();
        //var_dump(json_encode($rmrib));exit;
        if($rmrib)
        {
            //1.初次处理数据
            $un_storage_arr = [];//未入库数据
            $batch_auditing_arr = [];//批量入库数据
            foreach ($rmrib as $v)
            {
                $batch_auditing_arr[$v->material_requisition_id][] = [
                    'batch_id' => (string)$v->id,
                    'actual_receive_qty' => $v->actual_send_qty //批量入库数据默认实发数量 actual_send_qty = 实收数量actual_receive_qty
                ];
            }

            //2.判断数据是否已经入库
            $un_storage_arr = array_diff($input,array_keys($batch_auditing_arr));
            if(!empty($un_storage_arr) || empty($batch_auditing_arr))
            {
                TEPA('部分单子已入库，请重新选择');
            }

            //3.二次处理数据
            foreach ($batch_auditing_arr as $k=>$v)
            {
                $batches = $v;
                unset($batch_auditing_arr[$k]);
                $batch_auditing_arr[$k]['material_requisition_id'] = (string)$k;
                $batch_auditing_arr[$k]['batches'] = $batches;
            }
        }

        return $batch_auditing_arr;
    }

    /**
     *  按单领料删除未发料行项 shuaijie.feng 8.22/2019
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function DeleteRetreatRow($input)
    {
        // 查询总表
        $item_obj = DB::table($this->table . ' as rmr')
            ->leftJoin($this->itemTable . ' as rmri', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->select([
                'rmr.id',
                'rmr.code',
                'rmr.status',
                'rmr.work_order_id',
                'rmri.material_requisition_id',
                'rmri.id as item_id',
                'rmri.material_id',
                'rmri.material_code',
                'rmri.item_is_delete',
            ])
            ->where([
                ['rmr.id', '=', $input['id']],
                ['rmr.status', '=', 2],
                ['rmri.item_is_delete', '<>', '1'],// 增加 行项是否删除  1:被删除   0:未删除
            ])
            ->get()->toArray();
        // 检测是否存在子单
        if (empty($item_obj)) TEPA('当前状态不允许删除！！！！！！');
        $item_count = DB::table(config('alias.rmri'))->where('material_requisition_id',$input['id'])->count();
        $ids = [];
        $material_id = [];
        foreach ($item_obj as $key=>$val){
            // 检测batch里面是否有数据
            $batch = DB::table(config('alias.rmrib'))->where([['item_id',$val->item_id], ['material_requisition_id',$val->id],])->first();
            if(empty($batch)){
                $ids[] = $val->item_id;
                $material_id[] = $val->material_id;
            }
        }
        $sendData = $this->getpushsapshow($input['id'],$ids);
        if(!empty($sendData)){
            $resp = Soap::doRequest($sendData, 'INT_MM002200004', '0002');
            if (!isset($resp['RETURNCODE'])) TEA('2454');
            if ($resp['RETURNCODE'] != 0) {
                TEPA($resp['RETURNINFO']);
            }
        }

        if(!empty($ids)){
            try {
                DB::connection()->beginTransaction();
                // 如果删除的值数量与工单数量相同 则直接更改为删除状态
                if($item_count == count($ids)){
                    DB::table(config('alias.rmr'))->where('id',$input['id'])->update(['is_delete'=>1]);
                    DB::table($this->itemTable)->whereIn('id', $ids)->update(['item_is_delete'=>1]);
//                    DB::table(config('alias.rmre'))->where('material_requisition_id',$input['id'])->whereIn('material_id',$material_id)->delete();
                }else{
                    // 删除 退料子表数据
                    DB::table($this->itemTable)->whereIn('id', $ids)->update(['item_is_delete'=>1]);
                    // 删除
//                    DB::table(config('alias.rmre'))->where('material_requisition_id',$input['id'])->whereIn('material_id',$material_id)->delete();
                    $item_nodelete_sum = DB::table(config('alias.rmri'))
                        ->where([
                            ['material_requisition_id','=',$input['id']],
                            ['item_is_delete','<>','1']
                        ])
                        ->count();
                    if($item_nodelete_sum >0){
                        // 并更改状态为3
                        DB::table(config('alias.rmr'))->where('id',$input['id'])->update(['status'=>3]);
                    }
                }
            } catch (\ApiException $e) {
                DB::connection()->rollBack();
                TEA($e->getCode(), $e->getMessage());
            }
            DB::connection()->commit();
        }
        // 增加删除日志
        $events = [
            'action'=>'delete',
            'desc'=>'编码为['.$item_obj[0]->code.']的领料单',
        ];
        Trace::save(config('alias.rmr'),$input['id'],session('administrator')->admin_id,$events);
        if($item_obj[0]->work_order_id){
            $this->updateWork_picking_status($item_obj[0]->work_order_id,[]);
        }
    }

    /**
     *  车间领料获取相关信息 shuaijie.feng 8.26/2019
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getShopPackingInfo($input)
    {
        if (empty($input['work_order_id'])) TEA(700, 'work_order_id');

        $is_first = 1;
        $is_unfinished = 0;

        //判断工单是否向车间领料过
        $obj = DB::table($this->table.' as rmr')
            ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
            ->where([
                ['rmre.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 2],
            ])
            ->count();
        // 如果存在，则不是第一次领料
        if ($obj) {
            //  如果存在领料记录，查询是否完成额定数量 shuaijie.feng
            $stmt = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.is_delete', '=', 0],
                    ['rmr.push_type', '=', 2],
                ])
                ->select('rmre.rated_qty')
                ->addSelect(DB::raw('SUM(rmre.qty) as sum'))
                ->addSelect(DB::raw('SUM(rmre.rated_qty) as rated_qty'))
                ->first();
            // 查询退料单记录表  shuaijie.feng
            $stmt_teturn = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rrmr').' as rrmr','rrmr.material_requisition_id','rmr.id')
                ->where([
                    ['rrmr.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 2],
                    ['rmr.is_delete', '=', 0],
                    ['rmr.push_type', '=', 2],
                ])
                ->addSelect(DB::raw('SUM(rrmr.qty) as sum'))
                ->first();
            // 领料数量减去退料数量是否大于物料的额定数量
            if(($stmt->sum-$stmt_teturn->sum) == $stmt->rated_qty || ($stmt->sum-$stmt_teturn->sum) > $stmt->rated_qty) {
                $is_first = 0;
            }
            // 查询领料记录表,查询是否有未完成订单 shuaijie.feng
            $obj_count = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.push_type', '=', 2],
                    ['rmr.status', '<>', 4],
                    ['rmr.is_delete', '=', 0],
                ])
                ->count();
            if($obj_count){
                TEA('2410');
                $is_first = 0;
            }
            $obj1 = DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
                ->where([
                    ['rmre.work_order_id', '=', $input['work_order_id']],
                    ['rmr.type', '=', 1],
                    ['rmr.push_type', '=', 2],
                    ['rmr.is_delete', '=', 0],
                    ['rmr.status', '<>', 4]
                ])
                ->count();
            if ($obj1) {
                $is_unfinished = 1;
            }
        }

        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmre').' as rmre','rmre.material_requisition_id','rmr.id')
            ->leftJoin(config('alias.rmri') . ' as rmri', function ($join) {
                $join->on('rmri.material_requisition_id', '=', 'rmr.id')
                    ->on('rmri.material_id', '=', 'rmre.material_id');
            })
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->select([
                'rmri.material_id',
            ])
            ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as sum'))
            ->where([
                ['rmre.work_order_id', '=', $input['work_order_id']],
                ['rmr.push_type', '=', 2],
                ['rmr.type', '=', 1],
                ['rmr.is_delete', '=', 0],
            ])
            ->groupBy('rmri.material_id')
            ->get();
        $data = [];
        foreach ($obj_list as $o) {
            $data[$o->material_id] = $o->sum;
        }
        return [
            'is_first' => $is_first,
            'is_unfinished' => $is_unfinished,
            'materials' => $data
        ];
    }

    public function getListexport($input)
    {
        $where = [];
        $rmre_where = [];
        $orwhere = [];
        $is_merger = 0;
        if(isset($input['is_merger']) && $input['is_merger']){
            $input['is_merger'] == 1? $is_merger=1:$is_merger=2;
        }
        if($is_merger == 2){
            $where[] = ['rmr.is_delete', '=', 0];
            if (!(isset($input['is_depot_picking']) && $input['is_depot_picking'] == 1)) {
                $where[] = ['rwo.is_delete', '=', 0];
                $where[] = ['rwo.on_off', '=', 1];
            }
            //状态为反审的单子不显示
            $where[] = ['rmr.status', '<', 5];
            if (!empty($input['code'])) $where[] = ['rmr.code', 'like', '%' . $input['code'] . '%'];
            if (!empty($input['type']) && is_numeric($input['type'])) $where[] = ['rmr.type', '=', $input['type']];
            if (!empty($input['status']) && in_array($input['status'], [1, 2, 3, 4])) $where[] = ['rmr.status', '=', $input['status']];
            if (isset($input['push_type']) && in_array($input['push_type'], [0, 1, 2])) $where[] = ['rmr.push_type', '=', $input['push_type']];
            if (!empty($input['work_order_code'])) $where[] = ['rwo.number', 'like', '%' . $input['work_order_code'] . '%'];
            if (!empty($input['product_order_code'])) $where[] = ['rmr.product_order_code', 'like', '%' . $input['product_order_code'] . '%'];
            if (!empty($input['line_depot_id'])) $where[] = ['rmr.line_depot_id', '=', $input['line_depot_id']];
            if (!empty($input['workbench_id'])) $where[] = ['rmr.workbench_id', '=', $input['workbench_id']];
            if (!empty($input['employee_name'])) $where[] = ['re.name', 'like', '%' . $input['employee_name'] . '%'];
            if (!empty($input['inspur_material_code'])) $where[] = ['rpo.inspur_material_code', 'like', '%' . $input['inspur_material_code'] . '%'];
            if (!empty($input['inspur_sales_order_code'])) $where[] = ['rpo.inspur_sales_order_code', 'like', '%' . $input['inspur_sales_order_code'] . '%'];
            if (!empty($input['is_depot_picking'])) $where[] = ['rmr.is_depot_picking', '=', 1];
            if (!empty($input['rankplan'])) $where[] = ['rrp.id', '=', $input['rankplan']];  // 添加班次搜索条件  shuaijie.feng
            if (!empty($input['send_deport'])) $where[] = ['rmr.send_depot', '=', $input['send_deport']];  // 添加采购仓储地搜索条件  shuaijie.feng
            if (!empty($input['dispatch_start_time'])) $where[] = ['rmr.dispatch_time', '>=', strtotime($input['dispatch_start_time'])];  // 配送日期搜索条件  shuaijie.feng
            if (!empty($input['dispatch_end_time'])) $where[] = ['rmr.dispatch_time', '<=', strtotime($input['dispatch_end_time'])];  // 配送日期搜索条件  shuaijie.feng
            if (!empty($input['factory_id'])) $where[] = ['rf.id', '=', $input['factory_id']];  // 工厂搜索条件  shuaijie.feng
            // 销售订单号+行号
            if (!empty($input['sales_order_code'])) $where[] = ['rmr.sale_order_code', '=', $input['sales_order_code']];
            if (!empty($input['sales_order_project_code'])) $where[] = ['rmr.sale_order_project_code', '=', $input['sales_order_project_code']];

            if (!empty($input['start_time']) && !empty($input['end_time'])) {
                $where[] = ['rmr.ctime', '>', strtotime(trim($input['start_time']))];
                $where[] = ['rmr.ctime', '<', strtotime(trim($input['end_time']))];
            }

            //按员工档案那配置的生产单元，按厂对po进行划分
            $admin_id = session('administrator')->admin_id;
            $admin_is_super = session('administrator')->superman;
            $where2 = [['re.admin_id', '=', $admin_id]];
            $emploee_info = DB::table(config('alias.re') . ' as re')
                ->select('re.id', 're.factory_id', 're.workshop_id')
                ->where($where2)
                ->first();
            if(!empty($emploee_info)) {
                if ($admin_is_super != 1) {
                    if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                        //超产能转厂补丁
                        if (!empty($emploee_info)) {
                            $orwhere = function ($query) use ($emploee_info) {
                                $query->where([
                                    ['rpo.WERKS', '<>', ''],
                                    ['rpo.WERKS_id', '=', $emploee_info->factory_id]
                                ])
                                    ->orWhere([
                                        ['rpo.factory_id', '=', $emploee_info->factory_id]
                                    ]);
                            };
                        }
                        //$where[] = ['a1.factory_id', '=', $emploee_info->factory_id];//区分到厂
                    } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                        if(isset($input['issuance']) && $input['issuance'] == 1){
                            $where[] = ['rws.id', '=', $emploee_info->workshop_id];//发料按线边仓区分
                        }else{
                            $where[] = ['rwo.work_shop_id', '=', $emploee_info->workshop_id];//区分车间
                        }
                    }
                }
            }
            $selet = [
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmr.code as code',
                'rmr.time',
                'rmr.ctime',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.status',
                'rmr.product_order_code as po_number', // 生产订单
//                'rmr.sale_order_code', // 销售订单
//                'rmr.sale_order_project_code', // 销售订单行项
                'rpo.sales_order_code as sale_order_code', // 销售订单
                'rpo.sales_order_project_code as sale_order_project_code', // 销售订单行项
                'rmr.send_depot', // 采购仓储
                'rm.id as material_id', // 物料id
                'rm.item_no as material_code', // 物料名称
                'rm.name as material_name', // 物料名称
                'ruu.commercial', // 单位
                'rmrib.actual_send_qty',// 需求数量
                'rmrib.actual_receive_qty',// 实收数量
                'rmrib.batch',// 批次号
                'rmr.dispatch_time as dispatch_time',// 配送时间
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
                'rwo.number as wo_number', // 工单号
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rsd_s.code as send_depot_code',
                'rsd_s.name as send_depot_name',
            ];
            $builder = DB::table($this->table . ' as rmr')
                ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
                ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
                ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
                ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
                ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
                ->leftJoin(config('alias.rws') . ' as rws', 'rsd_s.code', '=', 'rws.address')
                ->leftJoin(config('alias.rrp') . ' as rrp', 'rwo.rank_plan_id', '=', 'rrp.id')
                ->leftJoin(config('alias.rm') . ' as rm', 'rmri.material_id', '=', 'rm.id')
                ->leftJoin(config('alias.ruu') . ' as ruu', 'rmri.demand_unit_id', '=', 'ruu.id')
                ->select($selet)
                ->where($where);
            if(!empty($orwhere)) $builder->where($orwhere);
            $obj_list = $builder->orderBy('rmr.id','DESC')->get();

        }
        elseif ($is_merger == 1){
            $where = [
                ['rmr.is_delete','=',0],
                ['rmr.push_type','=',1],
                ['rmr.type','=',1],
                ['rmr.is_merger_picking','=',1]
            ];
            if(!empty($input['code'])) $where[] = ['rmr.code','=',$input['code']];
            if(!empty($input['status']) && in_array($input['status'], [1, 2, 3, 4])) $where[] = ['rmr.status', '=', $input['status']];
            if(!empty($input['send_depot'])) $where[] = ['rmr.send_depot', '=', $input['send_depot']];
            if(!empty($input['employee_id'])) $where[] = ['rmr.employee_id', '=', $input['employee_id']];
            if(!empty($input['factory_id'])) $where[] = ['rmr.factory_id','=',$input['factory_id']];
            if(!empty($input['send_start_time'])) $where[] = ['rmr.dispatch_time','>=',strtotime($input['send_start_time'])];
            if(!empty($input['send_end_time'])) $where[] = ['rmr.dispatch_time','<=',strtotime($input['send_end_time'])];
            if(!empty($input['line_depot_id'])) $where[] = ['rmr.line_depot_id','=',$input['line_depot_id']];
            //有一些条件是要根据合并工单信息先查出领料单id的

            if(!empty($input['work_order_code'])) $rmre_where[] = ['rwo.number','=',$input['work_order_code']];
            if(!empty($input['product_order_code'])) $rmre_where[] = ['rpo.number','=',$input['product_order_code']];
            if(!empty($input['sales_order_code'])) $rmre_where[] = ['rpo.sales_order_code','=',$input['sales_order_code']];
            if(!empty($input['sales_order_project_code'])) $rmre_where[] = ['rpo.sales_order_project_code','=',$input['sales_order_project_code']];
            if(!empty($input['out_material_code'])){
                $rmre_where[] = ['rwoi.material_code','=',$input['out_material_code']];
                $rmre_where[] = ['rwoi.type','=',1];
            }
            $where[] = ['rmre.is_merger','=',$input['is_merger']];

            $mr_ids = [];
            if(!empty($rmre_where)){
                $mr_ids = DB::table(config('alias.rmre').' as rmre')
                    ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rmre.work_order_id')
                    ->leftJoin(config('alias.rwoi').' as rwoi','rwoi.work_order_id','rwo.id')
                    ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
                    ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmre.material_requisition_id')
                    ->select(
                        'rmre.material_requisition_id'
                    )
                    ->groupBy('rmre.material_requisition_id')
                    ->where($rmre_where)
                    ->where([
                        ['rmr.is_delete','=',0],
                        ['rmr.push_type','=',1],
                        ['rmr.type','=',1],
                        ['rmr.is_merger_picking','=',1]
                    ])
                    ->pluck('rmre.material_requisition_id')->toArray();
            }

            //按员工档案那配置的生产单元，按厂对po进行划分
            $admin_id = session('administrator')->admin_id;
            $admin_is_super = session('administrator')->superman;
            $emploee_info = DB::table(config('alias.re') . ' as re')
                ->select('re.id', 're.factory_id', 're.workshop_id')
                ->where('re.admin_id', $admin_id)
                ->first();
            if (!empty($emploee_info)) {
                if ($admin_is_super != 1) {
                    if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                        $where[] = ['rmr.factory_id', '=', $emploee_info->factory_id];//区分到厂
                    } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                        $where[] = ['rmr.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                    }
                }
            }
            $selet = [
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmr.code as code',
                'rmr.time',
                'rmr.ctime',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.status',
                'rmr.product_order_code as po_number', // 生产订单
                //'rmr.sale_order_code', // 销售订单
                //'rmr.sale_order_project_code', // 销售订单行项
                'rpo.sales_order_code as sale_order_code', // 销售订单
                'rpo.sales_order_project_code as sale_order_project_code', // 销售订单行项
                'rmr.send_depot', // 采购仓储
                'rmre.material_id', // 物料id
                'rmre.material_code', // 物料名称
                'rm.name as material_name', // 物料名称
//            'rmri.remark', // 备注
//            'rmri.demand_unit_id', // 单位id
                'ruu.commercial', // 单位
//            'rmrib.actual_send_qty',
//            'rmrib.actual_receive_qty',
                'rmre.rated_qty as actual_send_qty',// 需求数量
                'rmre.qty as actual_receive_qty',// 实收数量
                'rmre.batch',// 批次号
                'rmr.dispatch_time as dispatch_time',// 配送时间
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
                'rwo.number as wo_number', // 工单号
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rsd_s.code as send_depot_code',
                'rsd_s.name as send_depot_name',
            ];
            $builder = DB::table($this->table . ' as rmr')
                ->leftJoin(config('alias.rmre') . ' as rmre', 'rmre.material_requisition_id', '=', 'rmr.id')
//            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
//            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
                ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmre.work_order_id')
                //->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
                ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
                ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
                ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
                ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
                ->leftJoin(config('alias.rws') . ' as rws', 'rsd_s.code', '=', 'rws.address')
                ->leftJoin(config('alias.rrp') . ' as rrp', 'rwo.rank_plan_id', '=', 'rrp.id')  // 关联班次表  shuaijie.feng
                ->leftJoin(config('alias.rm') . ' as rm', 'rmre.material_id', '=', 'rm.id')
                ->leftJoin(config('alias.ruu') . ' as ruu', 'rmre.unit_id', '=', 'ruu.id')
                ->select($selet)
                ->where($where);
            if(!empty($rmre_where)) $builder->whereIn('rmr.id',$mr_ids);
            $obj_list = $builder->orderBy('rmr.id','DESC')->get();
        }
        $cellData = [
            [
                '单据日期', '需求领料日期','配送时间','领料单号', '销售订单号', '销售订单行项目号', '生产订单号', '工单号',
                '物料编码', '物料名称','批次号','采购仓储地', '需求数量', '实收数量', '计量单位','备注'
            ]
        ];
        foreach ($obj_list as $k => $v) {
            $cellData[] = [
                date('Y-m-d H:i:s', $v->ctime),'',date('Y-m-d H:i:s', $v->dispatch_time),$v->code,$v->sale_order_code,$v->sale_order_project_code,
                $v->po_number,$v->wo_number,$v->material_code,$v->material_name,$v->batch,$v->push_type==1? $v->send_depot :$v->send_depot_code,$v->actual_send_qty,
                $v->actual_receive_qty,$v->commercial,'',
            ];
        };


        $fileName = $is_merger == 1?'合并领料单据'. date('Y-m-d H:i:s',time()):'按单领料单据' . date('Y-m-d H:i:s',time());
        set_time_limit(0);
        header('Content-Type: application/vnd.ms-excel');
        header('Cache-Control:max-age=0');
        ob_end_clean();//清除缓冲区,避免乱码
        Excel::create($fileName, function($excel) use ($cellData) {
            $excel->sheet('flist', function($sheet) use ($cellData){
                $sheet->rows($cellData);
                $sheet->freezeFirstRow();// 冻结第一行
            });
        })->export('xls');
        exit();


        //调用excel组件进行导出
//        Excel::create($fileName,function($excel) use ($cellData){
//            $excel->sheet('first', function($sheet) use ($cellData){
//                $sheet->rows($cellData);
//                $sheet->freezeFirstRow();// 冻结第一行
//            });
//        })->export('xlsx');
//        exit();

    }

    /**
     * 删除领料单行项推送sap
     * @param $id
     * @param $item_id
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getpushSapshow($id,$item_id)
    {
        if(!is_array($item_id)) {
            $item_id = str_split($item_id,strlen($item_id)+1);
        }
        $isDepotPicking = $this->checkIsDepotPicking($id);
        $bulist = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
            ->leftJoin('ruis_rbac_admin' . ' as rra', 'rra.id', '=', 'rmr.creator_id') // 关联admin 查询创建人
            ->select([
                'rmr.code as mr_code',
                'rmr.time',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.product_order_code',  //PO
                //'rmr.sale_order_code', // 销售订单
                //'rmr.sale_order_project_code', // 销售订单行项
                'rpo.sales_order_code as sale_order_code', // 销售订单
                'rpo.sales_order_project_code as sale_order_project_code', // 销售订单行项
                'rmr.send_depot',
                'rmr.plan_start_time',
                'rmr.is_depot_picking',
                'rmr.dispatch_time',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwo.number as work_order_code',
                'rwo.plan_start_time as wo_plan_start_time',  //领料到货时间
                'rsd.code as line_depot_code',
                'rmri.line_project_code',
                'rmri.custom_inspur_sale_order_code',
                'rmri.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rmri.demand_qty',
                'ruu_d.id as bom_unit_id',
                'ruu_d.commercial as demand_unit', // bom单位
                'rmri.wait_send_qty',
                'rmri.over_send_qty',
                'rmri.is_special_stock',
                'rpo.inspur_sales_order_code',
                'rmc.code as category_code',
                'rmr.creator_id', // 创建人id
                'rra.name as creator_name', // 创建人名称
                'rra.cn_name as creator_cn_name', // 创建人名称
                'rmri.item_is_delete', // 增加 行项是否删除  1:被删除   0:未删除
                'rm.material_category_id', //
                'rmri.id as item_id',
                'rmr.id as rmr_id'
            ])
            ->where([
                ['rmr.id', '=', $id],
                ['rmr.status', '>=', 2],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 1],
                ['rmri.item_is_delete', '<>', 1],// 增加 行项是否删除  1:被删除   0:未删除
            ]);
            if(!empty($item_id[0])){
                $bulist->whereIn('rmri.id',$item_id);
            }
            $objs = $bulist->get();

        if (empty(obj2array($objs))) {
            return [];
        }
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $delr = DB::table('ruis_rbac_admin')->where('id',$creator_id)->first();
        $sendData = [];
        foreach ($objs as $key => $value) {
            // 不是 sap 领料 且 当前物料的分类不在限定之列，则不需要发送
            if($value->push_type != 1){
                continue;
            }
            if($value->type == 2){
                $rmrib = DB::table(config('alias.rmrib'))
                    ->where([
                        ['material_requisition_id','=',$value->rmr_id],
                        ['item_id','=',$value->item_id],
                    ])
                    ->select('order')->get();
                if(!$rmrib) TEA('501');
                foreach ($rmrib as $rk=>$rv){
                    $temp = [
                        'LLDH' => $value->mr_code, // 领料单
                        'LLHH' => $value->line_project_code.$rv->order, // 领料单行项
                        'LLLX' => $this->intToType($value->type), // 领料单类型
                        'DELR' => !empty($delr->cn_name)?$delr->cn_name:$delr->name, // 删除人
                        'DATUM' => date('Ymd'), // 日期
                        'UZEIT' => date('His'), // 时间
                    ];
                    $sendData[] = $temp;
                }
            }else{
                $temp = [
                    'LLDH' => $value->mr_code, // 领料单
                    'LLHH' => $value->line_project_code, // 领料单行项
                    'LLLX' => $this->intToType($value->type), // 领料单类型
                    'DELR' => !empty($delr->cn_name)?$delr->cn_name:$delr->name, // 删除人
                    'DATUM' => date('Ymd'), // 日期
                    'UZEIT' => date('His'), // 时间
                ];
                $sendData[] = $temp;
            }
        }
        return $sendData;
    }
//endregion
    /**
     * 齐料检
     * @param $id
     * @param $item_id
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author  hao.li
     */
     public function checkMaterial($data){
         foreach($data as $k => &$v){
             $flag=1;
             $salesOrder=sprintf('%010s',$v->salesOrder);
           //  $material=sprintf('%018s',$v->material);
             $obj_list=DB::table('ruis_qc_check')
             ->select('GRQTY')
             ->where('VBELN',$salesOrder)
             ->where('VBELP',$v->salesOrderItem)
             ->where('material_id',$v->material)
             ->where('check_resource',1)
             ->get();
             if(empty(obj2array($obj_list))){
                 $flag=0;
             }
             $v->flag=$flag;
         }
         return $data;
     }

    /**
    * 工单对应其他补料单列表
    * @param $input
    * @return array
    * @throws \App\Exceptions\ApiException
    */
    public function getblList($input)
    {
        $work_order_code = $input['work_order_code']; //工单号
        $material_requisition_id = $input['material_requisition_id']; //补料单号

        $work_order_id = DB::table('ruis_work_order')->where('number',$work_order_code)->value('id');
        $obj_list = DB::table('ruis_material_requisition as rmr')
            ->select('id')
            ->where('work_order_id',$work_order_id)
            ->where('type',7)
            ->where('push_type',0)
            ->get();
        $list = [];
        if($obj_list)
        {
            foreach ($obj_list as $k=>$v)
            {
                $field = [
                    'rmr.id as id',
                    'rmr.declare_id',
                    'rmr.code as code',
                    'rmr.type',
                    'rmr.push_type',
                    'rmr.ctime',
                    'rmr.mtime',
                    'rmr.time',
                    'rmr.from',
                    'rmr.status',
                    'rmr.product_order_id',
                    'rmr.product_order_code',
                    'rmr.send_depot',
                    'rmr.is_depot_picking',
                    'rmr.plan_start_time',
                    'rmr.is_merger_picking',
                    'rmr.dispatch_time',
                    'rmr.bench_no',
                    'rmr.delete_reason',
                    'rmr.repairstatus',
                    're.id as employee_id',
                    're.name as employee_name',
                    'rf.id as factory_id',
                    'rf.name as factory_name',
                    'rf.code as factory_code',
                    'rwb.id as workbench_id',
                    'rwb.code as workbench_code',
                    'rwb.name as workbench_name',
                    'rwo.number as work_order_code',
                    'rwo.plan_start_time as wo_plan_start_time',
                    'rm.id as material_id',
                    'rm.item_no as material_code',
                    'rm.name as material_name',
                    'rmri.id as item_id',
                    'rmri.line_project_code',
                    'rmri.demand_qty',
                    'rmri.rated_qty',
                    'rmri.remark',
                    'rmri.reason',
                    'rmri.qc_reason',
                    'ruu_d.id as demand_unit_id',
                    'ruu_d.commercial as demand_unit',
                    'rmri.is_special_stock',
                    'rmri.custom_inspur_sale_order_code',
                    'rmri.inspur_material_code',
                    'rsd_i.id as depot_id',
                    'rsd_i.code as depot_code',
                    'rsd_i.name as depot_name',
                ];

                $objs = DB::table($this->table . ' as rmr')
                    ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                    ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
                    ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
                    ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
                    ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
                    ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
                    ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
                    ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
                    ->leftJoin(config('alias.rsd') . ' as rsd_i', 'rsd_i.id', '=', 'rmri.depot_id')
                    ->leftJoin('ruis_rbac_admin' . ' as rra', 'rra.id', '=', 'rmr.creator_id') // 关联admin 查询创建人
                    ->select($field)
                    ->where([
                        ['rmr.id', '=', $v->id],
                        ['rmr.is_delete', '=', 0],
                        ['rmr.id', '<>', $material_requisition_id],
                        ['rmr.status',4],
                    ])
                    ->get();
                foreach ($objs as $key => $value) {
                    if (!empty($value->item_id)) {
                        $actual_receive_qty = DB::table(config('alias.rmrib').' as rmrib')
                            ->leftJoin(config('alias.rmri').' as rmri'.' as rmri','rmrib.item_id','=','rmri.id')
                            ->where('rmri.material_requisition_id',$value->id)
                            ->where('rmri.material_id',$value->material_id)
                            ->sum('rmrib.actual_receive_qty');
                        $temp = [
                            'mrcode' => $value->code,
                            'mrid' => $value->id,
                            'material_name' => $value->material_name,
                            'material_id' => $value->material_id,
                            'rated_qty' => $value->rated_qty,
                            'demand_qty' => $value->demand_qty,
                            'demand_unit' => $value->demand_unit,
                            'depot_id' => get_value_or_default($value, 'depot_id', 0),
                            'depot_name' => get_value_or_default($value, 'depot_name', ''),
                            'depot_code' => get_value_or_default($value, 'depot_code', ''),
                            'actual_receive_qty'=>$actual_receive_qty,
                            'repairstatus'=>$value->repairstatus
                        ];
                        // 如果是合并工单，那么获取总计划数量
                        $demand_qty = $this->getAllRatedQty($work_order_code,$value->material_id);
                        if($demand_qty!=0) $temp['demand_qty'] = $demand_qty;

                        //差异原因
                        $MKPF_BKTXT_ARR1 = DB::table('ruis_work_declare_order_item')
                            ->select('MKPF_BKTXT','diff_remark')
                            ->where(['declare_id'=>$value->declare_id,'material_id'=>$value->material_id,'type'=>1])
                            ->get();
                        if($MKPF_BKTXT_ARR1)
                        {
                            $MKPF_BKTXT = '';
                            $diff_remark = '';
                            foreach ($MKPF_BKTXT_ARR1 as $v)
                            {
                                $MKPF_BKTXT .= ','.$v->MKPF_BKTXT;
                                if(!empty($v->diff_remark)) $diff_remark .= $v->diff_remark.';';
                            }
                            $MKPF_BKTXT_ARR = explode(',',$MKPF_BKTXT);
                            $rps = DB::table(config('alias.rps'))
                                ->select(['id','name','description'])
                                ->whereIn('id',$MKPF_BKTXT_ARR)
                                ->get();
                            $temp['MKPF_BKTXT_ARR'] = $rps;
                            $temp['diff_remark'] = $diff_remark;
                        }
                        else
                        {
                            $temp['MKPF_BKTXT_ARR'] = [];
                            $temp['diff_remark'] = [];
                        }

                        //$data[$value->material_id][] = $temp;
                        $data[] = $temp;
                    }
                }

            }
        }
        //相同物料合并
//        if(isset($data))
//        {
//            foreach ($data as $dv)
//            {
//                $temp1 = [
//                    'mrcode' =>0,//这个值没有用了，填0占位，可以去掉
//                    'material_name' => $dv[0]['material_name'],
//                    'material_id' => $dv[0]['material_id'],
//                    'rated_qty' => $dv[0]['rated_qty'],
//                    'demand_qty' => $dv[0]['demand_qty'],
//                    'demand_unit' => $dv[0]['demand_unit'],
//                    'depot_id' => $dv[0]['depot_id'],
//                    'depot_name' => $dv[0]['depot_name'],
//                    'depot_code' => $dv[0]['depot_code'],
//                    'actual_receive_qty'=> 0
//                ];
//                foreach ($dv as $ddv)
//                {
//                    $temp1['actual_receive_qty'] += $ddv['actual_receive_qty'];
//                }
//                $list[]=$temp1;
//            }
//        }
        if(isset($data))
        {
            $list = $data;
        }
        else
        {
            $list = [];
        }
        return $list;
    }

    public function getOtherMergerByWorkOrder($input)
    {
        $work_order_code = $input['work_order_code'];
        $material_requisition_id = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rmre') . ' as rmre', 'rwo.id', '=', 'rmre.work_order_id')
            ->select(
                'rmre.material_requisition_id'
            )
            ->where([
                ['rmre.is_merger', '=', 1],
                ['rwo.number', '=', $work_order_code]
            ])
            ->value('rmre.material_requisition_id');
        if (!$material_requisition_id) return [];

//        $rmri_list = DB::table(config('alias.rmri') . ' as rmri')
//            ->leftJoin(config('alias.ruu') . ' as ruu_bom', 'ruu_bom.id', 'rmri.demand_unit_id')
//            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', 'rmri.material_id')
//            ->leftJoin(config('alias.ruu') . ' as ruu_base', 'ruu_base.id', 'rm.unit_id')
//            ->select(
//                'rmri.id as item_id',
//                'rmri.line_project_code',
//                'rmri.material_id',
//                'rmri.material_code',
//                'rmri.material_name',
//                'rmri.rated_qty',
//                'rmri.demand_qty',
//                'ruu_bom.commercial as demand_unit',
//                'ruu_bom.id as demand_unit_id',
//                'ruu_base.id as base_unit_id',
//                'ruu_base.commercial as base_unit',
//                'rmri.is_special_stock as special_stock',
//                'rmri.remark',
//                'rmri.custom_inspur_sale_order_code',
//                'rmri.inspur_material_code as old_material_code',
//                'rmri.sales_order_code',
//                'rmri.sales_order_project_code',
//                'rmri.is_send'
//            )
//            ->where('rmri.material_requisition_id', $material_requisition_id)
//            ->get();
        //5.查询工单领料信息
        $wo_po_so = DB::table(config('alias.rmre') . ' as rmre')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', 'rmre.work_order_id')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', 'rwo.production_order_id')
            ->select(
                'rmre.material_id',
                'rmre.material_code',
                'rmre.special_stock',
                'rwo.number as work_order_code',
                'rpo.number as product_order_code',
                'rpo.sales_order_code',
                'rpo.sales_order_project_code',
                'rmre.qty',
                'rmre.rated_qty'
            )
            ->where('rmre.material_requisition_id', $material_requisition_id)
            ->get();
//        foreach ($rmre_list as $k => $v) {
//            //因为之前非特殊库存的物料合并犯蠢了，把料的销售单号和行号也带入进去了，导致合并成一个行项的时候只取了第一个，然后就有了下面这个判断，本来不用判断处理的
//            if (!empty($v->special_stock)) {
//                if (isset($ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code])) {
//                    $ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code][] = $v;
//                } else {
//                    $ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code] = [$v];
//                }
//            } else {
//                if (isset($ref_rmre_list[$v->material_id . '-' . $v->sales_order_code])) {
//                    $ref_rmre_list[$v->material_id . '-' . $v->sales_order_code][] = $v;
//                } else {
//                    $ref_rmre_list[$v->material_id . '-' . $v->sales_order_code] = [$v];
//                }
//            }
//        }
//        foreach ($rmri_list as $k => &$v) {
//            //因为之前非特殊库存的物料合并犯蠢了，把料的销售单号和行号也带入进去了，导致合并成一个行项的时候只取了第一个，然后就有了下面这个判断，本来不用判断处理的
//            if (!empty($v->special_stock)) {
//                $wo_po_so = !isset($ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code]) ? [] : $ref_rmre_list[$v->material_id . '-' . $v->special_stock . '-' . $v->sales_order_code . '-' . $v->sales_order_project_code];
//            } else {
//                $wo_po_so = !isset($ref_rmre_list[$v->material_id . '-' . $v->sales_order_code]) ? [] : $ref_rmre_list[$v->material_id . '-' . $v->sales_order_code];
//            }
//        }
        //去除不是当前补料单的物料
        if ($input['material_ids']) {
            $material_arr = explode(',', $input['material_ids']);
            foreach ($wo_po_so as $wk => &$wv) {
                if (!in_array($wv->material_id, $material_arr)) {
                    unset($wo_po_so[$wk]);
                }
            }
            if (!empty($wo_po_so)) {
                array_values(obj2array($wo_po_so));
            }
        }
        //分组计算
        $list = [];
        if (isset($wo_po_so) && !empty($wo_po_so))
        {
            foreach ($wo_po_so as $value)
            {
                if(isset($list[$value->material_id]['qty']))
                {
                    $list[$value->material_id]['qty'] += $value->qty;
                    $list[$value->material_id]['rated_qty'] += $value->rated_qty;
                }
                else
                {
                    $list[$value->material_id]['qty'] = $value->qty;
                    $list[$value->material_id]['rated_qty'] = $value->rated_qty;
                }

            }
        }
        //计算
        if(isset($wo_po_so)) return array_values(obj2array($wo_po_so));

        return [];
    }

    public function getAllRatedQty($work_order_code,$material_id)
    {
        $material_requisition_id = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rmre') . ' as rmre', 'rwo.id', '=', 'rmre.work_order_id')
            ->select(
                'rmre.material_requisition_id'
            )
            ->where([
                ['rmre.is_merger', '=', 1],
                ['rwo.number', '=', $work_order_code]
            ])
            ->value('rmre.material_requisition_id');
        if (!$material_requisition_id) return 0;

        return DB::table(config('alias.rmre') . ' as rmre')
            ->where('rmre.material_requisition_id', $material_requisition_id)
            ->where('rmre.material_id', $material_id)
            ->sum('rmre.rated_qty');
    }

    /**
     * 获取合并工单code
     * @param $work_order_code
     * @param $material_id
     * @return int
     */
    public function getMergeWorkOrderCode($work_order_code,$material_id)
    {
        $str = '';
        $material_requisition_id = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rmre') . ' as rmre', 'rwo.id', '=', 'rmre.work_order_id')
            ->select(
                'rmre.material_requisition_id'
            )
            ->where([
                ['rmre.is_merger', '=', 1],
                ['rwo.number', '=', $work_order_code]
            ])
            ->value('rmre.material_requisition_id');
        if (!$material_requisition_id) return 0;

        $res = DB::table(config('alias.rmre') . ' as rmre')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmre.work_order_id')
            ->select('rwo.number')
            ->where('rmre.material_requisition_id', $material_requisition_id)
            ->where('rmre.material_id', $material_id)
            ->get();
        if($res && !empty($res))
        {
            foreach ($res as $v)
            {
                $str .= $v->number.',';
            }
        }

        return $str;
    }

    /**
     * 各单位补料比例报表
     * @param $input
     * @return array
     */
    public function blListReport($input)
    {
        $type = $input['type'];
        $data = [];
        //type 补料类型,1-生产补料线边仓 2-生产补料sap 3-生产补料车间 4-委外sap补料 5-委外线边仓补料
        if($type != 4 && $type != 5)
        {
            if($type == 1)//生产补料线边仓和其他生产仓的补料单位获取方式不同
            {
                $where = $this->blListReportWhere($input,1);
                //1.第一张表数据
                //按补料单位进行分组获取补料次数
                $bl_number = DB::table('ruis_material_requisition as rmr')
                    ->leftJoin('ruis_work_order as rwo','rmr.work_order_id','rwo.id')
                    ->leftJoin('ruis_workshop as rws','rwo.work_shop_id','rws.id')
                    ->leftJoin('ruis_storage_depot as rsd','rsd.code','=','rws.address')
                    ->select('rsd.id as line_depot_id','rsd.name','rmr.id')
                    ->selectRaw('count(*) as num')
                    ->where($where)
                    ->where('rwo.is_delete','0')
                    ->where('rwo.on_off','1')
                    ->groupBy('rsd.id')
                    ->orderBy('num','desc')
                    ->get();
                //获取原因类型
                $reason_id_arr = DB::table('ruis_preselection')->where('name','操作失误')->pluck('id')->toArray();
                //获取操作失误的数据
                if($bl_number)
                {
                    $reason_id_str = implode('|',$reason_id_arr);
                    $where1 = $this->blListReportWhere($input,2);
                    foreach ($bl_number as &$v)
                    {
                        $v->sw_num = DB::table('ruis_material_requisition as rmr')
                            ->leftJoin('ruis_material_requisition_item as rmri','rmr.id','=','rmri.material_requisition_id')
                            ->leftJoin('ruis_work_order as rwo','rmr.work_order_id','rwo.id')
                            ->leftJoin('ruis_workshop as rws','rwo.work_shop_id','rws.id')
                            ->leftJoin('ruis_storage_depot as rsd','rsd.code','=','rws.address')
                            ->where($where1)
                            ->where('rwo.is_delete','0')
                            ->where('rwo.on_off','1')
                            ->where('rsd.id',$v->line_depot_id)
                            ->whereRaw('rmri.qc_reason REGEXP \'(^|,)('.$reason_id_str.')(,|$)\'')
                            ->count();

                        //查询是否是转厂虚拟车间
                        $res = DB::table('ruis_material_requisition_item as rmri')
                            ->leftJoin('ruis_storage_depot as rsd_o','rsd_o.id','rmri.depot_id')
                            ->select('rsd_o.id','rsd_o.name')
                            ->where('rmri.material_requisition_id',$v->id)
                            ->first();
                        if($res->id != $v->line_depot_id)
                        {
                            $v->name = $res->name;
                        }

                    }
                }
                $data['bl_number'] = $bl_number;

                //2.第二张表数据，补料原因数据汇总
                $sql = "SELECT
                        rp.name,
                        count( table1.id ) AS num 
                    FROM
                        (
                        SELECT
                            rmri.id,
                            rmri.material_requisition_id,
                            substring_index( substring_index( rmri.qc_reason, ',', b.help_topic_id + 1 ), ',',- 1 ) rpid 
                        FROM
                            ruis_material_requisition_item rmri
                            LEFT JOIN ruis_material_requisition rmr ON rmr.id = rmri.material_requisition_id
                            LEFT JOIN ruis_work_order rwo ON rwo.id = rmr.work_order_id
                            JOIN mysql.help_topic b ON b.help_topic_id < ( length( rmri.qc_reason ) - length( REPLACE ( rmri.qc_reason, ',', '' ) ) + 1 ) 
                        WHERE
                            rmri.qc_reason != '' and rmr.is_delete = 0 and rwo.is_delete=0 and rwo.on_off=1";
                $start_time = strtotime($input['start_time']);
                $end_time = strtotime($input['end_time']);
                if($input['repairstatus'] != '' && ($input['repairstatus'] == 0 || $input['repairstatus'] == 1))
                {
                    $sql .= " AND rmr.repairstatus = ".$input['repairstatus'];
                }
                $sql .= " AND rmr.type = 7 AND rmr.push_type = 0 AND rmr.status = 4";
                $sql .= " AND rmr.ctime >= $start_time AND rmr.ctime<=$end_time";
                $sql .= "   ) AS table1
                        LEFT JOIN ruis_preselection rp ON table1.rpid = rp.id 
                    GROUP BY
                        rp.name
                    ORDER BY num desc";
                $bl_date = DB::select($sql);
                if($bl_date)
                {
                    //去除没有原因的
                    foreach ($bl_date as $k=>$bbv)
                    {
                        if($bbv->name=='')
                        {
                            unset($bl_date[$k]);
                        }
                    }
                    $bl_date = array_values($bl_date);
                    //获取总数量
                    $all_num = array_sum(array_map(function($val){return $val->num;}, $bl_date));
                    //计算百分比和累积百分比
                    $all_percentage = 0;
                    foreach ($bl_date as $bv)
                    {
                        $bv->percentage = bcdiv($bv->num,$all_num,4);
                        $all_percentage = bcadd($bv->percentage,$all_percentage,4);
                        //强制100%
                        if($all_percentage>=0.999) $all_percentage = 1;
                        $bv->all_percentage = $all_percentage;
                    }

                }
                $data['bl_date'] = $bl_date;
            }
            else//生产补料sap 生产补料车间
            {
                $where = $this->blListReportWhere($input,1);
                //1.第一张表数据
                //按补料单位进行分组获取补料次数
                $bl_number = DB::table('ruis_material_requisition as rmr')
                    ->leftJoin('ruis_storage_depot as rsd','rmr.line_depot_id','=','rsd.id')
                    ->leftJoin('ruis_work_order as rwo','rmr.work_order_id','rwo.id')
                    ->select('rmr.line_depot_id','rsd.name')
                    ->selectRaw('count(*) as num')
                    ->where($where)
                    ->where('rwo.is_delete','0')
                    ->where('rwo.on_off','1')
                    ->groupBy('rmr.line_depot_id')
                    ->orderBy('num','desc')
                    ->get();
                //获取原因类型
                $reason_id_arr = DB::table('ruis_preselection')->where('name','操作失误')->pluck('id')->toArray();
                //获取操作失误的数据
                if($bl_number)
                {
                    $reason_id_str = implode('|',$reason_id_arr);
                    $where1 = $this->blListReportWhere($input,2);
                    foreach ($bl_number as &$v)
                    {
                        $v->sw_num = DB::table('ruis_material_requisition as rmr')
                            ->leftJoin('ruis_material_requisition_item as rmri','rmr.id','=','rmri.material_requisition_id')
                            ->leftJoin('ruis_work_order as rwo','rmr.work_order_id','rwo.id')
                            ->where($where1)
                            ->where('rwo.is_delete','0')
                            ->where('rwo.on_off','1')
                            ->where('rmr.line_depot_id',$v->line_depot_id)
                            ->whereRaw('rmri.qc_reason REGEXP \'(^|,)('.$reason_id_str.')(,|$)\'')
                            ->count();
                    }
                }
                $data['bl_number'] = $bl_number;

                //2.第二张表数据，补料原因数据汇总
                $sql = "SELECT
                        rp.name,
                        count( table1.id ) AS num 
                    FROM
                        (
                        SELECT
                            rmri.id,
                            rmri.material_requisition_id,
                            substring_index( substring_index( rmri.qc_reason, ',', b.help_topic_id + 1 ), ',',- 1 ) rpid 
                        FROM
                            ruis_material_requisition_item rmri
                            LEFT JOIN ruis_material_requisition rmr ON rmr.id = rmri.material_requisition_id
                            LEFT JOIN ruis_work_order rwo ON rwo.id = rmr.work_order_id
                            JOIN mysql.help_topic b ON b.help_topic_id < ( length( rmri.qc_reason ) - length( REPLACE ( rmri.qc_reason, ',', '' ) ) + 1 ) 
                        WHERE
                            rmri.qc_reason != '' and rmr.is_delete = 0 and rwo.is_delete=0 and rwo.on_off=1";
                if(isset($input['line_depot_id']) && !empty($input['line_depot_id']))
                {
                    $sql .= " AND rmr.line_depot_id = ".$input['line_depot_id'];
                }
                else
                {
                    $sql .= " AND rmr.line_depot_id != ''";
                }
                if($type == 2)
                {
                    $sql .= " AND rmr.type = 7 AND rmr.push_type = 1";
                }
                else
                {
                    $sql .= " AND rmr.type = 7 AND rmr.push_type = 2";
                }
                if($input['repairstatus'] != '' && ($input['repairstatus'] == 0 || $input['repairstatus'] == 1))
                {
                    $sql .= " AND rmr.repairstatus = ".$input['repairstatus'];
                }
                $start_time = strtotime($input['start_time']);
                $end_time = strtotime($input['end_time']);
                $sql .= " AND rmr.ctime >= $start_time AND rmr.ctime<=$end_time";
                $sql .= "   ) AS table1
                        LEFT JOIN ruis_preselection rp ON table1.rpid = rp.id 
                    GROUP BY
                        rp.name
                    ORDER BY num desc";
                $bl_date = DB::select($sql);

                if($bl_date)
                {
                    //去除没有原因的
                    foreach ($bl_date as $k=>$bbv)
                    {
                        if($bbv->name=='')
                        {
                            unset($bl_date[$k]);
                        }
                    }
                    $bl_date = array_values($bl_date);

                    //获取总数量
                    $all_num = array_sum(array_map(function($val){return $val->num;}, $bl_date));
                    //计算百分比和累积百分比
                    $all_percentage = 0;
                    foreach ($bl_date as $bv)
                    {
                        $bv->percentage = bcdiv($bv->num,$all_num,4);
                        $all_percentage = bcadd($bv->percentage,$all_percentage,4);
                        //强制100%
                        if($all_percentage>=0.999) $all_percentage = 1;
                        $bv->all_percentage = $all_percentage;
                    }

                }
                $data['bl_date'] = $bl_date;
            }

        }
        elseif($type == 4)//委外sap补料
        {
            //按供应商进行分组获取补料次数
            $where = $this->blListReportWhere($input,4);
            //1.第一张表数据
            //按补料单位进行分组获取补料次数
            $bl_number = DB::table('ruis_out_machine_zxxx_order as romzo')
                ->leftJoin('ruis_sap_out_picking as rsop','romzo.out_picking_id','=','rsop.id')
                ->select('rsop.LIFNR')
                ->selectRaw('count(*) as num')
                ->where($where)
                ->groupBy('rsop.LIFNR')
                ->orderBy('num','desc')
                ->get();
            //获取原因类型
            $reason_id_arr = DB::table('ruis_preselection')->where('name','操作失误')->pluck('id')->toArray();
            //获取操作失误的数据
            if($bl_number)
            {
                $reason_id_str = implode('|',$reason_id_arr);
                //$where1 = $this->blListReportWhere($input,2);
                foreach ($bl_number as &$v)
                {

                    $sql = "SELECT
                        rp.name,
                        count( table1.id ) AS num 
                    FROM
                        (
                        SELECT
                            romzoi.id,
                            romzoi.out_machine_zxxx_order_id,
                            substring_index( substring_index( romzoi.qc_reason, ',', b.help_topic_id + 1 ), ',',- 1 ) rpid 
                        FROM
                            ruis_out_machine_zxxx_order_item romzoi
                            LEFT JOIN ruis_out_machine_zxxx_order romzo ON romzoi.out_machine_zxxx_order_id = romzo.id
                            LEFT JOIN ruis_sap_out_picking rsop ON romzo.out_picking_id = rsop.id
                            
                            JOIN mysql.help_topic b ON b.help_topic_id < ( length( romzoi.qc_reason ) - length( REPLACE ( romzoi.qc_reason, ',', '' ) ) + 1 ) 
                        WHERE
                            romzoi.qc_reason != ''";
                    $sql .= " AND rsop.LIFNR = $v->LIFNR ";
                    $start_time = strtotime($input['start_time']);
                    $end_time = strtotime($input['end_time']);
                    $sql .= " AND romzo.ctime >= $start_time AND romzo.ctime<=$end_time AND romzoi.qc_reason REGEXP '(^|,)($reason_id_str)(,|$)'";
                    $sql .= "   ) AS table1
                        LEFT JOIN ruis_preselection rp ON table1.rpid = rp.id 
                    GROUP BY
                        rp.name
                    HAVING name = '操作失误' 
                    ORDER BY num desc";

//                    $res = DB::table('ruis_out_machine_zxxx_order as romzo')
//                        ->leftJoin('ruis_sap_out_picking as rsop','romzo.out_picking_id','=','rsop.id')
//                        ->leftJoin('ruis_out_machine_zxxx_order_item as romzoi','romzo.id','=','romzoi.out_machine_zxxx_order_id')
//                        ->where($where1)
//                        ->where('rsop.LIFNR',$v->LIFNR)
//                        ->whereRaw('romzoi.qc_reason REGEXP \'(^|,)('.$reason_id_str.')(,|$)\'')
//                        ->get();

                    //->count();
                    $o_num = DB::select($sql);
                    if(isset($o_num) && !empty($o_num))
                    {
                        $v->sw_num = $o_num[0]->num;
                    }
                    else
                    {
                        $v->sw_num = 0;
                    }

                    $LIFNR = intval($v->LIFNR);
                    $v->name = DB::table('ruis_partner_new')->where('code',$LIFNR)->value('name');
                }
            }
            $data['bl_number'] = $bl_number;
            //2.第二张表数据，补料原因数据汇总
            $sql = "SELECT
                        rp.name,
                        count( table1.id ) AS num 
                    FROM
                        (
                        SELECT
                            romzoi.id,
                            romzoi.out_machine_zxxx_order_id,
                            substring_index( substring_index( romzoi.qc_reason, ',', b.help_topic_id + 1 ), ',',- 1 ) rpid 
                        FROM
                            ruis_out_machine_zxxx_order_item romzoi
                            LEFT JOIN ruis_out_machine_zxxx_order romzo ON romzoi.out_machine_zxxx_order_id = romzo.id
                            LEFT JOIN ruis_sap_out_picking rsop ON romzo.out_picking_id = rsop.id
                            
                            JOIN mysql.help_topic b ON b.help_topic_id < ( length( romzoi.qc_reason ) - length( REPLACE ( romzoi.qc_reason, ',', '' ) ) + 1 ) 
                        WHERE
                            romzoi.qc_reason != ''";
            if(isset($input['LIFNR']) && $input['LIFNR'])
            {
                $sql .= " AND rsop.LIFNR != 00".input['LIFNR'];
            }
            else
            {
                $sql .= " AND rsop.LIFNR != '' ";
            }
            $start_time = strtotime($input['start_time']);
            $end_time = strtotime($input['end_time']);
            $sql .= " AND romzo.ctime >= $start_time AND romzo.ctime<=$end_time";
            $sql .= "   ) AS table1
                        LEFT JOIN ruis_preselection rp ON table1.rpid = rp.id 
                    GROUP BY
                        rp.name
                    ORDER BY num desc";
            $bl_date = DB::select($sql);
            if($bl_date)
            {
                //获取总数量
                $all_num = array_sum(array_map(function($val){return $val->num;}, $bl_date));
                //计算百分比和累积百分比
                $all_percentage = 0;
                foreach ($bl_date as $bv)
                {
                    $bv->percentage = bcdiv($bv->num,$all_num,4);
                    $all_percentage = bcadd($bv->percentage,$all_percentage,4);
                    //强制100%
                    if($all_percentage>=0.999) $all_percentage = 1;
                    $bv->all_percentage = $all_percentage;
                }

            }
            $data['bl_date'] = $bl_date;
        }
        else//委外车间补料
        {
            $where = $this->blListReportWhere($input,1);
            //1.第一张表数据
            //按补料单位进行分组获取补料次数
            $bl_number = DB::table('ruis_out_machine_shop as roms')
                ->leftJoin('ruis_storage_depot as rsd','roms.depot_id','=','rsd.id')
                ->select('roms.depot_id as line_depot_id','rsd.name')
                ->selectRaw('count(*) as num')
                ->where($where)
                ->groupBy('roms.depot_id')
                ->orderBy('num','desc')
                ->get();
            //获取原因类型
            $reason_id_arr = DB::table('ruis_preselection')->where('name','操作失误')->pluck('id')->toArray();
            //获取操作失误的数据
            if($bl_number)
            {
                $reason_id_str = implode('|',$reason_id_arr);
                $where1 = $this->blListReportWhere($input,2);
                foreach ($bl_number as &$v)
                {
                    $v->sw_num = DB::table('ruis_out_machine_shop as roms')
                        ->leftJoin('ruis_out_machine_shop_item as romsi','roms.id','=','romsi.out_machine_shop_id')
                        ->where($where1)
                        ->where('roms.depot_id',$v->line_depot_id)
                        ->whereRaw('romsi.reason REGEXP \'(^|,)('.$reason_id_str.')(,|$)\'')
                        ->count();
                }
            }
            $data['bl_number'] = $bl_number;

            //2.第二张表数据，补料原因数据汇总
            $sql = "SELECT
                        rp.name,
                        count( table1.id ) AS num 
                    FROM
                        (
                        SELECT
                            romsi.id,
                            romsi.out_machine_shop_id,
                            substring_index( substring_index( romsi.reason, ',', b.help_topic_id + 1 ), ',',- 1 ) rpid 
                        FROM
                            ruis_out_machine_shop_item romsi
                            LEFT JOIN ruis_out_machine_shop roms ON roms.id = romsi.out_machine_shop_id
                            JOIN mysql.help_topic b ON b.help_topic_id < ( length( romsi.reason ) - length( REPLACE ( romsi.reason, ',', '' ) ) + 1 ) 
                        WHERE
                            romsi.reason != ''";
            if(isset($input['line_depot_id']) && !empty($input['line_depot_id']))
            {
                $sql .= " AND roms.depot_id = ".$input['line_depot_id'];
            }
            else
            {
                $sql .= " AND roms.depot_id != ''";
            }

            $sql .= " AND roms.type = 2";
            if($input['repairstatus'] != '' && ($input['repairstatus'] == 0 || $input['repairstatus'] == 1))
            {
                $sql .= " AND roms.repairstatus = ".$input['repairstatus'];
            }
            $start_time = strtotime($input['start_time']);
            $end_time = strtotime($input['end_time']);
            $sql .= " AND roms.ctime >= $start_time AND roms.ctime<=$end_time";
            $sql .= "   ) AS table1
                        LEFT JOIN ruis_preselection rp ON table1.rpid = rp.id 
                    GROUP BY
                        rp.name
                    ORDER BY num desc";
            $bl_date = DB::select($sql);

            if($bl_date)
            {
                //获取总数量
                $all_num = array_sum(array_map(function($val){return $val->num;}, $bl_date));
                //计算百分比和累积百分比
                $all_percentage = 0;
                foreach ($bl_date as $bv)
                {
                    $bv->percentage = bcdiv($bv->num,$all_num,4);
                    $all_percentage = bcadd($bv->percentage,$all_percentage,4);
                    //强制100%
                    if($all_percentage>=0.999) $all_percentage = 1;
                    $bv->all_percentage = $all_percentage;
                }

            }
            $data['bl_date'] = $bl_date;
        }

        return $data;
    }

    public function blListReportWhere($input,$where_type)
    {
        $where = [];
        $type = $input['type'];//补料类型,1-生产补料线边仓 2-生产补料sap 3-生产补料车间 4-委外sap补料
        if($type == '1' && $where_type == 1)
        {
            if(isset($input['work_shop_id']) && $input['work_shop_id'])
            {
                $where[]=['rwo.work_shop_id','=',$input['rwo.work_shop_id']];
            }
            else
            {
                $where[]=['rwo.work_shop_id','!=',''];
            }
        }
        if(($type == '2' ||$type == '3') && $where_type == 1)
        {
            if(isset($input['line_depot_id']) && $input['line_depot_id'])
            {
                $where[]=['rmr.line_depot_id','=',$input['rmr.line_depot_id']];
            }
            else
            {
                $where[]=['rmr.line_depot_id','!=',''];
            }
        }
        elseif($type == '4' && $where_type == 1)
        {
            if(isset($input['LIFNR']) && $input['LIFNR'])
            {
                $where[]=['rsop.LIFNR','=','00'.$input['rmr.LIFNR']];
            }
            else
            {
                $where[]=['rsop.LIFNR','!=',''];
                //$where[]=['rsop.name','!=',''];
            }
        } elseif ($type == '5' && $where_type == 1) {
            if (isset($input['work_shop_id']) && $input['work_shop_id']) {
                $where[] = ['roms.depot_id', '=', $input['roms.depot_id']];
            } else {
                $where[] = ['roms.depot_id', '!=', ''];
            }
        }

        if($type == '1')
        {
            $where[]=['rmr.ctime','>=',strtotime($input['start_time'])];
            $where[]=['rmr.ctime','<=',strtotime($input['end_time'])];
            $where[]=['rmr.type','=',7];
            $where[]=['rmr.push_type','=',0];
            $where[]=['rmr.is_delete','=',0];
            if($input['repairstatus'] != '' && ($input['repairstatus'] == 0 || $input['repairstatus'] == 1))
            {
                $where[]=['rmr.repairstatus','=',$input['repairstatus']];
            }
            $where[]=['rmr.status','=',4];
        }
        elseif ($type == '2')
        {
            $where[]=['rmr.ctime','>=',strtotime($input['start_time'])];
            $where[]=['rmr.ctime','<=',strtotime($input['end_time'])];
            $where[]=['rmr.type','=',7];
            $where[]=['rmr.push_type','=',1];
            $where[]=['rmr.is_delete','=',0];
            if($input['repairstatus'] != '' && ($input['repairstatus'] == 0 || $input['repairstatus'] == 1))
            {
                $where[]=['rmr.repairstatus','=',$input['repairstatus']];
            }
            // $where[]=['rmr.status','=',4];
        }
        elseif ($type == '3')
        {
            $where[]=['rmr.ctime','>=',strtotime($input['start_time'])];
            $where[]=['rmr.ctime','<=',strtotime($input['end_time'])];
            $where[]=['rmr.type','=',7];
            $where[]=['rmr.push_type','=',2];
            $where[]=['rmr.is_delete','=',0];
            if($input['repairstatus'] != '' && ($input['repairstatus'] == 0 || $input['repairstatus'] == 1))
            {
                $where[]=['rmr.repairstatus','=',$input['repairstatus']];
            }
            //$where[]=['rmr.status','=',4];
        }
        elseif($type == '4')
        {
            $where[]=['romzo.time','>=',strtotime($input['start_time'])];
            $where[]=['romzo.time','<=',strtotime($input['end_time'])];
            $where[]=['romzo.type_code','=','ZB03'];
            if($input['repairstatus'] == 0 || $input['repairstatus'] == 1)
            {
                $where[]=['romzo.repairstatus','=',$input['repairstatus']];
            }
        } else {
            $where[] = ['roms.ctime', '>=', strtotime($input['start_time'])];
            $where[] = ['roms.ctime', '<=', strtotime($input['end_time'])];
            if ($input['repairstatus'] == 0 || $input['repairstatus'] == 1) {
                $where[] = ['roms.repairstatus', '=', $input['repairstatus']];
            }
            $where[] = ['roms.type', '=', 2];
        }

        return $where;
    }

    public function updateResonToQcreson($input)
    {
        $type = $input['type'];
        if($type==1)
        {
            $where[]=['rmr.ctime','>=',strtotime($input['start_time'])];
            $where[]=['rmr.ctime','<=',strtotime($input['end_time'])];
            $where[]=['rmr.type','=',7];
            $where[]=['rmr.push_type','=',0];
            $where[]=['rmr.is_delete','=',0];
            $where[]=['rmr.repairstatus','=',1];

            $res = DB::table('ruis_material_requisition as rmr')
                ->leftJoin('ruis_material_requisition_item as rmri','rmr.id','rmri.material_requisition_id')
                ->select('rmri.id','rmri.qc_reason','rmr.declare_id','rmri.material_id')
                ->where($where)
                ->where('rmri.qc_reason','=','')
                ->get();
            if($res)
            {
                foreach ($res as $v)
                {
                    $MKPF_BKTXT = DB::table('ruis_work_declare_order_item')
                        ->where('declare_id',$v->declare_id)
                        ->where('material_id',$v->material_id)
                        ->where('type',1)
                        ->where('MKPF_BKTXT','!=','')
                        ->value('MKPF_BKTXT');
                    DB::table('ruis_material_requisition_item')->where('id',$v->id)->update(['qc_reason'=>$MKPF_BKTXT]);
                }

            }

        }
        elseif($type==2)
        {
//            $where[]=['rmr.ctime','>=',strtotime($input['start_time'])];
//            $where[]=['rmr.ctime','<=',strtotime($input['end_time'])];
//            $where[]=['rmr.type','=',7];
//            $where[]=['rmr.push_type','=',1];
//            $where[]=['rmr.is_delete','=',0];
//            $where[]=['rmr.repairstatus','=',1];
//
//            $res = DB::table('ruis_material_requisition as rmr')
//                ->leftJoin('ruis_material_requisition_item as rmri','rmr.id','rmri.material_requisition_id')
//                ->select('rmri.id','rmri.qc_reason','rmr.declare_id','rmri.material_id')
//                ->where($where)
//                ->where('rmri.qc_reason','=','')
//                ->get();
//
//            pd($res);
        }
        elseif($type==3)
        {
//            $where[]=['rmr.ctime','>=',strtotime($input['start_time'])];
//            $where[]=['rmr.ctime','<=',strtotime($input['end_time'])];
//            $where[]=['rmr.type','=',7];
//            $where[]=['rmr.push_type','=',2];
//            $where[]=['rmr.is_delete','=',0];
//            $where[]=['rmr.repairstatus','=',1];
//
//            $res = DB::table('ruis_material_requisition as rmr')
//                ->leftJoin('ruis_material_requisition_item as rmri','rmr.id','rmri.material_requisition_id')
//                ->select('rmri.id','rmri.qc_reason','rmr.declare_id','rmri.material_id')
//                ->where($where)
//                ->where('rmri.qc_reason','=','')
//                ->get();
//
//            pd($res);
        }
        else
        {

        }
    }



    // 检测工单数据 修改工单
    public function updateWork_picking_status($work_order_ids,$data)
    {
        if (!is_array($work_order_ids)) {
            $work_order_ids = str_split($work_order_ids, strlen($work_order_ids) + 1);
        }
        if(empty($work_order_ids)) return ;
        // 工单需领料物料数量
        $work_material = DB::table('ruis_work_order_item')
            ->select([
                'work_order_id',
                'material_id',
            ])
            ->where([['type','=','0'],])
            ->whereIn('work_order_id',$work_order_ids)
            ->get()->groupby('work_order_id')->toArray();

        // 领料单数据
        $material_requisition = DB::table('ruis_material_requisition'.' as rmr')
            ->leftJoin('ruis_material_received'.' as rmre','rmr.id','=','rmre.material_requisition_id')
            ->select([
                'rmre.work_order_id',
                'rmr.status',
            ])
            ->where([
                ['rmr.is_delete','=','0'],
                ['rmr.status','<','5']
            ])
            ->whereIn('rmre.work_order_id',$work_order_ids)
            ->orderBy('status','asc')->get()->groupby('work_order_id')->toArray();

        // 工单领料数量
        $material_received = DB::table('ruis_material_requisition'.' as rmr')
            ->leftJoin('ruis_material_received'.' as rmre','rmr.id','=','rmre.material_requisition_id')
            ->select([
                'rmre.material_id',
                'rmre.work_order_id',
                'rmre.material_requisition_id'
            ])
            ->where([
                ['rmr.status','<','5'],
                ['rmr.is_delete','=','0']
            ])
            ->whereIn('rmre.work_order_id',$work_order_ids)
            ->get()->groupby('work_order_id')->toArray();
        $material_requisition_item = [];
        foreach ($material_received as $rece_item){
            $mr_id = [];
           foreach ($rece_item as $rece_key=>$rece_val){
               $mr_id[] = $rece_val->material_requisition_id;
           }
            $material_requisition_item[$rece_val->work_order_id] = DB::table('ruis_material_requisition_item')
                ->whereIn('material_requisition_id',$mr_id)
                ->where([
                    ['item_is_delete','=','1'],
                ])
                ->count();
        }

        // 工单退料数量
        $already_return_material = DB::table(config('alias.rrmr'))
            ->select('work_order_id','material_id','qty')
            ->whereIn('work_order_id',$work_order_ids)
            ->groupby('material_id')->get()->groupby('work_order_id')->toArray();

        $update_list= [];
        // 获取修改数据
        foreach ($work_order_ids as $ids){
            // 工单物料未领完
            if($material_received && (count($material_received[$ids])<count($work_material[$ids]))){
                $data['picking_status']='1';
                $update_list[$ids]['id'] = $ids;
                $update_list[$ids]['data'] = $data;
            }
            // 领料单存在 且 状态小于入库状态
            elseif($material_requisition && (isset($material_requisition[$ids][0]) && $material_requisition[$ids][0]->status < '3' )){
                $data['picking_status']='1';
                $update_list[$ids]['id'] = $ids;
                $update_list[$ids]['data'] = $data;
            }
            // 领料单存在 且 状态等于入库状态
            elseif($material_requisition && (isset($material_requisition[$ids][0]) && $material_requisition[$ids][0]->status == '3' )){
                $data['picking_status']='3';
                $update_list[$ids]['id'] = $ids;
                $update_list[$ids]['data'] = $data;
            }
            // 没有领料单 删除单据的情况
            elseif (!$material_received || !$material_requisition){
                $data['picking_status']='0';
                $update_list[$ids]['id'] = $ids;
                $update_list[$ids]['data'] = $data;
            }
            else{
                $data['picking_status']='2';
                $update_list[$ids]['id'] = $ids;
                $update_list[$ids]['data'] = $data;
            }
        }
        // 进行修改
        foreach ($update_list as $item){
            DB::table(config('alias.rwo'))->where('id', $item['id'])->update($item['data']);
        }


    }

    /**
     *  批量发料列表
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiParamException
     */
    public function batchShopdeliverylist($input){

        $mr_ids = explode(',',$input['mr_id']);

        $check = DB::table($this->table)->whereIn('id',$mr_ids)->select('type')->groupby('type')->get()->toArray();
        if(count($check) >= 2) TEPA('请检查单据类型是否一致！');
        $check_status = DB::table($this->table)
            ->where([
                ['status','=',2],
            ])
            ->whereIn('id',$mr_ids)->count();
        if(!$check_status) TEPA('选择单据不符合一键发料！');
        //获取领料单据数据
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_i', 'rsd_i.id', '=', 'rmr.send_depot')
            ->select([
                'rmr.id as mr_id',
                'rmr.code as mr_code',
                'rmr.type',
                'rmr.status',
                'rsd.id as line_depot_id',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rsd_i.id as depot_id',
                'rsd_i.code as depot_code',
                'rsd_i.name as depot_name',
            ])
            ->whereIn('rmr.id',$mr_ids)
            ->get()->groupBy('mr_id');
        /**
         * 获取批次表
         */
        $batch_objs = DB::table(config('alias.rmrib') . ' as rmrib')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.id', '=', 'rmrib.item_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmrib.bom_unit_id')
            ->leftJoin(config('alias.rsi') . ' as rsi', 'rsi.id', '=', 'rmrib.inve_id')
            ->select([
                'rmrib.id as batch_id',
                'rmrib.material_requisition_id as mr_id',
                'rmrib.item_id',
                'rmrib.order',
                'rmrib.batch',
                'rmrib.actual_send_qty',
                'rmrib.base_unit',
                'rmrib.actual_receive_qty',
                'rmrib.bom_unit_id',
                'ruu.commercial as bom_unit',
                'rsi.storage_validate_quantity',
                'rmri.material_id',
                'rmc.code as category_code',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rsi.sale_order_code as sale_order_code',
                'rsi.sales_order_project_code as sales_order_project_code',
            ])
            ->where([
                ['rmri.item_is_delete','=','0']
            ])
            ->whereIn('rmrib.material_requisition_id', $mr_ids)
            ->get();
        $delivery= [];
        foreach ($batch_objs as $key=>$value){
            if(isset($objs[$value->mr_id])){
                // 增加判断条件 待入库的不考虑，库存为0的不考虑 ,已经发料的不考虑
                if($objs[$value->mr_id][0]->status >2 ||  $value->storage_validate_quantity < 1 || $value->actual_receive_qty > 0 )continue;
                $value->mr_code = $objs[$value->mr_id][0]->mr_code;
                $value->type = $objs[$value->mr_id][0]->type;
                $value->status = $objs[$value->mr_id][0]->status;
                $value->line_depot_name = $objs[$value->mr_id][0]->line_depot_name;
                $value->depot_name = $objs[$value->mr_id][0]->depot_name;
            }
            $delivery[] = $value;
        }
        return $delivery;
    }

    // 批量发料重新组装数据
    public function getRequisionItem($input){
        $data = json_decode($input['data'],true);
        $batch_auditing = [];
        foreach ($data as $key=>$value){
            if(isset($batch_auditing[$value['mr_id']])){
                $batch_auditing[$value['mr_id']]['batches'][$key]['batch_id'] = $value['batch_id'];
                $batch_auditing[$value['mr_id']]['batches'][$key]['actual_receive_qty'] = $value['actual_receive_qty'];
            }else{
                $batch_auditing[$value['mr_id']]['material_requisition_id'] = $value['mr_id'];
                $batch_auditing[$value['mr_id']]['status'] = $value['status'];
                $batch_auditing[$value['mr_id']]['type'] = $value['type'];
                $batch_auditing[$value['mr_id']]['batches'][$key]['batch_id'] = $value['batch_id'];
                $batch_auditing[$value['mr_id']]['batches'][$key]['actual_receive_qty'] = $value['actual_receive_qty'];
            }
        }
        return $batch_auditing;
    }



}
