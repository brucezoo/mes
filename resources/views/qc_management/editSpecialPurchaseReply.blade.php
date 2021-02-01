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
                        <h2 style="margin-bottom: 20px;">特采单回复</h2>
                        <div style="text-align: right;position: relative;right: 110px;margin-bottom: 10px;">
                            <button type="button" class="saveMsg" style="color: #fff;background-color: #00A0E9;border-color: #00A0E9;">回复</button>
                        </div>
                    </div>
                    <div class="userInput">

                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">审核人</span>
                            </label>
                            <input type="text" id="choose_admin"  class="el-input" placeholder="请选择责任人" value="" readonly>
                            <input type="hidden" id="choose_admin_id"  class="el-input"  value="">
                        </div>
                        <p class="errorMessage" style="padding-left: 88px;"></p>
                    </div>
                    <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <div class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                <span class="">图片</span>
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
                                <span class="">审核人回复</span>
                            </label>
                            <div id="groups" style="width: 1190px; min-height: 120px; border: 1px solid #bbb; font-size: 16px; background: #F5F5F5">

                            </div>
                        </div>
                        <p class="errorMessage" style="display: block;"></p>
                    </div>
                    <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">问题描述</span><span class="mustItem">*</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="questionDescription" rows="5" class="el-textarea" placeholder="" readonly="readonly">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                    <div class="save-item" style="margin-top: 20px;">
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">特采原因</span><span class="mustItem">*</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="cause" rows="5" class="el-textarea"  placeholder="" readonly="readonly">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                    </div>
                    <div class="save-item" style="margin-top: 20px;">
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">是否确认特采</span><span class="mustItem">*</span>
                                </label>
                                <input type="radio" name="antzone" value="1" checked/> 同意特采
                                <input type="radio" name="antzone" value="2" /> 拒绝特采
                            </div>
                        </div>
                    </div>
                    <div class="save-item" style="margin-top: 20px;">
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">回复内容</span><span class="mustItem">(选填)</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="contentofreply" rows="5" class="el-textarea"  placeholder="" >

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
<!--<script src="/statics/custom/js/qc/abnormal/qc-view-abnormal-reply.js?v={{$release}}"></script>-->
<script src="/statics/custom/js/qc/deviation/editSpecialPurchaseReply.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/fileinput.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/theme/theme.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/locales/zh.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
@endsection