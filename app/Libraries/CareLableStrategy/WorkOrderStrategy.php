<?php

/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2019/3/12
 * Time: 10:39 AM
 *
 */
namespace App\Libraries\CareLableStrategy;
use App\Libraries\CareLableStrategy;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

/**
 * 自制工单洗标文件
 * Class WorkOrderStrategy
 * @package App\Libraries\CareLableStrategy
 * @author Bruce.Chu
 */
class WorkOrderStrategy extends Base implements CareLableStrategy
{
    private $id;
    private $type;

    public function __construct($id,$type)
    {
        //保存前端传参
        $this->id = $id;
        $this->type = $type;
    }

    /**
     * 洗标附件
     * @return array
     */
    public function getCareLableList()
    {
        // TODO: Implement getCareLableList() method.
        //声明结果返回数组
        $result=[];
        //拿到工单的所有进出料 向上级PO查出销售订单号和销售订单行项目号
        $work_order_items=DB::table(config('alias.rwoi').' as item')
            ->leftJoin(config('alias.rpo').' as po','po.id','item.production_order_id')
            ->distinct('item.material_id')
            ->where('item.work_order_id',$this->id)
            ->get(['po.sales_order_code','po.sales_order_project_code','item.material_code']);
        //销售订单号和销售订单行项目号 不允许为空
        if(!empty($work_order_items)){
            if(empty($work_order_items[0]->sales_order_code) || empty($work_order_items[0]->sales_order_code)) return $result;
        }
        foreach ($work_order_items as $item){
            //查询物料属性
            $obj_attr = DB::table(config('alias.ma').' as ma')
                ->leftJoin(config('alias.rm').' as rm','rm.id','ma.material_id')
                ->leftJoin(config('alias.ad').' as ad','ad.id','ma.attribute_definition_id')
                ->select('ad.name','ma.value','ma.material_id')
                ->where('rm.item_no',$item->material_code)
                ->get();
                $type=$this->type;

                if($type==1)//自制
                {
                    //查洗标，只显示最高版本 add by xia
                    $sales_order_project_code= str_pad($item->sales_order_project_code, 6, '0',STR_PAD_LEFT);
                    $sql="SELECT distinct
                    B.image_path,
                    B.name,
                    B.ctime,
                    A.material_code,
                    A.drawing_id,
                    A.id as care_label_id,
                    A.remark,
                    A.version_code
                    FROM
                        ruis_drawing_care_label A
                        INNER JOIN ruis_drawing B ON A.drawing_id = B.id 
                        AND B.image_path <> '' 
                        INNER JOIN (
                    SELECT
                        material_code,
                        Max( version_code ) version_code 
                    FROM
                        (
                    SELECT
                        A.material_code,
                        version_code 
                    FROM
                        ruis_drawing_care_label A
                        INNER JOIN ruis_drawing B ON A.drawing_id = B.id 
                        AND B.image_path <> '' 
                    WHERE
                        A.sale_order_code='$item->sales_order_code'
                        and A.line_project_code= '$sales_order_project_code'
                        and A.material_code='$item->material_code'
                        and B.status='1'
                        ) A 
                    GROUP BY
                        A.material_code 	) E ON A.material_code = E.material_code 
                        AND A.version_code = E.version_code 
                    WHERE
                        A.sale_order_code='$item->sales_order_code'
                        and A.line_project_code='$sales_order_project_code'
                        and A.material_code='$item->material_code'
                        and B.status='1'";
                    $data = json_encode(DB::select($sql));
                    $obj = json_decode($data);
                }
                else
                {
                    //查询洗标文件
                    $obj = DB::table(config('alias.rdcl') . ' as rdcl')
                    ->leftJoin(config('alias.rdr') . ' as rdr', 'rdr.id', '=', 'rdcl.drawing_id')
                    ->select([
                        'rdr.image_path',
                        'rdr.name',
                        'rdr.ctime',
                        'rdcl.material_code',
                        'rdcl.drawing_id',
                        'rdcl.id as care_label_id',
                        'rdcl.remark',
                        'rdcl.version_code',
                    ])
                    ->where([
                        ['rdcl.sale_order_code', '=', $item->sales_order_code],
                        ['rdcl.line_project_code', '=', str_pad($item->sales_order_project_code, 6, '0',STR_PAD_LEFT)],
                        ['rdcl.material_code', '=', $item->material_code],
                        ['rdr.status', '=', 1],
                    ])
                    ->distinct('care_label_id')
                    ->orderBy('rdcl.version_code', 'DESC')
                    ->get();
                }
            
            foreach ($obj as $item){
                if(!empty($item) && !is_null($item)){
                    $item->material_attributes = $obj_attr;
                }
                $result[]=(empty($item) || is_null($item))?[]:$item;
            }
        }
        //过滤空数组
        $result=array_filter($result,function ($value){
            return !empty($value);
        });
        $arr = [];
        //分组过滤
        if(!empty($result))
        {
            foreach ($result as $rk=>$rv)
            {
                $arr[$rv->material_code.'_'.$rv->version_code] = $rv;
            }

        }
        return array_values($arr);
    }     

    protected function array_sort($arr,$keys,$type='asc'){
        $keysvalue = $new_array = array();
        foreach ($arr as $k=>$v){
            $keysvalue[$k] = $v[$keys];
        }
        if($type == 'asc'){
            asort($keysvalue);
        }else{
            arsort($keysvalue);
        }
        reset($keysvalue);
        foreach ($keysvalue as $k=>$v){
            return $k;
            //$new_array[$k] = $arr[$k];
        }
       // return $new_array;
    }
}