{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/qc.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}" >
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/device/upkee-require.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <!-- <div class="actions">
            <button class="button button_action button_add">添加</button>
        </div> -->
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchQualityResume">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                                    <input type="text" id="material_code" class="el-input" placeholder="物料编码" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">采购仓储</label>
                                    <input type="text" id="LGFSB" class="el-input" placeholder="采购仓储" value="">
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">销售订单</label>
                                        <input type="text" id="sales_order_code" class="el-input" placeholder="销售订单" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">销售订单行项</label>
                                        <div class="el-select-dropdown-wrap">
                                            <input type="text" id="sales_order_project_code" class="el-input" autocomplete="off" placeholder="销售订单行项" value="">
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">检验来源</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="type" value="0">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                    <li data-id="2" data-code="" data-name="--客诉--" class=" el-select-dropdown-item">--客诉--</li>
                                                    <li data-id="1" data-code="" data-name="--生产--" class=" el-select-dropdown-item">--生产--</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">是否删除</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="is_delete" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                    <li data-id="0" data-code="" data-name="--未删除--" class=" el-select-dropdown-item">--未删除--</li>
                                                    <li data-id="1" data-code="" data-name="--已删除--" class=" el-select-dropdown-item">--已删除--</li>
                                                </ul>
                                            </div>
                                        </div>
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
                            <button type="button" class="el-button export">导出</button>
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
                        <!-- 修改  添加是否加急 7/23-->
                        <!-- <th>
                            <div class="el-sort">
                                 是否加急
                            </div>
                        </th>-->
                        <th>
                            <div class="el-sort">
                                检验单号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                检验来源
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                销售订单/行项
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                物料编码
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                物料属性
                            </div>
                        </th>

                        <th>
                            <div class="el-sort">
                                创建人
                            </div>
                        </th>


                        <th>
                            <div class="el-sort">
                                检验时间
                            </div>
                        </th>

                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody" style="table-layout:fixed"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/qualityResume/quality-resume-list.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-client-sap.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>

@endsection
