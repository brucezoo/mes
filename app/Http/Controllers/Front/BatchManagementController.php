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
 * 批次管理视图控制器
 * @author  zhaobc
 */
class BatchManagementController extends Controller
{
  /**
   * 批次追溯
   * @return   string   json
   * @author   zhaobc
   */
  public function traceBackBatch(Request  $request)
  {
    return view('pad_buste.traceBackBatch');
  }
  /**
   * 批次列表
   * @return   string   json
   * @author   zhaobc
   */
  public function batchList(Request  $request)
  {
    return view('batch_management.viewBatchList');
  }
  /**
   * 批次成品列表
   * @return   string   json
   * @author   zhaobc
   */
  public function finishedProductBatchList(Request  $request)
  {
    return view('batch_management.viewFinishedProductBatchList');
  }
  /**
   * 预报工清单
   * @return   string   json
   * @author   zhaobc
   */
  public function batchTraceDeclareList(Request  $request)
  {
    return view('batch_management.batchTraceDeclareList');
  }
   /**
   * 成品批次追溯
   * @return   string   json
   * @author   zhaobc
   */
  public function traceBackFinishedBatch(Request  $request)
  {
    return view('pad_buste.traceBackFinishedBatch');
  }
}
