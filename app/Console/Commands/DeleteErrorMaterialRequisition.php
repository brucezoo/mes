<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/17 17:39
 * Desc:
 */

namespace App\Console\Commands;


use App\Http\Models\StorageItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeleteErrorMaterialRequisition extends Command
{
    protected $signature = 'delete:errorMaterialRequisition';
    protected $description = '删除有问题的车间领料单';

    protected $StorageItem;
    protected $failedArr = array();

    private $isActive;

    public function __construct()
    {
        parent::__construct();
        $this->StorageItem = new StorageItem();
        $this->isActive = 0;
    }

    public function Handle()
    {
        if (!$this->isActive) {
            return;
        }
        /**
         * 1.查询所有的未入库的车间领料
         * 2.遍历 反审
         * 3.删除该领料单
         */
        $objList = DB::table(config('alias.rmr') . ' as rmr')
            ->select([
                'rmr.id',
            ])
            ->where([
                ['rmr.status', '=', 3],
                ['rmr.type', '=', 1],
                ['rmr.push_type', '=', 2],
                ['rmr.is_delete', '=', 0]
            ])
            ->get();
        echo '--------共' . count($objList) . '个待删除的车间领料单--------' . PHP_EOL;
        foreach ($objList as $obj) {
            $rmribObj = DB::table(config('alias.rmrib'))
                ->select([
                    'id as rmrib_id',
                    'storage_item_id'
                ])
                ->where('material_requisition_id', $obj->id)
                ->get();
            echo '------------' . PHP_EOL;
            echo 'MR_ID:' . $obj->id . ' is deleting...' . PHP_EOL;
            try {
                DB::connection()->beginTransaction();
                foreach ($rmribObj as $value) {
                    if (empty($value->storage_item_id)) {
                        continue;
                    }
                    $this->StorageItem->del($value->storage_item_id);
                    DB::table(config('alias.rmrib'))->where('id', $value->rmrib_id)->delete();
                    echo 'Batch_ID:' . $value->rmrib_id . ' is deleted!' . PHP_EOL;

                }
                // 删除
                DB::table(config('alias.rmr'))->where('id', $obj->id)->delete();
                DB::table(config('alias.rmri'))->where('material_requisition_id', $obj->id)->delete();

            } catch (\Exception $e) {
                DB::connection()->rollBack();
                echo 'MR_id:' . $obj->id . 'Failed.' . PHP_EOL . 'Error:' . $e->getMessage() . PHP_EOL;
                $this->failedArr[] = $obj->id;
                continue;
            }
            DB::connection()->commit();
        }
    }
}