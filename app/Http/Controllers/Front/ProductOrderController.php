<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 订单
 * @author  rick
 * @time    2018年02月06日08:46:25
 */
class ProductOrderController extends Controller
{


    //region  增
    /**
     * 订单添加
     * @return   string   json
     * @author   rick
     */
    public function productOrderCreate(Request  $request)
    {
        return view('product_order.order_form');
    }

    //endregion


    //region 查
    /**
     * 订单列表
     * @return   string   json
     * @author   rick
     */
    public function productOrderIndex(Request  $request)
    {
        return view('product_order.order_index');
    }

    /**
     * 订单查看
     * @return   string   json
     * @author   rick
     */
    public function productOrderView(Request  $request)
    {
        return view('product_order.order_view');
    }

    /**
     * 订单拉取
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pullOrderIndex(Request  $request)
    {
        return view('product_order.pullOrderIndex');
    }
    /**
     * bom拉取
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pullOrderbom(Request  $request)
    {
        return view('product_order.pullOrderbom');
    }
    //endregion

    //region 改
    /**
     * 订单编辑
     * @return   string   json
     * @author   rick
     */
    public function productOrderEdit(Request  $request)
    {
        return view('product_order.order_edit');
    }
    //endregion

    /***
     * @return \Illuminate\View\View
     */
    public function productOrderReleased()
    {
        return view('product_order.released_index');
    }

    /***
     * @return \Illuminate\View\View
     */
    public function productOrderReleasedView()
    {
        return view('test_management.ally'); // 暂时修改
    }

    /**
     * 旧生产实时看板
     * @return   string   json
     * @author   zhaobc
     */
    public function productOrderBoardView(Request  $request)
    {
        return view('product_order.order_board_view');
    }

    /**
     * 生产实时看板
     * @return   string   json
     * @author   zhaobc
     */
    public function workShopBoard(Request  $request)
    {
        return view('product_order.workShopList');
    }

    /**
     * @return  string   json
     * @author  cm
     * 工单工艺查看
     */
    public function productOrderWoCraftView()
    {
        return view('product_order.woCraftView');
    }

    /**
     * @return  string   json
     * @author  cm
     * 工单工艺查看
     */
    public function productOrderSoCraftView()
    {
        return view('product_order.soCraftViewList');
    }

    
    /**
     * 删除可删除工单
     * @return   string   json
     * @author   bingchun.zhao
     * 
     */
    public function deleteDeleteableProductOrder(Request $request)
    {
        return view('tools.deleteDeleteableProductOrder');
    }

    /**
     * 查看车间替换料日志
     * @return   string   json
     * @author   bingchun.zhao
     * 
     */
    public function viewReplacementLogList(Request $request)
    {
        return view('product_order.viewReplacementLogList');
    }

    /**
     * 查看车间替换料日志
     * @return   string   json
     * @author   bingchun.zhao
     * 
     */
    public function replaceMaterial(Request $request)
    {
        return view('work_order.replaceMaterial');
    }
}