<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/4/13
 * Time: 下午1:50
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\BomRouting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BomRoutingController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new BomRouting();
    }

//region 增

    /**
     * 添加流转品
     * @param Request $request
     */
    public function storeLZP(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkLZPFormField($input);
        $res = $this->model->storeLZP($input);
        return response()->json(get_success_api_response($res));
    }

    public function addBomRoutingTemplate(Request $request){
        $input = $request->all();
        trim_strings($input);
        $res = $this->model->addBomRoutingTemplate($input);
        return response()->json(get_success_api_response($res));
    }

//endregion

//region 查

    /**
     * 查询是否有保存过的模板
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingHasSave(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id) || !is_numeric($routing_id)) TEA('700','routing_id');
        $obj = $this->model->getBomRoutingHasSave($bom_id,$routing_id);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 获取模板上的工艺路线详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingTemplateDetail(Request $request){
        $input = $request->all();
        if(empty($input['current_bom_id']) || !is_numeric($input['current_bom_id'])) TEA('700','current_bom_id');
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        if(empty($input['routing_id']) || !is_numeric($input['routing_id'])) TEA('700','routing_id');
        $obj = $this->model->getBomRoutingTemplateDetail($input['current_bom_id'],$input['bom_id'],$input['routing_id']);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 获取工艺路线模板信息
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingTempLatePageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getBomRoutingTempLatePageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 获取工时那儿需要维护的基本数量
     * 暂时挂靠在工序节点控制码中，但是不能在这控制码这儿做更新，会导致错误
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingBaseQty(Request $request){
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->getBomRoutingBaseQty($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取bom工艺路线信息
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRouting(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id)) TEA('700','routing_id');
        $obj_list = $this->model->getBomRouting($bom_id,$routing_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取bom工艺路线集合
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutings(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $obj_list = $this->model->getBomRoutings($bom_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取bom工艺路线预览的数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getPreviewData(Request $request){
        $input = $request->all();
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        if(empty($input['routing_id']) || !is_numeric($input['routing_id'])) TEA('700','routing_id');
        if(empty($input['routing_node_id']) || !is_numeric($input['routing_node_id'])) TEA('700','routing_node_id');
        $sell_order_no = !empty($input['sell_order_no']) ? $input['sell_order_no'] : '';
        $sell_order_line_no = !empty($input['sell_order_line_no']) ? $input['sell_order_line_no'] : '';
        $obj_list = $this->model->getPreviewData($input['bom_id'],$input['routing_id'],$input['routing_node_id'],$sell_order_no,$sell_order_line_no);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取包含需要复制的工序节点的bom
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getNeedCopyBomList(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input['operation_id'])) TEA('700','operation_id');
        $this->checkPageParams($input);
        $obj_list = $this->model->getNeedCopyBomList($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 获取bom工艺路线节点要复制的数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getNeedCopyBomRoutingNodeInfo(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $operation_id = $request->input('operation_id');
        if(empty($operation_id) || !is_numeric($operation_id)) TEA('700','operation_id');
        $current_bom_id = $request->input('current_bom_id');
        if(empty($current_bom_id) || !is_numeric($current_bom_id)) TEA('700','current_bom_id');
        $obj_list = $this->model->getNeedCopyBomRoutingNodeInfo($bom_id,$operation_id,$current_bom_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取下载bom工艺路线数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingDownloadData(Request $request){
        $input = $request->all();
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        if(empty($input['routing_id']) || !is_numeric($input['routing_id'])) TEA('700','routing_id');
        $sell_order_no = !empty($input['sell_order_no']) ? $input['sell_order_no'] : '';
        $sell_order_line_no = !empty($input['sell_order_line_no']) ? $input['sell_order_line_no'] : '';
        $obj_list = $this->model->getBomRoutingDownloadData($input['bom_id'],$input['routing_id'],$sell_order_no,$sell_order_line_no);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取能够被替换的工艺路线
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getCanReplaceBom(Request $request){
        $input = $request->all();
        trim_strings($input);
        $data = $this->model->getCanReplaceBom($input);
        return response()->json(get_success_api_response($data));
    }


    public function getUnFinishWoAndPoByBomRouting(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        if(empty($input['routing_id']) || !is_numeric($input['routing_id'])) TEA('700','routing_id');
        $obj_List = $this->model->getUnFinishWoAndPoByBomRouting($input['bom_id'],$input['routing_id']);
        return response()->json(get_success_api_response($obj_List));
    }

//endregion

//region 改

    public function saveBomRoutinginfo(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkBomRoutingFormField($input);
        $this->model->saveBomRoutinginfo($input);
        return response()->json(get_success_api_response(200));
    }

    public function hasNotUsedMaterial(Request $request){
        $input = $request->all();
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        if(!isset($input['routing_info'])) TEA('700','routing_info');
        $input['routing_info'] = json_decode($input['routing_info'],true);
        //检查用料是否准确
        $obj_list = $this->model->hasNotUsedMaterial($input);
        return response()->json(get_success_api_response($obj_list));
    }

    public function saveBomRoutingCheck(Request $request){
        $input = $request->all();
        $this->model->saveBomRoutingCheck($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 修改工时那儿的基本数值
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateBomRoutingBaseQty(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->updateBomRoutingBaseQty($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 替换工艺路线
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function replaceBomRoutingGn(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->replaceBomRoutingGn($input);
        return response()->json(get_success_api_response(200));
    }


//endregion

//region 删

    public function deleteBomRouting(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id)) TEA('700','routing_id');
        $routings = $request->input('routings');
        if(empty($routings)) TEA('700','routings');
        $this->model->deleteBomRouting($bom_id,$routing_id,$routings);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 删除bom的工艺路线和流转品的关系
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function deleteEnterMaterialLzp(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id) || !is_numeric($routing_id)) TEA('700','routing_id');
        $material_ids = $request->input('material_ids');
        if(empty($material_ids)) TEA('700','material_ids');
        $this->model->deleteEnterMaterialLzp($bom_id,$routing_id,$material_ids);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 删除工艺路线模板
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function deleteBomRoutingTemplate(Request $request){
        $template_id = $request->input('template_id');
        if(empty($template_id) || !is_numeric($template_id)) TEA('700','template_id');
        $this->model->deleteBomRoutingTemplate($template_id);
        return response()->json(get_success_api_response(200));
    }

//endregion

    /**
     * 按工序导出数据
     * @param Request $request
     * @throws \App\Exceptions\ApiException
     */
    public function exportByOperationId(Request $request)
    {
        $input = $request->all();
        if(empty($input['operation_id'])) TEA('700','operation_id');
        if(empty($input['begin_time'])) TEA('700','begin_time');
        if(empty($input['end_time'])) TEA('700','end_time');
        $this->model->exportByOperationId($input);
    }

}