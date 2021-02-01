<?php
/**
 * 设备管理
 * @author  guangyang.wang
 * @time    2018年04月23日
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;



class DeviceManagementController extends Controller
{
    // 备件类型
    public function BeiJianType()
    {
        return view('device.BeiJianType');
    }

    public function deviceMember()
    {
        return view('device.deviceMember');
    }

    // 仓库定义
    public function warehouseDefine()
    {
        return view('device.warehouseDefine');
    }

    // 备件进出库类型
    public function BeiJianInOutType()
    {
        return view('device.BeiJianInOutType');
    }

    // 班组设置
    public function deviceTeam()
    {
        return view('device.deviceTeam');
    }

    // 设备部门 
    public function deviceDepartment()
    {
        return view('device.deviceDepartment');
    }

    /**
     * 设备类型
     * @return [type] [description]
     */
    public function deviceType()
    {
        return view('device.deviceType');
    }
    /**
     * 故障类型
     * @return [type] [description]
     */
    public function faultType()
    {
        return view('device.faultType');
    }
    /**
     * 故障类型
     * @return [type] [description]
     */
    public function otherOpthion()
    {
        return view('device.otherOpthion');
    }
    /**
     * 保养要求
     * @return [type] [description]
     */
    public function upkeeRequire()
    {
        return view('device.upkeeRequire');
    }
    /**
     * 维保经验
     * @return [type] [description]
     */
    public function upkeeExpreience()
    {
        return view('device.upkeeExpreience');
    }
    /**
     * 添加、编辑、查看维保经验
     * @return [type] [description]
     */
    public function operateUpkeeExpreience()
    {
        return view('device.operateUpkeeExpreience');
    }
    /**
     * 设备台账
     * @return [type] [description]
     */
    public function deviceList()
    {
        return view('device.deviceList');
    }

    public function deviceListQRcode()
    {
        return view('device.deviceListQRcode');
    }

    public function deviceRepairs()
    {
        return view('device.deviceRepairs');
    }

    /**
     * 故障报修
     * @return [type] [description]
     */
    public function repairsList()
    {
        return view('device.repairsList');
    }

  /**
     * 维修工单
     * @return [type] [description]
     */
    public function repairsOrder()
    {
        return view('device.repairsOrder');
    }


  /**
     * 维修计划
     * @return [type] [description]
     */
    public function requirePlan()
    {
        return view('device.requirePlan');
    }


  /**
     * 保养工单
     * @return [type] [description]
     */
    public function maintainOrder()
    {
        return view('device.maintainOrder');
    }


  /**
     * 保养计划
     * @return [type] [description]
     */
    public function maintainPlan()
    {
        return view('device.maintainPlan');
    }
 /**
     * 保养计划
     * @return [type] [description]
     */
    public function repairs()
    {
        return view('device.repairs');
    }






}