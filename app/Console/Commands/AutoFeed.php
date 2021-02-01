<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/13 2:18
 * Desc:
 */

namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Models\MaterialRequisition;

class AutoFeed extends Command
{
    protected $signature = 'auto:feed';
    protected $description = '自动补入库';

    protected $faildArr = [];

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $str = 'MR120181212164805212';
        $array = explode(',', $str);

        foreach ($array as $value) {
            $mrObj = DB::table(config('alias.rmr'))
                ->select(['id', 'code'])
                ->where('code', $value)
                ->first();

            $itemObjs = DB::table(config('alias.rmri'))
                ->select([
                    'id',
                    'demand_qty',
                    'demand_unit_id'
                ])
                ->where('material_requisition_id', $mrObj->id)
                ->get();

            $rmribIDArr = [];
            $flag = false;
            foreach ($itemObjs as $itemObj) {
                $rmribObj = DB::table(config('alias.rmrib'))
                    ->select([
                        'id',
                        'actual_send_qty',
                        'actual_receive_qty'
                    ])
                    ->where([
                        ['material_requisition_id', '=', $mrObj->id],
                        ['item_id', '=', $itemObj->id]
                    ])
                    ->first();
                if (empty($rmribObj)) {
                    $keyVal = [
                        'material_requisition_id' => $mrObj->id,
                        'item_id' => $itemObj->id,
                        'order' => '00001',
                        'batch' => '12222222',
                        'bom_unit_id' => $itemObj->demand_unit_id,
                        'actual_send_qty' => $itemObj->demand_qty,
                        'actual_receive_qty' => $itemObj->demand_qty
                    ];
                    $rmribIDArr[] = DB::table(config('alias.rmrib'))->insertGetId($keyVal);
                } else {
                    if ($rmribObj->actual_send_qty > $itemObj->demand_qty) {
                        $flag = true;
                        DB::table(config('alias.rmrib'))->where('id', $rmribObj->id)->update(['actual_receive_qty' => $rmribObj->actual_send_qty]);
                    }
                }
            }

            if ($flag) {
                //更新rmr表 状态为3，为出库做准备
                DB::table(config('alias.rmr'))->where('id', $mrObj->id)->update(['status' => 3]);
                $tempInput['material_requisition_id'] = $mrObj->id;
                (new MaterialRequisition())->auditing($tempInput);
                DB::table(config('alias.rmrib'))->whereIn('id', $rmribIDArr)->delete();
                echo "----\n";
                echo '单号：' . $value . "处理成功 \n";
                DB::table(config('alias.rmr'))
                    ->where('id', $mrObj->id)
                    ->update(
                        ['status' => 2],
                        ['time' => 1544444444]
                    );
            } else {
                DB::table(config('alias.rmrib'))->whereIn('id', $rmribIDArr)->delete();
                $this->faildArr[] = $value;
            }

        }
        echo "-----------------------\n";
        echo implode(',', $this->faildArr);

    }
}