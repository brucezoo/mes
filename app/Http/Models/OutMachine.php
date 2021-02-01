<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/8/31
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class OutMachine extends  Base
{
    public function __construct()
    {
        $this->table='ruis_sap_out_picking';
        $this->lineTable='ruis_sap_out_picking_line';
        $this->lineItemTable='ruis_sap_out_picking_line_item';
        $this->receiveTable='ruis_receive_order';
        $this->receiveItemTable='ruis_receive_item';
        $this->materialTable='ruis_material';
        if(empty($this->outline)) $this->outline =new OutMachineLine();
    }

   
    /**
     * 同步  委外加工领料单
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function syncOutMachine($input)
    {
    	$ApiControl = new SapApiRecord();
        $ApiControl->store($input);

        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */
        foreach ($input['DATA'] as $key => $value) 
        {   
            //去掉前面的0字符
            $processor  = preg_replace('/^0+/','',$value['LIFNR']);    //加工商编号
            //判断是否已经存在 采购订单号
            $has  =  DB::table('ruis_sap_out_picking')->select('id')->where('EBELN',$value['EBELN'])->first();
            if ($has) 
            {
               $this->outline->saveLine($value['ITEMS'], $has->id, $processor);
            }
            else
            {
                $keyVal = [
                    'EBELN' => $value['EBELN'],   //采购订单号
                    'BUKRS' => $value['BUKRS'],
                    'BSTYP' => $value['BSTYP'],
                    'BSART' => $value['BSART'],
                    'LIFNR' => $value['LIFNR'],   //加工商编号
                    'EKORG' => $value['EKORG'],
                    'EKGRP' => $value['EKGRP'],
                   ];

                //添加
                $insert_id=DB::table($this->table)->insertGetId($keyVal);
                if(!$insert_id) TESAP('802');
                // 添加行项目
                $this->outline->saveLine($value['ITEMS'],$insert_id,$processor);
            }

        }
          return [];
    }



    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
       //$input['page_no']、$input['page_size   
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8010','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='outMachine.id';
        }
        $where = $this->_search($input);
        $data =[
            'outMachine.*',
            'rpo.end_date as operation_end_time',
            'rsopkl.AUFNR'
        ];

        $builder = DB::table($this->table.' as outMachine')
            ->leftJoin(config('alias.roms') . ' as roms','roms.picking_id','=','outMachine.id')
            ->leftJoin('ruis_out_machine_shop_item as romsi','roms.id','=','romsi.out_machine_shop_id')
            ->leftJoin(config('alias.rsopkl') . ' as rsopkl', 'outMachine.id', '=', 'rsopkl.picking_id')
            /*->leftJoin('ruis_operation_order as roo',function ($join){
                $join->on('rsopkl.BANFN','=','roo.BANFN')
                    ->on('rsopkl.BNFPO','=','roo.BNFPO');
            })
            ->leftJoin('ruis_production_order as rpo', 'roo.production_order_id', '=', 'rpo.id')*/
            ->leftJoin('ruis_production_order as rpo', 'rsopkl.AUFNR', '=', 'rpo.number')
            ->select($data)
            ->distinct('outMachine.id')
            ->where($where)
            ->where('rpo.is_delete',0)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            if(isset($input['actual_send_qty']) && $input['actual_send_qty']==1)
            {
                $builder = $builder->where('roms.type','=','1');
                $builder = $builder->where('roms.status','=','1');
                $builder = $builder->where('romsi.actual_send_qty','>','0');
            }
            if (isset($input['begintime']) && $input['begintime'])
            {
                $builder->where('rpo.end_date','>=',(string)strtotime($input['begintime']));
                $builder->where('rpo.end_date','<=',(string)strtotime($input['endtime']));
            }
            if (isset($input['declare_push_type']) && is_numeric($input['declare_push_type'])) {//推送状态
                if($input['declare_push_type'] == 1)
                {
                    $builder->whereIn('outMachine.declare_push_type',[0,1]);
                }
                else
                {
                    $builder->where('outMachine.declare_push_type','=',2);
                }

            }
            if (isset($input['VBELN']) && $input['VBELN']) {//销售和分销凭证号
                $VBELN = explode(' ',$input['VBELN']);
                if($VBELN)
                {
                    foreach ($VBELN as &$v)
                    {
                        if (substr($v,0,1) =='4')
                        {
                            $v='0'.$v;
                        }
                        elseif(substr($v,0,2) !='66' && substr($v,0,2) !='67')
                        {
                            $v='00'.$v;
                        }
                    }
                }
                $builder->whereIn('outMachine.VBELN',$VBELN);
            }
            
            $obj_list = $builder->get();
           // $obj_list = $builder->tosql();
            foreach ($obj_list as $obj)
            {
                $obj->operation_end_time = date('Y-m-d H:i:s',$obj->operation_end_time);
                $roms_row = DB::table(config('alias.roms') . ' as roms')
                    ->leftJoin('ruis_out_machine_shop_item as romsi','roms.id','=','romsi.out_machine_shop_id')
                    ->where('roms.picking_id',$obj->id)
                    ->where('roms.type',1)
                    ->where('roms.status',1)
                    ->select('romsi.actual_send_qty','roms.status')
                    ->first();
                if($roms_row && $roms_row->actual_send_qty>0)
                {
                    $obj->lzp_status = 1;//已发料
                }
                else
                {
                    $obj->lzp_status = 2;//未发料
                }
                $group_list = $this->getLinesByOrderForList($obj->id);
                if(json_decode(json_encode($group_list),true)){
                    $obj->VBELP = $group_list ? $group_list[0]->VBELP : 0;
                    $obj->MENGE = $group_list ? $group_list[0]->MENGE : 0;
                } else {
                    $obj->VBELP = 0;
                    $obj->MENGE = 0;

                }
                //picking_line 总数量
                $lineCount = count($group_list);
                //已完成报工初始化
                $declareCount = 0;
                $MATNRList = [];
                $pushCount = 0;

                $declare_qty = 0;//已报工数量
                foreach ($group_list as $key => $val) {
                    //半成品物料编码
                    $MATNRList[] = preg_replace('/^0+/','',$val->MATNR);
                    if($val->has_declare == 1){
                        $declareCount +=1;
                    }
                    if($val->push_for_declare == 1){
                        $pushCount +=1;
                    }
                    $declare_qty+=$val->declare_qty;
                }
                $obj->declare_qty = $declare_qty;//已报工数量

                //获取实际已报工数量
                $yield_qty = DB::table('ruis_work_declare_order')->where('picking_id',$obj->id)->sum('yield_qty');
                if($yield_qty>0) $obj->declare_qty = $yield_qty;

                if($declareCount < $lineCount){
                    $obj->declareType = '未全部报存';
                } else if ($declareCount >= $lineCount && $declareCount>0) {
                    $obj->declareType = '已全部报存';
                } else {
                    $obj->declareType = '未全部报存';
                }

                if($pushCount < $lineCount){
                    $obj->declarePushType = '未全部推送';
                } else if ($pushCount >= $lineCount && $pushCount>0) {
                    $obj->declarePushType = '已全部推送';
                }
                //查询半成品物料编码对应的物料信息
                $obj->material_list = [];
                if($MATNRList){
                    $materialList = DB::table(config('alias.rm'))->select(['name','item_no'])->whereIn('item_no',$MATNRList)->get();
                    $obj->material_list = $materialList;
                }

                $obj->lines = $group_list;
                $LIFNR = preg_replace('/^0+/','',$obj->LIFNR);
                $res = DB::table('ruis_partner_new')->select('name')->where('code',$LIFNR)->first();
                if ($res) 
                {
                    $obj->LIFNR_name = $res->name;
                }
                else
                {
                     $obj->LIFNR_name = '';
                }


            }
            $count_builder = DB::table($this->table.' as outMachine')
                ->leftJoin(config('alias.roms') . ' as roms','roms.picking_id','=','outMachine.id')
                ->leftJoin('ruis_out_machine_shop_item as romsi','roms.id','=','romsi.out_machine_shop_id')
                ->leftJoin(config('alias.rsopkl') . ' as rsopkl', 'outMachine.id', '=', 'rsopkl.picking_id')
                /*->leftJoin('ruis_operation_order as roo',function ($join){
                    $join->on('rsopkl.BANFN','=','roo.BANFN')
                        ->on('rsopkl.BNFPO','=','roo.BNFPO');
                })
                ->leftJoin('ruis_production_order as rpo', 'roo.production_order_id', '=', 'rpo.id')*/
                ->leftJoin('ruis_production_order as rpo', 'rsopkl.AUFNR', '=', 'rpo.number')
                ->select('outMachine.id')
                ->distinct('outMachine.id')
                ->where($where);
            //->orderBy($input['sort'],$input['order']);

            if(isset($input['actual_send_qty']) && $input['actual_send_qty']==1)
            {
                $count_builder = $count_builder->where('roms.type','=','1');
                $count_builder = $count_builder->where('roms.status','=','1');
                $count_builder = $count_builder->where('romsi.actual_send_qty','>','0');
            }
            if (isset($input['begintime']) && $input['begintime'])
            {
                $count_builder = $count_builder->where('rpo.end_date','>=',(string)strtotime($input['begintime']));
                $count_builder = $count_builder->where('rpo.end_date','<=',(string)strtotime($input['endtime']));
            }
            if (isset($input['declare_push_type']) && is_numeric($input['declare_push_type'])) {//推送状态
                if($input['declare_push_type'] == 1)
                {
                    $count_builder->whereIn('outMachine.declare_push_type',[0,1]);
                }
                else
                {
                    $count_builder->where('outMachine.declare_push_type','=',2);
                }

            }
            if (isset($input['VBELN']) && $input['VBELN']) {//销售和分销凭证号
                $VBELN = explode(' ',$input['VBELN']);
                if($VBELN)
                {
                    foreach ($VBELN as &$v)
                    {
                        if (substr($v,0,1) =='4')
                        {
                            $v='0'.$v;
                        }
                        elseif(substr($v,0,2) !='66' && substr($v,0,2) !='67')
                        {
                            $v='00'.$v;
                        }
                    }
                }
                $count_builder->whereIn('outMachine.VBELN',$VBELN);
            }

            $obj_list->total_count = $count_builder->count('outMachine.id');
            return $obj_list;
         
    }

    /**
     * 获取行项目列表
     * @return array  返回数组对象集合
     */
    public function getLinesByOrderForList($id)
    {
        $builder = DB::table($this->lineTable)
            ->select('*')
            ->where('picking_id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
            $declareInfo = DB::table('ruis_work_declare_order')
                ->select('id','status')
                ->where('picking_line_id', $obj->id)
                ->first();
            $group_list = $this->getItemsByLineForList($obj->id,$id);
            $obj->items = $group_list;
            $obj->push_for_declare = 0;
            if($declareInfo){
                if($declareInfo->status == 2) {
                    $obj->push_for_declare = 1;
                }
            }
        }
        return $obj_list;
    }


    /**
     * 获取行项目列表
     * @return array  返回数组对象集合
     */
    public function getLinesByOrder($id)
    {
        $builder = DB::table($this->lineTable)
            ->select('*')
            ->where('picking_id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as &$obj)
        {
            $declareInfo = DB::table('ruis_work_declare_order')
                ->select('BUDAT')
                ->where('picking_line_id', $obj->id)
                ->first();
            $group_list = $this->getItemsByLine($obj->id,$id);
            $obj->items = $group_list;
            $obj->push_time = $declareInfo?date('Y-m-d H:i',$declareInfo->BUDAT):'';
        }
        return $obj_list;
    }


    /**
     * @message 获取行项目明细 给分页列表使用
     * @author  liming
     * @time    年 月 日
     */    
     public  function  getItemsByLineForList($id,$picking_id)
     {
        //获取列表
        $obj_list = DB::table($this->lineItemTable)
            ->select('*')
            ->where('line_id', $id)
            ->orderBy('id', 'asc')
            ->get();
        foreach ($obj_list as $obj) 
        {
            $material_code=preg_replace('/^0+/','',$obj->DMATNR);
            $res = DB::table($this->materialTable.' as material')
                 ->select('material.name','material.item_no','material.id','material.unit_id')
                 ->where('item_no', $material_code)
                 ->first();
            if (!$res) TEA('9525');
            $obj->material_item_no=$res->item_no;
            $obj->material_name=$res->name;
        }    
        return $obj_list;    
     }   





    /**
     * 获取行项目明细 此处获取内容太多不适合给列表使用
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getItemsByLine($id,$picking_id)
    {
        $this->unit =new Units();
        //获取列表
        $obj_list = DB::table($this->lineItemTable)
            ->select('*')
            ->where('line_id', $id)
            ->orderBy('id', 'asc')
            ->get();
        /**
         * 订单组件更改 领料单中还是原来的组件id 做一个兼容
         */
        $zyItems = DB::table('ruis_out_machine_zxxx_order_item as item')
            ->leftJoin('ruis_out_machine_zxxx_order  as zy', 'zy.id', '=', 'item.out_machine_zxxx_order_id')
            ->select('item.id')
            ->where('zy.out_picking_id', $picking_id)
            ->get();
        $zyItemIds = [];
        foreach($zyItems as $key => $val) {
            $zyItemIds[] = $val->id;
        }
        //处理物料信息
        foreach ($obj_list as  &$obj)
        {
           $LGFSB='';
           $material_code=preg_replace('/^0+/','',$obj->DMATNR);
           $res = DB::table($this->materialTable.' as material')
                 ->select('material.name','material.item_no','material.id','material.unit_id','unit.commercial','category.code  as category_code')
                 ->leftJoin('ruis_uom_unit  as unit', 'unit.id', '=', 'material.unit_id')
                 ->leftJoin('ruis_material_category  as category', 'category.id', '=', 'material.material_category_id')
                 ->where('item_no', $material_code)
                 ->first();
            if (!$res) TEA('9525');
            $category_code  =$res->category_code;
            //如果当前物料的分类在限定之列，则过滤掉
            $category_preg_arr = config('app.pattern.material_category_preg');
            $sign = 0;
            foreach ($category_preg_arr as $keee=> $vaaa) 
            {
                if(preg_match($vaaa,$category_code))   
                {
                    $sign  = 1;
                }
            }
            if ($sign == 1) 
            {
                // 如果是特殊料  添加一个 作废标记
                $obj->zuofei = 1;
            }
            else
            {
               $obj->zuofei = 0; 
            }
            //直条特殊处理 如果是这些物料则向sap领料
            $special_material_catergoy_preg = [
                '610100000052',
                '610100000056',
                '610100000058',
                '610100000059',
                '610100000060',
                '610100000061',
                '610100000073'
            ];
            if(in_array($res->item_no,$special_material_catergoy_preg)){
                $obj->zuofei = 0;
            }
           // 查找当前  物料采购存储地点
            if ($res) 
            {
                $where  = [
                  'material_id' =>$res->id,
                  'WERKS' =>$obj->DWERKS,
                ];
                $add_res = DB::table('ruis_material_marc')->where($where)->select('LGFSB','LGPRO')->first();
                if ($add_res)
                {
                  $LGFSB = !empty($add_res->LGFSB)?$add_res->LGFSB:$add_res->LGPRO;
                }

                $send_where=[
                    'type_code'=>'ZY03',
                    'material_id' => $res->id
                ];
                //查找 实发数量
                $actual_send_qty= DB::table('ruis_out_machine_zxxx_order_item')
                ->where($send_where)
                ->whereIn('id',$zyItemIds)
                ->sum('actual_send_qty');

                //查找 委外额定退料zy06 +  超发退料zy04
                $zy03_where=[
                    'type_code'=>'ZY04',
                    'material_id' => $res->id
                ];

                $TuiLiao_qty= DB::table('ruis_out_machine_zxxx_order_item')
                ->where($zy03_where)
                ->whereIn('id',$zyItemIds)
                ->sum('actual_send_qty');

                //查找补料数量 ZB03   zy05
                $zb03_where=[
                    'type_code'=>'ZB03',
                    'material_id' => $res->id
                ];
                $BuLiao_qty= DB::table('ruis_out_machine_zxxx_order_item')
                ->where($zb03_where)
                ->whereIn('id',$zyItemIds)
                ->sum('actual_send_qty');
            }

           if (!$res) 
           {
              $obj->material_item_no=$obj->DMATNR;
              $obj->material_name='';  
              $obj->LGFSB=$LGFSB;  
              $obj->actual_send_qty=0;  
              $obj->TuiLiao_qty=0;  
              $obj->BuLiao_qty=0;
              $obj->needNumber = $obj->DBDMNG;
           }
           else
           {
             $obj->material_item_no=$res->item_no;
             $obj->material_name=$res->name;
             $obj->LGFSB=$LGFSB; 
             $obj->actual_send_qty=$actual_send_qty;  
             $obj->TuiLiao_qty=$TuiLiao_qty;  
             $obj->BuLiao_qty=$BuLiao_qty;
             $obj->needNumber = round($obj->DBDMNG-$actual_send_qty-$BuLiao_qty+$TuiLiao_qty,3);
           }
        }
        return $obj_list;
    }

     /**
     * 查看某条委外领料单信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function show($id)
    {
        $data =[
            'outMachine.*'
        ];
        $builder = DB::table($this->table.' as outMachine')
            ->select($data)
            ->where('outMachine.id',$id)
            ->orderBy('id','asc');
            $obj_list = $builder->get();   

            foreach ($obj_list as $obj)
            {
                $group_list = $this->getLinesByOrder($obj->id);
                $obj->lines = $group_list;
                $LIFNR = preg_replace('/^0+/','',$obj->LIFNR);
                $res = DB::table('ruis_partner_new')->select('name')->where('code',$LIFNR)->first();
                if ($res) 
                {
                    $obj->LIFNR_name = $res->name;
                }
                else
                {
                     $obj->LIFNR_name = '';
                }
            }
            return $obj_list;
    }

    public function moreShow($ids)
    {
        //1.获取采购凭证信息
        $obj_list = DB::table('ruis_sap_out_picking')
            ->select('*')
            ->whereIn('id',$ids)
            ->orderBy('id','desc')
            ->get();
        //2.获取对应物料信息
        $line_obj_list = DB::table('ruis_sap_out_picking_line')->select('*')->whereIn('picking_id', $ids)->get();
        foreach ($line_obj_list as &$obj)
        {
            $group_list = $this->getItemsByLine($obj->id,$obj->picking_id);
            $obj->items = $group_list;
        }
        $line_arr = dataGroup(obj2array($line_obj_list),'picking_id');
        //3.获取供应商信息
        $code_arr = [];
        $LIFNR_ARR = array_column(obj2array($obj_list),'LIFNR');
        foreach ($LIFNR_ARR as $LIFNR)
        {
            $code_arr[] = preg_replace('/^0+/','',$LIFNR);
        }
        $partner_obj = DB::table('ruis_partner_new')
            ->whereIn('code',$code_arr)
            ->pluck('name','code');

        //4.获取push_time
        $declare_arr = DB::table('ruis_work_declare_order')->whereIn('picking_id',$ids)->pluck('BUDAT','picking_id');
        //4.组合数据
        unset($LIFNR);
        foreach ($obj_list as $v)
        {
            $LIFNR = preg_replace('/^0+/','',$v->LIFNR);
            if(!$LIFNR || empty($partner_obj) || !isset($partner_obj[$LIFNR]))
            {
                $v->LIFNR_name = '';
            }
            else
            {
                $v->LIFNR_name = $partner_obj[$LIFNR];
            }

            $v->lines = $line_arr[$v->id];

            if(!isset($declare_arr[$v->id]))
            {
                $v->push_time = '';
            }
            else
            {
                $v->push_time = date('Y-m-d H:i',$declare_arr[$v->id]);
            }
        }
        $temp = array_values(dataGroup(obj2array($obj_list),'id'));
        return $temp;
    }

    /**
     * @message 通过委外工单获取委外订单
     * @author  liming
     * @time    年 月 日
     */    
    public function showOutWork($id)
    {
        $obj_list = DB::table($this->lineTable.' as pick_line')
            ->leftJoin('ruis_sap_out_picking  as picking', 'picking.id', '=', 'pick_line.picking_id')
            ->select('pick_line.BANFN','pick_line.BNFPO')
            ->where('picking.id',$id)
            ->get();

        $return_data = [];
        foreach ($obj_list as $obj)
        {
            $where = [
                'BANFN'=>$obj->BANFN,
                'BNFPO'=>$obj->BNFPO
            ];
            $res = $this->getOrderList($where);
            if (!$res) 
            {
            continue; 
            }
            $return_data[] = $res;
        }
        return $return_data;
    }     


    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getOrderList($where)
    {
        $obj_list = DB::table(config('alias.rsco').' as  outwork')
            ->leftJoin(config('alias.rpo').' as  production', 'production.id', '=', 'outwork.production_order_id')
            ->leftJoin(config('alias.rio').' as  operation', 'operation.id', '=', 'outwork.operation_id')
            ->select('outwork.*','operation.name  as operation_name','production.number  as production_number')
            ->where($where)
            ->first();
            return $obj_list;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['EBELN']) && $input['EBELN']) {//采购凭证编号
            $where[]=['outMachine.EBELN','like','%'.$input['EBELN'].'%'];
        }

        if (isset($input['VBELP']) && $input['VBELP']) {//采购凭证编号
            $where[]=['rsopkl.VBELP','=',$input['VBELP']];
        }

        if (isset($input['AUFNR']) && $input['AUFNR']) {//生产订单号
            $where[]=['rsopkl.AUFNR','=',$input['AUFNR']];
        }
        /*if (isset($input['VBELN']) && $input['VBELN']) {//销售和分销凭证号
            $where[]=['outMachine.VBELN','like','%'.$input['VBELN'].'%'];
        }*/

        /*if (isset($input['VBELN']) && $input['VBELN']) {//销售和分销凭证号
            $where[]=['outMachine.VBELN','like','%'.$input['VBELN'].'%'];
        }*/

        if (isset($input['EKGRP']) && $input['EKGRP']) {//采购组
            $where[]=['outMachine.EKGRP','like','%'.$input['EKGRP'].'%'];
        }

        if (isset($input['BUKRS']) && $input['BUKRS']) {//公司代码
            $where[]=['outMachine.BUKRS','like','%'.$input['BUKRS'].'%'];
        }

        if (isset($input['LIFNR']) && $input['LIFNR']) {//供应商或债权人的帐号
            $where[]=['outMachine.LIFNR','like','%'.$input['LIFNR'].'%'];
        }
        if (isset($input['is_delete']) && is_numeric($input['is_delete'])) {//开启还是关闭
            $where[]=['outMachine.is_delete','=',$input['is_delete']];
        }
        /*if (isset($input['declare_push_type']) && is_numeric($input['declare_push_type'])) {//推送状态
            $where[]=['outMachine.declare_push_type','=',$input['declare_push_type']];

        }*/
        $superman   = session('administrator')->superman;
       /* if ($superman != 1)
        {
            $admin_name  = session('administrator')->name;
            //如果不是 超级管理员  需要加一些限制
            $where[]=['LIFNR','like','%'.$admin_name.'%'];
        }*/

        return $where;
    }

    /**
     * 校验是否已领料
     * author: szh
     * Date: 2019/6/5/005
     * Time: 10:05
     */
    public function checkHasZY03($pickIds = [])
    {
        $hasZy = [];
        $pickList = DB::table($this->table.' as outZy')
            ->select('EBELN','HAS_ZY03')
            ->whereIn('id',$pickIds)
            ->get();
        //如果has_ZY03 为1 则放入hasZy集合
        foreach ($pickList as $key => $val){
            if($val->HAS_ZY03 == 1){
                $hasZy[] = $val->EBELN;
            }
        }
        return $hasZy;
    }

    /**
     *
     * author: szh
     * Date: 2019/6/24/024
     * Time: 10:24
     */
    public function destroy($id,$ie_delete = 1)
    {
        //关闭采购凭证前需要校验车间领补退料（不考虑SAP领补退），逻辑来源夏凤娟
        //获取该采购单关联的领补退料单
        $shops = DB::table('ruis_out_machine_shop')
            ->where('picking_id', $id)
            ->get();

        //若有已发料的领料单或补料单，或未过账的退料单，则不可关闭采购凭证
        $warning_arr = [];
        foreach ($shops as $key => $value) {
            if ($value->type == 1 and $value->status == 1) {
                $hasReturen = false;
                foreach ($shops as $k => $v) {
                    if($v->type == 3 and $v->status == 1){
                        $hasReturen = true;
                    }
                }
                if(!$hasReturen){
                    //若存在领料单，且无已过账的退料单，则提示退料
                    $warning_arr[] = "存在领料单，请先退料给车间";
                }
            } else if ($value->type == 2 and $value->status == 1) {
                $warning_arr[] = "存在补料单，请先退料给车间";
            } else if ($value->type == 3 and $value->status == 0) {
                $warning_arr[] = "存在未过账的退料单，请先完成退料";
            }
        }
        
        if(count($warning_arr) > 0){
            TEPA(implode(',',$warning_arr));
        }else{
            $result = DB::table($this->table)
            ->where('id',$id)
            ->update(['is_delete' => $ie_delete]);

            return $result;
        }
    }

    /**
     * 委外订单管理导出数据
     *
     * @param $input
     * @return mixed
     * @throws ApiException
     */
    public function getPageListExportExcel($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='asc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $data =[
            'outMachine.*',
        ];
        $num = ($input['end'] - $input['start'])+1;
        $builder = DB::table($this->table.' as outMachine')
            ->select($data)
            ->where($where)
            ->offset($input['start'])
            ->limit($num)
            ->orderBy($input['sort'],$input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
            $roms_row = DB::table(config('alias.roms') . ' as roms')
                ->where('picking_id',$obj->id)
                ->select('status')
                ->first();
            if($roms_row && $roms_row->status==3)
            {
                $obj->lzp_status = 1;//已发料
            }
            else
            {
                $obj->lzp_status = 2;//未发料
            }
            $group_list = $this->getLinesByOrderForList($obj->id);
            if(json_decode(json_encode($group_list),true)){
                $obj->VBELP = $group_list ? $group_list[0]->VBELP : 0;
                $obj->MENGE = $group_list ? $group_list[0]->MENGE : 0;
            } else {
                $obj->VBELP = 0;
                $obj->MENGE = 0;

            }
            //picking_line 总数量
            $lineCount = count($group_list);
            //已完成报工初始化
            $declareCount = 0;
            $MATNRList = [];
            $pushCount = 0;
            foreach ($group_list as $key => $val) {
                //半成品物料编码
                $MATNRList[] = preg_replace('/^0+/','',$val->MATNR);
                if($val->has_declare == 1){
                    $declareCount +=1;
                }
                if($val->push_for_declare == 1){
                    $pushCount +=1;
                }
            }
            if($declareCount < $lineCount){
                $obj->declareType = '未全部报工';
            } else if ($declareCount >= $lineCount && $declareCount>0) {
                $obj->declareType = '已全部报工';
            } else {
                $obj->declareType = '未全部报工';
            }

            if($pushCount < $lineCount){
                $obj->declarePushType = '未全部推送';
            } else if ($pushCount >= $lineCount && $pushCount>0) {
                $obj->declarePushType = '已全部推送';
            }
            else
            {
                $obj->declarePushType = '';
            }
            //查询半成品物料编码对应的物料信息
            $obj->material_list = [];
            if($MATNRList){
                $materialList = DB::table(config('alias.rm'))->select(['name','item_no','lzp_identity_card'])->whereIn('item_no',$MATNRList)->get();
                $obj->material_list = $materialList;
            }

            $obj->lines = $group_list;
            $LIFNR = preg_replace('/^0+/','',$obj->LIFNR);
            $res = DB::table('ruis_partner_new')->select('name')->where('code',$LIFNR)->first();
            if ($res)
            {
                $obj->LIFNR_name = $res->name;
            }
            else
            {
                $obj->LIFNR_name = '';
            }


        }
        return $obj_list;

    }

    public function getOptimizationPageList($input)
    {
        //$input['page_no']、$input['page_size
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8010','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='outMachine.id';
        }
        $where = $this->_search($input);
        $data =[
            'outMachine.*',
            'rpo.end_date as operation_end_time',
            'rsopkl.AUFNR',
            'rsopkl.VBELP',
            'rsopkl.MENGE'
        ];

        $builder = DB::table($this->table.' as outMachine')
            ->leftJoin('ruis_out_machine_shop as roms','roms.picking_id','=','outMachine.id')
            ->leftJoin('ruis_out_machine_shop_item as romsi','roms.id','=','romsi.out_machine_shop_id')
            ->leftJoin('ruis_sap_out_picking_line as rsopkl', 'outMachine.id', '=', 'rsopkl.picking_id')
            ->leftJoin('ruis_production_order as rpo', 'rsopkl.AUFNR', '=', 'rpo.number')
            ->select($data)
            ->distinct('outMachine.id')
            ->where($where)
            ->where('rpo.is_delete',0)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
        if(isset($input['actual_send_qty']) && $input['actual_send_qty']==1)
        {
            $builder = $builder->where('roms.type','=','1');
            $builder = $builder->where('roms.status','=','1');
            $builder = $builder->where('romsi.actual_send_qty','>','0');
        }
        if (isset($input['begintime']) && $input['begintime'])
        {
            $builder->where('rpo.end_date','>=',(string)strtotime($input['begintime']));
            $builder->where('rpo.end_date','<=',(string)strtotime($input['endtime']));
        }
        if (isset($input['declare_push_type']) && is_numeric($input['declare_push_type'])) {//推送状态
            if($input['declare_push_type'] == 1)
            {
                $builder->whereIn('outMachine.declare_push_type',[0,1]);
            }
            else
            {
                $builder->where('outMachine.declare_push_type','=',2);
            }

        }
        if (isset($input['VBELN']) && $input['VBELN']) {//销售和分销凭证号
            $VBELN = explode(' ',$input['VBELN']);
            if($VBELN)
            {
                foreach ($VBELN as &$v)
                {
                    if(strlen($v) == '8')//解决销售订单号前面补0问题
                    {
                        $v='00'.$v; 
                    }
                    elseif(strlen($v) == '9')
                    {
                        $v='0'.$v; 
                    }
                    //if (substr($v,0,1) =='4')
                    // {
                    //     $v='0'.$v;
                    // }
                    // elseif(substr($v,0,2) !='66' && substr($v,0,2) !='67')
                    // {
                    //     $v='00'.$v;
                    // }
                }
            }
            $builder->whereIn('outMachine.VBELN',$VBELN);
        }

        $obj_list = $builder->get();

        //将查询出来的ID组合一下
        $picking_id_arr = array_column(obj2array($obj_list),'id');

        //1.已发料，未发料
        $roms_row = DB::table(config('alias.roms') . ' as roms')
            ->leftJoin('ruis_out_machine_shop_item as romsi','roms.id','=','romsi.out_machine_shop_id')
            ->whereIn('roms.picking_id',$picking_id_arr)
            ->where('roms.type',1)
            ->where('roms.status',1)
            ->pluck('romsi.actual_send_qty','picking_id')
            ->toArray();

        //2.获取实际已报工数量
        $yield_qty_row = DB::table('ruis_work_declare_order')
            ->whereIn('picking_id',$picking_id_arr)
            ->groupBy('picking_id')
            ->pluck(DB::raw('SUM(yield_qty) as yield_qty'),'picking_id')
            ->toArray();

        //3.每一个对应pink_line总数量
        $pink_line_row = DB::table('ruis_sap_out_picking_line')
            ->whereIn('picking_id',$picking_id_arr)
            ->groupBy('picking_id')
            ->pluck(DB::raw('count(*) as line_count'),'picking_id')
            ->toArray();

        //4.已成功推送报工单单数
        $push_count_row = DB::table('ruis_work_declare_order')
            ->whereIn('picking_id',$picking_id_arr)
            ->where('status',2)
            ->groupBy('picking_id')
            ->pluck(DB::raw('count(*) as push_count'),'picking_id')
            ->toArray();

        //5.已完成报工单数
        $declare_count_row = DB::table('ruis_sap_out_picking_line')
            ->whereIn('picking_id',$picking_id_arr)
            ->where('has_declare',1)
            ->groupBy('picking_id')
            ->pluck(DB::raw('count(*) as declare_count'),'picking_id')
            ->toArray();

        //6.获取工序与物料基本数据
        $sopl_row = DB::table('ruis_sap_out_picking_line')
            ->whereIn('picking_id',$picking_id_arr)
            ->select('id','TXZ01','has_declare','picking_id','MATNR')
            ->get();
        $sopl_group = dataGroup(obj2array($sopl_row),'picking_id');//按picking_id进行分组


        foreach ($obj_list as $obj)
        {
            $obj->operation_end_time = date('Y-m-d H:i:s',$obj->operation_end_time);

            if(isset($roms_row[$obj->id]) && $roms_row[$obj->id]>0)
            {
                $obj->lzp_status = 1;//已发料
            }
            else
            {
                $obj->lzp_status = 2;//未发料
            }

            if(isset($yield_qty_row[$obj->id]))
            {
                $obj->declare_qty = $yield_qty_row[$obj->id];
            }
            else
            {
                $obj->declare_qty = 0;
            }

            isset($declare_count_row[$obj->id])?($declareCount=$declare_count_row[$obj->id]):($declareCount=0);
            isset($pink_line_row[$obj->id])?($lineCount=$pink_line_row[$obj->id]):($lineCount=0);
            isset($push_count_row[$obj->id])?($pushCount=$push_count_row[$obj->id]):($pushCount=0);
            if($declareCount < $lineCount){
                $obj->declareType = '未全部报存';
            } else if ($declareCount >= $lineCount && $declareCount>0) {
                $obj->declareType = '已全部报存';
            } else {
                $obj->declareType = '未全部报存';
            }

            if($pushCount < $lineCount){
                $obj->declarePushType = '未全部推送';
            } else if ($pushCount >= $lineCount && $pushCount>0) {
                $obj->declarePushType = '已全部推送';
            }

            $LIFNR = preg_replace('/^0+/','',$obj->LIFNR);
            $res = DB::table('ruis_partner_new')->select('name')->where('code',$LIFNR)->first();
            if ($res)
            {
                $obj->LIFNR_name = $res->name;
            }
            else
            {
                $obj->LIFNR_name = '';
            }

            $MATNRList = [];
            foreach ($sopl_group[$obj->id] as $key => $val) {
                //半成品物料编码
                $MATNRList[] = preg_replace('/^0+/','',$val['MATNR']);
            }
            $obj->material_list = [];
            if($MATNRList){
                $materialList = DB::table(config('alias.rm'))->select(['name','item_no'])->whereIn('item_no',$MATNRList)->get();
                $obj->material_list = $materialList;
            }
            $obj->lines = $sopl_group[$obj->id];
        }

        if(count($where)==1 && $where[0][0]=='outMachine.is_delete'
            && empty($input['actual_send_qty']) && empty($input['VBELN'])
            && empty($input['begintime']) && empty($input['declare_push_type']))
        {
            $count_builder = DB::table($this->table.' as outMachine')
                ->where($where);
        }
        else
        {
            $count_builder = DB::table($this->table.' as outMachine')
                ->leftJoin(config('alias.roms') . ' as roms','roms.picking_id','=','outMachine.id')
                ->leftJoin('ruis_out_machine_shop_item as romsi','roms.id','=','romsi.out_machine_shop_id')
                ->leftJoin(config('alias.rsopkl') . ' as rsopkl', 'outMachine.id', '=', 'rsopkl.picking_id')
                /*->leftJoin('ruis_operation_order as roo',function ($join){
                    $join->on('rsopkl.BANFN','=','roo.BANFN')
                        ->on('rsopkl.BNFPO','=','roo.BNFPO');
                })
                ->leftJoin('ruis_production_order as rpo', 'roo.production_order_id', '=', 'rpo.id')*/
                ->leftJoin('ruis_production_order as rpo', 'rsopkl.AUFNR', '=', 'rpo.number')
                ->select('outMachine.id')
                ->distinct('outMachine.id')
                ->where($where);
            //->orderBy($input['sort'],$input['order']);

            if(isset($input['actual_send_qty']) && $input['actual_send_qty']==1)
            {
                $count_builder = $count_builder->where('roms.type','=','1');
                $count_builder = $count_builder->where('roms.status','=','1');
                $count_builder = $count_builder->where('romsi.actual_send_qty','>','0');
            }
            if (isset($input['begintime']) && $input['begintime'])
            {
                $count_builder = $count_builder->where('rpo.end_date','>=',(string)strtotime($input['begintime']));
                $count_builder = $count_builder->where('rpo.end_date','<=',(string)strtotime($input['endtime']));
            }
            if (isset($input['declare_push_type']) && is_numeric($input['declare_push_type'])) {//推送状态
                if($input['declare_push_type'] == 1)
                {
                    $count_builder->whereIn('outMachine.declare_push_type',[0,1]);
                }
                else
                {
                    $count_builder->where('outMachine.declare_push_type','=',2);
                }

            }
            if (isset($input['VBELN']) && $input['VBELN']) {//销售和分销凭证号
                $VBELN = explode(' ',$input['VBELN']);
                if($VBELN)
                {
                    foreach ($VBELN as &$v)
                    {
                        if (substr($v,0,1) =='4')
                        {
                            $v='0'.$v;
                        }
                        elseif(substr($v,0,2) !='66' && substr($v,0,2) !='67')
                        {
                            $v='00'.$v;
                        }
                    }
                }
                $count_builder->whereIn('outMachine.VBELN',$VBELN);
            }
        }


        $obj_list->total_count = $count_builder->count('outMachine.id');
        return $obj_list;

    }
}