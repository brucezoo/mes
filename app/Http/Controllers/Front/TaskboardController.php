<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/12/10
 * Time: 14:35
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;



class TaskboardController extends Controller
{

//region  系统消息
    /**
     * 系统消息
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function taskboard()
    {
        return view('taskboard.index');
    }

    /**
     * 生产统计
     */
    public function productionStatistics()
    {
        return view('taskboard.productionStatistics');
    }
}