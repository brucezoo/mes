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
    <div class="el-panel-wrap">
        <form id="distribute" class="formMateriel formTemplate normal">
            <div class="flex-wrap" style="width: 1314px;">
                <div class="basic-wrap" style="border:1px solid #ddd;">
                    <div style="text-align: center;padding-bottom: 20px;padding-top: 50px;">
                        <h2 style="margin-bottom: 20px;">异常单回复</h2>
                        <div style="text-align: right;position: relative;right: 110px;margin-bottom: 10px;">
                            <button type="button" class="saveMsg" style="color: #fff;background-color: #00A0E9;border-color: #00A0E9;">保存</button>
                        </div>
                    </div>
                    <div class="userInput">

                    </div>
                    <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">问题描述</span><span class="mustItem">*</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="questionDescription" rows="5" class="el-textarea" placeholder="">

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
                                    <span class="">临时应急措施</span><span class="mustItem">*</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="tempWay" rows="5" class="el-textarea" placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                    <div class="save-item" style="margin-top: 20px;">
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">根本原因分析</span><span class="mustItem">*</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="cause" rows="5" class="el-textarea"  placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">最终解决办法</span><span class="mustItem">*</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="finalMethod" rows="5" class="el-textarea"  placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">改善措施跟踪结果</span><span class="mustItem">*</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="resultFinalMethod" rows="5" class="el-textarea"  placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="addMFujian_from" style="padding-left:65px;">
                            <form id="addMFujian_from" class="formMateriel formTemplate normal">
                                <div class="file-loading">
                                    <input id="attachment" name="attachment" type="file" class="file" data-preview-file-type="text">
                                </div>
                            </form>
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
<!--<script src="/statics/custom/js/qc/abnormal/qc-view-abnormal-reply.js?v={{$release}}"></script>-->
<script src="/statics/custom/js/qc/abnormal/qc-edit-abnormal-reply.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/fileinput.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/theme/theme.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/locales/zh.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
@endsection