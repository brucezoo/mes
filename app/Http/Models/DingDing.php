<?php 

namespace App\Http\Models;
use Illuminate\Support\Facades\DB;
use DingTalkClient;
use DingTalkConstant;

include base_path('dingtalk-sdk') . DIRECTORY_SEPARATOR . 'TopSdk.php';

class DingDing extends Base
{
    const appKey = 'dinga11e2e568b110e0035c2f4657eb6378f';
    const appSecret = 'HktWb1JblY93Z4URHKP3WioCfgw0aCYnbTGmdC6dIPuf9ZH6Tvy6caH8-xvKipHm';
    const agentId = 215508692;

    static $accessToken = '';

    static public function getAccesstoken()
    {
        $cli = new DingTalkClient(DingTalkConstant::$CALL_TYPE_OAPI, DingTalkConstant::$METHOD_GET, DingTalkConstant::$FORMAT_JSON);
        $req = new \OapiGettokenRequest;
        $req->setAppkey(static::appKey);
        $req->setAppsecret(static::appSecret);
        $result = $cli->execute($req, '', 'https://oapi.dingtalk.com/gettoken');
        $result->datetime = date('Y-m-d H:i:s');
        static::$accessToken = $result->access_token;
        return $result;
    }

    // 三方获得Access
    static public function getAccesstokenSF()
    {
        $cli = new DingTalkClient(DingTalkConstant::$CALL_TYPE_OAPI, DingTalkConstant::$METHOD_POST, DingTalkConstant::$FORMAT_JSON);
        $req = new \OapiServiceGetCorpTokenRequest;
        $req->setAuthCorpid('dingc7b4cb77c167a47a35c2f4657eb6378f');
        $accessKey = 'suiteujiooogbj1j8pbxk';
        $accessSecret = 'EEdHH3cWwmsplo6kdcm5FNWNWfxGpm4yUMrn_xXHnAgHaj2i_jzVtVXCd2nFkLyh';
        $result = $cli->executeWithSuiteTicket($req, 'https://oapi.dingtalk.com/service/get_corp_token', $accessKey, $accessSecret, 'test');
        $result->datetime = date('Y-m-d H:i:s');
        return $result;
    }

    // 取部门列表
    // $id  int|null    指定取得某个部门下的所有子级部门列表 默认NULL，取所有
    static public function department($id = null, $fetch_child = null, $lang = 'zh_CN')
    {
        $cli = new DingTalkClient(DingTalkConstant::$CALL_TYPE_OAPI, DingTalkConstant::$METHOD_GET, DingTalkConstant::$FORMAT_JSON);
        $req = new \OapiDepartmentListRequest;
        $id && $req->setId($id);
        $fetch_child && $req->setFetchChild($fetch_child);
        $req->setLang($lang);
        return $cli->execute($req, static::$accessToken, 'https://oapi.dingtalk.com/department/list');
    }

    // 取得部门用简列表（userid & name）
    // $deptId  int 部门ID
    static public function departmentListUserinfo($deptId)
    {
        $cli = new DingTalkClient(DingTalkConstant::$CALL_TYPE_OAPI, DingTalkConstant::$METHOD_GET, DingTalkConstant::$FORMAT_JSON);
        $req = new \OapiUserSimplelistRequest;
        $req->setDepartmentId($deptId);
        $req->setLang('zh_CN');
        $req->setOffset('0');
        $req->setSize('100');
        return $cli->execute($req, static::$accessToken, 'https://oapi.dingtalk.com/user/simplelist');
    }

    // 用户情细资料
    // $userid  string  用户USERID
    static public function getUserDetail($userid)
    {
        $cli = new DingTalkClient(DingTalkConstant::$CALL_TYPE_OAPI, DingTalkConstant::$METHOD_GET, DingTalkConstant::$FORMAT_JSON);
        $req = new \OapiUserGetRequest;
        $req->setUserid($userid);
        return $cli->execute($req, static::$accessToken, 'https://oapi.dingtalk.com/user/get');
    }

    static public function sendNotice(array $userid, $type, $message, $title = '', $btns = [])
    {
        $cli = new DingTalkClient(DingTalkConstant::$CALL_TYPE_OAPI, DingTalkConstant::$METHOD_POST, DingTalkConstant::$FORMAT_JSON);
        $req = new \OapiMessageCorpconversationAsyncsendV2Request;
        $req->setAgentId(static::agentId);
        $req->setUseridList(implode(',', $userid));
        switch($type) {
            case 'text':
                $message = [ 'msgtype' => 'text', 'text' => ['content' => $message] ];
                break;
            case 'card':
                $message = [
                    'msgtype' => 'action_card',
                    'action_card' => ['title'=>$title, 'markdown'=>$message, 'btn_orientation'=>'1', 'btn_json_list'=>$btns]
                ];
                break;
        }
        $req->setMsg(json_encode($message));
        return $cli->execute($req, static::$accessToken, 'https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2');
    }
}

