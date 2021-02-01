<?php


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 物料清单管理视图控制器
 * @author  rick
 * @time    2018年01月10日14:41:31
 */
class BomManagementController extends Controller
{



    //region  物料清单
    /**
     * 物料清单列表
     * @return   string   json
     * @author   rick
     */
    public function bomIndex(Request  $request)
    {
        return view('bom_management.bom_index');
    }

    // 查看工单文件
    // 同【物料清单列表】,仅仅为了查看工单文件
    // @author  guanghui.chen
    public function lookTechnicsFile(Request  $request)
    {
        return $this->bomIndex($request);
    }

    /**
     * 物料清单添加
     * @return   string   json
     * @author   rick
     */
    public function bomCreate(Request  $request)
    {
        return view('bom_management.bom_form');
    }

    /**
     * 物料清单编辑
     * @return   string   json
     * @author   rick
     */
    public function bomEdit(Request  $request)
    {
        return view('bom_management.bom_form');
    }

    /**
     * 物料清单查看
     * @return   string   json
     * @author   rick
     */
    public function bomView(Request  $request)
    {
        return view('bom_management.bom_view');
    }
    //endregion

    /**
     * 物料清单编辑
     * @return   string   json
     * @author   rick
     */
    public function bomFormView(Request  $request)
    {
        return view('bom_management.bom_form_view');
    }

    //region  物料清单分组
    /**
     * 物料清单分组列表
     * @return   string   json
     * @author   rick
     */
    public function groupIndex(Request  $request)
    {
        return view('bom_management.group_index');
    }

    /**
     * 物料清单分组添加
     * @return   string   json
     * @author   rick
     */
    public function groupCreate(Request  $request)
    {
        return view('bom_management.group_form');
    }

    /**
     * 物料清单分组编辑
     * @return   string   json
     * @author   rick
     */
    public function groupEdit(Request  $request)
    {
        return view('bom_management.group_form');
    }
    //endregion

    //region 制造BOM
    /**
     * 制造Bom查看
     * @return   string   json
     * @author   rick
     */
    public function manufactureBomView(Request  $request)
    {
        return view('bom_management.manufacture_bom_view');
    }
    //endregion

    public function bomgyView(Request  $request) 
    {
      return view('bom_management.bom_gyview');
    }
    

    public function bomSoView(Request  $request) 
    {
      return view('bom_management.bomSoView');
    }

    public function bomReplaceView(Request  $request)
    {
      return view('bom_management.bom_replace');
    }
}


