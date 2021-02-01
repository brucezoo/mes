<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/9
 * Time: 14:13
 */
namespace App\Http\Controllers\Mes;

use App\Http\Models\QC\CheckItemResult;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class CheckItemResultController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new CheckItemResult();
    }
//region 修
//修改检验项结果
    public function editCheckItemResult(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->edit($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }
//endregion

//region 查
//查看检验项结果
    public function viewCheckItemResult(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->view($input['check_id']);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

//endregion

//region 删
//endregion


    public function  addMCData(Request $request)
    {
        $params = $request->all();
        $res = DB::table('ruis_qc_check as qcheck')->select('qcheck.*', 'productionOrder.number as po_number')
            ->leftJoin('ruis_production_order as productionOrder', 'qcheck.production_order_id', '=', 'productionOrder.id')
            ->where('qcheck.id', $params['id'])->get();
        // 看有没有委外工单的号码
        if ($res[0]->sub_order_id > 0) {
//
            $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;

            try {
                DB::connection()->beginTransaction();
                $qcRes = DB::table('ruis_qc_check')->where('id', $params['id'])->update(['LIFNR' => $params['sub_number']]);
                if($qcRes){
                    $events = [
                        'action' => 'update',
                        'desc' => 'qc_check修改Mc的供应商编码',
                        'field'=> 'LIFNR',
                        'comment'=>'',
                        'from'=>'',
                        'to'=>'',
                        'extra'=>''
                    ];
                    $rtRes =  DB::table('ruis_trace'."_".date("Y"))->insert(
                        ['owner_type'=>'ruis_qc_check',
                            'owner_id'=>$params['id'],
                            'events'=>"[".json_encode($events)."]",
                            'operation_id'=> $creator_id,
                            'ctime'=>time()
                        ]);
                }
            } catch (\Exception $exception) {

                DB::connection()->rollBack();
                $data = ['code' => 500, 'message' => '修改失败'];
                return response()->json($data);

            }
            DB::connection()->commit();
            $message = $qcRes ? "添加成功" : "添加失败";
            $code = $res ? 200 : 500;
            $data = ['code' => $code, 'message' => $message];
            return response()->json($data);
//            }
        }else{
            $data = ['code' => 500, 'message' => '没有委外单号'];
            return response()->json($data);

        }
    }
}