
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action" id="sendAll"><i class="fa fa-search-plus"></i>批量推送</button>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="addSpecial_form">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">名称</label>
                                    <input type="text" id="name" class="el-input" placeholder="请输入名称" value="">
                                </div>
                            </div>

                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">边角料物料号</label>
                                    <input type="text" id="MATNR" class="el-input" placeholder="请输入边角料物料号" value="">
                                </div>
                            </div>
                        </div>

                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">工厂</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select factory_id">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="factory_id" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id=" " class="el-select-dropdown-item">--请选择--</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">创建人</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select creator_id">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="creator_id" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id=" " class="el-select-dropdown-item">--请选择--</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>

                            <li>
                                <div class="el-form-item" style="width: 100%;">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">日期筛选</label>
                                        <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                        <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                     </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
                <table id="practice_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th class="left nowrap tight">
                            <span class="el-checkbox_input" id="choose_all">
                                <span class="el-checkbox-outset"></span>
                            </span>
                        </th>
                        <th class="left nowrap tight">编码</th>
                        <th class="left nowrap tight">数量</th>
                        <th class="left nowrap tight">单位</th>
                        <th class="left nowrap tight">边角料物料号</th>
                        <th class="left nowrap tight">称重日期</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="left nowrap tight">创建日期</th>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">创建人</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/offcut/offcut_url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/offcut/offcut_weight.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
@endsection

