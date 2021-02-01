<?php 
/**
 * 设备类型
 * User: liming
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class DeviceType extends Base
{
	public function __construct()
    {
        $this->table='ruis_device_type';
      
        $this->aliasTable=[
            'devicetype'=>$this->table.' as devicetype',
        ];
    }

    /**
     * 添加操作
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        //代码唯一性检测
        $has=$this->isExisted([['code','=',$input['code']]]);
        if($has) TEA('710','code');
        //名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']]]);
        if($has) TEA('710','name');
        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'     =>$input['code'],
            'name'     =>$input['name'],
            'parent_id'=>$input['parent_id'],
            'sort'     =>$input['sort'],
            'remark'=>$input['remark'],
        ];
        //添加
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }

    public function addBatch(array &$input)
    {
        // 批量类型数据
        if (!isset($input['data']) || !$input['data']) TEA('710','data');
        $pdo = DB::connection()->getPdo();
        // 从数据库列出所有类型数据 name => id
        // 用于判断$input['data']中的某个类型是否存在
        $nameIDX = (function () use ($pdo) {
            $result = [];
            foreach ($pdo->query('SELECT `id`, `name` FROM `ruis_device_type`') as $row) {
                $result[$row['name']] = (int) $row['id'];
            }
            return $result;
        })();
        // 将$input['data']组织为新的类型数据
        $newDat1 = [];
        $newDat2 = [];
        $input['data'] = str_replace("\r", '', $input['data']);
        $input['data'] = explode("\n", $input['data']);
        foreach ($input['data'] as $i => $dt) {
            $dt = explode('\\', $dt);
            switch (count($dt)) {
                // 二级分类
                case 2:
                    list($r1, $r2) = $dt;
                    $newDat1[$r1][] = $r2;
                    $newDat1[$r1] = array_values(array_unique($newDat1[$r1]));
                    break;
                // 三级分类
                case 3:
                    list($r1, $r2, $r3) = $dt;
                    $newDat2[$r1][$r2][] = $r3;
                    $newDat2[$r1][$r2] = array_values(array_unique($newDat2[$r1][$r2]));
                    break;
            }
        }
        $newDat = array_merge_recursive($newDat1, $newDat2);
        // 递归入库
        $insertIDS = [];
        $this->batch_insert_recurrence($insertIDS, $newDat, $nameIDX);
        return $insertIDS;
    }

    private function batch_insert_recurrence(&$insertIDS, $data, &$idx, $codePrefix = '', $pid = 0)
    {
        // 解析出名称和名称的拼音
        // 前端会将名称与拼音一起提交，用以“->”符号做分隔标识
        $parseName = function (&$name, &$list)
        {
            $result = ['', ''];
            if (is_array($list) === true) {
                if ($name) {
                    $result = explode('->', $name, 2);
                }
            } else {
                if ($list) {
                    $result = explode('->', $list, 2);
                }
            }
            return $result;
        };
        foreach ($data as $name => $list) {
            list($code, $name) = $parseName($name, $list);
            if (!$name) {
                continue;
            }
            $code = trim($codePrefix . explode(',', $code)[0]); // 前端js可能提交多音字
            $code = str_replace([' ', '（', '）'], ['', '', ''], $code);
            $name = trim($name);
            if (isset($idx[$name]) !== true) {
                $id = (int) DB::table($this->table)->insertGetId([
                    'code' => $code,
                    'name' => $name,
                    'parent_id'=> $pid,
                    'remark' => $name
                ]);
                $insertIDS[] = $id;
            } else {
                $id = $idx[$name];
            }
            if (is_array($list) === true) {
                $this->batch_insert_recurrence($insertIDS, $list, $idx, $code . '_', $id);
            }
        }
        return;
    }

    /**
     * 修改
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {

        $has=$this->isExisted([['name','=',$input['name']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('710','name');

        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('710','code');


        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'code'=>$input['code'],
            'parent_id'=>$input['parent_id'],
            'sort'=>$input['sort'],
            'remark'=>$input['remark'],
        ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();

    }

    /**
     * 查看某条信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
        $data = [
            'id',
            'name',
            'code',
            'sort',
            'parent_id',
            'remark',
        ];

        $obj = DB::table($this->aliasTable['devicetype'])
            ->select($data)
            ->where("devicetype.$this->primaryKey",'=',$id)
            ->first();

        if (!$obj) TEA('404');
        return $obj;
    }

    /**
     * 删除
     * @param $id
     * @throws \Exception
     */
    public function destroy($id)
    {

        //该分组的使用状况,使用的话,则禁止删除[暂时略][是否使用由具体业务场景判断]
        try{
            //开启事务
            DB::connection()->beginTransaction();

            //判断是否有子集
             $list=DB::table($this->table)->select('id')->where('parent_id','=',$id)->limit(1)->count();
             if($list) TEA('9108');

             $num=$this->destroyById($id);
             if($num===false) TEA('803');
             if(empty($num))  TEA('404');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

    /**
     * 获取列表
     * @return object  返回对象集合
     * @todo  分类树少的时候适合采取,后续多的时候采用层级递进方式
     */
    public function getObjectsList()
    {
        $obj_list=DB::table($this->table)->select(['id','name','parent_id','remark','code'])->get();
        return $obj_list;
    }

    /**
     * 获取所有的分类列表
     * @return object  返回对象集合
     * @todo  分类树少的时候适合采取,后续多的时候采用层级递进方式
     */
    public function getCategoriesList()
    {
        $field = [
            'id',
            'name',
            'code',
            'sort',
            'parent_id',
            'remark'
        ];
        $obj_list=DB::table($this->table)->select($field)
            ->get();
        return $obj_list;

    }

    /**
     * 有条件的搜索select(连同父类一起查出来)
     * @param $name
     * @return mixed
     */
    public function getCategoriesListByWhere($name){
        $field = [
            'id',
            'name',
            'code',
            'sort',
            'parent_id',
            'remark'
        ];
        $id_list=DB::table($this->table)->select('id','parent_id')
            ->where('name','like','%'.$name.'%')
            ->get();
        $ids = [];
        foreach ($id_list as $k=>$v){
            $ids[] = $v->id;
        }
        foreach ($id_list as $k=>$v){
            if(!in_array($v->parent_id,$ids)){
                $ids[] = $v->parent_id;
            }
        }
        $obj_list = DB::table($this->table)->select($field)
            ->whereIn('id',$ids)
            ->get();
        return $obj_list;
    }

}

