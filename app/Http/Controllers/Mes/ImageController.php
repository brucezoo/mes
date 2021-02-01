<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/11/16
 * Time: 上午15:14
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use App\Http\Models\CareLabel;
use App\Http\Models\ImageAttribute;
use App\Jobs\PushCareLabel;
use App\Libraries\Thumb;
use App\Libraries\Trace;
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Image;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
header("Access-Control-Allow-Origin: *"); // 允许任意域名发起的跨域请求

/**
 * 图纸库之图纸管理器
 * @author  hao.wei   <weihao>
 */
class ImageController extends Controller
{
    protected $allowed_extensions = ["png", "jpg", "jpeg", "gif"];

    protected $prohibited_extensions = ['php', 'sh'];

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Image();
    }

//region 增

    /**
     * 上传图纸
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @throws \Exception
     * @author hao.wei <weihao>
     */
    public function uploadDrawing(Request $request)
    {
        $input = $request->all();
        trim_strings($request);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['drawing'])) TEA('700', 'drawing');
        //获取图片的长高
        $size = getimagesize($input['drawing']);
        $data = [];
        $admin = session('administrator');
        $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $data['extension'] = $input['drawing']->getClientOriginalExtension();//文件后缀
        if (!$data['extension'] || !in_array(strtolower($data['extension']), $this->allowed_extensions)) TEA('1101');//不被允许的文件
        $category = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$category) TEA('700', 'category_id');
        $data['image_path'] = Storage::disk('public')->putFile(config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $input['drawing']);
        if (empty($data['image_path'])) TEA('7028');//上传失败
        $data['image_orgin_name'] = $input['drawing']->getClientOriginalName();
        $data['category_id'] = $input['category_id'];
        $temp = explode('/', $data['image_path']);
        $data['image_name'] = end($temp);
        $data['ctime'] = time();
        $data['mtime'] = time();
        $data['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0;
        $data['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $data['width'] = $size[0];
        $data['height'] = $size[1];
        $insert_id = $this->model->addDrawing($data);
        $obj = $this->model->getRecordById($insert_id, ['image_path']);
        Thumb::createDrawingThump([$obj], $category->owner);//生成缩略图
        //操作日志
        $events = [
            'field' => $this->model->apiPrimaryKey,
            'comment' => '图纸',
            'action' => 'add',
            'extra' => $obj,
            'desc' => '上传了一张图纸[' . $obj->image_path . ']并生成了缩略图',
        ];
        Trace::save(config('alias.rdr'), $insert_id, $data['creator_id'], $events);
        return response()->json(get_success_api_response(['insert_id' => $insert_id, 'image_path' => $data['image_path']]));
    }

    /**
     * 上传文件(作为上传洗标使用)
     * 该方法基本不限制文件类型(除非为脚本的等)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function uploadFile(Request $request)
    {
        $input = $request->all();
        trim_strings($request);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['drawing'])) TEA('700', 'drawing');
        $data = [];
        $admin = session('administrator');
        $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $data['extension'] = $input['drawing']->getClientOriginalExtension();//文件后缀
        //判断文件是否带有 被禁止的后缀
        if (!$data['extension'] || in_array(strtolower($data['extension']), $this->prohibited_extensions)) TEA('1101');//不被允许的文件
        $category = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$category) TEA('700', 'category_id');
        $data['image_path'] = Storage::disk('public')->putFile(config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $input['drawing']);
        if (empty($data['image_path'])) TEA('7028');//上传失败
        $data['image_orgin_name'] = $input['drawing']->getClientOriginalName();
        $data['category_id'] = $input['category_id'];
        $temp = explode('/', $data['image_path']);
        $data['image_name'] = end($temp);
        $data['ctime'] = time();
        $data['mtime'] = time();
        $data['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0;
        $data['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $insert_id = $this->model->addDrawing($data);
        $obj = $this->model->getRecordById($insert_id, ['image_path']);
//        Thumb::createDrawingThump([$obj], $category->owner);//生成缩略图
        //操作日志
        $events = [
            'field' => $this->model->apiPrimaryKey,
            'comment' => '洗标',
            'action' => 'add',
            'extra' => $obj,
            'desc' => '上传了一张洗标文件[' . $obj->image_path . ']',
        ];
        Trace::save(config('alias.rdr'), $insert_id, $data['creator_id'], $events);
        return response()->json(get_success_api_response(['insert_id' => $insert_id, 'image_path' => $data['image_path']]));
    }


    /**
     * 保存图纸及图纸属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function store(Request $request)
    {
        //获取所有参数并检测
        $input = $request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->save($input);
        $input['image_path'] = $this->model->getImagePathBy($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($input));
    }

    /**
     * 批量上传图片
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     */
    public function batchUploadDrawing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        $categoryObj = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$categoryObj) TEA('700', 'category_id');
        if (empty($input['drawings'])) TEA('700', 'drawings');

        $keyVal = [
            'ctime' => time(),
            'mtime' => time(),
            'category_id' => $input['category_id'],
            'company_id' => (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0,
            'factory_id' => (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'creator_id' => (session('administrator')) ? session('administrator')->admin_id : 0,
        ];

        $results = [];
        foreach ($input['drawings'] as $drawing) {
            $keyVal['extension'] = $drawing->getClientOriginalExtension();
            if (!$keyVal['extension'] || !in_array(strtolower($keyVal['extension']), $this->allowed_extensions)) TEA('1101');//不被允许的文件

            $keyVal['image_path'] = Storage::disk('public')
                ->putFile(config('app.drawing_library') . $categoryObj->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $drawing);
            if (empty($keyVal['image_path'])) TEA('7028');//上传失败

            $keyVal['image_orgin_name'] = $drawing->getClientOriginalName();
            $temp = explode('/', $keyVal['image_path']);
            $keyVal['image_name'] = end($temp);
            $insertID = $this->model->addDrawing($keyVal);
            $obj = $this->model->getRecordById($insertID, ['image_path']);
            Thumb::createDrawingThump([$obj], $categoryObj->owner);//生成缩略图
            $results[] = [
                'insert_id' => $insertID,
                'image_path' => $keyVal['image_path'],
            ];
        }
        return response()->json(get_success_api_response($results));
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function batchStore(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkBatchStore($input);

        $CareLabel = new CareLabel();

        $drawingIDArr = [];

        $keyVal = [
            'group_id' => $input['group_id'],
            'category_id' => $input['category_id']
        ];

        try {
            DB::connection()->beginTransaction();
            foreach ($input['drawings'] as $drawingItem) {
                $keyVal['drawing_id'] = $drawingItem['drawing_id'];
                $keyVal['code'] = $drawingItem['code'];
                $keyVal['name'] = $drawingItem['name'];
                $this->model->batchSave($keyVal);
                $CareLabel->store($drawingItem);
                $drawingIDArr[] = $drawingItem['drawing_id'];
            }
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();

        /**
         * 上面的保存 执行完成之后，把洗标的推送操作放在队列里面
         */
        foreach ($drawingIDArr as $drawingID) {
            $param['drawing_id'] = $drawingID;
            $job = (new PushCareLabel($param))->onQueue('pushCareLabel');
            $this->dispatch($job);
        }

        return response()->json(get_success_api_response(200));
    }

//endregion

//region 查

    /**
     * 查询图纸详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function show(Request $request)
    {
        $input = $request->all();
        if (empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $obj = $this->model->get($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 图纸分页列表
     * @param $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getDrawingListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 根据图纸来源获取图纸
     * @param $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function getImagesByCategory(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['owner'])) TEA('700', 'owner');
        $this->checkPageParams($input);
        $obj_list = $this->model->getDrawingListByCategory($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 获取图纸的属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getImagesAttributes(Request $request)
    {
        $drawing_id = $request->input('drawing_id');
        if (empty($drawing_id)) TEA('700', 'drawing_id');
        $imageAttributeDao = new ImageAttribute();
        $obj_list = $imageAttributeDao->getDrawingAttributeList($drawing_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据分类查找图纸
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectByCategory(Request $request)
    {
        $owner = $request->input('owner');
        if (empty(trim($owner))) TEA('700', 'owner');
        $obj_list = $this->model->selectByCategory($owner);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取和做法关联的数据(分页)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-04-26
     */
    public function selectPracticeDrawing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getDrawingListByPractice($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * drawing_attributes 是必传的
     * 根据属性和属性值搜索出响应的图纸
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lester.you 2018-05-02
     */
    public function listBySearchStr(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->getDrawingListBySearchStr($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     *hao.li
     *2019/0907
     *获取已开启的国家
     */
    public function getCountroy(Request $request){
        $input=$request->all();
        $obj_list=$this->model->getCountroy();
        return \response()->json(\get_success_api_response($obj_list));

    }
    /**
     * 洗标列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function careLabelPageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->getPageIndexByCareLabel($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 英文洗标列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function careLabelPageIndexEN(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->getPageIndexByCareLabelEN($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }


//endregion

//region 修

    /**
     * 修改图纸
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update(Request $request)
    {
        $input = $request->all();
        $this->model->checkFormFields($input);
        $this->model->update($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 重新上传文件，并保存文件数据
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author lester.you
     */
    public function reUploadImage(Request $request)
    {
        $input = $request->all();
        trim_strings($request);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['drawing'])) TEA('700', 'drawing');
        $data = [];
        $admin = session('administrator');
        $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $data['extension'] = $input['drawing']->getClientOriginalExtension();//文件后缀
        if (!$data['extension'] || !in_array(strtolower($data['extension']), $this->allowed_extensions)) TEA('1101');//不被允许的文件
        $category = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$category) TEA('700', 'category_id');
        $data['image_path'] = Storage::disk('public')->putFile(config('app.drawing_library') . $category->owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $input['drawing']);
        if (empty($data['image_path'])) TEA('7028');//上传失败
        $data['image_orgin_name'] = $input['drawing']->getClientOriginalName();
        $data['category_id'] = $input['category_id'];
        $temp = explode('/', $data['image_path']);
        $data['image_name'] = end($temp);
        $data['ctime'] = time();
        $insert_id = $this->model->addTempFileData($data);
        return response()->json(get_success_api_response(['drawing_temp_id' => $insert_id, 'image_path' => $data['image_path']]));
    }

//endregion

//region 删

    /**
     * 删除图纸
     * @param Request $request
     */
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function destroy(Request $request)
    {
        $input = $request->all();
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        if (empty($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $this->model->delete($input[$this->model->apiPrimaryKey], $creator_id);
        $events = [
            'action' => 'delete', //必填字段,值为add|delete|update            Y
            'desc' => '删除图纸及其属性',//对当前事件行为的描述         Y
        ];
        Trace::save(config('alias.rdr'), $input[$this->model->apiPrimaryKey], $creator_id, $events);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion
//test_test
    /**
     * 批量上传图片(区别于图纸)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author Ming.Li
     */
    public function batchUploadPicture(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['owner'])) TEA('700', 'owner');
        $owner = $input['owner'];
        if (empty($input['Pictures'])) TEA('700', 'Pictures');
        $keyVal = [
            'ctime' => time(),
            'mtime' => time(),
            'owner' => $owner,
        ];
        $results = [];
        foreach ($input['Pictures'] as $picture) {
            $keyVal['extension'] = $picture->getClientOriginalExtension();
            if (!$keyVal['extension'] || !in_array(strtolower($keyVal['extension']), $this->allowed_extensions)) TEA('1101');//不被允许的文件

            $keyVal['image_path'] = Storage::disk('public')
                ->putFile(config('app.picture_library') . $owner . DIRECTORY_SEPARATOR . date('Y-m-d'), $picture);
            if (empty($keyVal['image_path'])) TEA('7028');//上传失败

            $keyVal['image_orgin_name'] = $picture->getClientOriginalName();
            $temp = explode('/', $keyVal['image_path']);
            $keyVal['image_name'] = end($temp);
            $insertID = $this->model->addPicture($keyVal);
            $obj = DB::table('ruis_picture')->select('image_path')->where('id',$insertID)->first();
            Thumb::createDrawingThump([$obj], $owner);//生成缩略图
            $results[] = [
                'insert_id' => $insertID,
                'image_path' => $keyVal['image_path'],
            ];
        }
        return response()->json(get_success_api_response($results));
    }

    /**
     * 上传图片
     * 该方法基本不限制文件类型(除非为脚本的等)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function uploadPicture(Request $request)
    {
        $input = $request->all();
        trim_strings($request);
        if (empty($input['owner'])) TEA('700', 'owner');
        $owner = $input['owner'];
        if (empty($input['file'])) TEA('700', 'file');
        $data = [];
        $admin = session('administrator');
        $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $data['extension'] = $input['file']->getClientOriginalExtension();//文件后缀
        //判断文件是否带有 被禁止的后缀
        if (!$data['extension'] || in_array(strtolower($data['extension']), $this->prohibited_extensions)) TEA('1101');//不被允许的文件
        $data['image_path'] = Storage::disk('public')->putFile(config('app.picture_library') .$owner. DIRECTORY_SEPARATOR . date('Y-m-d'), $input['file']);
        if (empty($data['image_path'])) TEA('7028');//上传失败
        $data['image_orgin_name'] = $input['file']->getClientOriginalName();
        $temp = explode('/', $data['image_path']);
        $data['image_name'] = end($temp);
        $data['ctime'] = time();
        $data['mtime'] = time();
        $insert_id = $this->model->addPicture($data);
        $obj = DB::table('ruis_picture')->select('image_path')->where('id',$insert_id)->first();
        Thumb::createDrawingThump([$obj], $owner);//生成缩略图
        return response()->json(get_success_api_response(['insert_id' => $insert_id, 'image_path' => $data['image_path']]));
    }


    /**
     * 删除图片
     * @param Request $request
     */
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function destroyPicture(Request $request)
    {
        $input = $request->all();
        if (empty($input['id'])) TEA('700', 'id');
        $id  = $input ['id']; 
        if (empty($input['image_path'])) TEA('700', 'image_path');
        $image_path  =$input ['image_path'];
        $admin = session('administrator');
        $creator_id = ($admin) ? $admin->admin_id : 0;
      
        //先在表里面删除
        $num= DB::table('ruis_picture')->where('id','=',$id)->delete();
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');

        //再在文件中删除
        Storage::disk('public')->delete($image_path);

        return response()->json(get_success_api_response($id));
    }

    /**
     * 批量下载图片
     * @param Request $request
     */
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function getImagesUrl(Request $request){
        ini_set ('memory_limit', '512M');
        header("Access-Control-Allow-Origin: *"); // 允许任意域名发起的跨域请求
        //$headers = array('Content-Type: application/zip',);
        //header('Access-Control-Allow-Headers: X-Requested-With,X_Requested_With');
       // HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "*");
        //HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS,DELETE,PUT");
       // HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Test");
        $input=$request->all();
        $ids=explode(',',$input['data']);
        $obj_list=$this->model->getImagesUrl($input);
        $sell_code = $input['sell_code'];//销售订单号
        $language='';//增加language参数
        //by xia
        if(isset($_GET["language"]))//是否存在"language"的参数
        {
            $language=$_GET["language"];//存在则获取
        }
        else
        {
            $language='ZH';//不存在默认中文
        }
        $file_arr = [];

        //获取创建文件路径
        foreach ($obj_list as $key => $value) {
            //$value->image_path = '../storage/drawing/SAP/2019-06-15/123.pdf';
            $filearr = explode(".",$value->image_path);
            $filetype = end($filearr);
            $mtl_cg='';
            if($language=='ZH')
            {
                if(strlen($value->name)>4)
                {
                    $mtl_cage=substr($value->name,0,4);//截取图片名称前四位
                    $file_list= DB::table('ruis_material_category')
                    ->select('name')
                    ->where('code',$mtl_cage)
                    ->first(); //查物料类型
                    if($file_list)
                    {
                        $mtl_cg=$file_list->name;
                    }
                }
            }
            else //兼容多语言批量下载附件情况 by xia
            {
                $file_list= DB::table('mbh_mara_language')
                ->select('MTBEZ')
                ->where([
                    ['MATNR', '=', $value->name],
                    ['LANGU', '=', $language]
                ])
                ->first(); //查物料类型
                if($file_list)
                {
                    $mtl_cg=$file_list->MTBEZ;
                }
            }
            
            
            #TODO 文件名全部在这里处理
            /* if(empty($sell_code))
            {
                $filename =$value->name.'.'.$filetype;
            }
            else
            {
                $filename = $sell_code.'-'.$value->name.'.'.$filetype;
            } */
            /* if(empty($value->sale_order_code)){
                $filename =$value->name.'.'.$filetype;
                $value->flag=1;
            }else{
                $filename = $value->sale_order_code.'('.$value->line_project_code.')'.'-'.$value->name.'.'.$filetype;
                $value->flag=1;
            } */
            if($value->flag==0){
                $filename='';
                //拼接下载文件名
                foreach ($obj_list as $k => $v) {
                    $v->line_project_code=ltrim($v->line_project_code, '0000');
                    if($v->flag==1) continue;
                    //拼接销售订单，如果附件名称一致，则要拼接销售订单
                    if($value->name==$v->name){
                        $filename=$filename.$v->sale_order_code.'('.$v->line_project_code.$v->version_code.',';
                        $v->flag=1;
                        //拼接行项目，如果附件名称一致，并且销售订单一致，则拼接行项目
                        foreach ($obj_list as $ke => $va) {
                            $va->line_project_code=ltrim($va->line_project_code, '0000');
                            if($va->flag==1) continue;
                            if($v->name==$va->name && $v->sale_order_code==$va->sale_order_code){
                                $filename=$filename.$va->line_project_code.$va->version_code.',';
                                $va->flag=1;
                            }
                        }
                        $filename=substr($filename, 0, -1);
                        $filename=$filename.')';
                    }
                }
                $filename=$filename.'-'.$value->name.'.'.$filetype;
                $file = "./storage/drawingzip/".$mtl_cg.$filename;//修改被压缩文件的命名
                $file_arr[] = $file;
            }
            
            $file2 = file_get_contents($value->image_path);
            $file3 = fopen($file, "w");
            fwrite($file3,$file2);
            fclose($file3);
            //pd($file);
            //copy($value->image_path,$file);//1copy
        }
        //2。压缩
        if(empty($sell_code))
        {
            $zip_file = './storage/drawingzip/'.date('YmdHis',time()).'.zip'; // 要下载的压缩包的名称
        }
        else
        {
            $zip_file = './storage/drawingzip/'.$sell_code.'-'.date('YmdHis',time()).'.zip'; // 要下载的压缩包的名称
        }
        

        // 初始化 PHP 类
        $zip = new \ZipArchive();
        $zip->open($zip_file, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        // 添加文件：第二个参数是待压缩文件在压缩包中的路径
        // 所以，它将在 ZIP 中创建另一个名为 "storage/" 的路径，并把文件放入目录。
        if(!empty($file_arr))
        {
            foreach ($file_arr as $fk=>$fv)
            {
                $zip->addFile($fv);
            }
        }
        $zip->close();
        return response()->download($zip_file);
    }

    //导入excel 批量导入图片属性
    public function importImage(Request $request){
        $input=$request->all();
        if(!$request->file('file'))
        {
            TEA('703','file');
        }
        $file=$request->file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );
        ++$highestColumn;
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            for ( $j='A';$j!=$highestColumn;$j++  ) {
                $array[] = $objReader->getActiveSheet()->getCell( $j . ($i + 1) )->getValue();
            }
            $values[] = $array;//以数组形式读取
        }
        for($i=0;$i<count($values);$i++){
            for($j=0;$j<count($values[$i]);$j++){
                if(is_object($values[$i][$j]))  $values[$i][$j]= $values[$i][$j]->__toString();
            }
        }
        //图片编码
        //$drawingCode=$values[0][1];
        //获取该图片的所有属性值
        $drawing_attribute=$this->model->getDrawingAttribute($input['id']);
        $drawing_attribute_ay=[];
        $m=0;
        foreach ($drawing_attribute as $key => $value) {
            $drawing_attribute_ay[$m++]=$value->name;
        }
        $number=count($values[0]);
        //检查表格表头数是否比参考图片属性少，
        $this->model->checkLess($values[0],$drawing_attribute_ay);
        //检查表格表头数是否比参考图片属性多
        $this->model->checkMore($values[0],$drawing_attribute_ay);
        $data=[];
        for($i=0;$i<$number;$i++){
            if(empty($values[0][$i])){
                continue;
            }
            if($values[0][$i]!=$drawing_attribute_ay[$i]){
                for($j=0;$j<count($values);$j++){
                    unset($values[$j][$i]);
                }
            }elseif($values[0][$i]==$drawing_attribute_ay[$i]){
                for($j=0;$j<count($values);$j++){
                    $data[$j][$i]=$values[$j][$i];
                }
            }
        }
        $excelHeader=$data[0];
        unset($data[0]);
        $this->model->importImage($excelHeader,$data,$input['id']);
        $response=get_api_response('200');
        //拼接返回值
        return  response()->json($response);
    }

    /**
     * 流水码附件
     *
     * 流水码附件是用于对洗标附件的补充，和洗标附件有两点不同 1.流水码附件不需要上传sap 2.流水码附件需要拆pdf 3.流水码附件是临时使用的
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function waterCodeEnclosureList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->waterCodeEnclosureList($input);
        $obj_list = obj2array($obj_list);
        if(!empty($obj_list) && is_array($obj_list))
        {
//            $id_list = array_column($obj_list,'drawing_id');
//            pd($id_list);
            foreach ($obj_list as &$v)
            {
                $info = DB::table('ruis_drawing_care_label')
                    ->select('sale_order_code','line_project_code','page_division')
                    ->where('drawing_id',$v['drawing_id'])
                    ->first();
                $v['sale_order_code'] = $info->sale_order_code;
                $v['line_project_code'] = $info->line_project_code;
                $v['page_division'] = $info->page_division;
            }
        }
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 流水码附件上传接口
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function waterCodeUploadFile(Request $request)
    {
        $input = $request->all();
        trim_strings($request);
        if (empty($input['category_id'])) TEA('700', 'category_id');
        if (empty($input['drawing'])) TEA('700', 'drawing');
        $data = [];
        $admin = session('administrator');
        $data['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $data['extension'] = $input['drawing']->getClientOriginalExtension();//文件后缀
        //判断文件是否带有 被禁止的后缀
        if (!$data['extension'] || in_array(strtolower($data['extension']), $this->prohibited_extensions)) TEA('1101');//不被允许的文件
        $category = $this->model->getRecordById($input['category_id'], ['owner'], config('alias.rdc'));
        if (!$category) TEA('700', 'category_id');
        $data['image_path'] = Storage::disk('public')->putFile(config('app.drawing_library') .$category->owner. DIRECTORY_SEPARATOR . date('Y-m-d'), $input['drawing']);

        if (empty($data['image_path'])) TEA('7028');//上传失败

        return response()->json(get_success_api_response($data['image_path']));
    }

    /**
     * 流水码附件新增
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function waterCodeBatchStore(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWaterCodeStore($input);

        try {
            DB::connection()->beginTransaction();
            //上传文件
            $this->model->cutPdfByPage($input);
            //写入ruis_drawing_care_label
            $this->model->waterCodeStore($input);

        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();

        return response()->json(get_success_api_response(200));
    }

    /**
     * 流水码详情信息
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function waterCodeShow(Request $request)
    {
        $input = $request->all();
        if (empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        //图片常规
        $obj = $this->model->get($input[$this->model->apiPrimaryKey]);
        //流水码附件信息
        $this->model->waterCodeCarelabel($input[$this->model->apiPrimaryKey],$obj);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 流水码修改
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateWaterCode(Request $request)
    {
        $input = $request->all();
        $this->model->checkWaterCodeStore($input,'update');
        trim_strings($input);
        try {
            DB::connection()->beginTransaction();
            $this->model->updateWaterCode($input);
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();

        return response()->json(get_success_api_response(200));
    }

    /**
     * 删除流水码
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delWaterCode(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        try {
            DB::connection()->beginTransaction();
            $this->model->delWaterCode($input);
        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return response()->json(get_success_api_response(200));
    }
}