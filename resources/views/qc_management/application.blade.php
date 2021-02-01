{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}" >
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div class="actions">
		<button class="button pop-button download-template" style='float: right;margin-top:22px;'>下载模板</button>
		<button class="button pop-button push-ids" style='float: right;margin-top:22px;'>推送</button>
		<div tabindex="500" style="margin-top:8px;" class="btn btn-primary btn-file" style="display: ${flag !== 'upload' ? 'none': ''};">
			<i class="fa fa-folder-open"></i>
			<span class="hidden-xs">订单导入</span>
			<input id="attachment" name="attachment" type="file" class="file" data-preview-file-type="text">
		</div>
		<!-- 添加批量删除按钮   2019/11/28 -->
		<button class="button pop-button del-all" style='margin-top:20px;'>批量删除</button>
	</div>

	<div class="table_page">
		<div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
			<table id="application_table" class="sticky uniquetable commontable">
				<thead>
					<tr>
						<th class="nowrap tight"></th>
						<th class="nowrap tight">验货日期</th>
						<th class="nowrap tight">销售订单号</th>
						<th class="nowrap tight">销售行项目号</th>
						<th class="nowrap tight">物料编码</th>
						<th class="nowrap tight">客户编码</th>
						<th class="nowrap tight">客户</th>
						<th class="nowrap tight">厂区</th>
						<th class="nowrap tight">推送状态</th>
						<th class="nowrap tight">申请人</th>
					</tr>
				</thead>
				<tbody class="table_tbody"></tbody>
			</table>

			<div id="pagenation" class="pagenation bottom-page"></div>
		</div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/qc_inspection/application.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
@endsection