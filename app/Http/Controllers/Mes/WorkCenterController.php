<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:51
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\WorkCenter;

class WorkCenterController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(!$this->model) $this->model = new WorkCenter();
    }


//region 检

    /**
     * 检测唯一性
     */
    public function unique(Request $request){
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

//endregion

//region 增

    /**
     * 添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function store(Request $request){
        $input = $request->all();
        $this->model->checkFormField($input);
        $insert_id = $this->model->add($input);
        return response()->json(get_success_api_response($insert_id));
    }

    /**
     * sap 同步workCenter给mes
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncWorkCenter(Request $request)
    {
        $input = $request->all();
//        api_to_txt($input, $request->path());
        $response = $this->model->syncWorkCenter($input);
        return response()->json(get_success_sap_response($input,$response));
    }

//endregion

//region 查

    /**
     * 分页列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function pageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getWorkCenterListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 详情
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function show(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->get($id);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * select列表
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function select(Request $request){
        $input = $request->all();
        $obj = $this->model->getWorkCenterList($input);
        return response()->json(get_success_api_response($obj));
    }

//endregion

//region 改

    /**
     * 修改信息
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function update(Request $request){
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion

//region 删

    /**
     * 删除
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function delete(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $has = $this->model->isExisted([['workcenter_id','=',$id]],config('alias.rwb'));
        if($has) TEA('1102');
        $this->model->delete($id);
        return response()->json(get_success_api_response($id));
    }

//endregion

    /**
     * 添加工时维护
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateWorkcenterHourStatus(Request $request){
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $this->model->updateWorkcenterHourStatus($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

}