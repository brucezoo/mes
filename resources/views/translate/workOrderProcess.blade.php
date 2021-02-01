{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link rel="stylesheet" href="/statics/common/layui/css/layui.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<style>
	#ser-content {
		width: 100%;
		background: #ffffff;
		border-radius: 5px;
	}

	#display {
		width: 100%;
		display: flex;
		margin-top: -8px !important;
	}

	#display>div {
		flex: 1;
		display: flex;
	}

	#display>div .lab {
		flex: 4;
	}

	#display>div .inp {
		flex: 6;
	}

	#none {
		width: 100%;
		display: flex;
	}

	#none>div {
		flex: 1;
	}

	#none>div>.layui-form-item {
		display: flex;
		margin-top: 10px;
	}

	#none>div>.layui-form-item>.lab {
		flex: 4;
	}

	#none>div>.layui-form-item>.inp {
		flex: 6;
	}

	.lab {
		margin-left: 10px;
		margin-top: 10px;
	}

	.inp {
		margin-right: 10px;
	}

	.act {
		background: #F8F8FF !important;
	}

	.layui-form-item {
		padding-top: 10px;
		margin-bottom: 10px;
	}

	#display>.layui-form-item {
		margin-bottom: 0px;
	}

	#i {
		cursor: pointer;
		margin-left: 10px;
	}

	#mid-content {
		display: flex;
		width: 100%;
		margin-top: 20px;
	}

	#ser-contents {
		flex: 5.5;
		position: relative;
	}

	#ser-contents>div {
		position: absolute;
		top: -12px;
		z-index: 8888;
	}

	#btn {
		flex: 4.5;
	}


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
<div>
	<div id="mid-content">
		<div id="ser-contents">
			<div id="ser-content">
				<div style="height: 10px"></div>
				<div id="display">
					<div class="layui-form-item">
						<div class="lab">
							<label class="">Sales Order</label>
						</div>
						<div class="inp">
							<input id="salesOrder" type="text" placeholder="Please enter the Sales Order" name="title" lay-verify="title" autocomplete="off" class="layui-input">
						</div>
					</div>
					<div class="layui-form-item">
						<div class="lab">
							<label class="">Sales Order Item</label>
						</div>
						<div class="inp">
							<input id="salesOrderItem" type="text" name="title" placeholder="Please enter the Sales Order Item" lay-verify="title" autocomplete="off" class="layui-input">
						</div>
					</div>
				</div>
				<div id="none" style="display: none">
					<div>
						<div class="layui-form-item ishow">
							<div class="lab">
								<label class="">Production Order</label>
							</div>
							<div class="inp">
								<input id="productionOrder" type="text" name="title" placeholder="Please enter the Production Order" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item">
							<div class="lab">
								<label class="">Production State</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="" id="dds">
									<select name="interest" lay-filter="aihao" id="psState">
										<option value="">Please Select</option>
										<option value="0">Not Line</option>
										<option value="1">Main Line</option>
										<option value="2">Fine Line</option>
									</select>
								</form>
							</div>
						</div>
						<div class="layui-form-item">
							<div class="lab">
								<label class="">Shift</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="" id="dds">
									<select name="interest" lay-filter="aihao" id="shift">
	
									</select>
								</form>
							</div>
						</div>
					</div>
					<div>
						<div class="layui-form-item ishow">
							<div class="lab">
								<label class="">Work Order</label>
							</div>
							<div class="inp">
								<input id="workOrder" type="text" name="title" placeholder="Please enter the WOrk Order" lay-verify="title" autocomplete="off" class="layui-input">
							</div>
						</div>
						<div class="layui-form-item">
							<div class="lab">
								<label class="">Process</label>
							</div>
							<div class="inp">
								<form class="layui-form" action="" id="dds">
									<select name="interest" lay-filter="aihao" id="process">

									</select>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div id="btn">
			<i class="layui-icon layui-icon-down" id="i"></i>
			<button type="button" id="search" class="layui-btn layui-btn-normal" style="margin-left:20px;">Search</button>
			<button type="button" id="reset" class="layui-btn layui-btn-primary">Reset</button>
		</div>
	</div>

	<div style="margin-top: 30px;">
		<table class="layui-table">
			<thead>
				<tr>
					<th>Change</th>
					<th>Sales Order / Sales Order Item</th>
					<th>Production Order</th>
					<!-- <th>Worker Order</th> -->
					<th>Finished Product code</th>
					<th>Finished Goods</th>
					<th>Number </th>
					<th>Workshop</th>
					<!-- <th>Work Center</th> -->
					<th>Location</th>
					<th>Factory</th>
					<!-- <th>Plan Date</th> -->
					<!-- <th>BOM Version</th> -->
					<!-- <th>Order Status</th> -->
					<!-- <th>Production State</th> -->
					<th>Operation</th>
				</tr>
			</thead>
			<tbody id="tbody">

			</tbody>
		</table>
	</div>
	<div id="demo2"></div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js"></script>
<script src="/statics/custom/js/version/wprocess.js"></script>
@endsection