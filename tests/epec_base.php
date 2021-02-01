<?php
/**
 * 易派客接口对接基类
 * Created by PhpStorm.
 * User: kevin
 * Date: 2019/1/22
 * Time: 15:55
 */

define("CLIENT_ID", "b8c2a5af365abcfc");
define("CLIENT_SECRET", "c0872d16783ca472bfbd1a88678d3b26");
define("COMPANYID", "b8c2a5af365abcfc");
define("USERNAME", "abc");
define("PASSWORD", "123456");
define("EPEC_PRODUCTION_URL", "https://api.epec.com/");
define("EPEC_TEST_URL", "https://uat-api.epec.com/");
define("EPEC_TOKEN_CONTENT", "apigate/oauth/token");
define("EPEC_MESSAGE_CONTENT", "apigate/v2/message/");
define("EPEC_LOGISTICS_CONTENT", "apigate/v2/logistics/");

class EpecBase {

    protected $redis = null;
    protected $epec_token_url = '';
    protected $redis_key_prefix = '';
    protected $redis_key_name = '';

    /**
     * 初始化
     */
    public function __construct($actConfig) {
        trace('初始化应用组件');
        getenv('EPEC_ENVIRONMENT') == 'production' ? $this->epec_url = EPEC_PRODUCTION_URL : $this->epec_url = EPEC_TEST_URL;
        $this->redis = new Redis();
    }

    /**
     * 析构
     */
    public function __destruct() {
        if ($this->redis)
            $this->redis->close();
    }

    /**
     * 获取token
     */
    public function get_access_token()
    {
        //缓存token
        $redis_key = "EPEC_ACCESS_TOKEN";
        $cacheToken = $this->redis->get($redis_key);
        if($cacheToken === false) {
            $tsStart = time();
            $token_url = $this->epec_url.EPEC_TOKEN_CONTENT."?client_id=".CLIENT_ID."&client_secret=".CLIENT_SECRET."&grant_type=password&companyid=".COMPANYID."&username=".USERNAME."&password=".PASSWORD;
            $token_data = $this->http($token_url);

            if($token_data[0] == 200 && $token_data[1])
            {
                $tokenArr = json_decode($token_data[1], TRUE);
                if($tokenArr && $tokenArr['access_token']) {
                    $tsEnd = time();
                    $this->redis->setex($this->redisCacheKey, $tokenArr['expires_in'] - ($tsEnd - $tsStart) - 5, serialize($tokenArr));
                    return $tokenArr;
                }
            }

            return FALSE;
        }

        return unserialize($cacheToken);
    }

    /**
     * http请求封装
     */
    public function http($url, $method = 'POST', $postfields = null, $headers = array(), $debug = false)
    {
        $ci = curl_init();
        /* Curl settings */
        curl_setopt($ci, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ci, CURLOPT_TIMEOUT, 30);
        curl_setopt($ci, CURLOPT_RETURNTRANSFER, true);

        switch ($method) {
            case 'POST':
                curl_setopt($ci, CURLOPT_POST, true);
                if (!empty($postfields)) {
                    curl_setopt($ci, CURLOPT_POSTFIELDS, $postfields);
                    $this->postdata = $postfields;
                }
                break;
        }
        curl_setopt($ci, CURLOPT_URL, $url);
        curl_setopt($ci, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ci, CURLINFO_HEADER_OUT, true);

        $response = curl_exec($ci);
        $http_code = curl_getinfo($ci, CURLINFO_HTTP_CODE);

        if ($debug) {
            echo "=====post data======\r\n";
            var_dump($postfields);

            echo '=====info=====' . "\r\n";
            print_r(curl_getinfo($ci));

            echo '=====$response=====' . "\r\n";
            print_r($response);
        }
        curl_close($ci);
        return array($http_code, $response);
    }

    /**
     * 跳转
     */
    protected function redirect($url) {
        header("location:" . $url);
        exit;
    }

    /**
     * 判断是否为ajax请求
     * @return bool
     */
    public function getIsAjaxRequest()
    {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH']==='XMLHttpRequest';
    }

    /**
     * 输出JSON串
     * @param $data
     */
    protected function __responseJSON($data) {
        $data['server_time'] = time();
        $data['server_node'] = intval($_SERVER['SERVER_ADDR'] ? preg_replace('/(?:\d+\.){3}(\d+)/', "\\1", $_SERVER['SERVER_ADDR']) : 'unknown');

        header("Content-type: text/html; charset=utf-8");
        echo json_encode($data);
        die();
    }

    /**
     * 设置redis缓存
     * @param boolean $isCached
     */
    protected function setHeaderCached($isCached) {
        if ($isCached)
            header('X-Redis-Cached: CACHED');
        else
            header('X-Redis-Cached: MISS');
    }

    /**
     * 获取 redis 键名
     * @param $name
     * @param array $params
     * @return string
     */
    protected function getRedisKey($name, $params = array()) {
        return $this->redis_key_prefix . $this->redis_key_name . ($params ? (":" . implode(":", $params)) : '');
    }

    /*
     * 对象转数组
     * @param $data Object
     * @return Array
     */
    protected function objectToArray($object = null) {
        if (empty($object)) {
            return false;
        }
        $data = array();
        foreach ($object as $key => $val) {
            $data[$key] = $val;
        }
        return $data;
    }

    /**
     * 过滤请求
     */
    protected function filterRequest() {
        $_GET = $this->hg_input_bb($_GET);
        $_POST = $this->hg_input_bb($_POST);
        $_REQUEST = array_merge($_GET, $_POST);
    }

    private function gjj($str)
    {
        $farr = array(
            "/\\s+/",
            "/<(\\/?)(script|i?frame|style|html|body|title|link|meta|object|\\?|\\%)([^>]*?)>/isU",
            "/(<[^>]*)on[a-zA-Z]+\s*=([^>]*>)/isU",
        );
        $str = preg_replace($farr,"",$str);
        return addslashes($str);
    }

    private function hg_input_bb($array)
    {
        if (is_array($array))
        {
            foreach($array AS $k => $v)
            {
                $array[$k] = $this->hg_input_bb($v);
            }
        }
        else
        {
            $array = addslashes(strip_tags(trim($this->gjj($array))));
        }
        return $array;
    }

}