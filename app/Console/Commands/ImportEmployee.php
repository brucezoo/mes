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
use Maatwebsite\Excel\Facades\Excel;

class ImportEmployee extends Command
{
    protected $signature = 'import:employee';
    protected $description = '导入员工信息';

    protected $fileName = 'import.xlsx';
    protected $path;

    protected $departmentArr = [];

    protected $factoryArr = [];
    protected $positionArr = [];

    protected $repeatNameArr = [];

    protected $date;

    public function __construct()
    {
        parent::__construct();
        $this->path = storage_path('app/public') . DIRECTORY_SEPARATOR . 'excel' . DIRECTORY_SEPARATOR;
        $this->date = strtotime(date('Y-m-d'), time());

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

        if (empty($excelDataArr) || count($excelDataArr[0]) != 9) {
            echo '参数错误:' . json_encode($excelDataArr[0]);
            die();
        }
        unset($excelDataArr[0]);

        $companyID = 15;
        try {
            DB::connection()->beginTransaction();
            foreach ($excelDataArr as $value) {
                $name = $value[0];
                $departmentStr = $value[1];
                $produceSection = $value[2];
                $role = $value[3];
                $isAdmin = $value[4] == '是' ? 1 : 0;
                $adminName = $value[5];
                $adminPwd = $value[6];
                $number = $value[7];

                $departmentID = $this->getDepartmentID($departmentStr);
                $factoryIDAndWorkshopIDArr = $this->getFactoryAndShop($produceSection);
                $positionID = $this->getPositionID($role);

                $employeeKeyVal = [
                    'name' => $name,
                    'gender' => 1,
                    'creator_id' => 73,    //admin账号
                    'department_id' => $departmentID,
                    'position_id' => $positionID,
                    'status_id' => 1,
                    'resignation_date' => $this->date,
                    'ctime' => time(),
                    'mtime' => time(),
                    'card_id' => $number,
                    'password' => '123456',
                    'company_id' => $companyID,
                    'factory_id' => $factoryIDAndWorkshopIDArr['factory_id'],
                    'workshop_id' => $factoryIDAndWorkshopIDArr['workshop_id'],
                    'is_admin' => $isAdmin,
                    'dep_factory_id' => $departmentID
                ];
                $employeeObj = DB::table(config('alias.re'))
                    ->select(['id'])
                    ->where('name', $name)
                    ->first();
                // 如果 员工表已存在，查询出ID
                if (!empty($employeeObj)) {
                    array_push($this->repeatNameArr, $name);
                    echo 'Employee:' . $name . "已存在(ID:$employeeObj->id)" . PHP_EOL;
                    DB::table(config('alias.re'))->where('id',$employeeObj->id)->update([
                        'factory_id' => $factoryIDAndWorkshopIDArr['factory_id'],
                        'workshop_id' => $factoryIDAndWorkshopIDArr['workshop_id'],
                    ]);
                    $employeeID = $employeeObj->id;
                } else {
                    echo 'Adding employee:' . $name . PHP_EOL;
                    $employeeID = DB::table(config('alias.re'))->insertGetId($employeeKeyVal);
                    echo 'Added employee:' . $employeeID . PHP_EOL;
                }

                if ($isAdmin) {
                    $adminKeyVal = [
                        'company_id' => $companyID,
                        'factory_id' => $factoryIDAndWorkshopIDArr['factory_id'],
                        'name' => $adminName,
                        'cn_name' => $name,
                        'sex' => 1,
                        'salt' => '999_emi2c_!@#$%',
                        'password' => encrypted_password($adminPwd, '999_emi2c_!@#$%'),
                        'status' => 1,
                        'created_at' => date('y-m-d H:i:s', time()),
                        'employee_id' => $employeeID
                    ];
                    $adminObj = DB::table(config('alias.rrad'))
                        ->select('id')
                        ->where('name', $adminName)
                        ->first();
                    if (!empty($adminObj)) {
                        array_push($this->repeatNameArr, $adminName . ':' . $name);
                        echo 'Admin:' . $name . '--' . $adminName . "已存在(ID:$adminObj->id)" . PHP_EOL;
                        $adminID = $adminObj->id;
                        DB::table(config('alias.rrad'))->where('id', $adminID)->update([
                            'factory_id' => $factoryIDAndWorkshopIDArr['factory_id']
                        ]);
                    } else {
                        echo 'Adding admin:' . $adminName . PHP_EOL;
                        $adminID = DB::table(config('alias.rrad'))->insertGetId($adminKeyVal);
                        echo 'Added admin:' . $adminID . PHP_EOL;

                        if ($adminID) {
                            $roleIDArr = $this->getRoleID($positionID);
                            $identityKeyValArr = [];
                            foreach ($roleIDArr as $roleID) {
                                $identityKeyValArr[] = [
                                    'admin_id' => $adminID,
                                    'role_id' => $roleID
                                ];
                            }
                            !empty($identityKeyValArr) && DB::table(config('alias.rri'))->insert($identityKeyValArr);
                        }
                    }
                    DB::table(config('alias.re'))->where('id', $employeeID)->update(['admin_id' => $adminID]);
                    DB::table(config('alias.rrad'))->where('id', $adminID)->update(['employee_id' => $employeeID]);
                }
            }
            echo '下列用户已存在：' . implode(',', $this->repeatNameArr);
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            echo $e->getTraceAsString();
        }
        DB::connection()->commit();

    }

    /**
     * 获取部门ID
     *
     * @param $departmentName
     * @return int
     */
    public function getDepartmentID($departmentName)
    {
        if (empty($departmentName)) {
            return 0;
        }

        //如果 部门表里存在，则直接返回。否则，就去数据库查询。
        if (isset($this->departmentArr[$departmentName])) {
            return $this->departmentArr[$departmentName];
        } else {
            $obj = DB::table(config('alias.rd'))
                ->select('id')
                ->where('name', $departmentName)
                ->first();
            if (empty($obj)) {
                return 0;
            }
            $this->departmentArr[$departmentName] = $obj->id;
            return $obj->id;
        }
    }

    /**
     * 获取工厂和车间ID
     *
     * @param $string
     * @return array
     */
    public function getFactoryAndShop($string)
    {
        if (empty($string)) {
            return [
                'factory_id' => 0,
                'workshop_id' => 0,
            ];
        }

        //分隔，获取 工厂和车间编码
        $tempArr = explode('-', $string, 2);
        $factoryCode = get_value_or_default($tempArr, 0, '');
        $workshopCode = get_value_or_default($tempArr, 1, '');

        $factoryID = 0;
        $workshopID = 0;
        /**
         * 获取工厂ID。
         */
        if (isset($this->factoryArr[$factoryCode])) {
            $factoryID = $this->factoryArr[$factoryCode];
        } else {
            $factoryObj = DB::table(config('alias.rf'))
                ->select('id')
                ->where('code', $factoryCode)
                ->first();
            if (isset($factoryObj->id)) {
                $factoryID = $factoryObj->id;
                $this->factoryArr[$factoryCode] = $factoryID;
            }
        }

        /**
         * 根据工厂ID和车间code获取车间ID
         */
        $workshopObj = DB::table(config('alias.rws'))
            ->select('id')
            ->where([
                ['factory_id', '=', $factoryID],
                ['code', '=', $workshopCode]
            ])
            ->first();
        if (isset($workshopObj->id)) {
            $workshopID = $workshopObj->id;
        }

        return [
            'factory_id' => $factoryID,
            'workshop_id' => $workshopID,
        ];
    }

    /**
     * 获取岗位ID
     * @param $positionName
     * @return int|mixed
     */
    public function getPositionID($positionName)
    {
        if (empty($positionName)) {
            return 0;
        }

        if (isset($this->positionArr[$positionName])) {
            return $this->positionArr[$positionName];
        } else {
            $obj = DB::table(config('alias.rep'))
                ->select('id')
                ->where('name', $positionName)
                ->first();
            if (empty($obj)) {
                return 0;
            }
            $this->positionArr[$positionName] = $obj->id;
            return $obj->id;
        }
    }

    /**
     * 获取该职位对应的role_id
     *
     * @param $positionID
     * @return array
     */
    public function getRoleID($positionID)
    {
        $objs = DB::table(config('alias.repr'))
            ->select('role_id')
            ->where('position_id', '=', $positionID)
            ->get();
        $roleIDArr = [];
        foreach ($objs as $obj) {
            $roleIDArr[$obj->role_id] = $obj->role_id;
        }
        return array_values($roleIDArr);
    }
}