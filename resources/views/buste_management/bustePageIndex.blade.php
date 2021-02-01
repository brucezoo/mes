{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">

<input type="hidden" id="workOrder_view" value="/Buste/busteIndex">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
  <div class="actions">
    <a href="/Buste/busteIndex" class="el-button declare"><button type="button" class="el-button">快速报工</button></a>
    <button type="button" class="el-button" id="buste_all">批量推送</button>
  </div>
  <div class="el-panel-wrap" style="margin-top: 20px;">
    <div class="searchItem" id="searchForm">
      <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
        <div class="el-item">
          <div class="el-item-show">
            <div class="el-item-align">
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 109px;">生产订单号</label>
                  <input type="text" id="code" class="el-input" placeholder="请输入生产订单号" value="">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 109px;">工单号</label>
                  <input type="text" id="work_order_code" class="el-input" placeholder="请输入工单号" value="">
                </div>
              </div>
            </div>
            <ul class="el-item-hide">
              <li>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">销售订单号</label>
                    <input type="text" id="production_sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                  </div>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">销售行项号</label>
                    <input type="text" id="production_sales_order_project_code" class="el-input" placeholder="请输入销售行项号" value="">
                  </div>
                </div>
              </li>
              <li>
                <div class="el-form-item" style="width: 100%;">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">时间</label>
                    <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                    <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                  </div>
                </div>
              </li>
              <li>
                <div class="el-form-item">
                  <div class="el-form-item-div WERKS">
                    <label class="el-form-item-label" style="width: 109px;">工厂</label>
                    <div class="el-select-dropdown-wrap">
                      <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="WERKS" value="0">
                      </div>
                      <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                          <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div workshop">
                    <label class="el-form-item-label" style="width: 109px;">车间</label>
                    <div class="el-select-dropdown-wrap">
                      <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="workshop_id">
                      </div>
                      <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                          <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div class="el-form-item select_rank_plan">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">&nbsp;&nbsp;班次</label>
                    <div class="el-select-dropdown-wrap">
                      <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                        <input type="hidden" class="val_id" id="rankplan" value="" />
                      </div>
                      <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p class="errorMessage" style="padding-left: 100px;"></p>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">产成品编码</label>
                    <input type="text" id="item_no" class="el-input" placeholder="请输入产成品编码" value="">
                  </div>
                </div>
              </li>
              <li>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">状态</label>
                    <div class="el-select-dropdown-wrap">
                      <div class="el-select status">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="status" value="">
                      </div>
                      <div class="el-select-dropdown" style="display: none;">
                        <ul class="el-select-dropdown-list">
                          <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                          <li data-id="1" class=" el-select-dropdown-item">未发送</li>
                          <li data-id="2" class=" el-select-dropdown-item">报工完成</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">报工单号</label>
                    <input type="text" id="report_code" class="el-input" placeholder="请输入报工单号" value="">
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
              <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
              <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
              <button type="button" class="el-button reset">重置</button>
              <button type="button" class="el-button export"><a id="exportExcel">导出</a></button>
              <button type="button" class="el-button print">打印</button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <?php (session('administrator'))  ?>
    <div class="table_page">

    </div>
  </div>
  <div style="display:none;" id="print_list"></div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/buste_list.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/autocomplete/autocomplete.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-client-sap.js?v={{$release}}"></script>
@endsection