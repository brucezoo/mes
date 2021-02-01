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
  <input type="hidden" id="workOrder_view" value="/ReportCharts/batchDetailList">
  <div class="tap-btn-wrap">
    <div class="el-tap-wrap edit">
      <span data-status="1" class="el-tap active">正向追溯</span>
      <span data-status="2" class="el-tap">反向追溯</span>
      <span data-status="3" class="el-tap">序列号追溯</span>
    </div>
  </div>
  <div class="searchItem" id="searchForm">
    <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
      <div class="el-item">
        <div class="el-item-show">
          <div class="el-item-align">
            <div class="el-form-item" style="margin-bottom:0px;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;" id="batchLabel">批次号</label>
                <input type="text" id="batch" class="el-input" placeholder="请输入批次号" value="">
              </div>
              <p class="errorMessage" style="padding-left: 100px;display:block;"></p>
            </div>
            <div class="el-form-item" style="margin-bottom:0px;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">物料编码</label>
                <input type="text" id="material_code" class="el-input" placeholder="请输入物料编码" value="">
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
            <th>销售订单号/行项号</th>
            <th>生产订单号</th>
            <th>工单号</th>
            <th>物料号</th>
            <th>物料描述</th>
            <th class="serial_code" style="display:none;">序列号</th>
            <th>批次号</th>
            <th>品种</th>
            <th class="operation">操作</th>
          </tr>
        </thead>
        <tbody class="table_tbody">
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
<script src="/statics/custom/js/reportCharts/reportChartsUrl.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/reportCharts/viewBatchList.js?v={{$release}}"></script>
@endsection