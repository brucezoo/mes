<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/9 15:41
 * Desc:
 */

namespace App\Console\Commands;


use App\Http\Models\WorkDeclareCount;
use Illuminate\Console\Command;

class PullWorkOrder extends Command
{
    protected $signature = 'pull:workOrder';
    protected $description = '拉取工单到报工计数表';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $countNumber=(new WorkDeclareCount())->pullWorkOrder();
        $this->info('成功拉取' . $countNumber . '条数据');
    }
}