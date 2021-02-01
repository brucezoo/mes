{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<!-- 表单提交 -->
    <div style="width:358px;">
        <!-- 编码 -->
            <label>编码<b color='red'>*</b></label>
            <input id="bianMa" style="margin-left: 20px; margin-top:10px; display:inline-block;width:300px;"  type="text"lay-verify="required" lay-reqtext="编码是必填项，岂能为空？" placeholder="请输入编码" autocomplete="off" class="layui-input">
            <br>
        <!-- 名称 -->
            <label>名称<b color='red'>*</b></label>
            <input id="name" style="margin-left: 20px; margin-top:20px; display:inline-block;width:300px;"  type="text"lay-verify="required" lay-reqtext="名称是必填项，岂能为空？" placeholder="请输入名称" autocomplete="off" class="layui-input">
            <br>
        <!-- 标签 -->
            <label>标签</label>
            <input id="biaoQian" style="margin-left: 25px; margin-top:20px; display:inline-block;width:300px;"  type="text" placeholder="请输入标签" autocomplete="off" class="layui-input">
            <br>
        <!-- 描述 -->
            <label  style=" position:relative; top:-40px;">描述</label>
            <textarea id="describe" placeholder="请输入内容" style="margin-left: 25px; margin-top:20px; display:inline-block;width:300px;"  class="layui-textarea"></textarea>
            <br>
        <!-- 提交 -->
            <button type="submit" class="layui-btn layui-btn-primary layui-btn-sm" id="btn" style="float:right;margin-bottom:30px;">提交</button>
    </div>

<!-- 列表数据 -->
    <div >
        <table class="layui-table">
            <thead>
                <tr>
                    <th width="25%">编码</th>
                    <th width="25%">名称</th>
                    <th width="25%">标签</th>
                    <th style="display:none;"></th>
                    <th width="25%">操作</th>
                </tr> 
            </thead>
            <tbody  id="tbody">

            </tbody>
        </table>
    </div>
<!-- 分页 -->
    <div id="demo1"></div>
@endsection

@section("inline-bottom")
    <script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
    <script src="/statics/custom/js/language_management/lmUrl.js?v={{$release}}"></script>
    <script src="/statics/custom/js/language_management/lm.js?v={{$release}}"></script>
@endsection