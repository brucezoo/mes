<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/12/4
 * Time: 09:49
 */


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 编码对照模块
 * @author  guangyang.wang
 * @time    2018年12月1日09:30:31
 */
class CodeComparativeController extends Controller
{
    /**
     * 编码对照模块列表
     * @return \Illuminate\View\View
     */
    public function pageIndex()
    {
        return view('codecomparative.index');
    }
}