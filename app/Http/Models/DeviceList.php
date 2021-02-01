<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/3
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use Maatwebsite\Excel\Facades\Excel;
use PHPExcel_Cell;

class DeviceList extends  Base
{
    public function __construct()
    {
        $this->table='ruis_device_list';
        $this->rentpartner_table='ruis_partner_new';
        $this->supplier_table='ruis_partner_new';
        $this->procude_table='ruis_partner_new';       //  生产厂商
        $this->employee_table='ruis_employee';       //  员工
        $this->useemployee_table='ruis_employee';       //  员工
        $this->sign_table='ruis_device_options';       // 设备标记
        $this->status_table='ruis_device_options';       // 设备状况
        $this->device_type_table='ruis_device_type';       // 设备类型
        $this->department_table='ruis_device_department';       // 部门

        //定义表别名
        $this->aliasTable=[
            'devicelist'=>$this->table.' as devicelist',
            'rentpartner'=>$this->rentpartner_table.' as rentpartner', // 租用单位
            'supplier'=>$this->supplier_table.' as supplier',         // 供应商
            'procude'=>$this->procude_table.' as procude',         // 生产厂商
            'employee'=>$this->employee_table.' as employee',         // 员工
            'user'=>$this->useemployee_table.' as user',         // 员工
            'sign'=>$this->sign_table.' as sign',         // 标记
            'status'=>$this->status_table.' as status',         // 设备状况
            'devtype'=>$this->device_type_table.' as devtype',         // 设备类型
            'department'=>$this->department_table.' as department',         // 部门
        ];

    }



    /**
     * 保存数据
     */
    public function save($data,$id=0)
    {
        if ($id>0)
        {
                try{
                    //开启事务
                    DB::connection()->beginTransaction();
                    $upd=DB::table($this->table)->where('id',$id)->update($data);
                    if($upd===false) TEA('804');
                }catch(\ApiException $e){
                    //回滚
                    DB::connection()->rollBack();
                    TEA($e->getCode());
                }

                //提交事务
                DB::connection()->commit();
                $order_id   = $id;

        }
        else
        {
            //代码唯一性检测
            $has=$this->isExisted([['code','=',$data['code']]]);
            if($has) TEA('9405','code');
            //补全数据
            $data['ctime']=time();
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }



    /**
     * 添加操作
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $company_id=$input['company_id'];
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $factory_id=$input['factory_id'];

        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1、入库单添加
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'name'=>$input['name'],
                'device_type'=>$input['device_type'], 
                'spec'=>$input['spec'], 
                'rent_partner'=>$input['rent_partner'], 
                'procude_partner'=>$input['procude_partner'], 
                'supplier'=>$input['supplier'], 
                'useful_life'=>$input['useful_life'], 
                'purchase_time'=>$input['purchase_time'], 
                'initial_price'=>$input['initial_price'], 
                'net_price'=>$input['net_price'], 
                'employee_id'=>$input['employee_id'], 
                'device_sign'=>$input['device_sign'], 
                'use_status'=>$input['use_status'], 
                'use_department'=>$input['use_department'], 
                'use_employee'=>$input['use_employee'], 
                'placement_address'=>$input['placement_address'], 
                'remark'=>$input['remark'], 
            ];
            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }



    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getList($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }

        $data = [
            'devicelist.id  as   id',
            'devicelist.code  as    device_code',
            'devicelist.name  as    device_name',
            'devicelist.spec  as    device_spec',
            'devicelist.id    as     device_id',
            'devicelist.procude_partner  as   procude_partner',
            'devicelist.useful_life  as   useful_life',
            'devicelist.purchase_time  as   purchase_time',
            'devicelist.initial_price  as   initial_price',
            'devicelist.net_price  as   net_price',
            'devicelist.placement_address  as   address',
            'devicelist.remark  as   remark',
            'rentpartner.id  as   rentpartner_id',
            'rentpartner.name  as   rentpartner_name',
            'rentpartner.code  as   rentpartner_code',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'employee.id  as   employee_id',
            'employee.name  as   employee_name',
            'user.id  as   user_id',
            'user.name  as   user_name',
            'sign.id  as   sign_id',
            'sign.name  as   sign_name',
            'sign.code  as   sign_code',
            'status.id  as   status_id',
            'status.name  as   status_name',
            'status.code  as   status_code',
            'devtype.id  as   devtype_id',
            'devtype.name  as   devtype_name',
            'devtype.code  as   devtype_code',
            'department.id  as   department_id',
            'department.name  as   department_name',
        ];

        $where = $this->_search($input);

        $obj_list = DB::table($this->aliasTable['devicelist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['rentpartner'], 'devicelist.rent_partner', '=', 'rentpartner.id')  // 租用单位
            ->leftJoin($this->aliasTable['supplier'], 'devicelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['employee'], 'devicelist.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['user'], 'devicelist.use_employee', '=', 'user.id')
            ->leftJoin($this->aliasTable['sign'], 'devicelist.device_sign', '=', 'sign.id')
            ->leftJoin($this->aliasTable['status'], 'devicelist.use_status', '=', 'status.id')
            ->leftJoin($this->aliasTable['devtype'], 'devicelist.device_type', '=', 'devtype.id')
            ->leftJoin($this->aliasTable['department'], 'devicelist.use_department', '=', 'department.id')
            ->orderBy($input['sort'],$input['order'])
            ->where($where)
            ->limit(10)
            ->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }


    public  function destroy($id)
    {
    	//该分组的使用状况,使用的话,则禁止删除[暂时略][是否使用由具体业务场景判断]
        try{
             //开启事务
             DB::connection()->beginTransaction();
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
     * 设备台账列表批量删除
     * @param ids 要删除的所有id
     * @return 受影响的行数
     * @author hao.li
     * @date  2019/07/29
     */
     public function batchDelete($ids){
        $num=DB::table($this->table)->whereIn('id',$ids)->delete();
        return $num;
    }


    public function  update($input)
    {
        // 唯一性检测
        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('9407','code');


         //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'name'=>$input['name'],
                'device_type'=>$input['device_type'], 
                'spec'=>$input['spec'], 
                'rent_partner'=>$input['rent_partner'], 
                'procude_partner'=>$input['procude_partner'], 
                'supplier'=>$input['supplier'], 
                'useful_life'=>$input['useful_life'], 
                'purchase_time'=>$input['purchase_time'], 
                'initial_price'=>$input['initial_price'], 
                'net_price'=>$input['net_price'], 
                'employee_id'=>$input['employee_id'], 
                'device_sign'=>$input['device_sign'], 
                'use_status'=>$input['use_status'], 
                'use_department'=>$input['use_department'], 
                'use_employee'=>$input['use_employee'], 
                'placement_address'=>$input['placement_address'], 
                'remark'=>$input['remark'], 
            ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            $order_id = $this->save($data,$input['id']);
            if($order_id===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();
        return $order_id;
    }


    /**
     * 查看某条设备台账信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id, $field = null)
    {
         $data = [
            'devicelist.id  as   id',
            'devicelist.code  as    device_code',
            'devicelist.name  as    device_name',
            'devicelist.spec  as   device_spec',
            'devicelist.procude_partner  as   procude_partner',
            'devicelist.id  as   device_id',
            'devicelist.useful_life  as   useful_life',
            'devicelist.purchase_time  as   purchase_time',
            'devicelist.initial_price  as   initial_price',
            'devicelist.net_price  as   net_price',
            'devicelist.placement_address  as   address',
            'devicelist.power  as   power',
            'devicelist.remark  as   remark',
            'rentpartner.id  as   rentpartner_id',
            'rentpartner.name  as   rentpartner_name',
            'rentpartner.code  as   rentpartner_code',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'employee.id  as   employee_id',
            'employee.name  as   employee_name',
            'user.id  as   user_id',
            'user.name  as   user_name',
            'sign.id  as   sign_id',
            'sign.name  as   sign_name',
            'sign.code  as   sign_code',
            'status.id  as   status_id',
            'status.name  as   status_name',
            'status.code  as   status_code',
            'devtype.id  as   devtype_id',
            'devtype.name  as   devtype_name',
            'devtype.code  as   devtype_code',
            'department.id  as   department_id',
            'department.name  as   department_name',
            'team.name as team_name'
        ];

        $field = $field !== null ? $field : $this->primaryKey;

        $obj = DB::table($this->aliasTable['devicelist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['rentpartner'], 'devicelist.rent_partner', '=', 'rentpartner.id')  // 租用单位
            ->leftJoin($this->aliasTable['supplier'], 'devicelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['employee'], 'devicelist.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['user'], 'devicelist.use_employee', '=', 'user.id')
            ->leftJoin($this->aliasTable['sign'], 'devicelist.device_sign', '=', 'sign.id')
            ->leftJoin($this->aliasTable['status'], 'devicelist.use_status', '=', 'status.id')
            ->leftJoin($this->aliasTable['devtype'], 'devicelist.device_type', '=', 'devtype.id')
            ->leftJoin($this->aliasTable['department'], 'devicelist.use_department', '=', 'department.id')
            ->leftJoin('ruis_device_team as team', 'devicelist.operation_team', '=', 'team.id')
            ->where("devicelist.$field", '=', $id)
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }

    // 从Excel文件中读取设备数据
    // $file string|null 指定为null时，将从默认的文件中读取数据
    public function getExceldata($file = null)
    {
        if ($file === null) {
            $file = base_path('storage/exports/device.xlsx');
        }
        $cache = base_path('storage/exports/cache.device.php');
        if (is_file($cache) === true) {
            $data = include($cache);
            if (filemtime($file) === $data['time']) {
                return $data['data'];
            }
        }
        // 加载Excel文件
        $excel = Excel::load($file);
        // 选择标签页
        $sheet = $excel->setActiveSheetIndex(0);
        // 获取行数与列数,注意列数需要转换
        $highestRowNum = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $highestColumnNum = PHPExcel_Cell::columnIndexFromString($highestColumn);
        $usefullColumnNum = $highestColumnNum;
        // 对称数据表内的字段
        $field = [
            0 => 'code',             //编号
            1 => 'asset_code',       //资产编号
            2 => 'name',             //名称
            3 => 'sam',              //规格型号
            4 => 'power',            //功率
            5 => 'weight',            //设备重量
            6 => 'device_type',      //设备类型
            7 => 'use_department',   //使用部门
            8 => 'use_status',       //使用状态
            9 => 'operation_team',   //维修班主
            10 => 'device_sign',      //设备标记
            11 => 'procude_partner', //生产厂商
            12 => 'supplier',        //供应商
            13 => 'employee_id',     //资产负责人
            14 => 'initial_price',   //原始价值
            15 => 'net_price',       //资产价值
            16 => 'placement_address',  //安装地点
            18 => 'purchase_time',     //购买时间
            19 => 'remark'             //备注
        ];
        //开始取出数据并存入数组
        $data = [];
        // 遍历列
        for($i = 2; $i <= $highestRowNum; $i++) { //ignore row 1
            $row = array();
            // 遍历行
            for ($j = 0; $j <= $usefullColumnNum; $j++) {
                // 取列的值
                $cellVal = PHPExcel_Cell::stringFromColumnIndex($j) . $i;
                $cellVal = $excel->getActiveSheet()->getCell($cellVal)->getValue();
                if ($cellVal instanceof \PHPExcel_RichText) {
                    $cellVal = $cellVal->__toString();
                }
                // 过滤 设备编码为空的
                if ($j === 0 && !$cellVal) {
                    break;
                }
                // 过滤 设备类别中不含有“\”的
                if ($j === 6 && strpos($cellVal, '\\') === false) {
                    $row = array();
                    break;
                }
                if (isset($field[$j]) !== true) {
                    continue;
                }
                if ($j === 18) {
                    $cellVal = \PHPExcel_Shared_Date::ExcelToPHP((int) $cellVal);
                }
                $row[$field[$j]] = $cellVal;
            }
            if ($row) $data[$i] = $row;
        }
        $data = array_values($data);
        $data = [
            'time' => filemtime($file),
            'data' => $data
        ];
        file_put_contents($cache, "<?php\n return " . var_export($data, true) . ";");
        return $data['data'];
    }

    // 
    //$data = $this->getExceldata();
    //$this->excelDataSave($data);
    public function excelDataSave($ExcelData) {
        set_time_limit(0);
        // *** PDO
        $pdo = DB::connection()->getPdo();
        // *** 临时缓存，仅限于该方法的生命周期内
        $cache = [
            'a' => [],     //已查询的设备类型缓存
            'b' => [],     //已查询的设备所在车间
            'c' => [],     //已查询的设备使用状态
            'd' => [],     //已查询的设备维修班组
            'e' => [],     //已查询的设备标记
            'f' => [],     //已查询的设备供应商
            'g' => [],     //已查询的设备资产负责人
            'h' => [],     //编码集合
        ];
        // *** 子查询法 二/三级联动查询
        $sq = [];
        $sq[2] = 'SELECT `id` FROM `t` WHERE `name`=? AND `parent_id`=0';
        $sq[3] = 'SELECT `id` FROM `t` WHERE `name`=? AND `parent_id`=(' . $sq[2] . ')';
        // *** 查询设备归属类别
        // 执行查询函数 $bindParams 示例: B类\出胶机\枕头滚胶机
        $GetDeviceType = function ($bindParams) use ($sq) {
            $bindParams = explode('\\', $bindParams);
            $bindParams = array_reverse($bindParams);
            $subQuery = str_replace('`t`', '`ruis_device_type`', $sq[count($bindParams)]);
            $r = DB::select(
                'SELECT
                    `id`, `name`
                FROM
                    `ruis_device_type`
                WHERE
                    `name` = ? AND `parent_id` = (' . $subQuery . ')',
                $bindParams
            );
            return $r ? $r[0] : [];
        };
        // *** 查询设备归属车间
        // 执行查询函数 $bindParams 示例: M2,M3\M2切割车间
        $GetDeviceDepartment = function ($bindParams) use ($sq) {
            $bindParams = explode('\\', $bindParams);
            $bindParams = array_reverse($bindParams);
            $subQuery = str_replace('`t`', '`ruis_device_department`', $sq[2]);
            $r = DB::select(
                'SELECT
                    `id`, `name`
                FROM
                    `ruis_device_department`
                WHERE
                    `name` = ? AND `parent_id` IN (' . $subQuery . ')',
                $bindParams
            );
            return $r ? $r[0] : [];
        };
        // *** 查询设备选型参数
        // 执行查询函数 $name 示例: 在用
        $GetDeviceOption = function ($name, $category_id) {
            $r = DB::select(
                'SELECT
                    `id`, `name`
                FROM
                    `ruis_device_options`
                WHERE
                    `name` = ? AND `category_id` = ?',
                func_get_args()
            );
            return $r ? $r[0] : [];
        };
        // *** 查询设备负责维修的斑组
        $GetDeviceTeam = function ($name) {
            $r = DB::select('SELECT `id` FROM `ruis_device_team` WHERE `name`="'.$name.'"');
            return $r ? $r[0] : [];
        };
        // *** 查询设备供应商
        $GetDeviceSupplier = function ($name) use ($pdo) {
            $name = trim($name);
            $r = DB::select('SELECT `id` FROM `ruis_partner_new` WHERE `name`="'.$name.'"');
            $r = $r ? $r[0] : [];
            if (!$r) {
                $r = $pdo->exec('INSERT INTO `ruis_partner_new`(`id`, `name`, `ceo`, `phone`, `fax`, `address`, `email`, `web`, `info`, `ctime`, `is_customer`, `is_vendor`, `is_processor`, `code`, `has_admin`) VALUES (NULL, "'.$name.'", "", "", "", "", "", "", "", "0", "0", "0", "0", "", "0")');
                if ($r) {
                    $r = new \StdClass();
                    $r->id = $pdo->lastInsertId();
                }
            }
            return $r ? $r : [];
        };
        // *** 查询设备供应商
        $GetDeviceEmployee = function ($name) {
            $name = trim($name);
            $r = DB::select('SELECT `id` FROM `ruis_employee` WHERE `name`="'.$name.'"');
            return $r ? $r[0] : [];
        };
        // *** 查询设备是否已入库
        $CheckDeviceExists = function ($code) {
            $r = DB::select('SELECT `id` FROM `ruis_device_list` WHERE `code`=?', func_get_args());
            return (bool) $r;
        };
        // *** 执行数据库插入
        // 执行结果集
        $result = [
            'FailNoType' => [],             //没有找到设备类型的
            'FailNoDepartment' => [],       //没有找到设备所在车间的
            'FailNoEmployee' => [],         //没有找到设备资产负责人的
            'FailExists' => []
        ];
        // *** SQL语句片段
        $sql = [
            'f' => [],
            'v' => []
        ];
        foreach ($ExcelData as $i => &$data) {
            // 处理设备类型
            $temp = $data['device_type'];
            if (isset($cache['a'][$temp]) === false) {
                $cache['a'][$temp] = $GetDeviceType($temp);
            }
            if (!$cache['a'][$temp]) {
                $result['FailNoType'][] = $data;
                continue;
            }
            $data['device_type'] = $cache['a'][$temp]->id;
            // 处理设备所在车间
            $temp = $data['use_department'];
            if (isset($cache['b'][$temp]) === false) {
                $cache['b'][$temp] = $GetDeviceDepartment($temp);
            }
            if (!$cache['b'][$temp]) {
                $result['FailNoDepartment'][] = $data;
                continue;
            }
            $data['use_department'] = $cache['b'][$temp]->id;
            // 处理设备状态
            $temp = $data['use_status'];
            if (isset($cache['c'][$temp]) === false) {
                $cache['c'][$temp] = $GetDeviceOption($temp, 0);
            }
            $data['use_status'] = $cache['c'][$temp] ? $cache['c'][$temp]->id : '0';
            // 处理设备维修班组
            $temp = $data['operation_team'];
            if (isset($cache['d'][$temp]) === false) {
                $cache['d'][$temp] = $GetDeviceTeam($temp);
            }
            $data['operation_team'] = $cache['d'][$temp] ? $cache['d'][$temp]->id : '0';
            // 处理设备标记
            $temp = $data['device_sign'];
            if (isset($cache['e'][$temp]) === false) {
                $cache['e'][$temp] = $GetDeviceOption($temp, 7);
            }
            $data['device_sign'] = $cache['e'][$temp] ? $cache['e'][$temp]->id : '0';
            // 处理设备供应商
            $temp = $data['supplier'];
            if (isset($cache['f'][$temp]) === false) {
                $cache['f'][$temp] = $GetDeviceSupplier($temp, 7);
            }
            $data['supplier'] = $cache['f'][$temp] ? $cache['f'][$temp]->id : '0';
            // 处理设备资产负责人
            $temp = $data['employee_id'];
            if (isset($cache['g'][$temp]) === false) {
                $cache['g'][$temp] = $GetDeviceEmployee($temp);
            }
            if (!$cache['g'][$temp]) {
                $result['FailNoEmployee'][] = $data;
                continue;
            }
            $data['employee_id'] = $cache['g'][$temp]->id;
            // 设备已存在
            if (in_array($data['code'], $cache['h']) === true || $CheckDeviceExists($data['code']) === true) {
                $result['FailExists'][] = $data;
                continue;
            }
            $cache['h'][] = $data['code'];
            // 设备原始价值
            $data['initial_price'] = $data['initial_price'] ? floatval($data['initial_price']) : 0.0;
            // 设备资产净值
            $data['net_price'] = $data['net_price'] ? floatval($data['net_price']) : 0.0;
            $data['spec'] = $data['sam'];
            // 构成SQL
            if (!$sql['f']) {
                $sql['f'] = array_keys($data);
            }
            foreach ($data as $f => &$v) {
                $v = $pdo->quote($v);
            }
            $sql['v'][] = '(' . implode(', ', $data) . ')';
        }
        if ($sql['f']) {
            $sql = 'INSERT INTO `ruis_device_list`(`' . implode('`, `', $sql['f']) . '`) VALUES ' . implode(', ', $sql['v']);
            $result['insertNum'] = $pdo->exec($sql);
        } else {
            $result['insertNum'] = 0;
        }
        //print_r($result);
    }


    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
       //$input['page_no']、$input['page_size   检验是否存在参数
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8211','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort'])) {
            $input['order']='desc';
            $input['sort']='id';
        }
        $where = $this->_search($input);
        $data = [
            'devicelist.id  as   id',
            'devicelist.code  as    device_code',
            'devicelist.name  as    device_name',
            'devicelist.spec  as   device_spec',
            'devicelist.procude_partner  as   procude_partner',
            'devicelist.id  as   device_id',
            'devicelist.useful_life  as   useful_life',
            'devicelist.purchase_time  as   purchase_time',
            'devicelist.initial_price  as   initial_price',
            'devicelist.net_price  as   net_price',
            'devicelist.placement_address  as   address',
            'devicelist.remark  as   remark',
            'rentpartner.id  as   rentpartner_id',
            'rentpartner.name  as   rentpartner_name',
            'rentpartner.code  as   rentpartner_code',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'employee.id  as   employee_id',
            'employee.name  as   employee_name',
            'user.id  as   user_id',
            'user.name  as   user_name',
            'sign.id  as   sign_id',
            'sign.name  as   sign_name',
            'sign.code  as   sign_code',
            'status.id  as   status_id',
            'status.name  as   status_name',
            'status.code  as   status_code',
            'devtype.id  as   devtype_id',
            'devtype.name  as   devtype_name',
            'devtype.code  as   devtype_code',
            'department.id  as   department_id',
            'department.name  as   department_name',
        ];



          $obj_list=DB::table($this->aliasTable['devicelist'])
            ->select($data)
            ->leftJoin($this->aliasTable['rentpartner'], 'devicelist.rent_partner', '=', 'rentpartner.id')  // 租用单位
            ->leftJoin($this->aliasTable['supplier'], 'devicelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['employee'], 'devicelist.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['user'], 'devicelist.use_employee', '=', 'user.id')
            ->leftJoin($this->aliasTable['sign'], 'devicelist.device_sign', '=', 'sign.id')
            ->leftJoin($this->aliasTable['status'], 'devicelist.use_status', '=', 'status.id')
            ->leftJoin($this->aliasTable['devtype'], 'devicelist.device_type', '=', 'devtype.id')
            ->leftJoin($this->aliasTable['department'], 'devicelist.use_department', '=', 'department.id')
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        // $obj_list->total_count = DB::table($this->aliasTable['devicelist'])->where($where)->count();
        $obj_list->total_count = DB::table($this->aliasTable['devicelist'])->select($data) ->leftJoin($this->aliasTable['department'], 'devicelist.use_department', '=', 'department.id')->where($where)->count();
        return $obj_list;
    }   /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageLists($input)
    {
       //$input['page_no']、$input['page_size   检验是否存在参数
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8211','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }


          $where = $this->_search($input);

           $data = [
            'devicelist.id  as   id',
            'devicelist.code  as    code',
            'devicelist.name  as    name',

        ];
          $obj_list=DB::table($this->aliasTable['devicelist'])
            ->select($data)

            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['devicelist'])->where($where)->count();
        return $obj_list;
    }


    // 搜索方法
    public  function _search($input)
    {
    	$where  =  array();
    	if (isset($input['device_type']) && $input['device_type']) {//根据设备类型
            $where[]=['devicelist.device_type','=', \urldecode($input['device_type'])];
        }
        if (isset($input['device_code']) && $input['device_code']) {//根据设备编码
            $where[]=['devicelist.code','like','%'.\urldecode($input['device_code']).'%'];
        }
        if (isset($input['device_name']) && $input['device_name']) {//根据设备编码
            $where[]=['devicelist.name','like','%'.\urldecode($input['device_name']).'%'];
        }
        if (isset($input['name']) && $input['name']) {//根据设备编码
            $where[]=['devicelist.name','like','%'.\urldecode($input['name']).'%'];
        }
        if (isset($input['department_name']) && $input['department_name']) {//根据使用部门
            $where[]=['department.name','like','%'.\urldecode($input['department_name']).'%'];
        }
        if (isset($input['placement_address']) && $input['placement_address']) {//根据使用部门
            $where[]=['devicelist.placement_address','like','%'.\urldecode($input['placement_address']).'%'];
        }
    	return  $where;
    }

    //检验excel表格设备编码是否重复
    public function checkExcel($data){
        \set_time_limit(0);
        $k=0;
        $excel=[];
        for($i=1;$i<count($data);$i++){
            if(empty($data[$i]['code'])) continue;
            for($j=$i+1;$j<=count($data);$j++){
                if($data[$i]['code']==$data[$j]['code']){
                    $excel[$k]['code']=$data[$i]['code'];
                    $k++;
                }
            }
        }
        if(!empty($excel)){
            $string='';
            foreach($excel as $k=>$v){
                $string=$string.'['.$v['code'].']'.',';
            }
            TEPA('以下设备编码在excel表格中重复：'.$string.'请检查表格！');
        } 
    }

    //检查表格中设备编码是否已经导入
    public function checkMysql($data){
        \set_time_limit(0);
        $list=[];
        $sameCode=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            $list=DB::table('ruis_device_list')
                  ->where('code',$value['code'])
                  ->select('ruis_device_list.*')
                  ->get();
            if(!empty($list[0])){
                $sameCode[$i]['code']=$value['code'];
                $i++;
            }
        }
        if(!empty($sameCode)){
            $string='';
            foreach($sameCode as $k=>$v){
                $string=$string.'['.$v['code'].',';
            }
            TEPA('以下设备编码已导入：'.$string.'请检查表格！');
        } 
        return $sameCode;
    }

    //检查设备类型是否存在
    public function checkDeviceType($data){
        \set_time_limit(0);
        $deviceType=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            if(empty($value['device_type'])) continue;
            $deviceTypeData=explode('\\',$value['device_type']);
            //三级联动
            if(count($deviceTypeData)==2){
                $deviceTypeId=DB::table('ruis_device_type as a1')->select('a1.id')
                            ->leftJoin('ruis_device_type as a2','a2.id','a1.parent_id')
                            ->where('a2.name',$deviceTypeData[0])
                            ->where('a2.parent_id',0)
                            ->where('a1.name',$deviceTypeData[1])
                            ->first();
            }else{
                $deviceTypeId=DB::table('ruis_device_type as a1')->select('a1.id')
                            ->leftJoin('ruis_device_type as a2','a2.id','a1.parent_id')
                            ->leftJoin('ruis_device_type as a3','a3.id','a2.parent_id')
                            ->where('a3.name',$deviceTypeData[0])
                            ->where('a3.parent_id',0)
                            ->where('a2.name',$deviceTypeData[1])
                            ->where('a1.name',$deviceTypeData[2])
                            ->first();
            };
            if(empty($deviceTypeId->id)){
                $deviceType[$i]['device_type']=$value['device_type'];
                $i++;
            }
        }
        if(!empty($deviceType)){
            $string='';
            foreach($deviceType as $k=>$v){
                $string=$string.'['.$v['device_type'].',';
            }
            TEPA('以下设备类型在系统中不存在：'.$string.'请检查表格或维护！');
        } 
        return $deviceType;  
    }

    //检查部门名称是否存在
    public function checkDepartment($data){
        \set_time_limit(0);
        $department=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            if(empty($value['use_department'])) continue;
            $departmentData=explode('\\',$value['use_department']);
            //两级联动
            $departmentId=DB::table('ruis_device_department as a1')->select('a1.id')
                        ->leftJoin('ruis_device_department as a2','a2.id','a1.parent_id')
                        ->where('a2.name',$departmentData[0])
                        ->where('a2.parent_id',0)
                        ->where('a1.name',$departmentData[1])
                        ->first();
            if(empty($departmentId->id)){
                $department[$i]['use_department']=$value['use_department'];
                $i++;
            }
        }
        if(!empty($department)){
            $string='';
            foreach($department as $k=>$v){
                $string=$string.'['.$v['use_department'].',';
            }
            TEPA('以下使用部门在系统中不存在：'.$string.'请检查表格或维护！');
        } 
        return $department;
    }

    //检查使用状况
    public function checkOptions($data){
        \set_time_limit(0);
        $options=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            if(empty($value['use_status'])) continue;
            $optionsId=DB::table('ruis_device_options')->select('id')->where('name',$value['use_status'])->first();
            if(empty($optionsId->id)){
                $options[$i]['use_status']=$value['use_status'];
                $i++;
            }
        }
        if(!empty($options)){
            $string='';
            foreach($options as $k=>$v){
                $string=$string.'['.$v['use_status'].',';
            }
            TEPA('以下使用状况在系统中不存在：'.$string.'请检查表格！');
        } 
        return $options;
    }

    //检查维修班组
    public function checkTeam($data){
        \set_time_limit(0);
        $team=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            if(empty($value['operation_team'])) continue;
            $teamId=DB::table('ruis_device_team')->select('id')->where('name',$value['operation_team'])->first();
            if(empty($teamId->id)){
                $team[$i]['operation_team']=$value['operation_team'];
                $i++;
            }
        }
        if(!empty($team)){
            $string='';
            foreach($team as $k=>$v){
                $string=$string.'['.$v['operation_team'].',';
            }
            TEPA('以下维修班组在系统中不存在：'.$string.'请检查表格或维护！');
        } 
        return $team;
    }

    //检查设备标记
    public function checkSign($data){
        \set_time_limit(0);
        $sign=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            if(empty($value['device_sign'])) continue;
            $signId=DB::table('ruis_device_options')->select('id')->where('name',$value['device_sign'])->first();
            if(empty($signId->id)){
                $sign[$i]['device_sign']=$value['device_sign'];
                $i++;
            }
        }
        if(!empty($sign)){
            $string='';
            foreach($sign as $k=>$v){
                $string=$string.'['.$v['device_sign'].',';
            }
            TEPA('以下设备标记在系统中不存在：'.$string.'请检查表格！');
        } 
        return $sign;
    }

    //检查供应商是否存在
    public function checkPartner($data){
        \set_time_limit(0);
        $partner=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            if(empty($value['supplier'])) continue;
            $partnerId=DB::table('ruis_partner_new')->select('id')->where('name',$value['supplier'])->first();
            if(empty($partnerId->id)){
                $partner[$i]['supplier']=$value['supplier'];
                $i++;
            }
        }
        if(!empty($partner)){
            $string='';
            foreach($partner as $k=>$v){
                $string=$string.'['.$v['supplier'].',';
            }
            TEPA('以下供应商在系统中不存在：'.$string.'请检查表格或维护！');
        } 
        return $partner;
    }

    //检查资产负责人是否存在
    public function checkEmployee($data){
        \set_time_limit(0);
        $employee=[];
        $i=0;
        foreach ($data as $key => $value) {
            if(empty($value['code'])) continue;
            if(empty($value['employee_id'])) continue;
            $value['employee_id']=preg_replace('# #','',$value['employee_id']);
            $employeeId=DB::table('ruis_employee')->select('id')->where('name',$value['employee_id'])->first();
            if(empty($employeeId->id)){
                $employee[$i]['employee_id']=$value['employee_id'];
                $i++;
            }
        }
        if(!empty($employee)){
            $string='';
            foreach($employee as $k=>$v){
                $string=$string.'['.$v['employee_id'].',';
            }
            TEPA('以下资产负责人在系统中不存在：'.$string.'请检查表格！');
        } 
        return $employee;
    }
    
    //保存数据
    public function saveInitial($data){
        \set_time_limit(0); 
        foreach ($data as $key => $value) {
            //设备类型
            if(!empty($value['device_type'])){
                $deviceTypeData=explode('\\',$value['device_type']);
                if(count($deviceTypeData)==2){
                    $deviceTypeId=DB::table('ruis_device_type as a1')->select('a1.id')
                    ->leftJoin('ruis_device_type as a2','a2.id','a1.parent_id')
                    ->where('a2.name',$deviceTypeData[0])
                    ->where('a2.parent_id',0)
                    ->where('a1.name',$deviceTypeData[1])
                    ->first();
                }else{
                    $deviceTypeId=DB::table('ruis_device_type as a1')->select('a1.id')
                                ->leftJoin('ruis_device_type as a2','a2.id','a1.parent_id')
                                ->leftJoin('ruis_device_type as a3','a3.id','a2.parent_id')
                                ->where('a3.name',$deviceTypeData[0])
                                ->where('a3.parent_id',0)
                                ->where('a2.name',$deviceTypeData[1])
                                ->where('a1.name',$deviceTypeData[2])
                                ->first();
                };
            }
            //部门名称
            if(!empty($value['use_department'])){
                $departmentData=explode('\\',$value['use_department']);
                $departmentId=DB::table('ruis_device_department as a1')->select('a1.id')
                            ->leftJoin('ruis_device_department as a2','a2.id','a1.parent_id')
                            ->where('a2.name',$departmentData[0])
                            ->where('a2.parent_id',0)
                            ->where('a1.name',$departmentData[1])
                            ->first();
            }
            if(!empty($value['use_status'])){
                //使用状况
                $optionsId=DB::table('ruis_device_options')->select('id')->where('name',$value['use_status'])->first();
            }
            if(!empty($value['operation_team'])){
                //维修班组
                $teamId=DB::table('ruis_device_team')->select('id')->where('name',$value['operation_team'])->first();
            }
            if(!empty($value['device_sign'])){
                //设备标记
                $signId=DB::table('ruis_device_options')->select('id')->where('name',$value['device_sign'])->first();
            }
            //供应商
            if(!empty($value['supplier'])){
                $partnerId=DB::table('ruis_partner_new')->select('id')->where('name',$value['supplier'])->first();
            }
            if(!empty($value['employee_id'])){
                //资产负责人
                $value['employee_id']=preg_replace('# #','',$value['employee_id']);
                $employeeId=DB::table('ruis_employee')->select('id')->where('name',$value['employee_id'])->first();
            }

            $insertData=[
                'code'=>$value['code'],
                'asset_code'=>$value['asset_code'],
                'name'=>$value['name'],
                'sam'=>$value['sam'],
                'power'=>$value['power'],
                'weight'=>empty($value['weight'])?'':$value['weight'],
                'operation_team'=>empty($value['operation_team'])?'':$teamId->id,
                'experience_type'=>0,
                'device_type'=>empty($value['device_type'])?'':$deviceTypeId->id,
                'rent_partner'=>empty($value['rent_partner'])?'':$value['rent_partner'],
                'procude_partner'=>empty($value['procude_partner'])?'':$value['procude_partner'],
                'supplier'=>empty($value['supplier'])?'':$partnerId->id,
                'useful_life'=>0,
                'purchase_time'=>empty($value['purchase_time'])?'':\strtotime($value['purchase_time']),
                'initial_price'=>empty($value['initial_price'])?0:$value['initial_price'],
                'net_price'=>empty($value['net_price'])?0:$value['net_price'],
                'employee_id'=>empty($value['employee_id'])?'':$employeeId->id,
                'device_sign'=>empty($value['device_sign'])?'':$signId->id,
                'use_status'=>empty($value['use_status'])?'':$optionsId->id,
                'use_department'=>empty($value['use_department'])?'':$departmentId->id,
                'use_employee'=>0,
                'placement_address'=>empty($value['placement_address'])?'':$value['placement_address'],
                'ctime'=>0,
                'spec'=>empty($value['sam'])?'':$value['sam'],
                'creator'=>'',
                'remark'=>empty($value['remark'])?'':$value['remark']
            ];
            $insertId=DB::table('ruis_device_list')->insertGetId($insertData);
        }
        return $insertId;
    }
}