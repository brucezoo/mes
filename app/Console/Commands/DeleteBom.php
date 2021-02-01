<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/11/8
 * Time: 3:24 PM
 */
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Models\BomRouting;

class DeleteBom extends Command{
    protected $signature = 'init:DeleteBom';
    protected $description = '删除期初导入时不想要的bom';
    protected $data = [49992,50034,49991];

    public function handle()
    {
        $bom_code = DB::table('ruis_temp_bom_operation_3000')->select(DB::raw('distinct material_code as bom_material_code'))->get();
        $count = count($bom_code);
        foreach ($bom_code as $k=>$v){
            echo '共有'.$count.'条bom物料，正在处理第'.($k+1).'条'.PHP_EOL;
            //找到物料号下所有的bom
            $bom_list = DB::table(config('alias.rb'))->where('code',"=",$v->bom_material_code)->get();
            $this->deleteTempRouInfo($v->bom_material_code);
            $bom_count = count($bom_list);
            foreach ($bom_list as $j=>$w){
                if(empty($w)) continue;
                echo '物料'.$v->bom_material_code.'共有'.$bom_count.'条bom，正在删除第'.($j+1).'条'.PHP_EOL;
                try {
                    DB::connection()->beginTransaction();
//                    $items  = array();
//                    //删除bom
//                    DB::table(config('alias.rb') )->where('id',"=",$w->id)->delete();
//                    //找出bom_item
//                    $bom_items = DB::table(config('alias.rbi') )->where('bom_id',"=",$w->id)->get();
//                    //删除bom_item
//                    DB::table(config('alias.rbi') )->where('bom_id',"=",$w->id)->delete();
//                    //删除阶梯用量
//                    foreach ($bom_items as $bom_item){
//                        $items[] = $bom_item->id;
//                    }
//                    if(!empty($items)){
//                        DB::table(config('alias.rbiql') )->whereIn('bom_item_id',$items)->delete();
//                    }
                    //删除工艺路线
                    $bomRoutingDao = new BomRouting();
                    //先找出bom的工艺路线
                    $routing_ids = DB::table(config('alias.rbr'))->where([['bom_id','=',$w->id],['factory_id','=',12]])->pluck('routing_id');
                    foreach ($routing_ids as $h=>$z){
                        $bomRoutingDao->deleteBomRouting($w->id,$z);
                    }


                } catch (\ApiException $e) {
                    //回滚
                    DB::connection()->rollBack();
                    exit($e->getCode());
                }
                DB::connection()->commit();
            }
        }
//        $this->deleteRouting();
//        $this->deleteTempRouInfo();
//        $this->deleteHandBom();
    }


    public function deleteRouting(){
        $count = count($this->data);
        foreach ($this->data as $k=>$v){
            echo '共有'.$count.'条bom物料，正在处理第'.($k+1).'条'.PHP_EOL;
            $bom = DB::table(config('alias.rb'))->where([['code',"=",$v],['is_version_on','=',1]])->first();
            $bomRoutingDao = new BomRouting();
            //先找出bom的工艺路线
            $routing_id = DB::table(config('alias.rbr'))->where('bom_id',$bom->id)->orderBy('id','desc')->limit(1)->value('routing_id');
            $bomRoutingDao->deleteBomRouting($bom->id,$routing_id);
        }
    }

    public function deleteTempRouInfo($code){
        DB::table('ruis_temp_operation_code_node')->where('material_code',$code)->delete();
    }

    public function deleteHandBom(){
        foreach ($this->data as $k=>$v){
            echo '当前正在处理第'.($k+1).'条'.PHP_EOL;
            $items  = array();
            //删除bom
            DB::table(config('alias.rb') )->where('id',"=",$v)->delete();
            //找出bom_item
            $bom_items = DB::table(config('alias.rbi') )->where('bom_id',"=",$v)->get();
            //删除bom_item
            DB::table(config('alias.rbi') )->where('bom_id',"=",$v)->delete();
            //删除阶梯用量
            foreach ($bom_items as $bom_item){
                $items[] = $bom_item->id;
            }
            if(!empty($items)){
                DB::table(config('alias.rbiql') )->whereIn('bom_item_id',$items)->delete();
            }
            //删除工艺路线
            $bomRoutingDao = new BomRouting();
            //先找出bom的工艺路线
            $routing_ids = DB::table(config('alias.rbr'))->where([['bom_id','=',$v]])->pluck('routing_id');
            foreach ($routing_ids as $h=>$z){
                $bomRoutingDao->deleteBomRouting($v,$z);
            }
        }
    }
}