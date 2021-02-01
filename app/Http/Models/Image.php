<?php
/**
 * Created by PhpStorm.
 * User: weihao
 * Date: 18/1/15
 * Time: 上午11:17
 */

namespace App\Http\Models;//定义命名空间
use App\Exceptions\ApiException;
use App\Http\Models\Encoding\EncodingSetting;
use App\Libraries\Trace;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Libraries\Thumb;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Redis;

/**
 * 图纸库
 * @author  weihao
 * @time    2017年1月15日 16:29
 */
class Image extends Base
{

    public $apiPrimaryKey = 'drawing_id';
    protected $prohibited_extensions = ['php', 'sh'];

    public function __construct()
    {
        $this->table = config('alias.rdr');
    }


//region 检

    /**
     * 检查传入的参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @since lester.you 去除名称和属性唯一性判断
     * @since lester.you 对关联图纸的数据的判断
     */
    public function checkFormFields(&$input)
    {
        //检查图纸参数
        $this->checkDrawings($input);

        //检查图纸属性参数
        $imageAttributeDao = new ImageAttribute();
        $imageAttributeDao->checkFormFields($input);
//        $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
//        $has_name_attribute = $this->isExisted([['name', '=', $input['name']], ['search_string', '=', $search_str],['id','<>',$input['drawing_id']]], $this->table);
//        if ($has_name_attribute) {
//            TEA('1106');
//        }
        //检测图纸关联参数
        if (!empty($input['links']) && is_json($input['links'])) {
            $linkArr = json_decode($input['links'], true);
            $idArr = [];
            $input['linkArr'] = [];
            foreach ($linkArr as $key => $value) {
                if (!isset($value['link_id']) || !isset($value['count']) || !is_numeric($value['link_id']) || !is_numeric($value['count'])) {
                    TEA('700', 'links');
                }
                $idArr[] = intval($value['link_id']);
                $input['linkArr'][intval($value['link_id'])] = $value;
            }
            //判断关联图纸是否存在
            $obj_count = DB::Table($this->table)
                ->whereIn('id', array_unique($idArr))
                ->count();
            if ($obj_count != count(array_unique($idArr))) TEA('1109');
        } else {
            $input['linkArr'] = [];
        }

        //检测附件关联参数
        if (!empty($input['attachments']) && is_json($input['attachments'])) {
            $attachmentArr = json_decode($input['attachments'], true);
            $idArr = [];
            $input['attachmentsArr'] = [];
            foreach ($attachmentArr as $index => $value) {
                if (!isset($value['attachment_id']) || !is_numeric($value['attachment_id'])) {
                    TEA('700', 'attachments');
                }
                $idArr[] = $value['attachment_id'];
                $input['attachmentsArr'][$value['attachment_id']] = $value;
            }
            //判断附件是否存在
            $obj_count = DB::Table(config('alias.attachment'))
                ->whereIn('id', array_unique($idArr))
                ->count();
            if ($obj_count != count(array_unique($idArr))) TEA('1110');
        } else {
            $input['attachmentsArr'] = [];
        }


    }


    /**
     * 检查传入的图纸参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function checkDrawings(&$input)
    {
        if (empty($input['drawing_id'])) TEA('700', 'drawing_id');
        if (!isset($input['comment'])) TEA('700', 'comment');
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['name'])) TEA('700', 'name');
        $has = $this->isExisted([['id', '=', $input['category_id']]], config('alias.rdc'));
        if (!$has) TEA('700', 'category_id');
        $input['group_id'] = isset($input['group_id']) ? $input['group_id'] : 0;
        if ($input['group_id']) {
            $has = $this->isExisted([['id', '=', $input['group_id']]], config('alias.rdg'));
            if (!$has) TEA('700', 'group_id');
        }
        if (empty($input['code'])) {
            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $input['code'] = $res['code'];
        }
//        $has = $this->isExisted([['id', '<>', $input['drawing_id']], ['code', '=', $input['code']], ['status', '=', 1]]);
//        if ($has) TEA('700', 'code');

        $emi2c_mes_code_url = storage_path('app/public') . DIRECTORY_SEPARATOR;
        $newCategory = $this->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));//新上传的分类
        //新的分类指向的图纸文件夹
        $newImageDirPath = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;

        //判断数据库图纸记录存不存在
        $drawing = $this->getRecordById($input[$this->apiPrimaryKey], ['image_path', 'image_name', 'status', 'category_id']);
        if (!$drawing) TEA('1116');
        //判断文件存不存在
        $path = $emi2c_mes_code_url . $drawing->image_path;
        if (!is_file($path)) TEA('1113');
        //如果图纸分类改变则需要移动图纸
        if ($drawing->category_id != $input['category_id']) {
            $oldCategory = $this->getRecordById($drawing->category_id, ['owner'], config('alias.rdc'));
            //旧的分类指向的图纸文件夹
            $oldImageDirPath = config('app.drawing_library') . $oldCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;
            $res = Storage::disk('public')->move($oldImageDirPath . $drawing->image_name, $newImageDirPath . $drawing->image_name);
            if (!$res) TEA('500');//未知名错误
            //记录一下新的图纸路径
            $v['image_path'] = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR . $drawing->image_name;
            //缩略图也需要移动
            if (in_array($newCategory->owner, Thumb::$sizes)) {
                $tempArr = explode('/', $drawing->image_path);
                $imageName = end($tempArr);
                $imageMake = explode('.', $imageName);
                foreach (Thumb::$sizes[$newCategory->owner] as $size) {
                    $thumbImageName = $imageMake[0] . $size . '.' . Thumb::IMG_EXT;
                    //原文件夹有的缩略图则移动，没有的需要新生成
                    if (is_file(storage_path('app/public') . DIRECTORY_SEPARATOR . $oldImageDirPath . $thumbImageName)) {
                        $res = Storage::disk('public')->move($oldImageDirPath . $thumbImageName, $newImageDirPath . $thumbImageName);
                        if (!$res) TEA('500');
                    } else {
                        Thumb::createOnlyDrawingThump($v['image_path'], $newCategory->owner);//生成缩略图
                    }
                }
            }
        }

    }

    /**
     * 批量上传图片 参数检查
     *
     * @param $input
     * @throws ApiException
     * @author lester.you
     */
    public function checkBatchStore(&$input)
    {
        if (empty($input['category_id'])) TEA('700', 'category_id');
        $has = $this->isExisted([['id', '=', $input['category_id']]], config('alias.rdc'));
        if (!$has) TEA('700', 'category_id');

        if (empty($input['group_id'])) TEA(700, 'group_id');
        $has = $this->isExisted([['id', '=', $input['group_id']]], config('alias.rdg'));
        if (!$has) TEA('700', 'group_id');

        if (empty($input['drawings'])) TEA(700, 'drawings');
        foreach ($input['drawings'] as &$drawingItem) {
            if (empty($drawingItem['drawing_id'])) TEA(700, 'drawing_id');
            $has = $this->isExisted([['id', '=', $drawingItem['drawing_id']]]);
            if (!$has) TEA('700', 'drawing_id');

            if (!isset($drawingItem['name'])) TEA(700, 'name');
            strripos($drawingItem['name'], '.') != 0 && $drawingItem['name'] = substr($drawingItem['name'], 0, strripos($drawingItem['name'], '.'));

            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $drawingItem['code'] = $res['code'];

            // 检查洗标参数
            (new CareLabel())->checkCareLabel($drawingItem);

            /**
             * 检查 分类并判断是否需要移动文件位置
             */
            $emi2c_mes_code_url = storage_path('app/public') . DIRECTORY_SEPARATOR;
            $newCategory = $this->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));//新上传的分类
            //新的分类指向的图纸文件夹
            $newImageDirPath = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;

            //判断数据库图纸记录存不存在
            $drawing = $this->getRecordById($drawingItem[$this->apiPrimaryKey], ['image_path', 'image_name', 'status', 'category_id']);
            if (!$drawing) TEA('1116');
            //判断文件存不存在
            $path = $emi2c_mes_code_url . $drawing->image_path;
            if (!is_file($path)) TEA('1113');
            //如果图纸分类改变则需要移动图纸
            if ($drawing->category_id != $input['category_id']) {
                $oldCategory = $this->getRecordById($drawing->category_id, ['owner'], config('alias.rdc'));
                //旧的分类指向的图纸文件夹
                $oldImageDirPath = config('app.drawing_library') . $oldCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR;
                $res = Storage::disk('public')->move($oldImageDirPath . $drawing->image_name, $newImageDirPath . $drawing->image_name);
                if (!$res) TEA('500');//未知名错误
                //记录一下新的图纸路径
                $v['image_path'] = config('app.drawing_library') . $newCategory->owner . DIRECTORY_SEPARATOR . date('Y-m-d') . DIRECTORY_SEPARATOR . $drawing->image_name;
                //缩略图也需要移动
                if (in_array($newCategory->owner, Thumb::$sizes)) {
                    $tempArr = explode('/', $drawing->image_path);
                    $imageName = end($tempArr);
                    $imageMake = explode('.', $imageName);
                    foreach (Thumb::$sizes[$newCategory->owner] as $size) {
                        $thumbImageName = $imageMake[0] . $size . '.' . Thumb::IMG_EXT;
                        //原文件夹有的缩略图则移动，没有的需要新生成
                        if (is_file(storage_path('app/public') . DIRECTORY_SEPARATOR . $oldImageDirPath . $thumbImageName)) {
                            $res = Storage::disk('public')->move($oldImageDirPath . $thumbImageName, $newImageDirPath . $thumbImageName);
                            if (!$res) TEA('500');
                        } else {
                            Thumb::createOnlyDrawingThump($v['image_path'], $newCategory->owner);//生成缩略图
                        }
                    }
                }
            }
        }

    }

//endregion


//region 增

    /**
     * 添加图纸
     * @param array
     * @return int 插入记录的主键
     * @author  hao.wei  <weihao>
     * @throws ApiException
     */
    public function addDrawing($data)
    {
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) {
            if (is_file($data['image_path']) && is_readable($data['image_path'])) {
                Storage::disk('emi2c-mes')->delete($data['image_path']);
            }
            TEA('802');
        }
        return $insert_id;
    }

    /**
     * 添加图片
     * @param array
     * @return int 插入记录的主键
     * @author Ming.Li
     * @throws ApiException
     */
    public function addPicture($data)
    {
        $insert_id = DB::table('ruis_picture')->insertGetId($data);
        if (!$insert_id) {
            if (is_file($data['image_path']) && is_readable($data['image_path'])) 
            {
                Storage::disk('public')->delete($data['image_path']);
            }
            TEA('802');
        }
        return $insert_id;
    }


    /**
     * 添加图纸库图纸属性及图纸关联属性
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @since 20180622 lester.you
     */
    public function save($input)
    {
        /**
         * 判断当前是否已经保存过。
         * 防止因为网络问题，重复提交。
         * 原理： 判断code是否为空
         */
        $has_code = DB::table($this->table)->select(['id', 'code'])->where('id', '=', $input['drawing_id'])->first();
        if (!empty($has_code->code)) {
            TEA('1115');
        }

        /**
         * 验证code是否被使用
         */
        $code_is_existed = DB::table($this->table)->select(['id', 'code'])->where('code', '=', $input['code'])->count();
        if ($code_is_existed) {
            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $input['code'] = $res['code'];
        }

        $encodingDao = new EncodingSetting();
        $input['code'] = $encodingDao->useEncoding(6, $input['code']);
        $key = 'saveDrawing'.'$'.$input['code'];
        $is_lock = Redis::setnx($key,1); //设置锁，防止图片编码相同
        if($is_lock==1){
            $code_list=DB::table($this->table)->where('code',$input['code'])->get();
            if(!empty(obj2array($code_list))){
                TEPA('该编码已使用，请刷新重试！');
            }
            Redis::expire($key, 360); //设置自动过期时间，360s，以防代码异常
         try {
             DB::connection()->beginTransaction();
                $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
                $update_arr = [
                    'group_id' => $input['group_id'],
                    'code' => $input['code'],
                    'comment' => $input['comment'],
                    'name' => $input['name'],
                    'status' => 1,
                    'search_string' => $search_str,
                    'source' => empty($input['source']) ? 1 : intval($input['source'])
                ];
                DB::table($this->table)->where('id', $input['drawing_id'])
                    ->update($update_arr);
                $imageAttributeDao = new ImageAttribute();
                $imageAttributeDao->saveImageAttribute($input['input_ref_arr_drawing_attributes'], $input['drawing_id']);
                Redis::del($key);
            } catch (\ApiException $e) {
                DB::connection()->rollBack();
                TEA($e->getCode());
            }
            }else{
                TEPA('该编码正在使用，为防止重复，请刷新，稍后再试！');
            }
         DB::connection()->commit();
    }

    /**
     * 拼接 搜索条件预收集字符串
     * @param $input_attributes_arr
     * @return string
     * @author lester.you
     */
    public function fixSearchStr($input_attributes_arr)
    {
        $search_string = "";
        $search_arr = [];
        ksort($input_attributes_arr);
        foreach ($input_attributes_arr as $k => $v) {
            if (!empty($v['value'])) {
                $search_arr[] = $k . ',' . $v['value'];
            }
        }
        if (!empty($search_arr)) {
            $search_string = join('|', $search_arr);
        }
        return $search_string;
    }

    /**
     * @param $input
     * @throws ApiException
     */
    public function batchSave($input)
    {
        /**
         * 判断当前是否已经保存过。
         * 防止因为网络问题，重复提交。
         * 原理： 判断code是否为空
         */
        $has_code = DB::table($this->table)->select(['id', 'code'])->where('id', '=', $input['drawing_id'])->first();
        if (!empty($has_code->code)) {
            TEA('1115');
        }

        /**
         * 验证code是否被使用
         */
        $code_is_existed = DB::table($this->table)->select(['id', 'code'])->where('code', '=', $input['code'])->count();
        if ($code_is_existed) {
            $type = 6; //编码的类别，图纸固定为6
            $obj = DB::Table(config('alias.rdg') . ' as rdg')
                ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                ->where('rdg.id', '=', $input['group_id'])
                ->first();
            if (empty($obj) || !$obj) {
                TEA('700', 'group_id');
            }
            $type_code = $obj->type_code . $obj->group_code;
            $EncodingSetting = new EncodingSetting();
            $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
            if (empty($res) || empty($res['code'])) TEA('1107');
            $input['code'] = $res['code'];
        }

        $encodingDao = new EncodingSetting();
        $input['code'] = $encodingDao->useEncoding(6, $input['code']);
        $update_arr = [
            'group_id' => $input['group_id'],
            'code' => $input['code'],
            'name' => $input['name'],
            'status' => 1,
            'is_care_label' => 1,
            'source' => empty($input['source']) ? 1 : intval($input['source'])
        ];
        DB::table($this->table)->where('id', $input['drawing_id'])
            ->update($update_arr);
    }
//endregion

//region 查

    /**
     * 图纸详情
     * @param $drawing_id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @since 添加关联图纸的数据 lester.you  2018-05-03
     */
    public function get($drawing_id)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.code',
            'rdr.group_id',
            'rdr.ctime',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
            'rdgt.id as type_id'
        ];
        $drawing = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->where([['rdr.' . $this->primaryKey, '=', $drawing_id], ['rdr.status', '=', 1]])
            ->first();
        if (!$drawing) TEA('404');
        $drawing->ctime = date('Y-m-d', $drawing->ctime);
        $imageAttributeDao = new ImageAttribute();
        $drawing->attributes = $imageAttributeDao->getDrawingAttributeList($drawing->drawing_id);
//        $tempArr = explode('/',$drawing->image_path);
//        $imageName = end($tempArr);
//        $imageMake = explode('.',$imageName);
//        $tempImagePath = str_replace($imageName,'',$drawing->image_path);
//        $thumbArr = [];
//        foreach(Thumb::$sizes[$drawing->owner] as $size){
//            $thumbImage = $tempImagePath.$imageMake[0].$size.'.'.Thumb::IMG_EXT;
//            if(is_file(storage_path('app/public').DIRECTORY_SEPARATOR.$thumbImage)){
//                $thumbArr[] = $thumbImage;
//            }
//        }
//        $drawing->thumbImages = $thumbArr;
        //关联图纸
        $selectArr = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.code',
            'rdr.group_id',
            'rdr.ctime',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
            'rdgt.id as type_id',
            'rdl.count',
            'rdl.description'
        ];
        $link_obj_list = DB::Table(config('alias.rdl') . ' as rdl')
            ->select($selectArr)
            ->leftJoin($this->table . ' as rdr', 'rdr.id', '=', 'rdl.link_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->where([
                ['rdl.drawing_id', '=', $drawing_id],
                ['rdr.status', '=', 1]
            ])
            ->get();
        foreach ($link_obj_list as $index => &$value) {
            $value->attributes = $imageAttributeDao->getDrawingAttributeList($value->{$this->apiPrimaryKey});
            $value->ctime = date('Y-m-d H:i:s', $value->ctime);
        }
        $drawing->linkArr = $link_obj_list;

        //附件
        $selectArr = [
            'rdat.attachment_id',
            'rdat.description as comment',
            'att.name',
            'att.filename',
            'att.ctime',
            'att.creator_id',
            'att.path',
            'att.size',
            'u.name as creator_name'
        ];
        $attachment_obj_list = DB::Table(config('alias.rdat') . ' as rdat')
            ->select($selectArr)
            ->leftJoin(config('alias.attachment') . ' as att', 'att.id', '=', 'rdat.attachment_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'att.creator_id')
            ->where('rdat.drawing_id', $drawing_id)
            ->get();
        foreach ($attachment_obj_list as $index => &$value) {
            $value->ctime = date('Y-m-d H:i:s', $value->ctime);
        }
        $drawing->attachments = $attachment_obj_list;

        //组合图
        $groupPic_drawing_id_list = DB::Table(config('alias.rdl') . ' as rdl')
            ->select([
                'rd.id',
                'rd.code',
                'rd.name',
                'rd.image_path',
                'rd.image_name',
                'rdl.link_id'
            ])
            ->leftJoin($this->table . ' as rd', 'rdl.drawing_id', '=', 'rd.id')
            ->where([
                ['rdl.link_id', '=', $drawing_id],
                ['rd.status', '=', 1],
            ])
            ->get();
        foreach ($groupPic_drawing_id_list as $key => &$_value) {
            if (empty($_value->id)) {
                continue;
            }
            $_value->attributes = $imageAttributeDao->getDrawingAttributeList($_value->id);
            $link_drawing = DB::Table(config('alias.rdl') . ' as rdl')
                ->select(['rd.id', 'rd.code', 'rd.name', 'rd.image_path', 'rd.image_name'])
                ->leftJoin($this->table . ' as rd', 'rdl.link_id', '=', 'rd.id')
                ->where([
                    ['rdl.drawing_id', '=', $_value->id],
                    ['rd.status', '=', 1]
                ])
                ->get();
            foreach ($link_drawing as $k => &$v) {
                $attribute = $imageAttributeDao->getDrawingAttributeList($v->id);
                $v->attributes = $attribute;
            }
            $_value->links = $link_drawing;
        }
        $drawing->groupDrawing = $groupPic_drawing_id_list;

        return $drawing;
    }


    /**
     * 图纸分页列表
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function getDrawingListByPage(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.extension',
            'rdr.comment',
            'rdr.comment as description',
            'rdg.name as group_name',
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }
        //根据图纸属性搜索
        $imageAttributeDao = new ImageAttribute();
        if (!empty($input['drawing_attributes'])) {
            //检查图纸属性参数
            $imageAttributeDao->checkFormFields($input);
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $where[] = ['rdr.search_string', 'like', '%' . $search_str . '%'];
        }
        // 洗标 销售订单和物料号 搜索
        if (!empty($input['sale_order_code'])) $where[] = ['rdcl.sale_order_code', 'like', '%' . $input['sale_order_code'] . '%'];
        if (!empty($input['line_project_code'])) $where[] = ['rdcl.line_project_code', 'like', '%' . $input['line_project_code'] . '%'];
        if (!empty($input['material_code'])) $where[] = ['rdcl.material_code', 'like', '%' . $input['material_code'] . '%'];
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->leftJoin(config('alias.rdcl') . ' as rdcl', 'rdcl.drawing_id', '=', 'rdr.id')
            ->where($where);
        $input['total_records'] = $builder->count(DB::raw('distinct rdr.id'));
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        $obj_list = $builder->distinct()->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }


    /**
     * 根据分类获取图纸分页列表
     * @param $input
     * @return object
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function getDrawingListByCategory(&$input)
    {
        $category = DB::table(config('alias.rdc'))->select('id')->where('owner', '=', $input['owner'])->first();
        if (!$category) TEA('700', 'owner');
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name'
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        $where[] = ['rdr.category_id', '=', $category->id];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', $input['code']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['type_id'])) $where[] = ['rdg.type_id', '=', $input['type_id']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * 根据来源查找图纸
     * @param $owner
     * @return mixed
     */
    public function selectByCategory($owner)
    {
        $obj_list = DB::table($this->table . ' as rdr')->select('rdr.id as ' . $this->apiPrimaryKey, 'rdr.code', 'rdr.image_path', 'rdr.name')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', 'rdr.category_id')
            ->where([['rdc.owner', '=', $owner], ['rdr.status', '=', 1]])
            ->get();
        return $obj_list;
    }


    /**
     * 获取和做法关联的数据（分页）
     * 只限做法使用
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-04-26
     */
    public function getDrawingListByPractice(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
        ];
        $fields_rpd = $fields_rppf = $fields;
        $fields_rpd[] = 'rpd.practice_id';
        $fields_rpd[] = 'rpd.description';

        $fields_rppf[] = 'rppf.practice_id';
        $fields_rppf[] = 'rppf.description';

        $where = [];
        $where[] = ['rdr.status', '=', 1];

        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }
        //根据图纸属性搜索
        if (!empty($input['drawing_attributes'])) {
            //检查图纸属性参数
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->checkFormFields($input);
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $where[] = ['rdr.search_string', 'like', '%' . $search_str . '%'];
        }
        $where_rpd = $where_rppf = $where;
        if (!empty($input['practice_id'])) {
            $where_rpd[] = ['rpd.practice_id', '=', $input['practice_id']];
            $where_rppf[] = ['rppf.practice_id', '=', $input['practice_id']];
        }


        $builder_rpd = DB::table(config('alias.rpd') . ' as rpd')->select($fields_rpd)
            ->leftJoin($this->table . ' as rdr', 'rdr.id', '=', 'rpd.drawing_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where_rpd);

        $builder_rppf = DB::table(config('alias.rppf') . ' as rppf')->select($fields_rppf)
            ->leftJoin($this->table . ' as rdr', 'rdr.id', '=', 'rppf.img_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where_rppf)
            ->union($builder_rpd);

        $sql = $builder_rppf->toSql();
        $builder_res = DB::table(DB::raw("($sql) as res"))->mergeBindings($builder_rppf);

        $input['total_records'] = $builder_res->count();
        $builder_res->forPage($input['page_no'], $input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder_res->orderBy('res.' . $input['sort'], $input['order']);
        $obj_list = $builder_res->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * drawing_attributes 是必传的
     * 根据属性和属性值搜索出响应的图纸
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-05-02
     */
    public function getDrawingListBySearchStr(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }
        //根据图纸属性搜索
        if (!empty($input['drawing_attributes'])) {
            //检查图纸属性参数
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->checkFormFields($input);
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $where[] = ['rdr.search_string', 'like', '%' . $search_str . '%'];
            !empty($input['drawing_id']) && $where[] = ['rdr.id', '<>', $input['drawing_id']];
        } else {
            TEA('700', 'drawing_attributes');
        }
        $obj_list = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->where($where)
            ->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * 根据drawing_id 获取图纸路径
     * @param $drawing_id
     * @return string
     */
    public function getImagePathBy($drawing_id)
    {
        $path = "";
        if (is_numeric($drawing_id)) {
            $obj = DB::Table($this->table)->select(['id', 'image_path'])->where('id', $drawing_id)->first();
            if (!empty($obj) && isset($obj->image_path)) {
                $path = $obj->image_path;
            }
        }
        return $path;
    }

    /**
     *  hao.li
     *  2019/09/07
     *  获取已开启的国家
     */
    public function getCountroy(){
        $data=[
            'id as countroyId',
            'name as countroyName'
        ];
        $obj_list=DB::table('ruis_country')->select($data)->where('status',1)->get();
        return $obj_list;
    }

    /**
     * 获取洗标列表
     *
     * @param $input
     * @return mixed
     * @throws ApiException
     */
    public function getPageIndexByCareLabel(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.extension',
            'rdr.comment',
            'rdr.comment as description',
            'rdg.name as group_name',
            'rdr.is_care_label',
            'rdr.is_pushed'
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        $where[] = ['rdr.is_care_label', '=', 1];
        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        //hao.li 增加国家搜索条件
        if(!empty($input['country_id'])) $where[]=['dc.country_id', '=',$input['country_id']];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }

        // 洗标 销售订单和物料号 搜索
        if (!empty($input['sale_order_code'])) $where[] = ['rdcl.sale_order_code', 'like', '%' . $input['sale_order_code'] . '%'];
        if (!empty($input['material_code'])) $where[] = ['rdcl.material_code', 'like', '%' . $input['material_code'] . '%'];
        //修改行项目搜索 by xia
        if (!empty($input['line_project_code'])) 
        {
            $line_project_code=sprintf("%06d", $input['line_project_code']);//销售订单行项目6位数，不足前面补0   
            $where[] = ['rdcl.line_project_code', '=', $line_project_code]; 
        }
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->leftJoin(config('alias.rdcl') . ' as rdcl', 'rdcl.drawing_id', '=', 'rdr.id')
            ->leftJoin('mbh_drawing_country' . ' as dc', 'dc.drawing_id', '=','rdcl.id')
            ->where($where);
        $input['total_records'] = $builder->count(DB::raw('distinct rdr.id'));
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        $obj_list = $builder->distinct()->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * 获取英文洗标列表
     *
     * @param $input
     * @return xia
     * @throws ApiException
     */
    public function getPageIndexByCareLabelEN(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
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
            'rdcl.id as rdclId',
            'rdcl.sale_order_code',
            'rdcl.line_project_code',
            'rdcl.version_code as version',
            'ml.ZMA001 as MAKTX',//修改物料取值字段，改为长文本
            'rdr.is_care_label',
            'rdr.is_pushed'
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        $where[] = ['rdr.is_care_label', '=', 1];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
      
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }

        // 洗标 销售订单和物料号 搜索
        //if (!empty($input['sale_order_code'])) $where[] = ['rdcl.sale_order_code', 'like', '%' . $input['sale_order_code'] . '%'];
        if (!empty($input['material_code'])) $where[] = ['rdcl.material_code', 'like', '%' . $input['material_code'] . '%'];
        //修改行项目搜索 by xia
        if (!empty($input['line_project_code'])) 
        {
            $line_project_code=sprintf("%06d", $input['line_project_code']);//销售订单行项目6位数，不足前面补0   
            $where[] = ['rdcl.line_project_code', '=', $line_project_code]; 
        }
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdcl') . ' as rdcl', 'rdcl.drawing_id', '=', 'rdr.id')
            ->leftJoin('mbh_mara_language' . ' as ml', 'ml.MATNR', '=','rdcl.material_code')
            ->where($where);
        //多个销售订单搜索  
        if (!empty($input['sale_order_code'])) $builder=$builder->whereIn('rdcl.sale_order_code',explode(' ',$input['sale_order_code']));
        $input['total_records'] = $builder->count(DB::raw('distinct rdr.id'));
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        //$obj_list = $builder->distinct()->get();
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);    
            // $v->image_path = $_SERVER['REMOTE_ADDR']."/".$v->image_path;     
        }
        return $obj_list;
    }

//endregion

//region 修

    /**
     * 修改图纸属性及备注、添加图纸关联
     *
     * @param $input
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update($input)
    {
        /**
         * 取出上传图纸的临时数据
         * 如果drawing_temp_id为空，表示修改的过程中没有重新上传图皮
         */
        $tempData = [];
        if (!empty($input['drawing_temp_id'])) {
            $tempData = DB::table(config('alias.rdt'))->where('id', $input['drawing_temp_id'])->first();
            if (empty($tempData) || !Storage::disk('public')->exists($tempData->image_path)) {
                TEA('1112');
            }
            //先获取老图纸数据，留后面备用
            $old_image_obj = $this->getRecordById($input['drawing_id'], ['image_path']);
        }
        try {
            DB::connection()->beginTransaction();
            $search_str = $this->fixSearchStr($input['input_ref_arr_drawing_attributes']);
            $update_arr = [
                'group_id' => $input['group_id'],
//                'code' => $input['code'],
                'comment' => $input['comment'],
                'name' => $input['name'],
                'search_string' => $search_str,
                'mtime' => time()
            ];
            if (!empty($tempData)) {
                $update_arr['image_orgin_name'] = $tempData->image_orgin_name;
                $update_arr['image_name'] = $tempData->image_name;
                $update_arr['image_path'] = $tempData->image_path;
                $update_arr['extension'] = $tempData->extension;

                //删除对应临时表的记录
                DB::table(config('alias.rdt'))
                    ->where('id', $input['drawing_temp_id'])
                    ->delete();
            }
            DB::table($this->table)
                ->where('id', $input['drawing_id'])
                ->update($update_arr);
            $imageAttributeDao = new ImageAttribute();
            $imageAttributeDao->saveImageAttribute($input['input_ref_arr_drawing_attributes'], $input['drawing_id']);
            $this->linkImage($input[$this->apiPrimaryKey], $input['linkArr']);
            $this->linkAttachment($input[$this->apiPrimaryKey], $input['attachmentsArr']);
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();

        //删除老图纸，添加上传图纸日志
        if (!empty($tempData)) {
            //操作日志
            $events = [
                'field' => 'image_path',
                'comment' => '图纸路径',
                'action' => 'update',
                'from' => $old_image_obj->image_path,
                'to' => $tempData->image_path,
                'desc' => '修改图纸，新上传了一张图纸',
                'extra' => $old_image_obj,
            ];
            Trace::save(config('alias.rdr'), $input['drawing_id'], (session('administrator')) ? session('administrator')->admin_id : 0, $events);
            if ((Storage::disk('public')->exists($old_image_obj->image_path))) {
                Storage::disk('public')->delete($old_image_obj->image_path);
            }
        }

        /**
         * 每次请求清理两个临时表的记录
         * 清理的时间为一天之前的
         */
        $deleteTempList = DB::table(config('alias.rdt'))
            ->where([['ctime', '<', time() - 86400]])
            ->limit(2)
            ->get();
        foreach ($deleteTempList as $key => $value) {
            DB::table(config('alias.rdt'))->where('id', $value->id)->delete();
            if (Storage::disk('public')->exists($value->image_path)) {
                Storage::disk('public')->delete($value->image_path);
            }
        }
    }

    /**
     * 关联图纸的操作
     * 增和删
     *
     * @param $id
     * @param $linkArr
     * @author lester.you 2018-05-03
     */
    public function linkImage($id, $linkArr)
    {
        $obj_list = DB::Table(config('alias.rdl'))
            ->where('drawing_id', $id)
            ->select(['id', 'drawing_id', 'link_id', 'count', 'description'])
            ->get();
        $db_id_arr = [];
        foreach (obj2array($obj_list) as $k => $v) {
            $db_id_arr[$v['link_id']] = $v;
        }
        $res = get_array_diff_intersect(array_keys($linkArr), array_keys($db_id_arr));
        //添加
        if (!empty($res['add_set'])) {
            $insertArr = [];
            foreach ($res['add_set'] as $key => $value) {
                $insertArr[] = [
                    'drawing_id' => $id,
                    'link_id' => $value,
                    'count' => $linkArr[$value]['count'],
                    'description' => $linkArr[$value]['description']
                ];
            }
            DB::Table(config('alias.rdl'))->insert($insertArr);
        }
        //删除
        if (!empty($res['del_set'])) {
            $deleteIDArr = [];
            foreach ($res['del_set'] as $key => $value) {
                $deleteIDArr[] = $db_id_arr[$value]['id'];
            }
            DB::Table(config('alias.rdl'))
                ->whereIn('id', $deleteIDArr)
                ->delete();
        }
        //修改
        if (!empty($res['common_set'])) {
            foreach ($res['common_set'] as $value) {
                if ($db_id_arr[$value]['description'] != $linkArr[$value]['description'] || $db_id_arr[$value]['count'] != $linkArr[$value]['count']) {
                    DB::Table(config('alias.rdl'))
                        ->where('id', $db_id_arr[$value]['id'])
                        ->update(
                            [
                                'description' => $linkArr[$value]['description'],
                                'count' => $linkArr[$value]['count']
                            ]
                        );
                }
            }
        }
    }

    /**
     * 关联附件
     * @param $drawing_id
     * @param $attachmentsArr
     * @author lester.you 2018-05-03
     */
    public function linkAttachment($drawing_id, $attachmentsArr)
    {
        $obj_list = DB::Table(config('alias.rdat'))
            ->where('drawing_id', $drawing_id)
            ->select(['id', 'drawing_id', 'attachment_id', 'description'])
            ->get();
        $db_id_arr = [];
        foreach (obj2array($obj_list) as $k => $v) {
            $db_id_arr[$v['attachment_id']] = $v;
        }
        $res = get_array_diff_intersect(array_keys($attachmentsArr), array_keys($db_id_arr));
        if (!empty($res['add_set'])) {
            $insertArr = [];
            foreach ($res['add_set'] as $key => $value) {
                $insertArr[] = ['drawing_id' => $drawing_id, 'attachment_id' => $value, 'description' => $attachmentsArr[$value]['comment']];
            }
            DB::Table(config('alias.rdat'))->insert($insertArr);
        }
        if (!empty($res['del_set'])) {
            $deleteIDArr = [];
            foreach ($res['del_set'] as $key => $value) {
                $deleteIDArr[] = $db_id_arr[$value]['id'];
            }
            DB::Table(config('alias.rdat'))
                ->whereIn('id', $deleteIDArr)
                ->delete();
        }
        if (!empty($res['common_set'])) {
            foreach ($res['common_set'] as $value) {
                if ($db_id_arr[$value]['description'] != $attachmentsArr[$value]['comment']) {
                    DB::Table(config('alias.rdat'))
                        ->where('id', $db_id_arr[$value]['id'])
                        ->update(
                            ['description' => $attachmentsArr[$value]['comment']]
                        );
                }
            }
        }
    }

    /**
     * @param $data
     * @return bool
     * @throws \App\Exceptions\ApiException
     */
    public function addTempFileData($data)
    {
        if (empty($data)) {
            return false;
        }
        $insertID = DB::table(config('alias.rdt'))->insertGetId($data);
        if (!$insertID) {
            if (Storage::disk('public')->exists($data['image_path'])) {
                Storage::disk('public')->delete($data['image_path']);
            }
            TEA('802');
        }
        return $insertID;

    }



//endregion

//region 删

    /**
     * 删除图纸（逻辑删除）
     * @param $drawing_id
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     * @throws \Exception
     * @since lester.you 添加删除前判断
     */
    public function delete($drawing_id, $creator_id)
    {
        $has = $this->isExisted([['drawing_id', '=', $drawing_id]], config('alias.rmd'));
        if ($has) TEA('1102');
        $has = $this->isExisted([['drawing_id', '=', $drawing_id]], config('alias.rpd'));
        if ($has) TEA('1114');
        $_has = $this->isExisted([['img_id', '=', $drawing_id]], config('alias.rppf'));
        if ($_has) TEA('1114');
        $_has = $this->isExisted([['drawing_id', '=', $drawing_id]], config('alias.rbrd'));
        if ($_has) TEA('1102');
        $_has = $this->isExisted([['drawing_id', '=', $drawing_id]], config('alias.rdcl'));
        if ($_has) TEA('1120');
        $image = $this->getRecordById($drawing_id, ['name', 'image_path']);
        $res = DB::table($this->table)->where($this->primaryKey, '=', $drawing_id)->update(['status' => 0]);
        if (!$res) TEA('803');
        //操作日志
        $events = [
            'action' => 'delete',
            'extra' => $image,
            'desc' => '删除图纸[' . $image->name . ']',
        ];
        Trace::save($this->table, $drawing_id, $creator_id, $events);

        //加入日志
        $data = [
            'type' => 3,
            'action' => 'delete',
            'order_id' => $drawing_id
        ];
        record_action_log($data);

    }


    public function updateBatch($tableName = "", $multipleData = array())
    {
        $tableName = config('alias.rdr');
        if ($tableName && !empty($multipleData)) {

            // column or fields to update
            $updateColumn = array_keys($multipleData[0]);
            $referenceColumn = $updateColumn[0]; //e.g id
            unset($updateColumn[0]);
            $whereIn = "";

            $q = "UPDATE " . $tableName . " SET ";
            foreach ($updateColumn as $uColumn) {
                $q .= $uColumn . " = CASE ";

                foreach ($multipleData as $data) {
                    $q .= "WHEN " . $referenceColumn . " = " . $data[$referenceColumn] . " THEN '" . $data[$uColumn] . "' ";
                }
                $q .= "ELSE " . $uColumn . " END, ";
            }
            foreach ($multipleData as $data) {
                $whereIn .= "'" . $data[$referenceColumn] . "', ";
            }
            $q = rtrim($q, ", ") . "  WHERE  " . $referenceColumn . " IN (" . rtrim($whereIn, ', ') . ")";

            // Update
            return DB::update(DB::raw($q));

        } else {
            return false;
        }
    }

//endregion

    /**
     * 批量下载图纸
     * @throws \App\Exceptions\ApiException
     * @author hao.li
     */
    public function getImagesUrl($input) {
       
       //$pageURL ='http://'.$_SERVER['HTTP_HOST'].'/storage/';
       $ids=explode(',',$input['data']);
         $pageURL ='./storage/';
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.code',
            'rdr.group_id',
            'rdr.ctime',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
            'rdgt.id as type_id',
            'rdcl.sale_order_code',   //销售订单
            'rdcl.line_project_code',  //销售订单行项
            'rdcl.version_code'        //版本
        ];
        $drawing = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->leftJoin('ruis_drawing_care_label as rdcl','rdcl.drawing_id','rdr.id')
            ->whereIn('rdr.' . $this->primaryKey,$ids)
            ->where([['rdr.status', '=', 1]]);
        if(isset($input['sell_code']) && !empty($input['sell_code'])){
            $drawing=$drawing->whereIn('rdcl.sale_order_code',explode(' ',$input['sell_code']));
        }
        $drawing=$drawing->orderBy('rdcl.version_code','desc')->groupBy('rdcl.sale_order_code','rdcl.line_project_code','rdr.name')->get();
        if (!$drawing) TEA('404');
        foreach ($drawing as $key => &$value) {
            $drawing->ctime = date('Y-m-d', $value->ctime);
            $value->flag=0;
        }
        
        foreach ($drawing as $key => $value) {
            $value->image_path=$pageURL.$value->image_path;
           // $value->image_path=str_replace('/','\\',$value->image_path);
        }
        $imageAttributeDao = new ImageAttribute();
        foreach ($drawing as $key => $value) {
            $drawing->attributes = $imageAttributeDao->getDrawingAttributeList($value->drawing_id);
        }
       // pd($drawing);
        //关联图纸
        $selectArr = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.code',
            'rdr.group_id',
            'rdr.ctime',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.comment',
            'rdg.name as group_name',
            'rdgt.id as type_id',
            'rdl.count',
            'rdl.description'
        ];
        $link_obj_list = DB::Table(config('alias.rdl') . ' as rdl')
            ->select($selectArr)
            ->leftJoin($this->table . ' as rdr', 'rdr.id', '=', 'rdl.link_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->whereIn('rdl.drawing_id',$ids)
            ->where([
                ['rdr.status', '=', 1]
            ])
            ->get();
        foreach ($link_obj_list as $index => &$value) {
            $value->attributes = $imageAttributeDao->getDrawingAttributeList($value->{$this->apiPrimaryKey});
            $value->ctime = date('Y-m-d H:i:s', $value->ctime);
        }
        $drawing->linkArr = $link_obj_list;
        //pd($drawing);
        //附件
        $selectArr = [
            'rdat.attachment_id',
            'rdat.description as comment',
            'att.name',
            'att.filename',
            'att.ctime',
            'att.creator_id',
            'att.path',
            'att.size',
            'u.name as creator_name'
        ];
        $attachment_obj_list = DB::Table(config('alias.rdat') . ' as rdat')
            ->select($selectArr)
            ->leftJoin(config('alias.attachment') . ' as att', 'att.id', '=', 'rdat.attachment_id')
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'att.creator_id')
            ->whereIn('rdat.drawing_id', $ids)
            ->get();
        foreach ($attachment_obj_list as $index => &$value) {
            $value->ctime = date('Y-m-d H:i:s', $value->ctime);
        }
        $drawing->attachments = $attachment_obj_list;
        //pd($drawing);
        //组合图
        $groupPic_drawing_id_list = DB::Table(config('alias.rdl') . ' as rdl')
            ->select([
                'rd.id',
                'rd.code',
                'rd.name',
                'rd.image_path',
                'rd.image_name',
                'rdl.link_id'
            ])
            ->leftJoin($this->table . ' as rd', 'rdl.drawing_id', '=', 'rd.id')
            ->whereIn('rdl.link_id',$ids)
            ->where([
                ['rd.status', '=', 1],
            ])
            ->get();
        foreach ($groupPic_drawing_id_list as $key => &$_value) {
            if (empty($_value->id)) {
                continue;
            }
            $_value->attributes = $imageAttributeDao->getDrawingAttributeList($_value->id);
            $link_drawing = DB::Table(config('alias.rdl') . ' as rdl')
                ->select(['rd.id', 'rd.code', 'rd.name', 'rd.image_path', 'rd.image_name'])
                ->leftJoin($this->table . ' as rd', 'rdl.link_id', '=', 'rd.id')
                ->where([
                    ['rdl.drawing_id', '=', $_value->id],
                    ['rd.status', '=', 1]
                ])
                ->get();
            foreach ($link_drawing as $k => &$v) {
                $attribute = $imageAttributeDao->getDrawingAttributeList($v->id);
                $v->attributes = $attribute;
            }
            $_value->links = $link_drawing;
        }
        $drawing->groupDrawing = $groupPic_drawing_id_list;
        return $drawing;

    }    

    //获取该图片所有属性
    public function getDrawingAttribute($id){
        $obj_list=DB::table('ruis_drawing_attribute_definition as rdad')
                    ->leftjoin('ruis_drawing_attribute as rda','rda.attribute_definition_id','rdad.id')
                    ->where('rda.drawing_id',$id)
                    ->get();
        if(empty($obj_list)) TEPA('该参考图片没有属性');
        return $obj_list;
    }

    //检查表格中是否比参考图片属性少
    public function checkLess($values,$drawing_attribute_ay){
        $message='';
        for($i=0;$i<count($drawing_attribute_ay);$i++){
            for($j=0;$j<count($values);$j++){
                if(strcmp($drawing_attribute_ay[$i],$values[$j])==0){
                    break;
                }
            }
            if($j==count($values)){
                $message=$message.$drawing_attribute_ay[$i].',';
            }
        }
        $message = substr($message,0,strlen($message)-1);
        if(!empty($message)){
            TEPA('表格中缺少以下属性：'.$message);
        }
    }

    //检查表格中是否比参考图片属性多
    public function checkMore($values,$drawing_attribute_ay){
        $message='';
        for($i=0;$i<count($values);$i++){
            for($j=0;$j<count($drawing_attribute_ay);$j++){
                if(strcmp($values[$i],$drawing_attribute_ay[$j])==0){
                    break;
                }
            }
            if($j==count($drawing_attribute_ay)){
                $message=$message.$values[$i].',';
            }
        }
        $message = substr($message,0,strlen($message)-1);
        if(!empty($message)){
            TEPA('表格中多出以下属性：'.$message);
        }
    }

    //批量导入图片属性
    public function importImage($excelHeader,$data,$id){
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $input=[];
        //图纸为6
        $input['type']=6;
        //获取参考的属性
        $drawing_atttibute=DB::table('ruis_drawing_attribute')->where('drawing_id',$id)->get();
        //1.根据ID获取现有图片信息
        $obj_list=DB::table('ruis_drawing')->where('id',$id)->first();
        //2.根据group_id获取分组前缀
        $drawing_group=DB::table('ruis_drawing_group')->where('id',$obj_list->group_id)->first();
        //3.根据typd_id获取类型前缀
        $drawing_group_type=DB::table('ruis_drawing_group_type')->where('id',$drawing_group->type_id)->first();
        //4.拼接前缀
        $input['type_code']=$drawing_group_type->code.$drawing_group->code;
        $encoding=new EncodingSetting();
        foreach ($data as $key => $value) {
            //获取编码
            $code=$encoding->get($input);
            /**
            * 验证code是否被使用
            */
            $newCode='';
            $code_is_existed = DB::table($this->table)->select(['id', 'code'])->where('code', '=', $code)->count();
            if ($code_is_existed) {
                $type = 6; //编码的类别，图纸固定为6
                $obj = DB::Table(config('alias.rdg') . ' as rdg')
                    ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
                    ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
                    ->where('rdg.id', '=', $obj_list->group_id)
                    ->first();
                if (empty($obj) || !$obj) {
                    TEA('700', 'group_id');
                }
                $type_code = $obj->type_code . $obj->group_code;
                $EncodingSetting = new EncodingSetting();
                $res = $EncodingSetting->get(['type' => $type, 'type_code' => $type_code]);
                if (empty($res) || empty($res['code'])) TEA('1107');
                $newCode = $res['code'];
            }
            try {
                DB::connection()->beginTransaction();
                $encodingDao = new EncodingSetting();
                if(empty($code_ay)){
                    $code = $encodingDao->useEncoding(6, $code['code']);
                }else{
                    $code = $encodingDao->useEncoding(6, $newCode);
                }
                $insert_arrr = [
                    'code' => $code,
                    'name' => $obj_list->name,
                    'ctime'=>strtotime(date('Y-m-d H:i:s',time())),
                    'ctime'=>strtotime(date('Y-m-d H:i:s',time())),
                    'group_id' => $obj_list->group_id,
                    'creator_id'=>$creator_id,
                    'category_id'=>$obj_list->category_id,
                    'image_orgin_name'=>$obj_list->image_orgin_name,
                    'image_name'=>$obj_list->image_name,
                    'image_path'=>$obj_list->image_path,
                    'extension'=>$obj_list->extension,
                    'comment' => $obj_list->comment,
                    'status' => 1,
                    'company_id'=>$obj_list->company_id,
                    'factory_id'=>$obj_list->factory_id,
                    'search_string' => $obj_list->search_string,
                    'source' => $obj_list->source,
                    'width'=>$obj_list->width,
                    'height'=>$obj_list->height
                ];
                $drawing_id=DB::table('ruis_drawing')->insertGetId($insert_arrr);
                //插入属性数组
                $insert_attribute_ay=[];
                for($i=0;$i<count($excelHeader);$i++){
                    //获取属性ID
                    $attributeId=DB::table('ruis_drawing_attribute_definition')->select('id')->where('name',$excelHeader[$i])->first();
                    if(strcmp($excelHeader[$i],'是否为样板')==0){
                        $insert_attribute_ay=['drawing_id'=>$drawing_id,'attribute_definition_id'=>$attributeId->id,'value'=>empty($value[$i])?'否':$value[$i]];
                    }else{
                        $insert_attribute_ay=['drawing_id'=>$drawing_id,'attribute_definition_id'=>$attributeId->id,'value'=>empty($value[$i])?0:$value[$i]];
                    }
                    $attributeId=DB::table('ruis_drawing_attribute')->insertGetId($insert_attribute_ay);
                }
            } catch (\ApiException $e) {
                DB::connection()->rollBack();
                TEA($e->getCode());
            }
            DB::connection()->commit();
        }
    }

    /**
     * 洗标附件
     * @param $input
     * @return mixed
     * @throws ApiException
     */
    public function waterCodeEnclosureList(&$input)
    {
        $fields = [
            'rdr.id as ' . $this->apiPrimaryKey,
            'rdr.ctime',
            'rdr.code',
            'rdr.name',
            'rdr.source',
            'u.name as creator_name',
            'rdc.name as category_name',
            'rdc.owner',
            'rdc.id as category_id',
            'rdr.image_orgin_name',
            'rdr.image_name',
            'rdr.image_path',
            'rdr.extension',
            'rdr.comment',
            'rdr.comment as description',
            'rdg.name as group_name',
            'rdr.is_care_label',
            'rdr.is_pushed'
        ];
        $where = [];
        $where[] = ['rdr.status', '=', 1];
        $where[] = ['rdr.is_care_label', '=', 2]; //0-其他图片 1-洗标 2-附件
        if (!empty($input['category_id'])) $where[] = ['rdr.category_id', '=', $input['category_id']];
        if (!empty($input['group_id'])) $where[] = ['rdr.group_id', '=', $input['group_id']];
        if (!empty($input['name'])) $where[] = ['rdr.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['source'])) $where[] = ['rdr.source', '=', $input['source']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        //hao.li 增加国家搜索条件
        if(!empty($input['country_id'])) $where[]=['dc.country_id', '=',$input['country_id']];
        if (!empty($input['start_time']) && !empty($input['end_time'])) {
            if (
                empty(strtotime($input['start_time']))
                ||
                empty(strtotime($input['end_time']))
                ||
                empty(strtotime($input['start_time'])) > empty(strtotime($input['end_time']))
            ) {
                TEA('700', 'end_time');
            } else {
                $where[] = ['rdr.ctime', '>=', strtotime($input['start_time'])];
                $where[] = ['rdr.ctime', '<=', strtotime($input['end_time'])];
            }
        }

        // 洗标 销售订单和物料号 搜索
        if (!empty($input['sale_order_code'])) $where[] = ['rdcl.sale_order_code', 'like', '%' . $input['sale_order_code'] . '%'];
        if (!empty($input['material_code'])) $where[] = ['rdcl.material_code', 'like', '%' . $input['material_code'] . '%'];
        //修改行项目搜索 by xia
        if (!empty($input['line_project_code']))
        {
            $line_project_code=sprintf("%06d", $input['line_project_code']);//销售订单行项目6位数，不足前面补0
            $where[] = ['rdcl.line_project_code', '=', $line_project_code];
        }
        $builder = DB::table($this->table . ' as rdr')->select($fields)
            ->leftJoin(config('alias.rrad') . ' as u', 'u.id', '=', 'rdr.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdr.category_id')
            ->leftJoin(config('alias.rdg') . ' as rdg', 'rdg.id', '=', 'rdr.group_id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->leftJoin(config('alias.rdcl') . ' as rdcl', 'rdcl.drawing_id', '=', 'rdr.id')
            ->leftJoin('mbh_drawing_country' . ' as dc', 'dc.drawing_id', '=','rdcl.id')
            ->where($where);
        $input['total_records'] = $builder->count(DB::raw('distinct rdr.id'));
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdr.' . $input['sort'], $input['order']);
        $obj_list = $builder->distinct()->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $imageAttributeDao = new ImageAttribute();
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * 流水码附件上传pdf
     *
     * @param $input
     * @throws ApiException
     */
    public function cutPdfByPage(&$input)
    {
        $obj = DB::Table(config('alias.rdg') . ' as rdg')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->select(['rdgt.code as type_code', 'rdg.code as group_code'])
            ->where('rdg.id', '=', $input['group_id'])
            ->first();
        if (empty($obj) || !$obj) {
            TEA('700', 'group_id');
        }
        $type_code = $obj->type_code . $obj->group_code;

        $admin = session('administrator');
        //这个是用来判断是否需要拆分用的
        $is_need_split = array_filter(array_column($input['items'], 'page_division'));

        //$pdf_file = $input['drawing'];
        $category_id = $input['category_id'];

        //获取分组,保存文件路径用
        $category = $this->getRecordById($category_id, ['owner'], config('alias.rdc'));
        if (!$category) TEA('700', 'category_id');

        foreach ($input['items'] as $k=>&$v)
        {

            $data = [];
            $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
            //$data['extension'] = $pdf_file->getClientOriginalExtension();//文件后缀
            $data['extension'] = 'pdf';//文件后缀
            //判断文件是否带有 被禁止的后缀，防止脚本注入
            if (!$data['extension'] || in_array(strtolower($data['extension']), $this->prohibited_extensions)) TEA('1101');//不被允许的文件

            //判断是否需要拆分
            if(!empty($is_need_split) && $is_need_split[0]!=',')//需要拆
            {
                //拿源文件的临时路径
//                if($pdf_file->isValid())
//                {
//                    //$path_tmp = $pdf_file->getRealPath();
//                    $path_tmp = $input['path_tmp'];
//                }
                $path_tmp = base_path().DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.$input['path_tmp'];

                //文件命名规则 销售订单+行项目+物料+版本
                $data['image_path'] = config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d').DIRECTORY_SEPARATOR;
                $data['image_path'] .= $v['sale_order_code'].$v['line_project_code'].$v['material_code'].$v['version_code'].'.pdf';
                $file_name = base_path().DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.$data['image_path'];

                //如果目标目录不存在就创建
                $tmpPath = base_path().DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d');
                if (!is_dir($tmpPath)) {
                    $res = mkdir($tmpPath, 0766, true);
                    $res == true && chmod($tmpPath, 0766);
                }

                //页码 例如，1-2，就是切出 pdf的第一页和第二页
                $page_info = implode('-',explode(',',$v['page_division']));

                $cmd = 'pdftk '.$path_tmp.' cat '.$page_info.' output '.$file_name;
                //exec执行系统外部命令,此处方法只能在mac或者centos等lunix系统下才可以使用，window暂时无法使用
                exec($cmd, $result, $var);
                if($var==1) TEA('7028');//上传失败
            }
            else//不需要拆
            {
                $path_tmp = base_path().DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.$input['path_tmp'];

                //$data['image_path'] = $input['path_tmp'];
                //文件命名规则 销售订单+行项目+物料+版本
                $data['image_path'] = config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d').DIRECTORY_SEPARATOR;
                $data['image_path'] .= $v['sale_order_code'].$v['line_project_code'].$v['material_code'].$v['version_code'].'.pdf';

                $file_name = base_path().DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.$data['image_path'];

                //如果目标目录不存在就创建
                $tmpPath = base_path().DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d');
                if (!is_dir($tmpPath)) {
                    $res = mkdir($tmpPath, 0766, true);
                    $res == true && chmod($tmpPath, 0766);
                }

                $cmd = 'cp '.$path_tmp.' '.$file_name;

                //exec执行系统外部命令,此处方法只能在mac或者centos等lunix系统下才可以使用，window暂时无法使用
                exec($cmd, $result, $var);
                if($var==1) TEA('7028');//上传失败
                //如果目标目录不存在就创建
//                $tmpPath = base_path().DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d');
//                if (!is_dir($tmpPath)) {
//                    $res = mkdir($tmpPath, 0766, true);
//                    $res == true && chmod($tmpPath, 0766);
//                }
//                $data['image_path'] = Storage::disk('public')->putFile(config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $pdf_file);
//                if (empty($data['image_path'])) TEA('7028');//上传失败
            }


            //$data['image_orgin_name'] = $pdf_file->getClientOriginalName();
            $data['category_id'] = $category_id;
            $temp = explode('/', $data['image_path']);
            $data['image_name'] = end($temp);
            $data['ctime'] = time();
            $data['mtime'] = time();
            $data['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0;
            $data['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
            $data['group_id'] = $input['group_id'];
            $encodingDao = new EncodingSetting();
            $data['code'] = $encodingDao->get(['type' => 6, 'type_code' => $type_code])['code'];
            $data['code'] = $encodingDao->useEncoding(6, $data['code']);
            $data['name'] = $v['material_code'];
            $data['is_care_label'] = 2;
            $data['source'] = 1;
            $data['status'] = 1;
            $insert_id = $this->addDrawing($data);
            if(!$insert_id)
            {
                TEA('7028');
            }
            $v['drawing_id'] = $insert_id;
        }
        /* if ((Storage::disk('public')->exists($input['path_tmp']))) {
            Storage::disk('public')->delete($input['path_tmp']);
        } */
    }


    public function waterCodeStore($input)
    {
        $drawing_id_arr = array_filter(array_column($input['items'], 'drawing_id'));

        $db_obj_lists = DB::table('ruis_drawing_care_label')->select('id')->whereIn('drawing_id', $drawing_id_arr)->get();
        $db_id_arr = [];
        foreach ($db_obj_lists as $value) {
            $db_id_arr[] = $value->id;
        }

        $delete_id_arr = array_diff($db_id_arr, $drawing_id_arr);

        if(empty($delete_id_arr))
        {
            foreach ($input['items'] as $v) {
                $temp['drawing_id'] = $v['drawing_id'];
                $temp['sale_order_code'] = $v['sale_order_code'];
                $temp['line_project_code'] = str_pad($v['line_project_code'], 6, '0',STR_PAD_LEFT);
                $temp['material_code'] = $v['material_code'];
                $temp['version_code'] = $v['version_code'];
                $temp['page_division'] = $v['page_division'];
                $temp['remark'] = get_value_or_default($v, 'remark', '');
                $keyVal_arr[] = $temp;
            }
        }
        $res = DB::table('ruis_drawing_care_label')->insert($keyVal_arr);

        if(!$res)
        {
            TEPA('新增流水码附件失败');
        }
    }

    /**
     * 新增流水码附件 参数检查
     *
     * @param $input
     * @throws ApiException
     * @author lester.you
     */
    public function checkWaterCodeStore(&$input,$type='add')
    {
        if (empty($input['category_id'])) TEA('700', 'category_id');
        $has = $this->isExisted([['id', '=', $input['category_id']]], config('alias.rdc'));
        if (!$has) TEA('700', 'category_id');

        if (empty($input['group_id'])) TEA(700, 'group_id');
        $has = $this->isExisted([['id', '=', $input['group_id']]], config('alias.rdg'));
        if (!$has) TEA('700', 'group_id');

        if (empty($input['items'])) TEA(700, 'items');

        $page_division = [];
        if($type == 'add')
        {
            $version_code_arr = [];
            foreach ($input['items'] as $v)
            {
                $where = [];
                $where[] = ['rdcl.version_code','=',$v['version_code']];
                $where[] = ['rdcl.sale_order_code','=',$v['sale_order_code']];
                $where[] = ['rdcl.line_project_code','=',$v['line_project_code']];
                $where[] = ['rdcl.material_code','=',$v['material_code']];
                $where[] = ['rd.status','=',1];
                $res = DB::table('ruis_drawing_care_label as rdcl')
                    ->leftJoin('ruis_drawing as rd','rd.id','rdcl.drawing_id')
                    ->where($where)
                    ->count();
                if($res>0) TEPA('当前版本号已存在');

                if(in_array($v['version_code'].$v['sale_order_code'].$v['line_project_code'],$version_code_arr)) TEPA('版本号不能重复');
                $version_code_arr[] = $v['version_code'].$v['sale_order_code'].$v['line_project_code'];

                //获取已经保存的
                $page_division_obj = DB::table('ruis_drawing_care_label')
                    ->where('material_code',$v['material_code'])
                    ->where('sale_order_code',$v['sale_order_code'])
                    ->where('line_project_code',$v['line_project_code'])
                    ->where('version_code',$v['version_code'])
                    ->where('page_division','<>','')
                    ->pluck('page_division')
                    ->toArray();
               if(!empty($page_division_obj))
               {
                   $page_division[] = $page_division_obj;
               }
            }

            //校验页码区间
            $page_arr = array_column($input['items'],'page_division');
            if(!empty($page_division))
            {
                $page_arr = array_merge($page_division,$page_arr);
            }

            if(!empty($page_arr))
            {
                $arr = [];
                foreach ($page_arr as &$v)
                {
                    $tem_arr = explode(',',$v);
                    if(!empty($tem_arr[0]) && !empty($tem_arr[1]))
                    {
                        $arr[] = $tem_arr;
                    }

                }
                $res = is_time_cross($arr,0,1);
                if($res)
                {
                    TEPA('页码'.$res[0].'-'.$res[1].'区间有重合');
                }
            }
        }
    }


    public function waterCodeCarelabel($drawing_id,$obj)
    {
        $dcl_obj = DB::table('ruis_drawing_care_label')->where('drawing_id',$drawing_id)->get();
        if(!$dcl_obj) TEPA('获取流水码附件信息失败');
        $obj->rdcl = $dcl_obj;
    }

    public function updateWaterCode($input)
    {
        if(!isset($input['drawing_id']) && empty($input['drawing_id'])) TEA('700', 'drawing_id');

        //修改pdf对应信息
        $drawing_info = [
          'category_id'=>$input['category_id'],
          'group_id'=>$input['group_id'],
          'name'=>$input['name'],
          'comment'=>$input['comment'],
        ];
        DB::table('ruis_drawing')
            ->where('id','=',$input['drawing_id'])
            ->update($drawing_info);
        //修改流水码附件对应信息

        if(!isset($input['items']['care_label_id']) && empty($input['items']['care_label_id'])) TEA('700', 'care_label_id');

        $drawing_care_label_info = [
            'sale_order_code' => $input['items']['sale_order_code'],
            'line_project_code' => $input['items']['line_project_code'],
            'version_code' => $input['items']['version_code'],
            'remark' => $input['items']['remark']
        ];
        DB::table('ruis_drawing_care_label')
            ->where('id','=',$input['items']['care_label_id'])
            ->update($drawing_care_label_info);

    }

    public function delWaterCode($input)
    {
        if(!isset($input['drawing_id']) && empty($input['drawing_id'])) TEA('700', 'drawing_id');

        $drawing_id = $input['drawing_id'];

        //1.删除路径中图片
        $draw_obj = DB::table('ruis_drawing')->where('id',$drawing_id)->first();
        if ((Storage::disk('public')->exists($draw_obj->image_path))) {
            Storage::disk('public')->delete($draw_obj->image_path);
        }
        //2.逻辑删除
        DB::table($this->table)->where($this->primaryKey, '=', $drawing_id)->update(['status' => 0]);
    }
}