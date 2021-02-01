<?php
// 生产报表控制器
// @author guanghui.chen

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Controller Class
class WorkReportController extends Controller
{
    // 报表页面
    // Request URL: WorkReport/workReportIndex
    // Method: GET
    // ContentType: HTML
    public function workReportIndex()
    {
        return view('work_report.index');
    }
}