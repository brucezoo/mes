<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 库存查询
 * @author  mao
 * @time   
 */
class StockController extends Controller
{
	/**
	 * 库存查询界面
	 * @return \Illuminate\View\View
	 */
	public function stockSearch()
	{
		return view('stock.stockSearch');
	}


	/**
	 * 批量查询
	 * @return \Illuminate\View\View
	 */
	public function stockSee()
	{
		return view('stock.stockSee');
	}


}
