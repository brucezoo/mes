<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/6/13
 * Time: 10:52
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 质检管理视图控制器
 * @author  guangyang.wang
 */
class QCComplaintManagementController extends Controller
{



//region  客诉


    /**
     * 索赔单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function claimIndex(Request  $request)
    {
        return view('qc_management.claimIndex');
    }

    /**
     * 索赔单
     * @return   string   json
     * @author   zhaobc
     */
    public function addClaim(Request  $request)
    {
        return view('qc_management.addClaim');
    }

    /**
     * 索赔单
     * @return   string   json
     * @author   zhaobc
     */
    public function viewClaim(Request  $request)
    {
        return view('qc_management.viewClaim');
    }

    /**
     * 索赔单
     * @return   string   json
     * @author   zhaobc
     */
    public function reviewClaim(Request  $request)
    {
        return view('qc_management.reviewClaim');
    }

    /**
     * 索赔单审核
     * @return string json
     * @author zhaobc
     */
    public function replyClaimIndex(Request $request)
    {
      return view('qc_management.replyClaimIndex');
    }

    /**
     * 失效成本分析
     * @return string json
     * @author zhaobc
     */
    public function invalidCostIndex(Request $request)
    {
      return view('invalid_cost.invalidCost');
    }

     /**
     * 失效成本列表
     * @return string json
     * @author jiyu
     */
    public function getInvalidList(Request $request)
    {
      return view('invalid_cost.invalidList');
    }

    /**
     * 失效成本提报
     * @return string json
     * @author zhaobc
     */
    public function invalidCostList(Request $request)
    {
      return view('invalid_cost.invalidCostList');
    }

    /**
     * 失效成本处理列表
     * @return string json
     * @author zhaobc
     */
    public function invalidCostHandleList(Request $request)
    {
      return view('invalid_cost.invalidCostHandleList');
    }

    /**
     * 失效成本核算列表
     * @return string json
     * @author jiyu
     */
    public function invalidCostCheckList(Request $request)
    {
      return view('invalid_cost.invalidCostCheckList');
    }

    /**
     * 不良项目列表
     * @return string json
     * @author zhaobc
     */
    public function defectiveItemList(Request $request)
    {
      return view('invalid_cost.defectiveItemList');
    }

    /**
     * 失效项目列表
     * @return string json
     * @author zhaobc
     */
    public function processingMethodList(Request $request)
    {
      return view('invalid_cost.processingMethodList');
    }

    /**
     * 失效项目列表
     * @return string json
     * @author zhaobc
     */
    public function expiredItemList(Request $request)
    {
      return view('invalid_cost.expiredItemList');
    }

    /**
     * 失效项目列表
     * @return string json
     * @author zhaobc
     */
    public function departmentList(Request $request)
    {
      return view('invalid_cost.qcDepartmentList');
    }

     /**
     * 统计部门
     * @return string json
     * @author zhaobc
     */
    public function departmentLists(Request $request)
    {
      return view('invalid_cost.qcDepartmentLists');
    }


    /**
     * 查看客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function addComplaint(Request  $request)
    {
        return view('qc_management.addComplaint');
    }

    /**
     * 查看客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewComplaint(Request  $request)
    {
        return view('qc_management.viewComplaint');
    }

    /**
     * 查看客诉详情
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewComplaintById(Request  $request)
    {
        return  view('qc_management.viewComplaintbyId');
    }

    /**
     * 处理客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function disposeComplaint(Request  $request)
    {
        return view('qc_management.disposeComplaint');
    }
    /**
     * 发生到各部门
     * @return   string   json
     * @author   guangyang.wang
     */
    public function disposeComplaintSend(Request  $request)
    {
        return view('qc_management.disposeComplaintSend');
    }

    /**
     * 回复客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function replyComplaint(Request  $request)
    {
        return view('qc_management.replyComplaint');
    }
    /**
     * 回复客诉查看
     * @return   string   json
     * @author   guangyang.wang
     */
    public function replyComplaintView(Request  $request)
    {
        return view('qc_management.replyComplaintView');
    }


    /**
     * 审核客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function auditComplaint(Request  $request)
    {
        return view('qc_management.auditComplaint');
    }

    /**
     * 新增客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function addComplaintItem(Request  $request)
    {
        return view('qc_management.addComplaintItem');
    }
    /**
     * 查看客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewComplaintItem(Request  $request)
    {
        return view('qc_management.viewComplaintItem');
    }
    /**
     * 编辑客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function editComplaintItem(Request  $request)
    {
        return view('qc_management.editComplaintItem');
    }

    /**
     * 客诉通知信息
     * @return   string   json
     * @author   jiyu
     */
    public function message(Request  $request)
    {
        return view('qc_management.message');
    }

    //endregion
}
