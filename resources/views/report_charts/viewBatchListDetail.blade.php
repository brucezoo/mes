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
            <th>序列号</th>
            <th>批次号</th>
            <th>品种</th>
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
<script src="/statics/custom/js/reportCharts/viewBatchListDetail.js?v={{$release}}"></script>
@endsection