{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<!-- <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/otherinstore.css?v={{$release}}"> -->
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="storage_wrap">
    <div class="tap-btn-wrap">
        <div class="el-form-item btnShow saveBtn">
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
            <div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">销售订单号<span class="mustItem">*</span></label>
                        <input type="text" id="sale_order_code" readonly class="el-input" placeholder="请输入销售订单" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">工单号<span class="mustItem">*</span></label>
                        <input type="text" id="wo_number" readonly class="el-input" placeholder="请输入工单号" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>

            </div>

            <div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">销售行项号<span class="mustItem">*</span></label>
                        <input type="text" id="sales_order_project_code" readonly class="el-input" placeholder="请输入销售行项号" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: 20px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">生产订单号<span class="mustItem">*</span></label>
                        <input type="text" id="po_number" readonly class="el-input" placeholder="请输入生产订单号" value="">
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
        <div>
            <div class="storage_blockquote">
                <h4>明细 <button type="button" id="edit-add-btn" class="storage-button storage-add-item storage-add-new-item">添加明细</button></h4>
                <div class="basic_info">
                  <div class="table-container">
                    <table class="storage_table item_table">
                      <thead>
                        <tr>
                          <th class="thead">销售订单号</th>
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
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}
"></script>
<script src="/statics/custom/js/storage/storage-move-edit.js?v={{$release}}"></script>
@endsection