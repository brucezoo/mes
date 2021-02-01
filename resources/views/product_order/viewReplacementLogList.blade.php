{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<input type="hidden" id="workOrder_view" value="/WorkOrder/workOrderView">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div class="searchItem" id="searchForm">
		<form class="searchSTallo searchModal formModal" id="searchSTallo_from">
			<div class="el-item">
				<div class="el-item-show">
					<div class="el-item-align">
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label" style="width: 100px;">销售订单号</label>
								<input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
							</div>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label" style="width: 100px;">销售订单行项号</label>
								<input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项号" value="">
							</div>
						</div>
					</div>
					<ul class="el-item-hide">
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">生产订单号</label>
									<input type="text" id="production_order_number" class="el-input" placeholder="请输入生产订单号" value="">
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">工单号</label>
									<input type="text" id="work_order_number" class="el-input" placeholder="请输入工单号" value="">
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">物料编码</label>
									<input type="text" id="wl_code" class="el-input" placeholder="请输入物料编码" value="">
								</div>
							</div>
						</li>
					</ul>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div btn-group" style="margin-top: 10px;">
						<span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
						<button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
						<button type="button" class="el-button reset">重置</button>
					</div>
				</div>
			</div>
		</form>
	</div>
	<div class="table_page">
		<div class="wrap_table_div">
			<table id="replacement_log_table" class="sticky uniquetable commontable">
				<thead>
					<tr>
						<th>销售订单/行项</th>
						<th>生产订单</th>
						<th>工单号</th>
						<th>物料编码</th>
						<th>物料名称</th>
						<!-- <th>数量</th>
						<th>单位</th>
						<th>厂区</th>
						<th>工作中心</th> -->
						<th>替换来源</th>
						<th>物料替换</th>
						<th>操作人</th>
						<th>日期</th>
					</tr>
				</thead>
				<tbody class="table_tbody">
					<tr>
						<td colspan="8" style="text-align: center;">请先搜索！</td>
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
<script src="/statics/common/ace/assets/js/moment.min.js"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/viewReplacementList.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
@endsection