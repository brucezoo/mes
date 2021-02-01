{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="storage_wrap">
        <div class="tap-btn-wrap">
            <div class="el-form-item btnShow saveBtn">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button el-button--primary save" style="margin-right: 20px; margin-bottom: 10px;">保存</button>
                    <button type="button" class="el-button el-button--primary print" style="margin-right: 20px; margin-bottom: 10px;">打印</button>
                </div>
            </div>
        </div>
        <form id="addSBasic_form" class="formTemplate formStorage normal">
            <h3 id="picking_title"></h3>
            <div class="storage_blockquote">
                <h4>工单信息</h4>
                <div id="basic_info_show" class="basic_info" style="display: flex;">
                    <div>
                        <div class="el-form-item plant" style="margin-bottom: 12px;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">厂区<span class="mustItem">*</span></label>
                                <div class="divwrap" style="width: 100%;">
                                    <input type="text" id="plant_id" autocomplete="off" class="el-input" placeholder="请输入厂区名称">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item workbench" style="margin-bottom: 12px;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工位</label>
                                <div class="divwrap" style="width: 100%;">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
                                            <input type="hidden" class="val_id" id="workbench_code" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item" id="storage_wo_selete">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">采购仓储</label>
                                <input type="text" id="depot" class="el-input" autocomplete="off" placeholder="请输入采购仓储" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>

                    </div>
                    <div>
                        <div class="el-form-item workshop" style="margin-bottom: 12px;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">车间</label>
                                <div class="divwrap" style="width: 100%;">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
                                            <input type="hidden" class="val_id" id="shop_id" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item" id="storage_wo_selete">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">线边仓<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="storage_wo" class="el-input" autocomplete="off" placeholder="请输入线边仓" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item" style="margin-top: 10px;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">配送时间<span class="mustItem">*</span></label>
                                <input type="text" autocomplete="off" readonly class="layui-input el-input" id="time">
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>

                    </div>
                    <div>
                        <div class="el-form-item workcenter" style="margin-bottom: 12px;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">工作中心</label>
                                <div class="divwrap" style="width: 100%;">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
                                            <input type="hidden" class="val_id" id="center_id" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item RankPlan" style="margin-bottom: 12px;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">班次</label>
                                <div class="divwrap" style="width: 100%;">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" readonly value="--请选择--" style="width:100%">
                                            <input type="hidden" class="val_id" id="RankPlan" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div" style="margin-top: 10px;">
                                <label class="el-form-item-label">责任人<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <input type="text" id="employee" autocomplete="off" class="el-input" placeholder="请输入责任人" value="">
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 30px;"></p>
                        </div>

                    </div>
                </div>
            </div>
            <div class="storage_blockquote">
                <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细 <button type="button" class="el-button el-button--primary add_materials">添加物料</button> </h4>
                <p id="show_num" style="color: red;display: none"></p>
                <div class="basic_info">
                    <div class="table-container">
                        <table class="storage_table item_table table-bordered">
                            <thead>
                            <tr>
                                <th>
                                    <div class="el-sort">
                                        物料编码
                                        <span class="caret-wrapper">
                                    <i data-key="item_no" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="item_no" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                                    </div>
                                </th>
                                <th>
                                    <div class="el-sort">
                                        浪潮物料编码
                                    </div>
                                </th>
                                <th>
                                    浪潮销售单号
                                </th>
                                <th>
                                    名称
                                </th>
                                <th>
                                    创建人
                                </th>
                                <th>
                                    <div class="el-sort">
                                        物料分类
                                        <span class="caret-wrapper">
                                    <i data-key="category_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="category_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                                    </div>
                                </th>
                                <th>
                                    <div class="el-sort">
                                        物料模板
                                        <span class="caret-wrapper">
                                    <i data-key="template_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="template_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                                    </div>
                                </th>
                                <th>
                                    <div class="el-sort">
                                        创建时间
                                        <span class="caret-wrapper">
                                    <i data-key="ctime" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="ctime" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                                    </div>
                                </th>
                                <th>
                                    <div class="el-sort">
                                        修改时间
                                        <span class="caret-wrapper">
                                    <i data-key="mtime" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="mtime" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                                    </div>
                                </th>
                                <th>
                                    数量
                                </th>
                                <th>
                                    BOM单位
                                </th>
                                <th>
                                    复制
                                </th>
                                <th>
                                    删除
                                </th>
                            </tr>
                            </thead>

                            <tbody class="t-body" style="overflow: auto" >
                            <tr>
                                <td class="nowrap" colspan="13" style="text-align: center;">暂无数据</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </form>
        <div id="print_list" style="display: none;"></div>
    </div>

@endsection
@section("inline-bottom")
    <script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
    <script src="/statics/custom/js/validate.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/picking/picking-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/picking/addPickingNewAllItems.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection