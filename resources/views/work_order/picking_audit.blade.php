{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<!-- <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/otherinstore.css?v={{$release}}"> -->
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="storage_wrap">
  <div class="tap-btn-wrap">
    <div class="el-form-item btnShow saveBtn">
      <div class="el-form-item-div btn-group">
        <button type="button" class="el-button el-button--primary submit confirmDeletion" style="margin-right: 20px; margin-bottom: 10px;">确认删除</button>
        <button type="button" class="el-button el-button--primary submit rejectDeletion" style="margin-right: 20px; margin-bottom: 10px;">驳回删除</button>
        <button type="button" class="el-button el-button--primary submit audit" style="margin-right: 20px; margin-bottom: 10px;display: none">审核</button>
        <button type="button" class="el-button el-button--primary submit anti-audit" style="margin-right: 20px; margin-bottom: 10px;display: none">反审</button>
      </div>
    </div>
  </div>
</div>
<input type="hidden" id="status">
<form id="addSBasic_form" class="formTemplate formStorage normal">
  <h3 id="picking_title"></h3>
  <div class="storage_blockquote">
    <h4>工单信息</h4>
    <div id="basic_form_show" class="basic_info" style="display: flex;">
    </div>
  </div>
  <div class="storage_blockquote">
    <h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细</h4>
    <div class="basic_info">
      <div class="table-container">
        <table class="storage_table item_table table-bordered">
          <thead>
            <tr>
              <th class="thead" id="salere">销售订单</th>
              <th class="thead">编码</th>
              <th class="thead">名称</th>
              <th class="thead" id="rbqty_show">计划数量</th>
              <th class="thead" id="rbqty">补料数量</th>
              <th class="thead" id="runit">补料单位</th>
              <th class="thead" id="deport" style="display: none">仓库</th>
              <th class="thead">补料比例</th>
              <th class="thead" id="cause" style="display: none;">生产补料原因</th>
              <th class="thead" id="cause">QC补料原因</th>
              <th class="thead" id="causeRemark" style="display: none;">备注</th>
              <th class="thead" id="totalNum" style="display: none;">补料总数量</th>
              <th class="thead" id="totalRadio" style="display: none;">补料总比</th>
              <th class="thead" id="operation"></th>
            </tr>
          </thead>
          <tbody class="t-body" id="show_item">
            <tr>
              <td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div style="background-color: #fff;padding: 10px;border-radius: 4px;margin: 10px;" id="storage_item">
    
  </div>
</form>
@endsection
@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/audit_for_picking_list.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>

@endsection