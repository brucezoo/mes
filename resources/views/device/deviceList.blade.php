{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/work_hour.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/device/device.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/select2.min.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div class="div_con_wrapper">
	<div class="actions">
		<button id="device_add" class="button"><i class="fa fa-plus"></i>添加</button>
		<!-- 添加批量删除按钮 7/29 start -->
		<button id="all-del" class="button">批量删除</button>
		<!-- end -->
		<button id="qrcodePrint" class="button">二维码打印</button>
		<input id="excel_file" type="file" name="file" style="display: none;" />
		<button type="button" style="height:26px; border-radius:4px;" class="layui-btn layui-btn-normal" id="test8">导入表</button>
		<button type="button" style="height:26px; border-radius:4px;" class="layui-btn" id="test9">上传</button>
	</div>
	<div class="searchItem" id="searchForm">
		<form class="searchMAttr searchModal formModal" id="searchMAttr_from">
			<div class="el-item">
				<div class="el-item-show">
					<div class="el-item-align">
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">设备编码</label>
								<input type="text" id="device_code" class="el-input" placeholder="请输入设备编码" value="">
							</div>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">设备名称</label>
								<input type="text" id="device_name" class="el-input" placeholder="请输入设备名称" value="">
							</div>
						</div>
					</div>
					<ul class="el-item-hide">
						<li>
							<div class="el-form-item deviceType">
								<div class="el-form-item-div">
									<label class="el-form-item-label">设备类别</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<i class="el-input-icon el-icon el-icon-caret-top"></i>
											<input type="text" readonly="readonly" class="el-input" value="--请选择--">
											<input type="hidden" class="val_id" id="device_type" value="">
										</div>
									</div>
								</div>
							</div>
							<div class="el-form-item department_name">
								<div class="el-form-item-div">
									<label class="el-form-item-label">使用部门</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<input type="text" id="department_name" class="el-input" placeholder="请输入部门名称" value="">
										</div>
									</div>
								</div>
							</div>
						</li>

						<!-- 修改 start 8/6 增加安装地点搜索条件 -->
						<li>
							<div class="el-form-item department_name">
								<div class="el-form-item-div">
									<label class="el-form-item-label">安装地点</label>
									<div class="el-select-dropdown-wrap">
										<div class="el-select">
											<input type="text" id="placement_address" class="el-input" placeholder="请输入地点名称" value="">
										</div>
									</div>
								</div>
							</div>
						</li>
						<!-- end -->
					</ul>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div btn-group" style="margin-top: 10px;">
						<span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
						<button type="button" class="el-button el-button--primary submit">搜索</button>
						<button type="button" class="el-button reset">重置</button>
					</div>
				</div>
			</div>
		</form>
	</div>
	<div class="table_page">
		<div class="wrap_table_div" style="min-height: 500px;overflow-x: scroll;">
			<table id="workhour_table" class="table table-bordered table-hover" style="width:1496px">
				<thead>
					<tr>
						<!-- 添加全选 7/29 start -->
						<th class="left nowrap tight" id="all-ok">
							<input type="checkbox" id="all-choice">
							<label for="all-choice" style="font-weight:600;margin-top:-5px;"> 全选</label>
						</th>
						<!-- end -->
						<th class="left nowrap tight">设备名称</th>
						<th class="left nowrap tight">设备编码</th>
						<th class="left nowrap tight">规格型号</th>
						<th class="left nowrap tight">安装地点</th>
						<th class="left nowrap tight">设备类别</th>
						<th class="left nowrap tight">使用部门</th>
						<th class="left nowrap tight">供应商</th>
						<th class="left nowrap tight">购置时间</th>
						<th class="left nowrap tight">设备分类</th>
						<th class="left nowrap tight">资产负责人</th>
						<th class="left nowrap tight">描述</th>
						{{--<th class="left nowrap tight">楼层</th>--}}
						<th class="left nowrap tight">使用状况</th>
						<th class="right nowrap tight">操作</th>
					</tr>
				</thead>
				<tbody class="table_tbody">

				</tbody>
			</table>
		</div>
		<div id="pagenation" class="pagenation bottom-page"></div>
	</div>
</div>
<!-- 弹框 7/29 start -->
<div class="win">
	<div class="con">
		<p>确定进行批量删除吗！</p>
		<button id="ok">确定</button>
		<button id="cancel">取消</button>
	</div>
</div>
<!-- end -->
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/el/select2.min.js?v={{$release}}"></script>
<script src="/statics/common/pekeUpload/pekeUpload.min.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/device/device-list.js?v={{$release}}"></script>
<!-- <script src="/statics/common/laydate/laydate.js"></script> -->
@endsection