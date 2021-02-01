<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/12/4
 * Time: 12:01 PM
 */
namespace App\Http\Models\NewOldMaterialCode;

use App\Http\Models\Base;

class NewOldMaterialCode extends Base{

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 导入新老编码的对照
     * @param array $data
     * @throws \App\Exceptions\ApiException
     */
    public function importNewOldMaterialCode($data){
        $add_data = [];
        //导入这边可以采用比较暴力的方式
        //先找出所有新编码
        foreach ($data as $k=>$v){
            $add_data[$v['new_code']] = [
                'old_code'=>$v['old_code'],
                'new_code'=>$v['new_code']
            ];
        }
        try{
            DB::connection()->beginTransaction();
            //找出所有已经有的新老对照的做删除
            DB::table(config('alias.rtnomc'))->whereIn('new_code',array_keys($add_data))->delete();
            //添加新的
            DB::table(config('alias.rtnomc'))->insert($add_data);
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 列表显示
     * @param $input
     * @return mixed
     */
    public function newOldCodeMaterialIndex(&$input){
        $where = [];
        if(!empty($input['new_code'])) $where[] = ['new_code','=',$input['new_code']];
        if(!empty($input['old_code'])) $where[] = ['old_code','=',$input['old_code']];
        $builder = DB::table(config('alias.rtnomc'))->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['order']) && !empty($input['sort'])) $builder->orderBy($input['sort'],$input['order']);
        $obj_list = $builder->get();
        return $obj_list;
    }
}