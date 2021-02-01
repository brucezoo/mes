<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2019/1/9 16:32
 * Desc:
 */

namespace App\Console\Commands;


use App\Http\Models\Procedure;
use App\Libraries\Soap;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncRouting extends Command
{
    protected $description = '同步所有的工艺路线 1：重新开始同步; 2：继续同步; 3:继续同步[DESC]';
    protected $signature = 'sync:routing {type} {order=ASC} {status=0} {pageSize=50}';
    protected $table;

    protected $ProcedureModel;

    public function __construct()
    {
        parent::__construct();
        $this->table = 'ruis_temp_sync_routing';
        $this->ProcedureModel = new Procedure();
    }

    public function handle()
    {
        $param = $this->arguments();

        if (empty($param['type']) || !in_array($param['type'], [1, 2, 3, 4])) {
            echo '请输入参数 [1：重新开始同步; 2：继续同步]';
            return;
        }

        if ($param['type'] == 1) {
            echo '-- Truncating...' . PHP_EOL;
            $this->truncateTable();
            echo '-- Setting data ...' . PHP_EOL;
            $this->setData();
            $this->doSync();
        } else if ($param['type'] == 2) {
            echo '-- Continue synchronization ...' . PHP_EOL;
            $this->doSync('ASC', 0, $param['status']);
        } else if ($param['type'] == 3) {
            echo '-- On yourself[DESC] ...' . PHP_EOL;
            $this->doSync('DESC');
        } else if ($param['type'] == 4) {
            echo '-- On yourself[Middle] ...' . PHP_EOL;
            if (empty($param['order']) || $param['order'] == strtoupper('ASC')) {
                $this->doSync('ASC', 1);
            } else {
                $this->doSync('DESC', 1);
            }
        }


    }

    /**
     * 清空表
     */
    public function truncateTable()
    {
        DB::table($this->table)->truncate();
    }

    /**
     * 收集需要同步的工艺路线
     */
    public function setData()
    {
        $sum = 0;
        $i = 0;
        DB::table(config('alias.rbr') . ' as rbr')
            ->leftJoin(config('alias.rb') . ' as rb', 'rb.id', '=', 'rbr.bom_id')
            ->select([
                'rbr.bom_id',
                'rbr.routing_id',
                'rbr.factory_id'
            ])
            ->where('rb.is_version_on', 1)
            ->orderBy('rbr.id', 'ASC')
            ->chunk(100, function ($rows) use (&$sum, &$i) {
                echo ' 第 ' . ++$i . ' 页' . PHP_EOL;
                $keyValArr = [];
                $rows->each(function ($row) use (&$keyValArr, &$sum) {
                    $keyValArr[] = [
                        'bom_id' => $row->bom_id,
                        'routing_id' => $row->routing_id,
                        'factory_id' => $row->factory_id,
                        'is_synced' => 0
                    ];
                    $sum++;
                });
                DB::table($this->table)->insert($keyValArr);
            });
        echo ' Sum:' . $sum . PHP_EOL;
    }

    /**
     * Do Sync.
     * @param string $order
     * @param int $fromMiddle
     * @param int $status
     */
    public function doSync($order = 'ASC', $fromMiddle = 0, $status = 0)
    {
        $failNumber = 0;
        $successNumber = 0;
        $i = 1;
        $where = [
            ['is_synced', '=', $status]
        ];

        $middle = $this->getMiddle();
        if ($fromMiddle && $middle) {
            $where = [
                ['is_synced', '=', 0],
                ['id', $order == 'ASC' ? '>' : '<', $middle],
            ];
        }
        $objs = DB::table($this->table)->select('*')->where($where)->orderBy('id', $order)->limit($this->argument('pageSize'))->get();
        while (!empty(obj2array($objs))) {
            foreach ($objs as $obj) {
                echo '*Syncing 第 ' . $i . ' 条 ---' . PHP_EOL;
                echo "bom_id: $obj->bom_id , routing_id: $obj->routing_id" . PHP_EOL;
                $res = $this->sync($obj->bom_id, $obj->routing_id, $obj->factory_id);
                if ($res['res'] == 1) {
                    echo ' Success.' . PHP_EOL;
                    DB::table($this->table)->where('id', $obj->id)->update(['is_synced' => 1]);
                    $successNumber++;
                } else {
                    echo ' Failed.' . PHP_EOL;
                    DB::table($this->table)->where('id', $obj->id)->update(['is_synced' => 2, 'result' => json_encode($res)]);
                    $failNumber++;
                }
                $i++;
            }
            $middle = $this->getMiddle();
            if ($fromMiddle && $middle) {
                $where = [
                    ['is_synced', '=', 0],
                    ['id', $order == 'ASC' ? '>' : '<', $middle],
                ];
            }
            $objs = DB::table($this->table)->select('*')->where($where)->orderBy('id', $order)->limit($this->argument('pageSize'))->get();
        }
        echo '--- Result --- ' . PHP_EOL;
        echo "Sum: " . --$i . " , Success: $successNumber , Failed: $failNumber " . PHP_EOL;
    }

    public function getMiddle()
    {
        $count = DB::table($this->table)->where('is_synced', 0)->count();
        $obj = DB::table($this->table)->where('is_synced', 0)->select('id')->first();
        if (empty($obj)) {
            return -1;
        }

        return $obj->id + $count / 2;
    }

    /**
     * @param $bomID
     * @param $routingID
     * @param $factoryID
     * @return array
     */
    public function sync($bomID, $routingID, $factoryID)
    {
        try {
            $data = $this->ProcedureModel->GetSyncRouteToSapData($bomID, $routingID, $factoryID);
            $resp = Soap::doRequest($data['data'], 'INT_PP000300009', '0003');
            if ($resp['RETURNCODE'] != 0) {
                TEPA($resp['RETURNINFO']);
            }
            // 处理返回的数据
            if (empty($resp['PLNNR'])) TEPA('SAP返回参数（PLNNR）有误。');
            if (empty($resp['PLNAL'])) TEPA('SAP返回参数（PLNAL）有误。');
            $this->ProcedureModel->updateGroupNumberAndCount($resp['PLNNR'], $resp['PLNAL'], $data['bomNo'], $data['materialCode'], $routingID, $factoryID);
        } catch (\Exception $e) {
            echo 'Code:' . $e->getCode() . (empty($e->getMessage()) ? '' : ' Message:' . $e->getMessage()) . PHP_EOL;
            return ['res' => 0, 'code' => $e->getCode(), 'message' => $e->getMessage()];
        }
        return ['res' => 1];
    }

}