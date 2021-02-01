<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use App\Http\Models\DingDing;
use App\Http\Models\DeviceList;
use App\Http\Models\DeviceLibrary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DingDingController extends ApiController
{
    const resHost = '58.221.197.202:30088';

    // 不须继承ApiController的构造
    public function __construct()
    {

    }

    // 获取钉钉的AccessToken
    // Request URL: api/dd/getAccesstoken
    // Method: GET
    public function getAccesstoken(Request $request)
    {
        $input = $request->all();
        if (isset($input['sf']) === true) {
            echo json_encode(DingDing::getAccesstokenSF());
        } else {
            echo json_encode(DingDing::getAccesstoken());
        }
    }

    // 获取钉钉上的部门列表
    // Request URL: api/dd/getDepartments
    // Method: GET
    // Params:
    //  id  int|string  optional    如果指定，则取得该ID下的所有子级部门
    public function getDepartments(Request $request)
    {
        DingDing::getAccesstoken();
        $result = DingDing::department($input['id'] ?? null, $input['fetch_child'] ?? null);
        if ($result) {
            echo '{"status": true, "code": 0, "data": ' . \json_encode($result) . '}';
        } else {
            echo '{"status": false, "code": 1000, "data": []}';
        }
    }

    // 取得部门下的用户列表
    // Request URL: api/dd/getDepartmentListUserinfo
    // Method: GET
    // Params:
    //  deptId  int|string  required    部门ID
    public function getDepartmentListUserinfo(Request $request)
    {
        $input = $request->all();
        if (isset($input['deptId']) == false || !$input['deptId']) {
            return '{"status": false, "code": 1000, "data": []}';
        }
        DingDing::getAccesstoken();
        $result = DingDing::departmentListUserinfo($input['deptId']);
        return '{"status": true, "code": 0, "data": ' . \json_encode($result) . '}';
    }

    // 取得用户资料
    // Request URL: api/dd/getUserDetail
    // Method: GET
    // Params:
    //  userid  int|string  required    用户ID
    public function getUserDetail(Request $request)
    {
        $input = $request->all();
        if (isset($input['userid']) == false || !$input['userid']) {
            return '{"status": false, "code": 1000, "data": []}';
        }
        DingDing::getAccesstoken();
        $result = DingDing::getUserDetail($input['userid']);
        return '{"status": true, "code": 0, "data": ' . \json_encode($result) . '}';
    }

    // 向钉钉客户端发送通知消息
    // Request URL: api/dd/sendNoticeMsg
    // Method: POST
    // Params:
    //  userid      array   required    接受消息的用户ID列表
    //  type        string  optional    消息类型，默认text；支持: text|repair
    //  noticeMsg   string  required    消息内容
    public function sendNoticeMsg(Request $request)
    {
        $input = $request->all();
        if (
            isset($input['userid'], $input['noticeMsg']) == false ||
            !$input['noticeMsg'] ||
            !is_array($input['userid']) ||
            !$input['userid']
        ) {
            return '{"status": false, "code": 1000, "data": []}';
        }
        $input['type'] = isset($input['type']) ? $input['type'] : 'text';
        DingDing::getAccesstoken();
        $result = DingDing::sendNotice($input['userid'], $input['type'], $input['noticeMsg']);
        return '{"status": true, "code": 0, "data": ' . \json_encode($result) . '}';
    }

    // 向钉钉客户端发送报修通知
    // Request URL: api/dd/sendNoticeDeviceOrder
    // Method: POST
    // Params:
    //  type        string  optional    消息类型，1|2 1首次通知 2催单通知
    //  order_no    string  required    报修工单号
    public function sendNoticeDeviceOrder(Request $request)
    {
        $input = $request->all();
        if (isset($input['type'], $input['order_no']) != true) {
            return '{"status": false, "code": 1}';
        }
        // 取得工单
        $device = DeviceLibrary::OrderFindDevice($input['order_no']);
        if (!$device) {
            return '{"status": false, "code": 3, "message": "device not exists"}';
        }
        // 成员列表
        $member = DeviceLibrary::getTeamMembers($device->operation_team);
        $deptid = $device->use_department;
        $typeid = DeviceLibrary::getDeviceTypeTop($device->device_type);
        if (!$member) {
            return '{"status": false, "code": 4, "message": "empty member"}';
        }
        $member = DeviceLibrary::filterDingDingNoticeMember($member, $deptid, $typeid);
        // build Notice Msg
        $order = DB::select('SELECT * FROM `ruis_device_repairs` WHERE `order_no`=? LIMIT 1', [ $input['order_no'] ]);
        $order = $order[0];
        $order->repair_user_info = json_decode($order->repair_user_info);
        $order->repair_type_info = json_decode($order->repair_type_info);
        $title = '【' . $order->device_dept_name . '】报修工单';
        $content = ['**【设备报修通知】**'];
        if ($input['type'] == '2') {
            $content[] = '<font color="#FF0000">该通知为催单通知，催单时间为' . date('Y-m-d H:i:s') . '，请收到消息后立即进行处理。报修人：' . $order->repair_user_info[0] . '，联系电话：' . $order->repair_user_info[1] . '！</font>';
        }
        $content[] = '所在部门：' . $order->device_dept_name;
        $content[] = '设备编号：' . $order->device_code;
        $content[] = '设备名称：' . $order->device_name;
        $content[] = '故障类型：' . $order->repair_type_info->name . ($order->repair_type_info->sub ? '/' . $order->repair_type_info->sub->name : '');
        $content[] = '报修时间：' . $order->time_repair;
        $content[] = '故障描述：' . $order->depict ? $order->depict : '未提供详细描述';
        $btns = [
            [
                'title' => '立即接单',
                'action_url' => 'eapp://page/index?to=DeviceRepairAccept&order_no=' . $input['order_no']
            ],
            [
                'title' => '查看情详',
                'action_url' => 'eapp://page/index?to=DeviceRepairDetail&order_no=' . $input['order_no']
            ]
        ];
        DingDing::getAccesstoken();
        $result = DingDing::sendNotice($member, 'card', implode("\n\n", $content), $title, $btns);
        return '{"status": true, "code": 0, "data": ' . \json_encode($result) . '}';
    }

    // 是否绑定三方帐号（钉钉帐号）
    // Request URL: api/dd/bindOrCheckExistBind
    // Method: GET
    // Params:
    //  userid     int|string  required    钉钉用户的userid
    public function bindOrCheckExistBind(Request $request)
    {
        $input = $request->all();
        if (isset($input['userid']) != true) {
            return '{"status":false,"code":752,"message":"invalid parameter"}';
        }
        // 是
        $team =  DB::select('SELECT `uid`, `team_id` FROM `ruis_device_member` WHERE `dd_userid` = ? LIMIT 1', [ $input['userid'] ]);
        if ($team) {
            $uid = $team[0]->uid;
            $team_id = explode(':', trim($team[0]->team_id, ':'));
            $team =  DB::select('SELECT `duties` FROM `ruis_device_team` WHERE `id` IN(' . implode(',', $team_id) . ')');
            $duties = [];
            foreach ($team as $i => $row) {
                $dutie = explode(',', $row->duties);
                foreach ($dutie as $d) {
                    $duties[$d] = true;
                }
            }
            $duties = implode(',', array_keys($duties));
            return '{"status":true,"code":0,"message":"success","uid":' . $uid . ', "duties":"' . $duties . '"}';
        }
        return '{"status":false,"code":753,"message":"","uid":0}';
    }

    // 获取MES用户信息
    // Request URL: api/dd/getUser
    // Method: GET
    // Params:
    //  jobnumber   string  钉钉/Mes中统一的员工卡号
    public function getUser(Request $request)
    {
        $input = $request->all();
        if (isset($input['jobnumber']) !== true || empty($input['jobnumber']) === true) TEA('700','jobnumber');
        $result =  DB::select('SELECT `id`, `department_id` FROM `ruis_employee` WHERE `card_id`=? LIMIT 1', [
            $input['jobnumber']
        ]);
        if (!$result) TEA('700','no such user');
        return response()->json(get_success_api_response($result[0]));
    }

    // 获取设备详细信息
    // Request URL: api/dd/getDeviceInfo
    // Method: GET
    // Params:
    //    code  string  设备编号
    public function getDeviceInfo(Request $request)
    {
        $input = $request->all();
        if (isset($input['code']) !== true || empty($input['code']) === true) TEA('700','id');
        $info = (new DeviceList)->get($input['code'], 'code');
        $name = '';
        $rslt = [];
        $info->topType = DeviceLibrary::getDeviceTypeTop($info->devtype_id, $name, $rslt);
        $info->topName = $name;
        $info->topList = implode(' / ', \array_reverse(\array_column($rslt, 'name')));
        $info->purchase_time = $info->purchase_time > 0 ? date('Y-m-d H:i:s', $info->purchase_time) : '0000-00-00 00:00:00';
        return response()->json(get_success_api_response($info));
    }

    // 获取设备故障类型
    // Request URL: api/dd/getDeviceFaultType
    // Method: GET
    public function getDeviceFaultType()
    {
        $result = [
            'FaultType' => [],  // 故障类型
            'CauseType' => [],  // 故障原因
        ];
        $result['FaultType'] =  DB::select('SELECT `id`, `code`, `name`, `parent_id`, `remark` FROM `ruis_fault_type` ORDER BY `sort` DESC');
        $result['OptionType'] =  DB::select('SELECT `id`, `code`, `name`, `category_id` AS `cid` FROM `ruis_device_options` ORDER BY `sort` ASC');
        return response()->json(get_success_api_response($result));
    }

    // 获取设备选型
    // Request URL: api/dd/getDeviceOptions
    // Method: GET
    // Params:
    //  cid  int  id
    public function getDeviceOptions(Request $request)
    {
        $input = $request->all();
        // cid = 0 为有效的CID
        if (isset($input['cid']) !== true) {
            return '{"status": false, "code": 1}';
        };
        $result =  DB::select('SELECT `id`, `code`, `name` FROM `ruis_device_options` WHERE `category_id` = ?', [ $input['cid'] ]);
        if ($result) {
            $result = '{"status": true, "code": 0, "data": ' . json_encode($result) . '}';
        } else {
            $result = '{"status": false, "code": 2}';
        }
        return $result;
    }

    // 设定设备状态
    // Request URL: api/dd/setDeviceStatus
    // Method: GET
    // Params:
    //  status_id   int     设备状态ID
    //  code        string  设备编码
    // Remarks:
    //  虽然钉钉上有权限控制，但是该接口没有
    public function setDeviceStatus(Request $request)
    {
        $input = $request->all();
        if (isset($input['code'], $input['status_id']) !== true) {
            return '{"status": false, "code": 1}';
        };
        $result = DB::update('UPDATE `ruis_device_list` SET `use_status` = ? WHERE `code`= ?', [ $input['status_id'], $input['code'] ]);
        if ($result) {
            $result = '{"status": true, "code": 0, "message": "success"}';
        } else {
            $result = '{"status": false, "code": 2, "message": "failure"}';
        }
        return $result;
    }

    // 上传报修图片
    // Request URL: api/dd/uploadDeviceRepairFile
    // Method: POST
    // Params:
    //  DingDingUpFile  string  文件字段名称
    public function uploadDeviceRepairFile(Request $request)
    {
        $img = $request->all()['DingDingUpFile'];
        if (!$img->isValid()) TEA('893','upload invalid');
        $img_ext = $img->getClientOriginalExtension();
        if (in_array($img_ext, ['jpeg', 'jpg', 'png', 'tmp']) !== true) TEA('892','upload not a image "' . $img_ext . '"');
        $save_file_name = Storage::disk('deviceRepairImage')->put(date('Ym'), $img);
        if (!$save_file_name) {
            TEA('891','upload fail');
        }
        $data = [
            'url' => Storage::disk('deviceRepairImage')->url($save_file_name)
        ];
        return response()->json(get_success_api_response($data));
    }

    // 检测设备是否处于报修状态
    // 如果提交前不检测，会导致图片上传沉余
    // Request URL: api/dd/checkExistWaitRepair
    // Method: POST
    // Params:
    //  device      array   required    接受消息的用户ID列表
    //  device[id]  int     required    设备ID
    public function checkExistWaitRepair(Request $request)
    {
        $input = $request->all();
        $order_no = '';
        $check = DeviceLibrary::isRepair($input['device']['id'], $order_no);
        if ($check) {
            $result = '{"status":false,"code":851,"message":"the equipment is under repair.","order":"' . $order_no . '"}';
        } else {
            $result = '{"status":true,"code":0}';
        }
        return $result;
    }

    // 创建报修工单
    // Request URL: api/dd/submitRepairData
    // Method: POST
    // Params:
    //   {
    //     // array 报修人帐户信息
    //     user: {
    //         name: "张三",                                //  string  报修人姓名
    //         mobile: "13888888888",                       //  string  报修人手机号码
    //         uid: {
    //             dingding: "xxxxx",                       //  string  报修人的钉钉userid
    //             mes: 100                                 //  int     报修人在Mes系统中的帐户ID
    //         }
    //     },
    //     // 报修设备信息
    //     device: {
    //         id: 1,                                       //  int     设备ID
    //         code: "xxx",                                 //  string  设备编码
    //         name: "xxx",                                 //  string  设备名称
    //         // 设备所在部门
    //         department: {
    //             id: 1,                                   //  int     部门ID
    //             name: "xxxx"                             //  string  部门名称
    //         }
    //     },
    //     // 报修信息
    //     repair: {
    //          // 故障类型
    //          type: {
    //              id: 1,                                  // int      故障类型ID
    //              code: "xx",                             // string   故障类型编码
    //              name: "xx",                             // string   故障类型名称
    //              // 故障类型 细类（如果有细类，则必填）
    //              sub: {
    //                  id: 2,                              // int      故障类型ID
    //                  code: "xx",                         // string   故障类型编码
    //                  name: "xx"                          // string   故障类型名称
    //              }
    //          },
    //         imgs: [],                                    // array    故障图片
    //         describe: "xxxxxxx"                          // string   故障描述
    //     }
    // }
    public function submitRepairData(Request $request)
    {
        $input = $request->all();
        $check = DB::table('ruis_device_repairs')->select('order_no')->where([ 'device_id' => $input['device']['id'], 'is_finish' => 'N' ])->lockForUpdate()->first();
        if ($check) {
            echo '{"status":false,"code":851,"message":"the equipment is under repair.","order":"' . $check->order_no . '"}';
            return;
        }
        $data = [
            'order_no' => 'DR' . date('Ymd') . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT),
            'repair_user_mid' => $input['user']['uid']['mes'],
            'repair_user_did' => $input['user']['uid']['dingding'],
            'repair_user_info' => json_encode([ $input['user']['name'], $input['user']['mobile'] ]),
            'repair_type_pid' => $input['repair']['type']['id'],
            'device_id' => $input['device']['id'],
            'device_code' => $input['device']['code'],
            'device_name' => $input['device']['name'],
            'device_dept_id' => $input['device']['department']['id'],
            'device_dept_name' => $input['device']['department']['name'],
            'time_repair' => date('Y-m-d H:i:s'),
            'depict' => $input['repair']['describe']
        ];
        // types
        if ($input['repair']['type']['sub']) {
            $data['repair_type_sid'] = $input['repair']['type']['sub']['id'];
            unset($input['repair']['type']['sub']['parent_id']);
            unset($input['repair']['type']['sub']['remark']);
        }
        $data['repair_type_info'] = json_encode($input['repair']['type']);
        // cause
        $data['repair_cause'] = json_encode([
            'id' => $input['repair']['cause']['id'],
            'cid' => $input['repair']['cause']['cid'],
            'name' => $input['repair']['cause']['name']
        ]);
        // imgs
        if ($input['repair']['imgs']) {
            foreach ($input['repair']['imgs'] as $i => &$img) {
                $img = str_replace('#success', '', $img);
            }
            $data['repair_imgs'] = json_encode($input['repair']['imgs']);
        }
        // insert
        $result = DB::table('ruis_device_repairs')->insert($data);
        if ($result) {
            echo '{"status":true,"code":0,"message":"success","order":"' . $data['order_no'] . '"}';
        } else {
            echo '{"status":false,"code":852,"message":"insert db error"}';
        }
        return;
    }

    // 根据工单返回接收通知的成员列表
    // Request URL: api/dd/getNoticeUsers
    // Method: GET
    // Params:
    //  order_no      string   required    工单号
    public function getNoticeUsers(Request $request)
    {
        $input = $request->all();
        if (isset($input['order_no']) != true) {
            return '{"status": true, "data": []}';
        }
        // 取得工单
        $device = DeviceLibrary::OrderFindDevice($input['order_no']);
        if (!$device) {
            return '{"status": true, "data": []}';
        }
        // 成员列表
        $member = DeviceLibrary::getTeamMembers($device->operation_team);
        $deptid = $device->use_department;
        $typeid = DeviceLibrary::getDeviceTypeTop($device->device_type);
        if (!$member) {
            return '{"status": true, "data": []}';
        }
        $member = DeviceLibrary::filterDingDingNoticeMember($member, $deptid, $typeid);
        return '{"status": true, "code": 0, "data": ' . json_encode($member) . '}';
    }

    // 撤消待接单中的报修工单
    // Request URL: api/dd/cancelOrder
    // Method: GET
    // Params:
    //  uid           int      required    用户编号
    //  order_no      string   required    工单号
    public function cancelOrder(Request $request)
    {
        $input = $request->all();
        if (isset($input['order_no'], $input['uid']) != true) {
            return '{"status": false, "code": 820, "message": "param invalid"}';
        }
        $result =  DB::select(
            'SELECT `id`, `status` FROM `ruis_device_repairs`
            WHERE `order_no`=? AND `repair_user_did`=? LIMIT 1', [ $input['order_no'], $input['uid'] ]);
        if (!$result) {
            return '{"status": false, "code": 821, "message": "order does not exist"}';
        }
        $result = $result[0];
        if ($result->status !== 'wait') {
            return '{"status": false, "code": 822, "message": "The order has been completed or is being processed"}';
        }
        $result = DB::update('UPDATE `ruis_device_repairs` SET `time_finish`=NOW(), `is_finish`="Y", `status`="cancel"  WHERE `id`=' . $result->id);
        if ($result) {
            return '{"status": true, "code": 0, "message": "success"}';
        }
        return '{"status": false, "code": 823, "message": "failure"}';
    }

    // 完成维修
    // Request URL: api/dd/completedOrder
    // Method: GET
    // Params:
    //  uid           int      required    用户编号
    //  order_no      string   required    工单号
    public function completedOrder(Request $request)
    {
        $input = $request->all();
        if (isset($input['order_no'], $input['uid']) != true) {
            return '{"status": false, "code": 820, "message": "param invalid"}';
        }
        $result =  DB::select(
            'SELECT `id`, `status` FROM `ruis_device_repairs`
            WHERE `order_no`=? AND `repair_user_did`=? LIMIT 1', [ $input['order_no'], $input['uid'] ]);
        if (!$result) {
            return '{"status": false, "code": 821, "message": "order does not exist"}';
        }
        $result = $result[0];
        if ($result->status !== 'finish') {
            return '{"status": false, "code": 822, "message": "The order has been completed or is being processed"}';
        }
        $result = DB::update('UPDATE `ruis_device_repairs` SET `time_finish`=NOW(), `is_finish`="Y", `status`="completed"  WHERE `id`=' . $result->id);
        if ($result) {
            return '{"status": true, "code": 0, "message": "success"}';
        }
        return '{"status": false, "code": 823, "message": "failure"}';
    }

    // 接报修工单
    // Request URL: api/dd/acceptOrder
    // Method: GET
    // Params:
    //  order_no      string   required    工单号
    public function acceptOrder(Request $request)
    {
        $input = $request->all();
        if (isset($input['order_no']) != true) {
            return '{"status": false, "code": 820, "message": "param invalid"}';
        }
        $result =  DB::select('SELECT `id`, `status` FROM `ruis_device_repairs` WHERE `order_no`=? LIMIT 1', [ $input['order_no'] ]);
        if (!$result) {
            return '{"status": false, "code": 821, "message": "order does not exist"}';
        }
        $result = $result[0];
        if ($result->status !== 'wait') {
            return '{"status": false, "code": 822, "message": "The order has been completed or is being processed"}';
        }
        $accept_user_info = json_encode($input['accept_user_info']);
        $result = DB::update(
            'UPDATE `ruis_device_repairs`
            SET
                `accept_user_info` = ?,
                `accept_user_mid` = ?,
                `accept_user_did` = ?,
                `time_accept` = NOW(),
                `status` = "under-repair"
            WHERE `id`=' . $result->id, [
                json_encode($input['accept_user_info']),
                $input['accept_user_mid'],
                $input['accept_user_did']
            ]);
        if ($result) {
            return '{"status": true, "code": 0, "message": "success"}';
        }
        return '{"status": false, "code": 823, "message": "failure"}';
    }

    // 维修完成 经验录入
    // Request URL: api/dd/devicePublishProgramme
    // Method: POST
    // Params:
    //  order_no      string    required    工单号
    //  programme     string    required    经验内容
    public function devicePublishProgramme(Request $request)
    {
        $input = $request->all();
        // if (isset($input['order_no'], $input['programme']) != true) {
        //     return '{"status": false, "code": 820, "message": "param invalid"}';
        // }
        if (isset($input['order_no'], $input['programme'], $input['method']) != true) {
            return '{"status": false, "code": 820, "message": "param invalid"}';
        }
        $result =  DB::select('SELECT `id`, `status`,`programme` FROM `ruis_device_repairs` WHERE `order_no`=? LIMIT 1', [ $input['order_no'] ]);
        if (!$result) {
            return '{"status": false, "code": 821, "message": "order does not exist"}';
        }
        $result = $result[0];
        if ($result->status !== 'under-repair') {
            return '{"status": false, "code": 822, "message": "The order has been under-repair or is being processed"}';
        }
        // $result = DB::update('UPDATE `ruis_device_repairs` SET `programme` = ? WHERE `id`=' . $result->id, [ $input['programme'] ]);
        $result = DB::update('UPDATE `ruis_device_repairs` SET `programme` = ?,`status`="finish",`method`=? WHERE `id`=' . $result->id, [ $input['programme'],$input['method'] ]);
        if ($result) {
            return '{"status": true, "code": 0, "message": "success"}';
        }
        return '{"status": false, "code": 823, "message": "failure"}';
    }

    // 取得工单明细
    // Request URL: api/dd/detail
    // Method: POST
    // Params:
    //  order_no      string    required    工单号
    public function detail(Request $request)
    {
        $input = $request->all();
        if (!$input['order_no']) TEA('811','param order_no empty');
        $result =  DB::select('SELECT * FROM `ruis_device_repairs` WHERE `order_no`=? ORDER BY `time_repair` DESC LIMIT 1', [ $input['order_no'] ]);
        if (!$result) {
            return '{"status": false, "code": 812, "message": "order does not exist"}';
        }
        $result = $result[0];
        $result->repair_imgs = str_replace('mlily.vaiwan.com', static::resHost, $result->repair_imgs);
        return '{"status": true, "code": 0, "data": ' . json_encode($result) . '}';
    }

    // 获取订单列表
    // Request URL: api/dd/getRepairOrders_history?act=history|exp|wait
    // Method: GET
    // Params:
    //  act      string    history|exp|wait
    public function getRepairOrders(Request $request)
    {
        $input = $request->all();
        return $this->{'getRepairOrders_' . $input['act']}($input);
    }

    // 获取历史报修工单
    private function getRepairOrders_history(array $input)
    {
        if (!$input['uid']) TEA('841','param uid empty');
        $result =  DB::select(
            'SELECT
                `order_no`,
                `repair_type_info`,
                `repair_user_info`,
                `repair_imgs`,
                `device_code`,
                `device_name`,
                `device_dept_name`,
                `accept_user_info`,
                `time_repair`,
                `is_finish`,
                `status`,
                `depict`
            FROM `ruis_device_repairs`
            WHERE `repair_user_did`=? ORDER BY `time_repair` DESC LIMIT 15', [ $input['uid'] ]);
        return '{"status":true,"code":0,"data":' . json_encode($result) . '}';
    }

    // 获取经验工单
    private function getRepairOrders_exp(array $input)
    {
        $result =  DB::select(
            'SELECT
                `order_no`,
                `repair_type_info`,
                `repair_user_info`,
                `repair_imgs`,
                `device_code`,
                `device_name`,
                `device_dept_name`,
                `accept_user_info`,
                `time_repair`,
                `is_finish`,
                `status`,
                `depict`
            FROM `ruis_device_repairs`
            WHERE `status`="completed" AND `device_code` = ? ORDER BY `time_finish` DESC LIMIT 30', [ $input['device_code'] ]);
        return '{"status":true,"code":0,"data":' . json_encode($result) . '}';
    }

    // 获取待接的报修工单
    private function getRepairOrders_wait(array $input)
    {
        if (!$input['uid']) TEA('841','param uid empty');
        $result =  DB::select(
            'SELECT
                `order_no`,
                `repair_type_info`,
                `repair_user_info`,
                `repair_imgs`,
                `device_code`,
                `device_name`,
                `device_dept_name`,
                `accept_user_info`,
                `time_repair`,
                `is_finish`,
                `status`,
                `depict`
            FROM `ruis_device_repairs` WHERE `status`="wait" ORDER BY `time_repair` ASC LIMIT 30');
        $rspush =  DB::select(
            'SELECT
                `order_no`,
                `repair_type_info`,
                `repair_user_info`,
                `repair_imgs`,
                `device_code`,
                `device_name`,
                `device_dept_name`,
                `accept_user_info`,
                `time_repair`,
                `is_finish`,
                `status`,
                `depict`
            FROM `ruis_device_repairs` WHERE `accept_user_did`=? ORDER BY `time_repair` DESC LIMIT 15', [ $input['uid'] ]);
        foreach ($rspush as $i => $row) {
            array_push($result, $row);
        }
        return '{"status":true,"code":0,"data":' . json_encode($result) . '}';
    }

}