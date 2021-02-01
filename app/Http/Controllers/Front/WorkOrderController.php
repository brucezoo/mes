<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/3/6
 * Time: 下午2:47
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 订单
 * @author  guangyang.wange
 * @time    2018年02月06日08:46:25
 */
class WorkOrderController extends Controller
{
    /**
     * 列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function workOrderIndex(Request $request)
    {
        return view('work_order.index');
    }
    /**
     * 合并列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function combineIndex(Request $request)
    {
        return view('picking.combinePicking');
    }
    /**
     * 车间合并列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function combineShopIndex(Request $request)
    {
        return view('picking.combineShopPicking');
    }
    /**
     * 退料列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function combineReturnIndex(Request $request)
    {
        return view('picking.combineReturnIndex');
    }
    /**
     * 合并详情
     * @return   string   json
     * @author   guangyang.wang
     */
    public function combineItems(Request $request)
    {
        return view('picking.combineItems');
    }

    /**
     * 车间合并详情
     * @return   string   json
     * @author   guangyang.wang
     */
    public function combineShopItems(Request $request)
    {
        return view('picking.combineShopItems');
    }
    /**
     * 合并退料详情
     * @return   string   json
     * @author   guangyang.wang
     */
    public function combineReturnItems(Request $request)
    {
        return view('picking.combineReturnItems');
    }

    /**
     * 查看
     * @return   string   json
     * @author   guangyang.wang
     */
    public function workOrderView(Request $request)
    {
        return view('work_order.view');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function createPickingList(Request $request)
    {
        return view('work_order.createPickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function createWorkshopPickingList(Request $request)
    {
        return view('work_order.createWorkshopPickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewPickingList(Request $request)
    {
        return view('work_order.viewPickingList');
    }
    /**
     * 生成合并领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewPickingListForAllPicking(Request $request)
    {
        return view('work_order.viewPickingListForAllPicking');
    }
    /**
     * 生成车间合并领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewShopPickingListForAllPicking(Request $request)
    {
        return view('work_order.viewShopPickingListForAllPicking');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewWorkshopPickingList(Request $request)
    {
        return view('work_order.viewWorkShopPickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewWorkshopPickingListSend(Request $request)
    {
        return view('work_order.viewWorkShopPickingListSend');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function workshopPickingList(Request $request)
    {
        return view('work_order.pickingWorkshopList');
    }
    /**
     * 生成委外领料单
     * @return   string   json
     * @author   zhaobc
     */
    public function outsourcingSendMaterials(Request $request)
    {
        return view('work_order.outsourcingSendMaterials');
    }
    /**
     * 合并发料
     * @return   string   json
     * @author   guangyang.wang
     */
    public function workshopPickingListPage(Request $request)
    {
        return view('work_order.workshopPickingListPage');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pickingList(Request $request)
    {
        return view('work_order.pickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function specialCauseIndex(Request $request)
    {
        return view('work_order.special_cause');
    }

    /**
     * 补料审核列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function auditPickingListPageIndex(Request $request)
    {
        return view('work_order.picking_audit_page');
    }

    /**
     * 补料审核
     * @return   string   json
     * @author   guangyang.wang
     */
    public function auditPickingList(Request $request)
    {
        return view('work_order.picking_audit');
    }

    /**
     * 委外补料审核列表
     * @return   string   json
     * @author   zhaobc
     */
    public function outSourceReviewList(Request $request)
    {
        return view('qc_management.outSourceReviewList');
    }

    /**
     * 委外补料审核
     * @return   string   json
     * @author   zhaobc
     */
    public function outSourceReview(Request $request)
    {
        return view('qc_management.outSourceReview');
    }
    /**
     * 批量领料列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pickingAllPageIndex(Request $request)
    {
        return view('work_order.pickingAllPageIndex');
    }
    /**
     * 批量领料
     * @return   string   json
     * @author   guangyang.wang
     */
    public function addPickingAllItems(Request $request)
    {
        return view('work_order.addPickingAllItems');
    }
    /**
     * 批量领料入库
     * @return   string   json
     * @author   guangyang.wang
     */
    public function editPickingAllItems(Request $request)
    {
        return view('work_order.editPickingAllItems');
    }



    /**
     * 批量领料列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pickingAllNewPageIndex(Request $request)
    {
        return view('picking.pickingAllNewPageIndex');
    }
    /**
     * 批量领料
     * @return   string   json
     * @author   guangyang.wang
     */
    public function addPickingAllNewItems(Request $request)
    {
        return view('picking.addPickingNewAllItems');
    }
    /**
     * 批量领料入库
     * @return   string   json
     * @author   guangyang.wang
     */
    public function editPickingAllNewItems(Request $request)
    {
        return view('picking.editPickingNewAllItems');
    }

    /**
     * 批量领料入库
     * @return   string   json
     * @author   zhaobc
     */
    public function inventoryManagement(Request $request)
    {
        return view('work_order.inventoryManagement');
    }

    /**
     * 批量领料入库
     * @return   string   json
     * @author   zhaobc
     */
    public function inventorySave(Request $request)
    {
        return view('work_order.inventorySave');
    }

    /**
     * 超投審核
     * @return   string   json
     * @author   jiyu
     */
    public function toexamine(Request $request) {
        return view('work_order.toexamine');
    }
}
