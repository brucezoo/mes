<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/8 17:48
 * Desc:
 */

namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Models\StorageItem;
use Maatwebsite\Excel\Facades\Excel;

class ImportSpecialExpend extends Command
{
    protected $signature = 'import:special_expend';
    protected $description = '特殊的消耗 用来清除错误的期初数据';

    protected $fileName = 'import.xls';
    protected $path;

  
    public function __construct()
    {
        parent::__construct();
        $this->path = storage_path('app/public') . DIRECTORY_SEPARATOR . 'excel' . DIRECTORY_SEPARATOR;
        if(empty($this->sitem)) $this->sitem =new StorageItem();
    }

    public function handle()
    {

        $filePath = $this->path . $this->fileName;
        if (!is_readable($filePath)) {
            echo 'File_path:' . $filePath . ' 不可读';
            die();
        }

        $excelDataArr = [];
        Excel::load($filePath, function ($reader) use (&$excelDataArr) {
            $reader = $reader->getSheet(0);
            $excelDataArr = $reader->toArray();
        });
        unset($excelDataArr[0]);
        try {
            DB::connection()->beginTransaction();
                foreach ($excelDataArr as $value) 
                {
                    $item_no  =   $value[1];
                   // 拿到物料编号
                   // 通过 物料编号查找  实时库存大于0 的 记录
                    $inve_res  = DB::table('ruis_storage_inve  as  inve')
                     ->leftJoin('ruis_material   as  material', 'inve.material_id', '=', 'material.id')
                     ->select('inve.*')
                     ->where('material.item_no',$item_no)
                     ->where('inve.storage_validate_quantity','>',0)
                     ->get();
                    if (count($inve_res) >0) 
                    {
                        foreach ($inve_res as $k => $v) 
                        {
                            //过滤数据
                            $merge_data=[];
                            $merge_data['po_number']  = $v->po_number;
                            $merge_data['wo_number']  = $v->wo_number;
                            $merge_data['sale_order_code']  = $v->sale_order_code;
                            $merge_data['sales_order_project_code']  = $v->sales_order_project_code;
                            $merge_data['plant_id']  = $v->plant_id;
                            $merge_data['depot_id']  = $v->depot_id;
                            $merge_data['subarea_id']  = $v->subarea_id;
                            $merge_data['bin_id']  = $v->bin_id;
                            $merge_data['material_id']  = $v->material_id;
                            $merge_data['lot']  = $v->lot;
                            $merge_data['inve_id']  = $v->id;
                            $merge_data['quantity']  = $v->storage_validate_quantity;
                            $merge_data['unit_id']  = $v->unit_id;
                            $res_data_out = $this->sitem->merge_data($merge_data, 21, '-1', 1);//其他出库
                            //保存明细数据
                            $this->sitem->save($res_data_out);
                            $item_ = $this->sitem->pk;
                            // 处理出入库明细, 是否入库还是出库
                            $this->sitem->passageway($item_);
                        }
                        echo $merge_data['inve_id']."\n";
                    }
                }
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            echo $e->getTraceAsString();
        }
        DB::connection()->commit();

    }
}