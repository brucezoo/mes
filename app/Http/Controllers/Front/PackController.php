<?php


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 上线打包
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    
 */
class PackController extends Controller
{

    /**
     * 导入计划表与排产
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function mImport(Request  $request)
    {
        return view('pack.import');
    }

    /**
     * 装柜
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function mCabinet(Request $request)
    {
        return view('pack.cabinet');
    }

    /**
     * 报工
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function mWorker(Request $request)
    {
        return view('pack.worker');
    }

    /**
     * 销售查询
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function mTable(Request $request)
    {
        return view('pack.summaryTable');
    }

    /**
     * 装柜查询
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function mFind(Request $request)
    {
        return view('pack.find');
    }

    /**
     * 汇总与明细
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function mSummary(Request $request)
    {
        return view('pack.summary');
    }

     /**
     * 装箱
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function mBoxing(Request $request)
    {
        return view('pack.boxing');
    }

    /**
     * sku
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function mSku(Request $request)
    {
        return view('pack.sku');
    }

}