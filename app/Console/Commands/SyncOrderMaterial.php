<?php
/**
 * Created by PhpStorm.
 * User:  kevin
 * Time:  2018年1月21日11:29:07
 */
namespace App\Console\Commands;

use App\Http\Models\ReleaseProductionOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

set_time_limit(0);

class SyncOrderMaterial extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan sync:ordermaterial
     * @var string
     */
    protected $signature = 'sync:ordermaterial';
    protected $rwo;
    /**
     * 控制台命令说明。
     * php artisan release:production_order命令后的输出内容
     * @var string
     *
     */
    protected $description = '将现有工单表中进出料的同步到分表中';

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
        $this->rwo = config('alias.rwo');//ruis_work_order;

    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        //从数据库中每批次取出1000个工单进行料同步
        $start = 0;
        do{
            $where[]=['id','>', $start];
            $order_data=DB::table($this->rwo)
                ->select('id','number','production_order_id','in_material','out_material')
                ->where($where)
                ->limit(1000)
                ->get();
            $last_id = $this->doWithMaterial($order_data);

            $msg = '******FINISH_WORK_ORDER_ID: '.$last_id;
            //\App\Libraries\Log4php::info($msg);
            p($msg);
            if($last_id == 0) break;

            $where[]=['id','>', $last_id];
            $exist_order = DB::table($this->rwo)
                ->where($where)
                ->limit(1)
                ->count();
            if($exist_order) {
                $start = $last_id;
            }

        } while($exist_order);

        p("complete!");
    }

    /**
     * 处理进出料
     * @return int
     */
    public function doWithMaterial($order_data)
    {
        $trace_work_id = 0;
        foreach ($order_data as $v){
            if(isset($v->id)){
                //防止重复插入

                $check_exist = DB::table(config('alias.rwoi'))->where('work_order_id',$v->id)->limit(1)->count();
                if($check_exist) continue;

                $work_order_id = $v->id;
                $work_order_code = $v->number;
                $production_order_id = $v->production_order_id;
                $array_out_material = json_decode($v->out_material,true);
                $array_in_material = json_decode($v->in_material,true);

                $insert_data = [];
                if(count($array_out_material) > 0) {
                    foreach ($array_out_material as $out_item) {
                        $insert_data[] = [
                            'production_order_id' => $production_order_id,
                            'work_order_id' => $work_order_id,
                            'work_order_code' => $work_order_code,
                            'type' => 1,
                            'material_category_id' => $out_item['material_category_id'],
                            'material_id' => $out_item['material_id'],
                            'material_code' => $out_item['item_no'],
                            'material_replace_code' => isset($out_item['material_replace_no']) ? $out_item['material_replace_no'] : '',
                            'special_stock' => isset($out_item['special_stock']) ? $out_item['special_stock'] : '',
                            'bom_unit_id' => $out_item['bom_unit_id'],
                            'bom_commercial' => $out_item['bom_commercial'],
                            'usage_number' => $out_item['usage_number'],
                            'loss_rate' => $out_item['loss_rate'],
                            'qty' => $out_item['qty'],
                            'LGPRO' => $out_item['LGPRO'],
                            'LGFSB' => $out_item['LGFSB'],
                            'ctime' => time(),
                        ];
                    }
                }
                if(count($array_in_material) > 0) {
                    foreach ($array_in_material as $in_item) {
                        $insert_data[] = [
                            'production_order_id' => $production_order_id,
                            'work_order_id' => $work_order_id,
                            'work_order_code' => $work_order_code,
                            'type' => 0,
                            'material_category_id' => $in_item['material_category_id'],
                            'material_id' => $in_item['material_id'],
                            'material_code' => $in_item['item_no'],
                            'material_replace_code' => isset($in_item['material_replace_no']) ? $in_item['material_replace_no']: '',
                            'special_stock' => isset($in_item['special_stock'])? $in_item['special_stock'] : '',
                            'bom_unit_id' => $in_item['bom_unit_id'],
                            'bom_commercial' => $in_item['bom_commercial'],
                            'usage_number' => $in_item['usage_number'],
                            'loss_rate' => $in_item['loss_rate'],
                            'qty' => $in_item['qty'],
                            'LGPRO' => $in_item['LGPRO'],
                            'LGFSB' => $in_item['LGFSB'],
                            'ctime' => time(),
                        ];
                    }
                }
                $trace_work_id = $v->id;
            }

            $res = DB::table(config('alias.rwoi'))->insert($insert_data);
        }
        return $trace_work_id;
    }

}


