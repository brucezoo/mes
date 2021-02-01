<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2019/1/8 13:56
 * Desc:
 */

namespace App\Console\Commands;


use App\Http\Models\Procedure;
use App\Libraries\Soap;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateWorkCenter extends Command
{
    protected $description = '更新工作中心，并同步工艺路线给SAP[1,2,3]';

    protected $signature = 'update:workCenter {step}';

    protected $table = 'ruis_temp_update_workcenter';

    protected $syncTable = 'ruis_temp_update_workcenter_sync';

    protected $oldNewIDArr;

    protected $procedure;

    /**
     * UpdateWorkCenter constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->procedure = new Procedure();

    }

    public function handle()
    {
        $argument = $this->argument();

        if (!isset($argument['step']) || !in_array($argument['step'], [1, 2, 3])) {
            exit("请输入正确参数[1,2,3]");
        }

        switch ($argument['step']) {
            case 1:
                echo '1.WorkCenter code to ID' . PHP_EOL;
                $this->searchID();
                break;
            case 2:
                echo '2.Update' . PHP_EOL;
                $this->update();
                break;
            case 3:
                echo '3.Sync' . PHP_EOL;
                $this->doSync();
                break;
        }
    }

    /**
     * 第一步
     *
     * 查询code对应的ID
     */
    public function searchID()
    {
        $lists = DB::table($this->table)
            ->select([
                'old_code',
                'new_code',
                'id'
            ])
            ->get();
        $i = 1;
        foreach ($lists as $list) {
            echo "第 " . $i++ . " 条" . PHP_EOL;
            $updateKeyVal = [];
            $wcObjs = DB::table(config('alias.rwc'))
                ->select([
                    'id',
                    'code',
                ])
                ->whereIn('code', [$list->old_code, $list->new_code])
                ->get();
            foreach ($wcObjs as $obj) {
                array_map(function ($str) use (&$updateKeyVal, $list, $obj) {
                    if ($obj->code == $list->{$str . '_code'}) {
                        $updateKeyVal[$str . '_id'] = $obj->id;
                    }
                }, ['old', 'new']);
            }
            DB::table($this->table)->where('id', $list->id)->update($updateKeyVal);
        }
        echo "共 " . --$i . " 条".PHP_EOL;
    }

    /**
     * 设置 oldID->newID 数组
     */
    public function setOldNewID()
    {
        $lists = DB::table($this->table)
            ->select([
                'old_id',
                'new_id'
            ])
            ->get();
        foreach ($lists as $list) {
            $this->oldNewIDArr[$list->old_id] = $list->new_id;
        }
    }

    /**
     * 第二步
     */
    public function update()
    {
        $i = 1;
        $this->setOldNewID();
        foreach ($this->oldNewIDArr as $oldID => $newID) {
            /**
             * 1.从ruis_bom_routing_workcenter表中 获取 $oldID 对应的ruis_bom_routing_base_id
             * 2.从 ruis_bom_routing_base 表中 获取需要 bom_id 和 routing_id并记录 (同时判断ruis_bom.is_version_on=1)
             * 3.更新 ruis_bom_routing_workcenter表中的 workenter_id 为 $newID
             * 4.遍历待同步的工艺路线并同步之
             */
            // 1
            $rbrwObjs = DB::table(config('alias.rbrw'))
                ->select([
                    'id',
                    'bom_routing_base_id',
                    'workcenter_id'
                ])
                ->where('workcenter_id', $oldID)
                ->get();
            echo '--- 第' . $i++ . '个工作中心' . PHP_EOL;
            echo '  子项有' . count($rbrwObjs) . ' 条' . PHP_EOL;
            foreach ($rbrwObjs as $rbrwObj) {
                // 2
                $rbrbObjs = DB::table(config('alias.rbrb') . ' as rbrb')
                    ->leftJoin(config('alias.rb') . ' as rb', 'rb.id', '=', 'rbrb.bom_id')
                    ->select([
                        'rbrb.bom_id',
                        'rbrb.routing_id'
                    ])
                    ->where([
                        ['rbrb.id', '=', $rbrwObj->id],
                        ['rb.is_version_on', '=', 1]
                    ])
                    ->get();
                foreach ($rbrbObjs as $rbrbObj) {
                    $this->insertSyncBomRouting($rbrbObj->bom_id, $rbrbObj->routing_id);
                }
            }
            // 3
            DB::table(config('alias.rbrw'))->where('workcenter_id', $oldID)->update(['workcenter_id' => $newID]);
        }
        echo "-- 共 $i 个".PHP_EOL;
    }

    /**
     * 同步工艺路线
     *
     * @param int $bomID
     * @param int $routingID
     * @return int
     */
    public function sync($bomID, $routingID)
    {
        try {
            $factoryID = $this->procedure->getFactoryID($bomID, $routingID);
            $data = $this->procedure->GetSyncRouteToSapData($bomID, $routingID, $factoryID);
            $resp = Soap::doRequest($data['data'], 'INT_PP000300009', '0003');
            if (isset($resp['RETURNCODE']) && $resp['RETURNCODE'] == 0 && !empty($resp['PLNNR']) && !empty($resp['PLNAL'])) {
                $this->procedure->updateGroupNumberAndCount($resp['PLNNR'], $resp['PLNAL'], $data['bomNo'], $data['materialCode'], $routingID, $factoryID);
            } else {
                TEPA('同步失败：'.json_encode($resp));
            }
        } catch (\Exception $e) {
            echo "Code:" . $e->getCode() . ' Message:' . $e->getMessage() . PHP_EOL;
            return 0;
        }
        return 1;
    }

    /**
     * 把需要同步的bom_ID 和routing_ID插入到临时表中
     *
     * @param $bomID
     * @param $routingID
     */
    public function insertSyncBomRouting($bomID, $routingID)
    {
        $hasExist = DB::table($this->syncTable)
            ->where([
                ['bom_id', '=', $bomID],
                ['routing_id', '=', $routingID]
            ])
            ->count();
        if (!$hasExist) {
            $keyVal = [
                'bom_id' => $bomID,
                'routing_id' => $routingID,
                'is_synced' => 0
            ];
            $id = DB::table($this->syncTable)->insertGetId($keyVal);
            echo "新增ID： $id" . PHP_EOL;
        }
    }

    /**
     * 第三步 同步
     */
    public function doSync()
    {
        $failNumber = 0;
        $successNumber = 0;
        $i = 1;
        $objs = DB::table($this->syncTable)->select('*')->where('is_synced', 0)->limit(50)->get();

        while (!empty(obj2array($objs))) {
            foreach ($objs as $obj) {
                echo '--Syncing 第 ' . $i . ' 条 ---' . PHP_EOL;
                echo "bom_id: $obj->bom_id , routing_id: $obj->routing_id" . PHP_EOL;
                $res = $this->sync($obj->bom_id, $obj->routing_id);
                if ($res) {
                    echo 'Success.' . PHP_EOL;
                    DB::table($this->syncTable)->where('id', $obj->id)->update(['is_synced' => 1]);
                    $successNumber++;
                } else {
                    echo 'Failed.' . PHP_EOL;
                    DB::table($this->syncTable)->where('id', $obj->id)->update(['is_synced' => 2]);
                    $failNumber++;
                }
                $i++;
            }
            $objs = DB::table($this->syncTable)->select('*')->where('is_synced', 0)->limit(50)->get();
        }
        echo '--- Result --- ' . PHP_EOL;
        echo "共 " . --$i . " 条，成功 $successNumber 条，失败 $failNumber 条".PHP_EOL;
    }

}