<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/12/16 20:36
 * Desc:
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\MaterialPicking;
use Illuminate\Http\Request;

class MaterialPickingController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        empty($this->model) && $this->model = new MaterialPicking();
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function store(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkStoreParams($input);
        $resp = $this->model->store($input);
        return response()->json(get_success_api_response($resp));
    }

}