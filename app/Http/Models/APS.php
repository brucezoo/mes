<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 2018/9/9
 * Time: 下午3:43
 */

namespace App\Http\Models;//定义命名空间
use App\Libraries\ProductOrderStrategy;
use App\Libraries\ProductOrderStrategy\MesProductOrderStrategy;
use App\Libraries\ProductOrderStrategy\SapProductOrderStrategy;
use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;
use App\Http\Models\WorkOrder;
/**
 * BOM操作类
 * @author kevin
 * @time    2018年9月19日13:39:39
 */
class APS extends Base
{

    public function __construct()
    {
        parent::__construct();
    }

    public function getRules()
    {
        return array(
            'factory_id'   => array('name'=>'factory_id','type'=>'int','require'=>true,'on'=>'simplePlan,getCapacity,carefulPlan','desc'=>'工厂ID'),
            'work_shop_id'   => array('name'=>'work_shop_id','type'=>'int','require'=>true,'on'=>'simplePlan,getCapacity,carefulPlan','desc'=>'车间'),
            'work_task_id'   => array('name'=>'work_task_id','type'=>'int','require'=>true,'on'=>'simplePlan,carefulPlan','desc'=>'工作任务id'),
            'work_center_id'   => array('name'=>'work_center_id','type'=>'int','require'=>true,'on'=>'simplePlan,carefulPlan','desc'=>'工作中心'),
            'operation_id'   => array('name'=>'operation_id','type'=>'int','require'=>true,'on'=>'simplePlan','desc'=>'工序'),
            'operation_ability_id'   => array('name'=>'operation_ability_id','type'=>'int','require'=>true,'on'=>'simplePlan','desc'=>'能力'),
            'work_station_time'   => array('name'=>'work_station_time','type'=>'string','require'=>true,'on'=>'simplePlan','desc'=>'工作时间'),
            'ids'   => array('name'=>'ids','type'=>'array','format'=>'json','require'=>true,'on'=>'simplePlan,carefulPlan','desc'=>'操作ids'),
            'operation_ids'   => array('name'=>'operation_ids','type'=>'array','format'=>'json','require'=>true,'on'=>'getCapacity','desc'=>'工序ids'),
            'start'   => array('name'=>'start','type'=>'string','require'=>true,'on'=>'getCapacity','desc'=>'开始时间'),
            'end'   => array('name'=>'end','type'=>'string','require'=>true,'on'=>'getCapacity','desc'=>'结束时间'),
            'work_center'   => array('name'=>'work_center','type'=>'int','require'=>false,'on'=>'getCapacity','desc'=>'工作中心'),
            'work_shift_id'    => array('name'=>'work_shift_id','type'=>'int','require'=>true,'on'=>'carefulPlan','desc'=>'工作台'),
            'plan_start_time'    => array('name'=>'plan_start_time','type'=>'string','require'=>true,'on'=>'carefulPlan','desc'=>'计划开始时间'),
            'plan_end_time'    => array('name'=>'plan_end_time','type'=>'string','require'=>true,'on'=>'carefulPlan','desc'=>'计划结束时间'),
            'all_select_abilitys'    => array('name'=>'all_select_abilitys','type'=>'array','format'=>'json','require'=>true,'on'=>'simplePlan','desc'=>'工单选择的能力'),
        );
    }

    /**
     * 获取生产订单
     *
     * @param array $input
     * @return mixed
     */
    public function getProductOrder(&$input)
    {
        $where[]=['a1.status','=',2];   // 0 表示未发布   1 表示发布了    2 表示其下的工作任务都拆了
        $builder = DB::table(config('alias.rpo').' as a1')
            ->select('a1.id as product_order_id',
                'a1.number')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->where($where);
        if(!empty($input['operation_ids'])){
            $operation_ids = json_decode($input['operation_ids'],true);
            $builder->whereExists(function($query)use($operation_ids){
                $query->select('roo.production_order_id')->from(config('alias.roo').' as roo')
                    ->whereRaw('a1.id = roo.production_order_id')
                    ->whereIn('roo.operation_id',$operation_ids);
            });
        }
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.rpo').' as a1');
        if (!empty($where)) $count_builder
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 获取生产子订单（工艺单）
     *
     * 分析代码得：oo.status->1 为待排产
     *
     * @param array $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function getWorkTask(&$input)
    {
        if(!isset($input['production_order_id'])) TEA('700','production_order_id');
        $where[]=['a1.status','=',1];
        $where[]=['a1.production_order_id','=',$input['production_order_id']];
        $builder = DB::table(config('alias.roo').' as a1')
            ->select('a1.id as work_task_id',
                'a1.number',
                'a1.operation_id',
                'a1.operation_name',
                'a1.operation_ability_pluck',
                'a1.group_step_withnames'
            )
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
        $operation_ids = json_decode($input['operation_ids'],true);
        if(!empty($operation_ids)){
            $builder->whereIn('a1.operation_id',$operation_ids);
        }
        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.roo').' as a1');
        if (!empty($where)) $count_builder
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 获取工单
     *
     * @param array $input
     * @return mixed
     */
    public function getWorkOrder(&$input)
    {
        (!empty($input['status']) || $input['status'] === 0) &&  $where[]=['a1.status','=',$input['status']];
        !empty($input['work_task_id']) &&  $where[]=['a1.operation_order_id','=',$input['work_task_id']];
        !empty($input['operation_id']) &&  $where[]=['a1.operation_id','=',$input['operation_id']];
        !empty($input['work_station_time']) &&  $where[]=['a1.work_station_time','=',strtotime($input['work_station_time'])];
        (!empty($input['work_shop_id']) && is_numeric($input['work_shop_id'])) && $where[] = ['a1.work_shop_id','=',$input['work_shop_id']];
        (!empty($input['work_center_id']) && is_numeric($input['work_center_id'])) && $where[] = ['a1.work_center_id','=',$input['work_center_id']];
//        !empty($input['production_order_number']) && $where[] = ['po.number', '=', $input['production_order_number']];//生产订单号
//        !empty($input['operation_order_number']) && $where[] = ['a2.number','=', $input['operation_order_number']];//工艺单号

        $builder = DB::table(config('alias.rwo').' as a1')
            ->select('a1.id as work_order_id',
                'a1.number',
                'a2.operation_ability_pluck',
                'a2.operation_id',
                'a2.operation_name',
                'a1.qty',
                'a1.status',
                'a1.operation_order_id as work_task_id',
                'a1.operation_id as wo_operation_id',
                'a1.operation_ability_id',
                'rioa.ability_name',
                'a1.group_step_withnames',
                'a1.total_workhour',
                'unit.commercial',
                'a1.confirm_number_RUECK'
            )
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rioa').' as rioa','rioa.id','=','a1.operation_ability_id')
            ->leftJoin(config('alias.rpo').' as po','po.id','=','a1.production_order_id')
            ->leftJoin(config('alias.ruu').' as unit','unit.id','=','po.unit_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        //whereBetween
        if(isset($input['start_date']) && isset($input['end_date'])) $builder->whereBetween('a1.work_station_time', [strtotime($input['start_date']), strtotime($input['end_date'])]);
        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);

        //get获取接口
        !empty($input['production_order_number']) && $builder->where('po.number',$input['production_order_number']);
        !empty($input['operation_order_number']) && $builder->where('a2.number',$input['operation_order_number']);
        $obj_list = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.rwo').' as a1');
        if (!empty($where)) $count_builder
            ->where($where);
        //whereBetween
        if(isset($input['start_date']) && isset($input['end_date'])) $count_builder->whereBetween('a1.work_station_time', [strtotime($input['start_date']), strtotime($input['end_date'])]);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 获取PO和他下面的WT的所有信息
     *
     * @param array $input
     * @return mixed
     * @autor kevin
     */
    public function getProductOrderInfo(&$input)
    {
        if(!isset($input['production_order_id'])) TEA('700','production_order_id');
        $where1[]=['a1.id','=',$input['production_order_id']];

        $builder = DB::table(config('alias.rpo').' as a1')
            ->select('a1.id as product_order_id',
                'a1.ctime',
                'a1.number',
                'a1.status',
                'a1.qty',
                'a1.scrap',
                'a1.start_date',
                'a1.end_date',
                'a2.description',
                'a1.sales_order_code',
                'a2.name as material_name',
                'a2.item_no as item_no',
                'a1.routing_id',
                'a1.unit_id',
                'a3.commercial'
            )
            ->leftJoin(config('alias.rm').' as a2','a2.id','=','a1.product_id')
            ->leftJoin(config('alias.ruu').' as a3', 'a3.id', '=', 'a1.unit_id')
            ->where($where1);
        //get获取接口
        $obj_po = $builder->first();

        $where2[]=['a2.production_order_id','=',$input['production_order_id']];
        $where2[]=['a2.is_outsource','=','0'];
        $builder = DB::table(config('alias.roo').' as a2')
            ->select('a2.id as wt_id',
                'a2.number',
                'a2.operation_id',
                'a2.operation_name',
                'a2.status as wt_status',
                'a2.qty',
                'a2.out_material_name',
                'a2.belong_bom_id',
                'a2.group_step_withnames',
                //'a2.workhour_package',
                'a2.bom_id',
                'a2.routing_id',
                'a3.item_no',
                'a2.level',
                'a2.code',
                'a2.simple_plan_start_time',
                'a2.simple_plan_end_time',
                'a2.is_outsource'
            )
            ->leftJoin(config('alias.rm').' as a3','a2.out_material_id','=','a3.id');
            //->offset(($input['page_no']-1)*$input['page_size'])
            //->limit($input['page_size']);
        $operation_ids = json_decode($input['operation_ids'],true);
        if(!empty($operation_ids)){
            $builder->whereIn('a2.operation_id',$operation_ids);
        }
        if (!empty($where2)) $builder->where($where2);
        //调整wt的工序顺序按照工艺路线来
        $builder->orderBy( 'routing_operation_order', 'asc');
        //get获取接口
        $obj_wt = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.roo').' as a2');
        if (!empty($where2)) $count_builder
            ->where($where2);
        $input['total_records']=$count_builder->count();
        $work_task=new WorkOrder();
        //对现有wt的数据进行分类汇总
        $workhour_model=new WorkHour();
        if(isset($obj_wt['0']->bom_id) && $obj_wt['0']->bom_id != 0){
            $array_workhour_package = $workhour_model->getAllHoursByBom($obj_wt['0']->bom_id,$obj_wt['0']->routing_id);
        }
        foreach($obj_wt as $key => &$value){
            $wt_id = $value->wt_id;
            //判断wt状态 若wt未拆单 拆wt 否 过滤
            if(!$value->wt_status && $value->is_outsource == 0){
                $work_task->split(['operation_order_id'=>$wt_id,'split_rules'=>json_decode("[$value->qty]",true)]);
                //拆单成功之后状态修改 这时库中状态已为1 返还给前端的状态也及时修改
                $value->wt_status=1;
            }
            //获取该wt下已排和总得wo数量
            $wo_in=DB::table(config('alias.rwo'))
                ->select('SUM(qty) as sum')
                ->where([['operation_order_id', $wt_id], ['status', '<>', 0]])
                ->sum('qty');
            $wo_all = $value->qty;
            $value->wt_completion = $wo_in .'/' .$wo_all;

            //计算wt的预估工时
            $array_total_hours = array();
            $group_step_withnames = json_decode($value->group_step_withnames,true);
            //兼容老版本
//            if(!isset($array_workhour_package)){
//                $array_workhour_package = json_decode($value->workhour_package,true);
//            }
            $bom_id = $value->belong_bom_id;
            if(!empty($array_workhour_package)){
                $array_total_hours = $workhour_model->countTotalHours($bom_id,$group_step_withnames,$wo_all,$array_workhour_package);
            }
            $count_hour = 0;
            foreach($array_total_hours as $value4){
                if(isset($value4['base_hour'])){
                    $count_hour = $count_hour + $value4['base_hour']['total_hour'];
                }
            }
            //预估工时
            $value->wt_estimate_workhour = ceil_dot($count_hour);

            //获取wt底下所有wo的排单时间，用于甘特图
            $wo_count = DB::table(config('alias.rwo'))
                ->where([['operation_order_id', '=', $wt_id],['status', '<>', 0]])
                ->count();

            if($wo_count <= 0 ){
                $value->simple_plan_start_time = '';
                $value->simple_plan_end_time = '';
            }
        }

        //将PO底下的wt进行汇总
        $obj_po->wt_info = $obj_wt;
        return $obj_po;
    }

    /**
     * 主排（粗排）
     *
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function simplePlan($input)
    {
        $this->checkRules($input);
        // 判断是否允许排产
        $result = $this->isAllow($input['work_task_id'],$input['work_station_time']);
        if(!$result) {
            TEA('2405');    // 依赖订单排产时间前尚未完成排产，请先完成依赖订单排产！
        }
        //找到要排工单
        $workOrderList = DB::table(config('alias.rwo'))
            ->whereIn('id',$input['ids'])
            ->where('status',0)
            ->get();
        try{
            DB::connection()->beginTransaction();
            foreach ($workOrderList as $k=>$v){
                $total_workhour = $this->countWorkOrderTotalWorkHour(json_decode($v->current_workhour_package,true),$input['all_select_abilitys']) * $v->qty;
                $data = [
                    'status'=>1,
                    'factory_id'=>$input['factory_id'],
                    'work_shop_id'=>$input['work_shop_id'],
                    'work_center_id'=>$input['work_center_id'],
                    'operation_id'=>$input['operation_id'],
                    'operation_ability_id'=>$input['operation_ability_id'],
                    'work_station_time'=>strtotime($input['work_station_time']),
                    'select_ability_info'=>json_encode($input['all_select_abilitys']),
                    'total_workhour'=>$total_workhour,
                ];
                $res = DB::table(config('alias.rwo'))
                    ->where('id',$v->id)
                    ->update($data);
                if($res === false) TEA('804');
            }
            /**
             * 数据库原来备注：rwo.status 0是未发布，1是发布 ，2是粗排
             *
             * 分析代码结果：rwo.status 0->发布, 1->粗排
             *
             * 所有的 WO 均完成排产之后，oo.status状态更改为 2
             */
            $need = DB::table(config('alias.rwo'))
                ->where([['operation_order_id','=',$input['work_task_id']],['status','=',0]])
                ->first();
            if(empty($need)){
                DB::table(config('alias.roo'))
                    ->where('id', $input['work_task_id'])
                    ->update([
                        'status'=>2,
                    ]);
                $wo = DB::table(config('alias.rwo'))
                    ->whereIn('id', $input['ids'])
                    ->first();
                $tmp = DB::table(config('alias.roo'))
                    ->where([['production_order_id','=',$wo->production_order_id],['status','=',1]])
                    ->count();
                // 所有的 WT排完后，PO状态更新为 3
                if(empty($tmp)){
                    DB::table(config('alias.rpo'))
                        ->where('id', $wo->production_order_id)
                        ->update([
                            'status'=>3,
                        ]);
                }
            }
        }catch (\ApiException $exception){
            DB::connection()->rollBack();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     * @author kevin
     */
    public function carefulPlan($input)
    {
        $this->checkRules($input);
//        $result = $this->isAllow($input['work_task_id']);
//        if(!$result){
//            TEA('2405');
//        }
        $result = DB::table(config('alias.rwo'))
            ->whereIn('id', $input['ids'])
            ->update([
                'status'=>2,
                //'company_id'=>'',
                'factory_id'=>$input['factory_id'],
                'work_shop_id'=>$input['work_shop_id'],
                'work_center_id'=>$input['work_center_id'],
                'work_shift_id'=>$input['work_shift_id'],
                'plan_start_time'=>strtotime($input['plan_start_time']),
                'plan_end_time'=>strtotime($input['plan_end_time']),
                'rank_plan_id'=>isset($input['rank_plan_id']) ? $input['rank_plan_id'] : 0,
                'rank_plan_type_id'=>isset($input['rank_plan_type_id']) ? $input['rank_plan_type_id'] : 0,
            ]);
        if($result===false) TEA('804');
    }

    public function getCapacity($input)
    {
        $this->checkRules($input);
        $start = strtotime($input['start']);
        $end   = strtotime($input['end']);

        !empty($input['factory_id']) &&  $where[]=['a1.factory_id','=',$input['factory_id']];
        !empty($input['work_shop_id']) &&  $where[]=['a1.work_shop_id','=',$input['work_shop_id']];
        !empty($input['work_center']) &&  $where[]=['a1.work_center_id','=',$input['work_center']];
        $where[]=['a1.status','=',1];

        $result = DB::table(config('alias.rwo').' as a1')
            ->select('a1.id','a1.number','a1.operation_id','a1.operation_ability_id','a1.qty','a2.operation_ability_pluck','a1.work_station_time','a1.total_workhour as power')
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->whereBetween('a1.work_station_time', [$start, $end])
            ->whereIn('a1.operation_id',$input['operation_ids'])
            ->where($where)
            ->get();
        foreach ($result as $key=>&$value){
            $value->work_station_time = date('Y-m-d',$value->work_station_time);
//            $ability = json_decode($value->operation_ability_pluck);
//            $id=$value->operation_ability_id;
//            $standard_working_hours = $ability->$id->standard_working_hours;
//            $value->power = $standard_working_hours*$value->qty;
        }
        return $result;

    }

    public function destroy($input)
    {
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('700','id');
        $workorder = DB::table(config('alias.rwo'))->where('id',$input['id'])->first();
        if(empty($workorder)) TEA('700','id');
        if($workorder->status=='2')
        {
            TEPA('请先撤回细排产，再移除！');
        }
        try{
            DB::connection()->beginTransaction();
            $rwo_result = DB::table(config('alias.rwo'))
                ->where('id', $input['id'])
                ->update([
                    'status'=>0,
                ]);
            if($rwo_result===false) TEA('804');
            $roo_res = DB::table(config('alias.roo'))
                ->where([['id','=',$workorder->operation_order_id],['status','=',2]])
                ->update(['status'=>1]);
            if($roo_res === false) TEA('804');
            $rpo_res = DB::table(config('alias.rpo'))
                ->where([['id','=',$workorder->production_order_id],['status','=',3]])
                ->update(['status'=>2]);
            if($rpo_res === false) TEA('804');

            //如果WT下的WO没有排单，得清空WT的排单日期
            $count_wo = DB::table(config('alias.rwo'))
                ->where([['operation_order_id','=',$workorder->operation_order_id],['status','<>',0]])
                ->count();
            if($count_wo <= 0){
                $roo_res2 = DB::table(config('alias.roo'))
                    ->where([['id','=',$workorder->operation_order_id]])
                    ->update(['simple_plan_start_time'=>'','simple_plan_end_time'=>'']);
                if($roo_res2 === false) TEA('804');
            }

        }catch(\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 拆单
     *
     * @param array $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function splitWorkOrder($input)
    {
        $this->checkHasRequisition([$input['id']]);

        $workHourDao = new WorkHour();
        if(empty($input['id']))
            TEA('700','id');
        if(empty($input['qty']))
            TEA('700','qty');
        try {
            DB::connection()->beginTransaction();
            $wo = DB::table(config('alias.rwo'))->where('id','=',$input['id'])->first();
            //原工单要减去拆出去的qty
            $original_qty = $wo->qty - $input['qty'];
            if($original_qty <= 0) TEA('809');
            // 获取未修改前工单数量
            $all_materials = DB::table(config('alias.rwoi'))->where('work_order_id','=',$input['id'])->pluck('qty','material_id')->toArray();
            //重新计算进出料
//            $original_in_material = json_encode(array_map(function($material)use($original_qty){
//                $material['qty'] = round($material['usage_number'] * $original_qty,3);
//                return $material;
//            },json_decode($wo->in_material,true)));
//            $original_out_material = json_encode(array_map(function($material)use($original_qty){
//                $material['qty'] = round($material['usage_number'] * $original_qty,0);
//                return $material;
//            },json_decode($wo->out_material,true)));

            //节约数据表资源，重新获取总工时包
            if($wo->bom_id != 0){
                $array_workhour_package = $workHourDao->getAllHoursByBom($wo->bom_id,$wo->routing_id);
            }else{
                $array_workhour_package = json_decode($wo->workhour_package,true);
            }

            $original_workhour_package = $workHourDao->countTotalHours($wo->belong_bom_id, json_decode($wo->group_step_withnames, true), $original_qty, $array_workhour_package);
            $select_ability_info = json_decode($wo->select_ability_info, true);
            if(!is_array($select_ability_info)){
                $select_ability_info = json_decode($select_ability_info, true);
            }
            if($wo->status == 1){
                $update_total_workhour = $this->countWorkOrderTotalWorkHour($original_workhour_package, $select_ability_info);
            }else{
                $update_total_workhour = 0;
            }
            $or_res = DB::table(config('alias.rwo'))
                ->where('id', $input['id'])
                ->update([
                    'qty'=>$original_qty,
                    'total_workhour'=>$update_total_workhour,
                ]);
            if(!$or_res) TEA('810');

            //原始工单进出料进行更新
            $this->updateOrderItem($input['id'],$original_qty);

            //更新质检单
            $this->updateIPQCOrder($input['id'],'update');

            //要拆出去的qty
            $qty = $input['qty'];

            //拆单时，总工时得重新计算
            $current_workhour_package2 = $workHourDao->countTotalHours($wo->belong_bom_id,json_decode($wo->group_step_withnames,true),$input['qty'],$array_workhour_package);
            if($wo->status == 1){
                $split_total_insert_hours = $this->countWorkOrderTotalWorkHour($current_workhour_package2, $select_ability_info);
            }else{
                $split_total_insert_hours = 0;
            }

            $now_wo_number = get_order_sn('WO');
            $data=[
                'number'=>$now_wo_number,
                'production_order_id'=>$wo->production_order_id,
                'confirm_number_RUECK'=>$wo->confirm_number_RUECK,
                'factory_id' => $wo->factory_id,
                'work_shop_id' => $wo->work_shop_id,
                'work_center_id'=>$wo->work_center_id,
                'work_station_time'=>$wo->work_station_time,
                'operation_order_id'=>$wo->operation_order_id,
                'operation_id'=>$wo->operation_id,
                'operation_ability_id'=>$wo->operation_ability_id,
                'is_end_operation'=>$wo->is_end_operation,
                'qty'=>$input['qty'],
                'admin_id'=>(!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0,
                'created_at'=>time(),
                'status'=>$wo->status,
                'belong_bom_id'=>$wo->belong_bom_id,
                'group_step_withnames'=>$wo->group_step_withnames,
                'select_ability_info'=>$wo->select_ability_info,
                //'group_routing_package'=>json_encode($RoutingModel->addQtyInRoutingPackage(json_decode($wo->group_routing_package,true),$input['qty'],'','')),
                //####工时包不存数据表，后期使用重新获取
                //'current_workhour_package'=>json_encode($workHourDao->countTotalHours($wo->belong_bom_id,json_decode($wo->group_step_withnames,true),$input['qty'],json_decode($wo->workhour_package,true))),
                'total_workhour'=>$split_total_insert_hours,
                //'workhour_package'=>$wo->workhour_package,
                'routing_operation_index'=>$wo->routing_operation_index,
                'routing_step_index'=>$wo->routing_step_index,
                'routing_node_id'=>$wo->routing_node_id,
                'group_index'=>$wo->group_index,
                'bom_id' => $wo->bom_id,
                'routing_id' => $wo->routing_id
            ];
            $insert_id = DB::table(config('alias.rwo'))->insertGetId($data);
            if(!$insert_id) TEA('814');

            //工单进出料进行拆分
            $this->splitOrderItem($input['id'],$insert_id,$now_wo_number,$qty,$all_materials);
            //新增质检单
            $this->updateIPQCOrder($input['id'],'insert',$insert_id);

        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        if (!$insert_id) TEA('802');
        return $insert_id;
    }

    /**
     * 合并工单
     * @param array $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function mergeWorkOrder($input)
    {
        $array_workorder_ids = json_decode($input['work_order_ids'],true);
        //进行下校验，如果有已排的工单给出提示
        $exist_order = DB::table(config('alias.rwo'))->select('status')
            ->where([['status','<>',0]])
            ->whereIn('id',$array_workorder_ids)->get();
        if(count($exist_order) > 0) TEA('822');

        //获取当前工单的qty总和
        $sum_qty = DB::table(config('alias.rwo'))->whereIn('id',$array_workorder_ids)->SUM('qty');
        if($sum_qty <= 0) TEA('823');

        //合并入第一个工单
        $first_work_order_id = $array_workorder_ids['0'];
        //一个工单不需要合并
        $one_qty = DB::table(config('alias.rwo'))->select('qty')->where('id',$first_work_order_id)->first();
        if($sum_qty == $one_qty->qty) TEA('824');

        //取得剩余的工单
        $tmp = [$first_work_order_id];
        $left_workorder_ids = array_diff($array_workorder_ids,$tmp);

        try {
            DB::connection()->beginTransaction();
            $or_res = DB::table(config('alias.rwo'))
                ->where('id', $first_work_order_id)
                ->update([
                    'qty'=>$sum_qty,
                ]);
            if(!$or_res) TEA('810');

            //原始工单进出料进行更新
            $this->updateOrderItem($first_work_order_id,$sum_qty);

            //更新质检单
            $this->updateIPQCOrder($first_work_order_id,'update');

            //将其余工单和其关联的质检单删除
            $this->deleteWorkAndIPQCOrder($left_workorder_ids);

        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();

    }

    public function deleteWorkAndIPQCOrder($left_workorder_ids)
    {
        DB::table(config('alias.rwo'))->whereIn('id',$left_workorder_ids)->delete();
        DB::table(config('alias.rwoi'))->where('work_order_id',$left_workorder_ids)->delete();

        DB::table(config('alias.rqc'))->whereIn('work_order_id',$left_workorder_ids)->delete();
    }

    public function updateOrderItem($origin_order_id,$qty)
    {
        $all_order_item = DB::table(config('alias.rwoi'))->where('work_order_id','=',$origin_order_id)->get();
        foreach ($all_order_item as $item){
            $now_qty = round($item->usage_number * $qty,3);
            if(($item->bom_commercial == 'PC' || $item->bom_commercial == 'EA') && $item->type == 0){
//                $decimal_arr = explode(".",$now_qty);
//                if(isset($decimal_arr['1']) && $decimal_arr['1'] != '5'){
//                    $now_qty = round($now_qty);
//                }
                $now_qty = round($now_qty);
            }
            $update_data = [
                'qty' => $now_qty,
            ];
            $res = DB::table(config('alias.rwoi'))->where('id',$item->id)->update($update_data);
            if(!$res) TEA('811');
        }
    }

    public function splitOrderItem($origin_order_id,$insert_id,$wo_number,$qty,$all_materials)
    {
        $all_order_item = DB::table(config('alias.rwoi'))->where('work_order_id','=',$origin_order_id)->get();
        $insert_data = [];
        foreach ($all_order_item as $item){
            $now_qty = round($item->usage_number * $qty,3);
            if(($item->bom_commercial == 'PC' || $item->bom_commercial == 'EA') && $item->type == 0){
//                $decimal_arr = explode(".",$now_qty);
//                if(isset($decimal_arr['1']) && $decimal_arr['1'] != '5'){
//                    $now_qty = round($now_qty);
//                }
                $now_qty = isset($all_materials[$item->material_id]) ? $all_materials[$item->material_id] - $item->qty  : round($now_qty) ;
            }
            $insert_data[] = [
                'production_order_id' => $item->production_order_id,
                'work_order_id' => $insert_id,
                'work_order_code' => $wo_number,
                'type' => $item->type,
                'material_category_id' => $item->material_category_id,
                'material_id' => $item->material_id,
                'material_code' => $item->material_code,
                'material_replace_code' => $item->material_replace_code,
                'special_stock' => $item->special_stock,
                'bom_unit_id' => $item->bom_unit_id,
                'bom_commercial' => $item->bom_commercial,
                'usage_number' => $item->usage_number,
                'loss_rate' => $item->loss_rate,
                'qty' => $now_qty,
                'LGPRO' => $item->LGPRO,
                'LGFSB' => $item->LGFSB,
                'desc' => $item->desc,
                'ctime' => time(),
            ];
        }
        $res = DB::table(config('alias.rwoi'))->insert($insert_data);
        if(!$res) TEA('815');
    }

    /**
     * 拆单时更新质检单中的qty
     * @param 工单id，type：update/insert
     * @throws \App\Exceptions\ApiException
     * author kevin
     */
    public function updateIPQCOrder($work_order_id,$type = 'update',$new_work_order_id = 0)
    {
        $work_order_info = $this->getWorkOrderInfo($work_order_id);
        //根据工序的字段决定是否生成送检单
        $obj_is_ipqc = DB::table(config('alias.rio'))->select('is_ipqc')->where('id', '=', $work_order_info->operation_id)->first();

        if ($obj_is_ipqc->is_ipqc == 1) {
            if ($type == 'update') {
                $out_material = DB::table(config('alias.rwoi'))->where([['work_order_id','=',$work_order_id],['type','=',1]])->get();
                foreach ($out_material as $out) {
                    $res = DB::table(config('alias.rqc'))
                        ->where([['work_order_id', '=', $work_order_id], ['material_id', '=', $out->material_id]])
                        ->update([
                            'order_number' => $out->qty
                        ]);
                    if(!$res) TEA('812');
                }

            } else if($type == 'insert'){
                $new_work_order_info = $this->getWorkOrderInfo($new_work_order_id);
                $new_out_material = DB::table(config('alias.rwoi'))->where([['work_order_id','=',$work_order_id],['type','=',1]])->get();

                foreach ($new_out_material as $new_out) {
                    //将老工单生成的ipqc单copy过来，修改数量和工单id，code
                    $obj_ipqc_order = $this->getIPQCOrder($work_order_id,$new_out->material_id);

                    /**
                     *  IPQC号重新生成
                     */
                    $i = 0;
                    do{
                        $i++;
                        // 处理检验单号
                        // 当前时间
                        $nowtime = date("YmdHis", time());
                        // 增强验证 添加毫秒
                        list($msec, $sec) = explode(' ', microtime());
                        $msectime = (float)sprintf('%.0f', (floatval($msec) + floatval($sec)) * 1000);
                        // 取毫秒后四位
                        $msectime = substr($msectime,7,4);
                        $round_no = rand(0, 99);
                        $code = 'ipqc' . $nowtime .$msectime. $round_no; // 检验单号 ipqc开头 + 时间 + 毫秒后六位+ 两位随机数字
                        $count = DB::table('ruis_qc_check')->where('code',$code)->count();
                        if($count === 0 ) break;
                    } while($i <= 10);

                    $keyVal['amount_of_inspection'] = $obj_ipqc_order->amount_of_inspection;
                    $keyVal['material_id'] = $obj_ipqc_order->material_id;
                    $keyVal['MATNR'] = $obj_ipqc_order->MATNR;
                    $keyVal['check_time'] = time();
                    $keyVal['order_number'] = $new_work_order_info->qty;
                    $keyVal['ctime'] = time();
                    $keyVal['attr'] = $obj_ipqc_order->attr;
                    $keyVal['operation_id'] = $obj_ipqc_order->operation_id;
                    $keyVal['unit'] = $obj_ipqc_order->unit;
                    #$keyVal['code'] = $obj_ipqc_order->code;
                    $keyVal['code'] = $code;
                    $keyVal['check_resource'] = 2;
                    $keyVal['work_order_id'] = $new_work_order_id;
                    $keyVal['production_order_id'] = $obj_ipqc_order->production_order_id;
                    $keyVal['wo_number'] = $new_work_order_info->wo_number;
                    $keyVal['result'] = 0;
                    $keyVal['sub_number'] = $obj_ipqc_order->sub_number;
                    $keyVal['sub_order_id'] = $obj_ipqc_order->sub_order_id;
                    $keyVal['checker'] = $obj_ipqc_order->checker;
                    $insert_id2 = DB::table(config('alias.rqc'))->insertGetId($keyVal);
                    if(!$insert_id2) TEA('813');
                }
            }
        }
    }

    public function getWorkOrderInfo($wo_id)
    {
        $obj = DB::table(config('alias.rwo').' as rwo')
            ->select(
                'rwo.id as wo_id',
                'rwo.number as wo_number',
                'roo.number as wt_number',
                'rwo.operation_id',
                'rwo.qty',
                'rwo.work_center_id',
                'rwo.is_end_operation',
                'rwo.status',
                'rwo.group_step_withnames',
                'rwo.group_routing_package',
                //'rwo.current_workhour_package',
                'rwo.routing_operation_index',
                'rwo.routing_node_id',
                'rwo.in_material',
                'rwo.out_material',
                'rwo.confirm_number_RUECK'
            )
            ->leftJoin(config('alias.roo').' as roo', 'roo.id', '=', 'rwo.operation_order_id')
            ->where('rwo.id','=',$wo_id)
            ->first();
        if (!$obj) TEA('802');
        return $obj;
    }

    public function getIPQCOrder($wo_id,$material_id)
    {
        $obj = DB::table(config('alias.rqc').' as rqc')
            ->select('*')
            ->where([['work_order_id', '=', $wo_id], ['material_id', '=', $material_id]])
            ->first();
        if (!$obj) TEA('802');
        return $obj;
    }

    /**
     * @param int $id ruis_operation_order.id 工艺单
     * @param string $time 日期：y-m-d
     * @return bool
     * @since lester.you 添加注释
     */
    public function isAllow($id,$time)
    {
        //$oo      = DB::table(config('alias.roo'))->where('id','=',$id)->first();
        $model   = new OperationOrder();
        $rely_on = $model->getOperationOrderSons($id);  // 获取工艺单
        /**
         * 排产需要先排下一级，才能排当前一级.
         *
         * 如果下一级为空，可以允许当前排产;
         * r
         */
        if(empty($rely_on)){
            return true;
        }else{
            $ids = array_keys($rely_on);
            //TODO 添加后续的一些状态 目前只有1为可用
            // 获取 给定的时间之前 子工艺单的WO 已完成粗排的数量
            $real = DB::table(config('alias.rwo'))
                ->select('id','qty','operation_order_id')
                ->whereIn('operation_order_id',$ids)
                ->where([['status','=',1],['work_station_time','<=',strtotime($time)]])
                ->count();
            // 获取 子工艺单 下 所有的 WO
            $need = DB::table(config('alias.rwo'))
                ->select('id','qty','operation_order_id')
                ->whereIn('operation_order_id',$ids)
                ->count();
            // 如果 总的WO和已排产的WO相等，即 子工艺单所有的WO均已完成排产
            if($real == $need){
                return true;
            }else{
                return false;
            }

            //TODO 注释部分是存在做一半拿一半的情况
//            if(empty($all)){
//                return false;
//            }else{
//                $tmp =   obj2array($all);
//                foreach ($rely_on as $key=>$value){
//                    $rely_on[$key]['detail'] =0;
//                    foreach ($tmp as $row){
//                        if($key == $row['operation_order_id']){
//                            $rely_on[$key]['detail'] = $rely_on[$key]['detail']+$row['qty'];
//                        }
//                    }
//                }
//
//            }

        }
    }

    /**
     * 判断能否排产
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author kevin
     */
    public function checkCanPlan($input){
        //先判断产能够不够用
        //找到哪些工单
        $ids = json_decode($input['ids'],true);
        $workOrderList = DB::table(config('alias.rwo'))
                        ->whereIn('id',$ids)
                        ->where('status',0)
                        ->get();
        if(empty($workOrderList)) TEA('1600');
        //找到车间或工作中心的工序的能力的产能
        //先找到车间或工作中心下班次，因为班次是维护在工作中心层的
        $rankWhere = [];
        $rankWhere[] = ['rwc.workshop_id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $rankWhere[] = ['rwc.id','=',$input['workcenter_id']];
        $workcenterRankList = DB::table(config('alias.rwcr').' as rwcr')
            ->leftJoin(config('alias.rwc').' as rwc','rwcr.workcenter_id','rwc.id')
            ->leftJoin(config('alias.rrp').' as rrp','rwcr.rankplan_id','rrp.id')
            ->select('rrp.work_time','rrp.work_date','rwcr.workcenter_id')
            ->where($rankWhere)->get();
        //处理一下班次的workdate的json数据
        foreach ($workcenterRankList as $k=>&$v){
            $v->work_date = json_decode($v->work_date,true);
        }
        //找到具有选择的能力的工作台，并且要带出工作中心才能算出该车间或者该工作中心下该能力的产能
        $workBenchWhere = [];
        $workBenchWhere[] = ['rwc.workshop_id','=',$input['workshop_id']];
        $workBenchWhere[] = ['rwboa.operation_to_ability_id','=',$input['workcenter_operation_to_ability_id']];
        if(!empty($input['workcenter_id'])) $workBenchWhere[] = ['rwc.id','=',$input['workcenter_id']];
        $workbenchList = DB::table(config('alias.rwboa').' as rwboa')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwboa.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwb.workcenter_id')
            ->where($workBenchWhere)
            ->pluck('rwb.workcenter_id');
        //计算产能
        $capacity = 0;
        foreach ($workbenchList as $k=>$v){
            foreach ($workcenterRankList as $w=>$j){
                if($v == $j->workcenter_id && in_array($input['week_date'],$j->work_date)){
                    $capacity += $j->work_time;
                }
            }
        }
        //所有工单根据前端选择的工单的能力计算总工时
        $all_select_abilitys = json_decode($input['all_select_abilitys'],true);
        $allWorkOrderTotalWorkHour = 0;
        $alertMessage = [];
        foreach ($workOrderList as $k=>$v){
            //如果有顺序比较小的工单应该给出提醒,不应该在循环内做查询，但是不知道怎么换
            $moreSmallIndexWorkOrderList = DB::table(config('alias.rwo'))->select('id')
                ->where('production_order_id',$v->production_order_id)
                ->whereNotIn('id',$ids)
                ->whereRaw('(routing_operation_index < ? or routing_step_index < ?)',[$v->routing_operation_index,$v->routing_step_index])
                ->get();
            if(!empty($moreSmallIndexWorkOrderList)){
                $alertMessage[] = "有工序或者步骤在 $v->number 前的工单";
            }
            $allWorkOrderTotalWorkHour += $this->countWorkOrderTotalWorkHour(json_decode($v->current_workhour_package,true),$all_select_abilitys) * $v->qty;
        }
        //如果车间或工作中心拿出来的产能为0或者小于所有工单的总工时，直接抛出异常
        if($capacity <= 0 || $capacity < $allWorkOrderTotalWorkHour) TEA('1601');
        return $alertMessage;
    }

    /**
     * 根据选择的步骤的能力计算工单的总工时
     * @param $workorder_current_workhour_package
     * @param $select_ability
     * @author kevin
     */
    public function countWorkOrderTotalWorkHour($workorder_current_workhour_package,$select_ability){
        $total_workHour = 0;
        foreach ($select_ability as $k=>$v){
            //能力不选或者当前工时包中步骤不存在
            if(empty($v) || empty($workorder_current_workhour_package[$k])) continue;
            //步骤下能力为空或者步骤下能力的total_hour为空为0
            if(empty($workorder_current_workhour_package[$k][$v]) || empty($workorder_current_workhour_package[$k][$v]['total_hour'])){
                $total_workHour += isset($workorder_current_workhour_package[$k]['base_hour']['total_hour']) ? $workorder_current_workhour_package[$k]['base_hour']['total_hour'] : 0;
            }else{
                $total_workHour += $workorder_current_workhour_package[$k][$v]['total_hour'];
            }
        }
        return $total_workHour;
    }

    /**
     * 要做排产的预估工时，实际工时乘以系数后误差会特别大，现在只取标准工时来计算
     * 根据选择的步骤的能力计算工单的总工时
     * @param $workorder_current_workhour_package
     * @param $select_ability
     * @author kevin
     */
    public function countWorkOrderTotalWorkHour2($workorder_current_workhour_package,$select_ability){
        $total_workHour = 0;
        foreach ($select_ability as $k=>$v){
            //能力不选或者当前工时包中步骤不存在
            if(empty($v) || empty($workorder_current_workhour_package[$k])) continue;
            //步骤下能力为空或者步骤下能力的total_hour为空为0
            if(empty($workorder_current_workhour_package[$k][$v]) || empty($workorder_current_workhour_package[$k][$v]['total_hour'])){
                $total_workHour += isset($workorder_current_workhour_package[$k]['base_hour']['sign_hours']) ? $workorder_current_workhour_package[$k]['base_hour']['sign_hours'] : 0;
            }else{
                $total_workHour += $workorder_current_workhour_package[$k][$v]['sign_hours'];
            }
        }
        return $total_workHour;
    }

    /**
     * 要做排产的预估工时，实际工时乘以系数后误差会特别大，现在只取标准工时来计算
     * 根据选择的步骤的能力计算工单的总工时
     * @param $workorder_current_workhour_package
     * @param $select_ability
     * @author kevin
     */
    public function countOtherWorkHour($workorder_current_workhour_package,$select_ability){
        $total_workHour = 0;
        foreach ($select_ability as $k=>$v){
            //能力不选或者当前工时包中步骤不存在
            if(empty($v) || empty($workorder_current_workhour_package[$k])) continue;
            //步骤下能力为空或者步骤下能力的total_hour为空为0
            if(empty($workorder_current_workhour_package[$k][$v]) || empty($workorder_current_workhour_package[$k][$v]['sign_hours'])){
                if(isset($workorder_current_workhour_package[$k]['base_hour'])){
                    $total_workHour = $total_workHour + $workorder_current_workhour_package[$k]['base_hour']['sample_hours']
                        + $workorder_current_workhour_package[$k]['base_hour']['liuzhuan']
                        + $workorder_current_workhour_package[$k]['base_hour']['preparation_hour'];
                }
            }else{
                $total_workHour = $total_workHour + $workorder_current_workhour_package[$k][$v]['sample_hours']
                    + $workorder_current_workhour_package[$k][$v]['liuzhuan']
                    + $workorder_current_workhour_package[$k][$v]['preparation_hour'];
            }
        }
        return $total_workHour;
    }

    public function getCarefulPlan($input)
    {
        if(isset($input['plan_start_time']) && $input['plan_start_time'] != 0){
            $start_time = strtotime(date('Y-m-d 00:00:00' ,$input['plan_start_time']));
            $end_time = strtotime(date('Y-m-d 23:59:59' ,$input['plan_start_time']));
            $where[]=['a1.plan_start_time','>=',$start_time];
            $where[]=['a1.plan_start_time','<=',$end_time];
            $weekday = date("w",strtotime($input['plan_start_time']));
        }else{
            $where[]=['a1.work_station_time','=',strtotime($input['time'])];
            $weekday = date("w",strtotime($input['time']));
            //$time = strtotime($input['time']);
        }

        //细排更改的工作中心，这边也取最新的工作中心
//        if(isset($input['actual_work_center_id']) && $input['actual_work_center_id'] != 0){
//            $work_center_id = $input['actual_work_center_id'];
//        }else{
//            $work_center_id=$input['work_center_id'];
//        }
        $work_center_id=$input['work_center_id'];
        $where[]=['a1.work_center_id','=',$work_center_id];
        $where[]=['a1.status','=',2];
        //该工作中心下的所有工作台
       $work_bench = DB::table(config('alias.rwb'))
           ->select('id','name','factor')
           ->where('workcenter_id',$work_center_id)
           ->get();
       $result = DB::table(config('alias.rwo').' as a1')
           ->select('a1.id as work_order_id','a1.number','a1.plan_start_time','a1.plan_end_time','a1.work_shift_id','a2.name','a1.total_workhour','rpo.sales_order_code as so_number','rpo.number  as po_number','rm.item_no  as product_code','rm.name  as product_name')
           ->where($where)
           ->leftJoin(config('alias.rwb').' as a2','a2.id','=','a1.work_shift_id')
           ->leftJoin(config('alias.rpo').' as rpo','rpo.id','=','a1.production_order_id')
           ->leftJoin(config('alias.rm').' as rm','rm.id','=','rpo.product_id')
           ->orderBy('a1.plan_start_time','desc')
           ->get();
        $data = [];
       foreach ($work_bench as $row){
           $row_tmp['work_bench_id']  = $row->id;
           $row_tmp['name']           = $row->name;
           $data[$row->id]  = $row_tmp;
           $data[$row->id]['task_list'] = array();
           //工作台关联的设备
           $device=DB::table(config('alias.rwbdi').' as bench_device')
               ->leftJoin(config('alias.rdlt').' as device','bench_device.device_id','device.id')
               ->where('bench_device.workbench_id',$row->id)
               ->where('bench_device.device_id','<>',0)
               ->select('device.id','device.code','device.name')
               ->get();
           $data[$row->id]['device'] = obj2array($device);

           //计算总产能
           $capacity = $this->getCapacityByWorkbench($row->id,$weekday,$row->factor);
           $data[$row->id]['total_capacity'] = $capacity;
           $data[$row->id]['used_capacity'] = 0;
       }
       foreach ($result as $key=>$value){
           $tmp['work_bench_id']  = $value->work_shift_id;
           $tmp['name']  = $value->name;
           $tmp_child['number'] = $value->number;
           $tmp_child['plan_start_time'] = $value->plan_start_time==null?'':date('Y-m-d H:i:s',$value->plan_start_time);
           $tmp_child['plan_end_time'] = $value->plan_end_time==null?'':date('Y-m-d H:i:s',$value->plan_end_time);
           $tmp_child['time'] = $value->plan_end_time-$value->plan_start_time;
           $tmp_child['total_workhour'] = $value->total_workhour;
           $tmp_child['so_number'] = $value->so_number;
           $tmp_child['po_number'] = $value->po_number;
           $tmp_child['product_code'] = $value->product_code;
           $tmp_child['product_name'] = $value->product_name;
           if(isset($data[$value->work_shift_id])){
               $data[$value->work_shift_id]['task_list'][] = $tmp_child;
               $data[$value->work_shift_id]['used_capacity'] += $value->total_workhour;
           }else{
               $data[$value->work_shift_id]=$tmp;
               $data[$value->work_shift_id]['task_list'][] = $tmp_child;
           }
       }
       return array_values($data);
    }

    public function getCapacityByWorkbench($bench_id,$week,$factor = 1)
    {
        $rwcWhere = [];
        $rwcWhere[] = ['rwb.id','=',$bench_id];
        $workcenterOperationAbilityCount = DB::table(config('alias.rwb').' as rwb')
            ->leftJoin(config('alias.rwboa').' as rwboa','rwb.id','rwboa.workbench_id')
            ->select('rwboa.operation_to_ability_id',DB::raw('count(rwb.id) as num'))
            ->where($rwcWhere)->count();
        if(empty($workcenterOperationAbilityCount)) TEA('1607');

        //先找到车间或工作中心下班次，因为班次是维护在工作中心层的
        $rankWhere = [];
        $rankWhere[] = ['rwb.id','=',$bench_id];
        $workcenterRankList = DB::table(config('alias.rwcr').' as rwcr')
            ->leftJoin(config('alias.rwc').' as rwc','rwcr.workcenter_id','rwc.id')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.workcenter_id','rwc.id')
            ->leftJoin(config('alias.rrp').' as rrp','rwcr.rankplan_id','rrp.id')
            ->select('rrp.work_time','rrp.work_date','rwcr.workcenter_id')
            ->where($rankWhere)->get();
        //处理一下班次的workdate的json数据
        foreach ($workcenterRankList as $k=>&$v){
            $v->work_date = json_decode($v->work_date,true);
        }
        //一种能力的产能
        $capacity = 0;
        foreach ($workcenterRankList as $w=>$j){
            if(in_array($week,$j->work_date)){
                $capacity += $j->work_time;
            }
        }
        //考虑生成产能包太浪费效率，这边直接根据星期几和能力，计算当天的总产能
        $capacity = round($capacity * $workcenterOperationAbilityCount,3);

        return $capacity * $factor;
    }

    /**
     * 分发策略
     * @param ProductOrderStrategy $strategy
     * @return mixed
     * @author Bruce.Chu
     */
    public function setStrategy(ProductOrderStrategy $strategy)
    {
        return $strategy->getWorkCenterInfo();
    }

    /**
     * 拉出生产该PO的工作中心相关信息+产能计算
     * @param $input
     * @return array
     * @author Bruce.Chu
     */
    public function getWorkCenterInfo($input)
    {
        //根据PO来源 应用不同策略 来源 1:Mes,2:Erp,3:Sap
        $from=$this->getFieldValueById($input['production_order_id'],'from',config('alias.rpo'));
        //PHP单次请求结束之后会释放内存 单例也就不存在了 因而废弃单例模式
        if($from==3) $strategy = new SapProductOrderStrategy($input);
        if($from==1) $strategy = new MesProductOrderStrategy($input);
        return $this->setStrategy($strategy);
    }

    /**
     * 查询所有的工作中心
     * @return mixed
     * @author Bruce.Chu
     */
    public function showAllWorkCenters()
    {
        //找到所有厂
        $factorys=DB::table(config('alias.rf'))->select('id as factory_id','name as factory_name')->orderBy('code')->get();
        foreach ($factorys as $factory){
            //找到厂下属的所有工作车间
            $factory->workshops=DB::table(config('alias.rws'))->select('id as workshop_id','name as workshop_name')->where('factory_id',$factory->factory_id)->get();
            foreach($factory->workshops as $workshop){
                //找到车间下属的所有工作中心
                $workshop->workcenters=DB::table(config('alias.rwc'))->select('id as workcenter_id','name as workcenter_name')->where('workshop_id',$workshop->workshop_id)->get();
            }
        }
        return $factorys;
    }

    /**
     * 查询指定工作中心绑定的排班
     * @param $input
     * @return array
     * @author Bruce.Chu
     */
    public function showWorkCenterRankPlan($input)
    {
        //细排更改的工作中心，这边也取最新的工作中心
//        if(isset($input['actual_work_center_id']) && $input['actual_work_center_id'] != 0){
//            $workcenter_id = $input['actual_work_center_id'];
//        }else{
//            $workcenter_id=$input['work_center_id'];
//        }
        $workcenter_id=$input['work_center_id'];

        //前端传递 工单的细排日期
        $work_station_time=strtotime($input['work_station_time']);
        //拿到该工作中心绑定的排班id
        $rank_plan_ids=DB::table(config('alias.rwcr'))->where('workcenter_id',$workcenter_id)->pluck('rankplan_id');
        //判断前端传递的日期是周几
        $time_week=date('w',$work_station_time);
        //排班信息 班次名称 排班可能有多个
        $rank_plan=DB::table(config('alias.rrp').' as plan')
            ->leftJoin(config('alias.rrpt').' as plan_type','plan.type_id','plan_type.id')
            ->select('plan.from as work_time_start','plan.to as work_time_end','plan.work_date',
                'plan.rest_time','plan.id as rank_plan_id','plan.work_time','plan_type.name','plan_type.id as rank_plan_type_id')
            ->whereIn('plan.id',$rank_plan_ids)
            ->get();
        //筛出包含前端传递日期的排班
        $rank_plan=array_filter(obj2array($rank_plan),function($value) use($time_week){
            return in_array($time_week,json_decode($value['work_date']));
        });
        //格式化返回给前端的数据 工作休息时长等数据
        foreach ($rank_plan as &$plan){
            unset($plan['work_date']);
            $rest_time=json_decode($plan['rest_time']);
            $plan['rest_time_start']=$rest_time[0]->rest_from;
            $plan['rest_time_end']=$rest_time[0]->rest_to;
            unset($plan['rest_time']);
        }
        //排班按照开始上班时间升序排序
        array_multisort($rank_plan);
        return $rank_plan;
    }

    /**
     * 格式化指定日期的所有工单
     * @param $input
     * @return array
     */
    public function getWorkOrdersByDate($input)
    {
        //按员工档案那配置的生产单元，按厂对po进行划分
        $admin_id = session('administrator')->admin_id;
        $admin_is_super = session('administrator')->superman;
        $where2=[['re.admin_id','=',$admin_id]];
        $emploee_info = DB::table(config('alias.re'). ' as re')
            ->select('re.id', 're.factory_id', 're.workshop_id')
            ->where($where2)
            ->first();
        if(!empty($emploee_info)) {
            if ($admin_is_super != 1) {
                if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                    $where[] = ['wo.factory_id', '=', $emploee_info->factory_id];//区分到厂
                    $emploee_factory_id = $emploee_info->factory_id;
                } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                    $where[] = ['wo.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                    $emploee_factory_id = $emploee_info->factory_id;
                }
            }
        }
        ####

        $where=[['wo.work_station_time',strtotime($input['work_station_time'])],['wo.status','<>',0]];
        !empty($input['production_order_number']) && $where[] = ['po.number', '=', $input['production_order_number']];//生产订单号
        !empty($input['work_order_number']) && $where[] = ['wo.number','=', $input['work_order_number']];//工艺单号

        //查询指定日期的所有工单
        $work_orders=DB::table(config('alias.rwo').' as wo')
            ->leftJoin(config('alias.rpo').' as po','po.id','wo.production_order_id')
            ->leftJoin(config('alias.ruu').' as unit','unit.id','po.unit_id')
            ->leftJoin(config('alias.rwc').' as work_center','work_center.id','wo.work_center_id')
            ->leftJoin(config('alias.rioa').' as ability','ability.id','wo.operation_ability_id')
            ->select('wo.id as work_order_id','wo.number','wo.qty','wo.work_center_id','wo.work_shop_id',
                'wo.status','wo.factory_id', 'wo.operation_id','wo.total_workhour','unit.commercial',
                'wo.operation_ability_id','work_center.name as work_center_name','ability.ability_name')
            ->where($where)
            ->get();
        //转为数组 方便使用
        $work_orders=obj2array($work_orders);
        //取出工单列表的厂的集合 去重 索引置0
        $factory_ids=array_column($work_orders,'factory_id');
        $factory_ids=array_values(array_unique($factory_ids));
        //声明结果返回数组
        $result=[];
        //格式化工单层级结构 厂->工序->工单
        foreach ($factory_ids as $key=>$factory_id){
            if(isset($emploee_factory_id) && $factory_id != $emploee_factory_id){
                continue;
            }
            //厂的基础信息 包括厂id 厂名 工单在该厂下的工序
            $factory_name=DB::table(config('alias.rf'))->where('id',$factory_id)->value('name');
            //筛出每个厂下面的工单
            $factory_wo=array_values(array_filter($work_orders,function($value) use($factory_id){
                return ($value['factory_id']===$factory_id);
            }));
            //取出该厂工单所使用的工序 去重 索引置0
            $operation_ids=array_column($factory_wo,'operation_id');
            $operation_ids=array_values(array_unique($operation_ids));
            //声明工序数组 厂的下一级
            $operation_info=[];
            foreach ($operation_ids as $k=>$operation_id){
                //工序的基础信息 包括工序id 工序名 在该厂使用该工序的工单
                $operation_name=DB::table(config('alias.rio'))->where('id',$operation_id)->value('name');
                $operation_wo=array_values(array_filter($factory_wo,function ($value) use ($operation_id){
                    return ($value['operation_id']===$operation_id);
                }));
                //填充工序数组
                $operation_info[$k]=['operation_id'=>$operation_id,'operation_name'=>$operation_name,'work_orders'=>$operation_wo];
            }
            //填充厂数组
            $factory_info=['factory_id'=>$factory_id,'factory_name'=>$factory_name,'operations'=>$operation_info];
            //填充结果返回数组
            $result[]=$factory_info;
        }
        return $result;
    }

    /**
     * 按时间段排产的校验
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author kevin
     */
    public function checkCanPlanByPeriod($input){

        ################临时处理：SAP上线，产能不加限制，所有工单直接排入###############
        ################临时处理：SAP上线，产能不加限制，所有工单直接排入###############
        return true;

        //先判断产能够不够用
        //找到哪些工单
        $ids = $input['ids'];
        $workOrderList = DB::table(config('alias.rwo'))
            ->select('*')
            ->whereIn('id',$ids)
            ->where('status',0)
            ->get();
        if(empty($workOrderList)) TEA('1600');

        if(empty($input['workcenter_id']) || empty($input['workshop_id'])) TEA('1603');

        if(!isset($input['start_time']) || !isset($input['end_time'])) TEA('700','start_time');

        $today_time=mktime(0, 0, 0, date('m'), date('d'), date('Y'));
        if(strtotime($input['end_time']) < $today_time) TEA('1605');

        $workhour_model=new WorkHour();
        //节约数据表资源，重新获取总工时包
        if($workOrderList['0']->bom_id != 0){
            $array_workhour_package = $workhour_model->getAllHoursByBom($workOrderList['0']->bom_id,$workOrderList['0']->routing_id);
        }else{
            $array_workhour_package = json_decode($workOrderList['0']->workhour_package,true);
        }

        //工作中心的总产能
        //$period_all_ability_capacity = $input['total_capacity'];

        //计算产能：遍历时间段，计算该能力对应的所有时间段的总产能
        //获取日期时间段数组
        $start_time = $input['start_time'];
        if(strtotime($input['start_time']) < $today_time) {$start_time = date("Y-m-d", $today_time);}

        $daterange = $this->getDateRange($start_time,$input['end_time']);

        $period_ability_capacity = 0;
        //计算一种能力总的工作时间（总产能），因为一天中所有能力的工作时间都是一样的（物料选不同能力用时不一样）
        foreach($daterange as $date){
            $weekday = date("w",strtotime($date['date']));
            $oneday_all_ability_capacity = $this->getCapacityByWeekdayAbility($input['workshop_id'],$input['workcenter_id'],$weekday,$input['workcenter_operation_to_ability_id']);
            $period_ability_capacity += $oneday_all_ability_capacity;
        }
        //获得当前所选能力已经占用的工作时间（排入工单）
        $workorderWhere = [];
        $workorderWhere[] = ['rwo.work_shop_id','=',$input['workshop_id']];
        $workorderWhere[] = ['rwo.work_center_id','=',$input['workcenter_id']];
        $workorderWhere[] = ['rwo.operation_ability_id','=',$input['workcenter_operation_to_ability_id']];
        $workorderWhere[] = ['rwo.work_station_time','>=',strtotime($start_time)];
        $workorderWhere[] = ['rwo.work_station_time','<=',strtotime($input['end_time'])];
        $workcenterHasCapacity = DB::table(config('alias.rwo').' as rwo')
            ->select('rwo.number','rwo.total_workhour')
            ->where($workorderWhere)
            ->whereIn('rwo.status',[1,2])
            ->get();
        $hasCapacity = 0;
        foreach ($workcenterHasCapacity as $each){
            $hasCapacity += $each->total_workhour;
        }
        //工作中心，当前能力剩余工作时间
        $left_ability_capacity = $period_ability_capacity - $hasCapacity;

        //所有工单根据前端选择的工单的能力计算总工时
        $all_select_abilitys = json_decode($input['all_select_abilitys'],true);
        $allWorkOrderTotalWorkHour = 0;
        $alertMessage = [];
        foreach ($workOrderList as $k=>$v){
            $orderWhere = [];
            $orderWhere[] = ['production_order_id','=',$v->production_order_id];
            $orderWhere[] = ['status','=',0];
            $moreSmallIndexWorkOrderList = DB::table(config('alias.rwo'))->select('id')
                ->where($orderWhere)
                ->whereNotIn('id',$ids)
                ->whereRaw('(routing_operation_index < ?)',[$v->routing_operation_index])
                ->get();
            $moreSmallIndex2 = DB::table(config('alias.rwo'))->select('id')
                ->where($orderWhere)
                ->whereNotIn('id',$ids)
                ->whereRaw('(routing_operation_index < ? && routing_step_index < ?)',[$v->routing_operation_index,$v->routing_step_index])
                ->get();

            if(count($moreSmallIndexWorkOrderList) > 0 or count($moreSmallIndex2) > 0){
                $alertMessage[] = "有工序或者步骤在 $v->number 前的工单";
            }

            $current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$v->qty,$array_workhour_package);
            $oneOrder_total_workhour = $this->countWorkOrderTotalWorkHour($current_workhour_package, $all_select_abilitys);
            $allWorkOrderTotalWorkHour += $oneOrder_total_workhour;

//            //1个WO的工时，只取标准工时（sign_hours），不拿首样工时等
//            $current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),1,json_decode($v->workhour_package,true));
//            $one_workhour = $this->countWorkOrderTotalWorkHour2($current_workhour_package, $all_select_abilitys);
//            //按一个工单计算首样，流转，准备的时间
//            $one_other_workhour = $this->countOtherWorkHour($current_workhour_package, $all_select_abilitys);
//
//            //配合排产那边工时最大化处理
//            $allWorkOrderTotalWorkHour += $one_workhour * $v->qty + $one_other_workhour;
        }
        //如果车间或工作中心拿出来的产能为0或者小于所有工单的总工时，直接抛出异常
        if($left_ability_capacity <= 0 || $left_ability_capacity < $allWorkOrderTotalWorkHour) TEA('1601');
        return $alertMessage;
    }

    /**
     * 按时间段主排（粗排）
     * 拆分到具体天时，其实做的是拆WO，不过是程序自动化的，根据当天剩余产能优先排满开始日期。细排该做的部分在这边先做了。
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     * @author kevin
     */
    public function simplePlanByPeriod($input)
    {
        $this->checkRules($input);
        // 判断是否允许排产
//        $result = $this->isAllow($input['work_task_id'],$input['work_station_time']);
//        if(!$result) {
//            TEA('2405');    // 依赖订单排产时间前尚未完成排产，请先完成依赖订单排产！
//        }
        //找到要排工单
        $workOrderList = DB::table(config('alias.rwo'))
            ->select('*')
            ->whereIn('id',$input['ids'])
            ->where('status',0)
            ->get();

        //节约数据表资源，重新获取总工时包
        $workhour_model=new WorkHour();
        if($workOrderList['0']->bom_id != 0){
            $array_workhour_package = $workhour_model->getAllHoursByBom($workOrderList['0']->bom_id,$workOrderList['0']->routing_id);
        }else{
            $array_workhour_package = json_decode($workOrderList['0']->workhour_package,true);
        }
        //产品数量
        $product_qty=DB::table(config('alias.rpo'))->select('qty')->where('ID',$workOrderList['0']->production_order_id)->first();
        $pdt_qty=$product_qty->qty;//根据对象直接取值，产品数量
        try {
            DB::connection()->beginTransaction();
            //先找到车间或工作中心下班次，因为班次是维护在工作中心层的
            $rankWhere = [];
            $rankWhere[] = ['rwc.workshop_id', '=', $input['workshop_id']];
            $rankWhere[] = ['rwc.id', '=', $input['workcenter_id']];
            $workcenterRankList = DB::table(config('alias.rwcr') . ' as rwcr')
                ->leftJoin(config('alias.rwc') . ' as rwc', 'rwcr.workcenter_id', 'rwc.id')
                ->leftJoin(config('alias.rrp') . ' as rrp', 'rwcr.rankplan_id', 'rrp.id')
                ->select('rrp.work_time', 'rrp.work_date', 'rwcr.workcenter_id')
                ->where($rankWhere)->get();
            foreach ($workOrderList as $k => $v) {
                //找到车间或工作中心的工序的能力的产能

                //处理一下班次的workdate的json数据
                foreach ($workcenterRankList as $k => &$v1) {
                    $v1->work_date = json_decode($v1->work_date, true);
                }

                //所有WO的总工时
                $all_select_abilitys = json_decode($input['all_select_abilitys'],true);

                //1个WO的工时，只取标准工时，不拿首样工时等
                $current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$pdt_qty,$array_workhour_package);
                $one_workhour = $this->countWorkOrderTotalWorkHour2($current_workhour_package, $all_select_abilitys);
                //按一个工单计算首样，流转，准备的时间
                $one_other_workhour = $this->countOtherWorkHour($current_workhour_package, $all_select_abilitys);

                //获取日期时间段数组
                $today_time=mktime(0, 0, 0, date('m'), date('d'), date('Y'));
                $start_time = $input['start_time'];
                $end_time = $input['end_time'];
                if(strtotime($input['start_time']) < $today_time) {$start_time = date("Y-m-d", $today_time);}
                if(strtotime($input['end_time']) < $today_time) {$end_time = date("Y-m-d", $today_time);}
                $daterange = $this->getDateRange($start_time, $end_time);
                //最初WO的qty
                $origin_qty = $v->qty;
                $left_qty = $origin_qty;

                //按时间段遍历，获取每天该能力的产能，排满相应数量的WO
                foreach ($daterange as $date) {

                    if($left_qty <= 0) break;

                    $weekday = date("w",strtotime($date['date']));
                    $today_plan_time = strtotime(date("Y-m-d",strtotime($date['date'])));
                    //当天0点
                    $today_start=date("Y-m-d",strtotime($date['date']));
                    //当天的所有时段 0:0:0-23:59:59
                    $today_end= $today_start.' 23:59:59';

                    $today_capacity = 0;
                    $today_capacity = $this->getCapacityByWeekdayAbility($input['workshop_id'],$input['workcenter_id'],$weekday,$input['workcenter_operation_to_ability_id']);

                    //计算当天的剩余产能
                    //获得当前已排工单在今天，所选能力已经占用的工作时间
                    $workorderWhere = [];
                    $workorderWhere[] = ['rwo.work_shop_id', '=', $input['workshop_id']];
                    $workorderWhere[] = ['rwo.work_center_id', '=', $input['workcenter_id']];
                    $workorderWhere[] = ['rwo.operation_ability_id', '=', $input['workcenter_operation_to_ability_id']];
                    $workcenterHasCapacity = DB::table(config('alias.rwo') . ' as rwo')
                        ->select('rwo.number','rwo.total_workhour')
                        ->where($workorderWhere)
                        ->whereIn('rwo.status',[1,2])
                        ->whereBetween('work_station_time', [strtotime($today_start), strtotime($today_end)])
                        ->get();
                    $hasCapacity = 0;
                    foreach ($workcenterHasCapacity as $each) {
                        $hasCapacity += $each->total_workhour;
                    }
//                    $hasCapacity = array_walk($workcenterHasCapacity,function($v)use(&$hasCapacity){
//                        $hasCapacity += $v->total_workhour;
//                    });

                    //工作中心，当前能力剩余工作时间
                    $today_left_ability_capacity = $today_capacity - $hasCapacity;

                    #####最终能够全部排入的工单，就是原始工单拆分后的剩的最后一个（批）
                    //$total_left_capacity = $one_workhour * $left_qty + $one_other_workhour;

                    //计算要拆分出来的工单的实际工时
                    $left_current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$pdt_qty,$array_workhour_package);//left_qty改pdt_qty，传产品数量进行计算
                    // $left_current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$left_qty,$array_workhour_package);
                    $total_left_capacity = $this->countWorkOrderTotalWorkHour($left_current_workhour_package, $all_select_abilitys);
     ################临时处理：SAP上线，产能不加限制，所有工单直接排入###############
     ################临时处理：SAP上线，产能不加限制，所有工单直接排入###############
                    //if ($total_left_capacity <= $today_left_ability_capacity) {
                    if (true) {
                        //因为区间维护工时的存在，最终排入工单的总工时得重新计算，1个工单*数量，是最大化的工时计算，实际会更小
                        //$current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$left_qty,json_decode($v->workhour_package,true));
                        //$total_left_capacity2 = $this->countWorkOrderTotalWorkHour($current_workhour_package, $all_select_abilitys);

                        //获取日期时间段数组
                        $data = [
                            'status' => 1,
                            'qty' => $left_qty,
                            'factory_id' => $input['factory_id'],
                            'work_shop_id' => $input['workshop_id'],
                            'work_center_id' => $input['workcenter_id'],
                            'operation_id' => $input['operation_id'],
                            'operation_ability_id' => $input['workcenter_operation_to_ability_id'],
                            'work_station_time' => $today_plan_time,
                            'select_ability_info' => json_encode($all_select_abilitys),
                            'total_workhour' => $total_left_capacity
                        ];
                        $res = DB::table(config('alias.rwo'))
                            ->where('id', $v->id)
                            ->update($data);
                        if ($res === false) TEA('804');
                        break;
                    } else {
                        //比对剩余工时和1个WO的比例，得出今天应该排入工单的数量
                        $insert_qty = intval($today_left_ability_capacity / $one_workhour);

                        ###由于存在首样，准备，流转等额外工时，但insert_qty跟1这个数量处于同一区间，并且上面计算整除时，存在产能溢出。
                        ###防止产能溢出，这边做一步基础的校验，并优化排入工单的数量，但不完美。比较完美的方案暂时还没有。

                            //一个工单都排不进去，直接到下一天
                            if($insert_qty <= 0){
                                continue;
                            }
                            //计算要拆分出来的工单的实际工时
                            $insert_current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$insert_qty,$array_workhour_package);
                            $insert_total_capacity = $this->countWorkOrderTotalWorkHour($insert_current_workhour_package, $all_select_abilitys);
                            if($insert_qty >= $left_qty || $insert_total_capacity > $today_left_ability_capacity){
                                $insert_qty = $insert_qty - 1;
                                if($insert_qty <= 0){
                                    continue;
                                }
                            }
                        ###########

                        //insert_qty会改变，总工时得重新计算
                        $current_workhour_package2 = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$insert_qty,$array_workhour_package);
                        $update_total_insert_capacity2 = $this->countWorkOrderTotalWorkHour($current_workhour_package2, $all_select_abilitys);

                        $left_qty = $left_qty - $insert_qty;
                        $insert_data  = [
                            'id' => $v->id,
                            'qty' => $insert_qty,
                        ];
                        $insert_id = $this->splitWorkOrder($insert_data);
                        if (!$insert_id) TEA('804');

                        //先拆再更新
                        $data = [
                            'status' => 1,
                            'factory_id' => $input['factory_id'],
                            'work_shop_id' => $input['workshop_id'],
                            'work_center_id' => $input['workcenter_id'],
                            'operation_id' => $input['operation_id'],
                            'operation_ability_id' => $input['workcenter_operation_to_ability_id'],
                            'work_station_time' => $today_plan_time,
                            'select_ability_info' => json_encode($all_select_abilitys),
                            'total_workhour' => round($update_total_insert_capacity2, 3)
                        ];
                        $res = DB::table(config('alias.rwo'))
                            ->where('id', $insert_id)
                            ->update($data);
                        if ($res === false) TEA('804');

                    }
                }
            }

            //按时间段排完后，将排单的开始和结束时间更新到wt中,用于甘特图
            $start_plantime=$this->getFieldValueById($input['work_task_id'],'simple_plan_start_time',config('alias.roo'));
            if(empty($start_plantime)){
                $data = [
                    'simple_plan_start_time' => strtotime($input['start_time']),
                    'simple_plan_end_time' => strtotime($input['end_time'])
                ];
                $res = DB::table(config('alias.roo'))
                    ->where('id', $input['work_task_id'])
                    ->update($data);
                if ($res === false) TEA('804');
            }

            /**
             * 数据库原来备注：rwo.status 0是未发布，1是发布 ，2是粗排
             *
             * 分析代码结果：rwo.status 0->发布, 1->粗排
             *
             * 所有的 WO 均完成排产之后，oo.status状态更改为 2
             */
            $need = DB::table(config('alias.rwo'))
                ->where([['operation_order_id', '=', $input['work_task_id']], ['status', '=', 0]])
                ->first();
            if (empty($need)) {
                DB::table(config('alias.roo'))
                    ->where('id', $input['work_task_id'])
                    ->update([
                        'status' => 2,
                    ]);
                $wo = DB::table(config('alias.rwo'))
                    ->whereIn('id', $input['ids'])
                    ->first();
                $tmp = DB::table(config('alias.roo'))
                    ->where([['production_order_id', '=', $wo->production_order_id], ['status', '=', 1]])
                    ->count();
                $tmp2 = DB::table(config('alias.roo'))
                    ->where([['production_order_id', '=', $wo->production_order_id], ['status', '=', 0]])
                    ->count();
                // 所有的 WT排完后，PO状态更新为 3
                if (empty($tmp) && empty($tmp2)) {
                    DB::table(config('alias.rpo'))
                        ->where('id', $wo->production_order_id)
                        ->update([
                            'status' => 3,
                        ]);
                }
            }

        }catch (\Exception $exception){
            DB::connection()->rollBack();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 获取工作中心的产能区间，层级：工作中心->星期几->能力->具体产能(直接计算产能，该方式舍弃)
     * @param $workcenter_id $weekday
     * @return
     * @author kevin
     */
    public function getCapacityByWeekdayAbility($workshop_id,$workcenter_id,$weekday,$operation_ability_id,$workbench_id = '')
    {
        //比对当前工作中心是否存在该能力的台板
        //找到该工作中心下所有的能力，并且得出重复的能力（不同台板会存在相同能力）累加计算值
        $rwcWhere = [];
        $rwcWhere[] = ['rwc.workshop_id','=',$workshop_id];
        $rwcWhere[] = ['rwc.id','=',$workcenter_id];
        $rwcWhere[] = ['rwboa.operation_to_ability_id','=',$operation_ability_id];
        if(!empty($workbench_id)) $rwcWhere[] = ['rwb.id','=',$workbench_id];
        $rwcWhere[] = ['rwboa.operation_to_ability_id','=',$operation_ability_id];
        $workcenterOperationAbilityCount = DB::table(config('alias.rwc').' as rwc')
            ->leftJoin(config('alias.rwb').' as rwb','rwc.id','rwb.workcenter_id')
            ->leftJoin(config('alias.rwboa').' as rwboa','rwb.id','rwboa.workbench_id')
            ->select('rwc.id','rwc.name','rwboa.operation_to_ability_id',DB::raw('count(rwc.id) as num'))
            ->groupBy('rwboa.operation_to_ability_id')
            ->where($rwcWhere)->count();
        if(empty($workcenterOperationAbilityCount)) TEA('1604');

        //先找到车间或工作中心下班次，因为班次是维护在工作中心层的
        $rankWhere = [];
        $rankWhere[] = ['rwc.workshop_id','=',$workshop_id];
        $rankWhere[] = ['rwc.id','=',$workcenter_id];
        $workcenterRankList = DB::table(config('alias.rwcr').' as rwcr')
            ->leftJoin(config('alias.rwc').' as rwc','rwcr.workcenter_id','rwc.id')
            ->leftJoin(config('alias.rrp').' as rrp','rwcr.rankplan_id','rrp.id')
            ->select('rrp.work_time','rrp.work_date','rwcr.workcenter_id')
            ->where($rankWhere)->get();
        //处理一下班次的workdate的json数据
        foreach ($workcenterRankList as $k=>&$v){
            $v->work_date = json_decode($v->work_date,true);
        }
        //一种能力的产能
        $capacity = 0;
        foreach ($workcenterRankList as $w=>$j){
            if(in_array($weekday,$j->work_date)){
                $capacity += $j->work_time;
            }
        }
        //考虑生成产能包太浪费效率，这边直接根据星期几和能力，计算当天的总产能
        $capacity = round($capacity * $workcenterOperationAbilityCount,3);

        return $capacity;
    }

    /**
     * 获取时间段方法
     * @param $input
     * @return array
     * @author kevin
     */
    public function getDateRange($start_time,$end_time){
        $begin = new \DateTime( $start_time );
        $end = new \DateTime( $end_time );
        $end = $end->modify( '+1 day' );  // 不包含结束日期当天，需要人为的加一天

        $interval = new \DateInterval('P1D');
        $daterange = new \DatePeriod($begin, $interval ,$end);

        $dates = iterator_to_array($daterange);

        return obj2array($dates);
    }

    /**
     * 细排组合排入
     * @param $input
     * @author kevin
     */
    public function groupCarefulPlan($input){
        $this->checkRules($input);

        $array_rank = $this->showWorkCenterRankPlan($input);
        //单独把后半段夜班取出来，便于跨天计算使用
        $after_night_rank = $this->getAfterNightRank($array_rank);
        //排入时间,第二个工单就会被重写
        $plan_start_date = $input['plan_start_date'];
        $plan_start_time = strtotime($plan_start_date . $input['plan_start_hour'] );
        $array_ids = json_decode($input['ids'],true);
        foreach($array_ids as $v){
            //计算工单结束时间
            $array_id_totalhour = explode(':',$v);
            $id = $array_id_totalhour['0'];
            $total_hour = ceil($array_id_totalhour['1']);

            //计算工单截止时间，未带上日期，（跨天的就超过24小时）
            $array_plan_end_time = $this->calculateHourNew($plan_start_date,$plan_start_time,$total_hour,$array_rank,$after_night_rank);
            $result = DB::table(config('alias.rwo'))
                ->where('id', $id)
                ->update([
                    'status'=>2,
                    'factory_id'=>$input['factory_id'],
                    'work_shop_id'=>$input['work_shop_id'],
                    'work_center_id'=>$input['work_center_id'],
                    'work_shift_id'=>$input['work_shift_id'],
                    'plan_start_time'=>$plan_start_time,
                    'plan_end_time'=>$array_plan_end_time['careful_plan_time'],
                    'rank_plan_id'=>isset($input['rank_plan_id']) ? $input['rank_plan_id'] : 0,
                    'rank_plan_type_id'=>isset($input['rank_plan_type_id']) ? $input['rank_plan_type_id'] : 0,
                ]);
            if($result===false) TEA('804');

            //后续工单依次往后排
            if($array_plan_end_time['careful_plan_time'] == $array_plan_end_time['work_time_end']){
                $final_plan_end_time = $array_plan_end_time['work_time_start'];
            }else{
                $final_plan_end_time = $array_plan_end_time['careful_plan_time'] + 1;
            }
            $plan_start_date = date('Y-m-d',$final_plan_end_time);
            $plan_start_time = $final_plan_end_time;

        }
    }

    /**
     * 细排按班次组合排入
     * @param $input
     * @author kevin
     */
    public function RankCarefulPlan($input){
        $this->checkRules($input);

        $carefulplan_sort = is_numeric($input['carefulplan_sort']) ? $input['carefulplan_sort'] : 1;

        //获取当前班次的信息
        $obj_rank = $this->getRank($input['rank_plan_id']);
        //判断所选日期是否有排班
        $date_week = date("w",strtotime($input['plan_start_date']));
        if(!in_array($date_week,json_decode($obj_rank->work_date))){
            TEA('817');
        }
        if(isset($input['is_select_time']) && $input['is_select_time'] == 1){
            //直接拿前端选择的排入时间点
            !isset($input['plan_start_hour']) ? $plan_start_hour = '00:00:00' : $plan_start_hour = $input['plan_start_hour'];
            $new_splan_start_time = strtotime($input['plan_start_date'] . $plan_start_hour);
        }else{
            //获取排入时间，规则：获取最后一单结束时间，如果到达班次界限，就用班次开始时间作为排入时间
            $new_splan_start_time = $this->getPlanStartTime($input,$obj_rank);
        }

        //排入时间,第二个工单就会被重写
        $plan_start_date = $input['plan_start_date'];
        $array_ids = json_decode($input['ids'],true);
        foreach($array_ids as $v){
            //计算工单结束时间
            $array_id_totalhour = explode(':',$v);
            $id = $array_id_totalhour['0'];
            $total_hour = ceil($array_id_totalhour['1']);

            //细排产增加判断，有转厂标识，无虚拟库存地点 create by fengjuan.xia
            $sql="SELECT
            ruis_production_order.WERKS_id,
            ruis_production_order.LGORT1,
            ruis_work_order.number AS wonumber,
            ruis_production_order.number AS ponumber 
            FROM
            ruis_work_order
          INNER JOIN ruis_production_order ON ruis_work_order.production_order_id = ruis_production_order.id 
           AND ruis_production_order.WERKS_id <> '' 
           AND ruis_production_order.LGORT1 = '' 
           AND ruis_production_order.is_delete = 0 
          WHERE ruis_work_order.id=?";
            $poweck=DB :: select($sql,[$id]);
            if(!empty($poweck)){
                TEPA('您所排产的工单'.$poweck[0]->wonumber.'带转厂标识，无虚拟库存地，请删除生产订单'.$poweck[0]->ponumber.'，联系计划部重新下单！');
            }

            //如果切换工作中心，那么新的工作中心填入work_center_id，旧的工作中心填入actual_work_center_id
            //业务逻辑：领料用新工作中心（工位），报工用旧工作中心，切换后取actual_work_center_id
            if (isset($input['is_switch_workcenter']) && $input['is_switch_workcenter'] == 1
                && isset($input['actual_work_center_id']) && $input['actual_work_center_id'] != 0
                && isset($input['actual_work_shift_id']) && $input['actual_work_shift_id'] != 0
            ) {
                $work_center_id = isset($input['actual_work_center_id']) ? $input['actual_work_center_id'] : 0;
                $work_shift_id = isset($input['actual_work_shift_id']) ? $input['actual_work_shift_id'] : 0;
                $actual_work_center_id = $input['work_center_id'];
                $actual_work_shift_id = $input['work_shift_id'];
            } else {
                $work_center_id = $input['work_center_id'];
                $work_shift_id = $input['work_shift_id'];
                $actual_work_center_id = 0;
                $actual_work_shift_id = 0;
            }

            //计算工单截止时间，未带上日期，（跨天的就超过24小时）
            $array_plan_end_time = $this->calculateRankPlanTime($plan_start_date,$new_splan_start_time,$total_hour,$obj_rank);
            $result = DB::table(config('alias.rwo'))
                ->where('id', $id)
                ->update([
                    'status'=>2,
                    'factory_id'=>$input['factory_id'],
                    'work_shop_id'=>$input['work_shop_id'],
                    'work_center_id'=>$work_center_id,
                    'work_shift_id'=>$work_shift_id,
                    'actual_work_center_id'=>$actual_work_center_id,
                    'actual_work_shift_id'=>$actual_work_shift_id,
                    'is_switch_workcenter'=>isset($input['is_switch_workcenter']) ? $input['is_switch_workcenter'] : 0,
                    'plan_start_time'=>$new_splan_start_time,
                    'plan_end_time'=>$array_plan_end_time['careful_plan_time'],
                    'plan_date'=>strtotime($plan_start_date),
                    'rank_plan_id'=>isset($input['rank_plan_id']) ? $input['rank_plan_id'] : 0,
                    'rank_plan_type_id'=>isset($input['rank_plan_type_id']) ? $input['rank_plan_type_id'] : 0,
                ]);
            if($result===false) TEA('804');

            if($carefulplan_sort == 2){
                //拼单--排入同一时间
                continue;
            }else{
                //后续工单依次往后排
                if($array_plan_end_time['careful_plan_time'] == $array_plan_end_time['work_time_end'] -1){
                    $final_plan_end_time = $array_plan_end_time['work_time_start'];
                }else{
                    $final_plan_end_time = $array_plan_end_time['careful_plan_time'] + 1;
                }
                $plan_start_date = date('Y-m-d',$final_plan_end_time);
                $new_splan_start_time = $final_plan_end_time;
            }
        }

        //将编辑后的工位系数进行更新
        if(isset($input['factor']) && !empty($input['factor'])){
            $data = [
                'factor' => $input['factor'],
            ];
            DB::table(config('alias.rwb'))->where('id', $work_shift_id)->update($data);
        }

        //工单排入时，校验是否是模塑的工单，给模塑传工单数据
        $this->sendToMosu($array_ids,$work_center_id,$work_shift_id);

    }

    //校验并调用模塑的接口
    public function sendToMosu($array_ids,$work_center_id,$work_shift_id){
        $where[]=['workcenter_id','=',$work_center_id];
        $where[]=['rwb.id','=',$work_shift_id];
        $obj = DB::table(config('alias.rwb') . ' as rwb')->select('rwb.code as rwb_code','rwc.code as rwc_code')
            ->leftjoin(config('alias.rwc') . ' as rwc', 'rwc.id', 'rwb.workcenter_id')
        ->where($where)->first();
        $MoCode = $obj->rwc_code.'_'.$obj->rwb_code;
        // 增加 注胶   shuaijie.feng  7.23/2019   'M2MS020_01','M2MS020_02'
        $Mosu_array = ['M2MS001_01','M2MS001_02','M2MS001_03','M2MS001_04','M2MS020_1','M2MS020_2'];
        if(in_array($MoCode,$Mosu_array)){
            $result = [];
            foreach($array_ids as $v) {
                //计算工单结束时间
                $array_id_totalhour = explode(':', $v);
                $id = $array_id_totalhour['0'];

//                $where[] = ['rwc.code', '=', 'M2MS001'];
                $where[] = ['rwo.id', '=', $id];
                $work_order_info = DB::table(config('alias.rwo') . ' as rwo')
                    ->select(
                        'rwo.id',
                        'rwo.operation_order_id',
                        'rwo.number as WONO',
                        'rwc.code as rwc_code',
                        'rwb.code as rwb_code',
                        'rm.item_no as MATR',
                        'rm.name as LDESC',
                        'rm.description as SDESC',
                        'rwo.qty as WQTY',
                        'rwo.created_at',
                        'rwo.status',
                        'rpo.sales_order_code as KDAUF',
                        'rpo.sales_order_project_code as KDPOS',//添加销售订单行项 by xia
                        'rpo.number as AUFNR',
                        'rwo.work_shop_id as FEVOR',
                        'rpo.qty as GAMNG',
                        'rpo.start_date'
                    )
                    ->leftjoin(config('alias.rwc') . ' as rwc', 'rwc.id', 'rwo.work_center_id')
                    ->leftjoin(config('alias.rwb') . ' as rwb', 'rwb.id', 'rwo.work_shift_id')
                    ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
                    ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rpo.product_id')
                    ->where($where)
                    ->where(function ($query) {
                        $query->where('rwc.code', 'M2MS001')
                            ->orWhere('rwc.code', 'M2MS020');
                    })
                    ->get();
                foreach ($work_order_info as &$item) {

                    $WSNO = $item->rwc_code . '_' . $item->rwb_code;
                    if ($item->status != 0) {
                        $STATE = 1;
                    }
                    $CTIME = date('Y-m-d H:m:i', $item->created_at);
                    $GSTRP = date('Y-m-d H:m:i', $item->start_date);

                    $tmp = [
                        'WONO' => $item->WONO,
                        'WSNO' => $WSNO,
                        'CTIME' => $CTIME,
                        'MATR' => $item->MATR,
                        'LDESC' => $item->LDESC,
                        'SDESC' => $item->SDESC,
                        'WQTY' => $item->WQTY,
                        'STATE' => $STATE,
                        'KDAUF' => $item->KDAUF,
                        'KDPOS' => $item->KDPOS,
                        'AUFNR' => $item->AUFNR,
                        'FEVOR' => $item->FEVOR,
                        'GAMNG' => $item->GAMNG,
                        'GSTRP' => $GSTRP,
                    ];
                    $result[] = $tmp;
                }
            }
            //传输工单数据
            $post_data = array(
                "head" => 'MES_HKSC0001',
                "data" => json_encode($result)
            );
            //接口url
            $domain = env('MOSU_HOST', 'http://192.168.10.204:30014');
            $url = $domain.'/Import.asmx/Do';
            //发起请求
            $response1 = $this->http($url,'POST',$post_data);
            //$this->makeRecord($post_data['head'],0,'',$url,$response1);
            ###########工单处理###########
        }
    }

    /**
     * http请求封装
     */
    public function http($url, $method = 'GET', $postfields = null, $headers = array(), $debug = false)
    {
        $ci = curl_init();
        /* Curl settings */
        curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ci, CURLOPT_TIMEOUT, 30);
        curl_setopt($ci, CURLOPT_RETURNTRANSFER, true);

        switch ($method) {
            case 'POST':
                curl_setopt($ci, CURLOPT_POST, true);
                if (!empty($postfields)) {
                    $tmpdatastr = is_array($postfields) ? http_build_query($postfields) : $postfields;
                    curl_setopt($ci, CURLOPT_POSTFIELDS, $tmpdatastr);
                }
                break;
        }
        $ssl = preg_match('/^https:\/\//i',$url) ? TRUE : FALSE;
        curl_setopt($ci, CURLOPT_URL, $url);
        if($ssl){
            curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, FALSE); // https请求 不验证证书和hosts
            curl_setopt($ci, CURLOPT_SSL_VERIFYHOST, FALSE); // 不从证书中检查SSL加密算法是否存在
        }

        curl_setopt($ci, CURLOPT_URL, $url);
        curl_setopt($ci, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ci, CURLINFO_HEADER_OUT, true);

        $response = curl_exec($ci);

        curl_close($ci);

        return $response;
    }

    /**
     * 添加接口日志
     * 跟sap的日志一个表
     * @param string $serviceID 接口服务ID
     * @param string $SrvgUID 随机码(32位)
     * @param array $requestData 请求的数据
     * @param array $response 接口返回的数据(数组格式)
     * @return mixed
     */
    private static function makeRecord($serviceID, $SrvgUID, $requestData, $url,$response = [])
    {
        $keyVal = [
            'serviceID' => $serviceID,
            'srvGUID' => $SrvgUID,
            'srvTimestamp' => date('YmdHis'),
            'sourceSysID' => 0,
            'targetSysID' => 0,
            'ctime' => time(),
            'returnCode' => empty($response['Success']) ? 0 : $response['Success'],
            'data_json' => json_encode($requestData),
            'request_uri' => $url,
            'return_json' => json_encode($response)
        ];
        return DB::table(config('alias.sar'))->insertGetId($keyVal);
    }

    public function getRank($rank_plan_id){
        $where[] = ['id','=',$rank_plan_id];
        $obj = DB::table(config('alias.rrp'))
            ->select('from','to','rest_time','work_time','work_date')
            ->where($where)
            ->first();
        if(!$obj){
            TEA('818');
        }else{
            return $obj;
        }
    }

    public function getPlanStartTime($input,$obj_rank){
        //取当前已排工单的排入结束时间最大的那个
        //当天班次开始
        $date_start = $this->convertClock($input['plan_start_date'],$obj_rank->from);
        //当天班次结束
        $date_end = $this->convertClock($input['plan_start_date'],$obj_rank->to);

        $where[] = ['status','=',2];
        $where[] = ['work_shop_id','=',$input['work_shop_id']];
        $where[] = ['work_center_id','=',$input['work_center_id']];
        $where[] = ['work_shift_id','=',$input['work_shift_id']];
        $where[] = ['rank_plan_id','=',$input['rank_plan_id']];
        $obj = DB::table(config('alias.rwo'))
            ->select('plan_end_time')
            ->where($where)
            ->whereBetween('plan_start_time', [$date_start, $date_end])
            ->orderBy('plan_end_time','desc')
            ->first();
        if(!isset($obj->plan_end_time) || $obj->plan_end_time == 0){
            $return_time =  $date_start;
        }else{
            if($obj->plan_end_time >= $date_end-1){
                $return_time =  $date_start;
            }else{
                $return_time =  $obj->plan_end_time + 1;
            }
        }
        return $return_time;
    }

    /**
     * 获得截止时间的时间戳
     * @author kevin
     */
    public function calculateRankPlanTime($plan_start_date,$plan_start_time,$total_hour,$obj_rank){

        $rest_time=json_decode($obj_rank->rest_time);
        $plan['rest_time_start']=$rest_time[0]->rest_from;
        $plan['rest_time_end']=$rest_time[0]->rest_to;
        //当天班次休息开始
        $rest_time_start = $this->convertClock($plan_start_date,$rest_time[0]->rest_from);
        //当天班次休息结束
        $rest_time_end = $this->convertClock($plan_start_date,$rest_time[0]->rest_to);
        //当天班次工作时间开始
        $work_time_start = $this->convertClock($plan_start_date,$obj_rank->from);
        //当天班次工作时间结束
        $work_time_end = $this->convertClock($plan_start_date,$obj_rank->to);

        //考虑休息时间和跨跃班次区间
        $period = $rest_time_end - $rest_time_start;
        $predict_end_time = $plan_start_time + $total_hour;

        if($plan_start_time < $rest_time_start && $predict_end_time >= $rest_time_start) {
            $predict_end_time = $predict_end_time + $period;
        }

        //判断是否超过班次区间
        if($predict_end_time > $work_time_end - 1){
            $predict_end_time = $work_time_end -1;
        }

        //找到排入时间对应的排班
        $bingo_rank = [
            'work_time_start' => $work_time_start,
            'work_time_end' => $work_time_end
        ];

        $bingo_rank['careful_plan_time'] = $predict_end_time;

        return $bingo_rank;
    }

    public function convertClock($date,$time_clock){
        $array_clock = explode(':',$time_clock);
        $clock_timestamp = $array_clock['0'] * 3600 + $array_clock['1'] * 60 + $array_clock['2'];
        $final_time = strtotime($date) + $clock_timestamp;
        return $final_time;
    }

    public function getAfterNightRank($array_rank){
        $night_rank['has_next_day'] = 0;
        foreach($array_rank as $v){
            if($v['name'] == '夜班' && $v['work_time_start'] == '00:00:00'){
                $night_rank['has_next_day'] = 1;
                $night_rank['next_day_rank'] = $v;
                break;
            }
        }
        return $night_rank;
    }
    /**
     * 获得截止时间的时间戳
     * @author kevin
     */
    public function calculateHour($plan_start_date,$plan_start_time,$total_hour,$array_rank,$after_night_rank){
        foreach ($array_rank as $item) {
            $work_time_start = strtotime($plan_start_date . $item['work_time_start']);
            $work_time_end = strtotime($plan_start_date . $item['work_time_end']);
            $rest_time_start = strtotime($plan_start_date . $item['rest_time_start']);
            $rest_time_end = strtotime($plan_start_date . $item['rest_time_end']);
            $day_end_time = strtotime($plan_start_date . '23:59:59');

            if($plan_start_time >= $work_time_start && $plan_start_time <= $work_time_end){
                $period = $rest_time_end - $rest_time_start;
                $predict_end_time = $plan_start_time + $total_hour;
                //白班正常计算，夜班考虑跨天，0-36小时制计算
                if($item['name'] == '白班'){
                    if($plan_start_time < $rest_time_start && $predict_end_time >= $rest_time_start){
                        $predict_end_time = $predict_end_time + $period;
                        //判断是否超过班次区间
                        if($predict_end_time > $work_time_end){
                            $predict_end_time = $work_time_end;
                        }
                    }
                }else{
                    //排在前半段夜班,截止时间考虑跨天
                    if($plan_start_time <= $day_end_time){
                        if($plan_start_time < $rest_time_start && $predict_end_time >= $rest_time_start) {
                            $predict_end_time = $predict_end_time + $period;
                        }

                        //判断是否超过班次区间,超过就说明跨天了
                        if($predict_end_time > $work_time_end){
                            //存在跨天班次，工单截止时间就需要跨天计算
                            if($after_night_rank['has_next_day'] == 1){
                                //进入第二天的时间戳，比对后半段夜班的班次情况
                                $next_day_date = date('Y-m-d',strtotime('+1 day',strtotime($plan_start_date)));
                                $next_day_work_time_end = strtotime($next_day_date . $after_night_rank['next_day_rank']['work_time_end']);

                                //$next_day_time = $predict_end_time-'24:00:00';
                                $next_day_rest_period = strtotime($after_night_rank['next_day_rank']['rest_time_end']) - strtotime($after_night_rank['next_day_rank']['rest_time_start']);
                                //计算第二天的截止时间
                                $next_day_end_time = $predict_end_time + $next_day_rest_period;

                                //$predict_end_time = $predict_end_time + $next_day_rest_period;
                                //判断是否超过班次区间
                                if($next_day_end_time > $next_day_work_time_end){
                                    $next_day_end_time = $next_day_work_time_end;
                                }

                                //最终跨天的时间戳
                                $predict_end_time = $next_day_end_time;

                            }else{
                                $predict_end_time = $work_time_end;
                            }
                        }
                    }else{
                        //已经排在第二天了，前端返回日期就是第二天
                        $next_day_date = date('Y-m-d',strtotime('+1 day',strtotime($plan_start_date)));
                        $next_day_rest_time_start = strtotime($next_day_date . $item['rest_time_start']);
                        $next_day_work_time_end = strtotime($next_day_date . $item['work_time_end']);


                        if($plan_start_time < $next_day_rest_time_start && $predict_end_time >= $next_day_rest_time_start){
                            $predict_end_time = $predict_end_time + $period;
                        }
                        //判断是否超过班次区间
                        if($predict_end_time > $next_day_work_time_end){
                            $predict_end_time = $next_day_work_time_end;
                        }
                    }
                }
                //找到排入时间对应的排班，终止循环
                break;
            }
        }

        return $predict_end_time;
    }

    /**
     * 获得截止时间的时间戳
     * @author kevin
     */
    public function calculateHourNew($plan_start_date,$plan_start_time,$total_hour,$array_rank){
        $predict_end_time = 0;
        foreach ($array_rank as $item) {
            $work_time_start = strtotime($plan_start_date . $item['work_time_start']);
            $work_time_end = strtotime($plan_start_date . $item['work_time_end']);
            $rest_time_start = strtotime($plan_start_date . $item['rest_time_start']);
            $rest_time_end = strtotime($plan_start_date . $item['rest_time_end']);
            $day_end_time = strtotime($plan_start_date . '23:59:59');
            if($plan_start_time >= $work_time_start && $plan_start_time < $work_time_end){
                $period = $rest_time_end - $rest_time_start;
                $predict_end_time = $plan_start_time + $total_hour;

                if($plan_start_time < $rest_time_start && $predict_end_time >= $rest_time_start) {
                    $predict_end_time = $predict_end_time + $period;
                }

                //判断是否超过班次区间,超过就说明跨天了
                if($predict_end_time > $day_end_time){
                    //判断是否超过班次区间
                    if($predict_end_time > $work_time_end){
                        $predict_end_time = $work_time_end;
                    }
                }

                //找到排入时间对应的排班，终止循环
                $bingo_rank = [
                    'work_time_start' => $work_time_start,
                    'work_time_end' => $work_time_end
                ];
                break;
            }
        }
        if($predict_end_time == 0){
            TEA('816');
        }

        $bingo_rank['careful_plan_time'] = $predict_end_time;

        return $bingo_rank;
    }

    /**
     * 获得截止时间的时间戳
     * TODO 不跨班次，第二个工单开始时间需要加1秒
     * @author kevin
     */
    public function calculateHour2($plan_start_date,$plan_start_time,$total_hour,$array_rank,$after_night_rank){
        foreach ($array_rank as $item) {
            $work_time_start = strtotime($plan_start_date . $item['work_time_start']);
            $work_time_end = strtotime($plan_start_date . $item['work_time_end']);
            $rest_time_start = strtotime($plan_start_date . $item['rest_time_start']);
            $rest_time_end = strtotime($plan_start_date . $item['rest_time_end']);
            $day_middle_time = strtotime($plan_start_date . '12:00:00');
            $day_end_time = strtotime($plan_start_date . '23:59:59');

            if($plan_start_time >= $work_time_start && $plan_start_time <= $work_time_end){
                $period = $rest_time_end - $rest_time_start;
                $predict_end_time = $plan_start_time + $total_hour;

                //白班正常计算，夜班考虑跨天，0-36小时制计算
                if($item['name'] == '白班'){
                    if($plan_start_time < $rest_time_start && $predict_end_time >= $rest_time_start){
                        $predict_end_time = $predict_end_time + $period;
                    }
                    //判断是否超过班次区间
                    if($predict_end_time > $work_time_end){
                        $predict_end_time = $work_time_end;
                    }
                }else{
                    //排在前半段夜班,截止时间考虑跨天
                    if($plan_start_time > $day_middle_time){
                        if($plan_start_time < $rest_time_start && $predict_end_time >= $rest_time_start) {
                            $predict_end_time = $predict_end_time + $period;
                        }

                        //判断是否超过班次区间,且超过当天最后时间点，就说明跨天了
                        if($predict_end_time > $work_time_end  && $predict_end_time > $day_end_time){
                            //存在跨天班次，工单截止时间就需要跨天计算
                            if($after_night_rank['has_next_day'] == 1){
                                //进入第二天的时间戳，比对后半段夜班的班次情况
                                $next_day_date = date('Y-m-d',strtotime('+1 day',strtotime($plan_start_date)));
                                $next_day_work_time_end = strtotime($next_day_date . $after_night_rank['next_day_rank']['work_time_end']);

                                //$next_day_time = $predict_end_time-'24:00:00';
                                $next_day_rest_period = strtotime($after_night_rank['next_day_rank']['rest_time_end']) - strtotime($after_night_rank['next_day_rank']['rest_time_start']);
                                //计算第二天的截止时间
                                $next_day_end_time = $predict_end_time + $next_day_rest_period;

                                //$predict_end_time = $predict_end_time + $next_day_rest_period;
                                //判断是否超过班次区间
                                if($next_day_end_time > $next_day_work_time_end){
                                    $next_day_end_time = $next_day_work_time_end;
                                }

                                //最终跨天的时间戳
                                $predict_end_time = $next_day_end_time;

                            }else{
                                $predict_end_time = $work_time_end;
                            }
                        }
                    }else{
                        //判断是否超过班次区间
                        if($predict_end_time > $work_time_end){
                            $predict_end_time = $work_time_end;
                        }
                    }
                }
                //找到排入时间对应的排班，终止循环
                break;
            }
        }

        return $predict_end_time;
    }

    /**
     * 细排组合撤回排入
     * @param $input
     * @author kevin
     */
    public function cancelGroupCarefulPlan($input){
        $array_ids = json_decode($input['ids'],true);
        //$this->checkHasRequisition($array_ids);
        try{
            DB::connection()->beginTransaction();

            foreach($array_ids as $v){
                $result = DB::table(config('alias.rwo'))
                ->where('id', $v)
                ->update([
                    'status'=>1,
                    'work_shift_id'=>0,
                    'plan_start_time'=>0,
                    'plan_end_time'=>0,
                    'rank_plan_id'=>0,
                    'rank_plan_type_id'=>0,
                ]);
                if($result===false) TEA('804');
                //记录日志
                $data = [
                    'type' => 5,
                    'action' => 'cancel',
                    'order_id' => $v
                ];
                record_action_log($data);
            }
        }catch (\Exception $exception){
            DB::connection()->rollBack();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 工单是否领料校验
     * @param $input
     * @author kevin
     */
    public function checkHasRequisition($ids){
        foreach($ids as $i) {
            $count = DB::table(config('alias.rmre') . ' as rmre')
                ->leftJoin(config('alias.rmr') . ' as rmr', 'rmre.material_requisition_id', '=', 'rmr.id')
                ->where([['rmre.work_order_id', '=', $i], ['rmr.is_delete', '=', '0'], ['rmre.material_code', '!=', '']])->count();
            if ($count > 0) TEA('1218');
        }
    }

    /**
     * 获取剩余产能
     * @param $input
     * @author kevin
     */
    public function getLeftCapacity($input){
        $weekday = date("w",strtotime($input['date']));
        //当天0点
        $today_start=date("Y-m-d",strtotime($input['date']));
        //当天的所有时段 0:0:0-23:59:59
        $today_end= $today_start.' 23:59:59';
        $today_capacity = $this->getCapacityByWeekdayAbility($input['work_shop_id'],$input['work_center_id'],$weekday,$input['workcenter_operation_to_ability_id'],$input['work_shift_id'],$input['work_shift_id']);
        //根据系数重新计算当天产能
        if(isset($input['factor']) && $input['factor'] != 0){
            $today_capacity = $today_capacity * $input['factor'];
        }
        //计算当天的剩余产能
        //获得当前已排工单在今天，所选能力已经占用的工作时间
        $workorderWhere = [];
        $workorderWhere[] = ['rwo.status', '=', 2];
        $workorderWhere[] = ['rwo.work_shop_id', '=', $input['work_shop_id']];
        $workorderWhere[] = ['rwo.work_center_id', '=', $input['work_center_id']];
        $workorderWhere[] = ['rwo.operation_ability_id', '=', $input['workcenter_operation_to_ability_id']];
        $workorderWhere[] = ['rwo.work_shift_id', '=', $input['work_shift_id']];
        $workcenterHasCapacity = DB::table(config('alias.rwo') . ' as rwo')
            ->select('rwo.number','rwo.total_workhour')
            ->where($workorderWhere)
            //->whereIn('rwo.status',[1,2])
            ->whereBetween('plan_start_time', [strtotime($today_start), strtotime($today_end)])
            ->get();
        $hasCapacity = 0;
        foreach ($workcenterHasCapacity as $each) {
            $hasCapacity += $each->total_workhour;
        }
        //工作中心，当前能力剩余工作时间
        $today_left_ability_capacity = $today_capacity - $hasCapacity;

        return $today_left_ability_capacity;
    }

    /**
     * 按班次获取剩余产能
     * @param $input
     * @author kevin
     */
    public function getLeftCapacityNew($input){
        //获取当前班次的信息
        $rank_obj = $this->getRank($input['rank_plan_id']);
        //判断所选日期是否有排班
        $date_week = date("w",strtotime($input['date']));
        if(!in_array($date_week,json_decode($rank_obj->work_date))){
            TEA('817');
        }

        $rank_start = $this->convertClock($input['date'],$rank_obj->from);
        $rank_end = $this->convertClock($input['date'],$rank_obj->to);
        $today_capacity = $rank_obj->work_time;
        //根据系数重新计算当天产能
        if(isset($input['factor']) && $input['factor'] != 0){
            $today_capacity = $today_capacity * $input['factor'];
        }
        //计算当天的剩余产能
        //获得当前已排工单在今天，所选能力已经占用的工作时间
        $workorderWhere = [];
        $workorderWhere[] = ['rwo.status', '=', 2];
        $workorderWhere[] = ['rwo.work_shop_id', '=', $input['work_shop_id']];
        $workorderWhere[] = ['rwo.work_center_id', '=', $input['work_center_id']];
        $workorderWhere[] = ['rwo.operation_ability_id', '=', $input['workcenter_operation_to_ability_id']];
        $workorderWhere[] = ['rwo.work_shift_id', '=', $input['work_shift_id']];
        $workcenterHasCapacity = DB::table(config('alias.rwo') . ' as rwo')
            ->select('rwo.number','rwo.total_workhour')
            ->where($workorderWhere)
            ->whereBetween('plan_start_time', [$rank_start, $rank_end])
            ->get();
        $hasCapacity = 0;
        foreach ($workcenterHasCapacity as $each) {
            $hasCapacity += $each->total_workhour;
        }
        //工作中心，当前能力剩余工作时间
        $today_left_ability_capacity = $today_capacity - $hasCapacity;

        $return_data = [
            'total_capacity' => $today_capacity,
            'has_capacity' => $hasCapacity,
            'left_capacity' => $today_left_ability_capacity,
        ];

        return $return_data;
    }

}
