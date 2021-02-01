<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2017/12/14
 * Time: 17:39
 */

//region  异常单
/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |----------------------------------------------------------------------
 */
//endregion
$router->post('abnormal/store','Mes\AbnormalController@store');
$router->post('abnormal/update','Mes\AbnormalController@update');
$router->get('abnormal/show','Mes\AbnormalController@show');
$router->get('abnormal/destroy','Mes\AbnormalController@destroy');
$router->get('abnormal/pageIndex','Mes\AbnormalController@pageIndex');
$router->post('abnormal/audit','Mes\AbnormalController@audit');

$router->get('department/list','Mes\AbnormalController@departmentList');

//region  异常回复单
/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |----------------------------------------------------------------------
 */
 $router->post('abnormalReply/update','Mes\AbnormalReplyController@update');
 $router->get('abnormalReply/show','Mes\AbnormalReplyController@show');
 $router->get('abnormalReply/pageIndex','Mes\AbnormalReplyController@pageIndex');
 //特殊列表 
 $router->get('abnormalReply/specialpageIndex','Mes\AbnormalReplyController@specialpageIndex');

//region  特采
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 |特采申请     aod/insert
 |特采修改     aod/update
 |特采提交审核     aod/commitAod
 |特采审核     aod/approval
 |
 */
//endregion

$router->post('aod/insert','Mes\AodController@insert');
$router->post('aod/update','Mes\AodController@update');
$router->post('aod/commitAod','Mes\AodController@commitAod');
$router->post('aod/approval','Mes\AodController@approval');

//region  qc检验设置
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 | qc/settingType    类别列表
 | qc/addType        添加类别
 | qc/viewType       查看类别
 | qc/deleteType     删除类别
 | qc/addCheckItem      类别模板添加检验项
 | qc/deleteCheckItem   类别模板删除检验项
 | qc/getCheckItemsByType   检验类别模板检验项列表
 |
 */
//endregion
$router->get('qc/settingType','Mes\SettingController@typeSelect');
$router->get('qc/templateList','Mes\SettingController@templateList');
$router->post('qc/addType','Mes\SettingController@addTpye');
$router->post('qc/editType','Mes\SettingController@editTpye');
$router->get('qc/viewType','Mes\SettingController@viewTpye');
$router->get('qc/deleteType','Mes\SettingController@deleteTpye');
$router->post('qc/addCheckItem','Mes\SettingController@addCheckItem');
$router->get('qc/deleteCheckItem','Mes\SettingController@deleteCheckItem');
$router->get('qc/getCheckItemsByType','Mes\SettingController@getCheckItemsByType');
$router->get('qc/getItemsByType','Mes\SettingController@getItemsByType');


//region  qc检验记录
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 | qc/updateCheck    修改检验
 | qc/viewCheck      查看检验
 | qc/select         检验项列表
 | qc/addCheckItemResult    添加检验项结果
 | qc/editCheckItemResult   修改检验项结果
 | qc/viewCheckItemResult   查看检验项结果
 */
//endregion
$router->post('qc/audit','Mes\CheckItemController@audit');
$router->post('qc/noaudit','Mes\CheckItemController@noaudit');

$router->post('qc/updateCheck','Mes\CheckItemController@updateCheck');
$router->post('qc/IQCCheckMore','Mes\CheckItemController@checkMore');
$router->get('qc/viewCheck','Mes\CheckItemController@viewCheck');
$router->get('qc/show','Mes\CheckItemController@show');
$router->get('qc/select','Mes\CheckItemController@select');
$router->get('qc/selectDim','Mes\CheckItemController@selectDim');
$router->get('qc/dropdownSelect','Mes\CheckItemController@dropdownSelect');
$router->post('qc/editCheckItemResult','Mes\CheckItemResultController@editCheckItemResult');
$router->get('qc/viewCheckItemResult','Mes\CheckItemResultController@viewCheckItemResult');
// 添加复制mc记录
$router->post('qc/addMCData','Mes\CheckItemResultController@addMCData');


// liming
// 选择模板
$router->post('qc/selectTemplate','Mes\CheckItemController@selectTemplate');
// 查看模板
$router->get('qc/showTemplate','Mes\CheckItemController@showTemplate');
//设置检验数量
$router->post('qc/setCheckQty','Mes\CheckItemController@setCheckQty');
//更改 检验单状态
$router->get('qc/updatePushStatus','Mes\CheckItemController@updatePushStatus');
//增加ipqc检验单
$router->get('qc/addIpqc','Mes\CheckItemController@addIpqc');
//检验单 复制
$router->get('qc/checkCopy','Mes\CheckItemController@checkCopy');



//region  qc
/*
 |-----------------------------------------------------------------------
 |@author liming
 |----------------------------------------------------------------------
 |检验项
 |
 */
//endregion
$router->post('inspectproject/store','Mes\InspectProjectController@store');
$router->post('inspectproject/update','Mes\InspectProjectController@update');
$router->get('inspectproject/show','Mes\InspectProjectController@show');
$router->get('inspectproject/destroy','Mes\InspectProjectController@destroy');
$router->get('inspectproject/treeIndex','Mes\InspectProjectController@treeIndex');


//region  qc检验问题设置
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 |qc/questionSetting/addItems        缺失项（问题项）添加
 |qc/questionSetting/updateItems     缺失项（问题项）编辑
 |qc/questionSetting/viewItems       缺失项（问题项）查看
 |qc/questionSetting/viewItems       缺失项（问题项）删除
 |qc/questionSetting/viewItems       缺失项（问题项）列表
 */
//endregion
$router->post('qc/questionSetting/addItems','Mes\QuestionSettingController@addItems');
$router->post('qc/questionSetting/updateItems','Mes\QuestionSettingController@updateItems');
$router->get('qc/questionSetting/viewItems','Mes\QuestionSettingController@viewItems');
$router->get('qc/questionSetting/deleteItems','Mes\QuestionSettingController@deleteItems');
$router->get('qc/questionSetting/viewItemsList','Mes\QuestionSettingController@viewItemsList');


//region  客诉
/*
 |-----------------------------------------------------------------------
 |@author xin.min
 |----------------------------------------------------------------------
 |
 */
//endregion


//系统分析客诉列表
//显示所有已发送给qc的客诉单
$router->get('qc/showAllComplaintToQc','Qc\CustomerComplaintController@showAllComplaintToQc');
//显示所有未发送给qc的客诉单
$router->get('qc/showAllComplaintNotToQc','Qc\CustomerComplaintController@showAllComplaintNotToQc');


//客诉打印
$router->get('qc/ComplaintDetailPrint','Qc\CustomerComplaintController@ComplaintDetailPrint');
//客诉的缺失项纪录表
$router->post('qc/missingItemOrder','Qc\CustomerComplaintController@missingItemOrder');
// 客诉赛选查询表
$router->get('qc/searchComplaintDetail','Qc\CustomerComplaintController@searchComplaintDetail');

//新建客诉单
$router->post('qc/storeComplaint','Qc\CustomerComplaintController@storeComplaint');
// 查看客诉单
$router->get('qc/showComplaint','Qc\CustomerComplaintController@showComplaint');
// 修改客诉单
$router->post('qc/updateComplaint','Qc\CustomerComplaintController@updateComplaint');

//删除客诉单
$router->get('qc/deleteComplaint','Qc\CustomerComplaintController@deleteComplaint');
$router->post('qc/addAttachments','Qc\CustomerComplaintController@addAttachments');


//新建D3
$router->post('qc/storeD3','Qc\CustomerComplaintController@storeD3');

//修改D3
$router->post('qc/updateD3','Qc\CustomerComplaintController@updateD3');

//回答答案/修改答案
$router->post('qc/storeAnswer','Qc\CustomerComplaintController@storeAnswer');

//显示完整客诉
$router->get('qc/displayWholeComplaint','Qc\CustomerComplaintController@displayWholeComplaint');
//显示所有答案和需要回答的问题
$router->post('qc/detailAnswer','Qc\CustomerComplaintController@detailAnswer');

$router->get('qc/detailComplaintByAdmin','Qc\CustomerComplaintController@detailComplaintByAdmin');
$router->get('qc/checkDetailComplaintByAdmin','Qc\CustomerComplaintController@checkDetailComplaintByAdmin');
$router->post('qc/detailQuestion','Qc\CustomerComplaintController@detailQuestion');
$router->get('qc/listQuestion','Qc\CustomerComplaintController@listQuestion');
$router->get('qc/listComplaintToJudge','Qc\CustomerComplaintController@listComplaintToJudge');

$router->post('qc/sendQuestion','Qc\CustomerComplaintController@sendQuestion');
$router->get('qc/sendToQc','Qc\CustomerComplaintController@sendToQc');
//完结 按钮
$router->get('qc/overComplaint','Qc\CustomerComplaintController@overComplaint');

$router->post('qc/deleteSendQuestion','Qc\CustomerComplaintController@deleteSendQuestion');
$router->post('qc/submitJudgeComplaint','Qc\CustomerComplaintController@submitJudgeComplaint');
$router->post('qc/judgeComplaint','Qc\CustomerComplaintController@judgeComplaint');
$router->post('qc/judgeQuestion','Qc\CustomerComplaintController@judgeQuestion');
$router->get('qc/finishComplaint','Qc\CustomerComplaintController@finishComplaint');

//中止客诉单
$router->get('qc/stopComplaint','Qc\CustomerComplaintController@stopComplaint');

//QO munber模糊查询
$router->get('qc/dimPonumber','Qc\CustomerComplaintController@dimPonumber');
//物料编号 模糊查询
$router->get('qc/dimMaterial','Qc\CustomerComplaintController@dimMaterial');

// 客诉单唯一性检查
$router->get('qc/uniqueComplaint','Qc\CustomerComplaintController@unique');

//guanyang.wang
//查找物料列表
$router->get('qc/getMaterials','Qc\CustomerComplaintController@getMaterials');
$router->post('qc/storeMaterials','Qc\CustomerComplaintController@storeMaterials');

//region  检验计划
/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |----------------------------------------------------------------------
 |
 */
 // 新增 检验计划
 $router->post('QcPlan/store','Mes\QcPlanController@store');
 $router->get('QcPlan/unique','Mes\QcPlanController@unique');
 $router->get('QcPlan/show','Mes\QcPlanController@show');
 $router->get('QcPlan/pageIndex','Mes\QcPlanController@pageIndex');
 $router->get('QcPlan/destroy','Mes\QcPlanController@destroy');
 $router->post('QcPlan/update','Mes\QcPlanController@update');


//region  索赔单
 
/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |
 | 7.索赔回复列表   replyPageindex  shuaijie.feng 11.1/2019
 | 8.索赔审核   personReply  shuaijie.feng 11.1/2019
 | 9.索赔提示   claimPrompt  shuaijie.feng 11.15/2019
 | 10.索赔导出   claimexport  shuaijie.feng 11.19/2019
 |
 */
 // 新增 检验计划
 $router->post('QcClaim/store','Mes\ClaimController@store');
 $router->get('QcClaim/unique','Mes\ClaimController@unique');
 $router->get('QcClaim/show','Mes\ClaimController@show');
 $router->get('QcClaim/pageIndex','Mes\ClaimController@pageIndex');
 $router->get('QcClaim/destroy','Mes\ClaimController@destroy');
 $router->post('QcClaim/update','Mes\ClaimController@update');
 $router->get('QcClaim/replyPageindex','Mes\ClaimController@replyPageindex');
 $router->get('QcClaim/personReply','Mes\ClaimController@personReply');
 $router->get('QcClaim/claimPrompt','Mes\ClaimController@claimPrompt');
 $router->get('QcClaim/claimexport','Mes\ClaimController@claimexport');
/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |----------------------------------------------------------------------
 |
 */
 //检验单导出
 $router->get('qc/exportExcel','Mes\CheckItemController@exportExcel');

/**
 /-----------------------------------------------------------------------
 * @author shuaijie.feng
 /-----------------------------------------------------------------------
 *  检验单批量推送
 */
$router->get('qc/batchSending','Mes\CheckItemController@batchSending');

/**
/-----------------------------------------------------------------------
 * @author shuaijie.feng 7.3/2019
/-----------------------------------------------------------------------
 *  异常申请导出
 */
$router->get('AbnormalController/exportExcel','Mes\AbnormalController@exportExcel');

/**
 /-----------------------------------------------------------------------
 * @author hao.li
 /-----------------------------------------------------------------------
 *  异常单回复导出
 */
 $router->get('abnormal/exportExcel','Mes\AbnormalReplyController@differentFromExcel');

/**
/-----------------------------------------------------------------------
 * @author shuaijie.feng 7.23/2019
/-----------------------------------------------------------------------
 *  qc不良项目，细分
 */
$router->get('qc/missingIitems','Mes\CheckItemController@missingIitems');

/**
/-----------------------------------------------------------------------
 * @author shuaijie.feng 7.24/2019
/-----------------------------------------------------------------------
 *  qc异常单退回功能
 */
$router->get('qc/repulse','Mes\AbnormalController@repulse');

/**
 * @author shuaijie.feng 7.29/2019
 *  qc 重大异常列表
 */
$router->get('Qualityresume/pageIndex','Qc\QualityresumeController@pageIndex');

/**
 * @author shuaijie.feng 7.31/2019
 *  qc 重大异常详情
 */
$router->get('Qualityresume/show','Qc\QualityresumeController@show');

/**
 * @author shuaijie.feng 7.31/2019
 *  qc 重大异常列表导出
 */
$router->get('qualityResume/export','Qc\QualityresumeController@export');

/**
 * @author shuaijie.feng 7.31/2019
 *  qc 根据物料进行查询重大异常
 */
$router->get('qualityResume/quality','Qc\QualityresumeController@quality');
// qc 重大异常上传图片  shuaijie.feng 9.20/2019
$router->post('qualityResume/updateQuality','Qc\QualityresumeController@updateQuality');

/**
 * @author shuaijie.feng 8.3/2019
 *  删除补料提示
 */
$router->get('checkItem/feedingListremind','Mes\CheckItemController@feedingListremind');

/**
 * @author shuaijie.feng 8.7/2019
 *  qc删除补料
 */
$router->post('checkItem/feedingListdelete','Mes\CheckItemController@feedingListdelete');

/**
 * @author shuaijie.feng 8.7/2019
 *  qc 退回补料
 */
$router->post('checkItem/feedingListrepulse','Mes\CheckItemController@feedingListrepulse');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 添加特采数据
 */
$router->get('specialmining/specialAdd','Qc\SpecialminingController@specialAdd');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 特采列表数据
 */
$router->get('specialmining/pageIndex','Qc\SpecialminingController@pageIndex');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 特采某条数据
 */
$router->get('specialmining/show','Qc\SpecialminingController@show');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 特采删除数据
 */
$router->get('specialmining/delete','Qc\SpecialminingController@delete');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 特采修改数据
 */
$router->get('specialmining/update','Qc\SpecialminingController@update');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 特采回复列表数据
 */
$router->get('specialmining/replyPageindex','Qc\SpecialminingController@replyPageindex');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 特采回复
 */
$router->get('specialmining/personReply','Qc\SpecialminingController@personReply');

/**
 * @author shuaijie.feng 8.12/2019
 *  qc 特采提示给当前登录人是否有需要审核单据
 */
$router->get('specialmining/specialminingTips','Qc\SpecialminingController@specialminingTips');

/**
 * @author shuaijie.feng 8.16/2019
 *  qc 特采提示给当前登录人是否有需要审核单据
 */
$router->get('specialmining/audit','Qc\SpecialminingController@audit');

/**
 * @author shuaijie.feng 8.19/2019
 *  qc oqc 成品送检推送sap
 */
$router->get('qc/pushFinishedproduct','Mes\CheckItemController@pushFinishedproduct');

/**
 * @author shuaijie.feng 9.12/2019
 *  qc 查看列表数据
 */
$router->get('specialmining/pageIndexlist','Qc\SpecialminingController@pageIndexlist');

// qc  ipqc、oqc检验数量 修改 shuaijie.feng 9.16/2019
$router->post('qc/updateCheckQty','Mes\CheckItemController@updateCheckQty');

// qc 检验单删除 shuaijie.feng 10.22/2019
$router->post('qc/checklistDelete','Mes\CheckItemController@checklistDelete');

// qc 客诉导出 shuaijie.feng 10.25/2019
$router->get('CustomerComplaint/customerComplaintexport','Qc\CustomerComplaintController@customerComplaintexport');

// qc 客诉增加品质履历 shuaijie.feng 10.25/2019
$router->post('CustomerComplaint/customercomplaintquality','Qc\CustomerComplaintController@customercomplaintquality');

// qc 删除品质履历记录  shuaijie.feng 10.28/2019
$router->get('qualityResume/qualityDelete','Qc\QualityresumeController@qualityDelete');
/*
| qc 验货申请单
| @author  shuaijie.fefng
| 1. 导出数据格式    downloadTemplate
| 2. 上传导入文件    excelImport
| 3. 列表数据    pageIndex
| 4. 推送数据    pushFinishedproduct
 */
$router->get('Inspectionapplication/downloadTemplate','Qc\InspectionapplicationController@downloadTemplate');
$router->post('Inspectionapplication/excelImport','Qc\InspectionapplicationController@excelImport');
$router->get('Inspectionapplication/pageIndex','Qc\InspectionapplicationController@pageIndex');
$router->get('Inspectionapplication/pushFinishedproduct','Qc\InspectionapplicationController@pushFinishedproduct');
//hao.li 删除未处理的OQC订单
$router->get('Inspectionapplication/deleteFinishedproduct','Qc\InspectionapplicationController@deleteFinishedproduct');

//Department/store
$router->get('specialmining/showMessage','Qc\CustomerComplaintController@showMessage');
//未处理信息推送
$router->get('qc/customerNotDeal','Qc\CustomerComplaintController@customerNotDeal');
$router->post('qc/endSendMessageById','Qc\CustomerComplaintController@endSendMessageById');

$router->get('qc/test','Qc\SystemsCanDoAnalysisController@test');

/*
 |-----------------------------------------------------------------------
 |
 | 1.枚举不良项目处理方式失效项目列表
 | 2.新增不良项目，处理方式，失效项目
 | 3.修改不良项目，处理方式，失效项目
 | 4.删除不良项目，处理方式，失效项目
 | 5.获取ID对应的一条不良项目，处理方式，失效项目
 |
 */
$router->get('InvalidCost/invalidEnumList','Qc\InvalidCostController@invalidEnumList');
$router->post('InvalidCost/addInvalidEnum','Qc\InvalidCostController@addInvalidEnum');
$router->post('InvalidCost/editInvalidEnum','Qc\InvalidCostController@editInvalidEnum');
$router->post('InvalidCost/delInvalidEnum','Qc\InvalidCostController@delInvalidEnum');
$router->get('InvalidCost/invalidEnumOne','Qc\InvalidCostController@invalidEnumOne');

/*
 |-----------------------------------------------------------------------
 |
 | 1.部门分类树型列表
 | 2.获取下级
 | 3.部门详情
 | 4.修改部门
 | 5.检测唯一性
 | 6.新增部门
 | 7.删除部门
 |
 */
$router->get('InvalidCost/treeIndex','Qc\InvalidCostController@treeIndex');
$router->get('InvalidCost/getNextLevelList','Qc\InvalidCostController@getNextLevelList');
$router->get('InvalidCost/show','Qc\InvalidCostController@show');
$router->post('InvalidCost/update','Qc\InvalidCostController@update');
$router->get('InvalidCost/unique','Qc\InvalidCostController@unique');
$router->post('InvalidCost/store','Qc\InvalidCostController@store');
$router->post('InvalidCost/destroy','Qc\InvalidCostController@destroy');

/*
 |-----------------------------------------------------------------------
 |
 | 1.提报获取销售订单行项
 | 2.提报获取物料
 | 3.新增提报
 | 4.修改提报
 | 5.删除提报
 | 6.提报列表
 | 7.提报详情
 | 8.导出提报
 | 9.提报获取销售订单
 | 10.提报推送消息
 | 11.提报待处理列表
 | 12.提报批量处理接口
 | 13.失效列表接口
 | 14.失效系统分析报表接口
 | 15.失效成本统计表
 | 16.ipc,ipqc,iqc汇总
 |
 */
$router->get('InvalidCost/getSalesOrderProjectCode','Qc\InvalidCostController@getSalesOrderProjectCode');
$router->get('InvalidCost/getMaterialByProductionOrder','Qc\InvalidCostController@getMaterialByProductionOrder');
$router->post('InvalidCost/addInvalidOffer','Qc\InvalidCostController@addInvalidOffer');
$router->post('InvalidCost/editInvalidOffer','Qc\InvalidCostController@editInvalidOffer');
$router->post('InvalidCost/delInvalidOfferById','Qc\InvalidCostController@delInvalidOfferById');
$router->get('InvalidCost/getInvalidOfferList','Qc\InvalidCostController@getInvalidOfferList');
$router->get('InvalidCost/getInvalidOfferOne','Qc\InvalidCostController@getInvalidOfferOne');
$router->get('InvalidCost/exportInvalidOffer','Qc\InvalidCostController@exportInvalidOffer');
$router->get('InvalidCost/getSalesOrderCode','Qc\InvalidCostController@getSalesOrderCode');
$router->post('InvalidCost/sendMessageBatch','Qc\InvalidCostController@sendMessageBatch');
$router->get('InvalidCost/getHandleInvalidOfferList','Qc\InvalidCostController@getHandleInvalidOfferList');
$router->post('InvalidCost/dealInvalidOfferById','Qc\InvalidCostController@dealInvalidOfferById');
$router->get('InvalidCost/getInvalidList','Qc\InvalidCostController@getInvalidList');
$router->get('InvalidCost/systemAnalysisReport','Qc\InvalidCostController@systemAnalysisReport');
$router->get('InvalidCost/exportSystemAnalysisReport','Qc\InvalidCostController@exportSystemAnalysisReport');
$router->get('InvalidCost/statisticalReport','Qc\InvalidCostController@statisticalReport');
$router->get('InvalidCost/summary','Qc\InvalidCostController@summary');
$router->get('InvalidCost/summaryExport','Qc\InvalidCostController@summaryExport');
$router->get('InvalidCost/exportStatisticalReport','Qc\InvalidCostController@exportStatisticalReport');


/*
| QC 获取加工商变更 设置接收变更消息人员
| @author  shuaijie.fefng
| 1. addsetPushmessage    添加
| 2. setpushmassagelist    列表
| 3. deletesetPushmessage    删除
| 4. updatesetPushmessage    修改
| 5. setPushmessageshow    查看
*/
$router->post('qc/questionSetting/addsetPushmessage','Mes\QuestionSettingController@addsetPushmessage');
$router->get('qc/questionSetting/setpushmassagelist','Mes\QuestionSettingController@setpushmassagelist');
$router->post('qc/questionSetting/deletesetPushmessage','Mes\QuestionSettingController@deletesetPushmessage');
$router->post('qc/questionSetting/updatesetPushmessage','Mes\QuestionSettingController@updatesetPushmessage');
$router->get('qc/questionSetting/setPushmessageshow','Mes\QuestionSettingController@setPushmessageshow');

/**
| QC 系统能效分析
| @author  shuaijie.fefng
| 1.inspectionSummary  检验汇总
| 2.badClassification  不良项目汇总
| 3.problemPoint  获取不良项目数据问题点总数
 */
$router->get('Systemsanalysis/inspectionSummary','Qc\SystemsanalysisController@inspectionSummary');
$router->get('Systemsanalysis/badClassification','Qc\SystemsanalysisController@badClassification');
$router->get('Systemsanalysis/problemPoint','Qc\SystemsanalysisController@problemPoint');
// 打印数据
$router->get('Systemsanalysis/printData','Qc\SystemsanalysisController@dataList');
$router->get('Systemsanalysis/exportData','Qc\SystemsanalysisController@exportData');

// qc 部门异常统计报表
$router->get('Systemsanalysis/badPrintData','Qc\SystemsanalysisController@badPrintData');
$router->get('Systemsanalysis/badPrint','Qc\SystemsanalysisController@badPrint');



//hao.li 索赔单删除
$router->get('QcClaim/deleteClaim','Mes\ClaimController@deleteClaim');

//生成重大异常 hao.li
$router->get('AbnormalController/createAbnormal','Mes\AbnormalController@createAbnormal');

//生成失效 hao.li
$router->post('qc/createInvalidOffer','Mes\CheckItemController@createInvalidOffer');

//失效成本列表导出 hao.li
$router->get('InvalidCost/exportInvalidOfferList','Qc\InvalidCostController@exportInvalidOfferList');

//失效成本提报导入 hao.li
$router->post('InvalidCost/importInvalidOffer','Qc\InvalidCostController@importInvalidOffer');

//根据部门名称和类别进行唯一性检查  hao.li
$router->get('InvalidCost/checkTypeName','Qc\InvalidCostController@checkTypeName');

//生成委外报检单
$router->post('qc/createInspectionReport','Mes\CheckItemController@createInspectionReport');

//生成委外报检单
$router->post('qc/pushWqcToSap','Mes\CheckItemController@pushWqcToSap');

//系统配置
$router->get('BaseConfig/getBaseConfig','Mes\SettingController@getBaseConfig');
$router->post('BaseConfig/addBaseConfig','Mes\SettingController@addBaseConfig');