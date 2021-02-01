<?php
/**
 * 
 * User: hao.li
 * Date: 2019/9/11
 * Time: 8:00
 */

namespace App\Http\Models\Language;

use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Material\Material;
use Maatwebsite\Excel\Facades\Excel;
use PHPExcel_Cell;

class Language extends Base{

    public function __construct()
    {
        $this->table='mbh_language';  //语言表
        $this->abilityLanguageTable='mbh_ability_language'; //能力多语表
        $this->operationLanguageTable='mbh_operation_language'; //工序多语表
        $this->specialLanguageTable='mbh_special_desc_language'; //特殊工艺多语表
        $this->drawingLanguageTable='mbh_drawing_language';  //图片多语表
        $this->abilityTable='ruis_ie_ability'; //能力表
        $this->operationTable='ruis_ie_operation';  //工序表
        $this->routingTable='ruis_bom_routing_base';  //特殊工艺表
        $this->routingDrawingTable='ruis_bom_routing_drawing';  //
        $this->drawingTable='ruis_drawing'; //图片表
    }

    //新增语言
    public function addLanguage($input){
        $check=DB::table($this->table)->select('code')->where('code',$input['code'])->first();
        if(!empty($check->code)) TEA('804');
        $data=[
            'code' => $input['code'],
            'name' => $input['name'],
            'label'=> $input['label'],
            'description' =>$input['description']
        ];
        $num=DB::table($this->table)->insertGetId($data);
        return $num;
    }

    //获取语言列表
    public function getLanguageList($input){
        $data=[
            'id as languageId',
            'code',
            'name' ,
            'label',
            'description'
        ];
        $obj_list=DB::table($this->table)->select($data)
                 ->offset(($input['page_no']-1)*$input['page_size'])
                 ->limit($input['page_size'])->get();
        $obj_list->total_records=DB::table($this->table)->select($data)->count();
        return $obj_list;
    }

    //获取所有语言
    public function getAllLanguage($input){
        $data=[
            'id as languageId',
            'code',
            'name' ,
            'label',
            'description'
        ];
        $obj_list=DB::table($this->table)->select($data)->get();
        return $obj_list;
    }

    //修改语言
    public function updateLanguage($input){
        $data=[
            'code' => $input['code'],
            'name' => $input['name'],
            'label'=> $input['label'],
            'description' =>$input['description']
        ];
        $num=DB::table($this->table)->where('id',$input['id'])->update($data);
        return $num;
    }

    //删除语言
    public function deleteLanguage($id){
        if(empty($id)) TEA('804');
        $num=DB::table($this->table)->where('id',$id)->delete();
        return $num;
    }

    //获取所有能力列表
    public function getAbility(&$input){
        $languageCode=$input['languageCode'];
        $data=[
            'ab.id as abilityId',
            'ab.name as abilityName',
            'ab.code',
            'ab.description as abilityDescription',
            'al.name as languageName',
            'al.description as languageDescription'
        ];
        $list=DB::table($this->abilityTable.' as ab')->select($data)
                 ->leftJoin($this->abilityLanguageTable.' as al',function($join)use($languageCode){
                     $join->on('ab.id','al.ability_id')
                     ->where('al.language_code','=',$languageCode);
                 })
                 ->leftJoin($this->table.' as language','al.language_code','language.code')
                 ->where('ab.deleted',0)
                 ->offset(($input['page_no']-1)*$input['page_size'])
                 ->limit($input['page_size']);
        $obj_list=$list->get();
        $obj_list->total_records=DB::table($this->abilityTable.' as ab')->select($data)
        ->leftJoin($this->abilityLanguageTable.' as al',function($join)use($languageCode){
            $join->on('ab.id','al.ability_id')
            ->where('al.language_code','=',$languageCode);
        })
        ->leftJoin($this->table.' as language','al.language_code','language.code')
        ->where('ab.deleted',0)
        ->count();
        return $obj_list;
    }

    //导出能力模版
    public function exportExcel(&$input){
        $where=array();
        if(!isset($input['data']) || !empty($input['data'])){
            $abilityIds=explode(',',$input['data']);
            $where=['ab.id',$abilityIds];
        }
        $languageCode=$input['languageCode'];
        $data=[
            'ab.id as abilityId',
            'ab.name as abilityName',
            'ab.code as abilityCode',
            'ab.description as abilityDescription',
            'al.name as languageName',
            'al.description as languageDescription',
        ];
        if(empty($where)){
            $obj_list=DB::table($this->abilityTable.' as ab')->select($data)
                 ->leftJoin($this->abilityLanguageTable.' as al',function($join)use($languageCode){
                     $join->on('ab.id','al.ability_id')
                     ->where('al.language_code','=',$languageCode);
                 })
                 ->where('ab.deleted',0)
                 ->get();
        }else{
            $obj_list=DB::table($this->abilityTable.' as ab')->select($data)
                     ->leftJoin($this->abilityLanguageTable.' as al',function($join)use($languageCode){
                         $join->on('ab.id','al.ability_id')
                         ->where('al.language_code','=',$languageCode);
                     })
                     ->where('ab.deleted',0)
                     ->whereIn($where[0],$where[1])
                     ->get();
        }
        $name_ay=DB::table($this->table)->select('name')->where('code',$languageCode)->first();
        foreach ($obj_list as $key => $value) {
            $value->name=$name_ay->name;
        }
        $headerName=[
                    ['能力ID','语言编码','语言','能力编码','名称','name','描述','description']
                ];
        foreach ($obj_list as $key => $value) {
            $headerName[]=[
                $value->abilityId,$input['languageCode'],$value->name,$value->abilityCode,$value->abilityName,$value->languageName,$value->abilityDescription,
                $value->languageDescription
            ];
        }  
        $fileName='能力多语言导出模版'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit();  

    }

    //能力与语言关联
    public function relevanceAbillity($input){
        $insertData=[];
        $updateData=[];
        foreach ($input as $key => $value) {
            $list=DB::table($this->abilityLanguageTable)->where('ability_id',$value->abilityId)->where('language_code',$value->languageCode)->get();
            if(empty($list[0])){
                $insertData=[
                    'ability_id'=>$value->abilityId,
                    'language_code'=>$value->languageCode,
                    'name'=>$value->name,
                    'description'=>$value->description
                ];
                $insNum=DB::table($this->abilityLanguageTable)->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value->name,
                    'description'=>$value->description
                ];
                $updNum=DB::table($this->abilityLanguageTable)->where('ability_id',$value->abilityId)->where('language_code',$value->languageCode)->update($updateData);
                if(empty($updNum)) TEA('804');
            }
        }
        
    }

    //检查能力是否已经与该语言关联
    public function checkAbility($data){
        $checkData=[];
        $i=0;
        $ability_ay=[];
        foreach ($data as $key => $value) {
            $checkData=DB::table($this->abilityLanguageTable)->where('ability_id',$value['abilityId'])->where('language_code',$value['languageCode'])->get();
            if(!empty($checkData[0])){
                $ability_ay[$i]['language']=$value['language'];
                $ability_ay[$i]['abilityCode']=$value['abilityCode'];
                $ability_ay[$i]['abilityName']=$value['abilityName'];
                $i++;
            }
        }
        return $ability_ay;
    }

    //检查导入的语言编码是否已经维护
    public function checkCode($data){
        $noCode=[];
        $i=0;
        foreach($data as $k=>$v){
            $languageCode=DB::table($this->table)->where('code',$v['languageCode'])->get();
            if(empty($languageCode[0])){
                $noCode[$i]=$v['languageCode'];
            }
        }
        return $noCode;
    }

    //导入能力与语言关联
    public function importExcel($data){
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            $list=DB::table($this->abilityLanguageTable)->where('ability_id',$value['abilityId'])->where('language_code',$value['languageCode'])->get();
            if(empty($list[0])){
                $insertData=[
                    'ability_id'=>$value['abilityId'],
                    'language_code'=>$value['languageCode'],
                    'name'=>$value['name'],
                    'description'=>$value['description']
                ];
                $insNum=DB::table($this->abilityLanguageTable)->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value['name'],
                    'description'=>$value['description']
                ];
                $updNum=DB::table($this->abilityLanguageTable)->where('ability_id',$value['abilityId'])->where('language_code',$value['languageCode'])->update($updateData);
            }
        }

    }

    //工序与语言关联列表
    public function getOperation($input){
        $languageCode=$input['languageCode'];
        $data=[
            'op.id as operationId',  
            'op.code as operationCode',
            'op.name as operationName',
            'opl.name as operationLanName',
            'oa.ability_name as abilityName',
            'al.name as abilityLanName'
        ];
        $list=DB::table($this->operationTable.' as op')->select($data)
                 ->leftJoin($this->operationLanguageTable.' as opl',function($join)use($languageCode){
                     $join->on('op.id','opl.operation_id')
                     ->where('opl.language_code','=',$languageCode);
                 })
                 ->leftJoin('ruis_ie_operation_ability as oa','oa.operation_id','op.id')
                 ->leftJoin($this->abilityLanguageTable.' as al','al.ability_id','oa.ability_id')
                 ->leftJoin($this->table.' as language','al.language_code','language.code')
                 ->offset(($input['page_no']-1)*$input['page_size'])
                 ->limit($input['page_size']);
        $obj_list=$list->get();
        $obj_list->total_records=DB::table($this->operationTable.' as op')->select($data)
        ->leftJoin($this->operationLanguageTable.' as opl',function($join)use($languageCode){
            $join->on('op.id','opl.operation_id')
            ->where('opl.language_code','=',$languageCode);
        })
        ->leftJoin('ruis_ie_operation_ability as oa','oa.operation_id','op.id')
        ->leftJoin($this->abilityLanguageTable.' as al','al.ability_id','oa.ability_id')
        ->leftJoin($this->table.' as language','al.language_code','language.code')->count();
        return $obj_list;
    }

    //工序与多语言导出模版
    public function exportOperationExcel($input){
        $where=array();
        if(!isset($input['data']) || !empty($input['data'])){
            $operationIds=explode(',',$input['data']);
            $where=['op.id',$operationIds];
        }
        $languageCode=$input['languageCode'];
        $data=[
            'op.id as operationId',     //工序ID
            'op.code as operationCode', //工序编码
            'op.name as operationName', //工序名称
            'opl.name as operationLanName', //工序语言名称
        ];
        if(empty($where)){
            $obj_list=DB::table($this->operationTable.' as op')->select($data)
                     ->leftJoin($this->operationLanguageTable.' as opl',function($join)use($languageCode){
                         $join->on('op.id','opl.operation_id')
                         ->where('opl.language_code','=',$languageCode);
                     })
                     ->get();
        }else{
            $obj_list=DB::table($this->operationTable.' as op')->select($data)
                     ->leftJoin($this->operationLanguageTable.' as opl',function($join)use($languageCode){
                         $join->on('op.id','opl.operation_id')
                         ->where('opl.language_code','=',$languageCode);
                     })
                     ->whereIn($where[0],$where[1])
                     ->get();
        }
        $name_ay=DB::table($this->table)->select('name')->where('code',$languageCode)->first();
        foreach ($obj_list as $key => $value) {
            $value->languageName=$name_ay->name;
        }
        $headerName=[
                    ['工序ID','语言编码','语言','工序编码','名称','name']
                ];
        foreach ($obj_list as $key => $value) {
            $headerName[]=[
                $value->operationId,$input['languageCode'],$value->languageName,$value->operationCode,$value->operationName,$value->operationLanName
            ];
        }
        $fileName='工序多语言导出模版'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit();  
    }

    //工序与多语言模版导入
    public function importOperationExcel($data){
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            $list=DB::table($this->operationLanguageTable)->where('operation_id',$value['operationId'])->where('language_code',$value['languageCode'])->get();
            if(empty($list[0])){
                $insertData=[
                    'operation_id'=>$value['operationId'],
                    'language_code'=>$value['languageCode'],
                    'name'=>$value['name'],
                ];
                $insNum=DB::table($this->operationLanguageTable)->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value['name'],
                ];
                $updNum=DB::table($this->operationLanguageTable)->where('operation_id',$value['operationId'])->where('language_code',$value['languageCode'])->update($updateData);
            }
        }

    }

    //工序与多语言关联
    public function operationLanguage($input){
        $insertData=[];
        $updateData=[];
        foreach ($input as $key => $value) {
            $list=DB::table($this->operationLanguageTable)->where('operation_id',$value->operationId)->where('language_code',$value->languageCode)->get();
            if(empty($list[0])){
                $insertData=[
                    'operation_id'=>$value->operationId,
                    'language_code'=>$value->languageCode,
                    'name'=>$value->name,
                ];
                $insNum=DB::table($this->operationLanguageTable)->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value->name,
                ];
                $updNum=DB::table($this->operationLanguageTable)->where('operation_id',$value->operationId)->where('language_code',$value->languageCode)->update($updateData);
            } 
        }
    }

    //获取特殊工艺列表
    public function getSpecialCraftList($input){
        $languageCode=$input['languageCode'];
        $bomId=$input['bom_id'];
        /* $data=[
            'rbrb.id as rbrbId', //ID
            'rbrb.comment',  //特殊工艺
            'msdl.desc as specialDesc'  ,   //特殊工艺多语言
        ];
        $obj_list=DB::table($this->routingTable.' as rbrb')
                ->select($data)
                ->leftJoin($this->specialLanguageTable.' as msdl',function($join)use($languageCode){
                    $join->on('msdl.rbrb_id','rbrb.id')
                    ->where('msdl.language_code',$languageCode);
                })
                ->where('rbrb.routing_id',$input['routing_id'])
                ->where('rbrb.bom_id',$bomId)
                ->get();
        $obj_list[0]->material=$this->getMaterial($input['routing_id'],$bomId,$languageCode);  */
        $obj_list=$this->getMaterial($input['routing_id'],$bomId,$languageCode);
        return $obj_list;
     }

     //获取进出料
     public function getMaterial($routingId,$bomId,$languageCode){
        $data=[
            'rbrb.id as rbrbId',
            'rio.id as operationId',  //工序ID
            'rio.name as operationName',//工序名称
            'mol.name as operationLanName', //工序多语名称
            'ria.id as abilityId',    //能力ID
            'ria.name as abilityName',//能力名称
            'mal.name as abilityLanName',//能力多语名称
            'rbri.material_id as materialId', //物料编码ID
            'rbri.type',    //物料类型
            'rbri.desc as materialDesc', //物料编码描述
            'rbri.use_num as useNum',  //用料数量
            'rbri.POSNR as POSNR',     //SAP行项目号
            'rbri.step_path',          //步骤路径
            'rbri.index',              //权重
            'mmd.materialDesc as materialLanDesc', //物料编码多语言描述
            'rm.item_no',   //物料编码
            'rm.description', //物料描述
            'mml.MAKTX as maktx',//物料描述外语
            'rm.name as materialName',//物料名称
            'mml.ZMA001 as zma001',   //物料名称外语
             'rm.identity_card_string',   //物料属性
             'mav.value as identityValue',  //物料属性外语
             'rbrb.comment as comment',     //特殊工艺
             'msdl.desc as specialDesc',   //特殊工艺多语言
             'uu.commercial as commercial'   //单位
        ];

           $obj_list=DB::table('ruis_bom_routing_item as rbri')
                      ->select($data)
                      ->leftJoin($this->routingTable.' as rbrb','rbrb.id','rbri.bom_routing_base_id')
                      ->leftJoin($this->operationTable.' as rio','rio.id','rbrb.operation_id')
                      ->leftJoin($this->operationLanguageTable.' as mol',function($join)use($languageCode){
                          $join->on('mol.operation_id','rbrb.operation_id')
                          ->where('mol.language_code',$languageCode);
                      })
                      ->leftJoin($this->abilityTable.' as ria','ria.id','rbrb.operation_ability_ids')
                      ->leftJoin($this->abilityLanguageTable.' as mal',function($join)use($languageCode){
                          $join->on('ria.id','mal.ability_id')
                          ->where('mal.language_code',$languageCode);
                      })
                      ->leftJoin('ruis_material as rm','rbri.material_id','rm.id')
                      ->leftJoin('mbh_mara_language as mml',function($join)use($languageCode){
                          $join->on('mml.MATNR','rm.item_no')
                          ->where('mml.LANGU',$languageCode);
  
                      })
                      ->leftJoin('mbh_material_description as mmd',function($join)use($languageCode){
                          $join->on([['mmd.rbrb_id','rbrb.id'],['mmd.material_id','rbri.material_id'],['mmd.POSNR','rbri.POSNR']])
                          ->where('mmd.language_code',$languageCode);
                      })
                      ->leftJoin('mbh_attribute_value as mav',function($join)use($languageCode){
                          $join->on('mav.material_id','rm.id')
                          ->where('mav.LANGU',$languageCode);
                      })
                      ->leftJoin($this->specialLanguageTable.' as msdl',function($join)use($languageCode){
                        $join->on('msdl.rbrb_id','rbrb.id')
                        ->where('msdl.language_code',$languageCode);
                    })
                    ->leftJoin('ruis_uom_unit as uu','uu.id','rbri.bom_unit_id')
                      ->where('rbri.bom_id',$bomId)
                      ->where('rbri.routing_id',$routingId)
                      ->orderBy('rbrb.routing_node_id')
                      ->orderBy('rbrbId')
                      ->orderBy('rbri.type')
                      ->orderBy('POSNR')
                      ->orderBy('index')
                      ->get()
                      ->groupBy('operationId');
           $stmt = [];
           $i = 0;
           foreach($obj_list as $item){
               foreach ($item as $key => $value) {
                   $stmt[$i][] = $value;
               }
               $i++;
           }
           //pd($stmt);
           //外语拼接
           for($i=0;$i<count($stmt);$i++){
               for($j=0;$j<count($stmt[$i]);$j++){
                   $identityValue=$stmt[$i][$j]->identityValue;
                   for($k=$j+1;$k<count($stmt[$i]);$k++){
                       if(($stmt[$i][$j]->item_no==$stmt[$i][$k]->item_no) && ($stmt[$i][$j]->POSNR==$stmt[$i][$k]->POSNR)){
                           $identityValue=$identityValue.'|'.$stmt[$i][$k]->identityValue;
                           $stmt[$i][$j]->identityValue=$identityValue;
                       }else{
                           break;
                       }
                   }                 
               }
           }
           $stmt1=[];
           for($i=0;$i<count($stmt);$i++){
               $xb=0;
               $stmt1[$i][$xb++]=$stmt[$i][0];
               for($j=0;$j<count($stmt[$i]);$j++){
                       if(($stmt1[$i][$xb-1]->item_no!=$stmt[$i][$j]->item_no) || ($stmt1[$i][$xb-1]->POSNR!=$stmt[$i][$j]->POSNR)){
                           $stmt1[$i][$xb++]=$stmt[$i][$j];
                       }
               }
           }
           for ($i=0;$i<count($stmt1);$i++) {
               for($j=0;$j<count($stmt1[$i]);$j++){
                   $step=explode(',',$stmt1[$i][$j]->step_path);
                   $stmt1[$i][$j]->practice=$this->getPractice($step,$languageCode);
               }
            }
       return $stmt1;
     }

     //获取做法
     public function getPractice($step,$languageCode){
         $data=[
             'rpf.id as rpfId',
             'rpf.code as rpfCode',
             'rpf.name as rpfName',
             'rpf.description as rpfDescription',
             'mpfl.name as mpflName',
             'mpfl.description as mpflDescription'
         ];
         $obj_list=DB::table('ruis_practice_field as rpf')
                    ->select($data)
                    ->leftJoin('mbh_practice_field_language as mpfl',function($join)use($languageCode){
                        $join->on('rpf.id','mpfl.practice_field_id')
                        ->where('mpfl.language_code',$languageCode);

                    })
                    ->whereIn('rpf.id',$step)
                    ->get();
        return $obj_list;
     }

     //特殊工艺与多语言关联
     public function specialLanguage($data){
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            $list=DB::table($this->specialLanguageTable)->where('rbrb_id',$value->specialId)->where('language_code',$value->languageCode)->get();
            if(empty($list[0])){
                if(empty($value->specialDesc)) continue;
                $insertData=[
                    'rbrb_id'=>$value->specialId,
                    'language_code'=>$value->languageCode,
                    'desc'=>$value->specialDesc,
                    'ctime'=>date('Y-m-d H:i:s'),
                    'mtime'=>date('Y-m-d H:i:s'),
                    'creator_id'=>$creator_id
                ];
                $insNum=DB::table($this->specialLanguageTable)->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'desc'=>$value->specialDesc,
                    'mtime'=>date('Y-m-d H:i:s'),
                    'creator_id'=>$creator_id
                ];
                $updNum=DB::table($this->specialLanguageTable)->where('rbrb_id',$value->specialId)->where('language_code',$value->languageCode)->update($updateData);
            }
        }       
     }

     //图片与多语言关联
     public function imageLanguage($input){
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $datas=json_decode($input['datas']);
        foreach ($datas as $k => $v) {
            $list=DB::table('mbh_drawing_language')->where('rbrd_id',$v->rbrd_id)->where('drawing_id',$v->drawing_id)->where('language_code',$v->language_code)->get();
            if(empty($list[0])){
                $data=[
                    'rbrd_id'=>$v->rbrd_id,
                    'drawing_id'=>$v->drawing_id,
                    'language_code'=>$v->language_code,
                    'ctime'=>date('Y-m-d H:i:s'),
                    'mtime'=>date('Y-m-d H:i:s'),
                    'creator_id'=>$creator_id
                ];
                $num=DB::table('mbh_drawing_language')->insertGetId($data);
            }else{
                $num=1;
                continue;
            }
        }
         return $num;
     }

     //如果有外文图片则获取外语图片，如果没有就获取中文图片
     /* public function getImage($input){
        $languageCode=$input['languageCode'];
        $rbrb_id=$input['rbrb_id'];
        $data=[
            'rd.id as imageId',  //图片ID
            'rd.name',   //图片名称
            'rd.image_path',  //图片路径
            'rd.width',       //图片宽度
            'rd.height'       //图片高度

        ];
        $list=DB::table('mbh_drawing_language')->select('drawing_id')->where('rbrd_id',$rbrb_id)->where('language_code',$languageCode)->get();
       if(empty($list[0]->drawing_id)){
           $obj_list=DB::table('ruis_bom_routing_base as rbrb')
                    ->select($data)
                    ->leftJoin('ruis_bom_routing_drawing as rbrd','rbrb.id','rbrd.bom_routing_base_id')
                    ->leftJoin('ruis_drawing as rd','rbrd.drawing_id','rd.id')
                    ->where('rbrb.id',$rbrb_id)
                    ->get();
           if(empty(obj2array($obj_list))){
               TEA('804');
           }
       }else{
           $obj_list=DB::table('mbh_drawing_language as mdl')
                   ->select($data)
                   ->leftJoin('ruis_drawing as rd','rd.id','mdl.drawing_id')
                   ->where('mdl.rbrd_id',$rbrb_id)
                   ->where('mdl.language_code',$languageCode)
                   ->get();
       }
       foreach ($obj_list as $key => $value) {
           if(empty($value->image_path)){
               unset($obj_list[$key]);
           }
       }
       return $obj_list;
     } */

     //获取中文图片
     public function getImage($input){
        $languageCode=$input['languageCode'];
        $rbrb_id=explode(',',$input['rbrb_id']);
        $data=[
            'rbrb.id as rbrdId',
            'rd.id as imageId',  //图片ID
            'rd.name',   //图片名称
            'rd.image_path',  //图片路径
            'rd.width',       //图片宽度
            'rd.height'       //图片高度

        ];
        $obj_list=DB::table('ruis_bom_routing_base as rbrb')
                    ->select($data)
                    ->leftJoin('ruis_bom_routing_drawing as rbrd','rbrb.id','rbrd.bom_routing_base_id')
                    ->leftJoin('ruis_drawing as rd','rbrd.drawing_id','rd.id')
                    ->whereIn('rbrb.id',$rbrb_id)
                    ->get();
           if(empty(obj2array($obj_list))){
               TEA('804');
           }
        return $obj_list;
     }

     //获取外语图片
     public function getLanImage($input){
        $languageCode=$input['languageCode'];
        $rbrb_id=explode(',',$input['rbrb_id']);
        $data=[
            'rd.id as imageId',  //图片ID
            'rd.name',   //图片名称
            'rd.image_path',  //图片路径
            'rd.width',       //图片宽度
            'rd.height'       //图片高度

        ];
        $obj_list=DB::table('mbh_drawing_language as mdl')
                   ->select($data)
                   ->leftJoin('ruis_drawing as rd','rd.id','mdl.drawing_id')
                   ->whereIn('mdl.rbrd_id',$rbrb_id)
                   ->where('mdl.language_code',$languageCode)
                   ->get();
        return $obj_list;
     }

     //删除图片
     public function deleteImage($id){
         //$num1=DB::table($this->drawingTable)->where('id',$id)->delete();
         $num2=DB::table($this->drawingLanguageTable)->where('drawing_id',$id)->delete();
         return $num2;
     }

     //特殊工艺导出模版
     public function exportSpecial($input){   
        $languageCode=$input['languageCode'];
        //$bom_id=explode(',',$input['data']);
        $data=[
            'rbrb.id as specialId',     //特殊工艺ID
            'rb.code as code',          //物料清单编码
            'rb.name as name',                  //物料清单名称
            'rbrb.comment as specialComment', //特殊工艺
            'msdl.desc as specialDesc', //特殊工艺语言
            'rpf.name'
        ];
        $obj_list = DB::table(config('alias.rbrb').' as rbrb')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->leftJoin('ruis_bom as rb','rbrb.bom_id','rb.id')
            ->leftJoin($this->specialLanguageTable.' as msdl',function($join)use($languageCode){
                $join->on('rbrb.id','msdl.rbrb_id')
                ->where('msdl.language_code','=',$languageCode);
            })
            ->select($data)
            ->where([['rbrb.operation_id','=',$input['operation_id']],['rb.ctime','>=',strtotime($input['begin_time'])],['rb.ctime','<=',strtotime($input['end_time'])]])
            ->orderBy('rbrb.index','asc')
            ->get();
            
        $name_ay=DB::table($this->table)->select('name')->where('code',$languageCode)->first();
        foreach ($obj_list as $key => $value) {
            $value->languageName=$name_ay->name;
        }
        $headerName=[
                    ['rbrb_id','语言编码','语言','物料清单编码','物料名称','特殊工艺','special_desc']
                ];
        foreach ($obj_list as $key => $value) {
            if(empty($value->specialComment)) continue;
            $headerName[]=[
                $value->specialId,$input['languageCode'],$value->languageName,$value->code,$value->name,$value->specialComment,$value->specialDesc
            ];
        }
        $fileName='特殊工艺多语言导出模版'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit();  
     }

     //导入特殊工艺模版
     public function importSpecial($data){
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            $list=DB::table($this->specialLanguageTable)->where('rbrb_id',$value['specialId'])->where('language_code',$value['languageCode'])->get();
            if(empty($list[0])){
                $insertData=[
                    'rbrb_id'=>$value['specialId'],
                    'language_code'=>$value['languageCode'],
                    'desc'=>$value['specialDesc'],
                    'ctime'=>date('Y-m-d H:i:s'),
                    'mtime'=>date('Y-m-d H:i:s'),
                    'creator_id'=>$creator_id
                ];
                $insNum=DB::table($this->specialLanguageTable)->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'desc'=>$value['specialDesc'],
                    'mtime'=>date('Y-m-d H:i:s'),
                    'creator_id'=>$creator_id
                ];
                $updNum=DB::table($this->specialLanguageTable)->where('rbrb_id',$value['specialId'])->where('language_code',$value['languageCode'])->update($updateData);
            }
        }
     }

     //导出物料属性
     public function exportAttribute($input){
        $languageCode=$input['languageCode'];
        $data=[
            'ad.id as attributeId',     //物料属性ID
            'ad.key as attributeKeys', //物料属性键值
            'ad.name as attributeName', //物料属性中文名称
            'mad.name as attributeLanName' //物料属性外语名称
        ]; 
            $obj_list=DB::table('attribute_definition'.' as ad')->select($data)
                     ->leftJoin('mbh_attribute_definition'.' as mad',function($join)use($languageCode){
                         $join->on('ad.key','mad.key')
                         ->where('mad.LANGU','=',$languageCode);
                     })
                     ->get();
        $name_ay=DB::table($this->table)->select('name')->where('code',$languageCode)->first();
        foreach ($obj_list as $key => $value) {
            $value->languageName=$name_ay->name;
        }
        $headerName=[
                    ['物料属性ID','属性键值','语言编码','语言','物料属性名称','物料属性外语名称']
                ];
        foreach ($obj_list as $key => $value) {
            $headerName[]=[
                $value->attributeId,$value->attributeKeys,$input['languageCode'],$value->languageName,$value->attributeName,$value->attributeLanName
            ];
        }
        $fileName='物料属性多语言导出模版'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit(); 
     }

     //导入物料属性模版
     public function importAttribute($data){
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            $list=DB::table('mbh_attribute_definition')->where('key',$value['attributeKeys'])->where('LANGU',$value['languageCode'])->get();
            if(empty($list[0])){
                $insertData=[
                    'definition_id'=>$value['attributeId'],
                    'key'=>$value['attributeKeys'],
                    'name'=>$value['attributeLanName'],
                    'LANGU'=>$value['languageCode'],
                    'ctime'=>date('Y-m-d H:i:s')
                ];
                $insNum=DB::table('mbh_attribute_definition')->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value['attributeLanName'],
                ];
                $updNum=DB::table('mbh_attribute_definition')->where('key',$value['attributeKeys'])->where('LANGU',$value['languageCode'])->update($updateData);
            }
        }
     }

      //导出物料属性值
      public function exportValue($input){
        $languageCode=$input['languageCode'];
        $ids=explode(',',$input['string']);
        $data=[
            'ma.material_id as materialId',    //物料ID
            'ma.attribute_definition_id as definitionId', //物料属性ID
            'rm.item_no as itemNo',            //物料编码
            'rm.name as materialName',        //物料名称
            'ma.value as materialValue',   //物料属性值名称
            'mav.value as lanValue'        //物料属性值外语名称
        ];
        $obj_list=DB::table('material_attribute'.' as ma')
                ->select($data)
                ->leftJoin('ruis_material'.' as rm','ma.material_id','rm.id')
                ->leftJoin('mbh_attribute_value'.' as mav',function($join)use($languageCode){
                    $join->on('ma.material_id','mav.material_id')
                    ->on('ma.attribute_definition_id','mav.definition_id')
                    ->where('mav.LANGU','=',$languageCode);
                })
                ->whereIn('ma.material_id',$ids)
                ->get();
                $name_ay=DB::table($this->table)->select('name')->where('code',$languageCode)->first();
                foreach ($obj_list as $key => $value) {
                    $value->languageName=$name_ay->name;
                }
                $headerName=[
                            ['物料属性ID','物料ID','物料编码','语言编码','语言','物料名称','物料属性值名称','物料属性值多语言名称']
                        ];
                foreach ($obj_list as $key => $value) {
                    $headerName[]=[
                        $value->definitionId,$value->materialId,$value->itemNo,$input['languageCode'],$value->languageName,$value->materialName,
                    $value->materialValue,$value->lanValue];
                }
                $fileName='物料属性多语言导出模版'.date('Y-m-d H:i:s',time());  
                set_time_limit(0);
                 header('Content-Type: application/vnd.ms-excel');
                 header('Cache-Control:max-age=0');
                //清除缓存
                ob_end_clean();
                //调用Excel组件进行导出
                Excel::create($fileName,function($excel) use ($headerName){
                    $excel->sheet('first',function($sheet) use ($headerName){
                        $sheet->rows($headerName);
                        //冻结第一行
                        $sheet->freezeFirstRow();
                    });
                })->export('xlsx');
                exit(); 
     }

     //导入物料属性值模版
     public function importValue($data){
        foreach ($data as $key => &$value) {
            $langu_definition_id=DB::table('mbh_attribute_definition')->select('id')->where('definition_id',$value['attributeId'])->first();
            if(empty($langu_definition_id)){
                $value['lanDefinitionId']='';
            }else{
                $value['lanDefinitionId']=$langu_definition_id->id;
            }
        }
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            $list=DB::table('mbh_attribute_value')->where('material_id',$value['materialId'])->where('definition_id',$value['attributeId'])->where('LANGU',$value['languageCode'])->get();
            if(empty($list[0])){
                $insertData=[
                    'material_id'=>$value['materialId'],
                    'definition_id'=>$value['attributeId'],
                    'langu_definition_id'=>$value['lanDefinitionId'],
                    'value'=>$value['lanValue'],
                    'LANGU'=>$value['languageCode'],
                    'ctime'=>date('Y-m-d H:i:s')
                ];
                $insNum=DB::table('mbh_attribute_value')->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'value'=>$value['lanValue'],
                ];
                $updNum=DB::table('mbh_attribute_value')->where('material_id',$value['materialId'])->where('definition_id',$value['attributeId'])->where('LANGU',$value['languageCode'])->update($updateData);
            }
        }
     }

     //检查要发布的是否已经有多语言
     public function checkBom($input){
        $data=[
            'msdl.*'
        ];
         $bomId=$input['bom_id'];
        // $material_id=$input['material_id'];
         $routingId=DB::table('ruis_bom_routing')->select('routing_id')->where('bom_id',$bomId)->first();
         if(empty($routingId->routing_id)) TEA('202');
         $obj_list=DB::table('mbh_special_desc_language as msdl')
                ->select($data)
                ->leftJoin('ruis_bom_routing_base as rbrb','rbrb.id','msdl.rbrb_id')
                ->where('rbrb.bom_id',$bomId)
                ->where('rbrb.routing_id',$routingId->routing_id)
                ->get();
         $obj_list->marterial_info=$this->checkDrawingLan($bomId,$routingId->routing_id);
         return $obj_list;
     }
     //检查当前使用的工艺是否已经维护多语言
     public function checkBomLan($input){
         $material_id=$input['material_id'];
         //1.根据BOM的顶级主键和当前生效的状态查找BOM
         $bomId=DB::table('ruis_bom')->select('id')->where([['material_id',$material_id],['is_version_on',1]])->first();

         //2.根据bom_id 查找出工艺路线ID
         $routingId=DB::table('ruis_bom_routing')->select('routing_id')->where('bom_id',$bomId->id)->first();
         if(empty($routingId->routing_id)) TEA('202');

         //3.根据bomId和routingId查找出是否有多语言
         $data=[
             'msdl.*',
             'rbrb.routing_node_id'
         ];
         $obj_list=DB::table('mbh_special_desc_language as msdl')
                ->select($data)
                ->leftJoin('ruis_bom_routing_base as rbrb','rbrb.id','msdl.rbrb_id')
                ->where('rbrb.bom_id',$bomId->id)
                ->where('rbrb.routing_id',$routingId->routing_id)
                ->orderBy('msdl.rbrb_id')
                ->get();
         $obj_list->marterial_info=$this->checkDrawingLan($bomId->id,$routingId->routing_id);
         $obj_list->marterial_describle=$this->checkMaterialDescrible($bomId->id,$routingId->routing_id);
        return $obj_list;
     }

      //检查当前使用的工艺是否已经维护图片多语言
      public function checkDrawingLan($bomId,$routingId){
          $data=[
              'mdl.*',
              'rbrb.routing_node_id'
          ];
        $drawing_list=DB::table('mbh_drawing_language as mdl')
        ->select($data)
        ->leftJoin('ruis_bom_routing_base as rbrb','rbrb.id','mdl.rbrd_id')
        ->where('rbrb.bom_id',$bomId)
        ->where('rbrb.routing_id',$routingId)
        ->orderBy('mdl.rbrd_id')
        ->get();
        return $drawing_list;
      }

      //检查当前使用的工艺是否已经维护过物料描述
      public function checkMaterialDescrible($bomId,$routingId){
          $data=[
              'mmd.*',
              'rbrb.routing_node_id'
          ];
          $material_describle=DB::table('mbh_material_description as mmd')
          ->select($data)
          ->leftJoin('ruis_bom_routing_base as rbrb','rbrb.id','mmd.rbrb_id')
          ->where('rbrb.bom_id',$bomId)
          ->where('rbrb.routing_id',$routingId)
          ->orderBy('mmd.rbrb_id')
          ->get();
          return $material_describle;
      }

     //版本升级
     public function bomVersion($input){
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
         $data=\json_decode($input['data']);
         $datas=\json_decode($input['datas']);
         $material_describle=json_decode($input['material_describle']);
         $bomId=$input['bom_id'];
         //根据BOMID获取routingId
         $routing=DB::table('ruis_bom_routing')->select('routing_id')->where('bom_id',$bomId)->first();
         //根据bomid和routingid获取特殊工艺ID
         $rbrbId=DB::table('ruis_bom_routing_base')->select('id','routing_node_id')->where([['bom_id',$bomId],['routing_id',$routing->routing_id]])->get();
         if(!empty($data)){
             foreach ($data as $key => $value) {
                 foreach ($rbrbId as $k => $v) {
                     if($value->routing_node_id==$v->routing_node_id){
                         //判断该英文语言是否已经维护过
                        $obj_list=DB::table('mbh_special_desc_language')->select('*')->where('rbrb_id',$v->id)->where('language_code',$value->language_code)->get();
                        //如果没有维护，则新增
                        if(empty(\obj2array($obj_list))){
                            $speInsData=[
                                'rbrb_id'=>$v->id,
                                'language_code'=>$value->language_code,
                                'desc'=>$value->desc,
                                'ctime'=>date('Y-m-d H:i:s'),
                                'creator_id'=>$creator_id
                            ];
                            DB::table('mbh_special_desc_language')->insertGetId($speInsData);

                        //否则执行修改
                        }else{
                            $speUptData=[
                                'desc'=>$value->desc,
                                'mtime'=>date('Y-m-d H:i:s'),
                                'creator_id'=>$creator_id
                            ];
                            DB::table('mbh_special_desc_language')->where('rbrb_id',$v->id)->where('language_code',$value->language_code)->update($speUptData);
                        }
                     }
                 }
             }
            }
            //判断图纸是否为空
            if(!empty($datas)){
                foreach ($datas as $key => $value) {
                    foreach ($rbrbId as $k => $v) {
                        if($value->routing_node_id==$v->routing_node_id){
                            //判断图纸是否已经维护
                            $image_list=DB::table('mbh_drawing_language')->select('*')->where('rbrd_id',$v->id)->where('drawing_id',$value->drawing_id)->where('language_code',$value->language_code)->get();
                            if(empty(\obj2array($image_list))){
                                $imageData=[
                                    'rbrd_id'=>$v->id,
                                    'drawing_id'=>$value->drawing_id,
                                    'language_code'=>$value->language_code,
                                    'ctime'=>date('Y-m-d H:i:s'),
                                    'creator_id'=>$creator_id
                                    ];
                                    DB::table('mbh_drawing_language')->insertGetId($imageData);
                            }else{
                                $imageUpd=[
                                    'drawing_id'=>$value->drawing_id,
                                    'mtime'=>date('Y-m-d H:i:s'),
                                    'creator_id'=>$creator_id
                                ];
                                DB::table('mbh_drawing_language')->where('rbrd_id',$v->id)->where('language_code',$value->language_code)->update($imageUpd);
                            }
                        }
                    }
                }
            }

            //判断物料描述是否为空
            if(!empty($material_describle)){
                foreach ($material_describle as $key => $value) {
                    foreach ($rbrbId as $k => $v) {
                        if($value->routing_node_id==$v->routing_node_id){
                            //判断图纸是否已经维护
                            $material_describle_list=DB::table('mbh_material_description')->select('*')->where('rbrb_id',$v->id)->where('material_id',$value->material_id)->where('POSNR',$value->POSNR)->where('language_code',$value->language_code)->get();
                            if(empty(\obj2array($material_describle_list))){
                                $materialDescribleData=[
                                    'rbrb_id'=>$v->id,
                                    'material_id'=>$value->material_id,
                                    'materialDesc'=>$value->materialDesc,
                                    'language_code'=>$value->language_code,
                                    'POSNR'=>$value->POSNR,
                                    'ctime'=>date('Y-m-d H:i:s'),
                                    'creator_id'=>$creator_id
                                    ];
                                    DB::table('mbh_material_description')->insertGetId($materialDescribleData);
                            }else{
                                $materialDescribleUpd=[
                                    'materialDesc'=>$value->materialDesc,
                                    'mtime'=>date('Y-m-d H:i:s'),
                                    'creator_id'=>$creator_id
                                ];
                                DB::table('mbh_material_description')->where('rbrb_id',$v->id)->where('language_code',$value->language_code)->where('material_id',$value->material_id)->where('POSNR',$value->POSNR)->update($materialDescribleUpd);
                            }
                        }
                    }
                }
            }
     }

     //进出料描述多语言关联
     public function materialDescription($data){
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        foreach($data as $k=>$v){
            $list=DB::table('mbh_material_description')->where('rbrb_id',$v->rbrb_id)->where('material_id',$v->material_id)->where('POSNR',$v->POSNR)->get();
            if(empty(obj2array($list))){
                $insData=[
                    'rbrb_id'=>$v->rbrb_id,
                    'material_id'=>$v->material_id,
                    'language_code'=>$v->language_code,
                    'materialDesc'=>$v->materialDesc,
                    'ctime'=>date('Y-m-d H:i:s'),
                    'creator_id'=>$creator_id,
                    'POSNR'=>$v->POSNR
                ];
                $num=DB::table('mbh_material_description')->insertGetId($insData);
            }else{
                $updData=[
                    'materialDesc'=>$v->materialDesc,
                    'mtime'=>date('Y-m-d H:i:s'),
                    'creator_id'=>$creator_id
                ];
                $num=DB::table('mbh_material_description')->where('rbrb_id',$v->rbrb_id)->where('material_id',$v->material_id)->where('POSNR',$v->POSNR)->update($updData);
            }
        }
        return $num;
     }

     //获取工艺路线多语言列表
     public function getProcedureRouteLanguage($input){
        $languageCode=$input['languageCode'];
        $data=[
            'rpr.id as rprId',
            'rpr.code as rprcode',
            'rpr.name as rprName',
            'rpr.description as rprDescription',
            'mprl.language_code as languageCode',
            'mprl.name as lanName',
        ];
        $list=DB::table('ruis_procedure_route as rpr')->select($data)
                 ->leftJoin('mbh_procedure_route_language as mprl',function($join)use($languageCode){
                     $join->on('rpr.id','mprl.rprId')
                     ->where('mprl.language_code','=',$languageCode);
                 })
                 ->offset(($input['page_no']-1)*$input['page_size'])
                 ->limit($input['page_size']);
        $obj_list=$list->get();
        $obj_list->total_records=DB::table('ruis_procedure_route as rpr')->select($data)
        ->leftJoin('mbh_procedure_route_language as mprl',function($join)use($languageCode){
            $join->on('rpr.id','mprl.rprId')
            ->where('mprl.language_code','=',$languageCode);
        })
        ->count();
        return $obj_list;
     }

    //工艺路线与多语言关联
    public function procedureRouteLanguage($input){
        $insertData=[];
        $updateData=[];
        foreach ($input as $key => $value) {
            $list=DB::table('mbh_procedure_route_language')->where('rprId',$value->rprId)->where('language_code',$value->languageCode)->get();
            if(empty($list[0])){
                $insertData=[
                    'rprId'=>$value->rprId,
                    'language_code'=>$value->languageCode,
                    'name'=>$value->name,
                ];
                $insNum=DB::table('mbh_procedure_route_language')->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value->name,
                ];
                $updNum=DB::table('mbh_procedure_route_language')->where('rprId',$value->rprId)->where('language_code',$value->languageCode)->update($updateData);
            } 
        }
    }

    //批量导出工艺路线模版
    public function exportProcedureRouteExcel(&$input){
        $where=array();
        if(!isset($input['data']) || !empty($input['data'])){
            $rprIds=explode(',',$input['data']);
            $where=['rpr.id',$rprIds];
        }
        $languageCode=$input['languageCode'];
        $data=[
            'rpr.id as rprId',
            'rpr.name as rprName',
            'rpr.code as rprCode',
            'rpr.description as rprDescription',
            'mprl.name as languageName',
        ];
        if(empty($where)){
            $obj_list=DB::table('ruis_procedure_route as rpr')->select($data)
                 ->leftJoin('mbh_procedure_route_language as mprl',function($join)use($languageCode){
                     $join->on('rpr.id','mprl.rprId')
                     ->where('mprl.language_code','=',$languageCode);
                 })
                 ->get();
        }else{
            $obj_list=DB::table('ruis_procedure_route as rpr')->select($data)
                     ->leftJoin('mbh_procedure_route_language as mprl',function($join)use($languageCode){
                     $join->on('rpr.id','mprl.rprId')
                     ->where('mprl.language_code','=',$languageCode);
                     })
                     ->whereIn($where[0],$where[1])
                     ->get();
        }
        $name_ay=DB::table($this->table)->select('name')->where('code',$languageCode)->first();
        foreach ($obj_list as $key => $value) {
            $value->name=$name_ay->name;
        }
        $headerName=[
                    ['工艺路线ID','语言编码','语言','工艺路线编码','名称','name']
                ];
        foreach ($obj_list as $key => $value) {
            $headerName[]=[
                $value->rprId,$input['languageCode'],$value->name,$value->rprCode,$value->rprName,$value->languageName
            ];
        }  
        $fileName='工艺路线多语言导出模版'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit();  

    }

    //导入能力与语言关联
    public function importProcedureRouteExcel($data){
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            if(empty($value['name'])) continue;
            $list=DB::table('mbh_procedure_route_language')->where('rprId',$value['rprId'])->where('language_code',$value['languageCode'])->get();
            if(empty($list[0])){
                $insertData=[
                    'rprId'=>$value['rprId'],
                    'language_code'=>$value['languageCode'],
                    'name'=>$value['name'],
                ];
                $insNum=DB::table('mbh_procedure_route_language')->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value['name'],
                ];
                $updNum=DB::table('mbh_procedure_route_language')->where('rprId',$value['rprId'])->where('language_code',$value['languageCode'])->update($updateData);
            }
        }

    }

    //导出做法字段
    public function exportPractice($input){
        $languageCode=$input['languageCode'];
        $data=[
            'rpf.id as rpfId',    //做法字段ID
            'rpf.code as rpfCode',  //做法字段CODE
            'rpf.name as rpfName',  //做法字段中文名称
            'rpf.description as rpfDescription',  //做法字段中文描述
            'mpfl.name as mpflName',   //做法字段多语言名称
            'mpfl.description as mpflDescription'  //做法字段多语言描述
        ];
            $obj_list=DB::table('ruis_practice_field as rpf')->select($data)
                 ->leftJoin('mbh_practice_field_language as mpfl',function($join)use($languageCode){
                     $join->on('rpf.id','mpfl.practice_field_id')
                     ->where('mpfl.language_code','=',$languageCode);
                 })
                 ->get();
        $name_ay=DB::table($this->table)->select('name')->where('code',$languageCode)->first();
        foreach ($obj_list as $key => $value) {
            $value->name=$name_ay->name;
        }
        $headerName=[
                    ['做法字段ID','语言编码','语言','做法字段编码','做法中文名称','name','做法中文描述','description']
                ];
        foreach ($obj_list as $key => $value) {
            $headerName[]=[
                $value->rpfId,$input['languageCode'],$value->name,$value->rpfCode,$value->rpfName,$value->mpflName,$value->rpfDescription,
                $value->mpflDescription
            ];
        }  
        $fileName='做法字段多语言导出模版'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
         header('Content-Type: application/vnd.ms-excel');
         header('Cache-Control:max-age=0');
        //清除缓存
        ob_end_clean();
        //调用Excel组件进行导出
        Excel::create($fileName,function($excel) use ($headerName){
            $excel->sheet('first',function($sheet) use ($headerName){
                $sheet->rows($headerName);
                //冻结第一行
                $sheet->freezeFirstRow();
            });
        })->export('xlsx');
        exit();  
    }

    //导入做法字段模版
    public function importPractice($data){
        $insertData=[];
        $updateData=[];
        foreach ($data as $key => $value) {
            $list=DB::table('mbh_practice_field_language')->where('practice_field_id',$value['rpfId'])->where('language_code',$value['languageCode'])->get();
            if(empty($list[0])){
                $insertData=[
                    'practice_field_id'=>$value['rpfId'],
                    'code'=>$value['rpfCode'],
                    'language_code'=>$value['languageCode'],
                    'name'=>$value['name'],
                    'description'=>$value['description']
                ];
                $insNum=DB::table('mbh_practice_field_language')->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value['name'],
                    'description'=>$value['description']
                ];
                $updNum=DB::table('mbh_practice_field_language')->where('practice_field_id',$value['rpfId'])->where('language_code',$value['languageCode'])->update($updateData);
            }
        }
    }

    //获取做法字段列表
    public function getPracticeList($input){
        $languageCode=$input['languageCode'];
        $data=[
            'rpf.id as rpfId',
            'rpf.code as rpfCode',
            'rpf.name as rpfName',
            'rpf.description as rpfDescription',
            'mpfl.language_code as languageCode',
            'mpfl.name as lanName',
            'mpfl.description as lanDescription'
        ];
        $list=DB::table('ruis_practice_field as rpf')->select($data)
                 ->leftJoin('mbh_practice_field_language as mpfl',function($join)use($languageCode){
                     $join->on('rpf.id','mpfl.practice_field_id')
                     ->where('mpfl.language_code','=',$languageCode);
                 })
                 ->offset(($input['page_no']-1)*$input['page_size'])
                 ->limit($input['page_size']);
        $obj_list=$list->get();
        $obj_list->total_records=DB::table('ruis_practice_field as rpf')->select($data)
        ->leftJoin('mbh_practice_field_language as mpfl',function($join)use($languageCode){
            $join->on('rpf.id','mpfl.practice_field_id')
            ->where('mpfl.language_code','=',$languageCode);
        })
        ->count();
        return $obj_list;
    }

    //做法字段与多语言关联
    public function practiceLanguage($input){
        $insertData=[];
        $updateData=[];
        foreach ($input as $key => $value) {
            $list=DB::table('mbh_practice_field_language')->where('practice_field_id',$value->rpfId)->where('language_code',$value->languageCode)->get();
            if(empty($list[0])){
                $insertData=[
                    'practice_field_id'=>$value->rpfId,
                    'code'=>$value->rpfCode,
                    'language_code'=>$value->languageCode,
                    'name'=>$value->name,
                    'description'=>$value->description
                ];
                $insNum=DB::table('mbh_practice_field_language')->insertGetId($insertData);
                if(empty($insNum)) TEA('804');
            }else{
                $updateData=[
                    'name'=>$value->name,
                    'description'=>$value->description
                ];
                $updNum=DB::table('mbh_practice_field_language')->where('practice_field_id',$value->rpfId)->where('language_code',$value->languageCode)->update($updateData);
            } 
        }
    }

    //获取所有多语言工艺文件
    public function getLanProductBomList(&$input){
        $languageCode=$input['languageCode'];
        //1.创建公共builder
             //1.1where条件预搜集
             $where=[['rb.version',1]];
             if(!empty($input['code']))
             {
                 $codeArr = explode(' ',$input['code']);
             }
             //!empty($input['code']) &&  $where[]=['rb.code','like',$input['code'].'%']; //物料清单编码
             !empty($input['name']) &&  $where[]=['rb.name','like','%'.$input['name'].'%'];  //物料清单名称
             isset($input['status']) && is_numeric($input['status']) &&  $where[]=['rb.status',$input['status']];  //冻结或者激活
             isset($input['is_version_on']) &&  is_numeric($input['is_version_on']) &&  $where[]=['rb.is_version_on',$input['is_version_on']];  //生效版本
             !empty($input['item_material_path']) &&  $where[]=['rb.item_material_path','like','%'.$input['item_material_path'].'%'];  //Bom物料项
             !empty($input['replace_material_path']) &&  $where[]=['rb.replace_material_path','like','%'.$input['replace_material_path'].'%'];  //Bom替代物料项
             !empty($input['creator_name']) && $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];//创建人
             !empty($input['bom_group_id']) &&  $where[]=['rbg.id',$input['bom_group_id']];  //组号
             !empty($input['is_lzp']) && $where[] = ['rm.lzp_identity_card','=',''];
                 //1.2 预生成builder,注意仅仅在get中需要的连表请放在builder_get中
             $builder = DB::table('ruis_bom'.' as rb')
                 ->leftJoin('ruis_rbac_admin'.' as u', 'u.id', '=', 'rb.creator_id')
                 ->leftJoin('ruis_material'.' as rm','rm.id','=','rb.material_id')
                 /* ->leftJoin('mbh_mara_language as mml',function($join)use($languageCode){
                    $join->on('mml.MATNR','rb.code')
                    ->where('mml.LANGU','=',$languageCode);
                }) */
                 ->leftJoin('ruis_uom_unit'.' as uu','uu.id','rb.bom_unit_id')
                 ->leftJoin('ruis_material_category'.' as rmc','rm.material_category_id','rmc.id')
                 ->leftJoin('ruis_material_category'.' as brmc','rm.sap_big_material_type_id','brmc.id')
                 ->leftJoin('ruis_bom_group'.' as rbg', 'rbg.id', '=', 'rb.bom_group_id');
             if (!empty($input['child_code'])) {
                 $builder->leftJoin('ruis_bom_item'.' as rbi','rbi.bom_material_id','=','rb.material_id');
                 $where[] = ['rm.item_no', '=', $input['child_code']];
             }
             //添加基础款搜索
             if (!empty($input['is_base'])) {
                 $where[] = ['rb.is_base', '=', $input['is_base']];
             }
                 //1.3 where条件拼接
             if (!empty($where)) $builder->where($where);
             //添加工时的搜索
             if(!empty($input['operation_id']) && isset($input['has_workhour'])){
                 $opertion_id = $input['operation_id'];
                 $builder->whereExists(function($query)use($opertion_id){
                     $query->select('rrb.material_id')->from('ruis_bom_routing_base'.' as rbrb')
                         ->leftJoin('ruis_bom'.' as rrb','rrb.id','rbrb.bom_id')
                         ->whereRaw('rrb.is_version_on = 1 and rb.material_id=rrb.material_id and rbrb.operation_id='.$opertion_id);
                 });
                 if($input['has_workhour'] == 1){
                     $builder->whereExists(function($query)use($opertion_id){
                         $query->select('rrb.material_id')->from('ruis_ie_material_workhours'.' as rimw')
                             ->leftJoin('ruis_bom'.' as rrb','rimw.bom_id','rrb.id')
                             ->whereRaw('rrb.is_version_on=1 and rb.material_id=rrb.material_id and rimw.operation_id='.$opertion_id);
                     });
                 }else if($input['has_workhour'] == '0'){
                     $builder->whereNotExists(function($query)use($opertion_id){
                         $query->select('rrb.material_id')->from('ruis_ie_material_workhours'.' as rimw')
                             ->leftJoin('ruis_bom'.' as rrb','rimw.bom_id','rrb.id')
                             ->whereRaw('rrb.is_version_on=1 and rb.material_id=rrb.material_id and rimw.operation_id='.$opertion_id);
                     });
                 }
             }
             if(!empty($codeArr))
             {
                 $builder->whereIn('rb.code',$codeArr);
             }
             //2.总共有多少条记录
             $input['total_records'] = $builder->count();
             //$obj_list->total_records = $builder->count();
             //3.select查询
             $builder_get=$builder;
                  //3.1 拼接不同于公共builder的条件
             $builder_get->select('rb.is_base','rb.id as bom_id', 'rb.creator_id','rb.bom_group_id','rb.name as bom_name','rb.code','rb.qty','rb.version','rb.ctime','rb.status','rb.is_version_on', 'rb.description','rb.bom_no',
                 'u.name as creator_name','brmc.name as big_material_type_name','rb.material_id',
                 'rbg.name as bom_group_name','rb.material_id','rb.from','rmc.name as material_type_name','uu.commercial')
                 ->addSelect(DB::raw("ifnull((select version from ruis_bom rrb where rrb.material_id = rb.material_id and rrb.bom_no = rb.bom_no and status = 1 and is_version_on = 1),'') as release_version"))
                 ->addSelect(DB::raw("ifnull((select id from ruis_bom rrb where rrb.material_id = rb.material_id and rrb.bom_no = rb.bom_no and status = 1 and is_version_on = 1),'') as release_version_bom_id"))
                 ->offset(($input['page_no']-1)*$input['page_size'])->limit($input['page_size']);
                  //3.2 order拼接
     //        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('rb.' . $input['sort'], $input['order']);
             $builder_get->orderBy('rb.ctime','desc');
             $builder_get->orderBy('rb.is_ecm','desc');
                  //3.3 get获取接口
             $obj_list = $builder_get->get();
            // $obj_list->total_records = $builder_get->count();
             //4.遍历处理一下数据
             foreach($obj_list as $key=>&$value){
                 //创建时间
                 $value->ctime=!empty($value->ctime)?date('Y-m-d H:i:s',$value->ctime):'';
             }
             foreach ($obj_list as $k => &$v) {
                 $ZMA001=DB::table('mbh_mara_language')->select('ZMA001')->where('MATNR',$v->code)->first();
                 if(empty($ZMA001)){
                    $v->ZMA001=''; 
                 }else{
                     $v->ZMA001=$ZMA001->ZMA001;
                 }
                 $routingId=DB::table('ruis_bom_routing')->select('routing_id')->where('bom_id',$v->release_version_bom_id)->first();
                 if(empty($routingId)){
                    $v->routing_id=''; 
                 }else{
                     $v->routing_id=$routingId->routing_id;
                 }
             }
             return $obj_list;
    }

    public function get($id,$need_find_level)
    {
        //先从缓存中取
//        $cache_key = make_redis_key(['bom_detail',$id]);
//        $obj = Cache::get($cache_key);
//        if(!empty($obj)) return unserialize($obj);

        $fields= ['rb.id as bom_id','rb.code','rb.name','rb.version','rb.version_description','rb.material_id','mml.ZMA001',

            'rb.bom_group_id','rb.qty','rb.loss_rate','rb.description','rb.status','rb.is_version_on','rb.creator_id','rb.ctime','rb.mtime','rb.operation_id','rb.operation_ability as operation_capacity','rb.label','rb.company_id','rb.factory_id',

            'rb.was_release','rb.bom_no','rb.bom_sap_desc','rb.DATUV','rb.BMEIN','rb.STLAN','rb.is_ecm','rb.AENNR','rb.from','rb.bom_unit_id','rio.name as operation_name',

            'u.name as creator_name','rb.name as bom_group_name','rm.item_no','ruu.commercial','rm.material_category_id','rmc.name as material_category_name'
        ];
        //这些人什么信息都想要，结果就是疯狂的联表查询，速度回慢的一比
        $obj = DB::table(config('alias.rb').' as rb')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
            ->leftJoin('mbh_mara_language as mml','mml.MATNR','rm.item_no')
            ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
            ->leftJoin(config('alias.rio').' as rio','rio.id','rb.operation_id')
            ->leftJoin(config('alias.u').' as u','u.id','rb.creator_id','u.id')
            ->leftJoin(config('alias.rbg').' as rbg','rbg.id','rb.bom_group_id')
            ->leftJoin(config('alias.ruu').' as ruu','ruu.id','rb.bom_unit_id')
            ->select($fields)
            ->where('rb.id',$id)->first();
        //获取基础件
        $obj->is_base = DB::table(config('alias.rb'))->where(['material_id'=>$obj->material_id,'version'=>1,'bom_no'=>$obj->bom_no])->value('is_base');
        if (!$obj) TEA('404');
        //获得bom树
        $obj->bom_tree=$this->getBomTree($obj->material_id,$obj->version,false,false,$need_find_level,$obj->bom_no);
//        $obj->bom_tree=$this->getNewBomTree($obj->material_id,$obj->version,true,true,false,$obj->bom_no);
        return $obj;
    }

    public function getBomTree($bom_material_id,$version=1,$replace=true,$bom_item_qty_level=true,$need_find_level = true,$bom_no = '01')
    {
        //第一步 获取Bom母件信息
        $trees=$this->getMaterialMotherDetail($bom_material_id,$version,$bom_no);
        if(empty($trees)) TEA('404','bom_material_id');
        //第二步  获取母件儿子们的信息,注意 只有它的儿子们的bom_id值才是$bom_id额
        //因为都是SAP过来的bom，也就不需要替换物料，本来只是留个参数给人设置，但是发现调用此方法的太多，而且都写成true，所以这边默认直接改为false
        $trees->children=$this->getParentItemSons($trees->bom_id,$replace,$bom_item_qty_level,$need_find_level);
        return $trees;
    }

    /**
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
     public function getMaterialMotherDetail($bom_material_id,$version=1,$bom_no = '01')
     {
         $bom=DB::table('ruis_bom'.' as rb')
             ->where('rb.material_id',$bom_material_id)
             ->where('rb.version',$version)
             ->where('rb.bom_no',$bom_no)
             ->leftJoin(config('alias.rm').' as rm','rb.material_id','=','rm.id')
             ->leftJoin('mbh_mara_language as mml','mml.MATNR','rm.item_no')
             ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
             ->leftJoin(config('alias.uu').' as uu', 'rb.bom_unit_id', '=', 'uu.id')
             ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','=','rmc.id')
             ->select(
                 'rb.id as bom_id','rb.operation_id','rb.operation_ability','rb.qty as usage_number','rb.material_id','rb.loss_rate',
                 'rm.name','rm.item_no','uu.id as unit_id','rm.material_category_id',
                 'rio.name as operation_name',
                 'uu.label as unit','uu.commercial',
                 'rmc.name as material_category_name','mml.ZMA001'
             )
             ->first();
         //处理一下能力
         $bom->operation_ability_pluck='';
         if(!empty($bom->operation_ability)){
             $operation_ability=explode(',',$bom->operation_ability);
             //获取能力名称
             $operation_pluck= DB::table(config('alias.rioa'))->whereIn('id',$operation_ability)
                 ->pluck('ability_name','id');
             $bom->operation_ability_pluck=obj2array($operation_pluck);
         }
         return $bom;
     }

    /**
     * 获取母件的儿子
     * @param $material_id
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
     public function getParentItemSons($bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials = [])
     {
         //获取每个父节点的儿子们(不含伪儿子-儿子们的替身)
         $where=[['rbi.parent_id','=',0],['rbi.bom_id','=',$bom_id]];
         $obj_list=$this->getBomItemList($where);
         //递归遍历亲儿子们
         $materialDao = new Material();
         foreach($obj_list as $key=>&$value){
             //看看儿子们是否有bom结构
             $value->has_bom=$this->isExisted([['material_id','=',$value->material_id],['is_version_on','=','1'],['status','=',1]],config('alias.rb'));
             //儿子们的阶梯配置信息
             if($bom_item_qty_level)  $value->bom_item_qty_levels=$this->getBomItemQtyLevel($value->bom_item_id);
             //儿子们的替身-注意替身可能也有儿子以及阶梯配置额,另外儿子的替身不可能有替身的,但是儿子的替身的子孙可能有替身额
             if($replace){
                 $replaces = $this->getReplaceItems($value->bom_item_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                 if(!empty($replaces)) $value->replaces=$replaces;
             }
             //给儿子们找儿子(递归下去就是一条家谱树)
             $value->children=[];
             if($value->has_bom){
                 if($value->is_assembly == 1){
                     $value->versions=DB::table('ruis_bom'.' as rb')
                         ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                         ->pluck('version');
                     $bom=$this->getBomOperation($value->material_id,$value->version,$value->bom_no);
                     //注意半成品后来添加Bom结构的一个问题
 //                    if(!empty($bom) && !in_array($value->material_id,$father_materials)) //此处判断是用来判定是否为互为父子或者子项互为父子，但是因为重复料的话就不能判断了
                     if(!empty($bom)) {
 //                        $father_materials[] = $value->material_id;
                         //是否有工艺路线
                         $value->has_route = $this->isExisted([['bom_id','=',$bom->bom_id]],config('alias.rbr'));
                         //子项bom自身的bom id
                         $value->self_bom_id = $bom->bom_id;
                         $value->operation_id=!empty($bom->operation_id)?$bom->operation_id:0;
                         $value->operation_name=!empty($bom->operation_name)?$bom->operation_name:'';
                         $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                         $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                         if($need_find_level){
                             $value->children=$this->getParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                         }
                     }
                 }else{
                     $value->bom_nos = $this->getMaterialBomNos($value->material_id);
                 }
             }else{
                 //如果是原料药取出物料的附件
                 $value->attachment = $materialDao->getMaterialAttachments($value->material_id);
             }
         }
         return $obj_list;
     }

     /**
     * 根据条件获取物料子项信息
     * @param $where
     * @return mixed
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getBomItemList($where)
    {
        if(!is_array($where) || empty($where)) return [];

        $obj_list=DB::table(config('alias.rbi').' as rbi')
            ->select(
                'rm.id as material_id','rm.name','rm.item_no','rm.material_category_id','mml.ZMA001',
                'rbi.id as bom_item_id','rbi.bom_id','rbi.loss_rate','rbi.is_assembly','rbi.usage_number','rbi.total_consume','rbi.parent_id','rbi.comment','rbi.version','rbi.bom_material_id',
                'uu.commercial','uu.id as bom_unit_id',
                'rmc.name as material_category_name','rbi.bom_no',
                'rbi.bom_no','rbi.AENNR','rbi.DATUV','rbi.DATUB','rbi.POSNR','rbi.POSTP','rbi.MEINS','rbi.SORTF'
            )
            ->where($where)
            ->leftJoin(config('alias.rm').' as rm','rbi.material_id','=','rm.id')
            ->leftJoin('mbh_mara_language as mml','mml.MATNR','rm.item_no')
            ->leftJoin(config('alias.uu').' as uu', 'rbi.bom_unit_id', '=', 'uu.id')
            ->leftJoin(config('alias.rmc').' as rmc', 'rm.material_category_id', '=', 'rmc.id')
            ->get();
        return $obj_list;
    }

    /**
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
     public function getBomOperation($bom_material_id,$version=1,$bom_no = '')
     {
         $bom=DB::table('ruis_bom'.' as rb')
             ->where('material_id',$bom_material_id)
             ->where('version',$version)
             ->where('bom_no',$bom_no)
             ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
             ->select('rb.id as bom_id','rb.operation_id','rio.name as operation_name','rb.operation_ability')
             ->first();
         if(!empty($bom->operation_ability)){
             $operation_ability=explode(',',$bom->operation_ability);
             //获取能力名称
             $operation_pluck= DB::table(config('alias.rioa'))->whereIn('id',$operation_ability)
                 ->pluck('ability_name','id');
             $bom->operation_ability_pluck=obj2array($operation_pluck);
         }
 
         return $bom;
     }

     public function pageIndexlist(&$input)
     {
         $where1[] = ['rwo.is_delete', '=', 0];//订单状态未删除
         $where1[] = ['rwo.factory_id', '=', '14']; //
         $where=[];
         if(!empty($input['operation_id'])) $where[] = ['rwo.operation_id','=',$input['operation_id']]; // 工序
         if(!empty($input['sell_order_no'])) $where[] = ['rpo.sales_order_code','=',$input['sell_order_no']]; // 销售订单
         if(!empty($input['sell_order_row_no'])) $where[] = ['rpo.sales_order_project_code','=',$input['sell_order_row_no']]; // 销售订单行项
         if(!empty($input['po_no'])) $where[] = ['rpo.number','=',$input['po_no']]; // 生产订单
         if(!empty($input['wo_no'])) $where[] = ['rwo.number','=',$input['wo_no']]; // 工单
         if(isset($input['plan_status']) && $input['plan_status'] !== '') $where[] = ['rwo.status','=',$input['plan_status']]; // 排产状态
         if (!empty($input['rankplan'])) $where[] = ['rrp.id', '=', $input['rankplan']]; // 班次
         if (isset($input['material_code'])) $where[] = ['rm.item_no', '=', $input['material_code']]; //物料
         if (isset($input['factory_id'])) $where[] = ['rwo.factory_id', '=', $input['factory_id']]; // 工厂搜索

         //拉出bom版本
         $where2[]=['rb2.is_version_on','=',1];
         $where2[]=['rb2.bom_no','=','01'];

         $field = [
             'rpo.number as po_no',//po单号/生产单号
             'rpo.sales_order_code',//销售订单号
             'rpo.sales_order_project_code',//销售订单行项号
             'rwo.number as wo_no',//工单号
             'rwo.id as work_order_id',//工单id
             'mml.MATNR as material_code',//产成品编码
             'mml.ZMA001 as material_name',//产成品
             'rwo.qty',//数量
             'rws.name as work_shop_name',//车间
             'rwc.name as work_center_name',//工作中心
             'rwb.name as work_bench_name',//工位
             'rf.name as factory_name',//工厂
             'rwo.plan_start_time',//计划日期
             'rpo.on_off',//po订单状态
             'rwo.status as plan_status',//排产状态
             'rb.version as old_version',
             'rb2.version as new_version',
             'rb2.version_description as new_version_description',
             'rwo.operation_id', // 工序id
             'rwo.bom_id', // 顶级bom的id
             'rwo.routing_id', // 工艺路线id
         ];
         $builder = DB::table(config('alias.rwo').' as rwo')
             ->leftJoin(config('alias.rpo').' as rpo','rpo.id','rwo.production_order_id')
             ->leftJoin(config('alias.rm').' as rm','rm.id','rpo.product_id')
             ->leftJoin('mbh_mara_language as mml','mml.MATNR','rm.item_no')
             ->leftJoin(config('alias.rws').' as rws','rws.id','rwo.work_shop_id')
             ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwo.work_center_id')
             ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwo.work_shift_id')
             ->leftJoin(config('alias.rf').' as rf','rf.id','rwo.factory_id')
             ->leftJoin(config('alias.rrp') . ' as rrp', 'rwo.rank_plan_id', '=', 'rrp.id')
             ->leftJoin(config('alias.rb').' as rb','rb.id','rwo.bom_id')
             ->leftJoin(config('alias.rb').' as rb2','rb2.material_id','=','rpo.product_id');
         $builder=$builder->where($where)->where($where1)->where($where2);
         if(!empty($where)){
             $input['total_records'] = $builder->count();
         }else{
             $input['total_records'] = DB::table(config('alias.rwo').' as rwo')->where($where1)->count();
         }
         $builder->select($field)->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
         if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rwo.'.$input['sort'],$input['order']);
         $obj = $builder->get();
         foreach ($obj as $k=>&$v){
             $v->plan_start_time = !empty($v->plan_start_time) ? date('Y-m-d:H:i:s',$v->plan_start_time) : '';

             //判断是否bom版本变更，给前端标识
             if($v->old_version != $v->new_version){
                 $v->version_change = 1;
             }else{
                 $v->version_change = 0;
             }
         }
         return $obj;
     }

     public function salesorderProcess($input)
     {
         if(empty($input['sales_order_code'])) TEPA('销售订单为空');
         $where = array();
         //拉出bom版本
         $where[]=['rb2.is_version_on','=',1];
         $where[]=['rb2.bom_no','=','01'];

//        $input['sales_order_code'] = 6600000354;
//        $input['sales_order_project_code'] = 10;
//        $input['operation_id'] = 8;
         if(isset($input['wo_number'])) $where[]=['a1.number',$input['wo_number']]; // 工单
         if(isset($input['sales_order_code'])) $where[]=['a3.sales_order_code','=',$input['sales_order_code']]; // 销售订单
         if(isset($input['sales_order_project_code'])) $where[]=['a3.sales_order_project_code','=',$input['sales_order_project_code']]; // 销售订单行项
         if(isset($input['operation_id'])) $where[]=['a1.operation_id','=',$input['operation_id']];// 工序
         if(isset($input['languageCode'])) $where[]=['mol.language_code','=',$input['languageCode']];// 工序
         $where[]=['a3.on_off','=',1];
         $where[]=['a3.is_delete','=',0];
         $where[]=['a1.on_off','=',1];
         $where[]=['a1.is_delete','=',0];
         $field = [
             'a1.id as work_order_id',
             'a1.number as wo_number',
             'a1.production_order_id',
             'a2.routing_operation_order',
             'a1.operation_id as operation_id',
             'a2.number as wt_number',
             'a2.group_index as group_index',
             'a2.routing_node_id as routing_node_id',
             'a2.belong_bom_id as belong_bom_id',
             'a2.NEXT_LIFNR',
             'a3.number as po_number',
             'a3.sales_order_code as sales_order_code',
             'a3.sales_order_project_code as sales_order_project_code',
             'mml.MATNR as item_no',
             'mml.ZMA001 as material_name',
             'mml.id as  material_id',
             'a1.work_station_time',
             'a1.group_step_withnames',
             'a1.qty',
             'a6.name as workshop_name',
             'a6.id   as workshop_id',
             'a7.name as workcenter_name',
             'a7.id as workcenter_id',
             'a1.routing_node_id',
             'a2.belong_bom_id as old_bom_id',
             'rb2.id as new_bom_id',
             'rb2.version as new_version',// 最新版本
             'rb2.mtime as currentversion_ctime', // 最新版本修改时间
             'rb.version as old_version', // 当前版本
             'mol.name as operation_name', // 工序名称
             'a1.routing_id', //
             'a1.bom_id',
         ];
         $builder = DB::table('ruis_work_order'.' as a1')->select($field)
             ->leftJoin('mbh_operation_language as mol','mol.operation_id','=','a1.operation_id')
             ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
             ->leftJoin(config('alias.rpo').' as a3','a3.id','=','a1.production_order_id')
             ->leftJoin(config('alias.rm').' as a4','a4.id','=','a3.product_id')
             ->leftJoin('mbh_mara_language as mml','mml.MATNR','a4.item_no')
             ->leftJoin(config('alias.rwc').' as a7','a7.id','=','a1.work_center_id')
             ->leftJoin(config('alias.rws').' as a6','a6.id','=','a7.workshop_id')
             ->leftJoin(config('alias.rb').' as rb2','rb2.material_id','=','a3.product_id')
             ->leftJoin(config('alias.rb').' as rb','rb.id','a1.bom_id')
             ->where($where);
         $obj = $builder->get()->groupBy('po_number');
         if (empty(obj2array($obj))) TEPA('找不到该销售订单信息！');
         // 定义空数组 存 bom数据
         $bom_routing = [];
         foreach ($obj as $item){
             foreach ($item as $item_key=>$item_val){
                 // 增加当前版本修改时间
                 $item_val->currentversion_ctime = date('Y-m-d H:i:s',$item_val->currentversion_ctime);
                 // 显示当前工单
                 if (isset($input['work_number']) && $item_val->wo_number == $input['work_number'])
                 {
                     $item_val->is_show = 1;
                 }
                 else {
                     $item_val->is_show = 0;
                 }
                 // 获取工单进出料
                 $all_material = DB::table(config('alias.rwoi'))->where('work_order_id',$item_val->work_order_id)->pluck('material_code')->toArray();
                 // 获取物料单位
                 $all_materialres = DB::table(config('alias.rwoi'))
                     ->where([
                         ['work_order_id','=',$item_val->work_order_id],
                         ['type','=','1'],
                     ])->pluck('bom_commercial','material_code')->toArray();
                 $item_val->bom_commercial = isset($all_materialres[$item_val->item_no]) ? $all_materialres[$item_val->item_no]: '';

                 // 获取工单数量
                 $all_materialarr = DB::table(config('alias.rwoi'))
                     ->where([
                         ['work_order_id','=',$item_val->work_order_id],
                     ])->pluck('qty','material_code')->toArray();
                 $SpecialCraftList = [];
                 $rbrb_id = [];
                 // 获取相同的工艺
                 if(isset($bom_routing[$item_val->bom_id.'-'.$item_val->routing_id.'-'.$item_val->operation_name])){
                     $item_val->SpecialCraftList[] = $bom_routing[$item_val->bom_id.'-'.$item_val->routing_id.'-'.$item_val->operation_name];
                     $SpecialCraftList[] = $bom_routing[$item_val->bom_id.'-'.$item_val->routing_id.'-'.$item_val->operation_name];
                     foreach ($SpecialCraftList as $list_item){
                         foreach ($list_item as $list_key=>$list_val){
                             if($item_val->operation_name == $list_val->operationLanName && !isset($item_val->practice)){
                                 $item_val->practice = !isset($item_val->practice) ? $list_val->practice :$item_val->practice;
                                 $list_val->useNum = isset($all_materialarr[$list_val->item_no]) ? $all_materialarr[$list_val->item_no] :$list_val->useNum ;
                                 if(!in_array($list_val->rbrbId,$rbrb_id)){
                                     $rbrb_id[] =  $list_val->rbrbId;
                                 }
                             }else{
                                 $list_val->useNum = isset($all_materialarr[$list_val->item_no]) ? $all_materialarr[$list_val->item_no] :$list_val->useNum ;
                                 if(!in_array($list_val->rbrbId,$rbrb_id)){
                                     $rbrb_id[] =  $list_val->rbrbId;
                                 }
                             }
                         }
                     }
                 }else{
                     $SpecialCraftList = $this->getSpecialCraftList(['bom_id'=>$item_val->bom_id,'routing_id'=>$item_val->routing_id,'languageCode'=>$input['languageCode']]);
                     foreach ($SpecialCraftList as $list_item){
                         foreach ($list_item as $list_key=>$list_val){
                             if($item_val->operation_name == $list_val->operationLanName){
                                 $bom_routing[$item_val->bom_id.'-'.$item_val->routing_id.'-'.$item_val->operation_name][] = $list_val;
                                 $item_val->practice = !isset($item_val->practice) ? $list_val->practice :$item_val->practice;
                                 $list_val->useNum = isset($all_materialarr[$list_val->item_no]) ? $all_materialarr[$list_val->item_no] :$list_val->useNum ;
                                 if(!in_array($list_val->rbrbId,$rbrb_id)){
                                     $rbrb_id[] =  $list_val->rbrbId;
                                 }
                             }else{
                                 $bom_routing[$item_val->bom_id.'-'.$item_val->routing_id.'-'.$list_val->operationLanName][] = $list_val;
                             }
                         }
                     }
                     $item_val->SpecialCraftList[] = $bom_routing[$item_val->bom_id.'-'.$item_val->routing_id.'-'.$item_val->operation_name];
                 }
                 $step_drawings = [];
                 if($rbrb_id) {
                     // 多语言图纸
                     $step_drawingsxn = DB::table('mbh_drawing_language as mdl')
                         ->select([
                             'rd.id as imageId',  //图片ID
                             'rd.name',   //图片名称
                             'rd.image_path',  //图片路径
                             'rd.width',       //图片宽度
                             'rd.height'       //图片高度
                         ])
                         ->leftJoin('ruis_drawing as rd','rd.id','mdl.drawing_id')
                         ->whereIn('mdl.rbrd_id',$rbrb_id)
                         ->where('mdl.language_code',$input['languageCode'])
                         ->get()->toArray();
                     // 中文图纸
                     $step_drawingszn = DB::table('ruis_bom_routing_base as rbrb')
                         ->select([
                             'rbrb.id as rbrdId',
                             'rd.id as imageId',  //图片ID
                             'rd.name',   //图片名称
                             'rd.image_path',  //图片路径
                             'rd.width',       //图片宽度
                             'rd.height'       //图片高度
                         ])
                         ->leftJoin('ruis_bom_routing_drawing as rbrd','rbrb.id','rbrd.bom_routing_base_id')
                         ->leftJoin('ruis_drawing as rd','rbrd.drawing_id','rd.id')
                         ->whereIn('rbrb.id',$rbrb_id)
                         ->get()->toArray();
                     $step_drawings = obj2array($step_drawingsxn);
//                     $step_drawings = array_merge(obj2array($step_drawingszn),obj2array($step_drawingsxn));
                 }

                 //查询洗标文件 附件
                 $drawings = DB::table(config('alias.rdr') . ' as rdr')
                         ->select([
                             'rdr.id as drawing_id',
                             'rdr.ctime',
                             'rdr.code',
                             'rdr.name',
                             'rdr.source',
                             'u.name as creator_name',
                             'rdr.image_orgin_name',
                             'rdr.image_name',
                             'rdr.image_path',
                             'rdr.extension',
                             'rdr.comment',
                             'rdr.comment as description',
                             'rdcl.sale_order_code',
                             'rdcl.line_project_code',
                             'rdcl.version_code as version',
                             'ml.ZMA001 as MAKTX',//修改物料取值字段，改为长文本
                             'rdr.is_care_label',
                             'rdr.is_pushed'
                         ])
                         ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
                         ->leftJoin(config('alias.rdcl') . ' as rdcl', 'rdcl.drawing_id', '=', 'rdr.id')
                         ->leftJoin('mbh_mara_language' . ' as ml', 'ml.MATNR', '=','rdcl.material_code')
                     ->where([
                         ['rdcl.sale_order_code', '=', $input['sales_order_code']],
                         ['rdcl.line_project_code', '=', str_pad($input['sales_order_project_code'], 6, '0',STR_PAD_LEFT)],
                     ])
                     ->whereIn('rdcl.material_code',$all_material)
                     ->orderBy('rdcl.version_code', 'DESC')
                     ->get()->toArray();
                     foreach ($drawings as $draw_key=>$draw_list){
                         $draw_list->ctime = $draw_list->ctime ? date('Y-m-d H:i:s',$draw_list->ctime):'';
                     }
                 // 附件
                 $item_val->material_drawings = obj2array($drawings) ? obj2array($drawings): [] ;
                 // 图片
                 $item_val->material_step_drawings =  obj2array($step_drawings) ? obj2array($step_drawings)  : [];

                 //判断是否bom版本变更，给前端标识
                 if($item_val->old_bom_id != $item_val->new_bom_id){
                     $item_val->version_change = 1;
                 }else{
                     $item_val->version_change = 0;
                 }
             }
         }
         $objarray = [];
         foreach (obj2array($obj) as $items) {
             foreach ($items as $ke => $va) {
                 $stmt = [];
                 $stmt['operation_name'] = $va['operation_name'];
                 $stmt['wo_arr'][] = $va;
                 $objarray[] = $stmt;
             }
         }

         return $objarray;
     }

}