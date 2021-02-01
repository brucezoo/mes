<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 2019/4/10 10:42
 * Desc:
 */

namespace App\Http\Models;


use App\Libraries\Soap;
use Illuminate\Support\Facades\DB;

class MergerReturnMaterial extends Base
{
    private $mrCode = [];

    public function __construct()
    {
        !$this->table && $this->table = config('alias.rmr');
    }

    /**
     * 合并退料工单列表
     * @param array $input
     * @return mixed
     */
    public function getWorkOrdersMaterialList(array &$input)
    {
        //和sap库管敲定，只有大于1的料才能退
        $where[] = ['rsi.storage_validate_quantity', '>=', 1];
        $where[] = ['rm.lzp_identity_card', '=', ''];
        //$where[] = ['rsi.wo_number', '<>', ''];
        !empty($input['sales_order_code']) &&  $where[]=['rsi.sale_order_code','like', '%' . $input['sales_order_code'] . '%'];
        !empty($input['sales_order_project_code']) &&  $where[]=['rsi.sales_order_project_code','like', '%' . $input['sales_order_project_code'] . '%'];//销售订单行项目号
        !empty($input['production_order_number']) &&  $where[]=['rsi.po_number','like', '%' . $input['production_order_number'] . '%'];
        !empty($input['work_order_number']) &&  $where[]=['rsi.wo_number','like', '%' . $input['work_order_number'] . '%'];
        !empty($input['workbench_name']) &&  $where[]=['rwb.name','like', '%' . $input['workbench_name'] . '%'];//工位名称
        !empty($input['daytime']) &&  $where[]=['rwo.work_station_time','=',$input['daytime']];//某天的时间点
        !empty($input['inspur_material_code']) &&  $where[]=['rpo.inspur_material_code','=',$input['inspur_material_code']];
        !empty($input['inspur_sales_order_code']) &&  $where[]=['rpo.inspur_sales_order_code','=',$input['inspur_sales_order_code']];
        isset($input['picking_status']) &&  is_numeric($input['picking_status']) && $where[]=['rwo.picking_status','=',$input['picking_status']];//工单领料状态
        isset($input['send_status']) &&  is_numeric($input['send_status']) && $where[]=['rwo.send_status','=',$input['send_status']];//工单领料状态
        !empty($input['item_no']) &&  $where[]=['rm.item_no','like', '%' . $input['item_no'] . '%'];

        //empty对0判断为空
        if(isset($input['schedule']) && $input['schedule'] != ''){
            if($input['schedule'] == 0){
                $where[]=['rwo.schedule','=',0];
            }else if($input['schedule'] == 2){
                $where[]=['rwo.schedule','>=',1];
            }else{
                $where[]=['rwo.schedule', '<', 1];
                $where[]=['rwo.schedule', '>', 0];
            }
        }

        //按员工档案那配置的生产单元，按厂对po进行划分
        $admin_id = session('administrator')->admin_id;
        $admin_is_super = session('administrator')->superman;
        $where2 = [['re.admin_id', '=', $admin_id]];
        $emploee_info = DB::table(config('alias.re') . ' as re')
            ->select('re.id', 're.factory_id', 're.workshop_id')
            ->where($where2)
            ->first();
        if(!empty($input['item_no'])){
            if ($admin_is_super != 1) {
                if ($emploee_info->workshop_id != 0) {
                    $where[] = ['rws2.id', '=', $emploee_info->workshop_id];//区分到车间
                }
            }
        }else{
            if (!empty($emploee_info)) {
                if ($admin_is_super != 1) {
                    if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                        $where[] = ['rwo.factory_id', '=', $emploee_info->factory_id];//区分到厂
                    } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                        $where[] = ['rwo.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                    }
                }
            }
        }
        //实时库存拉出工单物料的退料列表
        $builder = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.number', '=', 'rsi.po_number')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.number', '=', 'rsi.wo_number')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwo.work_center_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwo.work_shop_id')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwo.work_shift_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rws') . ' as rws2', 'rws2.address', '=', 'rsd.code')
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
                'rsi.sale_order_code as sales_order_code',
                'rsi.sales_order_project_code',
                'rsi.po_number',
                'rsi.wo_number',
                'rwo.id as work_order_id',
                'rwo.work_center_id',
                'rwo.id as work_order_id',
                'rws.name as workshop_name',
                'rwc.name as workcenter_name',
                'rwc.name as workcenter_name',
                'rwb.name as workbench_name',
                'rwo.picking_status',
                'rwo.send_status',
                'rwo.schedule',
            ])
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('rsi.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        //  添加合并退料 退料标识 shuaijie.feng 6.14/2019
        foreach ($obj_list as $k=>&$v)
        {
            // 默认值为1
            $v->withdrawalstatus = 1;
            // 查询工单id
            $workOrderId = DB::table(config('alias.rwo'))->where([['number',$v->wo_number],['is_delete',0]])->select('id','number')->first();
            if(empty($workOrderId)) continue;
            // 根据工单查询领料单
            $obj_list1 = DB::table(config('alias.rmre').' as rmre')
                ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmre.material_requisition_id')
                ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rmre.work_order_id')
                ->select('rmr.status','rwo.number')
                ->where([
                    ['rmre.work_order_id',$workOrderId->id],
                    ['rmr.is_delete',0]
                ])
                ->get();
            // 根据工单查询退料单
            $obj_list2 = DB::table(config('alias.rrmr').' as rrmr')
                ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rrmr.material_requisition_id')
                ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rrmr.work_order_id')
                ->select('rmr.status','rwo.number')
                ->where([
                    ['rrmr.work_order_id',$workOrderId->id],
                    ['rmr.is_delete',0]
                ])
                ->get();
            // 根据领料单赋值
            foreach ($obj_list1 as $k1=>$v1){
                if($v1->status == 1 || $v1->status == 2) {
                    $v->withdrawalstatus = 2;
                }
            }
            // 根据退料单赋值
            foreach ($obj_list2 as $k2=>$v2){
                if($v2->status == 1 || $v2->status == 2) {
                    $v->withdrawalstatus = 2;
                }
            }
        }
        // 添加条件筛选 退料单状态为未退料  shuaijie.feng 6.14/2019
        if(isset($input['withdrawalstatus']) && $input['withdrawalstatus'] == 1){
            // 进行批量筛选
            $obj_list = obj2array($obj_list);
            foreach ($obj_list as $k=>$v){
                if($v['withdrawalstatus'] == 2){
                    unset($obj_list[$k]);
                }
            }
            //  重新获取值之后重排数组
            $obj_list = array_values(obj2array($obj_list));
            // 赋值数量
            $input['total_records']=count($obj_list);
            // 直接返回当前结果
            return $obj_list;
        }
        // 添加条件筛选 退料单状态退料中  shuaijie.feng 6.14/2019
        if (isset($input['withdrawalstatus']) && $input['withdrawalstatus'] == 2){
            // 进行批量筛选
            $obj_list = obj2array($obj_list);
            foreach ($obj_list as $k=>$v){
                if($v['withdrawalstatus'] == 1){
                    unset($obj_list[$k]);
                }
            }
            //  重新获取值之后重排数组
            $obj_list = array_values(obj2array($obj_list));
            // 赋值数量
            $input['total_records']=count($obj_list);
            // 直接返回当前结果
            return $obj_list;
        }
        //总共有多少条记录
        $builder_count = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.number', '=', 'rsi.po_number')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.number', '=', 'rsi.wo_number')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwo.work_shift_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rws') . ' as rws2', 'rws2.address', '=', 'rsd.code')
            ->where($where);

        $input['total_records']=$builder_count->count();
        return $obj_list;
    }

    /**
     * 获取归类后的退料数据
     *
     * @param array $workOrderIDArr
     * @return array
     */
    public function getMergerReturnMaterial($input)
    {
        $array_ids = json_decode($input['work_order_material_ids'],true);
        //4.对物料按仓储，物料id，特殊库存，批次分类
        $picking_list = [];
        $all_send_depot = [];

        foreach ($array_ids as $i) {
            $where = [];
            $where[] = ['rsi.storage_validate_quantity', '>', 0];
            $where[] = ['rsi.id','=',$i['inve_id']];
//            $where[] = ['rsi.wo_number','=',$i['wo_number']];
//            $where[] = ['rsi.material_id','=',$i['material_id']];
            //1.WO，物料查询实时库存表
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
                    'rsi.sale_order_code as sales_order_code',
                    'rsi.sales_order_project_code',
                ])
                ->where($where)
                ->get();
            if(count($obj_list) <= 0) TEPA('工单['.$i['wo_number'].']没有料可退！');

            // 查询物料分類是否属于现编仓管理
            $materialObj = DB::table(config('alias.rm') . ' as rm')
                ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
                ->select(['rm.id', 'rmc.warehouse_management'])
                ->where('rm.id', $i['material_id'])
                ->first();
            $is_mes_manager = [];
            !isset($is_mes_manager[$i['material_id']]) && $is_mes_manager[$i['material_id']] = $materialObj->warehouse_management == 1 ? 1 : 0;

            foreach ($obj_list as $key => $value) {
                //如果属于线边仓管理，就剔除
                if (isset($is_mes_manager[$value->material_id]) && $is_mes_manager[$value->material_id] == 1) {
                    continue;
                }
                //如果原始发料地点为空，则是用采购仓储
                if (empty($value->send_depot)) {
                    $value->send_depot = $this->getSaleDepotAndProduceDepot($value->material_id, $value->factory_id);
                }
                $all_send_depot[$value->send_depot] = $value->send_depot;

                //从工单明细中拿出，物料是否是特殊库存
                $obj_special_stock = DB::table(config('alias.rwoi'))
                    ->select('special_stock')
                    ->where(
                        [['work_order_id', '=', $i['work_order_id']], ['material_id', '=', $i['material_id']]]
                    )
                    ->first();
                $value->special_stock = isset($obj_special_stock->special_stock) ? $obj_special_stock->special_stock : '';
                empty($value->batch) ? $batch = 0 : $batch = $value->batch;

                if (empty($value->special_stock)) {
                    if (isset($picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch])) {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch]['storage_number'] += $value->storage_number;
                    } else {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch] = [
                            'send_depot' => $value->send_depot,
                            'material_id' => $value->material_id,
                            'material_code' => $value->material_code,
                            'material_name' => $value->material_name,
                            'storage_number' => $value->storage_number,
                            'batch' => $value->batch,
                            'unit_id' => $value->unit_id,
                            'bom_commercial' => $value->bom_commercial,
                            'special_stock' => $value->special_stock,
                        ];
                    }
                } else {
                    if (isset($picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch . '-' . $value->sales_order_code . '-' . $value->sales_order_project_code])) {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch . '-' . $value->sales_order_code . '-' . $value->sales_order_project_code]['storage_number'] += $value->storage_number;
                    } else {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch . '-' . $value->sales_order_code . '-' . $value->sales_order_project_code] = [
                            'send_depot' => $value->send_depot,
                            'material_id' => $value->material_id,
                            'material_code' => $value->material_code,
                            'material_name' => $value->material_name,
                            'storage_number' => $value->storage_number,
                            'batch' => $value->batch,
                            'unit_id' => $value->unit_id,
                            'bom_commercial' => $value->bom_commercial,
                            'special_stock' => $value->special_stock,
                        ];
                    }
                }
            }
        }

        //按仓储再归类，给前端展示
        $result = [];
        foreach ($picking_list as $k=>&$v){
            $arr = explode('-',$k);
            if($v['storage_number'] <= 0) continue;

            //棉泡公斤和米补丁方案：针对棉泡单位转换做额外处理，推送时根据报工中公斤和米转换关系，将公斤转成米推送(96是单位公斤)，库存还是走公斤
            $code_pre = substr($v['material_code'], 0,4);
            $v['m_display'] = 0;
            if($code_pre == '3002' && $v['unit_id'] == '96'){
                //针对批次为1，进行消耗，从仓库收集的表中获得比例
                $switch = config('app.batch1');
                if($v['batch'] == 1 && $switch == 1){
//                    $where2 = [];
//                    $where2[] = ['rrb.material_code','=',$v['material_code']];
//                    $where2[] = ['rrb.lot','=',$v['batch']];
//                    $where2[] = ['rrb.conversion','>=','0'];
//                    $conversion = DB::table('ruis_robe_batch as rrb')->select('conversion')
//                        ->where($where2)
//                        ->first();

                    //获取米／公斤的转换比例
                    $Units = new Units();
                    $base_qty = $Units->getExchangeUnitValueById($v['unit_id'], '135', $v['storage_number'], $v['material_id']);
                    $format_base_qty = floor($base_qty * 10) / 10;

                    $v['m_value'] = $format_base_qty;
                    $v['m_unit'] = 'M';
                    $v['m_display'] = 1;
                }else {
                    //获取米／公斤的转换比例
                    $where = [];
                    $where[] = ['rwdoi.material_id', '=', $v['material_id']];
                    $where[] = ['rwdoi.lot', '=', $v['batch']];
                    $where[] = ['rwdoi.type', '=', '-1'];
                    $where[] = ['rwdoi.conversion', '>=', '0'];
                    $conversion = DB::table(config('alias.rwdoi') . ' as rwdoi')->select('conversion')
                        ->where($where)
                        ->first();

                    if (!isset($conversion) || empty($conversion) || $conversion->conversion == 0) {
                        $v['m_display'] = 0;
                    } else {
                        //取一位小数
                        $v['m_value'] = floor($v['storage_number'] / $conversion->conversion * 1000) / 1000;
                        $v['m_unit'] = 'M';
                        $v['m_display'] = 1;
                    }
                }
            }

            if(isset($result[$arr[0]])){
                $result[$v['send_depot']]['materials'][] = $v;
            }else{
                $result[$v['send_depot']] = [
                    'send_depot'=>$v['send_depot'],
                    'materials'=>[$v],
                ];
            }
        }
        if(empty($result)) TEA('2457');
        return array_values($result);

        //return array_values($result);
    }

    /**
     * 存储归类后的退料数据
     *
     * @param array $workOrderIDArr
     * @return array
     */
    public function storeMergerReturnMaterial($input)
    {
        $array_ids = json_decode($input['work_order_material_ids'],true);

        //4.对物料按仓储，物料id，特殊库存，批次分类
        $picking_list = [];
        $all_send_depot = [];

        foreach ($array_ids as $i) {
            $where = [];
            $where[] = ['rsi.storage_validate_quantity', '>', 0];
            $where[] = ['rsi.id','=',$i['inve_id']];

//            $where[] = ['rsi.wo_number','=',$i['wo_number']];
            if(!empty($i['work_order_id'])){
                $where[] = ['rwoi.material_id','=',$i['material_id']];
                $where[] = ['rwoi.type','=',0];  // 剔除出料数据，解决返工订单退料时出料与进料相同，导致出现退料数据重复问题
            }else{
                $where[] = ['rsi.material_id','=',$i['material_id']];
            }

            //1.WO，物料查询实时库存表
            $obj_list = DB::table(config('alias.rsi') . ' as rsi')
                ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
                ->leftJoin(config('alias.rwo') . ' as rwo', 'rsi.wo_number', '=', 'rwo.number')
                ->leftJoin(config('alias.rwoi') . ' as rwoi', 'rwo.id', '=', 'rwoi.work_order_id')
                ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
                ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
                ->leftJoin(config('alias.rws') . ' as rws2', 'rws2.address', '=', 'rsd.code')
                ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
                ->select([
                    'rsi.id as inve_id',
                    'rsi.storage_validate_quantity as storage_number',
                    'rsi.material_id',
                    'rsi.plant_id',
                    'rm.item_no as material_code',
                    'rm.name as material_name',
                    'rsi.unit_id',
                    'rwoi.bom_unit_id',
                    'ruu.commercial as bom_commercial',
                    'rsi.depot_id as line_depot_id',
                    'rsd.name as line_depot_name',
                    'rsd.code as line_depot_code',
                    'rf.id as factory_id',
                    'rf.code as factory_code',
                    'rf.name as factory_name',
                    'rsi.send_depot',
                    'rsi.lot as batch',
                    'rsi.sale_order_code as sales_order_code',
                    'rsi.sales_order_project_code',
                    'rsi.wo_number',
                    'rwo.id as work_order_id',
                    //'rwo.factory_id',
                    'rwo.work_shop_id',
                    'rws2.id as common_work_shop_id',
                    'rwoi.special_stock as special_stock',
                ])
                ->where($where)
                ->get();
            if(count($obj_list) <= 0) TEPA('工单['.$i['wo_number'].']没有料可退！');
            // 查询物料分類是否属于现编仓管理
            $materialObj = DB::table(config('alias.rm') . ' as rm')
                ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
                ->select(['rm.id', 'rmc.warehouse_management'])
                ->where('rm.id', $i['material_id'])
                ->first();
            $is_mes_manager = [];
            !isset($is_mes_manager[$i['material_id']]) && $is_mes_manager[$i['material_id']] = $materialObj->warehouse_management == 1 ? 1 : 0;

            foreach ($obj_list as $key => $value) {
                //如果属于线边仓管理，就剔除
                if (isset($is_mes_manager[$value->material_id]) && $is_mes_manager[$value->material_id] == 1) {
                    continue;
                }
                //如果原始发料地点为空，则是用采购仓储
                if (empty($value->send_depot)) {
                    $value->send_depot = $this->getSaleDepotAndProduceDepot($value->material_id, $value->plant_id);
                }
                $all_send_depot[$value->send_depot] = $value->send_depot;

//                //从工单明细中拿出，物料是否是特殊库存
//                $obj_special_stock = DB::table(config('alias.rwoi'))
//                    ->select('special_stock')
//                    ->where(
//                        [['work_order_id', '=', $i['work_order_id']], ['material_id', '=', $i['material_id']]]
//                    )
//                    ->first();
//                $value->special_stock = $obj_special_stock->special_stock;
                empty($value->batch) ? $batch = 0 : $batch = $value->batch;

                //工单退料明细，后面入库用
                $wo_material_list[] = [
                    'work_order_id' => $value->work_order_id,
                    'material_code' => $value->material_code,
                    'material_id' => $value->material_id,
                    'unit_id' => $value->unit_id,
                    'batch' => $value->batch,
                    'qty' => 0,
                    'rated_qty' => $value->storage_number,
                    'special_stock' => $value->special_stock,
                    'send_depot' => $value->send_depot,
                    'sales_order_code' => $value->sales_order_code,
                    'sales_order_project_code' => $value->sales_order_project_code,
                    'inve_id' => $value->inve_id,
                ];

                $reason = isset($i['reason'])?$i['reason']:'';

                if (empty($value->special_stock)) {
                    if (isset($picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch])) {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch]['storage_number'] += $value->storage_number;
                    } else {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch] = [
                            'send_depot' => $value->send_depot,
                            'material_id' => $value->material_id,
                            'material_code' => $value->material_code,
                            'material_name' => $value->material_name,
                            'storage_number' => $value->storage_number,
                            'batch' => $value->batch,
                            'unit_id' => $value->unit_id,
                            'bom_commercial' => $value->bom_commercial,
                            'special_stock' => $value->special_stock,
                            'sales_order_code' => $value->sales_order_code,
                            'sales_order_project_code' => $value->sales_order_project_code,
                            //'inve_id' => $value->inve_id,
                            'reason'=>$reason,
                        ];
                    }
                } else {
                    if (isset($picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch . '-' . $value->sales_order_code . '-' . $value->sales_order_project_code])) {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch . '-' . $value->sales_order_code . '-' . $value->sales_order_project_code]['storage_number'] += $value->storage_number;
                    } else {
                        $picking_list[$value->send_depot . '-' . $value->material_id . '-' . $batch . '-' . $value->sales_order_code . '-' . $value->sales_order_project_code] = [
                            'send_depot' => $value->send_depot,
                            'material_id' => $value->material_id,
                            'material_code' => $value->material_code,
                            'material_name' => $value->material_name,
                            'storage_number' => $value->storage_number,
                            'batch' => $value->batch,
                            'unit_id' => $value->unit_id,
                            'bom_commercial' => $value->bom_commercial,
                            'special_stock' => $value->special_stock,
                            'sales_order_code' => $value->sales_order_code,
                            'sales_order_project_code' => $value->sales_order_project_code,
                            //'inve_id' => $value->inve_id,
                            'reason'=>$reason,
                        ];
                    }
                }
            }
        }

        //按仓储再归类
        $result = [];
        foreach ($picking_list as $k=>&$v){
            $arr = explode('-',$k);
            if($v['storage_number'] <= 0) continue;
            if(isset($result[$arr[0]])){
                $result[$v['send_depot']][] = $v;
            }else{
                $result[$v['send_depot']] = [$v];
            }
        }

        if(empty($result)) TEA('2457');

        $factory_id = $obj_list['0']->factory_id;
        $work_shop_id = !empty($obj_list['0']->work_shop_id) ? $obj_list['0']->work_shop_id : $obj_list['0']->common_work_shop_id;
        $line_depot_id = $obj_list['0']->line_depot_id;
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;

        //生成退料单
        $keyVal = [
            'type' => 2, //ZY02 车间退料
            'factory_id' => !empty($factory_id) ? $factory_id : 0,
            'work_shop_id' => !empty($work_shop_id) ? $work_shop_id : 0,
            'line_depot_id' => $line_depot_id,
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 1,
            'push_type' => 1,   // sap退料
            'creator_id' => $creator_id,
            'is_merger_picking' => 1,
        ];
        try{
            DB::connection()->beginTransaction();
            //工单退料记录关联的退料单id
            $depot_mr_ids = [];
            foreach ($result as $k=>$v){
                $keyVal['code'] = $this->getNewCode(2);    //生成退料单
                $keyVal['send_depot'] = $k;
                //新建退料单
                $mr_id = DB::table(config('alias.rmr'))->insertGetId($keyVal);
                if(empty($mr_id)) TEA('802');

                $depot_mr_ids[$k] = $mr_id;
                $i = 1;
                $order = 1;  // 用于生成批次表的序号
                foreach ($v as $j=>$w){
                    $itemArr = [
                        'material_requisition_id' => $mr_id,
                        'line_project_code' => $this->createLineCode($i),
                        'material_id' => $w['material_id'],
                        'material_code' => $w['material_code'],
                        'send_status' => 1,
                        'is_special_stock' => isset($w['special_stock']) ? $w['special_stock'] : '',
                        'demand_qty' => $w['storage_number'],
                        'rated_qty' => $w['storage_number'],
                        'demand_unit_id' => $w['unit_id'],
                        'sales_order_code' => $w['sales_order_code'],
                        'sales_order_project_code' => $w['sales_order_project_code'],
                        'remark'=>$w['reason']
                    ];
                    $item_id = DB::table(config('alias.rmri'))->insertGetId($itemArr);  //插入 item表
                    //物料明细表行项号递增
                    $i++;

                    //每个料会对应一个批次
                    $batchArr[] = [
                        'material_requisition_id' => $mr_id,
                        'item_id' => $item_id,
                        'order' => str_pad($order, 5, '0', STR_PAD_LEFT),
                        'batch' => empty($w['batch']) ? '' : $w['batch'],
                        'actual_send_qty' => $w['storage_number'],
                        'base_unit' => '',  //基本单位
                        'bom_unit_id' => $w['unit_id'],     // bom单位
                        //'inve_id' => $w['inve_id'],     // bom单位
                    ];
                    $order++;
                }
            }
//            //插入退料的物料明细
//            if(!empty($itemArr)){
//                $res = DB::table(config('alias.rmri'))->insert($itemArr);
//                if(empty($res)) TEA('802');
//            }
            //插入退料的物料批次
            if(!empty($batchArr)){
                $res = DB::table(config('alias.rmrib'))->insert($batchArr);
                if(empty($res)) TEA('802');
            }

            //插入工单退料记录，实时库存id
            $wo_ids = [];
            $rmre_arr = [];
            foreach ($wo_material_list as $k=>$v){
                if($v['rated_qty'] <= 0) continue;
                if(!isset($depot_mr_ids[$v['send_depot']])) continue;
                $rmre_arr[] = [
                    'material_requisition_id' => $depot_mr_ids[$v['send_depot']],
                    'work_order_id' => isset($v['work_order_id'])? $v['work_order_id'] : 0,
                    'material_code' => $v['material_code'],
                    'material_id' => $v['material_id'],
                    'unit_id' => $v['unit_id'],
                    'qty' => $v['qty'],
                    'rated_qty' => $v['rated_qty'],
                    'special_stock' => isset($v['special_stock']) ? $v['special_stock'] : '',
                    'batch' => $v['batch'],
                    'inve_id' => $v['inve_id'],
                    'push_type' => 1,//sap退料标示
                    'ctime' => time(),
                ];
                if(!in_array($v['work_order_id'],$wo_ids)) $wo_ids[] = $v['work_order_id'];
            }
            if(!empty($wo_material_list)){
                $wo_res = DB::table(config('alias.rrmr'))->insert($rmre_arr);
                if(empty($wo_res)) TEA('802');
            }
        }catch (\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return array_values($depot_mr_ids);

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

//region Add
    /**
     * 获取归类后的退料数据
     *
     * @param array $workOrderIDArr
     * @return array
     */
    public function getMergerReturnMaterialOld(array $workOrderIDArr)
    {
        //拿出工单组所有多出的料
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
                'rsi.sale_order_code as sales_order_code',
                'rsi.sales_order_project_code',
            ])
            ->whereIn('rwo.id', $workOrderIDArr)
            ->where([['rsi.storage_validate_quantity', '>', 0]])
            ->get();

        if(count($obj_list) <= 0) TEA('2457');

        $material_ID_arr = [];
        foreach ($obj_list as $item) {
            $material_ID_arr[] = $item->material_id;
        }
        // 查询物料分類是否属于现编仓管理
        $materialObjList = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->select(['rm.id', 'rmc.warehouse_management'])
            ->whereIn('rm.id', $material_ID_arr)
            ->get();
        $is_mes_manager = [];
        foreach ($materialObjList as $material) {
            !isset($is_mes_manager[$material->id]) && $is_mes_manager[$material->id] = $material->warehouse_management == 1 ? 1 : 0;
        }

        //4.对物料按仓储，物料id，特殊库存，批次分类
        $picking_list = [];
        $all_send_depot = [];
        foreach ($obj_list as $key => $value) {
            //如果属于线边仓管理，就剔除
            if (isset($is_mes_manager[$value->material_id]) && $is_mes_manager[$value->material_id] == 1) {
                continue;
            }
            //如果原始发料地点为空，则是用采购仓储
            if (empty($value->send_depot)) {
                $value->send_depot = $this->getSaleDepotAndProduceDepot($value->material_id, $value->factory_id);
            }
            $all_send_depot[$value->send_depot] = $value->send_depot;

            //从工单明细中拿出，物料是否是特殊库存
            $obj_special_stock = DB::table(config('alias.rwoi'))
                ->select('special_stock')
                ->where(
                    [['work_order_id','=',$value->work_order_id],['material_id','=',$value->material_id]]
                )
                ->first();
            $value->special_stock = $obj_special_stock->special_stock;
            empty($value->batch) ? $batch = 0 : $batch = $value->batch;

            if(empty($value->special_stock)){
                if(isset($picking_list[$value->depot.'-'.$value->material_id.'-'.$batch])){
                    $picking_list[$value->depot.'-'.$value->material_id.'-'.$batch]['storage_number'] += $value->storage_number;
                }else{
                    $picking_list[$value->depot.'-'.$value->material_id.'-'.$batch] = [
                        'send_depot' => $value->send_depot,
                        'material_id' => $value->material_id,
                        'material_code' => $value->material_code,
                        'material_name' => $value->material_name,
                        'storage_number' => $value->storage_number,
                        'batch' => $value->batch,
                        'unit_id' => $value->unit_id,
                        'bom_commercial' => $value->bom_commercial,
                        'inve_id' => $value->inve_id,
                        'special_stock' => $value->special_stock,
                    ];
                }
            }else{
                if(isset($picking_list[$value->depot.'-'.$value->material_id.'-'.$batch.'-'.$value->sales_order_code.'-'.$value->sales_order_project_code])){
                    $picking_list[$value->depot.'-'.$value->material_id.'-'.$batch.'-'.$value->sales_order_code.'-'.$value->sales_order_project_code]['storage_number'] += $value->storage_number;
                }else{
                    $picking_list[$value->depot.'-'.$value->material_id.'-'.$batch.'-'.$value->sales_order_code.'-'.$value->sales_order_project_code] = [
                        'send_depot' => $value->send_depot,
                        'material_id' => $value->material_id,
                        'material_code' => $value->material_code,
                        'material_name' => $value->material_name,
                        'storage_number' => $value->storage_number,
                        'batch' => $value->batch,
                        'unit_id' => $value->unit_id,
                        'bom_commercial' => $value->bom_commercial,
                        'inve_id' => $value->inve_id,
                        'special_stock' => $value->special_stock,
                    ];
                }
            }
        }

        //按仓储再归类，给前端展示
        $result = [];
        foreach ($picking_list as $k=>&$v){
            $arr = explode('-',$k);
            if($v['storage_number'] <= 0) continue;
            if(isset($result[$arr[0]])){
                $result[$v['send_depot']]['materials'][] = $v;
            }else{
                $result[$v['send_depot']] = [
                    'send_depot'=>$v['send_depot'],
                    'materials'=>[$v],
                ];
            }
        }
        if(empty($result)) TEA('2415');
        return $result;

        //return array_values($result);
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


//region Update

    /**
     * @param int $MR_ID
     * @param string $material_code
     * @param float $qty
     * @param int $batch_id
     */
    public function backFillReturnMaterial(int $MR_ID, string $material_code, float $qty,string $batch,int $batch_id,string $is_special_stock,string $sales_order_code,string $sales_order_project_code)
    {
        $where = [
            ['rrmr.material_code', '=', $material_code],
            ['rrmr.material_requisition_id', '=', $MR_ID],
            ['batch', '=', $batch]
        ];
        if(!empty($is_special_stock)){
            $where[] = ['rpo.sales_order_code','=',$sales_order_code];
            $where[] = ['rpo.sales_order_project_code','=',$sales_order_project_code];
        }
        $objs = DB::table(config('alias.rrmr').' as rrmr')
            ->leftJoin(config('alias.rwo').' as rwo','rrmr.work_order_id','rwo.id')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
            ->select([
                'rrmr.id',
                'rrmr.qty',
                'rrmr.rated_qty',
                'rrmr.material_code',
                'rrmr.material_id',
                'rrmr.work_order_id',
                'rrmr.special_stock',
                'rrmr.unit_id',
                'rrmr.inve_id',
            ])
            ->where($where)
            ->get();
        if (empty(obj2array($objs))) {
            return;
        }
        $updateArr = [];
        $insert_arr = [];
        $sum_qty = $qty;
        foreach ($objs as $obj) {
            if ($obj->rated_qty <= 0) {
                continue;
            }

            // 总的数量剩余数量大于额定数量
            if ($sum_qty > $obj->rated_qty) {
                $updateArr[] = [
                    'id' => $obj->id,
                    'qty' => $obj->rated_qty,
                ];
                //做工单物料与批次关系表的记录
                $insert_arr[]=[
                    'work_order_id'=>$obj->work_order_id,
                    'material_id'=>$obj->material_id,
                    'material_requisition_id'=>$MR_ID,
                    'qty'=>$obj->rated_qty,
                    'batch_id'=>$batch_id,
                    'inve_id'=>$obj->inve_id,
                    'ctime'=>time(),
                ];
                $sum_qty -= $obj->rated_qty;
            } else {
//                $sum_qty = 0;
                $updateArr[] = [
                    'id' => $obj->id,
                    'qty' => $sum_qty,
                ];
                $insert_arr[]=[
                    'work_order_id'=>$obj->work_order_id,
                    'material_id'=>$obj->material_id,
                    'material_requisition_id'=>$MR_ID,
                    'qty'=>$sum_qty,
                    'batch_id'=>$batch_id,
                    'inve_id'=>$obj->inve_id,
                    'ctime'=>time(),
                ];
                $sum_qty = 0;
                break;  //剩余数量 不够最后一个了
            }
        }
        // 最后一个排完后仍有剩余，所剩的需要给最后一个
        if ($sum_qty > 0) {
            $lastKeyVal = array_pop($updateArr);
            $lastKeyVal['qty'] += $sum_qty;
//            $sum_qty = 0;
            $updateArr[] = $lastKeyVal;
            $last_element=array_pop($insert_arr);
            $last_element['qty'] += $sum_qty;
            $insert_arr[]=$last_element;
        }
        foreach ($updateArr as $value) {
            DB::table(config('alias.rrmr'))->where('id', $value['id'])->update(['qty' => $value['qty']]);
        }
        DB::table(config('alias.rmrw'))->insert($insert_arr);
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
        $where[] = ['rmr.type', '=', 2];
        $where[] = ['rmr.is_merger_picking', '=', 1];

        $where3 = [];

        $po_wo_ids = [];
        // 根据生产订单和工单号搜索条件存在则 进行反查领料单数据，解决搜索超时无数据问题
        if(!empty($input['work_order_code']) || !empty($input['product_order_code'])){
            $po_wo_ids = DB::table(config('alias.rwo') . ' as rwo')
                ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
                ->leftJoin(config('alias.rrmr') . ' as rrmr','rrmr.work_order_id','=','rwo.id')
                ->where(function ($query) use ($input) {
                    $query->where([
                        ['rwo.number', '=', $input['work_order_code']],
                        ['rpo.number', '=', $input['product_order_code']],
                    ])
                        ->orWhere([
                            ['rpo.number', '=', $input['product_order_code']],
                        ])
                        ->orWhere([
                            ['rwo.number', '=', $input['work_order_code']],
                        ]);
                })->pluck('material_requisition_id')->toArray();
        }
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
        if(!empty($po_wo_ids)) $builder->whereIn('rmr.id',$po_wo_ids);
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
            $wo_po = DB::table(config('alias.rrmr') . ' as rrmr')
                ->leftJoin(config('alias.rwo') . ' as wo', 'wo.id', 'rrmr.work_order_id')
                ->leftJoin(config('alias.rpo') . ' as po', 'po.id', 'wo.production_order_id')
                ->where('rrmr.material_requisition_id', $v['material_requisition_id'])
                ->where($where3)
                ->distinct('wo.number')
                ->get(['wo.number as work_order_code', 'po.number as product_order_code', 'po.sales_order_code','po.sales_order_project_code', 'rrmr.material_code as inspur_material_code']);
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

    /**
     * 超产能转厂补丁
     * 验证WO是否存在转厂的虚拟库存点
     *
     * @param array $workOrderIDArr
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function checkHasVirtualDepot(array $workOrderIDArr)
    {
        if (empty($workOrderIDArr)) {
            TEA(2664, '1');
        }
        $array_workOrderIds = array_column($workOrderIDArr,'work_order_id');

        $objs = DB::table(config('alias.rwo').' as rwo')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
            ->select([
                'rpo.WERKS',
                'rwo.number'
            ])
            ->where([
                ['rwo.status', '>', 0],
                ['rwo.on_off', '=', 1],
                ['rwo.is_delete', '=', 0],
            ])
            ->whereIn('rwo.id', $array_workOrderIds)
            ->get();
        if (empty($objs)) TEA(2664, '2');
        foreach ($objs as $value){
            if ($value->WERKS != ''){
                TEPA('工单['.$value->number.'] 属于转厂工单，请走按单退料!');
            }
        }
    }

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
        $array_workOrderIds = array_column($workOrderIDArr,'work_order_id');

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
            ->whereIn('id', $array_workOrderIds)
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

    public function checkHasNotFinishMr(array $workOrderIDArr){
        if (empty($workOrderIDArr)) {
            TEA(2652, '1');
        }
        $array_workOrderIds = array_column($workOrderIDArr,'work_order_id');

        $obj_list = DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmre.material_requisition_id')
            ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rmre.work_order_id')
            ->select('rmr.status','rwo.number')
            ->whereIn('rmre.work_order_id',$array_workOrderIds)
            ->where('rmr.is_delete',0)
            ->get();
        $obj_list2 = DB::table(config('alias.rrmr').' as rrmr')
            ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rrmr.material_requisition_id')
            ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rrmr.work_order_id')
            ->select('rmr.status','rwo.number')
            ->whereIn('rrmr.work_order_id',$array_workOrderIds)
            ->where('rmr.is_delete',0)
            ->get();
        foreach ($obj_list as $k=>$v){
            if($v->status == 1 || $v->status == 2) TEPA('工单['.$v->number.']尚有未完成的领料或者退料单，无法参与合并');
        }
        foreach ($obj_list2 as $k=>$v){
            if($v->status == 1 || $v->status == 2) TEPA('工单['.$v->number.']尚有未完成的领料或者退料单，无法参与合并');
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
        $where = [
            ['rwo.status', '>', 0],
            ['rwo.on_off', '=', 1],
            ['rwo.is_delete', '=', 0],
            ['rwoi.type', '=', 0],
            ['rm.lzp_identity_card', '=', ''],
            ['rmc.warehouse_management','<>',1]
        ];
        $array_workOrderIds = array_column($workOrderIDArr,'work_order_id');


        $objs = DB::table(config('alias.rwoi') . ' as rwoi')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rwoi.work_order_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rwo.factory_id')
            ->leftJoin(config('alias.ramc') . ' as ramc', [['ramc.WERKS', '=', 'rf.code'], ['rwoi.material_id', '=', 'ramc.material_id']])
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rwoi.material_id')
            ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
            ->select([
                'rwoi.material_id',
                'rwoi.material_code',
                'rwoi.LGPRO',
                'rwoi.LGFSB',
                'ramc.LGPRO as LGPRO1',
                'ramc.LGFSB as LGFSB1',
            ])
            ->where($where)
            ->whereIn('rwoi.work_order_id', $array_workOrderIds)
            ->get();
        if (empty(obj2array($objs))) {
            TEA(2664);
        }
        foreach ($objs as $value) {
            if (empty($value->LGPRO) && empty($value->LGFSB) && empty($value->LGPRO1) && empty($value->LGFSB1)) {
                TEPA('物料 ' . $value->material_code . ' 的仓储地点缺失');
            }
        }
    }

    /**
     * 验证所有的物料是否通用库存
     *
     * @param array $workOrderIDArr
     * @throws \App\Exceptions\ApiParamException
     * @throws \App\Exceptions\ApiException
     */
    public function checkCommonMaterial(array $inveIDArr)
    {
        $array_invIds = array_column($inveIDArr,'inve_id');
        if (empty($array_invIds)) {
            TEA(2665);
        }
        $count_common = DB::table(config('alias.rsi') . ' as rsi')
            ->where([
                ['sale_order_code', '=', ''],
                ['po_number', '=', ''],
                ['wo_number', '=', ''],
            ])
            ->whereIn('id', $array_invIds)
            ->count();
        if ($count_common == 0) TEA(2665);


        if (count($array_invIds) != $count_common) {
            TEA(2666);
        }
    }

    /**
     * 验证通用库存的物料的仓储地点是否存在
     *
     * @param array $workOrderIDArr
     * @throws \App\Exceptions\ApiParamException
     * @throws \App\Exceptions\ApiException
     */
    public function checkCommonHasDepot(array $inveIDArr)
    {
        $array_invIds = array_column($inveIDArr,'inve_id');
        if (empty($array_invIds)) {
            TEA(2665);
        }
        $where = [
            ['rm.lzp_identity_card', '=', ''],
            ['rmc.warehouse_management','<>',1]
        ];
        $objs = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->leftJoin(config('alias.ramc') . ' as ramc', [['ramc.WERKS', '=', 'rf.code'], ['rsi.material_id', '=', 'ramc.material_id']])
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
            ->select([
                'rm.item_no',
                'ramc.LGPRO as LGPRO1',
                'ramc.LGFSB as LGFSB1',
            ])
            ->where($where)
            ->whereIn('rsi.id', $array_invIds)
            ->get();
        if (empty(obj2array($objs))) {
            TEA(2667);
        }
        foreach ($objs as $value) {
            if (empty($value->LGPRO1) && empty($value->LGFSB1)) {
                TEPA('物料 ' . $value->item_no . ' 的仓储地点缺失');
            }
        }
    }

    public function checkHasNotFinishCommonMr(array $inveIDArr){
        if (empty($inveIDArr)) {
            TEA(2665, '1');
        }
        $array_invIds = array_column($inveIDArr,'inve_id');

        $obj_list2 = DB::table(config('alias.rrmr').' as rrmr')
            ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rrmr.material_requisition_id')
            ->leftJoin(config('alias.rwo').' as rwo','rwo.id','rrmr.work_order_id')
            ->select('rmr.status','rwo.number')
            ->whereIn('rrmr.inve_id',$array_invIds)
            ->where('rmr.is_delete',0)
            ->get();
        foreach ($obj_list2 as $k=>$v){
            if($v->status == 1 || $v->status == 2) TEPA('当前物料尚有未完成的退料单，无法参与合并');
        }

    }

    /**
     * 合并退料批量推送  shuaijie.feng  6.15/2019
     * @param $input
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function BatchSending($input)
    {
        if(empty($input['id'])){
            TEPA('请选择要推送的退料单！');
        }
        $ids = explode(',',$input['id']);
        $Material = new MaterialRequisition();
        for ($i=0;$i<count($ids);$i++) {
            $data = $Material->getReturnMaterial($ids[$i]);
            $resp = Soap::doRequest($data, 'INT_MM002200001', '0002');
            if (!isset($resp['RETURNCODE'])) {
                TEA('2454');
            }
            if ($resp['RETURNCODE'] != 0) {   //如果为退料，则需要回滚
                TEPA($resp['RETURNINFO']);
            }
            $updateStatus = 2;  // 生成退料后 推送 状态: 1->2
            //  推送成功
            $Material->updateStatus($ids[$i], $updateStatus);
        }
        return $resp;
    }

    //  根据工单搜索合并退料  shuaijie.feng  8.20/2019
    public function pageIndexlist(&$input)
    {
        $builder = DB::table(config('alias.rwo').' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', 'rwo.production_order_id')
            ->leftJoin(config('alias.rrmr') . ' as rrmr','rwo.id','=','rrmr.work_order_id')
            ->leftJoin(config('alias.rmr') . ' as rmr','rmr.id','=','rrmr.material_requisition_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
            ->where([
                ['rwo.number','=',$input['work_order_code']],
                ['rmr.is_delete','=',0],
                ['rmr.is_merger_picking','=','1']
            ])
            ->select([
                'rmr.id',
                'rmr.code as code',
                'rmr.time',
                'rmr.ctime',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.status',
                'rmr.send_depot',
                'rmr.is_depot_picking',
                'rmr.dispatch_time',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rsd.id as line_depot_id',
                'rsd_s.code as send_depot_code',
                'rsd_s.name as send_depot_name',
                'rsd_s.id as send_depot_id',
            ]);
            $input['total_records'] = $builder->count(DB::raw('distinct rmr.code'));
            $builder->distinct('code')->forPage($input['page_no'], $input['page_size']);
            $objlist = $builder->get();
        foreach ($objlist as $key=>$val) {
            $val->ctime = date('Y-m-d H:i:s', $val->ctime);
        }
        return $objlist;
    }
//endregion

}