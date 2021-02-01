
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button id="ability_add" class="button"><i class="fa fa-plus"></i>添加</button>
        <div style = "float:right; margin-top:-5px;">
            <label>语言:</label>
            <select style="width:150px;" id="list">
                <option value="">-- 请选择 --</option>
            </select>
            <button style="margin-left:10px;" id="translate">翻译</button>
        </div>
    </div>
    <div class="table_page">
        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
            <table id="ability_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight">编码</th>
                    <th class="left nowrap tight">名称</th>
                    <th class="left nowrap tight">描述</th>
                    <th class="right nowrap tight">操作</th>
                </tr>
                </thead>
                <tbody class="table_tbody"></tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/procedure/procedure-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/procedure/ability.js?v={{$release}}"></script>
@endsection

