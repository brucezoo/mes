<?php
/**
 * Created by PhpStorm.
 * User:  kevin
 * Time:  2019年5月4日11:45:07
 */
namespace App\Console\Commands;

use App\Http\Models\ReleaseProductionOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

set_time_limit(0);

class SyncConfirmnumber extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan make:order
     * @var string
     */
    protected $signature = 'sync:confirmnumber';
    protected $rwo;
    protected $rpo;
    /**
     * 控制台命令说明。
     * php artisan release:production_order命令后的输出内容
     * @var string
     *
     */
    protected $description = '根据excel刷工序确认号';

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
        $this->rwo = config('alias.rwo');//ruis_work_order;
        $this->rsco = config('alias.rsco');//ruis_subcontract_order;
        $this->rpo = config('alias.rpo');//ruis_production_order;
    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        $results=DB::table('production_operation_confirm_number')
            ->select('production_number','operation_number','confirm_number')
            //->limit(100)
            ->get();
        $i = 1;
        if(!empty($results)){
            foreach ($results as $item) {
                $production_number = $item->production_number;
                $obj_production_id = DB::table($this->rpo)->select('id')->where('number',$production_number)->first();
                $production_id = $obj_production_id->id;
                $operation_number = $item->operation_number;
                $confirm_number = $item->confirm_number;
                $index = substr($operation_number, 2, 1);

                $where=[];
                $where[]=['production_order_id','=',$production_id];
                $where[]=['routing_operation_index','=',$index];
                $is_exitst = DB::table($this->rwo)->select('id')->where($where)->first();
                if(count($is_exitst) <= 0) continue;

                //更新数据库
                $data=[
                    'confirm_number_RUECK'=>$confirm_number
                ];
                $up_res = DB::table($this->rwo)->where($where)->update($data);

                $is_exitst2 = DB::table($this->rsco)->select('id')->where($where)->first();
                if(count($is_exitst2) <= 0) continue;
                $up_res2 = DB::table($this->rsco)->where($where)->update($data);

                if( !($i % 2000) && $i){
                    $msg = '******PRODUCTION_NUMBER: '.$production_number . ';operation: ' . $operation_number . ';i_count: ' . $i;
                    trace($msg);
                }

                $i = $i + 1;
            }
        }
        $msg = '******COMPLETE******count_i:'.$i . ' LAST_PRODUCTION_NUMBER:' .$production_number;
        trace($msg);
    }
}


