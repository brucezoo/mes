<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/6/13
 * Time: 10:52
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 质检管理视图控制器
 * @author  zhaobc
 */
class QCSystemAnalysisController extends Controller
{
    /**
     * 年度分析信息
     * @return   string   json
     * @author   zhaobc
     */
    public function AnnualSummary(Request  $request)
    {
        return view('SystemAnalysis.annualSummary');
    }

    /**
     * 月度分析信息
     * @return   string   json
     * @author   zhaobc
     */
    public function monthlySummary(Request  $request)
    {
        return view('SystemAnalysis.monthlyBadSummary');
    }

    /**
     * 失效成本分析信息
     * @return   string   json
     * @author   zhaobc
     */
    public function invalidCostReport(Request  $request)
    {
        return view('SystemAnalysis.invalidCostReport');
    }
    //endregion

    /**
     * 失效成本年度分析信息
     * @return   string   json
     * @author   zhaobc
     */
    public function invalidCostAnnualReport(Request  $request)
    {
        return view('SystemAnalysis.invalidCostStatistics');
    }

    /**
     * 失效汇总分析信息
     * @return   string   json
     * @author   zhaobc
     */
    public function failureSummary(Request  $request)
    {
        return view('SystemAnalysis.failureSummary');
    }

    public  function CustomerComplaint(Request $request)
    {
        return view('SystemAnalysis.CustomerComplaint');
    }

    /**
     * 失效汇总分析信息
     * @return   string   json
     * @author   zhaobc
     */
    public function blReport(Request  $request)
    {
        return view('SystemAnalysis.blReport');
    }

    /**
     * 失效汇总分析信息
     * @return   string   json
     * @author   zhaobc
     */
    public function anomalyAnalysis(Request  $request)
    {
        return view('SystemAnalysis.anomalyAnalysis');
    }
}
