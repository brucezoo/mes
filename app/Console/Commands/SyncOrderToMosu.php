<?php
/**
 * Created by PhpStorm.
 * User:  kevin
 * Time:  2019年4月26日09:21:07
 */
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

//set_time_limit(0);

class SyncOrderToMosu extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan sync:ordertomosu
     * @var string
     */
    protected $signature = 'sync:ordertomosu';
    protected $rwo;
    /**
     * 控制台命令说明。
     * php artisan sync:ordertomosu命令后的输出内容
     * @var string
     *
     */
    protected $description = '将工单和领料单同步给模塑';

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
        $this->rwo = config('alias.rwo');//ruis_work_order;

    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        ###########工单处理###########放到细排，细排后直接同步
//        //拉出工单数据
//        $work_order_list = $this->getWorkOrderList();
//        //传输工单数据
//        $post_data = array(
//            "head" => 'MES_HKSC0001',
//            "data" => json_encode($work_order_list)
//        );
//        //接口url
        $domain = env('MOSU_HOST', 'http://192.168.10.204:30014');
        $url = $domain.'/Import.asmx/Do';
//        //发起请求
//        $response1 = $this->http($url,'POST',$post_data);
//        $this->makeRecord($post_data['head'],0,'',$url,$response1);
        ###########工单处理###########

        ###########领料单处理###########
        $requisition_order_list = $this->getRequisitionOrderList();
        //传输工单数据
        $post_data = array(
            "head" => 'MES_HKSC0003',
            "data" => json_encode($requisition_order_list)
        );

        //发起请求
        $response2 = $this->http($url,'POST',$post_data);
        //$this->makeRecord($post_data['head'],0,'',$url,$response2);
        ###########领料单处理###########


        //p("complete!");
    }

    /**
     * 模塑工单信息
     * @return int
     */
    public function getWorkOrderList()
    {
        $time = time();
        $thirty_ago = $time - 6*60;
        $where[]=['rwo.status','=',2];
        $where[]=['rwo.created_at','<=',$time];
        $where[]=['rwo.created_at','>=',$thirty_ago];
        $where[]=['rwc.code','=','M2MS001'];
        $work_order_info = DB::table(config('alias.rwo').' as rwo')
            ->select(
                'rwo.id',
                'rwo.operation_order_id',
                'rwo.number as WONO',
                'rwc.code as rwc_code',
                'rwb.code as rwb_code',
                'rm.item_no as MATR',
                'rm.name as LDESC',
                'rm.description as SDESC',
                'rwo.qty as WQTY',
                'rwo.created_at',
                'rwo.status',
                'rpo.sales_order_code as KDAUF',
                'rpo.number as AUFNR',
                'rwo.work_shop_id as FEVOR',
                'rpo.qty as GAMNG',
                'rpo.start_date'
            )
            ->leftjoin(config('alias.rwc').' as rwc','rwc.id','rwo.work_center_id')
            ->leftjoin(config('alias.rwb').' as rwb','rwb.id','rwo.work_shift_id')
            ->leftJoin(config('alias.rpo').' as rpo','rpo.id','=','rwo.production_order_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','=','rpo.product_id')
            ->where($where)
            ->get();
        $result = [];
        foreach ($work_order_info as &$item) {

            $WSNO = $item->rwc_code .'_'.$item->rwb_code;
            if($item->status != 0){
                $STATE = 1;
            }
            $CTIME = date('Y-m-d H:m:i',$item->created_at);
            $GSTRP = date('Y-m-d H:m:i',$item->start_date);

            $tmp = [
                'WONO' => $item->WONO,
                'WSNO' => $WSNO,
                'CTIME' => $CTIME,
                'MATR' => $item->MATR,
                'LDESC' => $item->LDESC,
                'SDESC' => $item->SDESC,
                'WQTY' => $item->WQTY,
                'STATE' => $STATE,
                'KDAUF' => $item->KDAUF,
                'AUFNR' => $item->AUFNR,
                'FEVOR' => $item->FEVOR,
                'GAMNG' => $item->GAMNG,
                'GSTRP' => $GSTRP,
            ];
            $result[] = $tmp;

            $where2[] = ['rwo.id','=',$item->id];
            $where2[] = ['rwo2.id','<>',$item->id];
            $where2[]=['rwc.code','=','M2MS001'];
            $work_order_info2 = DB::table(config('alias.rwo').' as rwo')
                ->select(
                    'rwo.operation_order_id',
                    'rwo2.id',
                    'rwo2.number as WONO',
                    'rwc.code as rwc_code',
                    'rwb.code as rwb_code',
                    'rm.item_no as MATR',
                    'rm.name as LDESC',
                    'rm.description as SDESC',
                    'rwo2.qty as WQTY',
                    'rwo2.created_at',
                    'rwo2.status',
                    'rpo.sales_order_code as KDAUF',
                    'rpo.number as AUFNR',
                    'rwo2.work_shop_id as FEVOR',
                    'rpo.qty as GAMNG',
                    'rpo.start_date'
                )
                ->leftjoin(config('alias.roo').' as roo','roo.id','rwo.operation_order_id')
                ->leftjoin(config('alias.rwo').' as rwo2','rwo2.operation_order_id','roo.id')
                ->leftjoin(config('alias.rwc').' as rwc','rwc.id','rwo2.work_center_id')
                ->leftjoin(config('alias.rwb').' as rwb','rwb.id','rwo2.work_shift_id')
                ->leftJoin(config('alias.rpo').' as rpo','rpo.id','=','rwo2.production_order_id')
                ->leftJoin(config('alias.rm').' as rm','rm.id','=','rpo.product_id')
                ->where($where2)
                ->get();

            foreach ($work_order_info2 as $i) {
                $i_WSNO = $i->rwc_code .'_'.$i->rwb_code;
                if($i->status != 0){
                    $i_STATE = 1;
                }
                $i_CTIME = date('Y-m-d H:m:i',$i->created_at);
                $i_GSTRP = date('Y-m-d H:m:i',$i->start_date);

                $tmp = [
                    'WONO' => $i->WONO,
                    'WSNO' => $i_WSNO,
                    'CTIME' => $i_CTIME,
                    'MATR' => $i->MATR,
                    'LDESC' => $i->LDESC,
                    'SDESC' => $i->SDESC,
                    'WQTY' => $i->WQTY,
                    'STATE' => $i_STATE,
                    'KDAUF' => $i->KDAUF,
                    'AUFNR' => $i->AUFNR,
                    'FEVOR' => $i->FEVOR,
                    'GAMNG' => $i->GAMNG,
                    'GSTRP' => $i_GSTRP,
                ];
                $result[] = $tmp;
            }
        }
        return $result;
    }

    /**
     * 模塑领料单信息
     * @return int
     */
    public function getRequisitionOrderList()
    {
        $time = time();
        $thirty_ago = $time - 6*60;
        $where[]=['rmr.ctime','<=',$time];
        $where[]=['rmr.ctime','>=',$thirty_ago];
        //$where[]=['rmr.push_type','<>','1'];
        $where[]=['rmr.send_depot','=','2207'];
        $where[]=['rmc.code','<>','35'];
        $requisition_order_info = DB::table(config('alias.rmr').' as rmr')
            ->select(
                'rmr.code as DOCNO',
                'rmri.line_project_code as ITMNO',
                'rmri.material_code as MATNR',
                'rmri.demand_qty as BDMNG',
                'rmr.send_depot as LGORT',
                'rmr.sale_order_code as KDAUF',
                'rmrib.batch as CHARG'
            )
            ->leftjoin(config('alias.rmri').' as rmri','rmri.material_requisition_id','rmr.id')
            ->leftjoin(config('alias.rmrib').' as rmrib','rmrib.item_id','rmri.id')
            ->leftjoin(config('alias.rsd').' as rsd','rsd.id','rmri.depot_id')
            ->leftjoin(config('alias.rm').' as rm','rm.item_no','rmri.material_code')
            ->leftjoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
            ->where($where)
            ->get();

        return $requisition_order_info;
    }

    /**
     * 添加接口日志
     * 跟sap的日志一个表
     * @param string $serviceID 接口服务ID
     * @param string $SrvgUID 随机码(32位)
     * @param array $requestData 请求的数据
     * @param array $response 接口返回的数据(数组格式)
     * @return mixed
     */
    private static function makeRecord($serviceID, $SrvgUID, $requestData, $url,$response = [])
    {
        $keyVal = [
            'serviceID' => $serviceID,
            'srvGUID' => $SrvgUID,
            'srvTimestamp' => date('YmdHis'),
            'sourceSysID' => 0,
            'targetSysID' => 0,
            'ctime' => time(),
            'returnCode' => empty($response['Success']) ? 0 : $response['Success'],
            'data_json' => json_encode($requestData),
            'request_uri' => $url,
            'return_json' => json_encode($response)
        ];
        return DB::table(config('alias.sar'))->insertGetId($keyVal);
    }

    /**
     * http请求封装
     */
    public function http($url, $method = 'GET', $postfields = null, $headers = array(), $debug = false)
    {
        $ci = curl_init();
        /* Curl settings */
        curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ci, CURLOPT_TIMEOUT, 30);
        curl_setopt($ci, CURLOPT_RETURNTRANSFER, true);

        switch ($method) {
            case 'POST':
                curl_setopt($ci, CURLOPT_POST, true);
                if (!empty($postfields)) {
                    $tmpdatastr = is_array($postfields) ? http_build_query($postfields) : $postfields;
                    curl_setopt($ci, CURLOPT_POSTFIELDS, $tmpdatastr);
                }
                break;
        }
        $ssl = preg_match('/^https:\/\//i',$url) ? TRUE : FALSE;
        curl_setopt($ci, CURLOPT_URL, $url);
        if($ssl){
            curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, FALSE); // https请求 不验证证书和hosts
            curl_setopt($ci, CURLOPT_SSL_VERIFYHOST, FALSE); // 不从证书中检查SSL加密算法是否存在
        }

        curl_setopt($ci, CURLOPT_URL, $url);
        curl_setopt($ci, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ci, CURLINFO_HEADER_OUT, true);

        $response = curl_exec($ci);

        curl_close($ci);

        return $response;
    }

}


