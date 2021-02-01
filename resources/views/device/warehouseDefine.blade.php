{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action button_check"><i class="fa fa-add"></i>添加</button>
        </div>
        <div class="table_page">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">名称</div>
                        </th>
                        <th>
                            <div class="el-sort">负责人</div>
                        </th>
                        <th>
                            <div class="el-sort">联系电话</div>
                        </th>
                        <th>
                            <div class="el-sort">默认 入库类型</div>
                        </th>
                        <th>
                            <div class="el-sort">默认 出库类型</div>
                        </th>
                        <th>
                            <div class="el-sort">备注</div>
                        </th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/pagenation/pagenation.js"></script>
    <script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/device/device-warehouse.js?v={{$release}}"></script>
@endsection