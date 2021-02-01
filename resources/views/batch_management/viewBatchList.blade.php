{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
@endsection
<!-- 批次追溯报表 -->
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
  <!-- <div class="tap-btn-wrap">
    <div class="el-tap-wrap edit">
      <span data-status="1" class="el-tap active">正向追溯</span>
      <span data-status="2" class="el-tap">反向追溯</span>
      <span data-status="3" class="el-tap">序列号追溯</span>
    </div>
  </div> -->
  <div class="searchItem" id="searchForm">
    <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
      <div class="el-item">
        <div class="el-item-show" style="width:1000px;">
          <div class="el-item-align">
            <div class="el-form-item work-center" style="margin-bottom:0px;width:33.3%;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">工作中心</label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="work_center_id" value="">
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                      <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p class="errorMessage" style="padding-left: 100px;display:block;"></p>
            </div>
            <div class="el-form-item work-bench" style="margin-bottom:0px;width:33.3%;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">工位</label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="work_bench_id" value="">
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                      <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p class="errorMessage" style="padding-left: 100px;display:block;"></p>
            </div>
            <div class="el-form-item rank-plan" style="margin-bottom:0px;width:33.3%;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">班组</label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="rank_plan_id" value="">
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                      <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p class="errorMessage" style="padding-left: 100px;display:block;"></p>
            </div>
          </div>
        </div>
        <div class="el-form-item">
          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
            <!-- <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span> -->
            <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
            <button type="button" class="el-button reset">重置</button>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="table_page">
    <div class="wrap_table_div">
      <table id="batch_list_table" class="sticky uniquetable commontable">
        <thead>
          <tr>
            <th>工单号</th>
            <th>物料编码</th>
            <th>物料描述</th>
            <th>门幅</th>
            <th>长度</th>
            <th>计量</th>
            <th>重量</th>
            <th class='text-right'>操作</th>
          </tr>
        </thead>
        <tbody class="table_tbody">
          <tr><td colspan="8" class="center">暂无数据</td></tr>
        </tbody>
      </table>
    </div>
    <div id="pagenation" class="pagenation bottom-page"></div>
  </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/ace/assets/js/moment.min.js"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/batch/batch_url.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
<script src="/statics/custom/js/batch/viewBatchList.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection