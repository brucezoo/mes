{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/personnel/personnel.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div class="tap-btn-wrap">
		<div class="actions">
			<button class="button" id="importExcel"><i class="fa fa-plus"></i>订单导入</button>
			<button class="button pull-button" id="pull"><i class="fa fa-hourglass-1">拉取需清除订单</i></button>
			<button class="delete-All" id="delete">全部删除</button>
			<button class="export"><a id="exportExcel">导出未删除订单</a></button>
		</div>
	</div>
	<div class="table_page">
		<div class="wrap_table_div">
			<table id="product_order_table" class="sticky uniquetable commontable">
				<thead>
					<tr>
						<th>
							<div class="el-sort">
								生产订单号
							</div>
						</th>
					</tr>
				</thead>
				<tbody class="table_tbody">
				</tbody>
			</table>
		</div>
		<div id="pagenation" class="pagenation bottom-page"></div>
	</div>
</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/layui/layui.all.js"></script>
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/common/js-xlsx/xlsx.full.min.js"></script>
    <script src="/statics/common/fileinput/fileinput.js"></script>
    <script src="/statics/common/fileinput/locales/zh.js"></script>
    <script type="text/javascript" src="/statics/custom/js/product_order/tool-url.js?v={{$release}}"></script>
    <script type="text/javascript" src="/statics/custom/js/product_order/deleteProductOrder.js"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>

@endsection