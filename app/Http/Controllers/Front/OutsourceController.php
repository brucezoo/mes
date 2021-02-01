<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/8/31
 * Time: 09:13
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 委外模块
 * @author  guangyang.wang
 * @time    2018年08月31日09:30:31
 */
class OutsourceController extends Controller
{
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function outsourceIndex()
    {
        return view('outsource.outsource_index');
    }
    /**
     * 委外领料合并
     * @return \Illuminate\View\View
     */
    public function outsourceAllItems()
    {
        return view('outsource.outsourceAllItems');
    }
    /**
     * 委外车间领料合并
     * @return \Illuminate\View\View
     */
    public function outsourceShopAllItems()
    {
        return view('outsource.outsourceShopAllItems');
    }
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function outsourceOrderIndex()
    {
        return view('outsource.outsource_order_index');
    }
    /**
     * 委外订单给客户
     * @return \Illuminate\View\View
     */
    public function outsourceIndexForCustomer()
    {
        return view('outsource.outsource_index_customer');
    }
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function viewOutsource()
    {
        return view('outsource.outsource_view');
    }
    /*
    /**
     * 委外领料单
     * @return \Illuminate\View\View
     */
    public function outsourcePickingIndex()
    {
        return view('outsource.outsourcePickingList');
    }
    /**
     * 委外订单报工
     * @return \Illuminate\View\View
     */
    public function busteOutsourceOrder()
    {
        return view('outsource.busteOutsource');
    }
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function viewOutsourceOrder()
    {
        return view('outsource.outsource_order_view');
    }
    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function createOutsource()
    {
        return view('outsource.createOutsource');
    }
    /**
     * 委外工单退补料
     * @return \Illuminate\View\View
     */
    public function createOutsourceOrder()
    {
        return view('outsource.createOutsourceOrder');
    }
    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function editOutsource()
    {
        return view('outsource.editOutsource');
    }
/***************************  修改 start  *********************** */

    /**
     * 委外sap补料
     * @return \Illuminate\View\View
     */
    public function editOut()
    {
        return view('out.editOut');
    }

/****************************  修改 end  *********************** */





    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function sendOutsourceOrder()
    {
        return view('outsource.sendOutsourceOrder');
    }
    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function editOutsourceOrder()
    {
        return view('outsource.createOutsourceOrderView');
    }
    /**
     * 委外车间管理
     * @return \Illuminate\View\View
     */
    public function outsourceWorkshopManage()
    {
        return view('outsource.outsourceWorkshopManage');
    }
    /**
     * 委外车间合并领料单
     * @return \Illuminate\View\View
     */
    public function consolidateRequisition()
    {
        return view('outsource.consolidateRequisition');
    }
    /**
     * 委外车间合并领料
     * @return \Illuminate\View\View
     */
    public function outsourceWorkshopPicking()
    {
        return view('outsource.outsourceWorkshopPicking');
    }
    /**
     * 委外车间领料单发料
     * @return \Illuminate\View\View
     */
    public function outsourceWorkshopStoreIssue()
    {
        return view('outsource.outsourceWorkshopStoreIssue');
    }
    /**
     * 
     * 委外车间补料列表
     */
    public function outSourceFeedingPageIndex()
    {
        return view('qc_management.outSourceFeedingList');
    }
    /**
     * 
     * 委外车间补料审核
     */
    public function outSourceFeedingShow()
    {
        return view('qc_management.outSourceFeedingShow');
    }
    /**
     * 
     * 委外车间报工列表
     */
    public function outsourceMergeBuste()
    {
        return view('outsource.outsourceMergeBuste');
    }
    /**
     * 
     * 委外车间报工页
     */
    public function outsourceMergeBusteIndex()
    {
        return view('outsource.outsourceMergeBusteIndex');
	}


	public function waterCodes()
	{
		return view('out.waterCode');
	}

	public function addWaterCodes()
	{
		return view('out.addWaterCode');
	}

	public function editWaterCodes()
	{
		return view('out.editWaterCode');
	}

	public function adWaterCodes()
	{
		return view('out.editWaterCode');
	}
}