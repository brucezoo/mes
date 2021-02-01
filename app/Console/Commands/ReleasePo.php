<?php
/**
 * Created by PhpStorm.
 * User:  kevin
 * Time:  2018年12月21日11:29:07
 */
namespace App\Console\Commands;

use App\Http\Models\ReleaseProductionOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

set_time_limit(0);

class ReleasePo extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan make:order
     * @var string
     */
    protected $signature = 'release:production_order';
    protected $rpo;
    /**
     * 控制台命令说明。
     * php artisan release:production_order命令后的输出内容
     * @var string
     *
     */
    protected $description = '发布一定量的PO';

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
        $this->rpo = config('alias.rpo');//production_order;

    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        //获取当前时间点，前未发布的生产订单，暂定数量1000
        $where[]=['ctime','<=', time()];
        $where[]=['status','=', 0];

        $results=DB::table($this->rpo)
            ->select('id')
            ->where($where)
            ->limit(1500)
            ->orderBy('ctime', 'desc')
            ->get();
        $m=new ReleaseProductionOrder();

        if(!empty($results)){
            foreach ($results as $item) {
                //发布PO
                try {
                    $m->releaseProductOrder($item->id);
                } catch (\Exception $e) {
                    $res = get_api_response($e->getCode());
                    $msg = '******PRODUCTION_ID: '.$item->id . ';ERROR_CODE: ' . $res['code'] . ';ERROR_INFO: ' . $res['message'];
                    \App\Libraries\Log4php::info($msg);
                    continue;
                }
            }
        }
        echo "complete!";
    }
}


