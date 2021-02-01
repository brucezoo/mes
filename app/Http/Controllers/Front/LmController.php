<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 语言管理
 * @author  leo
 * @time    2018年02月02日14:41:31
 */
class LmController extends Controller
{
    /**
     * 语言管理页面
     * @return \Illuminate\View\View
     */
    public function mLm()
    {
        return view('language_management.lm');
    }


    /**
     * 能力翻译页面
     * @return \Illuminate\View\View
     */
    public function mTranslate()
    {
        return view('translate.translate');
    }

    /**
     * 工序翻译页面
     * @return \Illuminate\View\View
     */
    public function mProcess()
    {
        return view('translate.process');
    }

    /**
     * 工序维护
     * @return \Illuminate\View\View
     */
    public function mMaintain()
    {
        return view('translate.maintain');
    }

    /**
     * 工序查看
     * @return \Illuminate\View\View
     */
    public function mShow()
    {
        return view('translate.show');
	}

	/**
	 * 工艺路线列表
	 * @return \Illuminate\View\View
	 */
	public function mTec()
	{
		return view('translate.teclist');
	}

	/**
	 * 做法字段列表
	 * @return \Illuminate\View\View
	 */
	public function mPra()
	{
		return view('translate.praTra');
	}

	/**
	 * 英文工艺文件查看
	 * @return \Illuminate\View\View
	 */
	public function mProcessFile()
	{
		return view('translate.processFile');
	}

	/**
	 * 英文附件查看
	 * @return \Illuminate\View\View
	 */
	public function mAttachment()
	{
		return view('translate.attachment');
	}

	/**
	 * 英文版工单工艺查看
	 * @return \Illuminate\View\View
	 */
	public function workOrder()
	{
		return view('translate.workOrderProcess');
	}
	/**
	 * 英文版工艺查看
	 * @return \Illuminate\View\View
	 */
	public function workView()
	{
		return view('translate.workProcess');
	}
   
}
