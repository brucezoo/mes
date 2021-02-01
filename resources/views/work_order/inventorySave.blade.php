{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<!-- <link type="text/css" rel="stylesheet" href="/statics/custom/css/inventory/otherinstore.css?v={{$release}}"> -->
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/inventory/inventory.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="inventory_wrap">
  <div class="tap-btn-wrap">
    <div class="el-form-item btnShow saveBtn">
      <div class="el-form-item-div btn-group">
        <button type="button" class="el-button el-button--primary submit save">保存</button>
        <button type="button" class="el-button" onclick="javascript:history.back(-1);">返回</button>
      </div>
    </div>
  </div>
  <input type="hidden" id="status">
  <form id="addSBasic_form" class="formTemplate formStorage normal">
    <h3 id="picking_title"></h3>
    <div class="inventory_blockquote">
      <div style="display:flex;">
        <h4>清单信息</h4>
        <div style="flex:1;"></div>
        <div class="el-form-item employee">
          <div class="el-form-item-div" style="width:300px;">
            <label class="el-form-item-label">组号<span class="mustItem">*</span></label>
            <input type="text" data-id="" id="group" class="el-input" autocomplete="off" placeholder="请输入组号" value="">
          </div>
          
          <div class="el-form-item-div" style="width:300px;">
            <label class="el-form-item-label">负责人<span class="mustItem">*</span></label>
            <div class="el-select-dropdown-wrap">
              <input type="text" data-id="" id="employee" class="el-input" autocomplete="off" placeholder="请输入负责人" value="">
              <div class="el-select-dropdown" style="position:absolute;">
                <ul class="el-select-dropdown-list">
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="basic_form_show">
        <div class="basic_info">
          <div class="table-container">
            <table class="inventory_table item_table table-bordered">
              <thead>
                <tr>
                  <th class="thead salere">销售订单号/行项</th>
                  <th class="thead">生产订单</th>
                  <th class="thead">物料编码</th>
                  <th class="thead" style="width:280px;">规格</th>
                  <th class="thead">工作中心</th>
                  <th class="thead">数量</th>
                  <th class="thead">日期</th>
                  <th class="thead">备注</th>
                </tr>
              </thead>
              <tbody class="t-body show_wo_item">

              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="print_list" style="display: none;"></div>
    </div>
  </form>
</div>
@endsection
@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
<script src="/statics/custom/js/work_order/order-url.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/work_order/inventory_save.js?v={{$release}}"></script>

@endsection