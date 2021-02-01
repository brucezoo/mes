{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/work_hour.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/device/device.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/ace/assets/css/chosen.min.css" />
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div_con_wrapper">
    <div class="actions" style="padding-bottom: 10px; border-color:#fff1f1">
        操作：
        <button class="button" id="add_member" style="margin-right: 5xp;">添加成员</button>
        <div class="searchItem" id="searchForm" style="float:right">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show" style="margin-top:-10px;">
                        <div class="el-item-align" style="float:right;">
                            <div class="el-form-item" style="width:100%">
                                <div class="el-form-item-div">
                                    <input type="text" id="device_code" class="el-input" placeholder="搜索 请输入 关键词" value="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: -4px;">
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="actions" style="padding-bottom: 10px; margin-top: 8px; border-color:#fff1f1">
        选中：
        <button id="member_notice" class="button" style="margin-right: 9px;">通知</button>
        <button id="member_edit" class="button" style="margin-right: 5px;">更改</button>
        <button id="member_remove" class="button" style="margin-right: 5px;">移出</button>
    </div>
    <div class="table_page">
        <div class="wrap_table_div">
            <table id="workhour_table" class="table table-bordered table-hover" style="width:100%; margin-top:-9px">
                <thead>
                <tr>
                    <th>
                    <div class="checkbox no-margin">
                        <label>
                            <input name="selectCheckboxAll" type="checkbox" class="ace" />
                            <span class="lbl"></span>
                        </label>
                    </div>
                    </th>
                    <th class="left nowrap tight">姓名</th>
                    <th class="left nowrap tight">手机号码</th>
                    <th class="left nowrap tight">部门</th>
                    <th class="left nowrap tight">班组</th>
                    <th class="left nowrap tight">擅长</th>
                </tr>
                </thead>
                <tbody class="table_tbody">

                </tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/ace/assets/js/chosen.jquery.min.js"></script>
    <script src="/statics/common/pagenation/pagenation.js"></script>
    <script src="/statics/common/ace/assets/js/tree.min.js"></script>
    <script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/device/device-member.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
@endsection