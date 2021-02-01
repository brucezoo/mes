<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/15 17:09
 * Desc:
 */

namespace App\Jobs;

use App\Http\Models\MaterialRequisition;
use App\Http\Models\QueueRecord;
use Illuminate\Support\Facades\DB;

/**
 * Class MRInbound
 * @package App\Jobs
 */
class MRInbound extends Job
{
    private $inputData;

    private $queueRecordModel;

    /**
     * MRInbound constructor.
     * @param $inputData
     */
    public function __construct($inputData)
    {
        $this->inputData = $inputData;
        $this->queueRecordModel = new QueueRecord();
    }

    /**
     * @throws \App\Exceptions\ApiException
     */
    public function handle()
    {
        if (empty($this->inputData)) {
            return;
        }
        $input = $this->inputData;
        if (empty($input['material_requisition_id'])) {
            return;
        }
        // 添加队列日志
        $arr['code'] = 1;
        $arr['queue_name'] = $this->queue;
        $arr['attempts'] = $this->attempts();
        $arr['input_data'] = $this->inputData;
        $queue_record_id = $this->queueRecordModel->store($arr);
        if ($queue_record_id) {
            session(['queue_record_id' => $queue_record_id]);
        }

        /**
         * 业务逻辑
         */

        //如果是最后一次，则 更新 合并领料单的状态(4-->5:正在队列执行中 --> 完成)
        if (isset($input['is_last']) && $input['is_last'] == 1) {
            DB::table(config('alias.rmco'))
                ->where([
                    ['status', '=', '5'],
                    ['id', '=', $input['material_requisition_id']]
                ])
                ->update(['status' => 4]);
        } else {    // 否则则自动入库
            (new MaterialRequisition())->autoInbound($input);
        }

        /**
         * 如果走到这一步，表示队列处理成功，
         * 更新状态为成功。
         */
        $this->queueRecordModel->updateStatus($queue_record_id, 0,
            [
                'code' => 0,
                'time' => time(),
                'message' => 'Queue Success',
                'response' => 'Success'
            ]);
    }

    /**
     * 队列消息处理失败后，会调用此函数
     *
     * @param \Exception $exception
     * @return void
     */
    public function failed(\Exception $exception)
    {
        // do somethings
        $errorArr = [
            'Time' => time(),
            'Line' => $exception->getLine(),
            'File' => $exception->getFile(),
            'Message' => $exception->getMessage(),
            'Trace' => $exception->getTraceAsString(),
        ];
        $this->queueRecordModel->updateStatus(session('queue_record_id'), $exception->getCode(), $errorArr);
    }
}