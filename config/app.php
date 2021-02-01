<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/13
 * Time: 上午10:19
 */



/**
 * 应用配置
 * @author sam.shan  <sam.shan@ruis-ims.cn>
 */



return [



    //发布的版本号,上线之后取正式的版本号,方便客户端缓存
    'release'=>time(),
    //属性类型模板类型标志位  1：人事模块 2：公司模块 3：物料模块 4:工艺参数 5：工时 6：做法库
    'category' => [
        'human'=>1,
        'company'=>2,
        'material'=>3,
        'operation'=>4
    ],
    //属性数据类型 //1:数字 2：选择  3:文字 4:日期date  5:时间 time 6:文件file 7:日期时间datetime  8:区间interval
    'data_type'=>[
        'number'=>1,//数字类型的时候,如果给到了最大最小以及默认值的时候要检测
        'select'=>2,//选择类型的时候必须有添加项
        'text'=>3,
        'date'=>4,
        'time'=>5,
        'file'=>6,
        'datetime'=>7,
        'interval'=>8,
    ],
    //模块对应取得的数据类型
    'module_data_type'=>[
        'material'=>[
            'number',
            'select',
            'string',
        ],
        'operation'=>[
            'number',
            'select',
            'string',
        ],
    ],
    //erp数据导入棉泡
    'erp_mp'=>[
        'BPM'=>'BPMC',//模塑
        'BPQ'=>'BPMP',//棉
        'FLT'=>'BPMP'//海绵
    ],

    //创建，修改时间的显示格式
    'timeFormat' => 'Y/m/d H:i',
    //上传的一些位置
    'drawing_attachment'=>'storage/mlily/demo/drawing/attachment/',
    'drawing_group_attachment'=>'storage/mlily/demo/drawing_group/attachment/',
    'drawing_image'=>'storage/mlily/demo/drawing/image/',
    'drawing_group_image'=>'storage/mlily/demo/drawing_group/image/',
    'drawing_library'=>'drawing/',
    'picture_library'=>'picture/',
    'bpo_report_form'=>'bpo/report_form/',
    // 样册号上传地址
    'currentversion'=>'drawing/',

    //手动填写的编码规则如下
    'pattern'=>[
        'attribute'=>'/^[0-9a-z_A-Z]{2,49}+$/',//物料属性键值,由3-50位字母下划线数字组成,字母开头
        'template'=>'/^[0-9a-z_A-Z]{0,49}+$/',//物料模板编码,由1-50位字母下划线数字组成,字母开头
        'item_no'=>'/^[0-9a-z_\-A-Z]{1,50}+$/',//物料编码,由1-50位字母下划线数字组成
        'bom_group_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{2,49}+$/',//bom组名称,由3-50位字母下划线数字组成,字母开头
        'image_attribute_name'=>'/^[\x{4e00}-\x{9fa5}_a-zA-Z]{1,30}$/u',//图纸库图纸属性名称,由1-30位字母中文或下划线组合
//        'image_category_name'=>'/^[\x{4e00}-\x{9fa5}_a-zA-Z]{1,30}$/u',//图纸库图纸模块名称,由1-30位字母中文或下划线组合
        'image_category_owner'=>'/[a-zA-Z_]{1,20}/',//图纸库图纸模块文件夹名称,由1-20位字母下划线组合
//        'image_group_name'=>'/^[\x{4e00}-\x{9fa5}_a-zA-Z]{1,30}$/u',//图纸库图纸分组名称,由1-30位字母中文或下划线组合
        'image_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//图纸模块编码，由1-20位字母下划线数字组成，字母开头
        'image_group_type_code'=>'/^[0-9a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//图纸分组分类模块编码，由1-20位字母下划线数字组成，字母数字开头
//        'factory_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//工厂模块编码,由1-20位字母下划线数字组成,字母开头
        'factory_code'=>'/^[0-9a-z_A-Z]{1,20}+$/',//工厂模块编码,由1-20位字母下划线数字组成,字母开头
        'company_code'=>'/^[a-zA-Z][0-9a-z_A-Z]{1,20}+$/',//公司模块编码,由1-20位字母下划线数字组成,字母开头
        'mobile'=>'/^1[34578]\d{9}$/',//手机号码验证
        'emplyee_card_id'=>'/^[0-9a-zA-Z]{1,20}+$/',//人员卡号,由1-20位字母数字组成
        'emplyee_password'=>'/^[0-9]{4,6}+$/',//人员密码，由4-6位数字组成
        'sell_code'=>'/^[0-9a-z_A-Z]{1,20}+$/',//客户编码，1-20位字母下划线数字组成
//        'rankplan_code'=>'/^[0-9a-z_A-Z]{1,2}+$/',
        'material_category_preg'=>[
            '1'=>'/^32.*/',    // 弹簧网
            '2'=>'/^35.*/',    // 凝胶片
            '3'=>'/^3001.*/',  //切割棉
            '4'=>'/^6101.*/',  //直条
        ],
        'out_material_category_preg'=>[
            '1'=>'/^200XH.*/',    // 绣花片流转品
            '2'=>'/^200HFN.*/',   // 绗缝片流转品
            '3'=>'/^200HFD.*/',   // 绗缝片流转品
            '4'=>'/^200CJ.*/',   // 裁剪流转品
            '5'=>'/^200HFM.*/',   // 绗缝流转品
            '6'=>'/^200FZ.*/',   // 缝制流转品
            '7'=>'/^200YH.*/',   // 网眼布/印花流转品
        ],
        // 报工入库的时候是否带行项
        'storage_material_category_preg'=>[
            '1'=>'/^32.*/',    // 弹簧网
            '2'=>'/^3001.*/',  //切割棉
            '3'=>'/^6101.*/',  //直条
            '4'=>'/^200.*/',  //流转品
            '5'=>'/^Z004.*/',  //面料大类
        ],
        'storage_material_category_preg1'=>[
            '1'=>'/^32.*/',    // 弹簧网
            '2'=>'/^3001.*/',  //切割棉
            '3'=>'/^6101.*/',  //直条
//            '4'=>'/^200.*/',  //流转品
        ],

    ],
    //描述,注释之类的限制数目如下
    'comment'=>[
        'category'=>500,//物料分类注释的个数限制
        'attribute'=>500,//物料属性注释的个数限制
        'template'=>500,//物料模板描述的个数限制
        'material'=>500,//物料描述的个数限制
        'bom_group'=>500,//物料清单分组描述个数限制
        'image_attribute'=>500,//图纸库图纸属性描述个数限制
        'image_category'=>500,//图纸模块描述个数限制
        'image_group'=>500,//图纸模块描述个数限制
        'sys_message_title'=>200,//系统消息title长度限制
        'sys_message_content'=>500,//系统消息content长度限制
        'company_desc'=>500,//公司描述字符长度限制
        'factory_desc'=>500,//公司描述字符长度限制
    ],

    //物料来源  1、采购 2、自制 3、委外 4、客供，默认为采购
    'source'=>[
        'buy'=>1,
        'self'=>2,
        'out'=>3,
        'provider'=>4,
    ],
    //应用接口层的统一参数
    'apiCommonRules' => array(
        //'sign' => array('name' => 'sign', 'require' => true),
    ),

    //Bom
    'bom'=>[
        //状态     0是未激活|已冻结    1已激活(未发布)     2 已发布
        'condition'=>['unactivated'=>0, 'activated'=>1,'released'=>2],
    ],

    //权限节点类型
    'node_type'=>[
        'ignore_login'=>1,//免登陆
        'ignore_auth'=>2,//免授权
        'need_auth'=>3,//需授权
        'out_auth'=>4,//管理型
    ],

    // sap WebService 配置
    'sap_service' => [
        'intranet_host' => env('INTRANET_HOST', 'http://192.168.4.40:8000'),
        'external_host' => env('EXTERNAL_HOST', 'http://58.221.197.202:8000'),
        'wsdl_service_host' => env('WSDL_SERVICE_HOST', 'http://HKS4PRD.mlily.com:8000'),
        'username' => env('SAP_USERNAME', 'KLTABAP2'),
        'password' => env('SAP_PASSWORD', '90-=op[]'),
        'wsdl_path' => 'storage/sap.wsdl',  // 相对于public/index.php
        'wsdl_url' => env('WSDL_URL', '/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zmlily_webservice/800/zmlily_webservice/zmlily_webservice?sap-client=800'),
    ],

    // srm WebService 配置
    'srm_webservice'=>[
        'intranet_host' => 'http://58.221.197.202:8081',
        'external_host' => 'http://58.221.197.202:8081',
        'username' => '59007094',
        'password' => 'A083BC7AC27350AB4072E06F7CF2A53C',
        'wsdl_url' => '/itf/wsdl/modules/ws_eitf/QMS_CLAIM_FORM/eitf_qms_claim_form_import_server.svc',
        'wsdl_path' => 'storage/srm.wsdl',
    ],
    // mosu WebService 配置
    'mosu_webservice'=>[
        'intranet_host' => 'http://192.168.10.204:30014',
        //'intranet_host' => 'http://192.168.10.239:1433',
        //'external_host' => 'http://58.221.197.202:8081',
//        'username' => 'KQADMIN',
//        'password' => 'kqadmin123',
        'username' => '',
        'password' => '',
        'wsdl_url' => '/Import.asmx?wsdl',
        'wsdl_path' => 'storage/mosu.wsdl',
    ],

    // sapnwrfc 函数配置
    'sapnwrfc_service' => [
        'ashost' => '192.168.4.39', // sap服务器地址
        'sysnr'  => '00',  //sap给的
        'client' => '500', //sap系统
        'user'   => 'intuser', //sap用户名
        'passwd' => '90-=op[]', //sap密码
    ],

    'redis_timeout'=>[
        'bom' => 1440,//bom详情存于redis中超时时间,以分钟记
        'bom_routing' => 1440,//bom工艺路线详情存于redis中超时时间，以分钟记
        'brom_routing_preview' => 2880,//bom工艺路线预览数据在redis中超过时间
    ],

    'encoding'=>[
        '1'=>['field'=>'item_no', 'table'=>'rm',],
        '2'=>['field'=>'code', 'table'=>'template',],
        '3'=>['field'=>'key', 'table'=>'ad',],
        '4'=>['field'=>'code', 'table'=>'ria',],
        '5'=>['field'=>'code', 'table'=>'rio',],
        '6'=>['field'=>'code', 'table'=>'rdr',],
        '7'=>['field'=>'code', 'table'=>'rso',],
        '8'=>['field'=>'code', 'table'=>'rp',],
        '10'=>['field'=>'code', 'table'=>'rmkb',],
        '11'=>['field'=>'code','table'=>'rpr'],
        '12'=>['field'=>'code','table'=>'rpf'],
        '13'=>['field'=>'code','table'=>'rsa'],
        '14'=>['field'=>'complaint_code','table'=>'rqcc'],
        '15'=>['field'=>'code','table'=>'roi'],
        '16'=>['field'=>'code','table'=>'roos']
    ],

    'material_category'=>[64,65,66,67,68,69,70,71,72,73,74,52,53,54,55,56,57,58,89,79,80,81,82,83,84,85,45,79,86],

    'need_send_to_sap_material_category'=>[
        46,47,48,49,50,51,59,
        75,76,77,78,
        89,
        123
    ],

    //外发部门列表作用 ： 配置报工单列表权限时候 使用
    'out_departmet'=>[5],


    // qc  检验数量规则
    'qc_checkqty_rule'=>[
        'own'=>[
            'min'=>0,
            'max'=>5,
        ],
        '5'=>[
            'min'=>6,
            'max'=>25,
        ],
        '13'=>[
            'min'=>26,
            'max'=>50,
        ],
        '20'=>[
            'min'=>51,
            'max'=>150,
        ],
        '32'=>[
            'min'=>151,
            'max'=>280,
        ],
        '50'=>[
            'min'=>281,
            'max'=>500,
        ],
        '80'=>[
            'min'=>501,
            'max'=>1200,
        ],
        '125'=>[
            'min'=>1201,
            'max'=>3200,
        ],
        '200'=>[
            'min'=>3201,
            'max'=>10000,
        ],
        '315'=>[
            'min'=>10001,
            'max'=>99999999999,
        ],
    ],

    'cli_http_host' => env('CLI_HTTP_HOST', 'http://192.168.10.183'),
    'molding_work_shop_id' =>23,
    'no_printing_code'=>env('NO_PRINTING_CODE','NoPrinting'),
    //模板上哪些分类的料分配到哪个工序节点哪个步骤上
    'material_routing_node'=>[
        '60'=>1,
    ],


    'sap_not_material_category' => [
        '3002',
        '3004'
    ],

    'reject_factory_code' => [
        '1103'
    ],
    'pao_category' => [
        '3002','300201','300203','300205','300207','300209','300211'
    ],
    //单独处理批次为1的棉泡公斤转米的开关
    'batch1' => 1,
    // 质检员工卡号
    'rand_array'=>['0016', '0015', '0014', '0013', '0012'],
    //  差异±0.2
    'size22'=> [
            '6105', '6109', '6111', '6113', '6115',  // 面辅料 标，拉链头，码装拉链，定尺拉链，闭尾拉链
            '6201','6203','6205', // 包装辅材 贴纸，彩页，吊牌
            '1309',  // 光纸箱
        ],
    //  差异±0.5
    'size23'=> [
            '11','1102','1103',  // 枕头 切割枕 碎棉枕 '11','1102','1103'   ±0.5
            '3101', '3103', '3105', '3107', '3109', '3111', '3113', '3115', '3197', '3199', //  布套  床垫外套,床垫内套,模塑枕外套,模塑枕内套,切割枕外套,切割枕内套,碎绵枕外套,碎绵枕内套,其它外套,其它内套
            '300107', // 绗缝棉
            '6401','640101','640103','640105', // 包类 合片包,立体包,圆筒包,
            '6405','640501', '640503', '640505', // 筒材类 筒料,筒袋,卷装筒材
            '6403','640301','640303','640305'	// 	袋类  包装袋   自封袋  线扣袋
        ],
    // 床垫 差异 ± 0.2 厚 +0.1
    'size24'=>['10','1001' ,'100101' ,'100103' ,'100105' ,'1003'],
    // 切割垫 差异 ± 1 厚 ± 0.2
    'size25'=>['1202','120201' ,'120203' ,'120299'],
    // 差异 ± 0.3
    'size26'=> [
            '6407','640703','640705','640707','640709','640711','640713','640715','640717', //箱盒类 , 彩箱 , 彩盒 , 普通黄箱 , 加强黄箱 , 类美卡黄箱 , 类美卡带轮黄箱 , 加强白箱 , 加强带轮白箱 , 天地盖
            '6511',// 震动箱
            '1307' // 光彩盒
        ],
    // 模塑   长宽±0.3，高0.2；  克重 400-650g < 20g,    650-1250g < 35g,     1250g以上<50g
    'size27'=>[
        // 模塑,模塑高低枕芯,模塑传统枕芯,模塑颈枕芯,模塑骨头枕芯,模塑异形枕芯,模塑其它类
        '33','3301','3303','3305','3307','3309','3399',
    ],
    //   面料 克重：-5%~+2.5%  门幅+2cm
    'size28'=>[
        // 面料,空气层,毛巾布,天鹅绒,短毛绒,色丁布,植绒布,氨纶布,罗纹布,网眼布,鸟眼布,沙发布,玻纤布,尼丝纺,麂皮绒,牛津布,棉布,涤卡布,纱卡布,珊瑚绒,无纺布,毛毡布,汗布,拉毛布,缎条布,其它面料
        '60','6001','6003','6005','6007','6013','6015','6017','6019','6021','6023','6027','6029','6033','6035','6037','6039','6041','6043','6045','6049','6051','6053','6057','6059','6099',
    ],
    // 面料 不取克重
    'size28_1'=>[
        // 灯芯绒 ,防羽布 ,春亚纺 ,革类,点塑布,TC布
        '6025','6055','6031','6047','6011','6009'
    ],
    //裁片 ± 1cm
    'size29'=>[
        '6307', // 裁片
    ],
    // 需要获取备注信息
    'size30'=>[
        '630505' // 螺旋绵
    ],
    // 流转品
    'size31'=>[
        '200CJ', //裁剪流转品
        '200CJ2', // 裁剪2流转品
        '200CJ3', // 裁剪3流转品
    ],
    // qc  检验面料M数量规则
    'qc_checkqty_rule_m'=>[
        'own'=>[
            'min'=>0,
            'max'=>200,
        ],
        '200'=>[
            'min'=>201,
            'max'=>10000,
        ],
        'max'=>[
            'min'=>10001,
            'max'=>99999999999,
        ],
    ],
    // qc  检验面料KG数量规则
    'qc_checkqty_rule_kg'=>[
        'own'=>[
            'min'=>0,
            'max'=>100,
        ],
        '100'=>[
            'min'=>101,
            'max'=>500,
        ],
        'max'=>[
            'min'=>501,
            'max'=>99999999999,
        ],
    ],
    // qc 的 去除责任车间id
    'qc_workshop_id' => [18 ,20,  37,  38, 39, 40, 41, 32, 33, 43],

];






