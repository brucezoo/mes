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
 * 样册号管理视图控制器
 * @author  zhaobc
 */
class SampleNumberController extends Controller
{
  /**
   * 样册号列表
   * @return   string   json
   * @author   zhaobc
   */
  public function sampleNumberList(Request  $request)
  {
    return view('sample_number_management.sampleNumberList');
  }

  /**
   * 样册号类型列表
   * @return   string   json
   * @author   zhaobc
   */
  public function sampleNumberTypeList(Request  $request)
  {
    return view('sample_number_management.sampleNumberTypeList');
  }

  /**
   * 样册号编码列表
   * @return   string   json
   * @author   zhaobc
   */
  public function sampleNumberCodeList(Request  $request)
  {
    return view('sample_number_management.sampleNumberCodeList');
  }

  /**
   * 增加样册号
   * @return   string   json
   * @author   zhaobc
   */
  public function addSampleNumber(Request  $request)
  {
    return view('sample_number_management.addSampleNumber');
  }

  /**
   * 查看样册号
   * @return   string   json
   * @author   zhaobc
   */
  public function viewSampleNumber(Request  $request)
  {
    return view('sample_number_management.viewSampleNumber');
  }
}
