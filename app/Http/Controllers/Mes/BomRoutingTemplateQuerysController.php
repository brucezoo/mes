<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2019/1/5
 * Time: 3:09 PM
 */
namespace App\Http\Controllers\Mes;

use App\Http\Models\BomRoutingTemplateQuerys;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class BomRoutingTemplateQuerysController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new BomRoutingTemplateQuerys();
    }

    /**
     * 添加工艺路线模板查询字段
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function addBomRoutingTemplateQuerys(Request $request){
        $input = $request->input();
        if(empty($input['material_category_id']) || !is_numeric($input['material_category_id'])) TEA(700,'material_category_id');
        if(empty($input['querys']) || !is_json($input['querys'])) TEA(700,'querys');
        $this->model->addBomRoutingTemplateQuerys($input['material_category_id'],json_decode($input['querys'],true));
        return response()->json(get_success_api_response(200));
    }

    /**
     * 获取查询字段
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingTemplateQuerys(Request $request){
        $material_category_id = $request->input('material_category_id');
        if(empty($material_category_id) || !is_numeric($material_category_id)) TEA('700','material_category_id');
        $obj_list = $this->model->getBomRoutingTemplateQuerys($material_category_id);
        return response()->json(get_success_api_response($obj_list));
    }
}