{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action button_check"><i class="fa fa-add"></i>特采申请</button>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">编号</label>
                                    <input type="text" id="abnormalCode" class="el-input" placeholder="请输入编号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">责任人</label>
                                    <input type="text" id="responsible" class="el-input" placeholder="请输入责任人" value="">
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">创建人</label>
                                        <input type="text" id="create_name" class="el-input" placeholder="请输入创建人" value="">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">开始时间</label>
                                        <input type="text" id="start_time" class="el-input" placeholder="请输入开始时间" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">结束时间</label>
                                        <input type="text" id="end_time" class="el-input" placeholder="请输入结束时间" value="">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="el-form-item" style="position: relative;">
                        <div class="el-form-item-div btn-group" style="margin-top: 13px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                            <!-- <button type="button" class="el-button export" id="exportBtn"><a id='exportExcel'>导出</a></button> -->
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>
                                <div class="el-sort">
                                    编号
                                </div>
                            </th>
                            <th>
                                    审核人
                            </th>
                            <th>
                                <div class="el-sort">
                                    问题描述
                                </div>
                            </th>
                            <th>
                                    特采原因
                            </th>
                            <th>
                                    状态
                            </th>
                            <th>
                                    当前审核人
                            </th>
                            <th>
                                    创建人
                            </th>
                            <th>
                                    创建时间
                            </th>
                            <th class="right">
                                    操作
                            </th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/deviation/deviationApply.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
@endsection