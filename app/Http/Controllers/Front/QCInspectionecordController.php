<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/4/3
 * Time: 18:54
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 质检管理视图控制器
 * @author  guangyang.wang
 */
class QCInspectionecordController extends Controller
{



//region IQC检验记录


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionIQCIndex(Request  $request)
    {
        return view('qc_management.inspectionIQCIndex');
    }
//endregion

/**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionOSQCIndex(Request  $request)
    {
        return view('qc_management.inspectionWQCIndex');
    }

//region IQC检验计划


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionIQCPlan(Request  $request)
    {
        return view('qc_management.inspectionIQCPlan');
    }
//endregion
//region IPQC检验记录


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionIPQCIndex(Request  $request)
    {
        return view('qc_management.inspectionIPQCIndex');
    }
//endregion
//region OQC检验记录


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionOQCIndex(Request  $request)
    {
        return view('qc_management.inspectionOQCIndex');
    }
//endregion

//查看特采申请列表
    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function deviationApplyList(Request  $request)
    {
        return view('qc_management.deviationApplyList');
    }


//region 特采申请


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function acceptOnDeviationApply(Request  $request)
    {
        return view('qc_management.acceptOnDeviationApply');
    }
//endregion


//region 特采审核


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function acceptOnDeviationAudit(Request  $request)
    {
        return view('qc_management.acceptOnDeviationAudit');
    }
//endregion


//region 异常申请


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function abnormalApply(Request  $request)
    {
        return view('qc_management.abnormalApply');
    }
//endregion

    //region 异常申请


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function abnormalView(Request  $request)
    {
        return view('qc_management.abnormalView');
    }
    /**
     *
     * @return   string   json
     * @author   zhaobc
     */
    public function addSpecialPurchaseApply(Request $request)
    {
        return view('qc_management.addSpecialPurchaseApply');
    }

    /**
     *
     * @return   string   json
     * @author   zhaobc
     */
    public function editSpecialPurchaseApply(Request $request)
    {
        return view('qc_management.editSpecialPurchaseApply');
    }

    /**
     *
     * @return   string   json
     * @author   zhaobc
     */
    public function viewSpecialPurchaseApply(Request $request)
    {
        return view('qc_management.viewSpecialPurchaseApply');
    }

    /**
     * 查看特采回复
     * @return   string   json
     * @author   zhaobc
     */
    public function viewSpecialPurchaseReply(Request $request)
    {
        return view('qc_management.viewSpecialPurchaseReply');
    }

    /**
     * 编辑特采回复
     * @return   string   json
     * @author   zhaobc
     */
    public function editSpecialPurchaseReply(Request $request)
    {
        return view('qc_management.editSpecialPurchaseReply');
    }

    

    //region 添加异常申请
    /**
     *
     * @return   string   json
     * @author   jun.lin
     */
    public function addAbnormalApply(Request  $request)
    {
        return view('qc_management.addAbnormalApply');
    }
//endregion

//region 查看异常申请


    /**
     *
     * @return   string   json
     * @author   jun.lin
     */
    public function viewAbnormalApply(Request  $request)
    {
        return view('qc_management.viewAbnormalApply');
    }
//endregion

//region 编辑异常申请


    /**
     *
     * @return   string   json
     * @author   jun.lin
     */
    public function editAbnormalApply(Request  $request)
    {
        return view('qc_management.editAbnormalApply');
    }
//endregion




//region 异常单回复


    /**
     *
     * @return   string   json
     * @author   jun.lin
     */
    public function abnormalReply(Request  $request)
    {
        return view('qc_management.abnormalReply');
    }
//endregion


//region 查看异常单回复


    /**
     *
     * @return   string   json
     * @author   jun.lin
     */
    public function viewAbnormalReply(Request  $request)
    {
        return view('qc_management.viewAbnormalReply');
    }
//endregion

//region 编辑异常单回复


    /**
     *
     * @return   string   json
     * @author   jun.lin
     */
    public function editAbnormalReply(Request  $request)
    {
        return view('qc_management.editAbnormalReply');
    }
//endregion

    /**
     * 
     * @return string json
     * @author zhaobc
     */
    public function viewQualityResume(Request  $request)
    {
        return view('qc_management.viewQualityResume');
    }

    /**
     * 
     * @return string json
     * @author zhaobc
     */
    public function editQualityResume(Request  $request)
    {
        return view('qc_management.editQualityResume');
    }

    
    /**
     * 
     * @return string json
     * @author zhaobc
     */
    public function qualityResumeList(Request  $request)
    {
        return view('qc_management.qualityResumeList');
    }

     /**
     *
     * @return string json
     * @author jiyu
     */
    public function application(Request  $request)
    {
        return view('qc_management.application');
    }

    /**
     * 
     * @return string json
     * @author zhaobc
     */
    public function personnelMessage(Request  $request)
    {
        return view('qc_management.personnelMessage');
    }
    
}
