<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/13 0:53
 * Desc:
 */

namespace App\Console\Commands;


use App\Http\Models\MaterialRequisition;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoAuditing extends Command
{

    protected $signature = 'auto:auditing';
    protected $description = '自动入库';

    protected $ignoreMRCodeArr = [];

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {

        //获取所有的 已推送的SAP领料单
        $objs = DB::table(config('alias.rmr') . ' as rmr')
            ->select([
                'rmr.id as material_requisition_id',
                'rmr.code',
                'rmr.type',
                'rmr.push_type',
            ])
            ->where([
                ['rmr.push_type', '=', 1],
                ['rmr.status', '=', 2],
                ['rmr.time', '<>', 1544444444],
            ])
            ->get();

        //遍历
        foreach ($objs as $obj) {
            //如果 batch 表已存在，则添加忽略，并跳过
            $has = DB::table(config('alias.rmrib'))
                ->where('material_requisition_id', $obj->material_requisition_id)
                ->count();
            if ($has) {
                $this->ignoreMRCodeArr[] = $obj->code;
                echo '单号：' . $obj->code . "正在发料中，不处理此单！\n";
                continue;
            }

            //获取item数据
            $itemObjs = DB::table(config('alias.rmri'))
                ->select([
                    'id',
                    'demand_qty',
                    'demand_unit_id'
                ])
                ->where('material_requisition_id', $obj->material_requisition_id)
                ->get();

            $keyValArr = [];
            $keyVal = [
                'material_requisition_id' => $obj->material_requisition_id,
                'batch' => '1223334444',
            ];
            foreach ($itemObjs as $itemObj) {
                $keyVal['item_id'] = $itemObj->id;
                $keyVal['bom_unit_id'] = $itemObj->demand_unit_id;
                $keyVal['actual_send_qty'] =
                $keyVal['actual_receive_qty'] = $itemObj->demand_qty;
                $keyVal['order'] = '00001';
                $keyValArr[] = $keyVal;
            }

            try {
                DB::connection()->beginTransaction();
                DB::table(config('alias.rmrib'))->insert($keyValArr);
                //更新rmr表 状态为3，为出库做准备
                DB::table(config('alias.rmr'))->where('id', $obj->material_requisition_id)->update(['status' => 3]);
                $tempInput['material_requisition_id'] = $obj->material_requisition_id;
                (new MaterialRequisition())->auditing($tempInput);
                DB::table(config('alias.rmrib'))->where('material_requisition_id', $obj->material_requisition_id)->delete();
                DB::table(config('alias.rmr'))
                    ->where('id', $obj->material_requisition_id)
                    ->update(
                        ['status' => 2],
                        ['time' => 1544444444]
                    );
            } catch (\Exception $e) {
                DB::connection()->rollBack();
                echo $e->getCode() . '---' . $e->getFile();
            }
            DB::connection()->commit();

            echo "----\n";
            echo '单号：' . $obj->code . "处理成功 \n";

        }

        echo "-------以下单号为跳过的--------\n";
        echo implode(',', $this->ignoreMRCodeArr);
    }
}