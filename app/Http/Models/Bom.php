<?php
/**
 * Created by PhpStorm.
 * User: rick
 * Date: 2017/11/23
 * Time: 10:28
 */

namespace App\Http\Models;//定义命名空间
use App\Http\Models\Material\Material;
use App\Libraries\CheckBomItem;
use App\Libraries\Tree;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Libraries\Trace;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Models\Sap\StandardValue;
use PHPExcel_Cell;
/**
 * BOM操作类
 * @author  rick
 * @time    2017年10月19日13:39:39
 */
class Bom extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='bom_id';

    public function __construct()
    {
        parent::__construct();
        $this->table   = config('alias.rb');
    }

//region 检

    /**
     * 制定规则
     * @return array
     */
    public function getRules()
    {
        return array(

            'code'   => array('name'=>'code','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'物料清单编码'),
            'name'   => array('name'=>'name','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'名称'),
            'version'=> array('name'=>'version','type'=>'string','require'=>false,'on'=>'add,update','desc'=>'版本'),
            'version_description' => array('name'=>'version_description','max'=>200,'type'=>'string','require'=>false,'on'=>'add,update','desc'=>'版本描述'),
            'bom_group_id' => array('name'=>'bom_group_id','default'=>'','type'=>'int','require'=>false,'extra'=>'1','on'=>'add,update','desc'=>'bom组id'),
            'qty' => array('name'=>'qty','type'=>'int','default'=>1,'require'=>false,'on'=>'add,update','desc'=>'基础质量'),
            'material_id' => array('name'=>'material_id','type'=>'int','require'=>true,'on'=>'add,update','desc'=>'物料id'),
            'description' => array('name'=>'description','default'=>'','type'=>'string','max'=>500,'require'=>false,'on'=>'add,update','desc'=>'描述'),
            'loss_rate' => array('name'=>'loss_rate','type'=>'float','require'=>false,'default'=>0.00,'min'=>0.00,'max'=>99.99,'on'=>'add,update','desc'=>'损耗率'),
            'bom_tree'=>array('name'=>'bom_tree','type'=>'array','format'=>'json','require'=>true,'on'=>'add,update','desc'=>'常规中项的添加'),
            'is_upgrade' =>array('name'=>'is_upgrade','type'=>'int','require'=>true,'on'=>'update','desc'=>'是否升级'),
//            'cookie' => array('name'=>'cookie','type'=>'string','require'=>true,'on'=>'add,update,changeStatus','desc'=>'客户端cookie'),
            'bom_id' => array('name'=>'bom_id','type'=>'int','require'=>true,'on'=>'update,changeStatus','desc'=>'物料清单ID'),
            'type' => array('name'=>'type','type'=>'string','require'=>true,'on'=>'changeStatus','desc'=>'类型'),
            'status' => array('name'=>'status','type'=>'int','require'=>true,'on'=>'changeStatus','desc'=>'状态'),
            'operation_id' => array('name'=>'operation_id','type'=>'int','require'=>true,'on'=>'add,update','desc'=>'工序'),
            'label' => array('name'=>'label','type'=>'string','default'=>'','require'=>false,'on'=>'add,update','desc'=>'标签'),                 //'factory_id' => array('name'=>'factory_id','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'标签'),
        );
    }


    /**
     * 对字段进行检查
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     * @author  sam.shan@ruis-ims.cn
     * @todo 后面统一放置到rick的Rules中
     */
    public function checkFormFields(&$input)
    {

        //用户id
        //if(empty($input['cookie']))  TEA('700','cookie');
        //$input['creator_id']=$this->getUserFieldByCookie($input['cookie'],'id');
        $input['creator_id']=(!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;

        //附件信息参数检测
        $this->checkAttachmentsFormFields($input);

    }

    /**
     * 检查附件信息字段
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkAttachmentsFormFields(&$input)
    {
        //1.attachments 物料附件N
        #1.1参数类型
        if(!isset($input['attachments']) || !is_json($input['attachments'])) TEA('701','attachments');
        #1.2 转成数组
        $input['attachments']=json_decode($input['attachments'],true);
        #1.3 传递的数据源是否正确,顺便转成ref
        $input['input_ref_arr_attachments']=[];
        foreach( $input['attachments'] as $key =>$value){
            $has=$this->isExisted([['id','=',$value['attachment_id']]],config('alias.attachment'));
            $input['input_ref_arr_attachments'][$value['attachment_id']]=$value;
            if(!$has)  TEA('700','attachments');
        }

    }



//endregion

//region 查
    /**
     * 查看Bom详情
     * @param $id
     * @return mixed
     * @throws \App\ApiExceptions\ApiApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function get($id,$need_find_level)
    {
        //先从缓存中取
//        $cache_key = make_redis_key(['bom_detail',$id]);
//        $obj = Cache::get($cache_key);
//        if(!empty($obj)) return unserialize($obj);

        $fields= ['rb.id as bom_id','rb.code','rb.name','rb.version','rb.version_description','rb.material_id',

            'rb.bom_group_id','rb.qty','rb.loss_rate','rb.description','rb.status','rb.is_version_on','rb.creator_id','rb.ctime','rb.mtime','rb.operation_id','rb.operation_ability as operation_capacity','rb.label','rb.company_id','rb.factory_id',

            'rb.was_release','rb.bom_no','rb.bom_sap_desc','rb.DATUV','rb.BMEIN','rb.STLAN','rb.is_ecm','rb.AENNR','rb.from','rb.bom_unit_id','rio.name as operation_name',

            'u.name as creator_name','rb.name as bom_group_name','rm.item_no','ruu.commercial','rm.material_category_id','rmc.name as material_category_name'
        ];
        //这些人什么信息都想要，结果就是疯狂的联表查询，速度回慢的一比
        $obj = DB::table(config('alias.rb').' as rb')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
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
        //时间格式转换
//        $obj->ctime=$obj->ctime>0?date('Y-m-d H:i:s',$obj->ctime):'';
//        $obj->mtime=$obj->mtime>0?date('Y-m-d H:i:s',$obj->mtime):'';
//        //工序名
//        $obj->operation_name='';
//        if(!empty($obj->operation_id)) $obj->operation_name=$this->getFieldValueById($obj->operation_id,'name',config('alias.rio'));
//        //用户名
//        $obj->creator_name='';
//        if(!empty($obj->creator_id)) $obj->creator_name=$this->getFieldValueById($obj->creator_id,'name',config('alias.u'));
//        //Bom组名称
//        $obj->bom_group_name='';
//        if(!empty($obj->bom_group_id)) $obj->bom_group_name=$this->getFieldValueById($obj->bom_group_id,'name',config('alias.rbg'));
//        //bom顶级母件编码
//        $material=DB::table(config('alias.rm'))->select('item_no','unit_id')->where('id','=',$obj->material_id)->first();
//
//        $obj->item_no=$material->item_no;
//
//        $unit =DB::table(config('alias.uu'))->select('label','commercial')->where('id','=',$material->unit_id)->first();
//
//        $obj->unit=$unit->label;
//        $obj->commercial=$unit->commercial;

        //获得bom树
        $obj->bom_tree=$this->getBomTree($obj->material_id,$obj->version,false,false,$need_find_level,$obj->bom_no);
//        $obj->bom_tree=$this->getNewBomTree($obj->material_id,$obj->version,true,true,false,$obj->bom_no);
        //获取bom的关联附件
        $obj->attachments=$this->getBomAttachments($id);
        //获得bom的工厂
        $obj->factory_list = $this->getMaterialBomFactory($obj->code,$obj->bom_no);
        //放入缓存
//        if(!empty($obj)) Cache::put($cache_key,serialize($obj),config('app.redis_timeout.bom'));
        return $obj;
    }

    public function deleteReleaseRecord($release_record_id){
        $res = DB::table(config('alias.rbrr'))->where('id',$release_record_id)->update(['status'=>2]);
        if($res === false) TEA('804');
    }



//region 新bom树



    /**
     * 根据bom母件获取Bom树节点
     * @param $bom_material_id    int   bom母件material_id值
     * @param $version       int        版本号,默认值为1
     * @param $replace            bool  是否取替代物料
     * @param $bom_item_qty_level bool  是否取阶梯用量比
     * @author sam.shan <sam.shan@ruis-ims.cn>
     * @throws \App\ApiExceptions\ApiApiException
     * @return mixed
     */
    public function getNewBomTree($bom_material_id,$version=1,$replace=TRUE,$bom_item_qty_level=False,$need_find_level = true,$bom_no = '01')
    {
        //第一步 获取Bom母件信息
        $trees=$this->getNewMaterialMotherDetail($bom_material_id,$version,$bom_no);
        if(empty($trees)) TEA('404','bom_material_id');
        //第二步  获取母件儿子们的信息,注意 只有它的儿子们的bom_id值才是$bom_id额
        $trees->children=$this->getNewParentItemSons($trees->bom_id,$replace,$bom_item_qty_level,$need_find_level);
        return $trees;

    }

    public function getMaterialBomFactory($code,$bom_no){
        $list = DB::table(config('alias.rbf').' as rbf')
            ->select('rf.name')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rbf.factory_id')
            ->where([['rbf.material_code','=',$code],['rbf.bom_no','=',$bom_no]])
            ->get();
        return $list;
    }

    /**
     * 获取母件的儿子
     * @param $material_id
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getNewParentItemSons($bom_id,$replace,$bom_item_qty_level,$need_find_level = true,$father_materials = [])
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
            $replaces=$this->getNewReplaceItems($value->bom_item_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
            if($replace) $value->replaces=$replaces;
            //给儿子们找儿子(递归下去就是一条家谱树)
            $value->children=[];
            if($value->has_bom){
                if($value->is_assembly == 1){
                    $value->versions=DB::table($this->table.' as rb')
                        ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                        ->pluck('version');
                    $bom=$this->getNewBomOperation($value->material_id,$value->version,$value->bom_no);
                    //注意半成品后来添加Bom结构的一个问题
                    if(!empty($bom) && !in_array($value->material_id,$father_materials)) {
                        $father_materials[] = $value->material_id;
                        //是否有工艺路线
                        $value->has_route = $this->isExisted([['bom_id','=',$bom->bom_id]],config('alias.rbr'));
                        //子项bom自身的bom id
                        $value->self_bom_id = $bom->bom_id;
                        $value->operation_id=!empty($bom->operation_id)?$bom->operation_id:0;
                        $value->operation_name=!empty($bom->operation_name)?$bom->operation_name:'';
                        $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                        $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                        if($need_find_level){
                            $value->children=$this->getNewParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
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
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNewMaterialMotherDetail($bom_material_id,$version=1,$bom_no = '01')
    {
        $bom=DB::table($this->table.' as rb')
            ->where('rb.material_id',$bom_material_id)
            ->where('rb.version',$version)
            ->where('rb.bom_no',$bom_no)
            ->leftJoin(config('alias.rm').' as rm','rb.material_id','=','rm.id')
            ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
            ->leftJoin(config('alias.uu').' as uu', 'rb.bom_unit_id', '=', 'uu.id')
            ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','=','rmc.id')
            ->select(
                'rb.id as bom_id','rb.operation_id','rb.operation_ability','rb.qty as usage_number','rb.material_id','rb.loss_rate',
                'rm.name','rm.item_no','uu.id as unit_id','rm.material_category_id',
                'rio.name as operation_name',
                'uu.label as unit','uu.commercial',
                'rmc.name as material_category_name'
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
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNewBomOperation($bom_material_id,$version=1,$bom_no = '01')
    {
        $bom=DB::table($this->table.' as rb')
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

    /**
     * 寻找物料项的替代物料
     * @param $parent_id
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNewReplaceItems($parent_id,$replace,$bom_item_qty_level,$need_find_level = true,$father_materials)
    {

        //获取伪儿子们
        $where=[['rbi.parent_id','=',$parent_id]];
        $obj_list=$this->getBomItemList($where);
        //递归遍历伪儿子们
        foreach($obj_list  as $key=>&$value){
            //看看伪儿子们是否有bom结构
            $value->has_bom=$this->isExisted([['material_id','=',$value->material_id],['is_version_on','=',1]],config('alias.rb'));
            //伪儿子们的阶梯配置信息
            if($bom_item_qty_level)  $value->bom_item_qty_levels=$this->getBomItemQtyLevel($value->bom_item_id);
            //给伪儿子们找儿子(递归下去就是一条家谱树)
            $value->children=[];
            if($value->has_bom){
                if($value->is_assembly == 1){
                    $value->versions=DB::table($this->table.' as rb')
                        ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                        ->pluck('version');
                    $bom=$this->getNewBomOperation($value->material_id,$value->version);
                    if(!empty($bom) && !in_array($value->material_id,$father_materials)){
                        $father_materials[] = $value->material_id;
                        $value->operation_id=$bom->operation_id;
                        $value->operation_name=$bom->operation_name;
                        $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                        $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                        if($need_find_level){
                            $value->children=$this->getNewParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                        }
                    }
                }
            }
        }
        return $obj_list;
    }

    /**
     * 查询物料的bom编号
     * @param $material_id
     * @return mixed
     */
    public function getMaterialBomNos($material_id){
        $obj_list = DB::table(config('alias.rb'))
            ->where([['material_id','=',$material_id],['is_version_on','=',1]])
            ->select('bom_no','id as bom_id','version')
            ->get();
        return $obj_list;
    }

    /**
     * 组装bom子项
     * @param $input
     * @throws \App\ApiExceptions\ApiApiException
     */
    public function assemblyItem($input){
        if(empty($input['item_id']) || !is_numeric($input['item_id'])) TEA('700','item_id');
        if(!isset($input['bom_no'])) TEA('700','bom_no');
        if(empty($input['version'])) TEA('700','version');
        $res = DB::table(config('alias.rbi'))->where('id',$input['item_id'])->update(['is_assembly'=>1,'bom_no'=>$input['bom_no'],'version'=>$input['version']]);
        if($res === false) TEA('804');
    }

//endregion
    /**
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getMaterialMotherDetail($bom_material_id,$version=1,$bom_no = '01')
    {
        $bom=DB::table($this->table.' as rb')
            ->where('rb.material_id',$bom_material_id)
            ->where('rb.version',$version)
            ->where('rb.bom_no',$bom_no)
            ->leftJoin(config('alias.rm').' as rm','rb.material_id','=','rm.id')
            ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
            ->leftJoin(config('alias.uu').' as uu', 'rb.bom_unit_id', '=', 'uu.id')
            ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','=','rmc.id')
            ->select(
                'rb.id as bom_id','rb.operation_id','rb.operation_ability','rb.qty as usage_number','rb.material_id','rb.loss_rate',
                'rm.name','rm.item_no','uu.id as unit_id','rm.material_category_id',
                'rio.name as operation_name',
                'uu.label as unit','uu.commercial',
                'rmc.name as material_category_name'
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
     * 获取BOM附件
     * @param $bom_id
     * @return mixed
     */
    public function getBomAttachments($bom_id)
    {
        $obj_list=DB::table(config('alias.rba').' as rba')
            ->where('rba.bom_id',$bom_id)
            ->leftJoin(config('alias.attachment').' as attach', 'rba.attachment_id', '=', 'attach.id')
            ->leftJoin(config('alias.u').' as u','attach.creator_id','=','u.id')
            ->select(
                'rba.bom_id',
                'rba.attachment_id',
                'rba.comment',
                'u.name as creator_name',
                'attach.name',
                'attach.filename',
                'attach.path',
                'attach.size',
                'attach.ctime',
                'attach.creator_id',
                'attach.is_from_erp'
            )->get();
        //遍历装饰数据(一般不在M层处理)
        foreach($obj_list as $key=>&$value){
            $value->ctime=date('Y-m-d H:i:s',$value->ctime);
        }
        return $obj_list;
    }
    /**
     * 获得BOM分页列表
     * @param $input
     * @return object list
     * @author rick
     * @reviser sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getBomList(&$input)
    {

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
        $builder = DB::table($this->table.' as rb')
            ->leftJoin(config('alias.rrad').' as u', 'u.id', '=', 'rb.creator_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','=','rb.material_id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','rb.bom_unit_id')
            ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','rmc.id')
            ->leftJoin(config('alias.rmc').' as brmc','rm.sap_big_material_type_id','brmc.id')
            ->leftJoin(config('alias.rbg').' as rbg', 'rbg.id', '=', 'rb.bom_group_id');
//        $input['child_code'] = 'BCB-HA-0005';
        if (!empty($input['child_code'])) {
            $builder->leftJoin(config('alias.rbi').' as rbi','rbi.bom_material_id','=','rb.material_id');
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
                $query->select('rrb.material_id')->from(config('alias.rbrb').' as rbrb')
                    ->leftJoin(config('alias.rb').' as rrb','rrb.id','rbrb.bom_id')
                    ->whereRaw('rrb.is_version_on = 1 and rb.material_id=rrb.material_id and rbrb.operation_id='.$opertion_id);
            });
            if($input['has_workhour'] == 1){
                $builder->whereExists(function($query)use($opertion_id){
                    $query->select('rrb.material_id')->from(config('alias.rimw').' as rimw')
                        ->leftJoin(config('alias.rb').' as rrb','rimw.bom_id','rrb.id')
                        ->whereRaw('rrb.is_version_on=1 and rb.material_id=rrb.material_id and rimw.operation_id='.$opertion_id);
                });
            }else if($input['has_workhour'] == '0'){
                $builder->whereNotExists(function($query)use($opertion_id){
                    $query->select('rrb.material_id')->from(config('alias.rimw').' as rimw')
                        ->leftJoin(config('alias.rb').' as rrb','rimw.bom_id','rrb.id')
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

        //4.遍历处理一下数据
        foreach($obj_list as $key=>&$value){
            //创建时间
            $value->ctime=!empty($value->ctime)?date('Y-m-d H:i:s',$value->ctime):'';
            //版本包含
//            $value->versions=DB::table($this->table)->where('code','=',$value->code)->pluck('version');
//            生效的版本,后续添加上去的,我就不一次性取了,用户催的急
//            $value->release_version=$this->getFieldValueByWhere([['code','=',$value->code],['status','=',1],['is_version_on','=',1]],'version');
//            $value->release_version_bom_id=$this->getFieldValueByWhere([['code','=',$value->code],['status','=',1],['is_version_on','=',1]],'id');
//            $release_bom = DB::table(config('alias.rb'))->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no],['status','=',1],['is_version_on','=',1]])->select('version','id')->first();
//            if(!empty($release_bom)){
//                $value->release_version = $release_bom->version;
//                $value->release_version_bom_id = $release_bom->id;
//            }else{
//                $value->release_version = '';
//                $value->release_version_bom_id = '';
//            }
        }
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
        $bom=DB::table($this->table.' as rb')
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

    /**
     * 根据bom母件获取Bom树节点
     * @param $bom_material_id    int   bom母件material_id值
     * @param $version       int        版本号,默认值为1
     * @param $replace            bool  是否取替代物料
     * @param $bom_item_qty_level bool  是否取阶梯用量比
     * @author sam.shan <sam.shan@ruis-ims.cn>
     * @throws \App\ApiExceptions\ApiApiException
     * @return mixed
     */
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
     * 获取bom子项阶梯用量信息
     * @param $bom_item_id
     * @return mixed
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  getBomItemQtyLevel($bom_item_id)
    {

        $obj_list=DB::table(config('alias.rbiql'))
            ->select('id as bom_item_qty_level_id','bom_item_id','parent_min_qty','qty')
            ->where('bom_item_id',$bom_item_id)
            ->get();
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
                'rm.id as material_id','rm.name','rm.item_no','rm.material_category_id',
                'rbi.id as bom_item_id','rbi.bom_id','rbi.loss_rate','rbi.is_assembly','rbi.usage_number','rbi.total_consume','rbi.parent_id','rbi.comment','rbi.version','rbi.bom_material_id',
                'uu.commercial','uu.id as bom_unit_id',
                'rmc.name as material_category_name','rbi.bom_no',
                'rbi.bom_no','rbi.AENNR','rbi.DATUV','rbi.DATUB','rbi.POSNR','rbi.POSTP','rbi.MEINS','rbi.SORTF'
            )
            ->where($where)
            ->leftJoin(config('alias.rm').' as rm','rbi.material_id','=','rm.id')
            ->leftJoin(config('alias.uu').' as uu', 'rbi.bom_unit_id', '=', 'uu.id')
            ->leftJoin(config('alias.rmc').' as rmc', 'rm.material_category_id', '=', 'rmc.id')
            ->get();
        return $obj_list;
    }

    /**
     * 寻找物料项的替代物料
     * @param $parent_id
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getReplaceItems($parent_id,$replace,$bom_item_qty_level,$need_find_level = true,$father_materials)
    {

        //获取伪儿子们
        $where=[['rbi.parent_id','=',$parent_id]];
        $obj_list=$this->getBomItemList($where);
        //递归遍历伪儿子们
        foreach($obj_list  as $key=>&$value){
            //看看伪儿子们是否有bom结构
            $value->has_bom=$this->isExisted([['material_id','=',$value->material_id],['is_version_on','=',1]],config('alias.rb'));
            //伪儿子们的阶梯配置信息
            if($bom_item_qty_level)  $value->bom_item_qty_levels=$this->getBomItemQtyLevel($value->bom_item_id);
            //给伪儿子们找儿子(递归下去就是一条家谱树)
            $value->children=[];
            if($value->has_bom){
                if($value->is_assembly == 1){
                    $value->versions=DB::table($this->table.' as rb')
                        ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                        ->pluck('version');
                    $bom=$this->getBomOperation($value->material_id,$value->version);
                    if(!empty($bom) && !in_array($value->material_id,$father_materials)){
                        $father_materials[] = $value->material_id;
                        $value->operation_id=$bom->operation_id;
                        $value->operation_name=$bom->operation_name;
                        $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                        $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                        if($need_find_level){
                            $value->children=$this->getParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                        }
                    }
                }
            }
        }
        return $obj_list;
    }

    /**
     * 查询bom有效的发布记录
     */
    public function getBomReleaseRecord($input){
        $obj_list = DB::table(config('alias.rbrr').' as rbrr')
            ->leftJoin(config('alias.rb').' as rb','rb.id','rbrr.bom_id')
            ->leftJoin(config('alias.rrad').' as rrad','rbrr.cid','rrad.id')
            ->select(
                'rrad.name as admin_name',
                'rb.code as bom_code',
                'rb.version',
                'rb.name as bom_name',
                'rb.id as bom_id',
                'rb.description',
                'rbrr.ctime',
                'rbrr.id as release_record_id'
            )
            ->where('rbrr.status',1)
            ->get();
        foreach ($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        return $obj_list;
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
                    $value->versions=DB::table($this->table.' as rb')
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
     * 获取进料
     * @param $bom_id
     * @param $routing_id
     */
   public function newGetEnterBomMaterial($bom_id,$routing_id){
       $bom_qty = DB::table(config('alias.rb'))->where('id',$bom_id)->value('qty');
       //先找bom的子项
       $item_list = DB::table(config('alias.rbi').' as rbi')
           ->select(DB::raw('rbi.material_id,rm.name,rm.item_no,uu.commercial,rbi.usage_number as use_num,rbi.bom_unit_id,rbi.POSNR,rbi.usage_number as user_hand_num,0 as is_lzp'))
           ->leftJoin(config('alias.rm').' as rm','rm.id','rbi.material_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','rbi.bom_unit_id')
           ->where([['rbi.bom_id','=',$bom_id]])
           ->get();
       //过滤一下子项，如果子项的数量被用完了，则剔除
       $used_item = DB::table(config('alias.rbri'))->select(DB::raw('material_id,sum(use_num) as use_num,POSNR'))
           ->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id],['is_lzp','=',0],['type','=',1]])
           ->groupBy('material_id','POSNR')
           ->get();
       $used_ref_items = [];
       foreach ($used_item as $k=>$v){
           if(empty($v)) continue;
           $used_ref_items[$v->material_id.'-'.$v->POSNR] = $v;
       }
       foreach ($item_list as $k=>&$v){
           if(!isset($used_ref_items[$v->material_id.'-'.$v->POSNR])) continue;
           if(!bccomp($v->use_num,$used_ref_items[$v->material_id.'-'.$v->POSNR]->use_num,8) || $v->use_num < $used_ref_items[$v->material_id.'-'.$v->POSNR]->use_num){
               unset($item_list[$k]);
           }else{
               $v->use_num = floor(($v->use_num - $used_ref_items[$v->material_id.'-'.$v->POSNR]->use_num) * 1000) / 1000;
               $v->user_hand_num = floor(($v->user_hand_num - $used_ref_items[$v->material_id.'-'.$v->POSNR]->use_num) * 1000) / 1000;
           }
       }
       //再找流转品
       $lzp_list = DB::table(config('alias.rbrl').' as rbrl')->select(DB::raw('distinct rbrl.material_id,rm.name,rm.item_no,uu.commercial,uu.id as bom_unit_id,1 as is_lzp,"" as POSNR,'.$bom_qty.' as use_num,1 as user_hand_num'))
           ->leftJoin(config('alias.rm').' as rm','rm.id','rbrl.material_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
           ->where([['rbrl.bom_id','=',$bom_id],['rbrl.routing_id','=',$routing_id]])
           ->get();
       //找到流转品生成的样子
       $out_lzp_items = DB::table(config('alias.rbri'))
           ->where([['type','=',2],['bom_id','=',$bom_id],['routing_id','=',$routing_id],['is_lzp','=',1]])
           ->select('material_id','desc','use_num','user_hand_num')
           ->get();
       $out_ref_lzp_items = [];
       foreach ($out_lzp_items as $k=>$v){
           if(empty($v)) continue;
           $out_ref_lzp_items[$v->material_id] = $v;
       }
       //找到流转品使用的情况
       $in_lzp_items = DB::table(config('alias.rbri'))->select(DB::raw('material_id,sum(use_num) as use_num,sum(user_hand_num) as user_hand_num'))
           ->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id],['is_lzp','=',1],['type','=',1]])
           ->groupBy('material_id')
           ->get();
       $in_ref_lzp_items = [];
       foreach ($in_lzp_items as $k=>$v){
           if(empty($v)) continue;
           $in_ref_lzp_items[$v->material_id] = $v;
       }
       foreach ($lzp_list as $k=>&$v){
           if(!isset($out_ref_lzp_items[$v->material_id])) continue;
           $v->desc = $out_ref_lzp_items[$v->material_id]->desc;
           if(isset($out_ref_lzp_items[$v->material_id]) && !isset($in_ref_lzp_items[$v->material_id])){
               $v->use_num = $out_ref_lzp_items[$v->material_id]->use_num;
               $v->user_hand_num = $out_ref_lzp_items[$v->material_id]->user_hand_num;
           }elseif (isset($out_ref_lzp_items[$v->material_id]) && isset($in_ref_lzp_items[$v->material_id])){
               if(!bccomp($out_ref_lzp_items[$v->material_id]->use_num,$in_ref_lzp_items[$v->material_id]->use_num,8) || $out_ref_lzp_items[$v->material_id]->use_num < $in_ref_lzp_items[$v->material_id]->use_num){
                   unset($lzp_list[$k]);
               }else{
                   $v->use_num = floor(($out_ref_lzp_items[$v->material_id]->use_num - $in_ref_lzp_items[$v->material_id]->use_num) * 1000) / 1000;
                   $v->user_hand_num = floor(($out_ref_lzp_items[$v->material_id]->user_hand_num - $in_ref_lzp_items[$v->material_id]->user_hand_num) * 1000) / 1000;
               }
           }
       }
       $enterMaterial = array_merge(obj2array($item_list),obj2array($lzp_list));
       $ref_enterMaterial = [];
       $material_ids = [];
       foreach ($enterMaterial as $k=>&$v){
           if(empty($v['use_num']) || empty($v['user_hand_num'])) continue;
           $v['attributes'] = [];
           $v['desc'] = '';
           $v['drawings'] = [];
           $ref_enterMaterial[$v['material_id'].'-'.$v['POSNR']] = $v;
           $material_ids[] = $v['material_id'];
       }
       //找到所有物料的物料属性
       $attributes = DB::table(config('alias.ma').' as ma')->select('ad.name','ma.value','uu.commercial','ma.material_id')
           ->leftJoin(config('alias.ad').' as ad','ad.id','ma.attribute_definition_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','ad.unit_id')
           ->whereIn('ma.material_id',$material_ids)
           ->get();
       //找到所有流转品在生成的时候添加的描述
//       $lzp_descs = DB::table(config('alias.rbri'))
//           ->where([['type','=',2],['bom_id','=',$bom_id],['routing_id','=',$routing_id]])
//           ->whereIn('material_id',$material_ids)
//           ->select('material_id','desc')
//           ->get();
       //找到所有图片
       $drawings = DB::table(config('alias.rmd').' as rmd')->select('rmd.material_id','rdr.code','rdr.name','rdr.image_path')
           ->leftJoin(config('alias.rdr').' as rdr','rdr.id','rmd.drawing_id')
           ->whereIn('rmd.material_id',$material_ids)
           ->get();
       foreach ($ref_enterMaterial as $k=>&$v){
//           if($v['is_lzp'] == 1) $v['use_num'] = $bom_qty;
           foreach ($attributes as $j=>$w){
               if($v['material_id'] == $w->material_id) $v['attributes'][] = $w;
           }
           foreach ($drawings as $j=>$w){
               if($v['material_id'] == $w->material_id) $v['drawings'][] = $w;
           }
//           foreach ($lzp_descs as $j=>$w){
//               if($v['material_id'] == $w->material_id) $v['desc'] = $w->desc;
//           }
       }
       return $ref_enterMaterial;
   }

    /**
     * 获取出料
     * @param $bom_id
     * @param $materials
     * @return array
     */
   public function newGetOutBomMaterial($bom_id,$materials){
       $outMaterial = [];
       $bom_material = DB::table($this->table.' as rb')->select(DB::raw('rb.material_id,rm.name,rm.item_no,uu.commercial,rb.bom_unit_id,rb.qty as use_num,rb.qty as user_hand_num,"" as POSNR'))
           ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','rb.bom_unit_id')
           ->where([['rb.id','=',$bom_id]])->first();
       $bom_material->attributes = DB::table(config('alias.ma').' as ma')->select('ad.name','ma.value','uu.commercial')
           ->leftJoin(config('alias.ad').' as ad','ad.id','ma.attribute_definition_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','ad.unit_id')
           ->where('ma.material_id',$bom_material->material_id)
           ->get();
       $outMaterial[] = $bom_material;
       return $outMaterial;

   }

//    /**
//     * 获取进料
//     * @param $bom_id
//     * @return mixed
//     */
//    public function getEnterBomMaterial($bom_id,$routing_id){
//        //先查找顶级母件物料
//        $enterMaterial = [];
//        $monther = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no','uu.commercial','rb.qty as usage_number')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where('rb.id',$bom_id)
//            ->get();
//        //找儿子
//        $this->getBomSons($bom_id,$enterMaterial);
//        //获取流转品
//        $lzp = DB::table(config('alias.rbrl').' as rbrl')->select('rbrl.material_id','rm.name','rm.item_no','uu.commercial')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rbrl.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where([['rbrl.bom_id','=',$bom_id],['rbrl.routing_id','=',$routing_id]])
//            ->get();
//        //找流转品的儿子
//        foreach ($lzp as $k=>$v){
//            $has_bom = DB::table($this->table)->select('id as bom_id')->where([['material_id','=',$v->material_id],['is_version_on','=',1]])->first();
//            if($has_bom){
//                $this->getBomSons($has_bom->bom_id,$enterMaterial);
//            }
//        }
//        //合并
//        $enterMaterial = array_merge($enterMaterial,obj2array($monther),obj2array($lzp));
//        //去重
//        $enterMaterial = $this->qc($enterMaterial,'material_id');
//        //后续添加查找物料属性
//        foreach ($enterMaterial as $k=>&$v){
//            $v['attributes'] = DB::table(config('alias.ma').' as ma')->select('ad.name','ma.value','uu.commercial')
//                ->leftJoin(config('alias.ad').' as ad','ad.id','ma.attribute_definition_id')
//                ->leftJoin(config('alias.uu').' as uu','uu.id','ad.unit_id')
//                ->where('ma.material_id',$v['material_id'])
//                ->get();
//        }
//        //后续添加查找物料附件
//        foreach ($enterMaterial as $k=>&$v){
//            $v['attachment'] = DB::table(config('alias.rma').' as rma')->select('a.name','a.path')
//                ->leftJoin(config('alias.attachment').' as a','a.id','rma.attachment_id')
//                ->where('rma.material_id',$v['material_id'])
//                ->get();
//        }
//        return $enterMaterial;
//    }
//
//    /**
//     * 获取顶级bom的儿子们(列表展示)
//     * @param $bom_id
//     * @param $arr
//     */
//    public function getBomSons($bom_id,&$arr){
//        //获取父节点的儿子们(包含伪儿子)
//        $child = DB::table(config('alias.rbi').' as rbi')->select('rbi.material_id','rm.name','rm.item_no','uu.commercial','rbi.usage_number')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rbi.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where('rbi.bom_id',$bom_id)
//            ->get();
//        $arr = array_merge(obj2array($child),$arr);
//        //递归遍历亲儿子们
//        foreach($child as $key=>&$value){
//            //看看儿子们是否有bom结构
//            $has_bom = DB::table($this->table)->select('id as bom_id')->where([['material_id','=',$value->material_id],['is_version_on','=',1]])->first();
//            //给儿子们找儿子(递归下去就是一条家谱树)
//            if($has_bom){
//                $this->getBomSons($has_bom->bom_id,$arr);
//            }
//        }
//    }
//
//    /**
//     * 根据进料集合获取出料
//     * @param $bom_id
//     * @param $materials
//     * @return array
//     */
//    public function getOutBomMaterial($bom_id,$materials){
//        $outMaterial = [];
//        $materials = json_decode($materials,true);
//        //查找所有物料的父项
//        $allParent = [];
//        foreach ($materials as $k=>$v){
//            $parent = DB::table(config('alias.rbi'))->where('material_id',$v)->pluck('bom_id');
//            if($k == 0){
//                $allParent = obj2array($parent);
//            }else{
//                //取交集获取相同父亲
//                $allParent = array_intersect($allParent,obj2array($parent));
//            }
//        }
//        //重建索引
//        $allParent = array_values($allParent);
//        //找寻每个父亲的顶级bom，如果和传入的顶级bom相同则该父亲是需要的出料
//        foreach ($allParent as $k=>$v){
//            $parentMaterial = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no','uu.commercial')
//                ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//                ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//                ->where([['rb.is_version_on','=',1],['rb.id','=',$v]])->first();
//            $this->getMontherBomBySon($v,$outMaterial,$bom_id,$parentMaterial);
//        }
//        //如果他的父亲有儿子的个数和传入的进料数不对，这里应该要判断出来返回不出出料
//        foreach ($outMaterial as $k=>$v){
//            $sons = DB::table(config('alias.rbi').' as rbi')->select('rbi.material_id')
//                ->leftJoin(config('alias.rb').' as rb','rbi.bom_id','rb.id')
//                ->where([['rb.is_version_on','=',1],['rb.material_id','=',$v->material_id]])->get();
//            if(count($sons) != count($materials)) unset($outMaterial[$k]);
//        }
//        //顶级bom自身物料也应该作为出料
//        $montherBomMaterial = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no','uu.commercial')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where([['rb.id','=',$bom_id]])->first();
//        if(!empty($montherBomMaterial)){
//            $montherBomMaterial->is_monther = 1;
//            $outMaterial[] = $montherBomMaterial;
//        }
//        //去掉重复的
//        $outMaterial = $this->qc(obj2array($outMaterial),'material_id');
//        return $outMaterial;
//    }
//
//
//    public function getMontherBomBySon($parent_bom_id,&$arr,$bom_id,$parentMaterial){
//        //如果该bom_id等于顶级bom的id，那么它上个递归的父亲物料就是出料的一员
//        if($parent_bom_id == $bom_id){
//            if(!empty($parentMaterial)) $arr[] = $parentMaterial;
//        }else{
//            //如果不等于，那么需要判定它是否还有父亲
//            //查找父亲的物料id
//            $material  = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no')
//                ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//                ->where([['rb.is_version_on','=',1],['rb.id',$parent_bom_id]])->first();
//            if(!empty($material)){
//                $parent = DB::table(config('alias.rbi'))->where('material_id',$material->material_id)->pluck('bom_id');
//                if(!empty($parent)){
//                    //如果他还有父亲，那么递归查找它的顶级bom，判断是否是出料的一员
//                    foreach (obj2array($parent) as $k=>$v){
//                        $this->getMontherBomBySon($v,$arr,$bom_id,$parentMaterial);
//                    }
//                }
//            }
//        }
//
//    }



    /**
     * 根据物料ID获取设计bom
     * @param $material_id
     * @return mixed
     */
    public function getDesignBom($material_id,$bom_no = '01')
    {
        $bom = DB::table(config('alias.rb').' as rb' )
            ->select('rb.ptime','rb.id as bom_id','rb.status','rb.is_version_on','material_id','rb.code','rb.name','rb.version','rb.version_description','u.name as user_name','rb.was_release','rb.bom_no','rb.ctime','rb.mtime')
            ->leftJoin(config('alias.u').' as u','rb.creator_id','=','u.id')
            ->where([['rb.material_id','=',$material_id],['bom_no','=',$bom_no]])
            ->get();
        foreach ($bom as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
            $v->mtime = date('Y-m-d H:i:s',$v->mtime);
            $v->ptime = !empty($v->ptime)?date('Y-m-d H:i:s',$v->ptime):'';
        }
        return $bom;

    }

    /**
     * 版本发布前检验
     * @param $material_id
     * @return mixed
     */
    public function releaseBeforeCheck($material_id,$bom_no = '01')
    {
        $bom_item = DB::table(config('alias.rbi'))
            ->select('id')
            ->where([['material_id',"=",$material_id],['bom_no','=',$bom_no]])
            ->count();
        return $bom_item;
    }


    public function getBomByDrawingCode(&$input){
        if(empty($input['drawing_code'])) TEA('700','drawing_code');
        //1.先查出图片的id
        $drawing_id = DB::table(config('alias.rdr'))->select('id')->where('code',$input['drawing_code'])->limit(0)->value('id');
        $field = [
            'rb.id',
            'rb.code',
            'rb.name',
            'rb.version'
        ];
        $builder = DB::table(config('alias.rb').' as rb')
            ->where('rb.is_version_on',1)
            ->whereExists(function ($query)use($drawing_id){
                $query->select('rbrd.id')->from(config('alias.rbrd').' as rbrd')
                    ->leftJoin(config('alias.rbrb').' as rbrb','rbrb.id','rbrd.bom_routing_base_id')
                    ->where(function ($query)use($drawing_id){
                        $query->where('rbrd.drawing_id',$drawing_id)
                            ->orWhere('rbrd.compoing_drawing_id',$drawing_id);
                    })
                    ->whereRaw('rbrb.bom_id = rb.id');
            });
        $input['total_records'] = $builder->count();
        $builder->select($field)->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rb.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        return $obj_list;
    }

//endregion

//region 增
    /**
     * bom的添加接口
     * @param $input
     * @return mixed
     */
    public function add(&$input)
    {

        $this->checkRules($input);
        $this->checkFormFields($input);
        $bom_tree   = $input['bom_tree'];
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1.物料清单基础资料添加
            $bom_id=$this->addBom($input);

            //2.物料清单项添加
            if(!empty($bom_tree)){
                $result = $this->addBomItem($bom_tree['children'],$bom_id,$input['material_id']);
                //3.更新bom
                if(is_array($result)) $this->updateBom($result,$bom_id);
            }

            //4.保存bom附件
            if(!empty($input['input_ref_arr_attachments'])) $this->saveBomAttachments($input['input_ref_arr_attachments'],$bom_id,$input['creator_id']);
        } catch (\ApiApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $bom_id;




    }

    /**
     * 物料清单基础资料添加
     * @param $input
     * @return mixed
     * @throws \ApiException
     * @throws \App\ApiExceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundApiException
     */
    public function addBom($input)
    {
        //获取入库数组
        $data = [
            'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            'version'=>$input['version'],//版本
            'version_description'=>$input['version_description'],//版本介绍
            'source_version'=>!empty($input['source_version']) ? $input['source_version'] : 0,
            'material_id'=>$input['material_id'],//物料id
            'loss_rate'=>$input['loss_rate'],
            'status'  => isset($input['status'])?$input['status']:0,
            'bom_group_id'=>$input['bom_group_id'],
            'qty'=>$input['qty'],
            'label'=>$input['label'],
            'description'=>$input['description'],
            'creator_id'=>$input['creator_id'],
            'operation_id'=>$input['operation_id'],
            'operation_ability'=>$input['operation_capacity'],
            'company_id'=>(!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0,
            'factory_id'=>(!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'mtime'=>time(),//最后修改时间
            'ctime'=>time(),//创建时间
            //对应sap字段
            'bom_no'=>!empty($input['bom_no']) ? $input['bom_no'] : '',
            'bom_sap_desc'=>!empty($input['bom_sap_desc']) ? $input['bom_sap_desc'] : '',
            'BMEIN'=>!empty($input['BMEIN']) ? $input['BMEIN'] : '',
            'STLAN'=>!empty($input['STLAN']) ? $input['STLAN'] : 0,
            'bom_unit_id'=>!empty($input['bom_unit_id']) ? $input['bom_unit_id'] :0,
        ];
        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        //添加日志
        $events=['action'=>'add', 'desc'=>'添加物料清单['.$input['name'].']基础信息'];
        Trace::save($this->table,$insert_id,$input['creator_id'],$events);
        return $insert_id;
    }
    /**
     * 插入物料子项以及替换物料
     * @param $bom_tree
     * @param $bom_id
     * @param $bom_material_id
     * @return array|bool
     */
    public function addBomItem($bom_tree,$bom_id,$bom_material_id)
    {
        //物料id
        $item_material_ids         = array();
        //替换物料id
        $item_replace_material_ids = array();
        //阶梯数据
        $qtyData = array();
        //替换项
        $replaceData = array();
        $i = 0;
        //遍历前端非空数据
        foreach ($bom_tree as $row){
            //加入子类以及自身的物料id
            $item_material_ids = array_merge($item_material_ids,$row['son_material_id']);
            array_push($item_material_ids,$row['material_id']);
            //插入操作
            $data['bom_id']        = $bom_id;
            $data['parent_id']     = 0;
            $data['material_id']   = $row['material_id'];
            $data['version']       = $row['version'];
            $data['bom_material_id']   = $bom_material_id;
            $data['loss_rate']     = $row['loss_rate'];
            $data['is_assembly']   = $row['is_assembly'];
            $data['bom_no'] = !empty($row['bom_no']) ? $row['bom_no'] : '';
            $data['AENNR'] = !empty($row['AENNR']) ? $row['bom_no'] : 0;
            $data['DATUV'] = !empty($row['DATUV']) ? $row['DATUV'] : 0;
            $data['DATUB'] = !empty($row['DATUB']) ? $row['DATUB'] : 0;
            $data['POSNR'] = !empty($row['POSNR']) ? $row['POSNR'] : '';
            $data['POSTP'] = !empty($row['POSTP']) ? $row['POSTP'] : '';
            $data['MEINS'] = !empty($row['MEINS']) ? $row['MEINS'] : '';
            $data['SORTF'] = !empty($row['SORTF']) ? $row['SORTF'] : '';
            $data['bom_unit_id'] = !empty($row['bom_unit_id']) ? $row['bom_unit_id'] : 0;
            $data['usage_number']  = $row['usage_number'];
            $data['comment']       = $row['comment'];
            $data['total_consume'] = $row['total_consume'];
            $insert_id = DB::table(config('alias.rbi') )->insertGetId($data);
            if (!$insert_id) TEA('802');
            //遍历阶梯数据

            foreach ($row['bom_item_qty_levels']  as $rowQty){
                $qtyData[$i]['bom_item_id'] = $insert_id;
                $qtyData[$i]['parent_min_qty'] = $rowQty['parent_min_qty'];
                $qtyData[$i]['qty'] = $rowQty['qty'];
                $i++;
            }
            //遍历替换物料数据
            foreach ($row['replaces'] as $rowReplace ){
                //加入子类以及自身的物料id
                $item_replace_material_ids = array_merge($item_replace_material_ids,$rowReplace['son_material_id']);
                array_push($item_replace_material_ids,$rowReplace['material_id']);

                //插入操作
                $replaceData['bom_id']        = $bom_id;
                $replaceData['bom_material_id']   = $bom_material_id;
                $replaceData['parent_id']     = $insert_id;
                $replaceData['material_id']   = $rowReplace['material_id'];
                $replaceData['version']       = $rowReplace['version'];
                $replaceData['loss_rate']     = $rowReplace['loss_rate'];
                $replaceData['is_assembly']   = $rowReplace['is_assembly'];
                $replaceData['bom_no'] = !empty($rowReplace['bom_no']) ? $rowReplace['bom_no'] : '';
                $replaceData['AENNR'] = !empty($rowReplace['AENNR']) ? $rowReplace['AENNR'] : 0;
                $replaceData['DATUV'] = !empty($rowReplace['DATUV']) ? $rowReplace['DATUV'] : 0;
                $replaceData['DATUB'] = !empty($rowReplace['DATUB']) ? $rowReplace['DATUB'] : 0;
                $replaceData['POSNR'] = !empty($replaceData['POSNR']) ? $replaceData['POSNR'] : '';
                $replaceData['POSTP'] = !empty($replaceData['POSTP']) ? $replaceData['POSTP'] : '';
                $replaceData['MEINS'] = !empty($replaceData['MEINS']) ? $replaceData['MEINS'] : '';
                $replaceData['SORTF'] = !empty($replaceData['SORTF']) ? $replaceData['SORTF'] : '';
                $replaceData['bom_unit_id'] = !empty($replaceData['bom_unit_id']) ? $replaceData['bom_unit_id'] : 0;
                $replaceData['usage_number']  = $rowReplace['usage_number'];
                $replaceData['comment']       = $rowReplace['comment'];
                $replaceData['total_consume'] = $rowReplace['total_consume'];
                $replace_insert_id = DB::table(config('alias.rbi') )->insertGetId($replaceData);
                if (!$replace_insert_id) TEA('802');
                //遍历阶梯数据
                foreach ($rowReplace['bom_item_qty_levels']  as $rowReplaceQty){
                    $qtyData[$i]['bom_item_id']    = $replace_insert_id;
                    $qtyData[$i]['parent_min_qty'] = $rowReplaceQty['parent_min_qty'];
                    $qtyData[$i]['qty']            = $rowReplaceQty['qty'];
                    $i++;
                }
            }
        }
        if(!empty($qtyData)) DB::table(config('alias.rbiql') )->insert($qtyData);

        if(empty($item_material_ids) && empty($item_replace_material_ids)){
            return false;
        }else{
            return array('item_material_path'=>empty(implode(',',$item_material_ids))?'':','.implode(',',$item_material_ids).',','replace_material_path'=>empty(implode(',',$item_replace_material_ids))?'':','.implode(',',$item_replace_material_ids).',');
        }

    }



    /**
     * 保存bom附件
     * @param $input_attachments
     * @param $material_id
     * @throws ApiException
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function saveBomAttachments($input_attachments,$bom_id,$creator_id)
    {

        //1.获取数据库中已经存在的附件
        $db_ref_obj=DB::table(config('alias.rba'))->where('bom_id',$bom_id)->pluck('comment','attachment_id');
        $db_ref_arr=obj2array($db_ref_obj);
        $db_ids=array_keys($db_ref_arr);
        //2.获取前端传递的附件
        $input_ref_arr=$input_attachments;
        $input_ids=array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况,多字段要考虑编辑的情况额[有的人喜欢先删除所有然后变成全部添加,这种是错误的投机取巧行为,要杜绝!]
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new BomAttachment();

        //4.要添加的
        if(!empty($set['add_set']))  $m->addSet($set['add_set'],$bom_id,$input_ref_arr,$creator_id);
        //5.要删除
        if(!empty($set['del_set']))  $m->delSet($set['del_set'],$bom_id,$db_ref_arr,$creator_id);
        //6.可能要编辑的
        if(!empty($set['common_set']))  $m->commonSet($set['common_set'],$bom_id,$db_ref_arr,$input_ref_arr,$creator_id);


    }


//endregion

//region 改


    public function changeAssembly($input)
    {
        if(!isset($input['bom_item_id'])) TEA('700');
        $result = DB::table(config('alias.rbi'))
            ->where('id', $input['bom_item_id'])
            ->update(['is_assembly'=>1]);
        if($result===false) TEA('806');
    }

    /**
     * @param $input
     * @return mixed
     * @throws \ApiException
     * @throws \App\ApiExceptions\ApiException
     */
    public function update(&$input)
    {
        //判断是否升级 是的话 直接进入add方法
        if($input['is_upgrade'] == 1){
            $bom_new_id = $this->upgradeBom($input);
            return $bom_new_id;
        }
        //校验
        $this->checkRules($input);
        $bom_tree        = $input['bom_tree'];
        $data = [
            //'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            //'version'=>$input['version'],//版本
            //'version_description'=>$input['version_description'],//版本介绍
            'material_id'=>$input['material_id'],//物料id
            'operation_id'=>$input['operation_id'],//物料id
            'operation_ability'=>$input['operation_capacity'],
            'loss_rate'=>$input['loss_rate'],
            'label'=>$input['label'],
            'bom_group_id'=>$input['bom_group_id'],
            'qty'=>$input['qty'],
            'description'=>$input['description'],
            'mtime'=>time(),//最后修改时间
            //对应sap字段
            'bom_no'=>$input['bom_no'],
            'bom_sap_desc'=>$input['bom_sap_desc'],
            'BMEIN'=>$input['BMEIN'],
            'STLAN'=>$input['STLAN'],
        ];
        $this->checkFormFields($input);
//        $tmp = DB::table($this->table)
//            ->where('id', $input['bom_id'])
//            ->first();

//        $bom_really_tree = $this->getBomTree($input['material_id'],$tmp->version,false,false,false,$input['bom_no']);
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1.物料清单基础资料更新
//            $this->doCheck($input,'master','update',$input['bom_id'],$input['creator_id']);
            $this->updateBom($data,$input['bom_id']);
            //2.更新子项内容
//            $this->check($bom_tree['children'],obj2array($bom_really_tree->children),$input);
            $this->saveBomItem($input['bom_id'],$bom_tree['children'],$input['material_id']);
            //3.保存附件
            $this->saveBomAttachments($input['input_ref_arr_attachments'],$input['bom_id'],$input['creator_id']);
            //4.删除缓存
//            $cache_key = make_redis_key(['bom_detail',$input['bom_id']]);
//            Cache::forget($cache_key);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return null;
    }

    public function saveBomItem($bom_id,$input_items,$bom_material_id){
        $db_bom_items = DB::table(config('alias.rbi'))->where([['bom_id','=',$bom_id],['parent_id','=',0]])->get();
        $db_bom_items = obj2array($db_bom_items);
        $db_ref_bom_items = [];
        foreach ($db_bom_items as $k=>$v){
            if(empty($v)) continue;
            $db_ref_bom_items[$v['material_id'].'-'.$v['POSNR']] = $v;
        }
        $input_ref_items = [];
        foreach ($input_items as $k=>$v){
            if(empty($v)) continue;
            $input_ref_items[$v['material_id'].'-'.$v['POSNR']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input_ref_items),array_keys($db_ref_bom_items));
//        if(!empty($set['add_set'])){ //因为子项都是sap传来的，所以添加就不用了
//            $add_data = [];
//            foreach ($set['add_set'] as $k=>$v){
//                $add_data[] = [
//                    'bom_id'=>$bom_id,
//                    'parent_id'=>0,
//                    'bom_material_id'=>$bom_material_id,
//                    'material_id'=>$input_ref_items[$v]['material_id'],
//                    'loss_rate'=>$input_ref_items[$v]['loss_rate'],
//                    'is_assembly'=>$input_ref_items[$v]['is_assembly'],
//                    'comment'=>$input_ref_items[$v]['comment'],
//                    'version'=>$input_ref_items[$v]['version'],
//                    'usage_number'=>$input_ref_items[$v]['usage_number'],
//                    'POSNR'=>$input_ref_items[$v]['POSNR'],
//                    'POSTP'=>$input_ref_items[$v]['POSTP'],
//                    'MEINS'=>$input_ref_items[$v]['MEINS'],
//                    'bom_unit_id'=>$input_ref_items[$v]['bom_unit_id'],
//                    'bom_no'=>$input_ref_items[$v]['bom_no'],
//                    'AENNR'=>$input_ref_items[$v]['AENNR'],
//                    'DATUV'=>$input_ref_items[$v]['DATUV'],
//                    'DATUB'=>$input_ref_items[$v]['DATUB'],
//                ];
//            }
//        }
        if(!empty($set['del_set'])){
            $del_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $db_ref_bom_items[$v]['id'];
            }
            if(!empty($del_data)) DB::table(config('alias.rbi'))->whereIn('id',$del_data)->delete();
        }
        if(!empty($set['common_set'])){
            foreach ($set['common_set'] as $k=>$v){
                if(empty($v)) continue;
                $change = [];
                if($input_ref_items[$v]['bom_no'] != $db_ref_bom_items[$v]['bom_no']) $change['bom_no'] = $input_ref_items[$v]['bom_no'];
                if($input_ref_items[$v]['is_assembly'] != $db_ref_bom_items[$v]['is_assembly']) $change['is_assembly'] = $input_ref_items[$v]['is_assembly'];
                if($input_ref_items[$v]['loss_rate'] != $db_ref_bom_items[$v]['loss_rate']) $change['loss_rate'] = $input_ref_items[$v]['loss_rate'];
                if($input_ref_items[$v]['is_assembly'] != $db_ref_bom_items[$v]['is_assembly']) $change['is_assembly'] = $input_ref_items[$v]['is_assembly'];
                if($input_ref_items[$v]['usage_number'] != $db_ref_bom_items[$v]['usage_number']) $change['usage_number'] = $input_ref_items[$v]['usage_number'];
                if($input_ref_items[$v]['comment'] != $db_ref_bom_items[$v]['comment']) $change['comment'] = $input_ref_items[$v]['comment'];
                if($input_ref_items[$v]['version'] != $db_ref_bom_items[$v]['version']) $change['version'] = $input_ref_items[$v]['version'];
                if($input_ref_items[$v]['total_consume'] != $db_ref_bom_items[$v]['total_consume']) $change['total_consume'] = $input_ref_items[$v]['total_consume'];
                if($input_ref_items[$v]['bom_unit_id'] != $db_ref_bom_items[$v]['bom_unit_id']) $change['bom_unit_id'] = $input_ref_items[$v]['bom_unit_id'];
                if(!empty($change)) DB::table(config('alias.rbi'))->where('id',$db_ref_bom_items[$v]['id'])->update($change);
            }
        }
    }

    /**
     * bom升级
     * @param $input
     * @return mixed
     * @throws \App\ApiExceptions\ApiExcepiton
     */
    public function upgradeBom($input){
        $bom = DB::table($this->table)
            ->where([['material_id','=',$input['material_id']],['bom_no','=',$input['bom_no']]])
            ->orderBy('version','DESC')
            ->limit(1)
            ->first();
        $input['version']             = $bom->version+1;
        $input['status']              = $bom->status;
        $input['source_version']      = $bom->version;
        $bomRoutingDao = new BomRouting();
        try{
            DB::connection()->beginTransaction();
            $bom_new_id = $this->add($input);
            //1.保存老bom当前编辑的工艺路线信息
            if(!empty($input['current_routing_info']['routing_info'] && !empty($input['current_routing_info']['routing_id']))){
                $routing_data = [
                    'bom_id'=>$bom_new_id,
                    'routing_info'=>$input['current_routing_info']['routing_info'],
                    'routing_id'=>$input['current_routing_info']['routing_id'],
                    'routings'=>'[{"routing_id":'.$input['current_routing_info']['routing_id'].',"is_default":'.$input['current_routing_info']['is_default'].',"factory_id":'.$input['current_routing_info']['factory_id'].'}]',
                    'is_upgrade'=>1,
                    'version'=>$input['version'],
                    'version_description'=>$input['version_description'],
                    'control_info'=>$input['current_routing_info']['control_info']
                ];
                $bomRoutingDao->checkBomRoutingFormField($routing_data);
                $bomRoutingDao->saveBomRoutingInfo($routing_data);
            }
            //2.复制除当前编辑以外老bom的工艺路线
            $bomRoutingDao->addBomRoutingByUpgrade($bom_new_id,$input['bom_id'],$input['current_routing_info']['routing_id'],$input['version'],$input['version_description']);
        }catch (\ApiException $ApiException){
            DB::connection()->rollback();
            TEA($ApiException->getCode());
        }
        DB::connection()->commit();
        return $bom_new_id;
    }

    /**
     * 更新物料id路径
     * @param $data
     * @param $bom_id
     */
    public function updateBom($data,$bom_id)
    {
        $result = DB::table($this->table)
            ->where('id', $bom_id)
            ->update($data);
        if($result===false) TEA('806');
    }

    /**
     * 更新物料清单item
     * @param $data
     * @param $bom_item_id
     */
    public function updateBomItem($data,$bom_item_id)
    {
        $result = DB::table(config('alias.rbi'))
            ->where('id', $bom_item_id)
            ->update($data);
        if($result===false) TEA('806');
    }

    /**
     * 更新一条物料清单
     * @param $data
     * @param $bom_item_qty_id
     */
    public function updateBomQty($data,$bom_item_qty_id){
        $result = DB::table(config('alias.rbiql'))
            ->where('id', $bom_item_qty_id)
            ->update($data);
        if($result===false) TEA('806');
    }


    /**
     * 修改状态
     * @param $input
     */
    public function changeStatus($input)
    {
        $this->checkRules($input);
        //$creator_id = $this->getUserFieldByCookie($input['cookie'],'id');
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        if($input['status'] !='0' && $input['status'] !='1'){
            TEA('2108');
        }
        switch ($input['type']){
            case "active":
                $this->active($input['bom_id'],$input['status'],$creator_id);
                break;
            case "release":
                $this->release($input['bom_id'],$input['status'],$creator_id);
                break;
            default:
                TEA('2109');
                break;
        }
    }

    public function active($bom_id,$status,$creator_id)
    {
        if($status == 1){
            $word = "激活";
        }else{
            $word = "冻结";
        }
        $bom = DB::table(config('alias.rb') )->where('id',"=",$bom_id)->first();
        $result = DB::table(config('alias.rb'))
            ->where('material_id', $bom->material_id)
            ->update(array('status'=>$status));
        $events=[
            'field'=>'bom_id',
            'comment'=>'激活状态',
            'action'=>'update',
            'desc'=>'修改状态为'.$word,
        ];
        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
        if($result===false) TEA('806');

    }

    /**
     * 发布
     * @param $bom_id
     * @param $status
     * @param $creator_id
     * @throws \App\ApiExceptions\ApiApiException
     * @throws \ApiException
     */
    public function release($bom_id,$status,$creator_id)
    {
        if($status == 1){
            $word = "修改当前版本为发布状态";
        }else{
            $word = "修改当前版本为取消发布状态";
        }
        $bom = DB::table(config('alias.rb') )->where('id',"=",$bom_id)->first();
        //将所有版本的状态改为未发布
        $result = DB::table(config('alias.rb'))
            ->where([['material_id','=',$bom->material_id],['bom_no','=',$bom->bom_no]])
//                ->where([['material_id','=',$bom->material_id]])
            ->update(array('is_version_on'=>0));
        if($result===false) TEA('806');
        try {
            //开启事务
            DB::connection()->beginTransaction();

            //将当前版本改为发布
            $result = DB::table(config('alias.rb'))
                ->where('id', $bom_id)
                ->update(['is_version_on'=>$status,'was_release'=>1,'ptime'=>time()]);
            if($result===false) TEA('806');

            //将所有被用到的更新版本
            $count = DB::table(config('alias.rbi'))
                ->where([['material_id','=',$bom->material_id],['bom_no','=',$bom->bom_no]])
                ->count();
            if($count >0){
                $result = DB::table(config('alias.rbi'))
                    ->where([['material_id','=',$bom->material_id],['bom_no','=',$bom->bom_no]])
//                    ->where([['material_id','=',$bom->material_id]])
                    ->update(array('version'=>$bom->version));
                if($result===false) TEA('806');
            }
            //添加发布记录通知ie维护工时
            $rbrr_data = [
                'bom_id'=>$bom_id,
                'ctime'=>time(),
                'cid'=>$creator_id,
            ];
            $rmrr_res = DB::table(config('alias.rbrr'))->insert($rbrr_data);
            if(!$rmrr_res) TEA('802');

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        $events=[
            'field'=>'bom_id',
            'comment'=>'激活状态',
            'action'=>'update',
            'desc'=>$word,
        ];
        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
        return ;

    }

//endregion

//region 删
    /**
     * 整体树的删除
     * @param $tree
     */
    public function deleteBomItem($tree)
    {
        foreach ($tree as $row){
            $replaceIds  =  array();
            $qtyIds      =  array();
            DB::table(config('alias.rbi') )->where('id',"=",$row['bom_item_id'])->delete();
            foreach ($row['replaces'] as $replaceRow){
                $replaceIds[] = $replaceRow['bom_item_id'];
            }
            foreach ($row['bom_item_qty_levels'] as $qtyRow){
                $qtyIds[] = $qtyRow['bom_item_qty_level_id'];
            }
            if(!empty($replaceIds)){
                DB::table(config('alias.rbi') )->whereIn('id', $replaceIds)->delete();
            }
            if(!empty($qtyIds)){
                DB::table(config('alias.rbiql') )->whereIn('id', $qtyIds)->delete();
            }
        }
    }

    /**
     * 删除具体的替换物料
     * @param $data
     */
    public function deleteBomReplace($data)
    {
        foreach ($data as $row){
            DB::table(config('alias.rbi') )->where('id',"=",$row['bom_item_id'])->delete();
            foreach ($row['bom_item_qty_levels'] as $qtyRow){
                $qtyIds[] = $qtyRow['bom_item_qty_level_id'];
            }
            if(!empty($qtyIds)){
                DB::table(config('alias.rbiql') )->whereIn('id', $qtyIds)->delete();
            }
        }
    }

    /**
     * 删除具体的阶梯用量
     * @param $data
     */
    public function deleteBomQty($data)
    {
        foreach ($data as $qtyRow){
            $qtyIds[] = $qtyRow['bom_item_qty_level_id'];
        }
        if(!empty($qtyIds)){
            DB::table(config('alias.rbiql') )->whereIn('id', $qtyIds)->delete();
        }
    }

    /**
     * bom删除
     * @param $id
     */
    public function destroy($id)
    {
        $bom = DB::table(config('alias.rb') )->where('id',"=",$id)->first();
        $material_id = $bom->material_id;
        $num = DB::table(config('alias.rb') )->where('material_id',"=",$material_id)->count();
        if($num >1){
            TEA('2107');
        }
        $has = DB::table(config('alias.rbi') )->where('material_id',"=",$material_id)->first();
        if(!empty($has)){
            TEA('2106');
        }
        try {
            DB::connection()->beginTransaction();
            $items  = array();
            //删除bom
            DB::table(config('alias.rb') )->where('id',"=",$id)->delete();
            //找出bom_item
            $bom_items = DB::table(config('alias.rbi') )->where('bom_id',"=",$bom->id)->get();
            //删除bom_item
            DB::table(config('alias.rbi') )->where('bom_id',"=",$bom->id)->delete();
            //删除阶梯用量
            foreach ($bom_items as $bom_item){
                $items[] = $bom_item->id;
            }
            if(!empty($items)){
                DB::table(config('alias.rbiql') )->whereIN('bom_item_id',$items)->delete();
            }
            //删除工艺路线
            $bomRoutingDao = new BomRouting();
            //先找出bom的工艺路线
            $routing_ids = DB::table(config('alias.rbr'))->where('bom_id',$id)->pluck('routing_id');
            foreach ($routing_ids as $k=>$v){
                $bomRoutingDao->deleteBomRouting($id,$v);
            }

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();


    }





//endregion

//region 额外

    /**
     * 对比
     * @param $bom_tree
     * @param $real_tree
     * @param $input
     */
    public function check($bom_tree,$real_tree,&$input)
    {
        $bomTree = new CheckBomItem($bom_tree,$real_tree);
        // ITEM: 删除项
        if(!empty($bomTree->delete)){
            $this->deleteBomItem($bomTree->delete);
            $this->doCheck($bomTree,'item','delete',$input['bom_id'],$input['creator_id']);
        }

        // ITEM: 更新并检验 项中的 除阶梯用量和替换物料的内容
        if(!empty($bomTree->update)){
            foreach ($bomTree->update as $key=>$value){
                foreach ($value as $k=>$v){
                    $update_data[$k] = $bomTree->deal[$key][$k];
                }
                if(!empty($update_data)) $this->updateBomItem($update_data,$bomTree->deal[$key]['bom_item_id']);
            }
            $this->doCheck($bomTree,'item','update',$input['bom_id'],$input['creator_id']);

        }

        // ITEM: 添加新增项 包括阶梯用量和替换物料
        if(!empty($bomTree->add)){
            $this->addBomItem($bomTree->add,$input['bom_id'],$input['material_id']);
            $this->doCheck($bomTree,'item','add',$input['bom_id'],$input['creator_id']);
        }




        // REPLACE: 删除替换物料
        if(!empty($bomTree->replace_delete)){
            foreach ($bom_tree->replace_delete as $row){
                $this->deleteBomReplace($row);
            }

            $this->doCheck($bomTree,'replace','delete',$input['bom_id'],$input['creator_id']);

        }
        // REPLACE: 更新替换物料
        if(!empty($bomTree->replace_update)){
            foreach ($bomTree->replace_update as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $k1=>$v2){
                        $update_replace_data[$k1] = $bomTree->deal[$key]['replaces'][$k][$k1];
                    }
                    if(!empty($update_replace_data)) $this->updateBomItem($update_replace_data,$bomTree->deal[$key]['replaces'][$k]['bom_item_id']);
                }
            }
            $this->doCheck($bomTree,'replace','update',$input['bom_id'],$input['creator_id']);
        }

        // REPLACE: 新增和检验 替换物料
        if(!empty($bomTree->replace_add)){
            $i = 0;
            foreach ($bomTree->replace_add as $key=>$value) {
                foreach ($value as $row) {
                    $add_replace_data = [
                        'material_id' => $row['material_id'],//bom编码
                        'loss_rate' => $row['loss_rate'],//名称
                        'is_assembly' => $row['is_assembly'],//版本
                        'usage_number' => $row['usage_number'],//版本介绍
                        'comment' => $row['comment'],
                        'version' => $row['version'],
                        'total_consume' => $row['total_consume'],
                        'parent_id' => $row['parent_id'],
                        'bom_material_id' => $row['bom_material_id'],
                        'bom_id' => $row['bom_id'],
                    ];
                    $tmp_insert_id = DB::table(config('alias.rbi'))->insertGetId($add_replace_data);
                    foreach ($row['bom_item_qty_levels'] as $qty_row) {
                        $qty_data[$i]['parent_min_qty'] = $qty_row['parent_min_qty'];
                        $qty_data[$i]['qty'] = $qty_row['qty'];
                        $qty_data[$i]['bom_item_id'] = $tmp_insert_id;
                        $i++;
                    }
                }
                if (!empty($qty_data)) DB::table(config('alias.rbiql'))->insert($qty_data);
            }
            $this->doCheck($bomTree,'replace','add',$input['bom_id'],$input['creator_id']);

        }

        // QTY :删除替换物料
        if(!empty($bomTree->qty_delete)){
            foreach ($bomTree->qty_delete as $key => $value){
                $this->deleteBomQty($value);
            }
            $this->doCheck($bomTree,'qty','delete',$input['bom_id'],$input['creator_id']);

        }

        //QTY :更新
        if(!empty($bomTree->qty_update)){
            foreach ($bomTree->qty_update as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $k1=>$v1){
                        $update_qty_data[$k1] = $bomTree->deal[$key]['bom_item_qty_levels'][$k][$k1];
                    }
                    if(!empty($update_qty_data))
                        $this->updateBomQty($update_qty_data,$k);
                    unset($update_qty_data);
                }
            }
            $this->doCheck($bomTree,'qty','update',$input['bom_id'],$input['creator_id']);
        }

        // QTY: 替换物料的新增
        if(!empty($bomTree->qty_add)){
            foreach ($bomTree->qty_add as $key=>$value){
                foreach ($value as $row){
                    $add_qty_data[] = [
                        'bom_item_id'=>$row['bom_item_id'],//bom编码
                        'parent_min_qty'=>$row['parent_min_qty'],//名称
                        'qty'=>$row['qty'],//版本

                    ];
                }
                if(!empty($add_qty_data))
                DB::table(config('alias.rbiql') )->insert($add_qty_data);
                unset($add_qty_data);
            }
            $this->doCheck($bomTree,'qty','add',$input['bom_id'],$input['creator_id']);
        }


        //REPLACE_QTY: 删除
        if(!empty($bomTree->replace_qty_delete)){
            foreach ($bomTree->replace_qty_delete as $key=>$value){
              foreach ($value as $k=>$v){
                  $this->deleteBomQty($v);
              }
            }
            $this->doCheck($bomTree,'replace_qty','delete',$input['bom_id'],$input['creator_id']);
        }

        //REPLACE_QTY:  更新
        if(!empty($bomTree->replace_qty_update)){
            foreach ($bomTree->replace_qty_update as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $k1=>$v1){
                        foreach ($v1 as $k2 =>$v2){
                            $update_qty_data[$k2] = $bomTree->deal[$key]['replaces'][$k]['bom_item_qty_levels'][$k1][$k2];
                        }
                        if(!empty($update_qty_data))
                            $this->updateBomQty($update_qty_data,$k1);
                        unset($update_qty_data);
                    }
                }
            }
            $this->doCheck($bomTree,'replace_qty','update',$input['bom_id'],$input['creator_id']);
        }

        // REPLACE_QTY: 新增
        if(!empty($bomTree->replace_qty_add)){
            foreach ($bomTree->replace_qty_add  as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $row){
                        $add_qty_data[] = [
                            'bom_item_id'=>$row['bom_item_id'],//bom编码
                            'parent_min_qty'=>$row['parent_min_qty'],//名称
                            'qty'=>$row['qty'],//版本

                        ];
                    }
                    if(!empty($add_qty_data)) DB::table(config('alias.rbiql') )->insert($add_qty_data);
                    unset($add_qty_data);
                }
            }
            $this->doCheck($bomTree,'replace_qty','add',$input['bom_id'],$input['creator_id']);
        }

        //TODO 缓存redis
        $update_route = array('item_material_path'=>$bomTree->item_material_path,'replace_material_path'=>$bomTree->replace_material_path);
        $this->updateBom($update_route,$input['bom_id']);
    }

    /**
     * @param $data
     * @param $type
     * @param $way
     * @param int $bom_id
     * @param int $creator_id
     */
    public function doCheck($data,$type,$way,$bom_id,$creator_id)
    {
        switch ($type){
            case 'master':
                $fields = ['name','bom_group_id','qty','loss_rate','description','label'];
                $bom    =  DB::table(config('alias.rb'))->where('id','=',$data['bom_id'])->first();
                foreach ($fields as $row){
                    if($data[$row] != $bom->$row){
                        if($row == 'bom_group_id'){
                            if($bom->$row == 0){
                                $group_old = new \stdClass();
                                $group_old->name = '""';
                            }else{
                                $group_old = DB::table(config('alias.rbg'))->select('name')->where('id','=',$bom->$row)->first();
                            }
                            if($data[$row] == 0){
                                $group_new = new \stdClass();
                                $group_new->name = '""';
                            }else{
                                $group_new = DB::table(config('alias.rbg'))->select('name')->where('id','=',$data[$row])->first();
                            }


                            $data[$row] = $group_new->name;
                            $bom->$row  = $group_old->name;
                        }
                        $events=[
                            'field'=>'bom_id',
                            'comment'=>'基础资料',
                            'action'=>$way,
                            'desc'=>$this->getDesc($way,[$row=>'['.$bom->$row.']变为['.$data[$row].']'],$type),
                        ];
                        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
                    }
                }
                break;
            case 'item':
                $element = $way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        $item_no = $way=='update'?$data->deal[$key]['item_no']:$data->$element[$key]['item_no'];
                        $events=[
                            'field'=>'bom_id',
                            'comment'=>'项',
                            'action'=>$way,
                            'desc'=>$this->getDesc($way,$value,$type,['item_no'=>$item_no]),
                        ];
                        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);

                    }
                }
                break;
            case 'qty':
                $element = $type.'_'.$way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        foreach ($value as $k=>$v){
                            $events=[
                                'field'=>'bom_id',
                                'comment'=>'阶梯用量',
                                'action'=>$way,
                                'desc'=>$this->getDesc($way,$v,$type,['item_no'=>$data->deal[$key]['item_no']]),
                            ];
                            Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
                        }
                    }
                }
                break;
            case 'replace':
                $element = $type.'_'.$way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        foreach ($value as $k=>$v){
                            $events=[
                                'field'=>'bom_id',
                                'comment'=>'替换物料',
                                'action'=>$way,
                                'desc'=>$this->getDesc($way,$v,$type,['item_no'=>$data->deal[$key]['item_no'],'replace_item_no'=>$data->deal[$key]['replaces'][$k]['item_no']]),
                            ];
                            Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
                        }
                    }
                }
                break;
            case 'replace_qty':
                $element = $type.'_'.$way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        foreach ($value as $k=>$v){
                            foreach ($v as $k1=>$v1){
                                $events=[
                                    'field'=>'bom_id',
                                    'comment'=>'替换物料',
                                    'action'=>$way,
                                    'desc'=>$this->getDesc($way,$v,$type,['item_no'=>$data->deal[$key]['item_no'],'replace_item_no'=>$data->deal[$key]['replaces'][$k]['item_no']]),
                                ];
                                Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);

                            }

                        }
                    }
                }
                break;
        }
    }



    public function getDesc($way,$value,$type = '',$extra = array())
    {
        $config = config('dictionary');
        $desc = '';
        switch ($type){
            case 'master':
                foreach ($value as $k=>$v){
                    $desc = "将基础信息 ".$config[$type][$k]."的值由".$v;
                }
                break;
            case 'item':
                $tmp = '';
                if($way == 'update'){
                    foreach ($value as $k=>$v){
                        $tmp = $tmp." ".$config[$type][$k]."的值由".$v;
                    }
                }
                $desc = "项中物料编码为".$extra['item_no']." ".$tmp;
                break;
            case 'qty':
                $tmp = '';
                foreach ($value as $k=>$v){
                    if(array_key_exists($k,$config[$type])){
                        if($way == 'update'){
                            $tmp = $tmp." ".$config[$type][$k]."的值由".$v;
                        }else{
                            $tmp = $tmp." ".$config[$type][$k]."的值 [".$v."]";
                        }

                    }
                }
                $desc = "项中物料编码为".$extra['item_no']."的阶梯用量 ".$tmp;
                break;
            case 'replace':
                $tmp = '';
                if($way == 'update'){
                    foreach ($value as $k=>$v){
                        $tmp = $tmp." ".$config[$type][$k]."的值由".$v;
                    }
                }
                $desc = "项中物料编码为".$extra['item_no']."的替换物料".$extra['replace_item_no']." ".$tmp;
                break;
            case 'replace_qty':
                $tmp = '';
                foreach ($value as $k=>$v){
                    foreach ($v as $k1 => $v1){
                        if(array_key_exists($k1,$config[$type])){
                            $tmp = $tmp." ".$config[$type][$k1]."的值".$v1;
                        }
                    }
                }
                $desc = "项中物料编码为".$extra['item_no']."的替换物料".$extra['replace_item_no']."的阶梯用量 ".$tmp;
                break;
            case 'attach':
                $tmp = '';
                if($way == 'update'){
                    $tmp =  "描述的值由 ".$value['comment'];
                }
                $desc = "附件[".$value['name']."] ".$tmp;
                break;
            default:
                $desc = "";
        }


        return $desc;
    }


//endregion

    public function getAllBomTree($input)
    {
        if(!isset($input['bom_id_batch']) || empty($input['bom_id_batch']))
        {
            TEPA('bom_id未知');
        }
        $bom_id_batch = explode(',',$input['bom_id_batch']);
        $obj = DB::table(config('alias.rb').' as rb')
            ->select('rb.*')
            ->whereIn('rb.id',$bom_id_batch)
            ->where('status',1)
            ->get();
        $obj_list = [];
        if($obj)
        {
            foreach ($obj as $k =>$v)
            {
                $obj_list[$k]['bom'] = $v;
                $obj_list[$k]['bom_tree'] = $this->getBomTree($v->material_id,$v->version,false,false,false,$v->bom_no);
            }
        }
        return $obj_list;
    }

    public function getAllBomInmaterial($input)
    {
        $BomRouting = new BomRouting();
        if(!isset($input['bom_code_batch']) || empty($input['bom_code_batch']))
        {
            TEA(700,'code');
        }
        $bom_code_batch = explode(',',$input['bom_code_batch']);

        //1.获取可用状态bom基础信息
        $bom_obj = DB::table(config('alias.rb').' as rb')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
            ->select('rb.*','rm.item_no','rb.material_id')
            ->whereIn('rb.code',$bom_code_batch)
            ->where(['rb.status'=>1,'rb.is_version_on'=>1])
            ->get();
        if(!$bom_obj) TEPA('获取bom基础信息失败');
        //1.批量获取bom所有的工艺路线
        foreach ($bom_obj as $k=>&$v)
        {
            $bom_routing = $BomRouting->getBomAllRoutingByMaterialIdNew($v->material_id);
            if($bom_routing)
            {
                foreach ($bom_routing as $kk=>&$vv)
                {
                    $rbrb_obj = DB::table(config('alias.rbrb').' as rbrb')
                        ->select('rbrb.*')
                        ->where(['rbrb.routing_id'=>$vv->routing_id,'rbrb.bom_id'=>$v->id])
                        ->first();
                    $rbroc_obj = DB::table(config('alias.rbroc').' as rbroc')
                        ->select('rbroc.*')
                        ->where(['rbroc.routing_id'=>$vv->routing_id,'rbroc.bom_id'=>$v->id])
                        ->first();
                    $control_info = [
                        'id' => $rbroc_obj->id,
                        'bom_id' => $rbroc_obj->bom_id,
                        'routing_id' => $rbroc_obj->routing_id,
                        'operation_id' => $rbrb_obj->operation_id,
                        'control_code' => $rbroc_obj->control_code,
                        'routing_node_id' => $rbroc_obj->routing_node_id,
                        'base_qty' => $rbroc_obj->base_qty,
                        'is_split' => $rbroc_obj->is_split,
                        'max_split_point' => $rbroc_obj->max_split_point,
                        'curing_time' =>  $rbroc_obj->curing_time
                    ];
                    $vv->control_info = $control_info;
                }
            }

            $v->bom_routing = $bom_routing;
            $v->bom_tree = $this->getBomTree($v->material_id,$v->version,false,false,false);
        }

        return $bom_obj;
    }

    public function upgradeBomBatch($input){
        $bom = DB::table($this->table)
            ->where([['material_id','=',$input['material_id']],['bom_no','=',$input['bom_no']]])
            ->orderBy('version','DESC')
            ->limit(1)
            ->first();
        $input['version']             = $bom->version+1;
        $input['status']              = $bom->status;
        $input['source_version']      = $bom->version;
        $bomRoutingDao = new BomRouting();
        try{
            DB::connection()->beginTransaction();
            $bom_new_id = $this->add($input);
            //保存bom当前编辑的工艺路线信息

            if(!empty($input['current_routing_info']))
            {
                foreach ($input['current_routing_info'] as $k=>$v)
                {
                    if(!empty($v['routing_info'] && !empty($v['routing_id']))){
                        $routing_data = [
                            'bom_id'=>$bom_new_id,
                            'routing_info'=>$v['routing_info'],
                            'routing_id'=>$v['routing_id'],
                            'routings'=>'[{"routing_id":'.$v['routing_id'].',"is_default":'.$v['is_default'].',"factory_id":'.$v['factory_id'].'}]',
                            'is_upgrade'=>1,
                            'version'=>$input['version'],
                            'version_description'=>$input['version_description'],
                            'control_info'=>$v['control_info']
                        ];
                        $bomRoutingDao->checkBomRoutingFormField($routing_data);
                        $bomRoutingDao->saveBomRoutingInfo($routing_data);
                    }
                }

            }
        }catch (\ApiException $ApiException){
            DB::connection()->rollback();
            TEA($ApiException->getCode());
        }
        DB::connection()->commit();
        return $bom_new_id;
    }

    public function setBomBase($input)
    {
        $is_base = $input['is_base'];//是否基础款 0-不是 1-是
        $bom_obj = DB::table('ruis_bom')->where(['id'=>$input['bom_id']])->first();
        DB::table('ruis_bom')->where(['material_id'=>$bom_obj->material_id,'version'=>1,'bom_no'=>$bom_obj->bom_no])->update(['is_base'=>$is_base]);
    }


    /**
     *  hao.li 待维护工时列表数据
     */
     public function getBomWaitList($input){
         $where=array();
         if (isset($input['bom_code'])  && $input['bom_code']!='' ) {//物料清单编码
            $input['bom_code']=trim($input['bom_code']);
            $where[]=['rb.code','like','%'.$input['bom_code'].'%'];
        }
        $builder = DB::table(config('alias.rbrr').' as rbrr')
            ->leftJoin(config('alias.rb').' as rb','rb.id','rbrr.bom_id')
            ->leftJoin(config('alias.rrad').' as rrad','rbrr.cid','rrad.id')
            ->select(
                'rrad.name as admin_name',
                'rb.code as bom_code',
                'rb.version',
                'rb.name as bom_name',
                'rb.id as bom_id',
                'rb.description',
                'rb.bom_no as bom_no',
                'rbrr.ctime',
                'rbrr.id as release_record_id'
            )
            ->where('rbrr.status',1)
            ->where($where)
            ->where('rbrr.ctime','>','1576511999')
            ->orderBy('rbrr.ctime','desc');
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        $obj_list=$builder->get();
        foreach ($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        $obj_list->total_records=$builder->count();
        return $obj_list;
    }

    /**
     *  hao.li 待维护工时列表导出
     */
     public function exportBomWait($input){
        $where=array();
        if (isset($input['bom_code'])  && $input['bom_code']!='' ) {//物料清单编码
           $input['bom_code']=trim($input['bom_code']);
           $where[]=['rb.code','like','%'.$input['bom_code'].'%'];
        }
         $obj_list = DB::table(config('alias.rbrr').' as rbrr')
            ->leftJoin(config('alias.rb').' as rb','rb.id','rbrr.bom_id')
            ->leftJoin(config('alias.rrad').' as rrad','rbrr.cid','rrad.id')
            ->select(
                'rrad.name as admin_name',
                'rb.code as bom_code',
                'rb.version',
                'rb.name as bom_name',
                'rb.id as bom_id',
                'rb.description',
                'rb.bom_no as bom_no',
                'rbrr.ctime',
                'rbrr.id as release_record_id'
            )
            ->where('rbrr.status',1)
            ->where($where)
            ->where('rbrr.ctime','>','1576511999')
            ->orderBy('rbrr.ctime')
            ->get();
            foreach ($obj_list as $k=>&$v){
                $v->ctime = date('Y-m-d H:i:s',$v->ctime);
            }
        $headerName=[
                        ['物料清单编码','名称','生产版本','创建时间']
                    ];
            
                    foreach ($obj_list as $key => $value) {
                        $headerName[]=[
                            $value->bom_code,$value->bom_name,$value->version,$value->ctime
                        ];
                    }
                    $fileName='待维护工时表'.date('Y-m-d H:i:s',time());
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

     //检查表格中是否有相同的物料和SAP行项
     public function checkExcel($data){
         \set_time_limit(0);
        $k=0;
        $excel=[];
        for($i=1;$i<count($data);$i++){
            if(empty($data[$i]['materialCode'])) continue;
            for($j=$i+1;$j<=count($data);$j++){
                if($data[$i]['materialCode']==$data[$j]['materialCode'] && $data[$i]['operation']==$data[$j]['operation']){
                    $excel[$k]['materialCode']=$data[$i]['materialCode'];
                    $excel[$k]['factory']=$data[$i]['factory'];
                    $excel[$k]['operation']=$data[$i]['operation'];
                    $k++;
                }
            }
        }
        if(!empty($excel)){
            $string='';
            foreach($excel as $k=>$v){
                $string=$string.'['.$v['materialCode'].','.$v['factory'].','.$v['operation'].']'.',';
            }
            TEPA('表格中以下物料编码的工序行号相同：'.$string.'请检查表格！');
        } 
        return $excel; 
     }

     //检查物料与工作中心是否匹配
    public function checkWorkcenter($data){
        \set_time_limit(0);
        $workCenterList=[];
        $workCenter=[];
        $i=0;
        $bom=[];
        $j=0;
        $factory=[];
        $k=0;
        $routing=[];
        $m=0;
        $operation=[];
        $n=0;
        $base=[];
        $a=0;
        $oldCenter=[];
        $b=0;
        foreach ($data as $key => $value) {
            if(empty($value['materialCode'])) continue;
            //bom id
            $bom_id=DB::table('ruis_bom')->select('id')->where([['code',$value['materialCode']],['is_version_on',1]])->first();
            if(empty($bom_id->id)){
                $bom[$j]['materialCode']=$value['materialCode'];
                $bom[$j]['factory']=$value['factory'];
                $bom[$j]['operation']=$value['operation'];
                $bom[$j]['oldCenter']=$value['oldCenter'];
                $j++;
            }
            //工厂ID
            $factory_id=DB::table('ruis_factory')->select('id')->where('code',$value['factory'])->first();
            if(empty($factory_id->id)){
                $factory[$k]['materialCode']=$value['materialCode'];
                $factory[$k]['factory']=$value['factory'];
                $factory[$k]['operation']=$value['operation'];
                $factory[$k]['oldCenter']=$value['oldCenter'];
                $k++;
            }
            //routing id
            $routing_id=DB::table('ruis_procedure_route_gn')->select('routing_id')->where('group_number',$value['group'])->first();
            if(empty($routing_id->routing_id)){
                $routing[$m]['materialCode']=$value['materialCode'];
                $routing[$m]['factory']=$value['factory'];
                $routing[$m]['operation']=$value['operation'];
                $routing[$m]['oldCenter']=$value['oldCenter'];
                $m++;
                continue;
            }
            //获取工序ID
            $operation_id=DB::table('ruis_procedure_route_operation')->select('oid')->where([['rid',$routing_id->routing_id],['order',trim($value['operation'],'0')]])->first();
            if(empty($operation_id->oid)){
                $operation[$n]['materialCode']=$value['materialCode'];
                $operation[$n]['factory']=$value['factory'];
                $operation[$n]['operation']=$value['operation'];
                $operation[$n]['oldCenter']=$value['oldCenter'];
                $n++;
                continue;
            }
            //获取bom_routing_base的id
            $base_id=DB::table('ruis_bom_routing_base')->select('id','step_id')->where([['bom_id',$bom_id->id],['routing_id',$routing_id->routing_id],['operation_id',$operation_id->oid]])->first();
            if(empty($base_id->id)){
                $base[$a]['materialCode']=$value['materialCode'];
                $base[$a]['factory']=$value['factory'];
                $base[$a]['operation']=$value['operation'];
                $base[$a]['oldCenter']=$value['oldCenter'];
                $a++;
                continue;
            }
            //旧工作中心ID
            $oldCenterId=DB::table('ruis_workcenter')->select('id')->where('code',$value['oldCenter'])->first();
            if(empty($oldCenterId->id)){
                $oldCenter[$b]['materialCode']=$value['materialCode'];
                $oldCenter[$b]['factory']=$value['factory'];
                $oldCenter[$b]['operation']=$value['operation'];
                $oldCenter[$b]['oldCenter']=$value['oldCenter'];
                $b++;
                continue;
            }
            $workCenterList=DB::table('ruis_bom_routing_workcenter')
            ->where([['bom_routing_base_id',$base_id->id],['workcenter_id',$oldCenterId->id]])
            ->first();
            /* $operationStepWorkcenter=DB::table('ruis_workcenter_operation_step')
                ->where([['step_id',$base_id->step_id],['workcenter_id',$oldCenterId->id],['operation_id',$operation_id->oid]])
                ->first(); */
            if(empty($workCenterList)){
                $workCenter[$i]['materialCode']=$value['materialCode'];
                $workCenter[$i]['factory']=$value['factory'];
                $workCenter[$i]['operation']=$value['operation'];
                $workCenter[$i]['oldCenter']=$value['oldCenter'];
                $i++;
            }
        }
        //if(!empty(!$bom)||!empty(!$factory)||!empty(!$routing)||!empty(!$operation)||!empty(!$base)||!empty(!$oldCenter)||!empty($workCenter)){
            $string='';
            if(!empty($bom)){
                $string=$string.'系统中不存在以下bom,请检查表格：';
                foreach($bom as $k1=>$v1){
                    $string=$string.'['.$v1['materialCode'].','.$v1['factory'].','.$v1['operation'].','.$v1['oldCenter'].']'.',';
                }
            }
            if(!empty($factory)){
                $string=$string.'<br>系统中不存在以下工厂,请检查表格：';
                foreach($factory as $k2=>$v2){
                    $string=$string.'['.$v2['materialCode'].','.$v2['factory'].','.$v2['operation'].','.$v2['oldCenter'].']'.',';
                }
            }
            if(!empty($routing)){
                $string=$string.'<br>系统中不存在以下组,请检查表格：';
                foreach($routing as $k3=>$v3){
                    $string=$string.'['.$v3['materialCode'].','.$v3['factory'].','.$v3['operation'].','.$v3['oldCenter'].']'.',';
                }
            }
            if(!empty($operation)){
                $string=$string.'<br>系统中不存在以下工序,请检查表格：';
                foreach($operation as $k4=>$v4){
                    $string=$string.'['.$v4['materialCode'].','.$v4['factory'].','.$v4['operation'].','.$v4['oldCenter'].']'.',';
                }
            }
            if(!empty($base)){
                $string=$string.'<br>系统中不存在以下工艺路线,请检查表格：';
                foreach($base as $k5=>$v5){
                    $string=$string.'['.$v5['materialCode'].','.$v5['factory'].','.$v5['operation'].','.$v5['oldCenter'].']'.',';
                }
            }
            if(!empty($oldCenter)){
                $string=$string.'<br>系统中不存在以下工作中心,请检查表格：';
                foreach($oldCenter as $k6=>$v6){
                    $string=$string.'['.$v6['materialCode'].','.$v6['factory'].','.$v6['operation'].','.$v6['oldCenter'].']'.',';
                }
            }
            if(!empty($workCenter)){
                $string=$string.'<br>以下物料编码、工厂、工序行号、工作中心不符：,请检查表格：';
                foreach($workCenter as $k7=>$v7){
                    $string=$string.'['.$v7['materialCode'].','.$v7['factory'].','.$v7['operation'].','.$v7['oldCenter'].']'.',';
                }
            }
            if(!empty($string)){
                TEPA($string);
            }
        //} 
        //return $workCenter;
    }

    //检查新工作中心是否有工序，步骤关联
    public function operationStepWorkcenter($data){
        foreach($data as $key=>$value){
            if(empty($value['materialCode'])) continue;
            //bom id
            $bom_id=DB::table('ruis_bom')->select('id')->where([['code',$value['materialCode']],['is_version_on',1]])->first();
            //工厂ID
            $factory_id=DB::table('ruis_factory')->select('id')->where('code',$value['factory'])->first();
            //routing id
            $routing_id=DB::table('ruis_procedure_route_gn')->select('routing_id')->where('group_number',$value['group'])->first();
            //获取工序ID
            $operation_id=DB::table('ruis_procedure_route_operation')->select('oid')->where([['rid',$routing_id->routing_id],['order',trim($value['operation'],'0')]])->first();
            //获取bom_routing_base的id
            $base_id=DB::table('ruis_bom_routing_base')->select('id','step_id')->where([['bom_id',$bom_id->id],['routing_id',$routing_id->routing_id],['operation_id',$operation_id->oid]])->first();
            //新工作中心ID
            $workCenterId=DB::table('ruis_workcenter')->select('id')->where('code',$value['newCenter'])->first();
            //工序关联的工作中心
            $operationWorkCenter=DB::table('ruis_workcenter_operation')->where([['operation_id',$operation_id->oid],['workcenter_id',$workCenterId->id]])->get();
            if(empty(obj2array($operationWorkCenter))){
                try {
                    DB::connection()->beginTransaction();
                    $data=[
                        'workcenter_id'=>$workCenterId->id,
                        'operation_id'=>$operation_id->oid
                    ];
                    $operationWorkcenterId=DB::table('ruis_workcenter_operation')->insertGetId($data);
                    $this->backups('ruis_workcenter_operation',$operationWorkcenterId);
                } catch (\Exception $e) {
                    DB::connection()->rollBack();
                }
                DB::connection()->commit();
            }
            //工序步骤关联的工作中心
            $operationStepWorkCenter=DB::table('ruis_workcenter_operation_step')->where([['operation_id',$operation_id->oid],['workcenter_id',$workCenterId->id],['step_id',$base_id->step_id]])->get();
            if(empty(obj2array($operationStepWorkCenter))){
                try {
                    DB::connection()->beginTransaction();
                    $insertData=[
                        'workcenter_id'=>$workCenterId->id,
                        'operation_id'=>$operation_id->oid,
                        'step_id'=>$base_id->step_id
                    ];
                    $operationStepWorkcenterId=DB::table('ruis_workcenter_operation_step')->insertGetId($insertData);
                    $this->backups('ruis_workcenter_operation_step',$operationStepWorkcenterId);
                } catch (\Exception $e) {
                    DB::connection()->rollBack();
                }
                DB::connection()->commit();
            }
        }
    }

     //导入批量修改工作中心表
     public function importBatchCenter($data){
        \set_time_limit(0);
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        foreach ($data as $key => $value) {
            if(empty($value['materialCode'])) continue;
            //bom id
            $bom_id=DB::table('ruis_bom')->select('id')->where([['code',$value['materialCode']],['is_version_on',1]])->first();
            //工厂ID
            $factory_id=DB::table('ruis_factory')->select('id')->where('code',$value['factory'])->first();
            //routing id
            $routing_id=DB::table('ruis_procedure_route_gn')->select('routing_id')->where('group_number',$value['group'])->first();
            //获取工序ID
            $operation_id=DB::table('ruis_procedure_route_operation')->select('oid')->where([['rid',$routing_id->routing_id],['order',trim($value['operation'],'0')]])->first();
            //获取bom_routing_base的id
            $base_id=DB::table('ruis_bom_routing_base')->select('id','step_id')->where([['bom_id',$bom_id->id],['routing_id',$routing_id->routing_id],['operation_id',$operation_id->oid]])->first();
            //旧工作中心ID
            $oldCenterId=DB::table('ruis_workcenter')->select('id')->where('code',$value['oldCenter'])->first();
            $workCenterList=DB::table('ruis_bom_routing_workcenter')
            ->where([['bom_routing_base_id',$base_id->id],['workcenter_id',$oldCenterId->id]])
            ->first();
            //$operationStepWorkcenter=DB::table('ruis_workcenter_operation_step')->where([['step_id',$base_id->step_id],['workcenter_id',$oldCenterId->id],['operation_id',$operation_id->oid]])->first();
            $insertData=[
                'ruis_bom_routing_workcenter_id'=>$workCenterList->id,
                //'ruis_workcenter_operation_step_id'=>$operationStepWorkcenter->id,
                'material_code'=>$value['materialCode'],
                'factory'=>$value['factory'],
                'TL'=>$value['TL'],
                'group'=>$value['group'],
                'no_id'=>$value['noId'],
                'operation'=>$value['operation'],
                'old_workcenter'=>$value['oldCenter'],
                'describle'=>$value['describle'],
                'new_workcemter'=>$value['newCenter'],
                'status'=>0,
                'creator'=>$admin_id,
                'ctime'=>strtotime(date('y-m-d H:i:s',time())),
                'groupCount'=>$value['groupCount']
            ];
            DB::table('mbh_batch_update_bom_workcenter')->insertGetId($insertData);
        }
     }

     //批量修改工作中心
     public function batchUpdateWorkcenter($ids){
        \set_time_limit(0);
         $obj_list=DB::table('mbh_batch_update_bom_workcenter')->select('id','ruis_bom_routing_workcenter_id','new_workcemter','ruis_workcenter_operation_step_id')->whereIn('id',$ids)->where('status',0)->get();
         foreach ($obj_list as $key => $value) {
             $workCenterId=DB::table('ruis_workcenter')->select('id')->where('code',$value->new_workcemter)->first();
             $updData=[
                'workcenter_id'=>$workCenterId->id,
             ];
             try {
                DB::connection()->beginTransaction();
                DB::table('ruis_bom_routing_workcenter')->where('id',$value->ruis_bom_routing_workcenter_id)->update($updData);
                //DB::table('ruis_workcenter_operation_step')->where('id',$value->ruis_workcenter_operation_step_id)->update($updData);
                DB::table('mbh_batch_update_bom_workcenter')->where('id',$value->id)->update(['status'=>1]);
                $this->backups('ruis_bom_routing_workcenter',$value->ruis_bom_routing_workcenter_id);
             } catch (\Exception $e) {
                DB::connection()->rollBack();
             }
             DB::connection()->commit();
         }
     }

     //搜索条件
     public function _search($input){
        $where = array();

        if(isset($input['material_code']) && $input['material_code']){  // 物料编码
            $where[] = ['material_code',$input['material_code']];
        }
        if(isset($input['factory']) && $input['factory']){  // 工厂
            $where[] = ['factory',$input['factory']];
        }
        if (isset($input['begintime']) && $input['begintime'])       //导入开始时间
        {
            $where[]=['ctime','>=',strtotime($input['begintime'])];
        }
        if (isset($input['endtime']) && $input['endtime'])           //导入结束时间
        {
            $where[]=['ctime','<=',strtotime($input['endtime'])];
        }
        if(isset($input['creator']) && $input['creator']){  // 导入人
            $where[] = ['creator',$input['creator']];
        }
        return $where;
     }

     //获取所有待修改的工作中心信息
     public function getAllUpdateWorkcenter(&$input){
         $where=$this->_search($input);
         $where[]=['status',$input['status']];    //是否确认替换
         if($input['pushStatus']==1){
            $where[]=['pushStatus','!=',0];    //是否推送
         }else{
             $where[]=['pushStatus',$input['pushStatus']];    //是否推送
         }
         $data=[
             'mbubw.id',
             'mbubw.ruis_bom_routing_workcenter_id',
             'mbubw.ruis_workcenter_operation_step_id',
             'mbubw.material_code',
             'mbubw.factory',
             'mbubw.TL',
             'mbubw.group',
             'mbubw.no_id',
             'mbubw.operation',
             'mbubw.old_workcenter',
             'mbubw.describle',
             'mbubw.new_workcemter',
             'mbubw.status',
             'mbubw.creator',
             'mbubw.ctime',
             'mbubw.groupCount',
             'mbubw.pushStatus',
             'mbubw.RETURNINFO',
             'rf.name as factoryName',
             're.name as creatorName'
         ];
         $obj_list=DB::table('mbh_batch_update_bom_workcenter as mbubw')
                ->select($data)
                ->leftjoin('ruis_factory as rf','rf.code','mbubw.factory')
                ->leftjoin('ruis_employee as re','re.admin_id','mbubw.creator')
                ->where($where)
                ->offset(($input['page_no'] - 1) * $input['page_size'])
                ->limit($input['page_size'])
                ->get();
        foreach ($obj_list as $key => $value) {
            $value->ctime=date('Y-m-d H:i:s',$value->ctime);
        }
         $input['total_records']=DB::table('mbh_batch_update_bom_workcenter')->where($where)->count();
         return $obj_list;
    }

    //下载模版
    public function downTemplate($input){
        $headerName=[
            ['物料','工厂','TL类型','行号','组计数器','组','ID','工作中心','短描述','新工作中心']
        ];
        $fileName='批量替换工作中心模版'.date('Y-m-d H:i:s',time());
        set_time_limit(0);
          header('Content-Type: application/vnd.ms-excel');
          header('Cache-Control:max-age=0');
        /* header('Content-Encoding: UTF-8');
        header("Content-Type: text/csv; charset=UTF-8");
        header("Content-Disposition: attachment; filename={$fileName}.csv"); */
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

    //获取工厂
    public function getFactory($input){
        $obj_list=DB::table('ruis_factory')->get();
        return $obj_list;
    }

    //获取员工
    public function getEmployee($input){
        $obj_list=DB::table('ruis_employee')->get();
        return $obj_list;
    }

    //备份ruis_bom_routing_workcenter，ruis_workcenter_operation，ruis_workcenter_operation_step
    public function backups($tableName,$id){
        $filename='workcenter';
        //备份
        $obj_list=DB::table($tableName)->where('id',$id)->get();
        if(!empty(obj2array($obj_list))){
            foreach ($obj_list as $key => &$value) {
                $value->table=$tableName;
            }
            $obj_list=\json_encode($obj_list);
            new_log($obj_list,$filename);
        }
    }

    //获取数据
    public function getData($ids){
        \set_time_limit(0);
        $data=[
            'rbubw.id',
            'rbrb.bom_id',
            'rbrb.routing_id',
            'rf.id as factoryId',
            'rbrr.id as release_record_id'
        ];
        $obj_list=DB::table('mbh_batch_update_bom_workcenter as rbubw')
                ->select($data)
                ->leftjoin('ruis_bom_routing_workcenter as rbrw','rbrw.id','rbubw.ruis_bom_routing_workcenter_id')
                ->leftjoin('ruis_bom_routing_base as rbrb','rbrb.id','rbrw..bom_routing_base_id')
                ->leftjoin('ruis_factory as rf','rf.code','rbubw.factory')
                ->leftjoin('ruis_bom_release_record as rbrr','rbrr.bom_id','rbrb.bom_id')
                ->whereIn('rbubw.id',$ids)
                ->get();
        return $obj_list;

    }

    //region 推送
    /**
     * mes把工艺路线推送给SAP
     * 获取需要推送的数据
     *
     * @param int $bom_id BOM的ID
     * @param int $routing_id 工艺路线ID
     * @param int $factory_id 工厂ID
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     */
     public function batchSyncToSap($id,$bom_id, $routing_id, $factory_id)
     {
        \set_time_limit(0);
         $dataObj = DB::table(config('alias.rbr') . ' as rbr')
             // 关联ruis_bom
             ->leftJoin(config('alias.rb') . ' as rb', 'rb.id', '=', 'rbr.bom_id')
             //  ruis_procedure_route
             ->leftJoin(config('alias.rpr') . ' as rpr', 'rpr.id', '=', 'rbr.routing_id')
             // ruis_material
             ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rb.material_id')
             //ruis_procedure_route_operation 当前工序
             ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.rid', '=', 'rbr.routing_id')
             // ruis_ie_operation
             ->leftJoin(config('alias.rio') . ' as rio', 'rio.id', '=', 'rpro.oid')
             ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rm.unit_id')
             ->select([
                 'rm.id as material_id',
                 'rm.item_no as material_code',
                 'rm.name as material_name',
                 'ruu.commercial as material_unit',
                 'rpr.id as route_id',
                 'rpr.code as route_code',
                 'rpr.name as route_name',
                 'rb.id as bom_id',
                 'rb.bom_no as bom_no',
                 'rb.BMEIN',
                 'rb.STLAN',
                 'rb.qty as base_number',
                 'rio.id as operation_id',
                 'rio.code as operation_code',
                 'rio.name as operation_name',
                 'rpro.id as rpro_id',
                 'rpro.order as index',
 
             ])
             ->where([['rb.id', '=', $bom_id], ['rb.is_version_on', '=', 1], ['rpr.id', '=', $routing_id]])
             ->orderBy('rpro.order', 'ASC')
             ->get();
 
         if (empty(json_decode(json_encode($dataObj)))) {
            $this->updatePushStatus($id,2,'BOM不是有效bom');
            return ;
             //TEA('2474');   BOM不是有效bom
         }
 
         // 去除第一个工序
         $tempArr = [];
         foreach ($dataObj as $ok => $item) {
             if ($ok == 0) {
                 continue;
             }
             $tempArr[] = $item;
         }
         array_values($tempArr);
         $dataObj = json_decode(json_encode($tempArr));
         unset($tempArr);
 
         /**
          * @var string $bomNo bom 编号
          * @var string $materialCode 物料code
          */
         $bomNo = '';
         $materialCode = '';
 
         $sendData = [];
         foreach ($dataObj as $key => $value) {
 
             //获取下一个工序
             $nextOperationOjb = DB::table(config('alias.rprm') . ' as rprm')
                 ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.id', '=', 'rprm.nid')
                 ->select([
                     'rpro.id as next_rpro.id',
                     'rpro.oid as next_operation_id',
                 ])
                 ->where([
                     ['rprm.cid', '=', $value->rpro_id],
                     ['rprm.route_id', '=', $value->route_id]
                 ])
                 ->get();
             $nextOperationIDArr = [];
             foreach ($nextOperationOjb as $noKey => $nkValue) {
                 $nextOperationIDArr[] = $nkValue->next_operation_id;
             }
 
             $bomNo = $value->bom_no;
             $materialCode = $value->material_code;
 
             // 获取工厂
             $factoryObj = DB::table(config('alias.rf'))->select(['code'])->where('id', $factory_id)->first();
 
             // 获取 ruis_bom_routing_base
             $rbrbOjb = DB::table(config('alias.rbrb') . ' as rbrb')
 //                ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.id', '=', 'rbrb.routing_node_id')
                 ->select('rbrb.id')
                 ->where([
                     ['rbrb.routing_node_id', '=', $value->rpro_id],
                     ['rbrb.bom_id', '=', $bom_id],
                     ['rbrb.routing_id', '=', $routing_id],
                 ])
                 ->get();
             $rbrbIDArr = [];
             foreach ($rbrbOjb as $rbrbKey => $rbrbValue) {
                 $rbrbIDArr[] = $rbrbValue->id;
             }
 
             /**
              * 工作中心
              * 返回第一个
              */
             $value->workcenter_code = '';
             $workCenterOjb = DB::table(config('alias.rbrw') . ' as rbrw')
                 ->leftJoin(config('alias.rbrb') . ' as rbrb', 'rbrb.id', '=', 'rbrw.bom_routing_base_id')
                 ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', '=', 'rbrw.workcenter_id')
                 ->select([
                     'rbrw.workcenter_id',
                     'rwc.code',
                     'rwc.name',
                     'rwc.standard_code',
                     'rbrb.operation_ability_ids'
                 ])
                 ->where([
                     ['rbrb.routing_id', '=', $value->route_id],
                     ['rbrb.bom_id', '=', $value->bom_id],
                     ['rbrb.operation_id', '=', $value->operation_id],
                 ])
                 ->orderBy('rbrb.index', 'ASC')
                 ->first();
             if (!isset($workCenterOjb->code) || !isset($workCenterOjb->standard_code)) {
                $this->model->updatePushStatus($id,2,'工作中心配置不完整');
                return ;
                 //TEA('2480');    //工作中心配置不完整
             }
             $value->workcenter_code = $workCenterOjb->code;
 
             $work_hour_param_arr = [
                 'operation_id' => $value->operation_id,
                 'route_id' => $value->route_id,
                 'rbrb_ID_Arr' => $rbrbIDArr,
                 'next_operation_ID_Arr' => $nextOperationIDArr,
             ];
             $work_hour_arr = $this->get_work_hour($work_hour_param_arr);
 
             $control_code_arr = $this->get_control_code($bom_id, $routing_id, $value->rpro_id);
 
             /**
              * @since 2018-10-22 旋切
              */
             $xq_sum = DB::table(config('alias.rimw') . ' as rimw')
                 // ->leftJoin(config('alias.rioa') . ' as rioa', 'rioa.id', '=', 'rimw.ability_id')
 //                ->leftJoin(config('alias.riw').' as riw',[
 //                    ['riw.operation_id', '=', 'rimw.operation_id'],
 //                    ['riw.ability_id','=','rioa.ability_id']
 //                ])
                 ->where(
                     [
                         ['rimw.operation_id', '=', $value->operation_id],
                         ['rimw.routing_id', '=', $value->route_id],
                     ])
                 ->whereIn('rimw.step_info_id', $rbrbIDArr)
                 ->select([
                     'rimw.id',
                     // 'riw.id as riw_id',
 //                    'riw.is_ladder',
                     'rimw.once_clip_time'
                 ])
                 ->sum('once_clip_time');
             //工序的所有工时总和不大于0，报错
             if(($work_hour_arr['jq_work_hour'] + $work_hour_arr['rg_work_hour'] + $work_hour_arr['pre_work_hour'] + $work_hour_arr['lz_work_hour'] + $xq_sum) <= 0){
                 $this->updatePushStatus($id,2,'工时配置不完整');
                return ;
             }
 //            $xq_SLWID = '';
             $xq_PAR05 = '';
             $xq_USE05 = '';
             $xq_USR05 = '';
             if ($xq_sum > 0) {
 //                $xq_SLWID = 'MLILY01';
                 $xq_PAR05 = 'MLILY01';   //ZPP022
                 $xq_USE05 = 'S';
                 $xq_USR05 = $xq_sum;
             }
 
             /**
              * ruis_procedure_route_gn
              * 通过查询上表，确定当前工艺路线是否为新添加的，
              * 如果为修改，需要把原来的goup_number count 传给SAP
              * 否则，两值为空
              */
             $gnObj = DB::table(config('alias.rprgn'))
                 ->select(['group_number', 'group_count'])
                 ->where([
                     ['bom_no', '=', $value->bom_no],
                     ['material_code', '=', $value->material_code],
 //                    ['routing_id', '=', $value->route_id],
                     ['factory_id', '=', $factory_id]
                 ])
                 ->first();
 
             $temp = [
                 'MATNR' => isset($value->material_code) ? trim($value->material_code) : "",
                 'MAKTX' => isset($value->material_name) ? trim($value->material_name) : "",
                 'WERKS' => isset($factoryObj->code) ? $factoryObj->code : "",
                 'KTEXT' => $value->route_name,
                 'LOSVN1' => 0,
                 'LOSBS1' => 99999999,
                 'PLNME1' => $value->material_unit,
                 "VORNR" => str_pad($value->index * 10, 4, '0', STR_PAD_LEFT),
                 'LTXA1' => $value->operation_name,
                 'ARBPL' => $value->workcenter_code,
                 'STEUS' => $control_code_arr['control_code'],      // 控制码
                 'BMSCH1' => $control_code_arr['base_qty'],
                 'MEINH1' => $value->BMEIN,
 //                'ZWNOR1' => round($work_hour_arr['lz_work_hour']) + $work_hour_arr['pre_work_hour'],  //流转时间
                 'ZWNOR1' => '',  //流转时间
                 'ZEIWN1' => '',     // 2019年1月15日13:49:05 有 's' 改为空
                 'VGWTS' => 'ZHF1',  //标准值码 默认为 ZHF1
                 'VGW011' => '',
                 'VGE011' => '',
                 'VGW021' => '',
                 'VGE021' => '',
                 'VGW031' => '',
                 'VGE031' => '',
                 'VGW041' => '',
                 'VGE041' => '',
                 'VGW051' => '',
                 'VGE051' => '',
                 'VGW061' => '',
                 'VGE061' => '',
                 'STALT' => $value->bom_no,  //BOM编号
                 'STLAN' => $value->STLAN,     //BOM用途
                 'PLNNR' => isset($gnObj->group_number) ? $gnObj->group_number : '', // 任务清单组键值
                 'PLNAL' => isset($gnObj->group_count) ? $gnObj->group_count : '',   // 组计数器
 //                'SLWID' => $xq_SLWID,
                 'userfields_keyword_id' => $xq_PAR05,   //参数ID
                 'userfield_unit_05' => $xq_USE05,       //数量字段单位
                 'userfield_quan_05 ' => empty($xq_USR05) ? '' : $xq_USR05 * $control_code_arr['base_qty'],      //用户字段数量
                 'SPMUS' => empty($control_code_arr['is_split']) ? '' : 'X',
                 'SPLIM' => empty($control_code_arr['is_split']) ? '' : $control_code_arr['max_split_point'],
 
             ];
 
             /**
              * 标准值
              * 1.先根据标准值码 获取相对应的参数条目
              * 2.遍历
              * 3.处理对应的业务
              */
             $StandardValue = new StandardValue();
             $sv_list = $StandardValue->getParamItem($workCenterOjb->standard_code);
             if (empty($sv_list)) {
                $this->updatePushStatus($id,2,'标准值码配置有误');
                return ;
                 //TEA('2484');
             }
             $temp['VGWTS'] = $workCenterOjb->standard_code;
             foreach ($sv_list as $paramItem) {
                 $temp['VGE0' . $paramItem['index'] . '1'] = $paramItem['unit'];     // 标准值X 的单位
 
                 //根据不同类型获取对应的值
                 switch ($paramItem['code']) {
                     case 'ZPP002':   // 人工工时
                         $this_standard_value = $work_hour_arr['rg_work_hour'];
                         break;
                     case 'ZPP005':   // 作业量
                         $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                         break;
                     case 'ZPP007':   // 针数
                         $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                         break;
                     case 'ZPP008':   // 模具数量
                         $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                         break;
                     case 'ZPP009':   // 仓容
                         $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                         break;
                     default:
                     case 'ZPP001':   // 机器工时
                         $this_standard_value = $work_hour_arr['jq_work_hour'];
                         break;
                 }
                 $temp['VGW0' . $paramItem['index'] . '1'] = round($this_standard_value * $control_code_arr['base_qty'], 3);   // 标准值X 的值
             }
             $sendData[] = $temp;
 
         }
 
         /**
          * 可选的 BOM
          * BOM 项目号
          * 操作/活动编号
          */
         $new_objs = DB::table(config('alias.rbri') . ' as rbri')
             ->leftJoin(config('alias.rb') . ' as rb', 'rb.id', '=', 'rbri.bom_id')
             ->leftJoin(config('alias.rbrb') . ' as rbrb', 'rbrb.id', '=', 'rbri.bom_routing_base_id')
             ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.id', '=', 'rbrb.routing_node_id')
             ->select([
                 'rb.bom_no',
                 'rbri.POSNR',
                 'rpro.order as index'
             ])
             ->where([
                 ['rbri.bom_id', '=', $bom_id],
                 ['rbri.routing_id', '=', $routing_id],
                 ['rbri.type', '=', 1]
             ])
             ->whereExists(function ($query) use ($bom_id) {
                 $query->select(['rbii.material_id'])
                     ->from(config('alias.rbi') . ' as rbii')
                     ->whereRaw('`rbii`.`bom_id` = ' . $bom_id . ' and `rbii`.`material_id` = `rbri`.`material_id`');
             })
             ->get();
 
         $tempProjectOrderArr = [];
         foreach ($new_objs as $obj) {
             $str = $obj->bom_no . '_' . $obj->POSNR . '_' . $obj->index;
             $tempProjectOrderArr[$str] = [
                 'ALTERNATIVE_BOM' => $obj->bom_no,
                 'ITEM_NO' => $obj->POSNR,
                 'ACTIVITY' => str_pad($obj->index * 10, 4, '0', STR_PAD_LEFT)
             ];
         }
 
         $i = 1;
         foreach ($tempProjectOrderArr as $tempProjectOrder) {
             $sendData['Label_Fix__COMPONENT+' . $i++] = $tempProjectOrder;
         }
 
         return ['data' => $sendData, 'bomNo' => $bomNo, 'materialCode' => $materialCode];
     }

     //更新错误日志
     public function updateLog($id,$comment){
        \set_time_limit(0);
         DB::table('mbh_batch_update_bom_workcenter')->where('id',$id)->update(['RETURNINFO'=>$comment]);
     }

     //更新状态
     public function updatePushStatus($id,$status,$comment){
         set_time_limit(0);
         $upData=[
             'pushStatus'=>$status,
             'RETURNINFO'=>$comment
         ];
         DB::table('mbh_batch_update_bom_workcenter')->where('id',$id)->update($upData);
     }

     /**
     * 处理同步 工艺路线 时 SAP返回的数据
     *
     * @param string $groupNumber SAP返回的数据： 任务清单组键值
     * @param string $count SAP返回的数据： 组计数器
     * @param string $bomNo bom number
     * @param string $materialCode 物料code
     * @param string $route_id 工艺路线ID
     * @author lester.you
     */
    public function updateGroupNumberAndCount($groupNumber, $count, $bomNo, $materialCode, $route_id, $factory_id = 0,$release_record_id,$bom_id)
    {
        \set_time_limit(0); 
        $data = DB::table(config('alias.rprgn'))
            ->select(['id'])
            ->where([
                ['bom_no', '=', $bomNo],
                ['material_code', '=', $materialCode],
                ['group_number', '=', $groupNumber],
                ['group_count', '=', $count],
                ['factory_id', '=', $factory_id]
            ])
            ->first();
        if (!empty($data)) {
            DB::table(config('alias.rprgn'))
                ->where([
                    ['bom_no', '=', $bomNo],
                    ['material_code', '=', $materialCode],
                    ['group_number', '=', $groupNumber],
                    ['group_count', '=', $count],
                    ['factory_id', '=', $factory_id]
                ])
                ->update(['routing_id' => $route_id]);
        } else {
            DB::table(config('alias.rprgn'))
                ->insertGetId([
                    'bom_no' => $bomNo,
                    'material_code' => $materialCode,
                    'group_number' => $groupNumber,
                    'group_count' => $count,
                    'routing_id' => $route_id,
                    'factory_id' => $factory_id,
                    'ctime' => time()
                ]);
        }

        //hao.li 工时同步成功之后，状态修改为2
        //1.根据bomID获取所有routing
        $routingIds=DB::table('ruis_bom_routing')->where('bom_id',$bom_id)->pluck('routing_id')->toArray();
        $routingId = explode(',', implode(',', $routingIds));
        //获取该bom有多少个routing
        $routingNum=DB::table('ruis_bom_routing')->select('routing_id')->where('bom_id',$bom_id)->count();
        //获取该bom同步过的个数
        $synNum=DB::table('ruis_procedure_route_gn')->where('material_code',$materialCode)->whereIn('routing_id',$routingId)->count();
        //如果有routingNum和synNum个数相同，说明该bom多个工厂都同步，可以修改状态
        if($routingNum==$synNum){
            $res = DB::table(config('alias.rbrr'))->where('id',$release_record_id)->update(['status'=>2]);
            if($res === false) TEA('804');
        }
    }
    /**
     * 获取工时(同步SAP工艺路线)
     *
     * @param array $paramArr
     * @return array
     * @throws \App\Exceptions\ApiException
     */
     private function get_work_hour($paramArr)
     {
         /**
          * 机器工时 & 流转工时 &准备工时
          */
         $jq_workHourOjb = DB::table(config('alias.rimw'))
             ->where(
                 [
                     ['operation_id', '=', $paramArr['operation_id']],
                     ['routing_id', '=', $paramArr['route_id']],
                 ])
             ->whereIn('step_info_id', $paramArr['rbrb_ID_Arr'])
             ->select(['id', 'man_hours', 'work_hours', 'step_info_id'])
             ->get();
         $step_temp = [];
         foreach ($jq_workHourOjb as $item) {
             $step_temp[$item->step_info_id][] = $item;
         }
 
 //        $step_count = count($step_temp);
         $jq_workHours = 0;  //机器工时
         $rg_workHours = 0;  //人工工时
         foreach ($step_temp as $k => &$v) {
             // 一组 step
             $work_hours_arr = [];
             $man_hours_arr = [];
             foreach ($v as $_v) {
                 $work_hours_arr[] = $_v->work_hours;
                 $man_hours_arr[] = $_v->man_hours;
             }
 //            $jq_workHours += min($work_hours_arr ?: [0]) + min($man_hours_arr ?: [0]);
             $jq_workHours += min($work_hours_arr ?: [0]);
             $rg_workHours += min($man_hours_arr ?: [0]);
         }
         // 如果为0，则取 导入的值
         $jq_workHours = $jq_workHours ?: $this->get_param_item_value($paramArr['rbrb_ID_Arr'], 'ZPP001');
         $rg_workHours = $rg_workHours ?: $this->get_param_item_value($paramArr['rbrb_ID_Arr'], 'ZPP002');
         /**
          * @todo 机器工时可为空
          */
 //        if ($jq_workHours == 0) {
 //            TEA('2407', '机器工时');
 //        }
 
         /**
          * 准备工时
          *
          * 1.先获取步骤ID
          * 2.rbrb 获取能力ID
          * 3.根据能力ID和工序ID 获取准备工时
          */
         // 步骤表 获取 能力ID
         $rbrbObj = DB::table(config('alias.rbrb'))
             ->select(['operation_ability_ids'])
             ->whereIn('id', $paramArr['rbrb_ID_Arr'])
             ->get();
         $preWorkHour = 0;
         $lz_workHour = 0;
 
         $rbrbObj = DB::table(config('alias.rbrb'))
             ->select(['operation_ability_ids'])
             ->whereIn('id', $paramArr['rbrb_ID_Arr'])
             ->orderBy('index', 'asc')
             ->first();
         $preparationHourBuilder = DB::table(config('alias.riw') . ' as riw')
             ->select('riw.preparation_hour', 'riw.id')
             ->where([
                 ['riw.operation_id', '=', $paramArr['operation_id']],
                 ['riw.parent_id', '>', 0],
             ])
             ->orderBy('riw.preparation_hour', 'DESC');
 
         if (isset($rbrbObj->operation_ability_ids) && !empty(intval($rbrbObj->operation_ability_ids))) {
             $preparationHourBuilder
                 ->leftJoin(config('alias.rioa') . ' as rioa', 'rioa.ability_id', '=', 'riw.ability_id')
                 ->where([
                     ['rioa.id', '=', intval($rbrbObj->operation_ability_ids)]
                 ]);
         }
         $preparationHourObj = $preparationHourBuilder->first();
 
         if (isset($preparationHourObj->preparation_hour)) {
             $preWorkHour = $preparationHourObj->preparation_hour;
         }
         return [
             'jq_work_hour' => $jq_workHours,
             'rg_work_hour' => $rg_workHours,
             'pre_work_hour' => $preWorkHour,
             'lz_work_hour' => $lz_workHour,
         ];
     }

     /**
     * 查询 控制码
     * 默认为PP01
     *
     * @param int $bom_id
     * @param int $routing_id
     * @param int $rpro_id
     * @return array
     */
    private function get_control_code($bom_id, $routing_id, $rpro_id)
    {
        $obj = DB::table(config('alias.rbroc'))
            ->select([
                'control_code',
                'base_qty',
                'is_split',
                'max_split_point'
            ])
            ->where([
                ['bom_id', '=', $bom_id],
                ['routing_id', '=', $routing_id],
                ['routing_node_id', '=', $rpro_id]
            ])
            ->first();
        $data = [
            'control_code' => 'PP01',
            'base_qty' => 1
        ];
        if (isset($obj->control_code) && !empty($obj->control_code)) {
            $data['control_code'] = $obj->control_code;
            $data['base_qty'] = $obj->base_qty;
            $data['is_split'] = $obj->is_split;
            $data['max_split_point'] = $obj->max_split_point;
        }
        return $data;
    }

    /**
     * @param array $rbrbIDArr
     * @param string $paramItemCode
     * @return int
     */
     private function get_param_item_value($rbrbIDArr, $paramItemCode)
     {
         $objs = DB::table(config('alias.spiv'))
             ->where('standard_item_code', $paramItemCode)
             ->whereIn('step_info_id', $rbrbIDArr)
             ->select(['value', 'id'])
             ->get();
         $values = 0.000;
         foreach ($objs as $v) {
             if (isset($v->value)) {
                 $values += $v->value;
             }
         }
         return $values;
     }

     public function getTechnologymaterial($file)
     {
         //设置文件后缀白名单
         $allowExt = ["csv", "xls", "xlsx"];
         //设置存储目录
         $tmpPath = 'storage/exports/';
         //如果目标目录不能创建
         if (!is_dir($tmpPath) && !mkdir($tmpPath, 0777, true)) {
             return TEPA('上传目录没有创建文件夹权限');
         }
         //如果目标目录没有写入权限
         if (is_dir($tmpPath) && !is_writable($tmpPath)) {
             return TEPA('上传目录没有写入权限');
         }

         if (empty($file)) TEPA('请选择文件');
         //校验文件
         if (isset($file) && $file->isValid()) {
             $ext = $file->getClientOriginalExtension(); //上传文件的后缀
             //判断是否是Excel
             if (empty($ext) or in_array(strtolower($ext), $allowExt) === false) {
                 return TEPA('不允许的文件类型');
             }
             //生成文件名
             $fileName = 'Technology.' . $ext;
             try {
                 //存储文件
                 $file->move($tmpPath, $fileName);
                 // 获取 上传文件名称
//                 $filePath = 'storage/exports/' . iconv('UTF-8', 'GBK', 'Technology') . '.' . $ext;
                 // 添加数据到数据库
//                 $this->technologyImport($filePath,$input);
                 // 完成之后删除文件
//                 unlink($filePath);
                 return ['ext'=>$ext];
             } catch (Exception $ex) {
                 //回滚
                 DB::rollBack();
                 TEPA($ex->getMessage());
             }
         }

     }


     public function technologyImport($input)
     {

         $filePath = 'storage/exports/' . iconv('UTF-8', 'GBK', 'Technology') . '.' . $input['ext'];

         Excel::selectSheets('Sheet1')->load($filePath, function($reader) {
             $data = $reader->all()->toArray(); // 获取数据并转换为数据
             foreach ($data as $key=>$val){
                 if(!$val[0]) continue;
                 $item_no[] = $val[0];
                 if(!isset($factory_id)) $factory_id = $val[1];
             }
             $item_no = implode(',',$item_no);
             $sql = " select a.* from (SELECT
                rm.name,
                rm.item_no,
                uu.commercial,
                rbri.material_id,
                rbri.use_num,
                rbri.type,
                rbri.is_lzp,
                rbri.step_path,
                rbri.index,
                rbri.desc,
                rbri.bom_unit_id,
                rbri.POSNR,
                rbri.bom_routing_base_id,
                rbri.user_hand_num,
                rb.is_version_on,
                rb.code,
                rbr.factory_id,
                rio.name as operation_id
                FROM
                ruis_bom_routing_item AS rbri
                LEFT JOIN ruis_uom_unit AS uu ON uu.id = rbri.bom_unit_id
                LEFT JOIN ruis_material AS rm ON rm.id = rbri.material_id
                LEFT JOIN ruis_bom_routing_base AS rbrb ON rbrb.id = rbri.bom_routing_base_id
                LEFT JOIN ruis_bom AS rb ON rb.id = rbrb.bom_id
                LEFT JOIN ruis_bom_routing AS rbr ON rb.id = rbr.bom_id
                LEFT JOIN ruis_ie_operation AS rio ON rio.id = rbrb.operation_id
                WHERE
                rb.code IN ($item_no)
                ORDER BY
                rbri.index ASC) as a where a.type=1 and is_version_on=1  and factory_id= ?  
                group by code,item_no";

             $bl_date = DB::select($sql,[$factory_id]);

             //声明数组,设置表头
             $cellData = [
                 ['进料名称', '进料编码	','单位','进料用量','描述','组件序号','产出用量','产品物料号','工厂id	','工序'],//表头
             ];
             foreach ($bl_date as $datekey=>$dateval){
                 $cellData[] = [
                     $dateval->name,
                     $dateval->item_no,
                     $dateval->commercial,
                     $dateval->use_num,
                     $dateval->desc,
                     $dateval->POSNR,
                     $dateval->user_hand_num,
                     $dateval->code,
                     $dateval->factory_id,
                     $dateval->operation_id,
                 ];
             }
             //导出Excel
             Excel::create('工艺进出料信息', function ($excel) use ($cellData) {
                 $excel->sheet('first', function ($sheet) use ($cellData) {
                     $sheet->rows($cellData);
                     //单元格字体大小设置为15号
                     $sheet->setFontSize(15);
                     //解决导出xls格式文件乱码
                     ob_end_clean();
                 });
             })->export('xls');
         });
         unlink($filePath);
         exit();

     }
}