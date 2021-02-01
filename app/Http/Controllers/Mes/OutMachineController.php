<?php  
/**
 * @message 委外加工 领料单
 * @author  liming
 * @time    年 月 日
 */	
namespace App\Http\Controllers\Mes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\OutMachine;


/**
 *委外加工  领料单
 *@author   liming 
 */
class OutMachineController extends Controller
{

	public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new OutMachine();
    }

	/**
	 * @message  sap   同步委外订单  领料
	 * @author  liming
	 * @time    年 月 日
	 */	
    public function syncOutMachine(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncOutMachine($input);
        return response()->json(get_success_sap_response($response));
    }



    /**
     * 委外订单分页列表[需要传递分页参数]
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
        //$obj_list=$this->model->getPageList($input);
        $obj_list=$this->model->getOptimizationPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 导出委外订单信息
     *
     * @param Request $request
     * @throws \App\Exceptions\ApiException
     * @throws \PHPExcel_Exception
     * @throws \PHPExcel_Reader_Exception
     * @throws \PHPExcel_Writer_Exception
     */
    public function outsourceOrderExportExcel(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $list=$this->model->getPageListExportExcel($input);

        $objPHPExcel = new \PHPExcel();
        $objPHPExcel->getProperties()->setTitle('export')->setDescription('Outsource Order Excel Export');
        $objPHPExcel->setActiveSheetIndex(0);

        //添加表头
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,1, '销售订单号/行项号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,1, '采购凭证编号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,1, '采购凭证类别');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,1, '采购凭证类型');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,1, '供应商或债权人的帐号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,1, '供应商或债权人的名称');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,1, '采购组');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,1, '工序');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,1, '发料状态');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,1, '收料状态');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,1, '报工推送状态');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(11,1, '报工状态');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(12,1, '推送数量');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(13,1, '物料编码');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(14,1, '半成品详情');

        if(count($list) > 0)
        {
            $rows = 1;
            foreach ($list as $v)
            {
                $gx='';
                $wlbm='';
                $bcp='';
                foreach ($v->lines as $kk=>$vv)
                {
                    $gx .= $vv->TXZ01.',';
                }

                foreach ($v->material_list as $kkk=>$vvv)
                {
                    $wlbm .= $vvv->item_no.' ';
                    $bcp .= $vvv->name.' ';
                }
                $v->reply_ZY03 = $v->reply_ZY03==0?'未发料':'已发料';
                $v->replyz_ZY03_status = $v->replyz_ZY03_status==0?'正常':'异常';
                $rows++;
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,$rows,$v->VBELN.'/'.$v->VBELP);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,$rows,$v->EBELN);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,$rows,$v->BSTYP);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,$rows,$v->BSART);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,$rows,$v->LIFNR);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,$rows,$v->LIFNR_name);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,$rows,$v->EKGRP);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,$rows,$gx);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,$rows,$v->reply_ZY03);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,$rows,$v->replyz_ZY03_status);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,$rows,$v->declarePushType);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(11,$rows,$v->declareType);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(12,$rows,$v->MENGE);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(13,$rows,$wlbm);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(14,$rows,$bcp);
            }
        }

        $objPHPExcel->setActiveSheetIndex(0);

        ob_end_clean();//清除缓冲区,避免乱码
        header('Content-Type:application/vnd.ms-excel');
        header('Content-Disposition:attachment;filename="Outsource_Order_' .date('Y-m-d') . '.xls"');
        header('Cache-Control:max-age=0');
        $objWrite = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel5');
        $objWrite->save('php://output');
    }

    /**
     * @message 通过委外订单获取 委外工单
     * @author  liming
     * @time    年 月 日
     */    
    public function showOutWork(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->showOutWork($id);
        return  response()->json($response);
    }
   

    /**
     * @message 获取多条委外订单的信息
     * @author  liming
     * @time    年 月 日
     */    
    
    public function showMore(Request $request)
    {
        //判断ID是否提交
        $ids_str=$request->input('ids');
        if(empty($ids_str)) TEA('703','ids');
        $ids= explode(',' , $ids_str);
        $temp = $this->model->moreShow($ids);
//        $temp=[];
//        foreach ($ids as  $id)
//        {
//           //呼叫M层进行处理
//           $temp[]=$this->model->show($id);
//        }
        $response=get_api_response('200');
        $response['results']=$temp;
        return  response()->json($response);
    }


    /**
     * @message 获取单条委外订单的信息
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
     * 校验是否已经领料
     * author: szh
     * Date: 2019/6/5/005
     * Time: 10:21
     */
    public function checkHasZY03(Request $request)
    {
        $input = $request->all();
        $pickids = explode(',',$input['ids']);
        $results = $this->model->checkHasZY03($pickids);
        return response()->json(get_success_api_response($results));
    }


    /**
     * 采购订单关闭/开启
     * author: szh
     * Date: 2019/6/12/012
     * Time: 17:00
     */
    public  function  destory(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        $is_delete = $request->input('is_delete');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroy($id,$is_delete);
        $response=get_api_response('200');
        $response['results']=['id'=>$id];
        return  response()->json($response);
    }





}
?>