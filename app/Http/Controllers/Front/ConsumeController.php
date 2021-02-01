<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 余料库存清理
 * @author  
 * @time    2018年02月02日14:41:31
 */
class ConsumeController extends Controller
{
	/**
	 * 余料库存清理
	 * @return \Illuminate\View\View
	 */
	public function lConsume()
	{
		return view('consume.consume');
	}


	/**
	 * 增加
	 * @return \Illuminate\View\View
	 */
	public function consumeAdd()
	{
		return view('consume.consumeAdd');
	}

}
