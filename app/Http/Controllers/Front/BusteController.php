<?php


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 *
 * @author  guangyang.wang
 * @time    2018年01月10日14:41:31
 */
class BusteController extends Controller
{



    /**
     * 报工
     * @return   string   json
     * @author   guangyang.wang
     */
    public function busteIndex(Request  $request)
    {
        return view('buste_management.busteIndex');
    }
    /**
     * 报工列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function bustePageIndex(Request  $request)
    {
        return view('buste_management.bustePageIndex');
    }


    /**
     * 报工pad
     * @return   string   json
     * @author   guangyang.wang
     */
    public function bustePad(Request  $request)
    {
        return view('pad_buste.bustePad');
    }

    /**
     * 合并报工列表
     * @return   string   json
     * @author   zhaobc
     */
    public function mergeBuste(Request  $request)
    {
        return view('buste_management.mergeBuste');
    }

    /**
     * 合并报工
     * @return   string   json
     * @author   zhaobc
     */
    public function mergeBusteIndex(Request  $request)
    {
        return view('buste_management.mergeBusteIndex');
    }

    /**
     * 合并报工
     * @return   string   json
     * @author   zhaobc
     */
    public function inventoryMergeBusteIndex(Request  $request)
    {
        return view('buste_management.inventoryMergeBusteIndex');
	}


	/**
	 * 报工查看
	 * @return   string   json
	 * @author   zhaobc
	 */
	public function reportWorkers(Request  $request)
	{
		return view('buste_management.reportWorkers');
	}

	/**
	 * 报工详情
	 * @return   string   json
	 * @author   zhaobc
	 */
	public function reportDetails(Request  $request)
	{
		return view('buste_management.reportDetails');
	}

}


