{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
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
                                    <label class="el-form-item-label" style="width: 100px;">创建人</label>
                                    <input type="text" id="create_name" class="el-input" placeholder="请输入创建人" value="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item" style="position: relative;">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                            <button style="margin-left:10px; "><a id="abnormal_link" class="button button_action button_export" download="异常单导出"  href="/abnormal/exportExcel?_token=8b5491b17a70e24107c89f37b1036078">异常单导出</a></button>
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
                                退回状态
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                编号
                            </div>
                        </th>
                        <th>
                            物料编码
                        </th>
                        <th>
                            责任单位
                        </th>
                        <th>
                            责任人
                        </th>
                        <th>
                            问题描述
                        </th>
                        <th>
                            临时应急措施
                        </th>
                        <th>
                            根本原因
                        </th>
                        <th>
                            最终解决办法
                        </th>
                        <th>
                            改善措施的结果跟踪
                        </th>
                        <th>
                            创建人
                        </th>
                        <th>
                            回复时间
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
    <script src="/statics/custom/js/qc/abnormal/qc-abnormal-reply.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
@endsection