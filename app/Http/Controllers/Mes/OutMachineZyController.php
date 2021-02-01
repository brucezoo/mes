<?php
namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\OutMachineZy;
use App\Libraries\Soap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutMachineZyController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new OutMachineZy();
    }

    /**
     * @message 批量新增委外相关单据
     * @author  liming
     * @time    年 月 日
     */    
    public function storeMoreZy(Request $request)
    {
        $input = $request->all();
        $moreItems = $input['moreItems'];
        if (count($moreItems) >0 ) 
        {
            $resp  = [];
            foreach ($moreItems as  $item) 
            {
                $temp_arr= json_decode( $item['items']);
                if (count($temp_arr)<1) 
                {
                   continue;
                }
                else
                {
                    $out_picking_id  = $item['out_picking_id'];
                    $type_code  = $item['type_code'];
                    $results= $this->model->ready($item);
                    $resp[]= $results;
                    $insert_ids = $results['insert_ids'];
                    if (count($insert_ids)>0) 
                    {
                        foreach ($insert_ids as $key => $insert_id) 
                        {
                            $sap_response = $this->model->pushOutMachineZy($insert_id);
                            if ($sap_response['RETURNCODE'] != 0) 
                            {
                               TEA('2450');
                            }
                            // 如果推送成功，状态为2
                            $this->model->updateStatus($insert_id, 2);
                        }
                        if ($type_code == 'ZY03')
                        {
                            //如果是委外额定领料单
                            //反写领料单 状态字段
                            $this->model->updateZyStatus($out_picking_id);
                        }

                    }
                  
                }
            }
        }
        return response()->json(get_success_api_response($resp));
    }

    /**
     * @message 新增委外相关单据
     * @author  liming
     * @time    年 月 日
     */    
    public function storeZy(Request $request)
    {
        $input = $request->all();
        if(!isset($input['type_code'])) TEA('700','type_code');
        $insert_ids= $this->model->storeZy($input);
        $response=get_api_response('200');
        foreach ($insert_ids as $key => $insert_id) 
        {
            $sap_response = $this->model->pushOutMachineZy($insert_id);
            if ($sap_response['RETURNCODE'] != 0) 
            {
               TEA('2450');
            }
            // 如果推送成功，状态为2
            $this->model->updateStatus($insert_id, 2);
        }
        if ($input['type_code'] == 'ZY03')
        {
            //如果是委外额定领料单
            //反写领料单 状态字段
            $this->model->updateZyStatus($input['out_picking_id']);
        }
        return  response()->json($response);
    }

    /**
     * @message 删除
     * @author  liming
     * @time    年 月 日
     */    
    public  function  destroyZy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);
    } 


    /**
     * @message  推送委外相关单据
     *
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     */
    public function pushOutMachineZy(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        $response = $this->model->pushOutMachineZy($input['id']);

        if ($response['RETURNCODE'] != 0) {
            TEPA($response['RETURNINFO']);
        }
        // 如果推送成功，状态为2
        $this->model->updateStatus($input['id'], 2);
        return response()->json(get_success_api_response($response));
    }


    /**
     * 分页列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * @message 获取单条委外单条相关
     * @author  liming
     * @time    年 月 日
     */    
    
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->show($id);
        return  response()->json($response);
    }

    /**
     * 委外单据批量打印 shuaijie.feng
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBatchprinting(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->getBatchprinting($input);
        return response()->json(get_success_api_response($results));
    }



    public function export(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->export($input);
        //获取返回值
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 领料详情删除
     * author: szh
     * Date: 2019/6/12/012
     * Time: 17:00
     */
    public  function  destroyItem(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroyItem($id);
        $response=get_api_response('200');
        $response['results']=['id'=>$id];
        return  response()->json($response);
    }

    /**
     *  委外修改审核状态、原因、备注 hao.li 7.24/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
     public function updateOutsource(Request $request)
     {
         $input = $request->all();
         trim_strings($input);
         $response = $this->model->updateOutsource($input);
         return  response()->json(get_success_api_response('200'));
     }


    /**
     *  委外补料导出   shuaijie.feng   7.27/2019
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function FeedingExport(Request $request)
     {
         $input = $request->all();
         trim_strings($input);
         $this->model->FeedingExport($input);
         return response()->json(get_success_api_response('200'));
     }

     //  删除领料单未发料行项
     public function DeleteRetreatRow(Request $request)
     {
         $input = $request->all();
         trim_strings($input);
         $this->model->DeleteRetreatRow($input);
         return response()->json(get_success_api_response('200'));
     }

}