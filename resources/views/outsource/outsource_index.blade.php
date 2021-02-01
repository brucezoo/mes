{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
{{--<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">--}}
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div class="div_con_wrapper">
	<div class="searchItem" id="searchForm">
		<input type="text" id="add_check_checkbox" value="" style="display: none;">
		<form class="searchOutsource searchModal formModal" id="outsource_from">
			<div class="el-item">
				<div class="el-item-show">
					<div class="el-item-align">
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label" style="width: 100px;">销售订单号</label>
								<input type="text" id="search_VBELN" class="el-input" style="width:160px;" placeholder="请输入销售订单号" value="">
								<input type="text" id="hx_code" class="el-input" style="width:120px;margin-left:5px;" placeholder="请输入行项号" value="">
							</div>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label" style="width: 100px;">采购凭证编号</label>
								<input type="text" id="search_EBELN" class="el-input" placeholder="请输入采购凭证编号" value="">
							</div>
						</div>
					</div>
					<ul class="el-item-hide">
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">采购组</label>
									<input type="text" id="search_EKGRP" class="el-input" placeholder="请输入采购组" value="">
								</div>
							</div>

							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">公司代码</label>
									<input type="text" id="search_BUKRS" class="el-input" placeholder="请输入公司代码" value="">
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 150px;">供应商或债权人的帐号</label>
									<input type="text" id="search_LIFNR" class="el-input" placeholder="请输入供应商或债权人的帐号" value="">
								</div>
							</div>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">关闭状态</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select check_status">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="closeStatus" value="">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">
												<li data-id=" " class=" el-select-dropdown-item">--请选择--</li>
												<li data-id="0" class=" el-select-dropdown-item">开启</li>
												<li data-id="1" class=" el-select-dropdown-item">关闭</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</li>
						<li>
							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">报工推送状态</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select audit_status">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="auditStatus" value="">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">
												<li data-id=" " class=" el-select-dropdown-item">--请选择--</li>
												<li data-id="2" class=" el-select-dropdown-item">已全部推送</li>
												<li data-id="1" class=" el-select-dropdown-item">未全部推送</li>
											</ul>
										</div>
									</div>
								</div>
							</div>

							<div class="el-form-item">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">领料状态</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select actual_send_qty">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="actual_send_qty" value="">
										</div>
										<div class="el-select-dropdown">
											<ul class="el-select-dropdown-list">
												<li data-id=" " class=" el-select-dropdown-item">--请选择--</li>
												<li data-id="1" class=" el-select-dropdown-item">已领料</li>
												<li data-id="2" class=" el-select-dropdown-item">未领料</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</li>

						<li>
							<div class="el-form-item" style="width: 100%;">
								<div class="el-form-item-div">
									<label class="el-form-item-label" style="width: 100px;">日期筛选</label>
									<span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
									<span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
								</div>
							</div>
						</li>
					</ul>
				</div>

				<div class="el-form-item">
					<div class="el-form-item-div btn-group" style="margin-top: 10px;">
						<span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
						<button type="button" class="el-button el-button--primary submit">搜索</button>
						<button type="button" class="el-button reset">重置</button>
						<button type="button" class="el-button export">导出</button>
						<button id="audit" type="button" class="el-button">合并报工</button>

						<div class="btn-group" style="margin-left:10px;">
							<button type="button" class="el-button" data-toggle="dropdown">功能 <span class="caret"></span></button>
							<ul class="dropdown-menu" style="right: 0;left: auto" role="menu">
								<li id="combine"><a href="javascript:;">合并领料</a></li>
								<li id="combineShop"><a href="javascript:;">合并车间领料</a></li>
								<li data-code="ZB03" type="button" class="out-combine"><a href="javascript:;">合并补料</a></li>
								<li data-code="ZY06" type="button" class="out-combine"><a href="javascript:;">合并定额退料</a></li>
								<li data-code="ZY05" type="button" class="out-combine"><a href="javascript:;">合并超耗补料</a></li>
								<li data-code="ZY04" type="button" class="out-combine"><a href="javascript:;">合并超发退料</a></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
	<div class="table_page">
		<div class="wrap_table_div" style="height: 500px; overflow-y: auto; overflow-x: hidden;">
			<table id="outsource_table" class="sticky uniquetable commontable">
				<thead>
					<tr>
						<th>
							<span class="el-checkbox_input el-checkbox_checkAll">
								<span class="el-checkbox-outset"></span>
							</span>
						</th>
						<th>销售订单号/行项号</th>
						<th>采购凭证编号</th>
						<th>采购凭证类别</th>
						<th>采购凭证类型</th>
						<th>供应商或债权人的帐号</th>
						<th>供应商或债权人的名称</th>
						<th>采购组</th>
						<th>工序</th>
						<th>发料状态</th>
						<th>收料状态</th>
						<th>流转品领料状态</th>
						<th>报工推送状态</th>
						<th>报工状态</th>
						<th>推送数量</th>
						<th>采购订单数量</th>
						<th>物料编码</th>
						<th>半成品详情</th>
						<th>工序结束时间</th>
						<th class="right">操作</th>
					</tr>
				</thead>
				<tbody class="table_tbody">
				</tbody>
			</table>
		</div>
		<div id="total_wp" style="float:right; display:none;"></div>
		<div id="pagenation" class="pagenation bottom-page"></div>
	</div>
	<div class="item_table_page" style="margin-top: 30px;">
		<div class="tap-btn-wrap">
			<div class="el-tap-wrap edit">
				<span data-status="5" data-code="ZY03" class="el-item-tap active">委外定额领料</span>
				<span data-status="4" data-code="ZB03" class="el-item-tap">委外补料</span>
				<span data-status="3" data-code="ZY06" class="el-item-tap">委外定额退料</span>
				<span data-status="2" data-code="ZY05" class="el-item-tap">委外超耗补料</span>
				<span data-status="1" data-code="ZY04" class="el-item-tap">委外超发退料</span>
			</div>
		</div>
		<div class="show_item_table_page" style="height: 300px; overflow-y: auto; overflow-x: hidden;">

		</div>

	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/outsource/outsource_order.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>

@endsection