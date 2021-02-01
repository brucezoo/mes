<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2019/3/19
 * Time: 4:48 PM
 */

namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

/**
 * 合并退料 模型
 * Class MergerReturn
 * @package App\Http\Models
 * @author Bruce.Chu
 */
class MergerReturn extends Base
{
    public function __construct()
    {
        !$this->table && $this->table = config('alias.rmr');
    }

    /**
     * 退补料工单列表
     * @param array $input
     * @return mixed
     */
    public function getWorkOrders(array &$input)
    {
        $where []= ['rmre.qty','<>',0.0];
//        $where []= ['rmr.status','=',4];
        if (!empty($input['sales_order_code'])) $where[] = ['po.sales_order_code', 'like', '%' . $input['sales_order_code'] . '%'];
        if (!empty($input['product_order_code'])) $where[] = ['po.number', 'like', '%' . $input['product_order_code'] . '%'];
        if (!empty($input['work_bench_name'])) $where[] = ['rwb.name', 'like', '%' . $input['work_bench_name'] . '%'];
        $builder=DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmre.material_requisition_id')
            ->leftJoin(config('alias.rmrw').' as rmrw',function ($join){
                $join->on('rmrw.material_requisition_id','rmre.material_requisition_id')
                    ->on('rmrw.work_order_id','rmre.work_order_id')
                    ->on('rmrw.material_id','rmre.material_id');
            })
            ->leftJoin(config('alias.rmrib').' as rmrib','rmrib.id','rmrw.batch_id')
            ->leftJoin(config('alias.rwo').' as wo','wo.id','rmre.work_order_id')
            ->leftJoin(config('alias.rpo').' as po','po.id','wo.production_order_id')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','wo.work_shift_id')
            ->select(
                'wo.id as work_order_id',
                'wo.number as work_order_code',
                'wo.work_shift_id as work_bench_id',
                'po.sales_order_code',
                'po.sales_order_project_code',
                'po.number as product_order_code',
                'rwb.name as work_bench_name',
                'rmre.material_id',
                'rmre.material_code',
//                'rmre.rated_qty',
//                'rmre.qty',
                'rmr.send_depot',
                'rmr.status',
                'rmr.id as material_requisition_id',
                'rmrib.batch',
                'rmrw.batch_id'
            )
//            ->addSelect(DB::raw("ifnull((select SUM(GMNGA) from ruis_work_declare_order_item rwdoi where rwdoi.work_order_id = wo.id and rwdoi.material_id = rmre.material_id and rwdoi.type = 1),0) as qty_used"))
            ->addSelect(DB::raw('SUM(rmrw.qty) as qty'))
//            ->addSelect(DB::raw('SUM(rmre.qty) as qty1,SUM(rmre.rated_qty) as rated_qty'))
//            ->where($where)
            ->where('rmr.status',4)
            ->where('rmr.push_type',1)
//            ->where('rwdoi.qty_used','<>',0.000)
            ->groupBy('rmrw.batch_id')
//            ->groupBy('rmre.work_order_id','rmre.material_id')
//            ->havingRaw('qty_used > 0.000')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('rmr.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        return $obj_list;
        foreach ($obj_list as $obj){
            //报工消耗数量为0 应该不允许退料
//            $obj->qty_used=DB::table(config('alias.rwdoi'))
//                ->where([
//                    ['work_order_id',$obj->work_order_id],
//                    ['material_id',$obj->material_id],
//                    ['type',1]
//                ])
//                ->sum('GMNGA');
            //报工数据不准确 获取出库明细
//            $obj->qty_used=DB::table(config('alias.rsit'))
//                ->where([
//                    ['wo_number',$obj->work_order_code],
//                    ['material_id',$obj->material_id]
//                ])
//                ->value('quantity');
            if($obj->qty_used==0){
                $obj->qty_diff=$obj->qty;
            }else{
                if($obj->qty_used > $obj->qty) $obj->qty_diff='-'.round(($obj->qty_used - $obj->qty),4);
                if($obj->qty_used == $obj->qty) $obj->qty_diff=0;
                if($obj->qty_used < $obj->qty) $obj->qty_diff='+'.round(($obj->qty - $obj->qty_used),4);
//                $obj->qty_diff=($obj->qty >= $obj->rated_qty)?'+'.(round($obj->qty,3) - $obj->qty_used):'-'.(round($obj->rated_qty,3) - $obj->qty_used);
            }
//            if($obj->qty_diff=='+0') $obj->qty_diff=0;
        }
        //总共有多少条记录
        $count_builder= DB::table(config('alias.rmre').' as rmre')->where($where);
//        $count_builder= DB::table(config('alias.rmre').' as rmre');
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 退补料工单列表
     * @param array $input
     * @return mixed
     */
    public function getWorkOrdersOld(array &$input)
    {
        $where []= ['rmre.qty','<>',0.0];
//        $where []= ['rmr.status','=',4];
        if (!empty($input['sales_order_code'])) $where[] = ['po.sales_order_code', 'like', '%' . $input['sales_order_code'] . '%'];
        if (!empty($input['product_order_code'])) $where[] = ['po.number', 'like', '%' . $input['product_order_code'] . '%'];
        if (!empty($input['work_bench_name'])) $where[] = ['rwb.name', 'like', '%' . $input['work_bench_name'] . '%'];
        $builder=DB::table(config('alias.rmre').' as rmre')
            ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmre.material_requisition_id')
            ->leftJoin(config('alias.rmri').' as rmri',function ($join){
                $join->on('rmri.material_requisition_id','rmre.material_requisition_id')
                    ->on('rmri.material_id','rmre.material_id');
            })
            ->leftJoin(config('alias.rmrib').' as rmrib','rmrib.item_id','rmri.id')
            ->leftJoin(config('alias.rwo').' as wo','wo.id','rmre.work_order_id')
            ->leftJoin(config('alias.rpo').' as po','po.id','wo.production_order_id')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','wo.work_shift_id')
            ->select(
                'wo.id as work_order_id',
                'wo.number as work_order_code',
                'wo.work_shift_id as work_bench_id',
                'po.sales_order_code',
                'po.sales_order_project_code',
                'po.number as product_order_code',
                'rwb.name as work_bench_name',
                'rmre.material_id',
                'rmre.material_code',
//                'rmre.rated_qty',
//                'rmre.qty',
                'rmr.send_depot',
                'rmr.status',
                'rmr.id as material_requisition_id',
                'rmrib.batch'
//                'rmrib.id as batch_id'
            )
            ->addSelect(DB::raw("ifnull((select SUM(GMNGA) from ruis_work_declare_order_item rwdoi where rwdoi.work_order_id = wo.id and rwdoi.material_id = rmre.material_id and rwdoi.type = 1),0) as qty_used"))
            ->addSelect(DB::raw('SUM(rmre.qty) as qty,SUM(rmre.rated_qty) as rated_qty'))
//            ->where($where)
            ->where('rmr.status',4)
            ->where('rmr.push_type',1)
//            ->where('rwdoi.qty_used','<>',0.000)
            ->groupBy('rmre.work_order_id','rmre.material_id')
            ->havingRaw('qty_used > 0.000')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('wo.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
//        return $obj_list;
        foreach ($obj_list as $obj){
            //报工消耗数量为0 应该不允许退料
//            $obj->qty_used=DB::table(config('alias.rwdoi'))
//                ->where([
//                    ['work_order_id',$obj->work_order_id],
//                    ['material_id',$obj->material_id],
//                    ['type',1]
//                ])
//                ->sum('GMNGA');
            //报工数据不准确 获取出库明细
//            $obj->qty_used=DB::table(config('alias.rsit'))
//                ->where([
//                    ['wo_number',$obj->work_order_code],
//                    ['material_id',$obj->material_id]
//                ])
//                ->value('quantity');
            if($obj->qty_used==0){
                $obj->qty_diff=$obj->qty;
            }else{
                if($obj->qty_used > $obj->qty) $obj->qty_diff='-'.round(($obj->qty_used - $obj->qty),4);
                if($obj->qty_used == $obj->qty) $obj->qty_diff=0;
                if($obj->qty_used < $obj->qty) $obj->qty_diff='+'.round(($obj->qty - $obj->qty_used),4);
//                $obj->qty_diff=($obj->qty >= $obj->rated_qty)?'+'.(round($obj->qty,3) - $obj->qty_used):'-'.(round($obj->rated_qty,3) - $obj->qty_used);
            }
//            if($obj->qty_diff=='+0') $obj->qty_diff=0;
        }
        //总共有多少条记录
        $count_builder= DB::table(config('alias.rmre').' as rmre')->where($where);
//        $count_builder= DB::table(config('alias.rmre').' as rmre');
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 验证是否允许退料单
     * @param array $workOrderIDs
     */
    public function checkReturnMaterial(array $workOrderIDs)
    {
        foreach ($workOrderIDs as $work_order_id){
            if(empty($work_order_id)) TEA('700','work_order_id');
            //验证所属工单是否被锁定
            $this->checkWorkOrderLock($work_order_id);
            $has = $this->isExisted([['id', '=', $work_order_id]], config('alias.rwo'));
            if (!$has) TEA('9500');
            $work_order_code=$this->getFieldValueById($work_order_id,'number',config('alias.rwo'));
            $has=DB::table(config('alias.rmre').' as rmre')
                ->leftJoin(config('alias.rmr').' as rmr','rmr.id','rmre.material_requisition_id')
                ->where([
                    ['rmre.work_order_id',$work_order_id],
                    ['rmr.status', '<>', 4],
                    ['rmr.type', '=', 1],
                    ['rmr.push_type', '=', 1],
                    ['rmr.is_delete', '=', 0]
                ])
                ->distinct('rmre.material_requisition_id')
                ->get(['rmre.material_requisition_id'])
                ->count();
            if ($has) TEPA('工单'.$work_order_code.'有未完成的领料单');  // 尚未完成领料单 Modify By Bruce.Chu

            $has = $this->isExisted([
                ['work_order_id', '=', $work_order_id],
                ['type', '=', 2],
                ['push_type', '=', 1],
                ['status', '<>', 4],
                ['is_delete', '=', 0],
            ]);
            if ($has) TEPA('工单'.$work_order_code.'有未完成的退料单');  // 有未完成的退料单，请先完成
        }
    }

    /**
     * 判断当前工单是否被锁定
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

    public function getCreateMergeReturnMaterial($return_info)
    {
        foreach ($return_info as $key=>$value){

        }
    }
}