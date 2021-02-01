<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/19 16:57
 * Desc:
 */

namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateInspurMaterialCode extends Command
{
    protected $signature = 'update:inspurMaterialCode';
    protected $description = '把浪潮物料编码插入到领料单中';

    private $isActive = false;

    private $emptyArr = [];

    /**
     * UpdateInspurMaterialCode constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->isActive = true;
    }

    /**
     *
     */
    public function handle()
    {
        if (!$this->isActive) {
            return;
        }

        /**
         * 1.遍历所有的领料单
         * 2.获取之后插入
         */

        $count = DB::table(config('alias.rmri'))
            ->where([
                ['inspur_material_code', '=', '']
            ])
            ->count();
        echo '共' . $count . '条数据需要处理' . PHP_EOL;

        $i = 1;
        $lists = $this->getData();
        while (!empty(obj2array($lists))) {
            foreach ($lists as $value) {
                $objs = DB::table(config('alias.rtnomc'))
                    ->select('old_code')
                    ->where('new_code', $value->material_code)
                    ->get();

                $inspurMaterialCodeArr = [];
                foreach ($objs as $obj) {
                    $inspurMaterialCodeArr[] = $obj->old_code;
                }

                if (empty($inspurMaterialCodeArr)) {
                    $this->emptyArr[] = $value->id;
                    continue;
                }

                !empty($inspurMaterialCodeArr)
                &&
                DB::table(config('alias.rmri'))
                    ->where('id', $value->id)
                    ->update(['inspur_material_code' => implode(',', $inspurMaterialCodeArr)]);
                echo '第' . $i++ . '条,ID:' . $value->id . PHP_EOL;
            }
            $lists = $this->getData();
        }
    }

    /**
     * @return mixed
     */
    public function getData()
    {
        $list = DB::table(config('alias.rmri'))
            ->select([
                'id',
                'material_code'
            ])
            ->where('inspur_material_code', '=', '')
            ->whereNotIn('id',$this->emptyArr)
            ->forPage(1, 1000)
            ->get();
        return $list;

    }
}