{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div >
        <div class="el-form-item" style="padding-right: 10px">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button el-button--primary submit-save">保存</button>
            </div>
        </div>

        <div id="bom-replace-container">

        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/bom/bom-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js"></script>
    <script src="/statics/custom/js/bom/bom-replace.js?v={{$release}}"></script>
@endsection
