{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/personnel/personnel.css?v={{$release}}">
<style>
	input[type="checkbox"] {
		/* display: inline-block; // 设置为 行内块 就能改变大小了 */
		width: 20px !important;
		height: 20px !important;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: #fff;
		border-radius: 3px;
		border: 1px solid #888;
		background-image: url("/statics/custom/img/xz.png") !important;
		background-size: 0px 0px;
	}

	input[type="checkbox"]:checked {
		background-image: url("/statics/custom/img/xz.png") !important;
		background-size: 100% 100%;
	}
</style>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">

	<div class="actions">
		<button id="job_add" class="button"><i class="fa fa-plus"></i>添加</button>
	</div>

	<div class="table_page">
		<div class="pagenation_wrap">
			<div id="pagenation" class="pagenation"></div>
		</div>
		<div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
			<table id="table_job_table" class="sticky uniquetable commontable">
				<thead>
					<tr>
						<th class="left nowrap tight">名称</th>
						<th class="left nowrap tight">缩写</th>
						<th class="left nowrap tight">描述</th>
						<th class="right nowrap tight">操作</th>
					</tr>
				</thead>
				<tbody class="table_tbody">

				</tbody>
			</table>
		</div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/personnel/personnel-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/personnel/job.js?v={{$release}}"></script>
@endsection