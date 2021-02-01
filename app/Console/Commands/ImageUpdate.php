<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2019/1/9 16:32
 * Desc:
 */

namespace App\Console\Commands;


use App\Exceptions\ApiException;
use App\Http\Models\Image;
use App\Libraries\Soap;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImageUpdate extends Command
{
    protected $signature = 'image:update';
    protected $description = '同步所有的工艺路线 1：重新开始同步; 2：继续同步; 3:继续同步[DESC]';
    protected $table;

    protected $ProcedureModel;

    public function __construct()
    {
        parent::__construct();
        $this->table = 'ruis_drawing';
        $this->image = new Image();
    }

    public function handle()
    {
        $param = $this->arguments();
        set_time_limit(0);
        ini_set('memory_limit','2048M');
        for ($i = 1;$i<400;$i++){
            try{
                $page = $i*200;
                $pindex = 200;
                $list = DB::table(config('alias.rdr'))->select('id','image_path')->where('width','<=','1')->offset($page)->limit($pindex)->orderBy('id','desc')->get();
                if(!$list){
                    $data['width'] = 0;
                    $data['height'] = 0;
                    DB::table(config('alias.rdr'))->where('width','=','1')->update($data);
                    break;
                }
                foreach ($list as $key=>&$val){
                    $data['id'] = $val->id;
                    $imgUrl = base_path().'/public/storage/'.$val->image_path;
                    $size = @getimagesize($imgUrl);
                    if($size){
                        $data['width'] = $size[0];
                        $data['height'] = $size[1];
                    } else {
                        $data['width'] = 1;
                        $data['height'] = 1;
                    }
                    $multipleData[] = $data;
                }
                $this->image->updateBatch('',$multipleData);
                $i++;
                sleep(1);
                Log::info('第'.$page.'条到'.($page+200).'运行完毕');

            } catch (ApiException $e){
                Log::info($e->getMessage());
            }
        }


    }




}