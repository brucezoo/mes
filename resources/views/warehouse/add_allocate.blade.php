{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<!-- <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/otherinstore.css?v={{$release}}"> -->
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="storage_wrap">
    <div class="tap-btn-wrap">
        <div class="el-form-item btnShow saveBtn" style="right:0;">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary submit save" style="margin-right: 20px;">保存</button>
            </div>
        </div>
    </div>
</div>
<form id="addSBasic_form" class="formTemplate formStorage normal" style="margin-top: 30px;">
    <div class="storage_blockquote">
        <h4>调拨单信息</h4>
        <div class="basic_info">
            <div style="flex:4;">
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">编码<span class="mustItem">*</span></label>
                        <input type="text" id="code" class="el-input" placeholder="请输入编码" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: 30px;"></p>
                </div>
                <div class="el-form-item plant">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">厂区<span class="mustItem">*</span></label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="plantval" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="plant_id" value="">
                            </div>
                            <div class="el-select-dropdown" style="">
                                <ul class="el-select-dropdown-list">
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item depot">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">仓库<span class="mustItem">*</span></label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="depotval" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="depot_id" value="">
                            </div>
                            <div class="el-select-dropdown" style="">
                                <ul class="el-select-dropdown-list">
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
            </div>

            <div style="flex:4;">
                <div class="el-form-item subarea">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">分区</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="subareaval" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="subarea_id" value="">
                            </div>
                            <div class="el-select-dropdown" style="">
                                <ul class="el-select-dropdown-list">
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item bin">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">仓位</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="binval" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="bin_id" value="">
                            </div>
                            <div class="el-select-dropdown" style="">
                                <ul class="el-select-dropdown-list">
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">库存差异原因<span class="mustItem">*</span></label>
                        <div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="stockreason_id" class="stockreason_id"></div>
                        <button type="button" data-id="63394" class="button pop-button select">选择</button>
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
            </div>

            <div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">描述</label>
                        <textarea type="textarea" maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
            </div>
        </div>
        <div style="flex:3;">
            <div class="storage_blockquote">
                <h4>明细 <button type="button" id="edit-add-btn" class="storage-button storage-add-item storage-add-new-item">添加明细</button></h4>
                <div class="basic_info">
                  <div class="table-container">
                    <table class="storage_table item_table">
                      <thead>
                        <tr>
                          <th class="thead">销售订单号/行项号</th>
                          <th class="thead">生产订单号</th>
                          <th class="thead">工单号</th>
                          <th class="thead">物料编码</th>
                          <th class="thead">物料名称</th>
                          <th class="thead">批次</th>
                          <th class="thead">数量</th>
                          <th class="thead">单位</th>
                          <th class="thead">厂区</th>
                          <th class="thead">仓库</th>
                          <th class="thead">分区</th>
                          <th class="thead">仓位</th>
                          <th class="thead">简要描述</th>
                          <th class="thead">操作</th>
                      </tr>
                  </thead>
                  <tbody class="t-body">
                    <tr>
                        <td class="nowrap" colspan="14" style="text-align: center;">暂无数据</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-allocate-add.js?v={{$release}}"></script>
{{--<script src="/statics/custom/js/storage/storage-check-index.js?v={{$release}}"></script>--}}
@endsection