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
                <button type="button" class="el-button back">返回</button>
            </div>
        </div>
    </div>
    <div class="el-panel-wrap">
        <form id="distribute" class="formMateriel formTemplate normal">
            <div class="flex-wrap" style="width: 1314px;">
                <div class="basic-wrap" style="border:1px solid #ddd;">
                    <div style="text-align: center;padding-bottom: 20px;padding-top: 50px;">
                        <h2 style="margin-bottom: 20px;">特采申请报告</h2>
                        <div style="text-align: right;position: relative;right: 110px;margin-bottom: 10px;">
                            <button type="button" class="addApply" style="color: #fff;background-color: #00BE67;border-color: #00BE67;">添加</button>
                            <!--<button type="button" class="deleteApply" style="color: #fff;background-color: #00BE67;border-color: #00BE67;">删除</button>-->
                        </div>
                    </div>
                    <div class="userInput">

                    </div>
                    <div class="save-item" style="margin-top: 20px;">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="margin-bottom: 0px;">
                                    <span class="button pop-button choose-admin" style="cursor: pointer;position: relative;left: 25px;padding: 5px 4px;">选择责任人</span>
                                </label>
                                <input type="text" id="choose_admin"  class="el-input" style="margin-left: 55px;" placeholder="请选择责任人" value="" readonly>
                                <input type="hidden" id="choose_admin_id"  class="el-input"  value="">
                                <input type="hidden" id="special_purchase_id" class="el-input" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
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
                                    <span class="">问题描述</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="questionDescription" rows="5" class="el-textarea" placeholder="">

                                </textarea>
                            </div>
                            <p class="errorMessage" style="display: block;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="width: 1190px;">
                                <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                                    <span class="">特采原因</span>
                                </label>
                                <textarea type="textarea" maxlength="500" id="cause" rows="5" class="el-textarea" placeholder="">

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
<script src="/statics/custom/js/qc/deviation/editSpecialPurchaseApply.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/upload/js/upload.js?v={{$release}}"></script>

@endsection