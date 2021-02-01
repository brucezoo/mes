{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/common/upload/css/upload.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="page-content">
    <div class="tap-btn-wrap">
        <div class="el-form-item btnShow" style="margin-bottom: 10px;">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary submit print">打印</button>
                <button type="button" class="el-button back">返回</button>
            </div>
        </div>
    </div>
    <div class="el-panel-wrap">
        <!-- <button type="button" class="el-button el-button--primary submit print">打印</button> -->
        <form id="qualityResume" class="formMateriel formTemplate normal">
            <div class="flex-wrap" style="width: 1314px">
                <div class="basic-wrap" style="border:1px solid #ddd;">
                    <div style="text-align: center;padding-top: 40px;padding-bottom: 20px;">
                        <h2 style="margin-bottom: 20px;">品质履历表</h2>
                    </div>
                    <div class="userInput">

                    </div>
                    <div>
                        <h4 style="padding-left:64px;">基础数据</h4>
                        <div class="el-form-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">销售订单</span>
                            </label>
                            <input type="text" id="baseinfo-sales_order_code" style="width: 140px;" class="el-input" placeholder="" value="" readonly>

                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">销售订单行项</span>
                            </label>
                            <input type="text" id="baseinfo-sales_order_project_code" style="width: 50px;" class="el-input" placeholder="" value="" readonly>

                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">检验单号</span>
                            </label>
                            <input type="text" id="baseinfo-code" style="width: 200px;" class="el-input" placeholder="" value="" readonly>
                        </div>
                        <div class="el-form-item">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">物料编码</span>
                            </label>
                            <input type="text" id="baseinfo-material_code" style="width: 140px;" class="el-input" placeholder="" value="" readonly>

                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">物料名称</span>
                            </label>
                            <input type="text" id="baseinfo-material_name" style="width: 400px;" class="el-input" placeholder="" value="" readonly>
                        </div>
                    </div>
                    <div class="save-item" style="margin-top: 20px;">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">责任人</span>
                                </label>
                                <input type="text" id="choose_admin"  class="el-input" placeholder="请选择责任人" value="" readonly>
                                <input type="hidden" id="choose_admin_id"  class="el-input"  value="">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">创建人</span>
                                </label>
                                <input type="text" id="create_name"  class="el-input" placeholder="请选择创建人" value="" readonly>
                                <input type="hidden" id="create_admin_id"  class="el-input"  value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>

                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">问题描述</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="questionDescription" readonly rows="5" class="el-textarea" placeholder="">

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
                                    <span class="">临时应急措施</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="tempWay" rows="5" readonly class="el-textarea" placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">最终解决方法</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="finalWay" rows="5" readonly class="el-textarea" placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">图片信息</span>
                                </label>
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
                                    <span class="">改善措施结果跟踪</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="resultFinalMethod" rows="5" class="el-textarea" readonly placeholder="">

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
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/qualityResume/qc-view-quality-resume.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
    <script src="/statics/common/fileinput/fileinput.js?v={{$release}}"></script>
    <script src="/statics/common/fileinput/theme/theme.js?v={{$release}}"></script>
    <script src="/statics/common/fileinput/locales/zh.js?v={{$release}}"></script>
    <script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
@endsection
