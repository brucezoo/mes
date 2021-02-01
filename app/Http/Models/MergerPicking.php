<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2019/2/14 16:22
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class MergerPicking extends Base
{
    private $lineDepotID = [];  // key --> work_order_id   value -->line_depot_id
    private $mrCode = [];

    public function __construct()
    {
        !$this->table && $this->table = config('alias.rmr');
    }

//region 流程
    /*
    1. 添加流程
     - 选择工单 过滤工单( status => 0/1)
     - 从工单中取物料
     - 验证 物料 --> 是否有仓储地点
     - 取物料    --> 合并统计数量
     - 地点分组 --> 生成领料单

    2. 发料
     - 接受数据
     - 塞数据

    3. 表结构
     - 领料单 WO
     - WO_id MR_id Material_id number


     */
//endregion

//region check

    /**
     * 验证WO是否属于同一个车间
     *
     * @param array $workOrderIDArr
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function checkInOneWorkShop(array $workOrderIDArr)
    {
        if (empty($workOrderIDArr)) {
            TEA(2652, '1');
        }

        $objs = DB::table(config('alias.rwo'))
            ->select([
                'work_shop_id',
                'id',
                'is_sap_picking',
                'number'
            ])
            ->where([
                ['status', '>', 0],
                ['on_off', '=', 1],
                ['is_delete', '=', 0],
            ])
            ->whereIn('id', $workOrderIDArr)
            ->get();
        if (empty($objs)) TEA(2652, '2');

        $workShopIDArr = [];
        foreach ($objs as $value) {
//            if (!in_array($value->number, [0, 1])) {
//                TEPA("工单[$value->number] 已普通领料，无法再合并领料");
//            }
            $workShopIDArr[] = $value->work_shop_id;
        }

        if (count(array_unique($workShopIDArr)) > 1) {
            TEA(2652, 3);
        }
    }

    /**
     * 验证所有的物料的仓储地点是否存在
     *
     * @param array $workOrderIDArr
     * @throws \App\Exceptions\ApiParamException
     * @throws \App\Exceptions\ApiException
     */
    public function checkHasDepot(array $workOrderIDArr)
    {
        $objs = DB::table(config('alias.rwoi') . ' as rwoi')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rwoi.work_order_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rwo.factory_id')
            ->leftJoin(config('alias.ramc') . ' as ramc', [['ramc.WERKS', '=', 'rf.code'], ['rwoi.material_id', '=', 'ramc.material_id']])
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rwoi.material_id')
            ->select([
                'rwoi.material_id',
                'rwoi.material_code',
                'rwoi.LGPRO',
                'rwoi.LGFSB',
                'ramc.LGPRO as LGPRO1',
                'ramc.LGFSB as LGFSB1',
            ])
            ->where([
                ['rwo.status', '>', 0],
                ['rwo.on_off', '=', 1],
                ['rwo.is_delete', '=', 0],
                ['rwoi.type', '=', 0],
                ['rm.lzp_identity_card', '=', '']
            ])
            ->whereIn('rwoi.work_order_id', $workOrderIDArr)
            ->get();
        if (empty(obj2array($objs))) {
            TEA(2653);
        }
        foreach ($objs as $value) {
            if (empty($value->LGPRO) && empty($value->LGFSB) && empty($value->LGPRO1) && empty($value->LGFSB1)) {
                TEPA('物料 ' . $value->material_code . ' 的仓储地点缺失');
            }
        }
    }

    /**
     * 验证 所有参与合并的工单 都需发料
     * @param array $workOrderIDArr
     * @author Bruce.Chu
     */
    public function checkHasSendMaterial(array $workOrderIDArr)
    {
        foreach ($workOrderIDArr as $work_order_id){
            $work_order_code=$this->getFieldValueById($work_order_id,'number',config('alias.rwo'));
            $has_send_material=DB::table(config('alias.rmre'))
                ->where('work_order_id',$work_order_id)
                ->value('qty');
            if(isset($has_send_material) && $has_send_material==0.0) TEPA('工单'.$work_order_code.'正在等待发料');
        }
    }

    /**
     * 验证 添加 的参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function checkStoreParams(&$input)
    {
        if (empty($input['employee_id'])) TEA('700', 'employee_id');
        $has = $this->isExisted([['id', '=', $input['employee_id']]], config('alias.re'));
        if (!$has) TEA('700', 'employee_id');

        $workOrderIDArr = explode(',', $input['work_order_ids']);

        $input['line_depot_id'] = $this->getLineDepotID($workOrderIDArr[0]);
        $obj = DB::table(config('alias.rwo'))
            ->select([
                'factory_id',
                'work_shop_id'
            ])
            ->where('id', $workOrderIDArr[0])
            ->first();
        $input['factory_id'] = $obj->factory_id;
        $input['work_shop_id'] = $obj->work_shop_id;
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }
//end region

//region Add
    /**
     * 获取
     *
     * @param array $workOrderIDArr
     * @return array
     */
    public function getStoreData(array $workOrderIDArr): array
    {
        $objs = DB::table(config('alias.rwoi') . ' as rwoi')
            ->leftJoin(config('alias.rwo') . ' as wo', 'wo.id', '=', 'rwoi.work_order_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rwoi.material_id')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->select([
                'rwoi.work_order_id',
                'rwoi.material_id',
                'wo.status',
                'rm.name as material_name',
                'rmc.no_plan_picking',
                'rwoi.bom_unit_id as unit_id',
                'rwoi.bom_commercial as unit',
                'rwoi.qty',
                'rwoi.special_stock',
                'rwoi.LGPRO',
                'rwoi.LGFSB',
            ])
            ->whereIn('rwoi.work_order_id', $workOrderIDArr)
            ->where([
                ['rwoi.type', '=', 0],
                ['rm.lzp_identity_card', '=', ''],
                ['rmc.warehouse_management','<>',1]//物料分类为线边仓管理的物料 不参与合并 Add By Bruce.Chu
            ])
            ->get();
        // 根据物料地点 分组 depot_code
        $stockDepot = [];
        foreach ($objs as &$obj) {
            //该工单下的物料已领数目
            $availableNumber = $this->getAvailableNumber($obj->work_order_id, $obj->material_id);

            //当前可以领数量
            $obj->now_qty = $obj->qty - $availableNumber;
//            return [$obj->qty,$availableNumber,$obj->now_qty];
            if ($obj->now_qty <= 0) {
                unset($obj);
                continue;
            }
            //若工单下来之前 主数据有问题 去物料拿地点
            $obj->depot = $this->getDepot($obj->LGPRO, $obj->LGFSB, $obj->work_order_id, $obj->material_id);

            $tempKey = $obj->depot;
            $tempArr = [
                'work_order_id' => $obj->work_order_id,
                'status' => $obj->status,
                'material_id' => $obj->material_id,
                'material_name' => $obj->material_name,
                'now_qty' => $obj->now_qty,
                'unit_id' => $obj->unit_id,
                'unit' => $obj->unit,
                'depot' => $obj->depot,
                'special_stock' => $obj->special_stock
            ];
            //主排工单 非计划性领料
            if ($obj->status == 1) $tempArr['no_plan_picking'] = $obj->no_plan_picking;

            $stockDepot[$tempKey][] = $tempArr;
        }
        //判断是否可领 Add By Bruce.Chu
        if(empty($stockDepot)) TEA('2415');
        $stockMaterial = [];    // key --> is_special_stock-material value --> 物料
        foreach ($stockDepot as $v) {
            foreach ($v as $value) {
                $tempKey = (empty($value['special_stock']) ? 0 : 1) . '-' . $value['material_id'];
                if (empty($stockMaterial[$tempKey])) {
                    $stockMaterial[$tempKey] = [
                        'work_order_id' => $value['work_order_id'],
                        'status' => $value['status'],
                        'material_id' => $value['material_id'],
                        'material_name' => $value['material_name'],
                        'unit_id' => $value['unit_id'],
                        'unit' => $value['unit'],
                        'depot' => $value['depot'],
                        'special_stock' => $value['special_stock'],
                        'count' => $value['now_qty'],
                    ];
                    if (isset($value['no_plan_picking'])) $stockMaterial[$tempKey]['no_plan_picking'] = $value['no_plan_picking'];
                } else {
                    $stockMaterial[$tempKey]['count'] += $value['now_qty'];
                    //保留1位小数 Add By Bruce.Chu
                    $stockMaterial[$tempKey]['count'] = round($stockMaterial[$tempKey]['count'], 1);
                }
            }
        }

        //筛掉小于0.1数量的物料 不知为什么 过滤一位小数 还会有出现 也不知为什么可领<=0已经过滤 还是出现 数据库字段是1位小数点 Add By Bruce.Chu
        $stockMaterial=array_filter($stockMaterial,function ($value){
            return $value['count']>=0.1;
        });
        //判断是否可领 Add By Bruce.Chu
        if(empty($stockMaterial)) TEA('2415');
        foreach ($stockMaterial as $value) {
            if (empty($depot[$value['depot']])) {
                $depot[$value['depot']] = [
                    'depot' => $value['depot'],
                    'materials' => [$value],
                ];
            } else {
                $depot[$value['depot']]['materials'][] = $value;
            }


        }

        return array_values($depot);
    }



    /**
     * 如果采购仓库为空，则使用生产仓储
     *
     * @param string $produceDepot
     * @param string $saleDepot
     * @param integer $workOrderID
     * @param integer $materialID
     * @return string
     */
    private function getDepot(string $produceDepot, string $saleDepot, $workOrderID, $materialID): string
    {
        $depot = empty($saleDepot) ? $produceDepot : $saleDepot;
        if (!empty($depot)) {
            return $depot;
        }

        $obj = DB::table(config('alias.ramc') . ' as ramc')
//            ->leftJoin(config('alias.ramc') . ' as ramc', [['ramc.WERKS', '=', 'rf.code'],['rwo']])
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.code', '=', 'ramc.WERKS')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.factory_id', '=', 'rf.id')
            ->select([
                'ramc.LGPRO',
                'ramc.LGFSB',//采购仓储地点
            ])
            ->where([
                ['rwo.status', '>', 0],
                ['rwo.on_off', '=', 1],
                ['rwo.is_delete', '=', 0],
                ['rwo.id', '=', $workOrderID],
                ['ramc.material_id', '=', $materialID]
            ])
            ->first();
        return empty($obj->LGFSB) ? empty($obj->LGPRO) ? '' : $obj->LGPRO : $obj->LGFSB;
    }

    /**
     * 获取当前可领取数量
     *
     * @param int $workOrderID
     * @param int $materialID
     * @return int
     */
    private function getAvailableNumber($workOrderID, $materialID)
    {
        if (empty($workOrderID) || empty($materialID)) {
            return 0;
        }
        $number = DB::table(config('alias.rmre'))
            ->where([
                ['work_order_id', '=', $workOrderID],
                ['material_id', '=', $materialID]
            ])
            ->sum('qty');
        return empty($number) ? 0 : $number;
    }

    /**
     * 保存
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function store(array $input): array
    {
        $workOrderIDArr = explode(',', $input['work_order_ids']);
        $objs = DB::table(config('alias.rwoi') . ' as rwoi')
            ->leftJoin(config('alias.rwo') . ' as wo', 'wo.id', '=', 'rwoi.work_order_id')
            ->leftJoin(config('alias.rpo') . ' as po', 'po.id', '=', 'wo.production_order_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rwoi.material_id')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->select([
                'wo.status',
                'po.sales_order_code',
                'rmc.no_plan_picking',
                'rwoi.work_order_id',
                'rwoi.work_order_code',
                'rwoi.material_id',
                'rwoi.material_code',
                'rwoi.bom_unit_id as unit_id',
                'rwoi.bom_commercial as unit',
                'rwoi.qty',     //进料数量
                'rwoi.special_stock',
                'rwoi.LGPRO',
                'rwoi.LGFSB',
            ])
            ->whereIn('rwoi.work_order_id', $workOrderIDArr)
            ->where([
                ['rwoi.type', '=', 0],
                ['rm.lzp_identity_card', '=', '']
            ])
            ->get();
        //存储工单号
        $workOrderCode = [];
        // 根据物料地点 分组 depot_code
        $stockDepot = [];
        foreach ($objs as &$obj) {
            //该工单下的物料已领数目
            $availableNumber = $this->getAvailableNumber($obj->work_order_id, $obj->material_id);
            //当前可以领数量
            $obj->now_qty = $obj->qty - $availableNumber;
            if ($obj->now_qty <= 0) {
                unset($obj);
                continue;
            }
            //若是主排工单 只有是非计划性物料才可以领料 Add By Bruce.Chu
            if($obj->status==1 && $obj->no_plan_picking==1){
                unset($obj);
                continue;
            }
            $obj->depot = $this->getDepot($obj->LGPRO, $obj->LGFSB, $obj->work_order_id, $obj->material_id);

            $tempKey = $obj->depot;
            $stockDepot[$tempKey][] = [
                'work_order_id' => $obj->work_order_id,
                'material_id' => $obj->material_id,
                'material_code' => $obj->material_code,
                'now_qty' => $obj->now_qty,
                'qty' => $obj->qty,
                'unit_id' => $obj->unit_id,
                'unit' => $obj->unit,
                'depot' => $obj->depot,
                'special_stock' => $obj->special_stock
            ];

            $workOrderCode[] = $obj->work_order_code;
        }
        //判断是否可领 Add By Bruce.Chu
        if(empty($stockDepot)) TEA('2415');
        $stockMaterial = [];    // key --> is_special_stock-material value --> 物料
        foreach ($stockDepot as $k => $v) {
            foreach ($v as $value) {
                $tempKey = (empty($value['special_stock']) ? 0 : 1) . '-' . $value['material_id'];
                if (empty($stockMaterial[$tempKey])) {
                    $stockMaterial[$tempKey] = [
                        'work_order_id' => $value['work_order_id'],
                        'material_id' => $value['material_id'],
                        'material_code' => $value['material_code'],
                        'unit_id' => $value['unit_id'],
                        'unit' => $value['unit'],
                        'depot' => $value['depot'],
                        'qty' => $value['qty'],     //进料-即原需求数量
                        'now_qty' => $value['now_qty'], //当前需求数量
                        'special_stock' => $value['special_stock'],
                        'count' => $value['now_qty'],
                    ];
                } else {
                    $stockMaterial[$tempKey]['count'] += $value['now_qty'];
                }
            }
        }
        //筛掉小于0.1数量的物料 不知为什么 过滤一位小数 还会有出现 也不知为什么可领<=0已经过滤 还是出现 数据库字段是1位小数点 Add By Bruce.Chu
        $stockMaterial=array_filter($stockMaterial,function ($value){
            return $value['count']>=0.1;
        });
        //判断是否可领 Add By Bruce.Chu
        if(empty($stockMaterial)) TEA('2415');
        //MR表通用
        $commonMRKeyVal = [
            'type' => 1,
            'push_type' => 1,
            'factory_id' => get_value_or_default($input, 'factory_id', 0),
            'work_shop_id' => get_value_or_default($input, 'work_shop_id', 0),
            'line_depot_id' => $input['line_depot_id'],
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'sale_order_code' => get_value_or_default($input, 'sales_order_code', ''),
            'sale_order_project_code' => get_value_or_default($input, 'sales_order_project_code', ''),
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 1,   // 如果SAP领料
            'creator_id' => $input['creator_id'],
            'is_merger_picking' => 1,
            'dispatch_time' => $input['date']
        ];

        //一个工单合并领料时 展示生产订单号 工位号 工单号 SO Add By Bruce.Chu
        if (count($workOrderIDArr) == 1) {
            $input['work_order_id'] = $workOrderIDArr[0];
            //拿PO生产订单号 id
            (new MaterialRequisition())->getProductOrder($input);
            $commonMRKeyVal['work_order_id'] = $workOrderIDArr[0];
            $commonMRKeyVal['product_order_code'] = $input['product_order_code'];
            $commonMRKeyVal['product_order_id'] = $input['product_order_id'];
            $commonMRKeyVal['sale_order_code'] = $input['sales_order_code'];
            $commonMRKeyVal['sale_order_project_code'] = $input['sales_order_project_code'];
            //工位号
            $commonMRKeyVal['workbench_id'] = $this->getFieldValueById($workOrderIDArr[0], 'work_shift_id', config('alias.rwo'));
        }

        foreach ($stockMaterial as $key => $value) {
            $depot[$value['depot']][] = $value;
        }
        $sendDepotMR = [];  // key:send_depot  value:MR_ID
//        return [$stockDepot,$stockMaterial,$depot];
        try {
            DB::connection()->beginTransaction();

            //MR
            $tempItemInsertArr = [];    //保存item表插入的数据
//            $insert_array=[];
            foreach ($depot as $key => $value) {
                $sendDepot = $key;
                $commonMRKeyVal['send_depot'] = $sendDepot;
                $commonMRKeyVal['code'] = $this->createCode();

                $MR_ID = DB::table(config('alias.rmr'))->insertGetId($commonMRKeyVal);
                $sendDepotMR[$sendDepot] = $MR_ID;

                $i = 1;     //用于生成行项目号
                foreach ($value as $v) {
                    //插入工单的领料记录(对应领料单) Add By Bruce.Chu
//                    $insert_array[]=[
//                        'work_order_id'=>$v['work_order_id'],
//                        'material_id'=>$v['material_id'],
//                        'material_requisition_id'=>$MR_ID,
//                        'ctime'=>time(),
//                        'status'=>1,
//                        'type'=>1
//                    ];
                    $tempItemInsertArr[] = [
                        'material_requisition_id' => $MR_ID,
                        'line_project_code' => $this->createLineCode($i),
                        'material_id' => $v['material_id'],
                        'material_code' => $v['material_code'],
//                        'demand_qty' => $v['now_qty'],
                        'demand_qty' => round($v['count'],1),//合并领料总数量汇总 Add By Bruce.Chu
//                        'rated_qty' => $v['qty'],
                        'rated_qty' => round($v['count'],1),//合并领料总数量汇总 Add By Bruce.Chu
                        'demand_unit_id' => $v['unit_id'],
                        'send_status' => 1,
                        'reason' => get_value_or_default($value, 'reason', ''),
                        'remark' => get_value_or_default($value, 'remark', ''),
                        'is_special_stock' => $v['special_stock']
                    ];
                    $i++;
                }
            }

            //插入工单与领料单关系表
//            DB::table(config('alias.rmrw'))->insert($insert_array);

            DB::table(config('alias.rmri'))->insert($tempItemInsertArr);

            // 插入到RMRE表
            $tempRMREKeyVal = [];
            foreach ($stockDepot as $key => $value) {
                $MR_ID = $sendDepotMR[$key];
                foreach ($value as $v) {
                    $tempRMREKeyVal[] = [
                        'work_order_id' => $v['work_order_id'],
                        'material_id' => $v['material_id'],
                        'material_code' => $v['material_code'],
                        'unit_id' => $v['unit_id'],
                        'qty' => 0,
//                        'rated_qty' => $v['qty'],
                        'rated_qty' => $v['now_qty'],//领料数量 Add By Bruce.Chu
                        'material_requisition_id' => $MR_ID,
                        'special_stock' => $v['special_stock'],
                        'ctime' => time()
                    ];
                }
            }
            DB::table(config('alias.rmre'))->insert($tempRMREKeyVal);

            //更新WO状态
            DB::table(config('alias.rwo'))->whereIn('number', $workOrderCode)->update(['is_sap_picking' => 1, 'picking_status' => 1]);

        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }
        DB::connection()->commit();
        return array_values($sendDepotMR);

    }

    /**
     * 获取线边仓
     *
     * @param int $workOrderID
     * @return int
     * @throws \App\Exceptions\ApiParamException
     */
    private function getLineDepotID(int $workOrderID): int
    {
        if (isset($this->lineDepotID[$workOrderID])) {
            return $this->lineDepotID[$workOrderID];
        }
        // wo->workshop->depot
        $obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', '=', 'rwo.work_shop_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.code', '=', 'rws.address')
            ->select([
                'rsd.id as line_depot_id',
                'rwo.id as work_order_id',
            ])
            ->where('rwo.id', $workOrderID)
            ->first();
        if (empty($obj->line_depot_id)) {
            TEPA("该工单 $obj->work_order_id 所对应的线边仓不存在");
        }
        $this->lineDepotID[$workOrderID] = $obj->line_depot_id;
        return $obj->line_depot_id;
    }

    /**
     * 生成一个行项目号
     *
     * @param int $i
     * @return string
     */
    private function createLineCode(int $i): string
    {
        return str_pad($i, 5, '0', STR_PAD_LEFT);
    }

    /**
     * @param int $type
     * @return string
     */
    private function createCode(int $type = 1): string
    {
        $timeStr = date('YmdHis');
        //应SAP要求,领料单code为20位 这里改成1-99随机数 Modify By Bruce.Chu
        $code = 'MER' . $type . $timeStr . str_pad(rand(1, 99), 2, '0', STR_PAD_LEFT);
        while (in_array($code, $this->mrCode)) {
            $code = 'MER' . $type . $timeStr . str_pad(rand(1, 99), 2, '0', STR_PAD_LEFT);
        }
        ($this->mrCode)[] = $code;
        return $code;
    }
//endregion

//region Delete
//endregion

//region Update

    /**
     * @param int $MR_ID
     * @param string $material_code
     * @param float $qty
     * @param int $batch_id
     */
    public function backFill(int $MR_ID, string $material_code, float $qty,int $batch_id,string $is_special_stock,string $sales_order_code,string $sales_order_project_code)
    {
        $where = [
            ['rmre.material_code', '=', $material_code],
            ['rmre.material_requisition_id', '=', $MR_ID],
            ['rmre.special_stock','=',$is_special_stock],
        ];
        if(!empty($is_special_stock)){
            $where[] = ['rpo.sales_order_code','=',$sales_order_code];
            $where[] = ['rpo.sales_order_project_code','=',$sales_order_project_code];
        }
        $objs = DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rwo').' as rwo','rmre.work_order_id','rwo.id')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
            ->select([
                'rmre.id',
                'rmre.qty',
                'rmre.rated_qty',
                'rmre.material_code',
                'rmre.material_id',
                'rmre.work_order_id',
                'rmre.special_stock',
                'rmre.unit_id',
                'rpo.sales_order_project_code',
                'rpo.sales_order_code',
            ])
            ->where($where)
            ->get();
        if (empty(obj2array($objs))) {
            return;
        }
        //因为要加上销售订单号和销售订单行项号去把料分配到工单上去，所以要查出工单的销售订单号和享受行项号
//        $wo_ids = [];
//        foreach ($objs as $k=>$v){
//            if(!in_array($v->work_order_id,$wo_ids)) $wo_ids[] = $v->work_order_id;
//        }
//        $wo_list = DB::table(config('alias.rwo').' as rwo')
//            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
//            ->select('rwo.id as work_order_id','rpo.sales_order_code','rpo.sales_order_project_code','rwo.factory_id')
//            ->whereIn('rwo.id',$wo_ids)
//            ->get();
//        $ref_wo_list = [];
//        foreach ($wo_list as $k=>$v){
//            $ref_wo_list[$v->work_order_id] = $v;
//        }
        $updateArr = [];
        $insert_arr = [];
        $final_arr = [];
        $final_insert_arr = [];
        $sum_qty = $qty;

        foreach ($objs as $obj) {
            if ($obj->rated_qty <= 0) {
                continue;
            }
            //第一个批次发料未到达额定，第二批次发料时，第一个工单记录的需求数量需要重新计算
            if ($obj->qty < $obj->rated_qty) {
                $obj->rated_qty = $obj->rated_qty - $obj->qty;
            }else{
                $final_arr = [
                    'id' => $obj->id,
                    'qty' => $obj->qty,
                ];
                $final_insert_arr =[
                    'work_order_id'=>$obj->work_order_id,
                    'material_id'=>$obj->material_id,
                    'material_requisition_id'=>$MR_ID,
                    'qty'=>$sum_qty,
                    'batch_id'=>$batch_id,
                    'ctime'=>time(),
                ];
                continue;
            }

            /**
             * 物料为特殊库存的处理方式,当领到的料为特殊库存的时候，需要判断当前这条工单领料记录的工单上的销售订单号和销售订单行项号
             * 是否和领到的料的销售订单号，销售订单行项号相同，如果不同则跳出，不往这条工单领料记录分配料，
             * 如果相同就代表符合条件，则开始分配料，因为工单会被拆细，所以也要循环处理
             */
            if(!empty($is_special_stock) &&  ($obj->sales_order_code != $sales_order_code || $obj->sales_order_project_code != $sales_order_project_code)) continue;
            // 总的数量剩余数量大于额定数量
            if ($sum_qty > $obj->rated_qty) {
                $updateArr[] = [
                    'id' => $obj->id,
                    'qty' => $obj->qty + $obj->rated_qty,
                ];
                //做工单物料与批次关系表的记录
                $insert_arr[]=[
                    'work_order_id'=>$obj->work_order_id,
                    'material_id'=>$obj->material_id,
                    'material_requisition_id'=>$MR_ID,
                    'qty'=>$obj->rated_qty,
                    'batch_id'=>$batch_id,
                    'ctime'=>time(),
                ];
                $sum_qty -= $obj->rated_qty;
            } else {
//                $sum_qty = 0;
                $updateArr[] = [
                    'id' => $obj->id,
                    'qty' => $obj->qty + $sum_qty,
                ];
                $insert_arr[]=[
                    'work_order_id'=>$obj->work_order_id,
                    'material_id'=>$obj->material_id,
                    'material_requisition_id'=>$MR_ID,
                    'qty'=>$sum_qty,
                    'batch_id'=>$batch_id,
                    'ctime'=>time(),
                ];
                $sum_qty = 0;
                break;  //剩余数量 不够最后一个了
            }
        }

        // 最后一个排完后仍有剩余，所剩的需要给最后一个
        if (!empty($updateArr) && $sum_qty > 0) {
            $lastKeyVal = array_pop($updateArr);
            $lastKeyVal['qty'] += $sum_qty;
//            $sum_qty = 0;
            $updateArr[] = $lastKeyVal;
            $last_element=array_pop($insert_arr);
            $last_element['qty'] += $sum_qty;
            $insert_arr[]=$last_element;
        }else if(empty($updateArr) && $sum_qty > 0){
            $updateArr[] = [
                'id' => $final_arr['id'],
                'qty' => $final_arr['qty'] + $sum_qty,
            ];
            $insert_arr[] = $final_insert_arr;
        }
        foreach ($updateArr as $value) {
            DB::table(config('alias.rmre'))->where('id', $value['id'])->update(['qty' => $value['qty']]);
        }
        if(!empty($insert_arr)) DB::table(config('alias.rmrw'))->insert($insert_arr);
    }

    public function backFilldistribution(int $MR_ID, string $material_code, float $qty,int $batch_id,string $is_special_stock,string $sales_order_code,string $sales_order_project_code)
    {
        $where = [
            ['rmre.material_code', '=', $material_code],
            ['rmre.material_requisition_id', '=', $MR_ID],
            ['rmre.special_stock','=',$is_special_stock],
        ];
        if(!empty($is_special_stock)){
            $where[] = ['rpo.sales_order_code','=',$sales_order_code];
            $where[] = ['rpo.sales_order_project_code','=',$sales_order_project_code];
        }
        $objs = DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rwo').' as rwo','rmre.work_order_id','rwo.id')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
            ->select([
                'rmre.id',
                'rmre.qty',
                'rmre.rated_qty',
                'rmre.material_code',
                'rmre.material_id',
                'rmre.work_order_id',
                'rmre.special_stock',
                'rmre.unit_id',
                'rpo.sales_order_project_code',
                'rpo.sales_order_code',
            ])
            ->where($where)
            ->get();
        if (empty(obj2array($objs))) {
            return;
        }
        // 需求总数
        $m_rated_qty = DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rwo').' as rwo','rmre.work_order_id','rwo.id')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
            ->where($where)
            ->sum('rmre.rated_qty');
        // 获取已经领的数量
        $m_qty = DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rwo').' as rwo','rmre.work_order_id','rwo.id')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
            ->where($where)
            ->sum('rmre.qty');
        $updateArr = [];
        $insert_arr = [];
        $sum_qty = $qty+$m_qty; // sap发料数量
        $Record_qty = 0;// 记录数量
        $Recordrw_qty = 0;// 记录数量

        foreach ($objs as $obj) {

            if ($obj->rated_qty <= 0) {
                continue;
            }
            /**
             * 物料为特殊库存的处理方式,当领到的料为特殊库存的时候，需要判断当前这条工单领料记录的工单上的销售订单号和销售订单行项号
             * 是否和领到的料的销售订单号，销售订单行项号相同，如果不同则跳出，不往这条工单领料记录分配料，
             * 如果相同就代表符合条件，则开始分配料，因为工单会被拆细，所以也要循环处理
             */
            if(!empty($is_special_stock) &&  ($obj->sales_order_code != $sales_order_code || $obj->sales_order_project_code != $sales_order_project_code)) continue;

            // 获取比例值
            $Proportion_qty = sprintf("%.3f",substr(sprintf("%.4f", $obj->rated_qty/$m_rated_qty), 0, -1));
            // 根据比例值获取分配数量
            $Actual_qty = sprintf("%.3f",substr(sprintf("%.4f", $Proportion_qty*$sum_qty), 0, -1));
            // 根据比例获取入库数量, 使每个批次的数据雨露均沾，都有分配给工单上
            $rmrw_qty = sprintf("%.3f",substr(sprintf("%.4f", $Proportion_qty*$qty), 0, -1));
            // 添加工单合并记录表数据
            $insert_arr[]=[
                'work_order_id'=>$obj->work_order_id,
                'material_id'=>$obj->material_id,
                'material_requisition_id'=>$MR_ID,
                'qty'=>$rmrw_qty,
                'batch_id'=>$batch_id,
                'ctime'=>time(),
            ];
            // 添加合并记录表数据
            $updateArr[] = [
                'id' =>$obj->id,
                'qty'=>$Actual_qty,
            ];

            //  记录添加数据
            $Record_qty += $Actual_qty;
            $Recordrw_qty += $rmrw_qty;
        }

        // 取值最后一个
        $lastKeyVal = array_pop($updateArr);
        // 总数量-（记录数量-最后一个单据分配数量）
        $lastKeyVal['qty'] = $sum_qty-($Record_qty-$lastKeyVal['qty']);
        $updateArr[] = $lastKeyVal;

        // 取值最后一个
        $lastarr = array_pop($insert_arr);
        // 总数量-（记录数量-最后一个单据分配数量）
        $lastarr['qty'] = $qty-($Recordrw_qty-$lastarr['qty']);
        $insert_arr[] = $lastarr;

        foreach ($updateArr as $value) {
            DB::table(config('alias.rmre'))->where('id', $value['id'])->update(['qty' => $value['qty']]);
        }
        foreach ($insert_arr as $values) {
            // 检测是否存在
            $count = DB::table(config('alias.rmrw'))->where([
                ['work_order_id','=',$values['work_order_id']],
                ['material_id','=',$values['material_id']],
                ['material_requisition_id','=',$values['material_requisition_id']],
                ['batch_id','=',$values['batch_id']],
            ])->count();
            // 存在修改，不存在则添加
            if($count){
                DB::table(config('alias.rmrw'))->where([
                    ['work_order_id','=',$values['work_order_id']],
                    ['material_id','=',$values['material_id']],
                    ['material_requisition_id','=',$values['material_requisition_id']],
                    ['batch_id','=',$values['batch_id']],
                ])->update(['qty' => $values['qty']]);
            }else{
                DB::table(config('alias.rmrw'))->insert($values);
            }
        }

//        if(!empty($insert_arr)) DB::table(config('alias.rmrw'))->insert($insert_arr);
    }

//endregion

//region Select

    /**
     * 列表
     *
     * @param array $input
     * @return array
     */
    public function pageIndex(array &$input)
    {
        $where = [];
        $where[] = ['rmr.is_delete', '=', 0];
        $where[] = ['rmr.push_type', '=', 1];
        $where[] = ['rmr.type', '=', 1];
        $where[] = ['rmr.is_merger_picking', '=', 1];

        $where3 = [];

        if (!empty($input['code'])) $where[] = ['rmr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['status']) && in_array($input['status'], [1, 2, 3, 4])) $where[] = ['rmr.status', '=', $input['status']];
//        if (!empty($input['work_order_code'])) $where[] = ['rwo.number', 'like', '%' . $input['work_order_code'] . '%'];
        if (!empty($input['work_order_code'])) $where3[] = ['wo.number', 'like', '%' . $input['work_order_code'] . '%'];
//        if (!empty($input['product_order_code'])) $where[] = ['rmr.product_order_code', 'like', '%' . $input['product_order_code'] . '%'];
        if (!empty($input['product_order_code'])) $where3[] = ['po.number', 'like', '%' . $input['product_order_code'] . '%'];
        if (!empty($input['line_depot_id'])) $where[] = ['rmr.line_depot_id', '=', $input['line_depot_id']];
        if (!empty($input['workbench_id'])) $where[] = ['rmr.workbench_id', '=', $input['workbench_id']];
        if (!empty($input['employee_name'])) $where[] = ['re.name', 'like', '%' . $input['employee_name'] . '%'];
        if (!empty($input['inspur_material_code'])) $where[] = ['rpo.inspur_material_code', 'like', '%' . $input['inspur_material_code'] . '%'];
        if (!empty($input['inspur_sales_order_code'])) $where[] = ['rpo.inspur_sales_order_code', 'like', '%' . $input['inspur_sales_order_code'] . '%'];
        if (!empty($input['is_depot_picking'])) $where[] = ['rmr.is_depot_picking', '=', 1];
        if (!empty($input['send_depot'])) $where[] = ['rmr.send_depot', '=', $input['send_depot']];  // 添加采购仓储地搜索条件  shuaijie.feng

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
        if (!empty($emploee_info)) {
            if ($admin_is_super != 1) {
                if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                    $where[] = ['rmr.factory_id', '=', $emploee_info->factory_id];//区分到厂
                } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                    $where[] = ['rmr.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                }
            }
        }

        $builder = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
//            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
//            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rmr.product_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
            ->select([
                'rmr.id as material_requisition_id',
                'rmr.code as code',
                'rmr.time',
                'rmr.ctime',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.status',
//                'rmr.product_order_code',
//                'rmr.sale_order_code',
//                'rmr.sale_order_project_code',
                'rmr.send_depot',
                'rmr.is_depot_picking',
                'rmr.dispatch_time',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
//                'rwo.number as work_order_code',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rsd.id as line_depot_id',
                'rsd_s.code as send_depot_code',
                'rsd_s.name as send_depot_name',
                'rsd_s.id as send_depot_id',
//                'rpo.inspur_sales_order_code',
            ])
            ->where($where);
        if(empty($where3)) $builder->offset(($input['page_no']-1)*$input['page_size'])
        ->limit($input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('rmr.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        $obj_list = obj2array($obj_list);

        foreach ($obj_list as $k => &$v) {
            $v['ctime'] = date('Y-m-d H:i:s', $v['ctime']);
            $v['dispatch_time'] = date('Y-m-d H:i:s', $v['dispatch_time']);
            if ($v['push_type'] != 1) {
                $v['send_depot'] = '';
            }

            if ($v['push_type'] != 2) {
                $v['send_depot_code'] = '';
                $v['send_depot_name'] = '';
            }

            //合并领料单查出 工单号和生产订单号 Add By Bruce.Chu
            $wo_po = DB::table(config('alias.rmre') . ' as rmre')
                ->leftJoin(config('alias.rwo') . ' as wo', 'wo.id', 'rmre.work_order_id')
                ->leftJoin(config('alias.rpo') . ' as po', 'po.id', 'wo.production_order_id')
                ->where('rmre.material_requisition_id', $v['material_requisition_id'])
                ->where($where3)
                ->distinct('wo.number')
                ->get(['wo.number as work_order_code', 'po.number as product_order_code', 'po.sales_order_code','po.sales_order_project_code', 'po.inspur_material_code']);
            $v['wo_po'] = obj2array($wo_po);
            //匹配搜索功能
            if (empty($v['wo_po'])) unset($obj_list[$k]);
        }
        //如果按po wo号搜索 不限制一页行数 因为领料单:工单=n:n 做不了直接leftJoin 并兼容之前的列表显示
        if(empty($where3)){
            //总共有多少条记录
            $count_builder= DB::table($this->table.' as rmr')
                ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
                ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
                ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
                ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
                ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
                ->where($where);
            $input['total_records']=$count_builder->count();
        }else{
            $input['total_records'] =count($obj_list);
        }
        return array_values($obj_list);
    }
//endregion

}