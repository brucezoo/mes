{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/storage.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
  <div class="actions">
   <button id="storage_add" class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
 </div>
 <div class="searchItem" id="searchForm">
  <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
    <div class="el-item">
      <div class="el-item-show">
        <div class="el-item-align">
          <div class="el-form-item">
            <div class="el-form-item-div">
              <label class="el-form-item-label">仓库编码</label>
              <input type="text" id="storageNum" class="el-input" placeholder="请输入仓库编码" value="">
            </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
              <label class="el-form-item-label">仓库名称</label>
              <input type="text" id="storageName" class="el-input" placeholder="请输入仓库名称" value="">
            </div>
          </div>
        </div>
      </div>
      <div class="el-form-item">
        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
          <button type="button" class="el-button el-button--primary submit">搜索</button>
          <button type="button" class="el-button reset">重置</button>
        </div>
      </div>
    </div>
  </form>
</div>
<div class="table_page">
  <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
   <table id="table_storage_table" class="sticky uniquetable commontable">
    <thead>
     <tr>
       <th class="left nowrap tight">仓库编码</th>
       <th class="left nowrap tight">仓库名称</th>
       <th class="left nowrap tight">所属部门</th>
       <th class="left nowrap tight">厂区</th>
       <th class="left nowrap tight">负责人</th>
       <th class="left nowrap tight">仓库电话</th>
       <th class="left nowrap tight">仓库地址</th>
       <th class="left nowrap tight">描述</th>
       <th class="right nowrap tight"></th>
     </tr>
   </thead>
   <tbody class="table_tbody"></tbody>
 </table>
</div>
<div id="pagenation" class="pagenation"></div>
</div>
</div>   
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-depot.js?v={{$release}}"></script>
@endsection

