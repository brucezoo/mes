{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">

@endsection
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
    </div>
    <div class="table_page">
        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
            <table id="table_categories_table" class="uniquetable">
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>简要描述</th>
                        <th class="right">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style=" text-align: center;" colspan="3">暂无数据</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div id="win">
    
</div>

@endsection

@section("inline-bottom")
<script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material_basic/material-class.js?v={{$release}}"></script>
@endsection