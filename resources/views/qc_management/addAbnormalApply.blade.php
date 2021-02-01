{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/upload/css/upload.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="page-content">
    <div class="tap-btn-wrap">
        <div class="el-form-item btnShow" style="margin-bottom: 10px;">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary saveMsg">保存</button>
            </div>
        </div>
    </div>
    <div class="el-panel-wrap">
        <form id="distribute" class="formMateriel formTemplate normal">
            <div class="flex-wrap" style="width: 1314px">
                <div class="basic-wrap" style="border:1px solid #ddd;">
                    <div style="text-align: center;padding-top:50px;padding-bottom: 20px;">
                        <h2 style="margin-bottom: 20px;">品质异常改善报告</h2>
                        <div style="text-align: right;position: relative;right: 110px;margin-bottom: 10px;">
                            <button type="button" class="addApply" style="color: #fff;background-color: #00BE67;border-color: #00BE67;">添加</button>
                            <!--<button type="button" class="deleteApply" style="color: #fff;background-color: #00BE67;border-color: #00BE67;">删除</button>-->
                        </div>
                    </div>
                    <div class="userInput">
                        <div class="apply">
                            <div style="text-align: right;position: relative;top: 10px;right: 2%;">
                                <button type="button" class="deleteApply" style="color: #fff;background-color: #FF5722;border-color: #FF5722;">删除</button>
                            </div>
                            <div class="el-form-item" style="margin-top:18px;">
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">检验单号</span>
                                    </label>
                                    <div class="el-select-dropdown-wrap">
                                        <input type="text" class="el-input abnormalApply-input check-id" autocomplete="off" placeholder="请输入检验单号" value="">
                                        <input type="hidden" class="el-input checkId" value="">
                                        <input type="hidden" class="el-input unitId" value="">
                                        <input type="hidden" class="el-input production_order_id" value="">
                                        <input type="hidden" class="el-input sub_number" value="">
                                        <input type="hidden" class="el-input sub_order_id" value="">
                                        <input type="hidden" class="el-input check_resource" value="">
                                        <input type="hidden" class="el-input work_order_id" value="">
                                    </div>
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">生产单号</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input po_number" placeholder="请输入生产单号" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">工单号</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input wo_number" placeholder="请输入工单号" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </span>
                            </div>

                            <div class="el-form-item">
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">采购凭证项目编号</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input EBELP" placeholder="请输入采购凭证项目编号" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">采购凭证编号</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input EBELN" placeholder="请输入采购凭证编号" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">销售凭证项目</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input VBELP" placeholder="请输入销售凭证项目" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </span>
                            </div>

                            <div class="el-form-item">
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">物料</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input material_name" placeholder="请输入物料" value="" readonly="true">
                                    <input type="hidden" class="el-input material_id" value="">
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">数量</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input order_number" placeholder="请输入数量" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">销售和分销凭证号</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input VBELN" placeholder="请输入销售和分销凭证号" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </span>
                            </div>

                            <div class="el-form-item">
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">抽检数</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input amount_of_inspection" placeholder="请输入抽检数" value="" >
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">不合格数</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input inferior_qty" placeholder="请输入不合格数" value="">
                                </span>
                                <span class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">不合格率</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input reject_ratio" placeholder="请输入不合格率" value="" >
                                </span>
                            </div>

                            <div class="el-form-item">
                                <div class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">物料编码</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input material_code" placeholder="请输入物料编码" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </div>
                                <div class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">供应商名称</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input NAME1" placeholder="请输入供应商名称" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </div>
                                <div class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">编号</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input LIFNR" placeholder="请输入编号" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div abnormal-item">
                                    <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                        <span class="">工序</span>
                                    </label>
                                    <input type="text" class="el-input abnormalApply-input operation_name" placeholder="请输入工序名称" value="" readonly="true">
                                    <input type="hidden" class="el-input" value="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="save-item" style="margin-top: 20px;">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="margin-bottom: 0px;">
                                    <span class="button pop-button choose-admin" style="cursor: pointer;position: relative;left: 25px;padding: 5px 4px;">选择责任人</span>
                                </label>
                                <input type="text" id="choose_admin"  class="el-input" style="margin-left: 55px;" placeholder="请选择责任人" value="" readonly>
                                <input type="hidden" id="choose_admin_id"  class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>

                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">问题描述</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="questionDescription" rows="5" class="el-textarea" placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <div class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <a id="zwb_upload">
                                        <input type="file" class="add" multiple>点击上传图片
                                    </a>
                                </div>
                                <div id="showImg" style="width: 100%;min-height: 116px;border: 1px solid #ccc">
                                    <div class="box">
                                        <div class="list">
                                            <ul class="listBox"></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">临时应急措施</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="tempWay" rows="5" class="el-textarea" placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">根本原因分析</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="cause" rows="5" class="el-textarea" readonly placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">永久改善措施</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="finalMethod" rows="5" class="el-textarea" readonly placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">改善措施结果跟踪</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="resultFinalMethod" rows="5" class="el-textarea" readonly placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">结案</span>
                                </label>
                                <textarea type="textarea" maxlength="500" readonly id="endRemark" rows="5" class="el-textarea" placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                    </div>

                </div>
            </div>
        </form>
    </div>
</div>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/abnormal/qc-add-abnormal-apply.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/upload/js/upload.js?v={{$release}}"></script>
@endsection