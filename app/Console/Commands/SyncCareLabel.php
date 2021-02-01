<?php
/**
 * Created by PhpStorm.
 * User:  kevin
 * Time:  2019年6月19日10:05:07
 */
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

set_time_limit(0);

class SyncCareLabel extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan sync:carelabel
     * @var string
     */
    protected $signature = 'sync:carelabel';
    /**
     * 控制台命令说明。
     * php artisan sync:carelabel命令后的输出内容
     * @var string
     *
     */
    protected $description = '根据excel调整mes洗标绑定关系';

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        $page = 1;
        $pageSize = 3000;
        $startNum = ($page - 1) * $pageSize;
        $dataList = DB::table('care_label_excel')->select('*')
            ->offset($startNum)
            ->limit($pageSize)->get();

        while ($dataList && count($dataList) > 0) {
            foreach ($dataList as $k => $data) {
                if (empty($data) || empty($data->url)) {
                    continue;
                }
                $parse_url = parse_url($data->url);
                $parse_url_arr = explode('/', $parse_url['path']);
                //去掉storage这个前缀
                unset($parse_url_arr['0']);
                unset($parse_url_arr['1']);
                $match_string = implode($parse_url_arr, '/');
                $drawing_id = DB::table(config('alias.drawing'))->select('id')
                    ->where([['image_path', '=', $match_string]])->first();
                if (empty($drawing_id)) continue;

                //处理下行项号
                $data->line_project_code = str_pad($data->line_project_code, 6, '0', STR_PAD_LEFT);
                $where = [];
                $where['sale_order_code'] = $data->sale_order_code;
                $where['line_project_code'] = $data->line_project_code;
                $where['material_code'] = $data->material_code;
                $where['version_code'] = $data->version_code;

                $exist_remark = DB::table(config('alias.rdcl'))->select('remark','drawing_id')
                    ->where($where)
                    ->first();

                if(empty($exist_remark)){
                    $keyValue = [
                        'drawing_id' => $drawing_id->id,
                        'sale_order_code' => $data->sale_order_code,
                        'line_project_code' => $data->line_project_code,
                        'material_code' => $data->material_code,
                        'version_code' => $data->version_code,
                        'remark' => $data->remark,     // 备注
                    ];
                    DB::table(config('alias.rdcl'))->insert($keyValue);
                }else if($exist_remark->remark != $data->remark || $exist_remark->drawing_id != $drawing_id->id)
                {
                    $update_data = [
                        'remark' => $data->remark,
                        'drawing_id' => $drawing_id->id,
                    ];
                    DB::table(config('alias.rdcl'))->where($where)->update($update_data);
                }else{
                    continue;
                }
            }
            $msg = '******PROGRESS******count_page:'.$page;
            trace($msg);

            $page++;
            $startNum = ($page - 1) * $pageSize;
            $dataList = DB::table('care_label_excel')->select('*')
                ->offset($startNum)
                ->limit($pageSize)->get();

        }
        $msg2 = '******Complete******CARELABEL****startNum:'.$startNum;
        trace($msg2);

    }
}


