<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/11/29
 * Time: 5:00 PM
 */
namespace App\Console\Commands;

use App\Http\Models\Bom;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class BatchRelaseBom extends Command{

    protected $signature = 'init:batchRelaseBom';
    protected $description = '批量发布最大版本的bom';
    protected $pagesize = 10;
    protected $current_page = 1;
    protected $total_page = 0;
    protected $total_success_time = 0;
    protected $end_page = 0;

    public function __construct()
    {
        parent::__construct();
    }

    public function Handle(){
        echo '请选择模式（1：导入模式）（2:发布模式）：';
        $type = fread(STDIN,1024);
        if($type == 1){
            echo '请输入导入的sheet顺序：';
            $count = fread(STDIN,1024);
            //先获取数据
            $sheet_data = $this->getExcelData(intval($count));
            //导入数据
            unset($sheet_data[0]);
            $this->importSheetData($sheet_data);
        }else if($type == 2){
            //获取bom物料的数量,用来做分页，这样的话，错误数据再可控范围内,
            $total_count = DB::table('ruis_temp_relaseBom')->count(DB::raw('distinct bom_material_code,bom_no'));
            $this->total_page = ceil($total_count/$this->pagesize);
            echo '共有'.$this->total_page.'页,请输入开始页码：'.PHP_EOL;
            $this->current_page = intval(fread(STDIN,1024));
            echo '请输入结束页码：'.PHP_EOL;
            $this->end_page = intval(fread(STDIN,1024));
            $bomDao = new Bom();
            for($this->current_page; $this->current_page <= $this->end_page; $this->current_page ++){
                $code_list = $this->getBomMaterialCodeByPage($this->current_page,$this->pagesize);
                foreach ($code_list as $k=>$v){
                    echo '共有'.$this->total_page.'页，正在处理第'.$this->current_page.'页，第'.($k+1).'条'.PHP_EOL;
                    //查找到最大版本的bom
                    $bom = DB::table(config('alias.rb'))->select('id','is_version_on','version')
                        ->where([['code','=',$v['bom_material_code']],['bom_no','=',$v['bom_no']]])
                        ->orderBy('version','desc')
                        ->first();
                    if(empty($bom)) exit('编码为'.$v['bom_material_code'].'的bom不存在');
                    if($bom->is_version_on){
                        echo $v['bom_material_code'].'的最新版本bom已发布'.PHP_EOL;
                        continue;
                    }
                    $bomDao->release($bom->id,1,73);
                    $this->total_success_time ++;
                    echo '成功发布'.$v['bom_material_code'].'的第'.$bom->version.'版本,成功发布'.$this->total_success_time.'条bom'.PHP_EOL;
                }
            }
        }
    }

    /**
     * 获取每个sheet的工艺数据
     * @param $count
     * @return array
     */
    public function getExcelData($count){
        $res = [];
        $filePath = storage_path().'/app/public/attachment/init_file/init_relase_bom.xlsx';
        Excel::load($filePath,function ($reader) use(&$res,$count){
            $reader = $reader->getSheet($count);
            $res = $reader->toArray();
        });
        return $res;
    }


    /**
     * 导入数据
     * @param $sheet_data
     */
    public function importSheetData($sheet_data){
        foreach ($sheet_data as $k=>$v){
            echo '正在处理第'.$k.'条数据'.PHP_EOL;
            if(empty($v)) continue;
            $temp_material = [
                'bom_material_code'=>$v[0],
                'bom_no'=>$v[1]
            ];
            $res = DB::table('ruis_temp_relaseBom')->insert($temp_material);
            if(!$res) exit('数据导入有误');
        }
    }


    public function getBomMaterialCodeByPage($page_no,$page_size){
        echo '正在获取第'.$this->current_page.'页的料号'.PHP_EOL;
        $code_list = DB::table('ruis_temp_relaseBom')->select(DB::raw('distinct bom_material_code,bom_no'))->offset(($page_no - 1) * $page_size)->limit($page_size)->get();
        if(empty($code_list)) exit('获取第'.$this->current_page.'页料号失败');
        return obj2array($code_list);
    }
}