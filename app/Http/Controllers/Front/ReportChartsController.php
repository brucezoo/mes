<?php

/**
 * Created by VSCode.
 * User: zhaobc
 * Date: 2019/8/5
 * Time: 13:23
 */

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 质检管理视图控制器
 * @author  guangyang.wang
 */
class ReportChartsController extends Controller
{
  /**
   * 在制车间生产报表
   * @return   string   json
   * @author   zhaobc
   */
  public function viewWorkshopProducedList(Request  $request)
  {
    return view('report_charts.viewWorkshopProducedList');
  }

  /**
   * 生产报表
   * @return   string   json
   * @author   zhaobc
   */
  public function viewWorkshopList(Request  $request)
  {
    return view('report_charts.viewWorkShopList');
  }

  /**
   * 批次追溯报表
   * @return   string   json
   * @author   zhaobc
   */
  public function viewBatchList(Request  $request)
  {
    return view('report_charts.viewBatchList');
  }

  public function batchDetailList(Request  $request)
  {
    return view('report_charts.viewBatchListDetail');
  }
  
  /**
   * 在制车间生产报表
   * @return   string   json
   * @author   zhaobc
   */
  public function viewWarehouse(Request  $request)
  {
    return view('report_charts.warehouse');
  }


	/**
	 * 车间物料齐料检报表
	 * @return   string   json
	 * @author   zhaobc
	 */
	public function viewInspection(Request  $request)
	{
		return view('report_charts.inspection');
	}
}
