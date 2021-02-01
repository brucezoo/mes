{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/invalidcost.css">
@endsection


{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
  <input type="hidden" id="template_create" value="/QC/templateCreate">
  <div class="actions">
    <button class="button button_action add"><i class="fa fa-plus"></i>添加</button>
  </div>
  <div class="searchItem" id="searchForm">
    <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
      <div class="el-item">
        <div class="el-item-show">
          <div class="el-item-align">
            <div class="el-form-item">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">名称</label>
                <input type="text" id="itemName" class="el-input" placeholder="请输入名称" value="">
              </div>
            </div>
          </div>
        </div>
        <div class="el-form-item">
          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
            <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
            <button type="button" class="el-button reset">重置</button>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="table_page">
    <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
      <table id="table_type_table" class="uniquetable">
        <thead>
          <tr>
            <th>名称</th>
            <th class="right">操作</th>
          </tr>
        </thead>
        <tbody class="table_tbody">
          <tr>
            <td style="text-align: center;" colspan="2">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div id="pagenation" class="pagenation bottom-page"></div>
  </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/invalidCost/processingMethodList.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
@endsection